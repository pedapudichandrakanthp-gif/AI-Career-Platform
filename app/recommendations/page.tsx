"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import type { JobRow, MatchScoreRow } from "@/types/database";

type RecommendationJob = Pick<
  JobRow,
  "id" | "title" | "company_name" | "location" | "category" | "job_type"
>;

interface RecommendationQueryRow
  extends Pick<
    MatchScoreRow,
    "id" | "match_percentage" | "matching_skills" | "missing_skills" | "recommendation"
  > {
  readonly jobs: RecommendationJob | RecommendationJob[] | null;
}

interface RecommendationViewModel
  extends Pick<
    MatchScoreRow,
    "id" | "match_percentage" | "matching_skills" | "missing_skills" | "recommendation"
  > {
  readonly job: RecommendationJob | null;
}

function normalizeRecommendation(row: RecommendationQueryRow): RecommendationViewModel {
  return {
    id: row.id,
    match_percentage: row.match_percentage,
    matching_skills: row.matching_skills,
    missing_skills: row.missing_skills,
    recommendation: row.recommendation,
    job: Array.isArray(row.jobs) ? (row.jobs[0] ?? null) : row.jobs,
  };
}

function getMatchColor(score: number): string {
  if (score >= 80) {
    return "text-green-600 dark:text-green-400";
  }

  if (score >= 60) {
    return "text-yellow-600 dark:text-yellow-400";
  }

  return "text-red-600 dark:text-red-400";
}

function getMatchLabel(score: number): string {
  if (score >= 80) {
    return "Excellent Match";
  }

  if (score >= 60) {
    return "Good Match";
  }

  return "Needs Improvement";
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendationViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorMessage(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("match_scores")
      .select(
        `
          id,
          match_percentage,
          matching_skills,
          missing_skills,
          recommendation,
          jobs (
            id,
            title,
            company_name,
            location,
            category,
            job_type
          )
        `,
      )
      .eq("user_id", user.id)
      .order("match_percentage", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const normalizedRecommendations = (
      (data ?? []) as unknown as RecommendationQueryRow[]
    ).map(normalizeRecommendation);

    setRecommendations(normalizedRecommendations);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container">
          <h1 className="page-title">Recommended Jobs</h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Jobs ranked according to your profile and resume.
          </p>

          {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}

          {loading ? (
            <div className="card mt-8 text-slate-600 dark:text-slate-400">
              Loading recommendations...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="card mt-8 text-slate-600 dark:text-slate-400">
              No recommendations found. Generate match scores from the dashboard first.
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              {recommendations.map((item) => {
                const score = item.match_percentage ?? 0;

                return (
                  <article
                    className="card transition hover:border-blue-300 dark:hover:border-blue-700"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="section-title">
                          {item.job?.title ?? "Untitled Job"}
                        </h2>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                          {item.job?.company_name ?? "Not specified"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                          {item.job?.location ?? "Not specified"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                            {item.job?.job_type ?? "Job"}
                          </span>
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.job?.category ?? "General"}
                          </span>
                        </div>
                      </div>

                      <div className="text-left md:text-center">
                        <div className={`text-4xl font-semibold ${getMatchColor(score)}`}>
                          {score}%
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Match Score</div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-3 rounded-full bg-blue-600"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className={`mt-2 text-sm font-semibold ${getMatchColor(score)}`}>
                        {getMatchLabel(score)}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <section>
                        <h3 className="mb-2 font-semibold text-green-600 dark:text-green-400">
                          Matching Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {item.matching_skills?.length ? (
                            item.matching_skills.map((skill) => (
                              <span
                                className="rounded-full border border-green-300 bg-green-50 px-3 py-1 text-sm text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300"
                                key={skill}
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500">No matching skills</span>
                          )}
                        </div>
                      </section>

                      <section>
                        <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">
                          Missing Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {item.missing_skills?.length ? (
                            item.missing_skills.map((skill) => (
                              <span
                                className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300"
                                key={skill}
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-green-600 dark:text-green-400">No missing skills</span>
                          )}
                        </div>
                      </section>
                    </div>

                    <div className="mt-5 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
                      <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                        Recommendation
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {item.recommendation ?? "No recommendation available."}
                      </p>
                    </div>

                    <div className="mt-6">
                      {item.job?.id ? (
                        <Link className="btn-primary" href={`/jobs/${item.job.id}`}>
                          View Job
                        </Link>
                      ) : null}
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
