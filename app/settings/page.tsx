"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import type { JobAlertRow, SavedSearchRow, UserSettingsRow } from "@/types/database";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettingsRow | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearchRow[]>([]);
  const [jobAlerts, setJobAlerts] = useState<JobAlertRow[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [alertName, setAlertName] = useState("");
  const [alertKeywords, setAlertKeywords] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // user_settings, saved_searches, job_alerts tables do not exist in production
    // const [settingsRes, searchesRes, alertsRes] = await Promise.all([
    //   supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
    //   supabase.from("saved_searches").select("*").eq("user_id", user.id),
    //   supabase.from("job_alerts").select("*").eq("user_id", user.id),
    // ]);

    setSettings(null);
    setSavedSearches([]);
    setJobAlerts([]);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveSettings = async (updates: Partial<UserSettingsRow>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // user_settings table does not exist in production
    // const { error: upsertError } = await supabase.from("user_settings").upsert([
    //   {
    //     user_id: user.id,
    //     ...settings,
    //     ...updates,
    //     updated_at: new Date().toISOString(),
    //   },
    // ]);

    // if (upsertError) {
    //   setError(upsertError.message);
    //   return;
    // }

    setMessage("Settings not saved - user_settings table not available in production.");
    // loadSettings();
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });

    if (pwError) {
      setError(pwError.message);
      return;
    }

    setNewPassword("");
    setMessage("Password updated successfully.");
  };

  const createAlert = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !alertName.trim()) return;

    // job_alerts table does not exist in production
    // const { error: insertError } = await supabase.from("job_alerts").insert([
    //   {
    //     user_id: user.id,
    //     name: alertName,
    //     keywords: alertKeywords,
    //     is_active: true,
    //   },
    // ]);

    // if (insertError) {
    //   setError(insertError.message);
    //   return;
    // }

    setAlertName("");
    setAlertKeywords("");
    setMessage("Job alert not created - job_alerts table not available in production.");
    // loadSettings();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteAlert = async (id: string) => {
    // job_alerts table does not exist in production
    // await supabase.from("job_alerts").delete().eq("id", id);
    // loadSettings();
  };

  return (
    <ProtectedRoute>
      <main className="page-main">
        <section className="page-container max-w-3xl">
          <h1 className="page-title">Settings</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">Manage your account and preferences.</p>

          {message ? <div className="alert-success mt-6">{message}</div> : null}
          {error ? <div className="alert-error mt-6">{error}</div> : null}

          <div className="mt-8 space-y-6">
            {/* Theme */}
            <div className="card">
              <h2 className="section-title">Appearance</h2>
              <div className="mt-4">
                <label className="label" htmlFor="theme">
                  Theme
                </label>
                <select
                  id="theme"
                  className="input"
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    saveSettings({ theme_preference: e.target.value });
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <h2 className="section-title">Notifications</h2>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings?.email_notifications ?? true}
                    onChange={(e) => saveSettings({ email_notifications: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings?.job_alert_notifications ?? true}
                    onChange={(e) => saveSettings({ job_alert_notifications: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Job alert notifications</span>
                </label>
              </div>
            </div>

            {/* Job Alerts */}
            <div className="card">
              <h2 className="section-title">Job Alerts</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  className="input"
                  placeholder="Alert name"
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Keywords (e.g. Java, Remote)"
                  value={alertKeywords}
                  onChange={(e) => setAlertKeywords(e.target.value)}
                />
              </div>
              <button type="button" onClick={createAlert} className="btn-primary mt-3 text-sm">
                Create Alert
              </button>

              {jobAlerts.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {jobAlerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3"
                    >
                      <div>
                        <p className="font-medium">{alert.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{alert.keywords}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteAlert(alert.id)}
                        className="btn-danger px-3 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Saved Searches */}
            {savedSearches.length > 0 ? (
              <div className="card">
                <h2 className="section-title">Saved Searches</h2>
                <ul className="mt-4 space-y-2">
                  {savedSearches.map((search) => (
                    <li
                      key={search.id}
                      className="rounded-xl border border-[var(--border)] p-3 text-sm"
                    >
                      {search.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Password */}
            <div className="card">
              <h2 className="section-title">Change Password</h2>
              <div className="mt-4">
                <label className="label" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="button" onClick={changePassword} className="btn-primary mt-4 text-sm">
                Update Password
              </button>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
