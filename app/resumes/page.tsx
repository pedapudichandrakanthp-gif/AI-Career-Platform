"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Clock,
  Eye,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useResumeUpdated } from "@/hooks/useResumeUpdated";
import { getAccessToken, uploadAndProcessResume } from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { ResumeRow } from "@/types/database";

export default function ResumePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<ResumeRow[]>([]);
  const [latestResume, setLatestResume] = useState<ResumeRow | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const loadResumeData = useCallback(async () => {
    setPageLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPageLoading(false);
      return;
    }

    const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

    if(error) {
        setError(error.message);
    }

    const resumes = (data ?? []) as ResumeRow[];
    setUploadHistory(resumes);
    setLatestResume(resumes[0] ?? null);
    setPageLoading(false);
  }, []);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  useResumeUpdated(() => {
    loadResumeData();
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const processUpload = async (uploadFile: File, replaceExisting: boolean) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const accessToken = await getAccessToken(supabase);

      await uploadAndProcessResume(supabase, {
        file: uploadFile,
        userId: user.id,
        accessToken,
        replaceExisting,
      });

      setMessage("Resume processed. Profile and recommendations updated automatically.");
      setFile(null);
      await loadResumeData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Select a PDF file first.");
      return;
    }
    await processUpload(file, uploadHistory.length > 0);
  };

  const handleUpdateResume = () => fileInputRef.current?.click();

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    await processUpload(selected, true);
  };

  const handleViewResume = () => {
    if (latestResume?.file_url) window.open(latestResume.file_url, "_blank");
  };

  return (
    <ProtectedRoute>
      <main className="page-main">
        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />

        <section className="page-container max-w-5xl">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Resume Center</p>
            <h1 className="page-title mt-1">Your Resume</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Upload your resume here. It will be automatically processed to extract key information.
            </p>
          </div>

          {message ? <div className="alert-success mt-6">{message}</div> : null}
          {error ? <div className="alert-error mt-6">{error}</div> : null}

          {pageLoading ? (
            <div className="mt-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Drag & Drop */}
                <div className="section-card">
                  <h2 className="font-display text-lg font-semibold">Upload Resume</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    PDF only. Re-uploading will replace your existing resume.
                  </p>

                  <div
                    className={`drop-zone mt-4 cursor-pointer ${dragActive ? "drop-zone-active" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  >
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white shadow-lg shadow-blue-500/25">
                      <Upload size={28} />
                    </div>
                    <p className="mt-4 font-medium">Drag & drop your resume here</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">or click to browse</p>
                    {file ? (
                      <p className="mt-3 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {file.name}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="btn-primary mt-4 w-full"
                  >
                    {loading ? "Processing..." : "Upload & Process"}
                  </button>
                </div>

                {/* Preview & Actions */}
                <div className="section-card">
                  <h2 className="font-display text-lg font-semibold">Resume Preview</h2>

                  {latestResume ? (
                    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-red-100 p-3 dark:bg-red-950/50">
                          <FileText size={24} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{latestResume.file_name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Uploaded{" "}
                            {latestResume.uploaded_at
                              ? new Date(latestResume.uploaded_at).toLocaleString()
                              : "—"}
                          </p>
                          {latestResume.extracted_skills && latestResume.extracted_skills.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {latestResume.extracted_skills.slice(0, 5).map((s) => (
                                <span key={s} className="badge-blue text-[10px]">{s}</span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button type="button" onClick={handleViewResume} className="btn-secondary text-sm">
                          <Eye size={16} />
                          View
                        </button>
                        <button type="button" onClick={handleUpdateResume} disabled={loading} className="btn-secondary text-sm">
                          <RefreshCw size={16} />
                          Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
                      <FileText size={40} className="text-[var(--muted-foreground)]" />
                      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                        No resume uploaded yet
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload History */}
              {uploadHistory.length > 0 ? (
                <div className="section-card">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-[var(--muted-foreground)]" />
                    <h2 className="font-display text-lg font-semibold">Upload History</h2>
                  </div>
                  <div className="mt-4 divide-y divide-[var(--border)]">
                    {uploadHistory.map((resume, index) => (
                      <div key={resume.id} className="flex items-center justify-between py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-[var(--muted-foreground)]" />
                          <div>
                            <p className="font-medium">{resume.file_name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {resume.uploaded_at
                                ? new Date(resume.uploaded_at).toLocaleString()
                                : "—"}
                            </p>
                          </div>
                        </div>
                        {index === 0 ? (
                          <span className="badge-match">Current</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
