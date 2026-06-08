"use client";

import type { ProfileCompletionResult } from "@/lib/profile/completion";

interface ProfileCompletionCardProps {
  readonly completion: ProfileCompletionResult;
}

export default function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
  return (
    <div className="card sm:col-span-2">
      <p className="text-sm text-slate-500 dark:text-slate-400">Profile Completion</p>
      <p className="mt-3 text-3xl font-semibold">{completion.percentage}%</p>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
            Completed
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {completion.completedItems.length > 0 ? (
              completion.completedItems.map((item) => (
                <li key={item.key} className="flex items-center gap-2">
                  <span className="text-green-500" aria-hidden="true">
                    ✓
                  </span>
                  {item.label}
                </li>
              ))
            ) : (
              <li>None yet</li>
            )}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
            Missing
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {completion.missingItems.length > 0 ? (
              completion.missingItems.map((item) => (
                <li key={item.key} className="flex items-center gap-2">
                  <span className="text-yellow-500" aria-hidden="true">
                    ○
                  </span>
                  {item.label}
                </li>
              ))
            ) : (
              <li className="text-green-600 dark:text-green-400">All complete!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
