"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Bookmark, ExternalLink, MapPin, Sparkles } from "lucide-react";

import JobLogo from "@/components/JobLogo";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useResumeUpdated } from "@/hooks/useResumeUpdated";
import { supabase } from "@/lib/supabase";
import type { JobRow, MatchScoreRow } from "@/types/database";

type RecommendationJob = Pick<
  JobRow,
  "id" | "title" | "company_name" | "location" | "category" | "job_type" | "salary_min" | "salary_max" | "apply_link"
>;

interface RecommendationQueryRow
  extends Pick<
    MatchScoreRow,
    | "id"
    | "match_percentage"
    | "matching_skills"
    | "missing_skills"
    | "recommendation"
    | "skills_score"
    | "experience_score"
    | "education_score"
    | "location_score"
    | "match_reasons"
    | "job_id"
  > {
  readonly jobs: RecommendationJob | RecommendationJob[] | null;
}

interface RecommendationViewModel extends RecommendationQueryRow {
  readonly job: RecommendationJob | null;
}

function normalizeRecommendation(row: RecommendationQueryRow): RecommendationViewModel {
  return {
    ...row,
    job: Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs,
  };
}

function getMatchBg(score: number): string {
  if (score >= 80) return "from-green-500 to-emerald-600";
  if (score >= 60) return "from-amber-500 to-orange-500";
  return "from-red-500 to-rose-600";
}

function formatSalary(min: number | null | undefined, max: number | null | undefined): string {
  if (min && max) return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`;
  if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
  if (min) return `From $${(min / 1000).toFixed(0)}k`;
  return "Salary not listed";
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationViewModel[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchRecommendations = useCallback(async () => {
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const [recsRes, savedRes] = await Promise.all([
      supabase
        .from("match_scores")
        .select(
          `id, match_percentage, matching_skills, missing_skills, recommendation, job_id,
           skills_score, experience_score, education_score, location_score, match_reasons,
           jobs (id, title, company_name, location, category, job_type, salary_min, salary_max, apply_link)`,
        )
        .eq("user_id", user.id)
        .order("match_percentage", { ascending: false }),
      supabase.from("saved_jobs").select("job_id").eq("user_id", user.id),
    ]);

    if (recsRes.error) {
      setErrorMessage(recsRes.error.message);
      return;
    }

    setRecommendations(
      ((recsRes.data ?? []) as unknown as RecommendationQueryRow[]).map(normalizeRecommendation),
    );
    setSavedIds(new Set((savedRes.data ?? []).map((s) => s.job_id)));
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
              AI-Powered Matching
            </div>
            <h1 className="page-title mt-1">Recommended Jobs</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Personalized matches based on your AvsarGrid profile and resume analysis.
            </p>
          </div>

          {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}

          {recommendations.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="font-display text-xl font-semibold">No recommendations yet</h3>
              <p className="text-[var(--muted-foreground)] mt-2">
                Upload your resume to get AI-powered job matches.
              </p>
              <Link href="/onboarding" className="btn-primary mt-4 inline-block">
                Upload Resume
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              {recommendations.map((item) => {
                const score = item.match_percentage ?? 0;
                const jobId = item.job?.id ?? item.job_id;

                return (
                  <article key={item.id} className="card-interactive overflow-hidden p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Match score sidebar */}
                      <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${getMatchBg(score)} p-6 text-white lg:w-36`}>
                        <p className="font-display text-4xl font-bold">{score}%</p>
                        <p className="mt-1 text-xs font-medium opacity-90">Match</p>
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <JobLogo companyName={item.job?.company_name || ""} size="sm" />
                            <div>
                              <h2 className="font-display text-xl font-semibold">
                                {item.job?.title ?? "Untitled Job"}
                              </h2>
                              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                {item.job?.company_name}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {item.job?.location ?? "Remote"}
                                </span>
                                <span>{formatSalary(item.job?.salary_min, item.job?.salary_max)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Why it matches */}
                        {item.match_reasons && item.match_reasons.length > 0 ? (
                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              Why It Matches
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.match_reasons.map((reason) => (
                                <span key={reason} className="badge-blue">{reason}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {/* Progress bars */}
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <BreakdownBar label="Skills" value={item.skills_score ?? 0} />
                          <BreakdownBar label="Experience" value={item.experience_score ?? 0} />
                          <BreakdownBar label="Education" value={item.education_score ?? 0} />
                          <BreakdownBar label="Location" value={item.location_score ?? 0} />
                        </div>

                        {/* Skills */}
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400">Matched Skills</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.matching_skills?.map((skill) => (
                                <span key={skill} className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-300">
                                  {skill}
                                </span>
                              )) ?? <span className="text-xs text-[var(--muted-foreground)]">None</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Missing Skills</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.missing_skills?.map((skill) => (
                                <span key={skill} className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                  {skill}
                                </span>
                              )) ?? <span className="text-xs text-green-600">None</span>}
                            </div>
                          </div>
                        </div>

                        {item.recommendation ? (
                          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{item.recommendation}</p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-2">
                          {jobId ? (
                            <>
                              <Link href={`/jobs/${jobId}`} className="btn-primary gap-2 text-sm">
                                <ExternalLink size={16} />
                                View & Apply
                              </Link>
                              <button
                                type="button"
                                onClick={() => saveJob(jobId)}
                                disabled={savedIds.has(jobId)}
                                className="btn-secondary gap-2 text-sm"
                              >
                                <Bookmark size={16} />
                                {savedIds.has(jobId) ? "Saved" : "Save Job"}
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

function BreakdownBar({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-[var(--muted-foreground)]">{value}%</span>
      </div>
      <div className="progress-bar mt-1">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
