"use client";

import type { ResumeAnalysis } from "@/types/ai";

interface ResumeAnalysisCardProps {
  readonly analysis: ResumeAnalysis;
  readonly onClose: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-100 dark:bg-green-950/50";
  if (score >= 60) return "bg-yellow-100 dark:bg-yellow-950/50";
  return "bg-red-100 dark:bg-red-950/50";
}

export default function ResumeAnalysisCard({ analysis, onClose }: ResumeAnalysisCardProps) {
  return (
    <section className="card mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="section-title">Resume Analysis</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            AI-powered insights from your resume.
          </p>
        </div>
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Dismiss
        </button>
      </div>

      <div className={`mt-6 inline-flex rounded-xl px-6 py-4 ${getScoreBg(analysis.resume_score)}`}>
        <div className="text-center">
          <p className={`text-4xl font-bold ${getScoreColor(analysis.resume_score)}`}>
            {analysis.resume_score}
          </p>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Resume Score</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <AnalysisList title="Skills Found" items={analysis.skills_found} variant="blue" />
        <AnalysisList title="Strengths" items={analysis.strengths} variant="green" />
        <AnalysisList title="Weaknesses" items={analysis.weaknesses} variant="yellow" />
        <AnalysisList title="Missing Skills" items={analysis.missing_skills} variant="red" />
      </div>

      <div className="mt-4">
        <h3 className="card-title">Recommendations</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {analysis.recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AnalysisList({
  title,
  items,
  variant,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly variant: "blue" | "green" | "yellow" | "red";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  };

  return (
    <div>
      <h3 className="card-title text-base">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item} className={`rounded-full px-3 py-1 text-xs font-medium ${colorMap[variant]}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">None identified</span>
        )}
      </div>
    </div>
  );
}
