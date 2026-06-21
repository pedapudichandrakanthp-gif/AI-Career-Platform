"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Bookmark, CheckCircle, ExternalLink, MapPin, Sparkles, XCircle, AlertCircle } from "lucide-react";

import JobLogo from "@/components/JobLogo";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useResumeUpdated } from "@/hooks/useResumeUpdated";
import { supabase } from "@/lib/supabase";
import type { JobRow } from "@/types/database";

type EligibilityJob = Pick<
  JobRow,
  "id" | "title" | "company_name" | "location" | "category" | "job_type" | "salary_min" | "salary_max" | "apply_link"
  | "age_min" | "age_max" | "qualification_required" | "state_specific" | "required_state"
>;

interface EligibilityCheckResult {
  is_eligible: boolean;
  eligibility_status: "eligible" | "ineligible" | "borderline";
  eligibility_reason: string;
  age_check: { passed: boolean; reason: string };
  qualification_check: { passed: boolean; reason: string };
  category_check: { passed: boolean; reason: string };
  state_check: { passed: boolean; reason: string };
  disability_check: { passed: boolean; reason: string };
  ex_serviceman_check: { passed: boolean; reason: string };
  gender_check: { passed: boolean; reason: string };
}

interface EligibilityViewModel {
  job: EligibilityJob;
  eligibility: EligibilityCheckResult | null;
  loading: boolean;
}

function getEligibilityBg(status: string): string {
  if (status === "eligible") return "from-green-500 to-emerald-600";
  if (status === "borderline") return "from-amber-500 to-orange-500";
  return "from-red-500 to-rose-600";
}

function getEligibilityIcon(status: string) {
  if (status === "eligible") return <CheckCircle size={24} />;
  if (status === "borderline") return <AlertCircle size={24} />;
  return <XCircle size={24} />;
}


export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<EligibilityViewModel[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchRecommendations = useCallback(async () => {
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch active jobs
    const [jobsRes, savedRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("apply_end_date", { ascending: true }),
      supabase.from("saved_jobs").select("job_id").eq("user_id", user.id),
    ]);

    if (jobsRes.error) {
      setErrorMessage(jobsRes.error.message);
      return;
    }

    const jobs = (jobsRes.data ?? []) as EligibilityJob[];
    
    // Initialize with loading state
    const initialRecommendations: EligibilityViewModel[] = jobs.map(job => ({
      job,
      eligibility: null,
      loading: true,
    }));

    setRecommendations(initialRecommendations);
    setSavedIds(new Set((savedRes.data ?? []).map((s) => s.job_id)));

    // Check eligibility for each job
    for (const job of jobs) {
      try {
        const response = await fetch('/api/eligibility/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id }),
        });

        if (response.ok) {
          const eligibility = await response.json();
          setRecommendations(prev => 
            prev.map(r => 
              r.job.id === job.id 
                ? { ...r, eligibility, loading: false }
                : r
            )
          );
        } else {
          setRecommendations(prev => 
            prev.map(r => 
              r.job.id === job.id 
                ? { ...r, eligibility: null, loading: false }
                : r
            )
          );
        }
      } catch (error) {
        console.error('Eligibility check failed:', error);
        setRecommendations(prev => 
          prev.map(r => 
            r.job.id === job.id 
              ? { ...r, eligibility: null, loading: false }
              : r
          )
        );
      }
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useResumeUpdated(() => {
    fetchRecommendations();
  });

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

          {recommendations.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="font-display text-xl font-semibold">No active exams found</h3>
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
                const eligibility = item.eligibility;
                const status = eligibility?.eligibility_status || "ineligible";
                const jobId = item.job.id;

                return (
                  <article key={jobId} className="card-interactive overflow-hidden p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Eligibility status sidebar */}
                      <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${getEligibilityBg(status)} p-6 text-white lg:w-36`}>
                        {getEligibilityIcon(status)}
                        <p className="mt-2 text-xs font-medium opacity-90 text-center">
                          {status === "eligible" ? "Eligible" : status === "borderline" ? "Conditionally Eligible" : "Not Eligible"}
                        </p>
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <JobLogo companyName={item.job.company_name || ""} size="sm" />
                            <div>
                              <h2 className="font-display text-xl font-semibold">
                                {item.job.title ?? "Untitled Exam"}
                              </h2>
                              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                {item.job.company_name}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {item.job.location ?? "Remote"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Eligibility reason */}
                        {eligibility ? (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              Eligibility Status
                            </p>
                            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                              {eligibility.eligibility_reason}
                            </p>
                          </div>
                        ) : item.loading ? (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              Checking Eligibility...
                            </p>
                          </div>
                        ) : null}

                        {/* Eligibility breakdown */}
                        {eligibility ? (
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <EligibilityCheck label="Age" check={eligibility.age_check} />
                            <EligibilityCheck label="Qualification" check={eligibility.qualification_check} />
                            <EligibilityCheck label="Category" check={eligibility.category_check} />
                            <EligibilityCheck label="State" check={eligibility.state_check} />
                          </div>
                        ) : null}

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

function EligibilityCheck({ label, check }: { readonly label: string; readonly check: { passed: boolean; reason: string } }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 ${check.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {check.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
      </span>
      <div className="flex-1">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{check.reason}</p>
      </div>
    </div>
  );
}
