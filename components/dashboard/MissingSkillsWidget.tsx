"use client";

import Link from "next/link";

import { AlertTriangle, BookOpen } from "lucide-react";

import type { ResumeAnalysisRow } from "@/types/database";

interface MissingSkillsWidgetProps {
  readonly resumeAnalysis: ResumeAnalysisRow | null;
}

export default function MissingSkillsWidget({ resumeAnalysis }: MissingSkillsWidgetProps) {
  const missingSkills = resumeAnalysis?.missing_skills ?? [];
  const recommendedSkills = resumeAnalysis?.recommended_skills ?? [];

  return (
    <section className="widget-card">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-950/50">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Missing Skills</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Skills to develop for better matches</p>
        </div>
      </div>

      {missingSkills.length === 0 && !resumeAnalysis ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Analyze your resume to discover skill gaps.
        </p>
      ) : missingSkills.length === 0 ? (
        <p className="mt-4 text-sm text-green-600 dark:text-green-400">
          No critical skill gaps detected!
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {missingSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {recommendedSkills.length > 0 ? (
        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            <BookOpen size={14} />
            Recommended to Learn
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recommendedSkills.slice(0, 6).map((skill) => (
              <span key={skill} className="badge-blue">{skill}</span>
            ))}
          </div>
        </div>
      ) : null}

      <Link href="/resumes" className="btn-ghost mt-4 text-sm">
        Improve Resume →
      </Link>
    </section>
  );
}
