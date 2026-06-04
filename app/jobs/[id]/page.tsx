"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function JobDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setJob(data);
  };

  if (!job) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        {job.title}
      </h1>

      <p className="mt-4">
        <strong>Company:</strong> {job.company_name}
      </p>

      <p>
        <strong>Location:</strong> {job.location}
      </p>

      <p>
        <strong>Category:</strong> {job.category}
      </p>

      <p>
        <strong>Qualification:</strong> {job.qualification}
      </p>

      <p>
        <strong>Description:</strong>
      </p>

      <p>{job.description}</p>

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