"use client";

import { useState } from "react";

import { Sparkles } from "lucide-react";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { supabase } from "@/lib/supabase";
import type { ImportedJobData } from "@/types/ai";

export default function AdminImportJobsPage() {
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState<ImportedJobData | null>(null);

  const handleExtract = async () => {
    if (!jobUrl.trim() && !jobDescription.trim()) {
      setErrorMessage("Please provide a job URL or description.");
      return;
    }

    setExtracting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setPreview(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setErrorMessage("Please login first.");
        return;
      }

      const response = await fetch("/api/ai/import-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url: jobUrl, description: jobDescription }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to extract job data.");
      }

      const data = (await response.json()) as { job: ImportedJobData };
      setPreview(data.job);
      setSuccessMessage("Job data extracted. Review the preview below.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Extraction failed.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data: existing } = await supabase
        .from("jobs")
        .select("id")
        .eq("exam_name", preview.title)
        .eq("conducting_body", preview.company_name)
        .eq("location", preview.location)
        .maybeSingle();

      if (existing) {
        setErrorMessage("A job with this exam name, conducting body, and location already exists.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("jobs").insert([
        {
          exam_name: preview.title || null,
          conducting_body: preview.company_name || null,
          location: preview.location || null,
          job_type: preview.job_type || null,
          category: preview.category || null,
          skills: preview.skills.length > 0 ? [...preview.skills] : null,
          qualification_required: preview.qualification || null,
          experience_required: preview.experience_required,
          description: preview.description || null,
          is_active: true,
          source: "AI Import",
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage("Job saved successfully!");
      setPreview(null);
      setJobUrl("");
      setJobDescription("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save job.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const updatePreview = (field: keyof ImportedJobData, value: string | number | null) => {
    if (!preview) return;
    setPreview({ ...preview, [field]: value });
  };

  return (
    <AdminRoute>
    <main className="page-main">
      <section className="page-container max-w-3xl">
        <h1 className="page-title">Import Job with AI</h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Paste a job URL or description and let AI extract structured job data.
        </p>

        {errorMessage ? <div className="alert-error mt-6">{errorMessage}</div> : null}
        {successMessage ? <div className="alert-success mt-6">{successMessage}</div> : null}

        {!preview ? (
          <div className="card mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="job-url">
                Job URL (optional)
              </label>
              <input
                id="job-url"
                type="url"
                className="input"
                placeholder="https://company.com/careers/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="job-description">
                Job Description
              </label>
              <textarea
                id="job-description"
                className="input min-h-[200px]"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting}
              className="btn-primary gap-2"
            >
              <Sparkles size={18} aria-hidden="true" />
              {extracting ? "Extracting..." : "Extract with AI"}
            </button>
          </div>
        ) : (
          <div className="card mt-6">
            <h2 className="section-title">Preview</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Review and edit extracted data before saving.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="preview-title">
                  Title
                </label>
                <input
                  id="preview-title"
                  className="input"
                  value={preview.title}
                  onChange={(e) => updatePreview("title", e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="preview-company">
                  Company
                </label>
                <input
                  id="preview-company"
                  className="input"
                  value={preview.company_name}
                  onChange={(e) => updatePreview("company_name", e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="preview-location">
                  Location
                </label>
                <input
                  id="preview-location"
                  className="input"
                  value={preview.location}
                  onChange={(e) => updatePreview("location", e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="preview-type">
                  Job Type
                </label>
                <input
                  id="preview-type"
                  className="input"
                  value={preview.job_type}
                  onChange={(e) => updatePreview("job_type", e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="preview-category">
                  Category
                </label>
                <input
                  id="preview-category"
                  className="input"
                  value={preview.category}
                  onChange={(e) => updatePreview("category", e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="preview-qualification">
                  Qualification
                </label>
                <input
                  id="preview-qualification"
                  className="input"
                  value={preview.qualification}
                  onChange={(e) => updatePreview("qualification", e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="preview-experience">
                  Experience Required
                </label>
                <input
                  id="preview-experience"
                  type="number"
                  className="input"
                  value={preview.experience_required ?? ""}
                  onChange={(e) =>
                    updatePreview(
                      "experience_required",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="preview-skills">
                  Skills
                </label>
                <input
                  id="preview-skills"
                  className="input"
                  value={preview.skills.join(", ")}
                  onChange={(e) =>
                    setPreview({
                      ...preview,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="preview-description">
                  Description
                </label>
                <textarea
                  id="preview-description"
                  className="input min-h-[150px]"
                  value={preview.description}
                  onChange={(e) => updatePreview("description", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Job"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
    </AdminRoute>
  );
}
