"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);

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

    setJobs(data || []);
  };

  return (
    <main className="p-10">
      <h1 className="mb-6 text-3xl font-bold">Jobs</h1>

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
    {job.title}
  </h2>
</Link>

              <p>
                <strong>Company:</strong> {job.company_name}
              </p>

              <p>
                <strong>Location:</strong> {job.location}
              </p>

              <p>
                <strong>Category:</strong> {job.category}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}