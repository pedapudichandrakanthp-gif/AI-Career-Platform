"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Bookmark, Briefcase, Filter, Search, SlidersHorizontal } from "lucide-react";

import JobCard from "@/components/jobs/JobCard";
import { supabase } from "@/lib/supabase";
import type { JobFilters, JobRow } from "@/types/database";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [saveSearchName, setSaveSearchName] = useState("");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchJobs = useCallback(async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setJobs((data ?? []) as JobRow[]);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from("users")
        .select("skills")
        .eq("id", user.id)
        .single();

      if (profileData?.skills) {
        setUserSkills(profileData.skills as string[]);
      }
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort(), [jobs]);
  const categories = useMemo(() => [...new Set(jobs.map((j) => j.category).filter(Boolean))].sort(), [jobs]);
  const jobTypes = useMemo(() => [...new Set(jobs.map((j) => j.job_type).filter(Boolean))].sort(), [jobs]);
  const workModes = useMemo(() => [...new Set(jobs.map((j) => j.work_mode).filter(Boolean))].sort(), [jobs]);

  const filteredJobs = useMemo(() => {
    const searchTerm = keyword.trim().toLowerCase();
    const minSalary = salaryMin ? Number(salaryMin) : null;

    return jobs.filter((job) => {
      const matchesKeyword =
        !searchTerm ||
        (job.title?.toLowerCase().includes(searchTerm) ?? false) ||
        (job.company_name?.toLowerCase().includes(searchTerm) ?? false) ||
        (job.location?.toLowerCase().includes(searchTerm) ?? false);

      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesCategory = !categoryFilter || job.category === categoryFilter;
      const matchesJobType = !jobTypeFilter || job.job_type === jobTypeFilter;
      const matchesWorkMode = !workModeFilter || job.work_mode === workModeFilter;

      const matchesExperience =
        !experienceFilter ||
        (experienceFilter === "0-2" && (job.experience_required ?? 0) <= 2) ||
        (experienceFilter === "3-5" &&
          (job.experience_required ?? 0) >= 3 &&
          (job.experience_required ?? 0) <= 5) ||
        (experienceFilter === "5+" && (job.experience_required ?? 0) > 5);

      const matchesSalary = !minSalary || (job.salary_max != null && job.salary_max >= minSalary);

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesCategory &&
        matchesJobType &&
        matchesWorkMode &&
        matchesExperience &&
        matchesSalary
      );
    });
  }, [jobs, keyword, locationFilter, categoryFilter, jobTypeFilter, experienceFilter, salaryMin, workModeFilter]);

  const saveSearch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login to save searches");
      return;
    }

    if (!saveSearchName.trim()) {
      alert("Enter a name for this search");
      return;
    }

    const filters: JobFilters = {
      keyword,
      location: locationFilter,
      category: categoryFilter,
      jobType: jobTypeFilter,
      experience: experienceFilter,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      workMode: workModeFilter,
    };

    const { error } = await supabase.from("saved_searches").insert([
      { user_id: user.id, name: saveSearchName, filters },
    ]);

    if (error) alert(error.message);
    else {
      setMessage("Search saved!");
      setSaveSearchName("");
    }
  };

  const saveJob = async (jobId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login");
      return;
    }

    const { error } = await supabase.from("saved_jobs").insert([{ user_id: user.id, job_id: jobId }]);
    if (error) alert(error.message);
    else setMessage("Job saved!");
  };

  const clearFilters = () => {
    setKeyword("");
    setLocationFilter("");
    setCategoryFilter("");
    setJobTypeFilter("");
    setExperienceFilter("");
    setSalaryMin("");
    setWorkModeFilter("");
  };

  const hasActiveFilters =
    keyword || locationFilter || categoryFilter || jobTypeFilter || experienceFilter || salaryMin || workModeFilter;

  return (
    <main role="main" className="page-main">
      <section className="page-container">
        {/* Header + Search */}
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">AvsarGrid Jobs</p>
          <h1 className="page-title mt-1">Find Your Next Role</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {filteredJobs.length} of {jobs.length} active opportunities
          </p>
        </div>

        {message ? <div className="alert-success mt-4">{message}</div> : null}

        {/* Large search bar */}
        <div className="relative mt-6">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="search"
            className="input py-4 pl-14 pr-4 text-lg shadow-md"
            placeholder="Search by title, company, or location..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="mt-6 flex gap-6">
          {/* Filter Sidebar */}
          <aside
            className={`${sidebarOpen ? "block" : "hidden"} w-full shrink-0 lg:block lg:w-72`}
          >
            <div className="section-card sticky top-24">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  <h2 className="font-display font-semibold">Filters</h2>
                </div>
                {hasActiveFilters ? (
                  <button type="button" onClick={clearFilters} className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="label" htmlFor="location-filter">Location</label>
                  <select id="location-filter" className="input text-sm" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                    <option value="">All Locations</option>
                    {locations.map((l) => <option key={l} value={l!}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="category-filter">Category</label>
                  <select id="category-filter" className="input text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map((c) => <option key={c} value={c!}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="job-type-filter">Job Type</label>
                  <select id="job-type-filter" className="input text-sm" value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    {jobTypes.map((t) => <option key={t} value={t!}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="work-mode-filter">Work Mode</label>
                  <select id="work-mode-filter" className="input text-sm" value={workModeFilter} onChange={(e) => setWorkModeFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                    {workModes.filter((m) => !["Remote", "Hybrid", "Onsite"].includes(m!)).map((m) => (
                      <option key={m} value={m!}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="experience-filter">Experience</label>
                  <select id="experience-filter" className="input text-sm" value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)}>
                    <option value="">Any</option>
                    <option value="0-2">0–2 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="salary-min">Min Salary</label>
                  <input id="salary-min" type="number" className="input text-sm" placeholder="50000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <input className="input text-sm" placeholder="Save search as..." value={saveSearchName} onChange={(e) => setSaveSearchName(e.target.value)} />
                  <button type="button" onClick={saveSearch} className="btn-secondary mt-2 w-full gap-2 text-sm">
                    <Bookmark size={14} />
                    Save Search
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Job listings */}
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-secondary mb-4 gap-2 text-sm lg:hidden"
            >
              <Filter size={16} />
              {sidebarOpen ? "Hide Filters" : "Show Filters"}
            </button>

            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="card text-center py-12">
                  {hasActiveFilters ? (
                    <>
                      <Briefcase size={48} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
                      <h3 className="text-lg font-semibold">No jobs match your filters</h3>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        Try adjusting your search criteria or reset filters to see all available jobs.
                      </p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="btn-secondary mt-6 gap-2"
                      >
                        <Filter size={16} />
                        Reset Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <Briefcase size={48} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
                      <h3 className="text-lg font-semibold">No jobs available</h3>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        Check back later for new opportunities or try different search terms.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                filteredJobs.map((job) => <JobCard key={job.id} job={job} userSkills={userSkills} onSaveJob={saveJob} />)
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
