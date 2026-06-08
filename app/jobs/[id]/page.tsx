"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { JobRow } from "@/types/database";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setJob(data as JobRow);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const saveJob = async () => {
    if (!job) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login");
      return;
    }

    const { error } = await supabase.from("saved_jobs").insert([
      {
        user_id: user.id,
        job_id: job.id,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job Saved");
  };

  if (loading) {
    return (
      <main className="page-main">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="page-main">
        <p className="text-slate-600 dark:text-slate-400">Job not found.</p>
        <Link href="/jobs" className="btn-primary mt-4 inline-flex">
          Back to Jobs
        </Link>
      </main>
    );
  }

  return (
    <main className="page-main">
      <section className="page-container max-w-4xl">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Jobs
        </Link>

        <article className="card">
          <h1 className="page-title">{job.title ?? "Untitled Job"}</h1>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Company</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.company_name ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Location</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.location ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.category ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Job Type</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.job_type ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Qualification
              </dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.qualification ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Experience Required
              </dt>
              <dd className="mt-1 text-slate-900 dark:text-white">
                {job.experience_required != null
                  ? `${job.experience_required} years`
                  : "Not specified"}
              </dd>
            </div>
            {job.salary_min != null || job.salary_max != null ? (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Salary</dt>
                <dd className="mt-1 text-slate-900 dark:text-white">
                  {job.salary_min != null && job.salary_max != null
                    ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                    : job.salary_min != null
                      ? `From $${job.salary_min.toLocaleString()}`
                      : `Up to $${job.salary_max?.toLocaleString()}`}
                </dd>
              </div>
            ) : null}
          </dl>

          {job.skills && job.skills.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Required Skills
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-base text-slate-700 dark:text-slate-300">
              {job.description ?? "No description available."}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {job.apply_link ? (
              <a
                href={job.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-center"
              >
                Apply Now
              </a>
            ) : null}
            <button type="button" onClick={saveJob} className="btn-success">
              Save Job
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
