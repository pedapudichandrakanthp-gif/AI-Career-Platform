"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle2, Clock, Copy, Share2, Sparkles } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AIInsightsWidget from "@/components/dashboard/AIInsightsWidget";
import CareerRoadmapWidget from "@/components/dashboard/CareerRoadmapWidget";
import DashboardStats from "@/components/dashboard/DashboardStats";
import MissingSkillsWidget from "@/components/dashboard/MissingSkillsWidget";
import NextSteps from "@/components/dashboard/NextSteps";
import RecommendedJobsWidget from "@/components/dashboard/RecommendedJobsWidget";
import ResumeAnalysisCard from "@/components/dashboard/ResumeAnalysisCard";
import { useResumeUpdated } from "@/hooks/useResumeUpdated";
import { normalizeSavedJob, type SavedJobQueryRow } from "@/lib/jobs/savedJobs";
import { userHasResume } from "@/lib/onboarding/check";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import { urlToBase64 } from "@/lib/resumes/fileUtils";
import { getAccessToken, uploadAndProcessResume } from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { ResumeAnalysis } from "@/types/ai";
import type {
  JobRow,
  MatchScoreRow,
  ResumeAnalysisRow,
  ResumeRow,
  SavedJobWithJob,
  UserProfileRow,
} from "@/types/database";

interface TopRecommendation {
  readonly id: string;
  readonly match_percentage: number | null;
  readonly title: string | null;
  readonly company_name: string | null;
  readonly location: string | null;
  readonly job_id: string | null;
}

