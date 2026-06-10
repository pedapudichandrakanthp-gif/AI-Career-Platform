import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileUp,
  Quote,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { createServiceClient } from "@/lib/supabase/server";

const features = [
  {
    icon: FileUp,
    title: "AI Resume Analysis",
    description:
      "Upload your resume and get instant ATS scoring, skill extraction, and actionable improvement tips powered by AI.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    description:
      "Our AI compares your profile against thousands of roles to surface opportunities with the highest match potential.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Career Roadmaps",
    description:
      "Get personalized learning paths, certifications, and milestones to reach your target role faster.",
    gradient: "from-violet-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Match Intelligence",
    description:
      "See exactly why each job matches — skills alignment, experience fit, education, and location scoring.",
    gradient: "from-emerald-500 to-teal-500",
  },
] as const;

const steps = [
  {
    step: "01",
    title: "Upload Your Resume",
    description: "Drop your PDF and let AvsarGrid extract skills, experience, and education automatically.",
  },
  {
    step: "02",
    title: "Get AI Analysis",
    description: "Receive ATS scores, missing skills, and personalized recommendations in seconds.",
  },
  {
    step: "03",
    title: "Land Your Role",
    description: "Apply to high-match jobs with confidence backed by data-driven career intelligence.",
  },
] as const;

async function getStats() {
  const supabase = createServiceClient();

  const [jobsCount, usersCount] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);

  return [
    { value: `${jobsCount.count ?? 0}+`, label: "Jobs Indexed" },
    { value: "AI-Powered", label: "Match Accuracy" },
    { value: "Instant", label: "Search Speed" },
    { value: `${usersCount.count ?? 0}+`, label: "Users" },
  ];
}

const testimonials = [
  {
    quote:
      "AvsarGrid helped me identify skill gaps I didn't know I had. I landed a senior role within 6 weeks.",
    name: "Priya Sharma",
    role: "Software Engineer",
    rating: 5,
  },
  {
    quote:
      "The match scores are incredibly accurate. I stopped wasting time on jobs that weren't a fit.",
    name: "James Okonkwo",
    role: "Product Manager",
    rating: 5,
  },
  {
    quote:
      "Best career platform I've used. The resume analysis alone is worth it — my ATS score went from 62 to 89.",
    name: "Sarah Chen",
    role: "Data Analyst",
    rating: 5,
  },
] as const;

export default async function Home() {
  const stats = await getStats();

  return (
    <main role="main" className="bg-[var(--background)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-[0.07] dark:opacity-[0.12]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-600/10" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-600/10" />

        <div className="page-container relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles size={16} aria-hidden="true" />
              AI-Powered Career Intelligence Platform
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              Find Your Dream Job{" "}
              <span className="gradient-text">With AI</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl">
              Upload your resume, get intelligent job matches, and accelerate your career with
              data-driven insights.{" "}
              <span className="font-medium text-[var(--foreground)]">
                Find better opportunities faster.
              </span>
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/onboarding" className="btn-primary w-full gap-2 px-8 py-3.5 text-base sm:w-auto">
                <FileUp size={20} aria-hidden="true" />
                Upload Resume
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/jobs" className="btn-secondary w-full gap-2 px-8 py-3.5 text-base sm:w-auto">
                <Briefcase size={20} aria-hidden="true" />
                Browse Jobs
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted-foreground)]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                Free to start
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                AI-powered matching
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="page-container grid grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold gradient-text sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="page-container px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Win
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            Professional-grade career tools powered by Groq AI — built for ambitious job seekers.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="card-interactive group">
              <div
                className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 text-white shadow-lg transition-transform group-hover:scale-110`}
              >
                <feature.icon size={24} aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="page-container px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Three steps from resume upload to your next career move.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent md:block" />
            {steps.map((item) => (
              <article key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                  {item.step}
                </div>
                <h3 className="font-display mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="page-container px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Users size={16} />
            Trusted by job seekers
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            What Our Users Say
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <article key={t.name} className="card-interactive flex flex-col">
              <Quote size={24} className="text-blue-500/40" aria-hidden="true" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="mt-3 border-t border-[var(--border)] pt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-container px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="hero-gradient absolute inset-0" aria-hidden="true" />
          <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Zap size={28} className="text-white" />
            </div>
            <h2 className="font-display mt-6 text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Career?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-blue-100">
              Join AvsarGrid today and let AI find the opportunities that match your unique skills
              and ambitions.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-xl transition hover:bg-blue-50 sm:w-auto"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
