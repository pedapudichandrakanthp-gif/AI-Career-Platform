"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, Target } from "lucide-react";

interface MissingSkill {
  skill: string;
  priority: "high" | "medium" | "low";
  free_resource: string;
  resource_url: string;
}

interface SkillGapData {
  missing_skills: MissingSkill[];
  strong_skills: string[];
  readiness_score: number;
}

interface SkillGapWidgetProps {
  userSkills: string[];
  targetRole: string;
}

export default function SkillGapWidget({ userSkills, targetRole }: SkillGapWidgetProps) {
  const [data, setData] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSkills, targetRole }),
      });
      
      if (!res.ok) throw new Error("Failed to fetch analysis");
      
      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not perform skill gap analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetRole) {
      fetchAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRole]);

  if (!targetRole) {
    return (
      <div className="card text-center py-12 text-[var(--muted-foreground)]">
        Please specify a target role to see your skill gap analysis.
      </div>
    );
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = data ? circumference - (circumference * data.readiness_score) / 100 : circumference;

  return (
    <section className="card-interactive flex flex-col gap-6 cursor-default hover:translate-y-0 hover:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-display font-semibold">
            <Target size={18} className="text-blue-500" />
            Skill Gap Analysis
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Target Role: <span className="font-medium text-[var(--foreground)]">{targetRole}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAnalysis}
          disabled={loading}
          className="rounded-full p-2 text-[var(--muted-foreground)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
          aria-label="Refresh Analysis"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error ? <div className="alert-error text-sm">{error}</div> : null}

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--muted-foreground)] text-sm">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
          Analyzing your skills against {targetRole}...
        </div>
      ) : data ? (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-slate-50 p-6 dark:bg-slate-800/50 md:col-span-1">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} className="fill-transparent stroke-slate-200 dark:stroke-slate-700" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r={radius} 
                  className="fill-transparent stroke-blue-500 transition-all duration-1000 ease-out" 
                  strokeWidth="8" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold text-[var(--foreground)]">{data.readiness_score}</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Score</span>
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-medium text-[var(--foreground)]">Role Readiness</p>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                Missing Skills & Resources
              </h4>
              {data.missing_skills?.length > 0 ? (
                <div className="space-y-3">
                  {data.missing_skills.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)]">
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${item.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" : item.priority === "medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"}`}>{item.priority}</span>
                        <span className="text-sm font-medium">{item.skill}</span>
                      </div>
                      {item.resource_url ? (
                        <a href={item.resource_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                          {item.free_resource || "Learn"}
                          <ExternalLink size={12} />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-[var(--muted-foreground)]">You have no major skill gaps for this role.</p>}
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <CheckCircle2 size={16} className="text-green-500" />
                Your Strong Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.strong_skills?.length > 0 ? data.strong_skills.map((skill, i) => <span key={i} className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-300">{skill}</span>) : <span className="text-sm text-[var(--muted-foreground)]">No strong skills matched.</span>}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}