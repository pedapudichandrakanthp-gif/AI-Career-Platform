"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import NextSteps from "@/components/dashboard/NextSteps";
import ProfileCompletionCard from "@/components/dashboard/ProfileCompletionCard";
import ResumeAnalysisCard from "@/components/dashboard/ResumeAnalysisCard";
import ExtractedProfilePreview from "@/components/profile/ExtractedProfilePreview";
import { normalizeSavedJob, type SavedJobQueryRow } from "@/lib/jobs/savedJobs";
import { userHasResume } from "@/lib/onboarding/check";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import { urlToBase64 } from "@/lib/resumes/fileUtils";
import {
  getAccessToken,
  refreshUserDataAfterResumeUpdate,
  uploadAndProcessResume,
} from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { ExtractedProfile, ResumeAnalysis } from "@/types/ai";
import type { ResumeRow, SavedJobWithJob, UserProfileRow } from "@/types/database";

interface DashboardMetrics {
  readonly totalSavedJobs: number;
  readonly hasUploadedResume: boolean;
  readonly latestResumeName: string | null;
  readonly latestResume: ResumeRow | null;
  readonly matchScoreCount: number;
}

const emptyMetrics: DashboardMetrics = {
  totalSavedJobs: 0,
  hasUploadedResume: false,
  latestResumeName: null,
  latestResume: null,
  matchScoreCount: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [recentSavedJobs, setRecentSavedJobs] = useState<SavedJobWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [hasAnalyzedResume, setHasAnalyzedResume] = useState(false);

  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const completion = calculateProfileCompletion(profile, metrics.latestResume);

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

    const hasResume = await userHasResume(supabase, user.id);

    if (!hasResume) {
      router.replace("/onboarding");
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
          .select("*")
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

    const profileData = profileResult.data as UserProfileRow | null;
    const latestResume = latestResumeResult.data as ResumeRow | null;
    const normalizedRecentSavedJobs = (
      (recentSavedJobsResult.data ?? []) as unknown as SavedJobQueryRow[]
    ).map(normalizeSavedJob);

    setProfile(profileData);
    setMetrics({
      totalSavedJobs: savedJobsCountResult.count ?? 0,
      hasUploadedResume: Boolean(latestResume),
      latestResumeName: latestResume?.file_name ?? null,
      latestResume: latestResume,
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

    try {
      const accessToken = await getAccessToken(supabase);
      const response = await fetch("/api/match-scores/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate match scores.");
      }

      await loadDashboard();
      setSuccessMessage("Match scores generated successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to generate match scores.");
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  const handleUpdateResume = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgress("Uploading resume...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const accessToken = await getAccessToken(supabase);

      setUploadProgress("Processing with AI...");

      const result = await uploadAndProcessResume(supabase, {
        file,
        userId: user.id,
        accessToken,
        replaceExisting: true,
      });

      setUploadProgress("Refreshing match scores...");
      await refreshUserDataAfterResumeUpdate(accessToken);
      await loadDashboard();

      setSuccessMessage("Resume updated successfully.");

      if (result.extractedProfile && result.isFirstUpload) {
        setExtractedProfile(result.extractedProfile);
        setShowProfilePreview(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update resume.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAnalyzeResume = async () => {
    if (!metrics.latestResume) {
      setErrorMessage("No resume found to analyze.");
      return;
    }

    setAnalyzing(true);
    setErrorMessage("");

    try {
      const accessToken = await getAccessToken(supabase);
      let body: Record<string, string>;

      if (metrics.latestResume.extracted_text) {
        body = { resumeText: metrics.latestResume.extracted_text };
      } else if (metrics.latestResume.file_url) {
        const { base64, mimeType } = await urlToBase64(metrics.latestResume.file_url);
        body = { pdfBase64: base64, mimeType };
      } else {
        throw new Error("Resume file not available for analysis.");
      }

      const response = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to analyze resume.");
      }

      const data = (await response.json()) as { analysis: ResumeAnalysis };
      setResumeAnalysis(data.analysis);
      setHasAnalyzedResume(true);
      setSuccessMessage("Resume analysis complete.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to analyze resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveExtractedProfile = async (profileData: ExtractedProfile) => {
    setSavingProfile(true);
    setErrorMessage("");

    try {
      const accessToken = await getAccessToken(supabase);

      const response = await fetch("/api/profile/save-extracted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ profile: profileData, overwriteEmptyOnly: true }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save profile.");
      }

      setShowProfilePreview(false);
      setExtractedProfile(null);
      setSuccessMessage("Profile updated from resume.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="page-main">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelected}
          aria-hidden="true"
        />

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
          {successMessage ? <div className="alert-success mt-6">{successMessage}</div> : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <dt className="text-sm text-slate-500 dark:text-slate-400">Total Saved Jobs</dt>
              <dd className="mt-3 text-3xl font-semibold">{metrics.totalSavedJobs}</dd>
            </div>

            <div className="card">
              <dt className="text-sm text-slate-500 dark:text-slate-400">Uploaded Resume Status</dt>
              <dd className="mt-3 break-words text-base font-semibold">
                {metrics.latestResumeName ?? "No resume uploaded"}
              </dd>
              {metrics.hasUploadedResume ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUpdateResume}
                    disabled={uploading}
                    className="btn-secondary text-sm"
                  >
                    {uploading ? "Uploading..." : "Update Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyzeResume}
                    disabled={analyzing}
                    className="btn-primary text-sm"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </button>
                </div>
              ) : null}
              {uploadProgress ? (
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">{uploadProgress}</p>
              ) : null}
            </div>

            <ProfileCompletionCard completion={completion} />

            <div className="card">
              <dt className="text-sm text-slate-500 dark:text-slate-400">Match Score Count</dt>
              <dd className="mt-3 text-3xl font-semibold">{metrics.matchScoreCount}</dd>
            </div>
          </div>

          <NextSteps
            hasResume={metrics.hasUploadedResume}
            hasMatchScores={metrics.matchScoreCount > 0}
            completion={completion}
            onAnalyzeResume={handleAnalyzeResume}
            analyzing={analyzing}
            hasAnalyzedResume={hasAnalyzedResume}
          />

          {resumeAnalysis ? (
            <ResumeAnalysisCard
              analysis={resumeAnalysis}
              onClose={() => setResumeAnalysis(null)}
            />
          ) : null}

          {showProfilePreview && extractedProfile ? (
            <div className="mt-6">
              <ExtractedProfilePreview
                initialProfile={extractedProfile}
                onSave={handleSaveExtractedProfile}
                onCancel={() => {
                  setShowProfilePreview(false);
                  setExtractedProfile(null);
                }}
                saving={savingProfile}
              />
            </div>
          ) : null}

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
