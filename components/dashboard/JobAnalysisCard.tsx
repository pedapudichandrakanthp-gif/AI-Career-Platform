"use client";

import type { JobAnalysis } from "@/types/ai";

interface JobAnalysisCardProps {
  readonly analysis: JobAnalysis;
  readonly onClose: () => void;
}

function getDifficultyColor(level: string): string {
  const normalized = level.toLowerCase();

  if (normalized.includes("entry")) return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400";
  if (normalized.includes("mid")) return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
  if (normalized.includes("senior")) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400";
  return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";
}

export default function JobAnalysisCard({ analysis, onClose }: JobAnalysisCardProps) {
  return (
    <section className="card mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="section-title">Job Analysis</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            AI insights to help you prepare for this role.
          </p>
        </div>
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Dismiss
        </button>
      </div>

      <div className="mt-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Difficulty Level</span>
        <p className="mt-1">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getDifficultyColor(analysis.difficulty_level)}`}>
            {analysis.difficulty_level}
          </span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TagSection title="Required Skills" items={analysis.required_skills} color="blue" />
        <TagSection title="Important Keywords" items={analysis.important_keywords} color="purple" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
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
  readonly color: "blue" | "purple";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
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
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
