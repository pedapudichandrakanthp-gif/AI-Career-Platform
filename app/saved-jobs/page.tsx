"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { normalizeSavedJob, type SavedJobQueryRow } from "@/lib/jobs/savedJobs";
import { supabase } from "@/lib/supabase";
import type { SavedJobWithJob } from "@/types/database";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobWithJob[]>([]);

  const fetchSavedJobs = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("saved_jobs")
      .select(
        `
        id,
        saved_at,
        jobs (
          id,
          title,
          company_name,
          location,
          category
        )
      `,
      )
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const normalizedSavedJobs = ((data ?? []) as unknown as SavedJobQueryRow[]).map(
      normalizeSavedJob,
    );

    setSavedJobs(normalizedSavedJobs);
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const removeSavedJob = async (savedJobId: string) => {
    const { error } = await supabase.from("saved_jobs").delete().eq("id", savedJobId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job Removed");
    fetchSavedJobs();
  };

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container">
          <h1 className="page-title">Saved Jobs</h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Jobs you have saved for later review.
          </p>

          {savedJobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No saved jobs yet.</p>
              <Link href="/jobs" className="mt-4 inline-block underline">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {savedJobs.map((item) => (
                <article key={item.id} className="card">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      {item.jobs?.id ? (
                        <Link href={`/jobs/${item.jobs.id}`}>
                          <h2 className="card-title text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            {item.jobs.title ?? "Untitled Job"}
                          </h2>
                        </Link>
                      ) : (
                        <h2 className="card-title">{item.jobs?.title ?? "Untitled Job"}</h2>
                      )}

                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        {item.jobs?.company_name ?? "Not specified"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {item.jobs?.location ?? "Not specified"}
                      </p>
                      {item.jobs?.category ? (
                        <span className="mt-2 inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.jobs.category}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSavedJob(item.id)}
                      className="btn-danger shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