type RecQueryRow = Pick<MatchScoreRow, "id" | "match_percentage" | "job_id"> & {
  readonly jobs: Pick<JobRow, "title" | "company_name" | "location"> | Pick<JobRow, "title" | "company_name" | "location">[] | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [latestResume, setLatestResume] = useState<ResumeRow | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysisRow | null>(null);
  const [matchScoreCount, setMatchScoreCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [recentSavedJobs, setRecentSavedJobs] = useState<SavedJobWithJob[]>([]);
  const [topRecommendations, setTopRecommendations] = useState<TopRecommendation[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [hasAnalyzedResume, setHasAnalyzedResume] = useState(false);
  const [profilePublic, setProfilePublic] = useState(false);
  const [username, setUsername] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [copied, setCopied] = useState(false);

  const completion = calculateProfileCompletion(profile, latestResume);

  const loadDashboard = useCallback(async () => {
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorMessage(userError.message);
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!(await userHasResume(supabase, user.id))) {
      router.replace("/onboarding");
      return;
    }

    setEmail(user.email ?? "");

    const [
      profileResult,
      resumeResult,
      analysisResult2,
      savedCountResult,
      matchCountResult,
      recentSavedResult,
      topRecsResult,
    ] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("resume_analysis")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("match_scores").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("saved_jobs")
        .select(`id, saved_at, jobs (id, title, company_name, location, category)`)
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false })
        .limit(5),
      supabase
        .from("match_scores")
        .select(`id, match_percentage, job_id, jobs (title, company_name, location)`)
        .eq("user_id", user.id)
        .order("match_percentage", { ascending: false })
        .limit(3),
    ]);

    const extendedProfile = profileResult.data as (UserProfileRow & { profile_public?: boolean; username?: string }) | null;
    setProfilePublic(extendedProfile?.profile_public ?? false);
    setUsername(extendedProfile?.username || user.id); // Auto-assign a unique ID if a user hasn't actively set a username string

    setProfile(profileResult.data as UserProfileRow | null);
    setLatestResume(resumeResult.data as ResumeRow | null);
    setResumeAnalysis(analysisResult2.data as ResumeAnalysisRow | null);
    setSavedJobsCount(savedCountResult.count ?? 0);
    setMatchScoreCount(matchCountResult.count ?? 0);
    setRecentSavedJobs(
      ((recentSavedResult.data ?? []) as unknown as SavedJobQueryRow[]).map(normalizeSavedJob),
    );
    setHasAnalyzedResume(Boolean(analysisResult2.data));

    const recs = ((topRecsResult.data ?? []) as unknown as RecQueryRow[]).map((row) => {
      const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
      return {
        id: row.id,
        match_percentage: row.match_percentage,
        job_id: row.job_id,
        title: job?.title ?? null,
        company_name: job?.company_name ?? null,
        location: job?.location ?? null,
      };
    });
    setTopRecommendations(recs);
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useResumeUpdated(() => {
    loadDashboard();
  });

  const handleUpdateResume = () => fileInputRef.current?.click();

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const accessToken = await getAccessToken(supabase);

      await uploadAndProcessResume(supabase, {
        file,
        userId: user.id,
        accessToken,
        replaceExisting: true,
      });

      setSuccessMessage("Resume updated. Profile and recommendations refreshed automatically.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeResume = async () => {
    if (!latestResume) return;

    setAnalyzing(true);
    setErrorMessage("");

    try {
      const accessToken = await getAccessToken(supabase);
      let body: Record<string, string>;

      if (latestResume.extracted_text) {
        body = { resumeText: latestResume.extracted_text, resumeId: latestResume.id };
      } else if (latestResume.file_url) {
        const { base64, mimeType } = await urlToBase64(latestResume.file_url);
        body = { pdfBase64: base64, mimeType, resumeId: latestResume.id };
      } else {
        throw new Error("Resume file not available.");
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
        throw new Error(data.error ?? "Analysis failed.");
      }

      const data = (await response.json()) as { analysis: ResumeAnalysis };
      setAnalysisResult(data.analysis);
      setHasAnalyzedResume(true);
      setSuccessMessage("Resume analysis complete.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewResume = () => {
    if (latestResume?.file_url) {
      window.open(latestResume.file_url, "_blank");
    } else {
      router.push("/resumes");
    }
  };

  const handleTogglePublic = async () => {
    setUpdatingProfile(true);
    const newStatus = !profilePublic;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("users")
        .update({ profile_public: newStatus, username: username })
        .eq("id", user.id);
        
      if (!error) {
        setProfilePublic(newStatus);
        setSuccessMessage(`Profile is now ${newStatus ? "public" : "private"}.`);
      } else {
        setErrorMessage("Failed to update profile visibility.");
      }
    }
    setUpdatingProfile(false);
  };

  const copyScoreLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/score/${username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ProtectedRoute>
      <main role="main" className="page-main">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelected}
        />

        <section className="page-container">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <Sparkles size={16} />
                  AvsarGrid Dashboard
                </div>
                <h1 className="page-title mt-1">
                  Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
                </h1>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{email}</p>
              </div>
              <Link href="/recommendations" className="btn-primary shrink-0">
                View Recommendations
              </Link>
            </div>
          </div>

          {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}
          {successMessage ? <div className="alert-success mt-6">{successMessage}</div> : null}

          <div className="mt-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Share2 size={18} className="text-purple-500" />
                    Share Your Score
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">Make your ATS score and top skills visible to recruiters.</p>
                </div>
                <div className="flex items-center gap-4">
                  {profilePublic && (
                    <button type="button" onClick={copyScoreLink} className="btn-secondary shrink-0 text-sm">
                      {copied ? <CheckCircle2 size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  )}
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked={profilePublic} onChange={handleTogglePublic} disabled={updatingProfile} />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
                    <span className="ml-3 text-sm font-medium text-[var(--foreground)]">{profilePublic ? 'Public' : 'Private'}</span>
                  </label>
                </div>
              </div>

              <DashboardStats
                completion={completion}
                resumeAnalysis={resumeAnalysis}
                matchScoreCount={matchScoreCount}
                savedJobsCount={savedJobsCount}
                resumeFileName={latestResume?.file_name ?? null}
                resumeUploadedAt={latestResume?.uploaded_at ?? null}
                onUpdateResume={handleUpdateResume}
                onAnalyzeResume={handleAnalyzeResume}
                onViewResume={handleViewResume}
                uploading={uploading}
                analyzing={analyzing}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <RecommendedJobsWidget jobs={topRecommendations} />
                <MissingSkillsWidget resumeAnalysis={resumeAnalysis} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <AIInsightsWidget resumeAnalysis={resumeAnalysis} />
                <section className="widget-card">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                      <Clock size={20} className="text-[var(--muted-foreground)]" />
                    </div>
                    <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {recentSavedJobs.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No recent activity yet.</p>
                    ) : (
                      recentSavedJobs.map((saved) => (
                        <div
                          key={saved.id}
                          className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium">{saved.jobs?.title ?? "Saved job"}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Saved {saved.saved_at ? new Date(saved.saved_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                          {saved.jobs?.id ? (
                            <Link href={`/jobs/${saved.jobs.id}`} className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              View
                            </Link>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <NextSteps
                hasResume={Boolean(latestResume)}
                hasMatchScores={matchScoreCount > 0}
                completion={completion}
                onAnalyzeResume={handleAnalyzeResume}
                analyzing={analyzing}
                hasAnalyzedResume={hasAnalyzedResume}
              />

              {analysisResult && (
                <div className="widget-card border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="space-y-1">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">ATS Score: {analysisResult.ats_score}/100</p>
                    <p className="text-sm font-medium">Skills: <span className="font-normal text-[var(--muted-foreground)]">{analysisResult.skills_found?.join(', ')}</span></p>
                    <ul className="mt-2 list-disc list-inside text-xs text-[var(--muted-foreground)] space-y-1">
                      {analysisResult.suggestions?.map((i, k) => <li key={k}>{i}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {analysisResult ? (
                <ResumeAnalysisCard analysis={analysisResult} onClose={() => setAnalysisResult(null)} />
              ) : null}

              <CareerRoadmapWidget />
            </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
