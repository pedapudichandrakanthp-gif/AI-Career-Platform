"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { AdminRoute } from "@/components/auth/AdminRoute";
import { getAccessToken } from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { JobImportLogRow } from "@/types/database";

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalResumes: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalJobs: 0, totalResumes: 0 });
  const [logs, setLogs] = useState<JobImportLogRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    // job_import_logs table does not exist in production
    const [users, jobs, resumes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("resumes").select("id", { count: "exact", head: true }),
      // supabase.from("job_import_logs").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    setStats({
      totalUsers: users.count ?? 0,
      totalJobs: jobs.count ?? 0,
      totalResumes: resumes.count ?? 0,
    });
    setLogs([]); // No logs available - table doesn't exist
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const runRemotiveImport = async () => {
    setImporting(true);
    setError("");
    setMessage("");

    try {
      const accessToken = await getAccessToken(supabase);

      const response = await fetch("/api/jobs/import-remotive", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Import failed.");
      }

      const result = (await response.json()) as {
        fetched: number;
        inserted: number;
        duplicated: number;
      };

      setMessage(
        `Import complete: ${result.inserted} inserted, ${result.duplicated} duplicates, ${result.fetched} fetched.`,
      );
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminRoute>
      <main className="page-main">
        <section className="page-container">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">Platform overview and management.</p>

          {message ? <div className="alert-success mt-6">{message}</div> : null}
          {error ? <div className="alert-error mt-6">{error}</div> : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <span className="stat-label">Total Users</span>
              <p className="stat-value mt-2">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Jobs</span>
              <p className="stat-value mt-2">{stats.totalJobs}</p>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Resumes</span>
              <p className="stat-value mt-2">{stats.totalResumes}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin/jobs" className="btn-primary">
              Exam Management
            </Link>
            <Link href="/admin/import-jobs" className="btn-secondary">
              AI Exam Import
            </Link>
            <button
              type="button"
              onClick={runRemotiveImport}
              disabled={importing}
              className="btn-success"
            >
              {importing ? "Importing..." : "Import from Remotive API"}
            </button>
          </div>

          <div className="card mt-8">
            <h2 className="section-title">Import Logs</h2>
            {logs.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">No import logs yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                      <th className="py-2 pr-4">Source</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Fetched</th>
                      <th className="py-2 pr-4">Inserted</th>
                      <th className="py-2">Duplicates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-4">{log.source}</td>
                        <td className="py-2 pr-4">{log.status}</td>
                        <td className="py-2 pr-4">{log.jobs_fetched}</td>
                        <td className="py-2 pr-4">{log.jobs_inserted}</td>
                        <td className="py-2">{log.jobs_duplicated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </AdminRoute>
  );
}
