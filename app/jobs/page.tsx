"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Search } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { JobRow } from "@/types/database";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setJobs((data ?? []) as JobRow[]);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const locations = useMemo(() => {
    const values = jobs
      .map((job) => job.location)
      .filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort();
  }, [jobs]);

  const categories = useMemo(() => {
    const values = jobs
      .map((job) => job.category)
      .filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort();
  }, [jobs]);

  const jobTypes = useMemo(() => {
    const values = jobs
      .map((job) => job.job_type)
      .filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const searchTerm = keyword.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesKeyword =
        !searchTerm ||
        (job.title?.toLowerCase().includes(searchTerm) ?? false) ||
        (job.company_name?.toLowerCase().includes(searchTerm) ?? false) ||
        (job.location?.toLowerCase().includes(searchTerm) ?? false);

      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesCategory = !categoryFilter || job.category === categoryFilter;
      const matchesJobType = !jobTypeFilter || job.job_type === jobTypeFilter;

      return matchesKeyword && matchesLocation && matchesCategory && matchesJobType;
    });
  }, [jobs, keyword, locationFilter, categoryFilter, jobTypeFilter]);

  const saveJob = async (jobId: string) => {
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
        job_id: jobId,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job Saved");
  };

  const clearFilters = () => {
    setKeyword("");
    setLocationFilter("");
    setCategoryFilter("");
    setJobTypeFilter("");
  };

  const hasActiveFilters = keyword || locationFilter || categoryFilter || jobTypeFilter;

  return (
    <main className="page-main">
      <section className="page-container">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Jobs</h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
              Browse and filter available opportunities.
            </p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        <div className="card mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label" htmlFor="keyword-search">
                Keyword Search
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="keyword-search"
                  type="search"
                  className="input pl-10"
                  placeholder="Title, company, location..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="location-filter">
                Location
              </label>
              <select
                id="location-filter"
                className="input"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="category-filter">
                Category
              </label>
              <select
                id="category-filter"
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="job-type-filter">
                Job Type
              </label>
              <select
                id="job-type-filter"
                className="input"
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters ? (
            <button type="button" onClick={clearFilters} className="btn-secondary mt-4">
              Clear Filters
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4">
          {filteredJobs.length === 0 ? (
            <p className="card text-center text-slate-600 dark:text-slate-400">
              {jobs.length === 0 ? "No jobs found." : "No jobs match your filters."}
            </p>
          ) : (
            filteredJobs.map((job) => (
              <article className="card" key={job.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/jobs/${job.id}`}>
                      <h2 className="card-title text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        {job.title ?? "Untitled Job"}
                      </h2>
                    </Link>

                    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="font-medium text-slate-500 dark:text-slate-400">Company</dt>
                        <dd className="text-slate-900 dark:text-slate-200">
                          {job.company_name ?? "Not specified"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500 dark:text-slate-400">Location</dt>
                        <dd className="text-slate-900 dark:text-slate-200">
                          {job.location ?? "Not specified"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500 dark:text-slate-400">Category</dt>
                        <dd className="text-slate-900 dark:text-slate-200">
                          {job.category ?? "Not specified"}
                        </dd>
                      </div>
                    </dl>

                    {job.job_type ? (
                      <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {job.job_type}
                      </span>
                    ) : null}
                  </div>

                  <button
                    className="btn-success shrink-0"
                    onClick={() => saveJob(job.id)}
                    type="button"
                  >
                    Save Job
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
