"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { normalizeSavedJob, type SavedJobQueryRow } from "@/lib/jobs/savedJobs";
import { supabase } from "@/lib/supabase";
import type { SavedJobWithJob } from "@/types/database";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJobWithJob[]>([]);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("saved_jobs")
      .select(`
        id,
        saved_at,
        jobs (
          id,
          title,
          company_name,
          location,
          category
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    const normalizedSavedJobs = ((data ?? []) as unknown as SavedJobQueryRow[]).map(
      normalizeSavedJob
    );

    setSavedJobs(normalizedSavedJobs);
  };

  const removeSavedJob = async (savedJobId: string) => {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", savedJobId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job Removed");

    fetchSavedJobs();
  };

  return (
    <ProtectedRoute>
    <main className="p-10">
      <h1 className="mb-6 text-3xl font-bold">
        Saved Jobs
      </h1>

      <div className="space-y-4">
        {savedJobs.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border p-4"
          >
            <h2 className="text-xl font-bold">
              {item.jobs?.title ?? "Untitled Job"}
            </h2>

            <p>{item.jobs?.company_name ?? "Not specified"}</p>

            <p>{item.jobs?.location ?? "Not specified"}</p>

            <button
              onClick={() =>
                removeSavedJob(item.id)
              }
              className="mt-3 rounded bg-red-600 px-3 py-2 text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
    </ProtectedRoute>
  );
}
