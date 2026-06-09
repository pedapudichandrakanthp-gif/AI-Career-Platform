"use client";

import Link from "next/link";

import { ArrowRight, Building2 } from "lucide-react";

interface RecommendedJob {
  readonly id: string;
  readonly match_percentage: number | null;
  readonly title: string | null;
  readonly company_name: string | null;
  readonly location: string | null;
  readonly job_id: string | null;
}

interface RecommendedJobsWidgetProps {
  readonly jobs: readonly RecommendedJob[];
}

function getMatchColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default function RecommendedJobsWidget({ jobs }: RecommendedJobsWidgetProps) {
  return (
    <section className="widget-card">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Top Recommended Jobs</h2>
        <Link href="/recommendations" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          View all
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          No recommendations yet. Update your resume to generate matches.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {jobs.map((job) => {
            const score = job.match_percentage ?? 0;
            return (
              <Link
                key={job.id}
                href={job.job_id ? `/jobs/${job.job_id}` : "/recommendations"}
                className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                  <Building2 size={18} className="text-[var(--muted-foreground)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {job.title ?? "Untitled"}
                  </p>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                    {job.company_name} · {job.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-display text-lg font-bold ${getMatchColor(score)}`}>{score}%</p>
                  <ArrowRight size={14} className="ml-auto text-[var(--muted-foreground)] opacity-0 transition group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
