"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { JobRow } from "@/types/database";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setJobs((data ?? []) as JobRow[]);
  };

  const saveJob = async (jobId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login");
      return;
    }

    const { error } = await supabase
      .from("saved_jobs")
      .insert([
        {
          user_id: user.id,
          job_id: jobId,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job Saved");
  };

  return (
    <main className="p-10">
      <h1 className="mb-6 text-3xl font-bold">
        Jobs
      </h1>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border p-4 shadow"
            >
              <Link href={`/jobs/${job.id}`}>
                <h2 className="text-xl font-bold text-blue-600">
                  {job.title ?? "Untitled Job"}
                </h2>
              </Link>

              <p>
                <strong>Company:</strong>{" "}
                {job.company_name ?? "Not specified"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {job.location ?? "Not specified"}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {job.category ?? "Not specified"}
              </p>

              <button
                onClick={() => saveJob(job.id)}
                className="mt-3 rounded bg-green-600 px-3 py-2 text-white"
              >
                Save Job
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
