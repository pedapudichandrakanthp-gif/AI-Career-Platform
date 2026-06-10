import type { SupabaseClient } from "@supabase/supabase-js";

import { cleanJobWithAI, buildRawJobContent } from "@/lib/ai/job-cleaner";
import { isDuplicateByExternalId, isDuplicateJob } from "@/lib/jobs/duplicate";
import type { RemotiveJob } from "@/types/ai";

const REMOTIVE_API = "https://remotive.com/api/remote-jobs";

export interface ImportResult {
  readonly fetched: number;
  readonly inserted: number;
  readonly duplicated: number;
  readonly errors: number;
}

export async function fetchRemotiveJobs(): Promise<RemotiveJob[]> {
  const response = await fetch(REMOTIVE_API, { next: { revalidate: 0 } });

  if (!response.ok) {
    throw new Error(`Remotive API error: ${response.status}`);
  }

  const data = (await response.json()) as { jobs: RemotiveJob[] };
  return data.jobs ?? [];
}

function getExpiresAt(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

export async function importRemotiveJobs(supabase: SupabaseClient): Promise<ImportResult> {
  const jobs = await fetchRemotiveJobs();
  let inserted = 0;
  let duplicated = 0;
  let errors = 0;

  const { data: log } = await supabase
    .from("job_import_logs")
    .insert([{ source: "Remotive API", status: "running", jobs_fetched: jobs.length }])
    .select("id")
    .single();

  const logId = log?.id;

  for (const rawJob of jobs) {
    try {
      const externalId = `remotive-${rawJob.id}`;

      if (await isDuplicateByExternalId(supabase, externalId)) {
        duplicated++;
        continue;
      }

      await supabase.from("jobs_raw").insert([
        {
          external_id: externalId,
          source: "Remotive API",
          raw_data: rawJob as unknown as Record<string, unknown>,
        },
      ]);

      const cleaned = await cleanJobWithAI(buildRawJobContent(rawJob as unknown as Record<string, unknown>));

      if (
        await isDuplicateJob(
          supabase,
          cleaned.title,
          cleaned.company_name || rawJob.company_name,
          cleaned.location || rawJob.candidate_required_location,
        )
      ) {
        duplicated++;
        continue;
      }

      const { error } = await supabase.from("jobs").insert([
        {
          title: cleaned.title,
          clean_title: cleaned.clean_title,
          company_name: cleaned.company_name || rawJob.company_name,
          location: cleaned.location || rawJob.candidate_required_location,
          job_type: cleaned.job_type || rawJob.job_type,
          work_mode: cleaned.work_mode || "Remote",
          category: cleaned.category || rawJob.category,
          skills: cleaned.skills.length > 0 ? [...cleaned.skills] : null,
          qualification: cleaned.qualification || null,
          experience_required: cleaned.experience_required,
          description: cleaned.description || rawJob.description,
          apply_link: rawJob.url,
          is_active: true,
          source: "Remote API",
          external_id: externalId,
          expires_at: getExpiresAt(),
        },
      ]);

      if (error) {
        errors++;
      } else {
        inserted++;
      }
    } catch {
      errors++;
    }
  }

  if (logId) {
    await supabase
      .from("job_import_logs")
      .update({
        status: errors > 0 ? "completed_with_errors" : "completed",
        jobs_inserted: inserted,
        jobs_duplicated: duplicated,
      })
      .eq("id", logId);
  }

  return { fetched: jobs.length, inserted, duplicated, errors };
}
