"use client";

import type { ProfileCompletionResult } from "@/lib/profile/completion";
import { UserCheck } from "lucide-react";

interface ProfileCompletionCardProps {
  readonly completion: ProfileCompletionResult;
}

export default function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
  return (
    <div className="widget-card lg:col-span-1">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-950/50">
          <UserCheck size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="stat-label">Profile Completion</p>
          <p className="font-display text-2xl font-bold">{completion.percentage}%</p>
        </div>
      </div>

      <div className="progress-bar mt-4">
        <div className="progress-fill" style={{ width: `${completion.percentage}%` }} />
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        {completion.missingItems.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Missing ({completion.missingItems.length})
            </p>
            <ul className="mt-2 space-y-1 text-[var(--muted-foreground)]">
              {completion.missingItems.slice(0, 3).map((item) => (
                <li key={item.key} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-green-600 dark:text-green-400">Profile complete!</p>
        )}
      </div>
    </div>
  );
}
