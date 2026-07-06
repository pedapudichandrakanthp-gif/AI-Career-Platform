import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ExternalLink, MapPin, Sparkles } from "lucide-react";

import JobLogo from "@/components/JobLogo";
import type { JobRow } from "@/types/database";

type EligibilityJob = Pick<
  JobRow,
  "id" | "exam_name" | "conducting_body" | "location" | "category" | "job_type" | "salary_min" | "salary_max" | "apply_link"
  | "age_min" | "age_max" | "qualification_required" | "state_specific" | "required_state"
>;

export default async function RecommendationsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // No profile at all → send to onboarding
  if (!profile) {
    redirect('/onboarding');
  }

  // Profile exists → fetch eligible jobs from user_job_eligibility
  const { data: eligibility } = await supabase
    .from('user_job_eligibility')
    .select('job_id')
    .eq('user_id', user.id);

  let eligibleJobs: EligibilityJob[] = [];

  if (eligibility && eligibility.length > 0) {
    const jobIds = eligibility.map(e => e.job_id);
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .in('id', jobIds)
      .eq('is_active', true)
      .order('application_end_date', { ascending: true });
    eligibleJobs = (jobs || []) as EligibilityJob[];
  } else {
    // Fallback: query directly if user_job_eligibility is empty
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .lte('age_min', profile.age ?? 99)
      .gte('age_max', profile.age ?? 0)
      .order('application_end_date', { ascending: true });
    eligibleJobs = (jobs || []) as EligibilityJob[];
  }

  return (
    <main className="page-main">
      <section className="page-container">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-indigo-600/10 via-blue-600/5 to-transparent p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Sparkles size={16} />
            Government Job Eligibility
          </div>
          <h1 className="page-title mt-1">Eligible Exams</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Check your eligibility for government exams based on your profile.
          </p>
        </div>

        {eligibleJobs.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="font-display text-xl font-semibold">No eligible exams found</h3>
            <p className="text-[var(--muted-foreground)] mt-2">
              Your profile: Age {profile.age} · {profile.category} · {profile.qualification}
            </p>
            <p className="text-[var(--muted-foreground)] mt-1">
              Try updating your profile or browse all exams.
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Link href="/profile" className="btn-primary inline-block">
                Update Profile
              </Link>
              <Link href="/jobs" className="btn-secondary inline-block">
                Browse All Exams
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            {eligibleJobs.map((job) => (
              <article key={job.id} className="card-interactive p-6">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <JobLogo companyName={job.conducting_body || ""} size="sm" />
                        <div>
                          <h2 className="font-display text-xl font-semibold">
                            {job.exam_name ?? "Untitled Exam"}
                          </h2>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            {job.conducting_body}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {job.location ?? "All India"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/jobs/${job.id}`} className="btn-primary gap-2 text-sm">
                        <ExternalLink size={16} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
