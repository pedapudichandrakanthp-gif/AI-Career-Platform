"use client";

import type { JobAnalysis } from "@/types/ai";

import { getScoreBg, getScoreColor } from "./DashboardStats";

interface JobAnalysisCardProps {
  readonly analysis: JobAnalysis;
  readonly onClose: () => void;
}

export default function JobAnalysisCard({ analysis, onClose }: JobAnalysisCardProps) {
  return (
    <section className="card mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="section-title">Job Analysis</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            AI insights and resume match comparison
          </p>
        </div>
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Dismiss
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className={`score-ring ${getScoreBg(analysis.match_score)} ${getScoreColor(analysis.match_score)}`}>
          {analysis.match_score}%
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Resume Match Score</p>
          <span className="badge-blue mt-1">{analysis.difficulty_level}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TagSection title="Required Skills" items={analysis.required_skills} color="blue" />
        <TagSection title="Preferred Skills" items={analysis.preferred_skills} color="green" />
        <TagSection title="Missing Skills" items={analysis.missing_skills} color="red" />
        <TagSection title="Keywords" items={analysis.important_keywords} color="purple" />
      </div>

      {analysis.experience_needed ? (
        <p className="mt-4 text-sm">
          <span className="font-medium">Experience Needed:</span> {analysis.experience_needed}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ListSection title="Responsibilities" items={analysis.responsibilities} />
        <ListSection title="Preparation Tips" items={analysis.preparation_tips} />
        <ListSection title="Interview Topics" items={analysis.interview_topics} />
      </div>
    </section>
  );
}

function TagSection({
  title,
  items,
  color,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly color: "blue" | "green" | "red" | "purple";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  };

  return (
    <div>
      <h3 className="card-title text-base">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-1 text-xs font-medium ${colors[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ListSection({ title, items }: { readonly title: string; readonly items: readonly string[] }) {
  return (
    <div>
      <h3 className="card-title text-base">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--muted-foreground)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
