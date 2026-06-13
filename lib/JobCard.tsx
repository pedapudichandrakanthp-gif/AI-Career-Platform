"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Briefcase, Check, ChevronDown, ChevronUp, Copy, ExternalLink, MapPin, Sparkles, Target, X } from "lucide-react";

import { calculateMatchScore } from "@/lib/match-score";
import type { JobRow } from "@/types/database";
import JobLogo from "@/components/jobs/JobLogo";
import { supabase } from "@/lib/supabase";

interface JobCardProps {
  job: JobRow;
  userSkills: string[];
  onSaveJob: (jobId: string) => void;
}

interface InterviewQuestion {
  question: string;
  tip: string;
  type: "technical" | "behavioral" | "situational";
}

function MatchBadge({ score }: { score: number | null }) {
  if (score === null) {
    return null;
  }

  const roundedScore = Math.round(score);
  let badgeClasses = "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ";

  if (roundedScore >= 80) {
    badgeClasses += "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
  } else if (roundedScore >= 60) {
    badgeClasses += "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  } else {
    badgeClasses += "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
  }

  return <span className={badgeClasses}>{roundedScore}% Match</span>;
}

export default function JobCard({ job, userSkills, onSaveJob }: JobCardProps) {
  // The job description is needed for the calculation.
  // The main page query `select("*")` should provide it.
  const matchPercentage = calculateMatchScore(userSkills, job.description);

  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [tracked, setTracked] = useState(false);

  const handleGenerateCoverLetter = async () => {
    setShowModal(true);
    setIsGenerating(true);
    setCoverLetter("");
    setIsCopied(false);

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.clean_title ?? job.title ?? "this position",
          company: job.company_name ?? "your company",
          jobDescription: job.description ?? "",
          userProfile: {
            summary: "A passionate professional",
            skills: userSkills.join(", "),
          },
        }),
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter || "Could not generate cover letter. Please try again.");
    } catch {
      setCoverLetter("An error occurred. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
    setShowInterviewModal(true);
    setIsGeneratingInterview(true);
    setInterviewQuestions([]);
    setExpandedQ(null);

    try {
      const res = await fetch("/api/ai/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.clean_title ?? job.title ?? "this position",
          jobDescription: job.description ?? "",
          userSkills: userSkills.join(", "),
        }),
      });
      const data = await res.json();
      if (data.questions) {
        setInterviewQuestions(data.questions);
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const handleTrackApplication = async () => {
    setIsTracking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to track applications");
        setIsTracking(false);
        return;
      }

      const { error } = await supabase.from("applications").insert([{
        user_id: user.id,
        job_id: job.id,
        company: job.company_name,
        title: job.clean_title ?? job.title ?? "Untitled Job",
        status: "applied"
      }]);

      if (error) throw error;
      
      setTracked(true);
      alert("Application tracked successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to track application.");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <article className="card-interactive">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <JobLogo companyName={job.company_name || ""} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={`/jobs/${job.id}`}>
                <h2 className="font-display text-lg font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  {job.clean_title ?? job.title ?? "Untitled Job"}
                </h2>
              </Link>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{job.company_name}</p>
            </div>
            <MatchBadge score={matchPercentage} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location ?? "Not specified"}
            </span>
            {job.salary_max ? <span>Up to ${(job.salary_max / 1000).toFixed(0)}k</span> : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {job.job_type ? <span className="badge-blue">{job.job_type}</span> : null}
            {job.work_mode ? (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                {job.work_mode}
              </span>
            ) : null}
            {job.category ? (
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs dark:bg-slate-800">{job.category}</span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.apply_link ? (
              <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="btn-primary gap-2 text-sm">
                <ExternalLink size={14} />
                Apply
              </a>
            ) : (
              <Link href={`/jobs/${job.id}`} className="btn-primary gap-2 text-sm">
                View Details
              </Link>
            )}
            <button type="button" onClick={() => onSaveJob(job.id)} className="btn-secondary gap-2 text-sm">
              <Bookmark size={14} />
              Save
            </button>
            <button 
              type="button" 
              onClick={handleGenerateCoverLetter} 
              className="btn-secondary gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              <Sparkles size={14} />
              Cover Letter
            </button>
            <button 
              type="button" 
              onClick={handleGenerateInterviewPrep} 
              className="btn-secondary gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Target size={14} />
              Interview Prep
            </button>
            <button 
              type="button" 
              onClick={handleTrackApplication} 
              disabled={isTracking || tracked}
              className="btn-secondary gap-2 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50"
            >
              {tracked ? <Check size={14} /> : <Briefcase size={14} />}
              {tracked ? "Tracked" : "Track"}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles size={18} className="text-purple-500" />
                AI Cover Letter
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-full p-2 text-[var(--muted-foreground)] hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-slate-50 p-4 text-sm text-[var(--foreground)] dark:bg-slate-900/50">
              {isGenerating ? (
                <div className="flex h-40 flex-col items-center justify-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                  <span className="text-sm text-[var(--muted-foreground)]">Drafting your cover letter...</span>
                </div>
              ) : (
                coverLetter
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => { navigator.clipboard.writeText(coverLetter); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} disabled={!coverLetter || isGenerating} className="btn-primary gap-2">
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Target size={18} className="text-blue-500" />
                AI Interview Prep
              </h3>
              <button type="button" onClick={() => setShowInterviewModal(false)} className="rounded-full p-2 text-[var(--muted-foreground)] hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-1">
              {isGeneratingInterview ? (
                <div className="flex h-40 flex-col items-center justify-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span className="text-sm text-[var(--muted-foreground)]">Analyzing role and predicting questions...</span>
                </div>
              ) : interviewQuestions.length > 0 ? (
                <div className="space-y-3">
                  {interviewQuestions.map((q, i) => {
                    const isExpanded = expandedQ === i;
                    let badgeColor = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
                    if (q.type === 'technical') badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                    if (q.type === 'behavioral') badgeColor = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
                    if (q.type === 'situational') badgeColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";

                    return (
                      <div key={i} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-all">
                        <button type="button" onClick={() => setExpandedQ(isExpanded ? null : i)} className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}>{q.type}</span>
                            <span className="text-sm font-medium text-[var(--foreground)]">{q.question}</span>
                          </div>
                          <span className="text-[var(--muted-foreground)] shrink-0">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                        </button>
                        {isExpanded && <div className="border-t border-[var(--border)] bg-slate-50 p-4 text-sm text-[var(--muted-foreground)] dark:bg-slate-900/50"><span className="block font-medium text-[var(--foreground)] mb-1">Answer Tip:</span>{q.tip}</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--border)] bg-slate-50 p-4 text-sm text-[var(--muted-foreground)] dark:bg-slate-900/50">Could not generate interview questions. Please try again.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}