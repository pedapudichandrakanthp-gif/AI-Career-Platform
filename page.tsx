"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface JobRow {
  id: string;
  exam_name: string;
  conducting_body: string;
  created_at: string;
  is_active: boolean;
}

const initialForm = {
  exam_name: "",
  conducting_body: "",
  location: "",
  job_type: "full_time",
  work_mode: "remote",
  category: "Engineering",
  salary_min: "",
  salary_max: "",
  description: "",
  apply_link: "",
  is_active: true,
};

export default function PostJobPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [recentJobs, setRecentJobs] = useState<JobRow[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      
      if (user && adminEmail && user.email === adminEmail) {
        setIsAdmin(true);
        fetchRecentJobs();
      } else {
        setIsAdmin(false);
      }
    }
    checkAuth();
  }, []);

  const fetchRecentJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, exam_name, conducting_body, created_at, is_active")
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (data) setRecentJobs(data as JobRow[]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      exam_name: form.exam_name,
      conducting_body: form.conducting_body,
      location: form.location || null,
      job_type: form.job_type || null,
      category: form.category || null,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      description: form.description || null,
      apply_link: form.apply_link,
      is_active: form.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: "Manual Admin",
    };

    const { data, error: insertError } = await supabase
      .from("jobs")
      .insert([payload])
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(`Job posted successfully! ID: ${data.id}`);
    setForm(initialForm);
    setLoading(false);
    fetchRecentJobs();
  };

  if (isAdmin === null) {
    return (
      <main className="page-main flex min-h-[50vh] items-center justify-center">
        <div className="text-[var(--muted-foreground)]">Verifying access...</div>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="page-main flex min-h-[50vh] items-center justify-center">
        <div className="card w-full max-w-md text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Access Denied</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">You do not have permission to view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main">
      <section className="page-container max-w-3xl">
        <div className="mb-6">
          <h1 className="page-title">Post a New Job</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Manually add a job listing to the platform.
          </p>
        </div>

        {success ? <div className="alert-success mb-6">{success}</div> : null}
        {error ? <div className="alert-error mb-6">{error}</div> : null}

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="exam_name">Exam Name *</label>
              <input 
                id="exam_name" 
                required 
                className="input" 
                value={form.exam_name} 
                onChange={(e) => setForm({ ...form, exam_name: e.target.value })} 
              />
            </div>

            <div>
              <label className="label" htmlFor="conducting_body">Conducting Body *</label>
              <input 
                id="conducting_body" 
                required 
                className="input" 
                value={form.conducting_body} 
                onChange={(e) => setForm({ ...form, conducting_body: e.target.value })} 
              />
            </div>

            <div>
              <label className="label" htmlFor="location">Location</label>
              <input 
                id="location" 
                className="input" 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
                placeholder="e.g. Remote, Bangalore, Mumbai" 
              />
            </div>

            <div>
              <label className="label" htmlFor="job_type">Job Type</label>
              <select 
                id="job_type" 
                className="input" 
                value={form.job_type} 
                onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="work_mode">Work Mode</label>
              <select 
                id="work_mode" 
                className="input" 
                value={form.work_mode} 
                onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="category">Category</label>
              <select 
                id="category" 
                className="input" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-4 sm:col-span-2">
              <div className="flex-1">
                <label className="label" htmlFor="salary_min">Min Salary</label>
                <input 
                  id="salary_min" 
                  type="number" 
                  className="input" 
                  value={form.salary_min} 
                  onChange={(e) => setForm({ ...form, salary_min: e.target.value })} 
                  placeholder="e.g. 500000" 
                />
              </div>
              <div className="flex-1">
                <label className="label" htmlFor="salary_max">Max Salary</label>
                <input 
                  id="salary_max" 
                  type="number" 
                  className="input" 
                  value={form.salary_max} 
                  onChange={(e) => setForm({ ...form, salary_max: e.target.value })} 
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="apply_link">Apply URL *</label>
              <input 
                id="apply_link" 
                required 
                type="url" 
                className="input" 
                value={form.apply_link} 
                onChange={(e) => setForm({ ...form, apply_link: e.target.value })} 
                placeholder="https://..." 
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="description">Description *</label>
              <textarea 
                id="description" 
                required 
                rows={8} 
                className="input py-3" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input 
                id="is_active" 
                type="checkbox" 
                checked={form.is_active} 
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} 
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
              />
              <label htmlFor="is_active" className="text-sm font-medium text-[var(--foreground)] mb-0">
                Active Listing (visible to job seekers)
              </label>
            </div>
          </div>

          <div className="flex justify-end border-t border-[var(--border)] pt-6 mt-6">
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
          {recentJobs.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">No recent jobs found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-[var(--muted-foreground)] dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Created At</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">
                        {job.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        {job.exam_name}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {job.conducting_body}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          job.is_active 
                            ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400" 
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {job.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}