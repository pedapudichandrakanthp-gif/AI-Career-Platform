"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { JobRow } from "@/types/database";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobRow | null>(null);

  const fetchJob = useCallback(async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setJob(data as JobRow);
  }, [params.id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (!job) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        {job.title ?? "Untitled Job"}
      </h1>

      <p className="mt-4">
        <strong>Company:</strong> {job.company_name ?? "Not specified"}
      </p>

      <p>
        <strong>Location:</strong> {job.location ?? "Not specified"}
      </p>

      <p>
        <strong>Category:</strong> {job.category ?? "Not specified"}
      </p>

      <p>
        <strong>Qualification:</strong> {job.qualification ?? "Not specified"}
      </p>

      <p>
        <strong>Description:</strong>
      </p>

      <p>{job.description ?? "No description available."}</p>

      {job.apply_link && (
        <a
          href={job.apply_link}
          target="_blank"
          className="inline-block mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Apply Now
        </a>
      )}
    </main>
  );
}
