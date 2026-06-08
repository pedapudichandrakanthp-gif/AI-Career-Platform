"use client";

import Link from "next/link";

import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import type { ProfileCompletionResult } from "@/lib/profile/completion";

interface NextStepsProps {
  readonly hasResume: boolean;
  readonly hasMatchScores: boolean;
  readonly completion: ProfileCompletionResult;
  readonly onAnalyzeResume?: () => void;
  readonly analyzing?: boolean;
  readonly hasAnalyzedResume?: boolean;
}

interface StepItem {
  readonly id: string;
  readonly label: string;
  readonly completed: boolean;
  readonly href?: string;
  readonly action?: () => void;
  readonly actionLabel?: string;
}

export default function NextSteps({
  hasResume,
  hasMatchScores,
  completion,
  onAnalyzeResume,
  analyzing = false,
  hasAnalyzedResume = false,
}: NextStepsProps) {
  const allSteps: StepItem[] = [
    {
      id: "upload-resume",
      label: "Upload Resume",
      completed: hasResume,
      href: hasResume ? undefined : "/onboarding",
    },
    {
      id: "complete-profile",
      label: "Complete Profile",
      completed: completion.percentage === 100,
      href: completion.percentage === 100 ? undefined : "/profile",
    },
    {
      id: "analyze-resume",
      label: "Analyze Resume",
      completed: hasAnalyzedResume,
      action: hasResume && !hasAnalyzedResume ? onAnalyzeResume : undefined,
      actionLabel: analyzing ? "Analyzing..." : "Analyze Now",
    },
    {
      id: "view-recommendations",
      label: "View Recommendations",
      completed: hasMatchScores,
      href: "/recommendations",
    },
  ];

  const visibleSteps = allSteps.filter((step) => !step.completed);

  if (visibleSteps.length === 0) {
    return null;
  }

  return (
    <section className="card mt-6">
      <h2 className="section-title">Next Steps</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Complete these actions to get the most from your career platform.
      </p>

      <ul className="mt-4 space-y-3">
        {visibleSteps.map((step) => (
          <li
            key={step.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle2 className="text-green-500" size={20} aria-hidden="true" />
              ) : (
                <Circle className="text-slate-400" size={20} aria-hidden="true" />
              )}
              <span className="font-medium text-slate-900 dark:text-white">{step.label}</span>
            </div>

            {step.href ? (
              <Link href={step.href} className="btn-primary gap-2 text-sm">
                Get Started
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : step.action ? (
              <button
                type="button"
                onClick={step.action}
                disabled={analyzing}
                className="btn-primary gap-2 text-sm"
              >
                {step.actionLabel ?? "Continue"}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
