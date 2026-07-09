"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { JobRow, SavedJobRow } from "@/types/database";
type SavedJobWithJobs = SavedJobRow & {
  jobs: Pick<JobRow, "id" | "exam_name" | "conducting_body" | "application_deadline" | "vacancies" | "status"> | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobWithJobs[]>([]);

  const fetchSavedJobs = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*, jobs!job_id(id, exam_name, conducting_body, application_deadline, vacancies, status)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setSavedJobs([]);
      return;
    }

    setSavedJobs(data || []);
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

    alert("Exam Removed");
    fetchSavedJobs();
  };

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container">
          <h1 className="page-title">Saved Exams</h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Exams you have saved for later review.
          </p>

          {savedJobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No saved exams yet.</p>
              <Link href="/jobs" className="mt-4 inline-block underline">
                Browse Exams
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
                                {item.jobs.exam_name ?? "Untitled Exam"}
                          </h2>
                        </Link>
                      ) : (
                            <h2 className="card-title">{item.jobs?.exam_name ?? "Untitled Exam"}</h2>
                      )}

                      <p className="mt-2 font-medium text-slate-600 dark:text-slate-400">
                            {item.jobs?.conducting_body ?? "Not specified"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-500">
                            {item.jobs?.application_deadline && (
                              <span>Deadline: {new Date(item.jobs.application_deadline).toLocaleDateString()}</span>
                        )}
                            {item.jobs?.vacancies && (
                              <span>Vacancies: {item.jobs.vacancies.toLocaleString()}</span>
                        )}
                            {item.jobs?.status && (
                              <span>Status: <span className="font-medium capitalize">{item.jobs.status}</span></span>
                        )}
                      </div>
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
