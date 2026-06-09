"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Clock,
  Eye,
  FileText,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ResumeAnalysisCard from "@/components/dashboard/ResumeAnalysisCard";
import { getScoreColor } from "@/components/dashboard/DashboardStats";
import { useResumeUpdated } from "@/hooks/useResumeUpdated";
import { urlToBase64 } from "@/lib/resumes/fileUtils";
import { getAccessToken, uploadAndProcessResume } from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { ResumeAnalysis } from "@/types/ai";
import type { ResumeAnalysisRow, ResumeRow } from "@/types/database";

export default function ResumePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<ResumeRow[]>([]);
  const [latestResume, setLatestResume] = useState<ResumeRow | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysisRow | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const loadResumeData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPageLoading(false);
      return;
    }

    const [resumesRes, analysisRes] = await Promise.all([
      supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("resume_analysis")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const resumes = (resumesRes.data ?? []) as ResumeRow[];
    setUploadHistory(resumes);
    setLatestResume(resumes[0] ?? null);
    setResumeAnalysis(analysisRes.data as ResumeAnalysisRow | null);
    setPageLoading(false);
  }, []);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  useResumeUpdated(() => {
    loadResumeData();
  });

  const atsScore = resumeAnalysis?.ats_score ?? 0;
  const resumeStrength = resumeAnalysis?.resume_strength ?? 0;
  const healthScore = resumeAnalysis ? Math.round((atsScore + resumeStrength) / 2) : 0;

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

  const handleAnalyze = async () => {
    if (!latestResume) return;

    setAnalyzing(true);
    setError("");

    try {
      const accessToken = await getAccessToken(supabase);
      let body: Record<string, string>;

      if (latestResume.extracted_text) {
        body = { resumeText: latestResume.extracted_text, resumeId: latestResume.id };
      } else if (latestResume.file_url) {
        const { base64, mimeType } = await urlToBase64(latestResume.file_url);
        body = { pdfBase64: base64, mimeType, resumeId: latestResume.id };
      } else {
        throw new Error("Resume file not available.");
      }

      const response = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Analysis failed.");
      }

      const data = (await response.json()) as { analysis: ResumeAnalysis };
      setAnalysisResult(data.analysis);
      setMessage("Resume analysis complete.");
      await loadResumeData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
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
              Upload, analyze, and optimize your resume with AvsarGrid AI.
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
              {/* Scores row */}
              {resumeAnalysis ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="widget-card text-center">
                    <p className="stat-label">Resume Health</p>
                    <p className={`stat-value mt-2 ${getScoreColor(healthScore)}`}>{healthScore}%</p>
                  </div>
                  <div className="widget-card text-center">
                    <p className="stat-label">ATS Score</p>
                    <p className={`stat-value mt-2 ${getScoreColor(atsScore)}`}>{atsScore}%</p>
                  </div>
                  <div className="widget-card text-center">
                    <p className="stat-label">Resume Strength</p>
                    <p className={`stat-value mt-2 ${getScoreColor(resumeStrength)}`}>{resumeStrength}%</p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Drag & Drop */}
                <div className="section-card">
                  <h2 className="font-display text-lg font-semibold">Upload Resume</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    PDF only. AI extraction runs automatically on upload.
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
                    {loading ? "Processing with AI..." : "Upload & Process"}
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
                        <button
                          type="button"
                          onClick={handleAnalyze}
                          disabled={analyzing}
                          className="btn-primary col-span-2 text-sm"
                        >
                          <Sparkles size={16} />
                          {analyzing ? "Analyzing..." : "Analyze Resume"}
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

              {analysisResult ? (
                <ResumeAnalysisCard analysis={analysisResult} onClose={() => setAnalysisResult(null)} />
              ) : null}

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
