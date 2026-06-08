"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { normalizeSavedJob, type SavedJobQueryRow } from "@/lib/jobs/savedJobs";
import { generateAndStoreMatchScoresForUser } from "@/lib/matching/matchScores";
import { supabase } from "@/lib/supabase";
import type { ResumeRow, SavedJobWithJob, UserProfileRow } from "@/types/database";

interface DashboardMetrics {
  readonly totalSavedJobs: number;
  readonly hasUploadedResume: boolean;
  readonly latestResumeName: string | null;
  readonly profileCompletionPercentage: number;
  readonly matchScoreCount: number;
}

const emptyMetrics: DashboardMetrics = {
  totalSavedJobs: 0,
  hasUploadedResume: false,
  latestResumeName: null,
  profileCompletionPercentage: 0,
  matchScoreCount: 0,
};

function calculateProfileCompletion(profile: UserProfileRow | null): number {
  if (!profile) {
    return 0;
  }

  const completedFields = [
    profile.full_name,
    profile.phone,
    profile.location,
    profile.education,
    profile.degree,
    profile.skills && profile.skills.length > 0 ? profile.skills : null,
    typeof profile.experience_years === "number" ? profile.experience_years : null,
    profile.preferred_job_type,
    typeof profile.expected_salary === "number" ? profile.expected_salary : null,
  ].filter((value) => value !== null && value !== "");

  return Math.round((completedFields.length / 9) * 100);
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [recentSavedJobs, setRecentSavedJobs] = useState<SavedJobWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorMessage(userError.message);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setIsLoading(false);
      router.replace("/login");
      return;
    }

    setEmail(user.email ?? "");

    const [profileResult, savedJobsCountResult, latestResumeResult, recentSavedJobsResult, matchCountResult] =
      await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("saved_jobs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("resumes")
          .select(
            "id,file_name,file_url,uploaded_at,user_id,extracted_text,extracted_skills,extracted_education,extracted_experience",
          )
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("saved_jobs")
          .select(
            `
              id,
              saved_at,
              jobs (
                id,
                title,
                company_name,
                location,
                category
              )
            `,
          )
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false })
          .limit(5),
        supabase
          .from("match_scores")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

    const firstError =
      profileResult.error ??
      savedJobsCountResult.error ??
      latestResumeResult.error ??
      recentSavedJobsResult.error ??
      matchCountResult.error;

    if (firstError) {
      setErrorMessage(firstError.message);
      setIsLoading(false);
      return;
    }

    const profile = profileResult.data as UserProfileRow | null;
    const latestResume = latestResumeResult.data as ResumeRow | null;
    const normalizedRecentSavedJobs = (
      (recentSavedJobsResult.data ?? []) as unknown as SavedJobQueryRow[]
    ).map(normalizeSavedJob);

    setMetrics({
      totalSavedJobs: savedJobsCountResult.count ?? 0,
      hasUploadedResume: Boolean(latestResume),
      latestResumeName: latestResume?.file_name ?? null,
      profileCompletionPercentage: calculateProfileCompletion(profile),
      matchScoreCount: matchCountResult.count ?? 0,
    });
    setRecentSavedJobs(normalizedRecentSavedJobs);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleGenerateMatches = async () => {
    setIsGeneratingMatches(true);
    setErrorMessage("");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      setErrorMessage(error.message);
      setIsGeneratingMatches(false);
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    try {
      await generateAndStoreMatchScoresForUser(supabase, user.id);
      await loadDashboard();
    } catch (generateError) {
      setErrorMessage(
        generateError instanceof Error ? generateError.message : "Unable to generate match scores.",
      );
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  const resumeStatus = useMemo(() => {
    if (!metrics.hasUploadedResume) {
      return "No resume uploaded";
    }

    return metrics.latestResumeName ? `Uploaded: ${metrics.latestResumeName}` : "Resume uploaded";
  }, [metrics.hasUploadedResume, metrics.latestResumeName]);

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container max-w-6xl">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Career Dashboard</p>
              <h1 className="page-title mt-2">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{email}</p>
            </div>

            <Link href="/recommendations" className="btn-primary text-center">
              View Recommendations
            </Link>
          </div>

          {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <dt className="text-sm text-slate-500 dark:text-slate-400">Total Saved Jobs</dt>
              <dd className="mt-3 text-3xl font-semibold">{metrics.totalSavedJobs}</dd>
            </div>

            <div className="card">
              <dt className="text-sm text-slate-500 dark:text-slate-400">Uploaded Resume Status</dt>
              <dd className="mt-3 break-words text-base font-semibold">{resumeStatus}</dd>
            </div>

            <div className="card">
              <dt className="text-sm text-slate-500 dark:text-slate-400">Profile Completion</dt>
              <dd className="mt-3 text-3xl font-semibold">{metrics.profileCompletionPercentage}%</dd>
            </div>

            <div className="card">
              <dt className="text-sm text-slate-500 dark:text-slate-400">Match Score Count</dt>
              <dd className="mt-3 text-3xl font-semibold">{metrics.matchScoreCount}</dd>
            </div>
          </dl>

          <section className="card mt-6 overflow-hidden p-0">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="section-title">Recent Saved Jobs</h2>
                <button
                  className="btn-success"
                  disabled={isGeneratingMatches}
                  onClick={handleGenerateMatches}
                  type="button"
                >
                  {isGeneratingMatches ? "Generating..." : "Generate Match Scores"}
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <p className="p-5 text-sm text-slate-600 dark:text-slate-400">Loading dashboard...</p>
              ) : recentSavedJobs.length === 0 ? (
                <p className="p-5 text-sm text-slate-600 dark:text-slate-400">No saved jobs yet.</p>
              ) : (
                recentSavedJobs.map((savedJob) => (
                  <article className="p-5" key={savedJob.id}>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {savedJob.jobs?.title ?? "Untitled Job"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {savedJob.jobs?.company_name ?? "Not specified"} —{" "}
                      {savedJob.jobs?.location ?? "Not specified"}
                    </p>
                    <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      {savedJob.jobs?.category ?? "General"}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </main>
    </ProtectedRoute>
  );
}
