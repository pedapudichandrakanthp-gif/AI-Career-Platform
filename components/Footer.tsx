import Link from "next/link";

import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/jobs", label: "Browse Exams" },
    { href: "/recommendations", label: "Recommendations" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  Company: [
    { href: "/register", label: "Get Started" },
    { href: "/login", label: "Sign In" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
} as const;

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="page-container px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <Sparkles size={18} aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">AvsarGrid</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
              AI-Powered Government Exam Platform. Never miss a government exam notification with
              intelligent matching, eligibility analysis, and personalized exam roadmaps.
            </p>
            <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
              Never Miss a Government Exam Notification
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-sm text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} AvsarGrid. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Powered by Groq AI &middot; Built for government exam aspirants
          </p>
        </div>
      </div>
    </footer>
  );
}
