import Link from "next/link";

import {
  ArrowRight,
  Briefcase,
  FileUp,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: FileUp,
    title: "Resume Upload",
    description:
      "Upload your resume and let our platform extract skills, education, and experience automatically.",
  },
  {
    icon: Sparkles,
    title: "AI Matching",
    description:
      "Advanced algorithms compare your profile against job requirements to calculate precise match scores.",
  },
  {
    icon: Target,
    title: "Recommendations",
    description:
      "Receive personalized job recommendations ranked by how well they fit your unique career profile.",
  },
  {
    icon: TrendingUp,
    title: "Job Tracking",
    description:
      "Save jobs, track applications, and manage your career search from one centralized dashboard.",
  },
] as const;

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up and complete your career profile with skills, experience, and preferences.",
  },
  {
    step: "02",
    title: "Upload Your Resume",
    description: "Upload your resume so AI can analyze your qualifications and career background.",
  },
  {
    step: "03",
    title: "Get Matched",
    description: "Generate match scores and discover jobs tailored to your profile and goals.",
  },
] as const;

export default function Home() {
  return (
    <main className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="page-container relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <Sparkles size={16} aria-hidden="true" />
              AI-Powered Career Platform
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Find Your Dream Job{" "}
              <span className="text-blue-600 dark:text-blue-400">With AI</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Upload your resume, get AI-powered recommendations, and track your applications — all
              in one modern platform built for your career success.
            </p>

            <ul className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-slate-600 sm:flex-row sm:gap-6 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <FileUp size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                Upload Resume
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                Get AI Recommendations
              </li>
              <li className="flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                Track Applications
              </li>
            </ul>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="btn-primary w-full gap-2 px-6 py-3 text-base sm:w-auto">
                Get Started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/jobs" className="btn-secondary w-full gap-2 px-6 py-3 text-base sm:w-auto">
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-container px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-slate-900 dark:text-white">Everything You Need</h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Powerful tools to accelerate your job search and land the role you deserve.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="card group hover:border-blue-300 dark:hover:border-blue-700">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <feature.icon size={24} aria-hidden="true" />
              </div>
              <h3 className="card-title text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="page-container px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-title text-slate-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Three simple steps to transform your job search with AI.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <article key={item.step} className="relative text-center md:text-left">
                <span className="text-5xl font-bold text-blue-100 dark:text-blue-950">
                  {item.step}
                </span>
                <h3 className="card-title mt-2 text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-base text-slate-600 dark:text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="section-title text-white">Ready to Find Your Next Role?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-100">
            Join thousands of job seekers using AI to discover opportunities that match their skills
            and ambitions.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 transition hover:bg-blue-50 sm:w-auto"
            >
              Get Started Free
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
