"use client";

import { Lightbulb, Sparkles } from "lucide-react";

import type { ResumeAnalysisRow } from "@/types/database";

interface AIInsightsWidgetProps {
  readonly resumeAnalysis: ResumeAnalysisRow | null;
}

export default function AIInsightsWidget({ resumeAnalysis }: AIInsightsWidgetProps) {
  const insights = [
    ...(resumeAnalysis?.strengths?.slice(0, 2).map((s) => ({ type: "strength" as const, text: s })) ?? []),
    ...(resumeAnalysis?.suggestions?.slice(0, 2).map((s) => ({ type: "tip" as const, text: s })) ?? []),
  ];

  return (
    <section className="widget-card">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/25">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">AI Career Insights</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Powered by Gemini</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Upload and analyze your resume to unlock personalized career insights.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {insights.map((insight, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
            >
              <Lightbulb
                size={16}
                className={
                  insight.type === "strength"
                    ? "shrink-0 text-green-500"
                    : "shrink-0 text-blue-500"
                }
              />
              <span className="text-[var(--muted-foreground)]">{insight.text}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
