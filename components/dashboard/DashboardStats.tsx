"use client";

import Link from "next/link";

import { Activity, FileCheck, Heart, Sparkles, Target, TrendingUp } from "lucide-react";

import type { ProfileCompletionResult } from "@/lib/profile/completion";
import type { ResumeAnalysisRow } from "@/types/database";

import ProfileCompletionCard from "./ProfileCompletionCard";

interface DashboardStatsProps {
  readonly completion: ProfileCompletionResult;
  readonly resumeAnalysis: ResumeAnalysisRow | null;
  readonly matchScoreCount: number;
  readonly savedJobsCount: number;
  readonly resumeFileName: string | null;
  readonly resumeUploadedAt: string | null;
  readonly onUpdateResume: () => void;
  readonly onAnalyzeResume: () => void;
  readonly onViewResume: () => void;
  readonly uploading?: boolean;
  readonly analyzing?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getRingColor(score: number): string {
  if (score >= 80) return "ring-green-500/30 bg-green-50 dark:bg-green-950/30";
  if (score >= 60) return "ring-amber-500/30 bg-amber-50 dark:bg-amber-950/30";
  return "ring-red-500/30 bg-red-50 dark:bg-red-950/30";
}

export default function DashboardStats({
  completion,
  resumeAnalysis,
  matchScoreCount,
  savedJobsCount,
  resumeFileName,
  resumeUploadedAt,
  onUpdateResume,
  onAnalyzeResume,
  onViewResume,
  uploading = false,
  analyzing = false,
}: DashboardStatsProps) {
  const atsScore = resumeAnalysis?.ats_score ?? 0;
  const resumeStrength = resumeAnalysis?.resume_strength ?? 0;
  const resumeHealth = resumeAnalysis
    ? Math.round((atsScore + resumeStrength) / 2)
    : 0;
  const careerProgress = Math.round(
    (completion.percentage + (resumeAnalysis ? atsScore : 0) + Math.min(matchScoreCount * 8, 100)) / 3,
  );

  return (
    <div className="space-y-6">
      {/* Hero metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="widget-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Resume Health</p>
              <p className={`stat-value mt-2 ${getScoreColor(resumeHealth)}`}>
                {resumeAnalysis ? `${resumeHealth}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">ATS + strength combined</p>
            </div>
            <div className={`score-ring text-lg ${getRingColor(resumeHealth)} ${getScoreColor(resumeHealth)}`}>
              <Heart size={20} />
            </div>
          </div>
          <div className="progress-bar mt-4">
            <div className="progress-fill" style={{ width: `${resumeHealth}%` }} />
          </div>
        </div>

        <div className="widget-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">ATS Score</p>
              <p className={`stat-value mt-2 ${getScoreColor(atsScore)}`}>
                {resumeAnalysis ? `${atsScore}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Applicant tracking optimized</p>
            </div>
            <div className="rounded-xl bg-green-100 p-2.5 dark:bg-green-950/50">
              <FileCheck size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="progress-bar mt-4">
            <div className="progress-fill bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${atsScore}%` }} />
          </div>
        </div>

        <div className="widget-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Career Progress</p>
              <p className={`stat-value mt-2 ${getScoreColor(careerProgress)}`}>{careerProgress}%</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Profile + matches + resume</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-950/50">
              <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="progress-bar mt-4">
            <div className="progress-fill" style={{ width: `${careerProgress}%` }} />
          </div>
        </div>

        <div className="widget-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Recommended Jobs</p>
              <p className="stat-value mt-2">{matchScoreCount}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">AI-matched opportunities</p>
            </div>
            <div className="rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-950/50">
              <Target size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <Link href="/recommendations" className="btn-primary mt-4 w-full text-sm">
            View Matches
          </Link>
        </div>
      </div>

      {/* Second row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ProfileCompletionCard completion={completion} />

        <div className="widget-card lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2.5 dark:bg-purple-950/50">
              <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="stat-label">Resume Strength</p>
              <p className={`text-2xl font-bold ${getScoreColor(resumeStrength)}`}>
                {resumeAnalysis ? `${resumeStrength}%` : "Not analyzed"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Overall quality assessment from AI analysis
          </p>
        </div>

        <div className="widget-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-2.5 dark:bg-orange-950/50">
              <Activity size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="stat-label">Saved Jobs</p>
              <p className="text-2xl font-bold">{savedJobsCount}</p>
            </div>
          </div>
          <Link href="/saved-jobs" className="btn-secondary mt-4 w-full text-sm">
            View Saved ({savedJobsCount})
          </Link>
        </div>
      </div>

      {/* Resume management bar */}
      <div className="widget-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Active Resume
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            {resumeFileName ?? "No resume uploaded"}
          </p>
          {resumeUploadedAt ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              Last updated {new Date(resumeUploadedAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onUpdateResume} disabled={uploading} className="btn-primary text-sm">
            {uploading ? "Processing..." : "Update Resume"}
          </button>
          <button type="button" onClick={onAnalyzeResume} disabled={analyzing} className="btn-secondary text-sm">
            {analyzing ? "Analyzing..." : "Analyze Resume"}
          </button>
          {resumeFileName ? (
            <button type="button" onClick={onViewResume} className="btn-ghost text-sm">
              View PDF
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { getScoreColor, getRingColor as getScoreBg };
