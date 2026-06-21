"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { supabase } from "@/lib/supabase";
import type { JobRow } from "@/types/database";

interface JobFormData {
  title: string;
  company_name: string;
  job_type: string;
  category: string;
  location: string;
  salary_min: string;
  salary_max: string;
  qualification: string;
  experience_required: string;
  skills: string;
  description: string;
  apply_link: string;
  application_deadline: string;
  is_active: boolean;
}

const emptyForm: JobFormData = {
  title: "",
  company_name: "",
  job_type: "",
  category: "",
  location: "",
  salary_min: "",
  salary_max: "",
  qualification: "",
  experience_required: "",
  skills: "",
  description: "",
  apply_link: "",
  application_deadline: "",
  is_active: true,
};

function jobToForm(job: JobRow): JobFormData {
  return {
    title: job.title ?? "",
    company_name: job.company_name ?? "",
    job_type: job.job_type ?? "",
    category: job.category ?? "",
    location: job.location ?? "",
    salary_min: job.salary_min?.toString() ?? "",
    salary_max: job.salary_max?.toString() ?? "",
    qualification: job.qualification ?? "",
    experience_required: job.experience_required?.toString() ?? "",
    skills: job.skills?.join(", ") ?? "",
    description: job.description ?? "",
    apply_link: job.apply_link ?? "",
    application_deadline: job.application_deadline?.split("T")[0] ?? "",
    is_active: job.is_active ?? true,
  };
}

function formToPayload(form: JobFormData, isCreate: boolean) {
  const payload: Record<string, unknown> = {
    title: form.title || null,
    company_name: form.company_name || null,
    job_type: form.job_type || null,
    category: form.category || null,
    location: form.location || null,
    salary_min: form.salary_min ? Number(form.salary_min) : null,
    salary_max: form.salary_max ? Number(form.salary_max) : null,
    qualification: form.qualification || null,
    experience_required: form.experience_required ? Number(form.experience_required) : null,
    skills: form.skills
      ? form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null,
    description: form.description || null,
    apply_link: form.apply_link || null,
    application_deadline: form.application_deadline || null,
    is_active: form.is_active,
    updated_at: new Date().toISOString(),
  };

  if (isCreate) {
    payload.source = "Manual Admin";
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    payload.expires_at = expires.toISOString();
  }

  return payload;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRow | null>(null);
  const [form, setForm] = useState<JobFormData>(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setJobs((data ?? []) as JobRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openCreateModal = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const openEditModal = (job: JobRow) => {
    setEditingJob(job);
    setForm(jobToForm(job));
    setModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingJob(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = formToPayload(form, !editingJob);

    if (editingJob) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", editingJob.id);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Job updated successfully.");
    } else {
      const { error } = await supabase.from("jobs").insert([payload]);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Job created successfully.");
    }

    setSaving(false);
    closeModal();
    await fetchJobs();
  };

  const toggleActive = async (job: JobRow) => {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("jobs")
      .update({ is_active: !job.is_active, updated_at: new Date().toISOString() })
      .eq("id", job.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(`Job ${job.is_active ? "deactivated" : "activated"} successfully.`);
    await fetchJobs();
  };

  const deleteJob = async (jobId: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setDeleteConfirmId(null);
    setSuccessMessage("Job deleted successfully.");
    await fetchJobs();
  };

  const updateField = (field: keyof JobFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminRoute>
    <main className="page-main">
      <section className="page-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Admin — Job Management</h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
              Create, edit, and manage job listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/import-jobs" className="btn-secondary">
              Import with AI
            </Link>
            <button type="button" onClick={openCreateModal} className="btn-primary gap-2">
              <Plus size={18} aria-hidden="true" />
              Create Job
            </button>
          </div>
        </div>

        {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}
        {successMessage ? <div className="alert-success mt-6">{successMessage}</div> : null}

        {loading ? (
          <p className="card mt-6 text-slate-600 dark:text-slate-400">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="card mt-6 text-center text-slate-600 dark:text-slate-400">
            No jobs yet. Create your first job listing.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="bg-white dark:bg-slate-950">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {job.title ?? "Untitled"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {job.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {job.location ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                        }`}
                      >
                        {job.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(job)}
                          className="btn-secondary gap-1 px-3 py-1.5"
                          aria-label={`Edit ${job.title}`}
                        >
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(job)}
                          className="btn-warning px-3 py-1.5"
                        >
                          {job.is_active ? "Deactivate" : "Activate"}
                        </button>
                        {deleteConfirmId === job.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => deleteJob(job.id)}
                              className="btn-danger px-3 py-1.5"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="btn-secondary px-3 py-1.5"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(job.id)}
                            className="btn-danger gap-1 px-3 py-1.5"
                            aria-label={`Delete ${job.title}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 id="job-modal-title" className="section-title">
              {editingJob ? "Edit Job" : "Create Job"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="title">
                    Title *
                  </label>
                  <input
                    id="title"
                    className="input"
                    required
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="company_name">
                    Company
                  </label>
                  <input
                    id="company_name"
                    className="input"
                    value={form.company_name}
                    onChange={(e) => updateField("company_name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    className="input"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="category">
                    Category
                  </label>
                  <input
                    id="category"
                    className="input"
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="job_type">
                    Job Type
                  </label>
                  <input
                    id="job_type"
                    className="input"
                    value={form.job_type}
                    onChange={(e) => updateField("job_type", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="salary_min">
                    Salary Min
                  </label>
                  <input
                    id="salary_min"
                    type="number"
                    className="input"
                    value={form.salary_min}
                    onChange={(e) => updateField("salary_min", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="salary_max">
                    Salary Max
                  </label>
                  <input
                    id="salary_max"
                    type="number"
                    className="input"
                    value={form.salary_max}
                    onChange={(e) => updateField("salary_max", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="qualification">
                    Qualification
                  </label>
                  <input
                    id="qualification"
                    className="input"
                    value={form.qualification}
                    onChange={(e) => updateField("qualification", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="experience_required">
                    Experience Required (years)
                  </label>
                  <input
                    id="experience_required"
                    type="number"
                    className="input"
                    value={form.experience_required}
                    onChange={(e) => updateField("experience_required", e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label" htmlFor="skills">
                    Skills (comma-separated)
                  </label>
                  <input
                    id="skills"
                    className="input"
                    value={form.skills}
                    onChange={(e) => updateField("skills", e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="input min-h-[120px]"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="apply_link">
                    Apply Link
                  </label>
                  <input
                    id="apply_link"
                    type="url"
                    className="input"
                    value={form.apply_link}
                    onChange={(e) => updateField("apply_link", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="application_deadline">
                    Application Deadline
                  </label>
                  <input
                    id="application_deadline"
                    type="date"
                    className="input"
                    value={form.application_deadline}
                    onChange={(e) => updateField("application_deadline", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => updateField("is_active", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <label className="label mb-0" htmlFor="is_active">
                    Active listing
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : editingJob ? "Update Job" : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
    </AdminRoute>
  );
}
