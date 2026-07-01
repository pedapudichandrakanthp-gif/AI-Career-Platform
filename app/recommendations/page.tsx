"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Bookmark, CheckCircle, ExternalLink, MapPin, Sparkles, XCircle, AlertCircle } from "lucide-react";

import JobLogo from "@/components/JobLogo";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import type { JobRow, UserProfileRow } from "@/types/database";

type EligibilityJob = Pick<
  JobRow,
  "id" | "exam_name" | "conducting_body" | "location" | "category" | "job_type" | "salary_min" | "salary_max" | "apply_link"
  | "age_min" | "age_max" | "qualification_required" | "state_specific" | "required_state"
>;

interface EligibilityViewModel {
  job: EligibilityJob;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<EligibilityViewModel[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchRecommendations = useCallback(async () => {
    setErrorMessage("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const [profileRes, jobsRes, savedRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("application_deadline", { ascending: true }),
      supabase.from("saved_jobs").select("job_id").eq("user_id", user.id)
    ]);

    if (jobsRes.error) {
      setErrorMessage(jobsRes.error.message);
      setLoading(false);
      return;
    }

    const userProfile = profileRes.data as UserProfileRow | null;
    const allJobs = (jobsRes.data ?? []) as EligibilityJob[];
    setSavedIds(new Set((savedRes.data ?? []).map((s) => s.job_id)));

    if (!userProfile) {
      setErrorMessage("Please complete your profile to see recommendations.");
      setLoading(false);
      setRecommendations([]);
      return;
    }

    const eligibleJobs = allJobs.filter(job => {
      if (!userProfile.age || !job.age_min || !job.age_max) return false;
      const ageMatch = userProfile.age >= job.age_min && userProfile.age <= job.age_max;

      const qualMatch = userProfile.qualification === job.qualification_required;
      
      const stateMatch = !job.state_specific || userProfile.state === job.required_state || job.location === 'All India';

      return ageMatch && qualMatch && stateMatch;
    });

    setRecommendations(eligibleJobs.map(job => ({ job })));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const saveJob = async (jobId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("saved_jobs").insert([{ user_id: user.id, job_id: jobId }]);
    if (!error) setSavedIds((prev) => new Set([...prev, jobId]));
  };

  return (
    <ProtectedRoute>
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

          {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}

          {loading ? (
            <div className="text-center py-16">
              <p className="text-[var(--muted-foreground)]">Finding eligible exams for you...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="font-display text-xl font-semibold">
                {errorMessage ? "Action Required" : "No Eligible Exams Found"}
              </h3>
              <p className="text-[var(--muted-foreground)] mt-2">
                Complete your profile to check eligibility for government exams.
              </p>
              <Link href="/onboarding" className="btn-primary mt-4 inline-block">
                Complete Profile
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              {recommendations.map((item) => {
                const jobId = item.job.id;

                return (
                  <article key={jobId} className="card-interactive p-6">
                    <div className="flex flex-col lg:flex-row">
                      <div className="flex-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <JobLogo companyName={item.job.conducting_body || ""} size="sm" />
                            <div>
                              <h2 className="font-display text-xl font-semibold">
                                {item.job.exam_name ?? "Untitled Exam"}
                              </h2>
                              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                {item.job.conducting_body}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {item.job.location ?? "All India"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {jobId ? (
                            <>
                              <Link href={`/jobs/${jobId}`} className="btn-primary gap-2 text-sm">
                                <ExternalLink size={16} />
                                View Details
                              </Link>
                              <button
                                type="button"
                                onClick={() => saveJob(jobId)}
                                disabled={savedIds.has(jobId)}
                                className="btn-secondary gap-2 text-sm"
                              >
                                <Bookmark size={16} />
                                {savedIds.has(jobId) ? "Saved" : "Save Exam"}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
