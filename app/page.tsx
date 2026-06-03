import Link from "next/link";

import { validateEnvironment } from "@/lib/config/environment";

const foundationItems = [
  {
    label: "Framework",
    value: "Next.js 15 App Router"
  },
  {
    label: "Language",
    value: "Strict TypeScript"
  },
  {
    label: "Styling",
    value: "Tailwind CSS"
  },
  {
    label: "Quality",
    value: "ESLint"
  }
] as const;

export default function Home() {
  const environmentValidation = validateEnvironment();
  const environmentIsValid = environmentValidation.status === "valid";

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-base font-semibold text-[var(--foreground)]" href="/">
            AI Career Platform
          </Link>
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-medium text-[var(--muted-foreground)]">
            MVP Foundation
          </span>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[var(--accent)]">Phase 1</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              AI Career Platform
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              A secure Next.js foundation for AI-assisted career matching across government and
              private opportunities.
            </p>
          </div>

          <dl aria-label="Project foundation" className="grid gap-3">
            {foundationItems.map((item) => (
              <div
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
                key={item.label}
              >
                <dt className="text-sm font-medium text-[var(--muted-foreground)]">{item.label}</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--foreground)]">{item.value}</dd>
              </div>
            ))}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <dt className="text-sm font-medium text-[var(--muted-foreground)]">Environment</dt>
              <dd className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                {environmentIsValid ? "Configured" : "Configuration Required"}
              </dd>
              {!environmentIsValid ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Missing: {environmentValidation.missingVariables.join(", ")}
                </p>
              ) : null}
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
