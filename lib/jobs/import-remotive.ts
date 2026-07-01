import type { SupabaseClient } from "@supabase/supabase-js";

import { cleanJobWithAI, buildRawJobContent } from "@/lib/ai/job-cleaner";
import { isDuplicateJob } from "@/lib/jobs/duplicate";
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

export async function importRemotiveJobs(supabase: SupabaseClient): Promise<ImportResult> {
  const jobs = await fetchRemotiveJobs();
  let inserted = 0;
  let duplicated = 0;
  let errors = 0;

  for (const rawJob of jobs) {
    try {
      // Per PHASE_2_AUDIT_REPORT, `external_id` is deprecated.
      // The isDuplicateByExternalId check is no longer valid.
      // We will rely on the subsequent `isDuplicateJob` check.

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
          exam_name: cleaned.title,
          conducting_body: cleaned.company_name || rawJob.company_name,
          // Per PHASE_2_AUDIT_REPORT, `state` is deprecated in favor of `required_state`.
          required_state: cleaned.location || rawJob.candidate_required_location,
          category: cleaned.category || rawJob.category,
          skills_required: cleaned.skills.length > 0 ? [...cleaned.skills] : null,
          qualification_required: cleaned.qualification || null,
          experience_required: cleaned.experience_required,
          description: cleaned.description || rawJob.description,
          apply_link: rawJob.url,
          is_active: true,
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

  return { fetched: jobs.length, inserted, duplicated, errors };
}
