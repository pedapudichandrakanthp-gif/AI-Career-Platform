import Link from "next/link";
import type { ReactNode } from "react";

import { Sparkles } from "lucide-react";

interface AuthShellProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly subtitle: string;
}

export default function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="hero-gradient pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/10" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">AvsarGrid</span>
          </Link>
          <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            AI-Powered Government Exam Platform
          </p>
        </div>

        <div className="premium-card border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
