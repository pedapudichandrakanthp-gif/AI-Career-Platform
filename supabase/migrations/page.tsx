"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ApplicationRow {
  id: string;
  company: string;
  title: string;
  status: "applied" | "interview" | "offer" | "rejected";
  applied_at: string;
  notes: string | null;
}

const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  interview: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  offer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false });

      if (!error && data) {
        setApplications(data as ApplicationRow[]);
      }
      setLoading(false);
    }
    fetchApplications();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const status = newStatus as ApplicationRow["status"];
    
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );

    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status", error);
      alert("Failed to update application status.");
    }
  };

  return (
    <main className="page-main">
      <section className="page-container">
        <div className="mb-6">
          <h1 className="page-title">My Applications</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">Track and manage your job applications.</p>
        </div>

        {loading ? (
          <div className="card text-center py-12 text-[var(--muted-foreground)]">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase size={48} className="mx-auto mb-4 text-[var(--muted-foreground)]" />
            <h3 className="text-lg font-semibold">No applications tracked yet.</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Apply to jobs and track them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-[var(--foreground)]">Role</th>
                  <th className="px-4 py-3 font-medium text-[var(--foreground)]">Company</th>
                  <th className="px-4 py-3 font-medium text-[var(--foreground)]">Date</th>
                  <th className="px-4 py-3 font-medium text-[var(--foreground)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {applications.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-4 py-4 font-medium text-[var(--foreground)]">{app.title}</td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)]">{app.company || "—"}</td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)]">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)} className={`input h-8 py-0 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[app.status]}`}>
                        <option value="applied">Applied</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}