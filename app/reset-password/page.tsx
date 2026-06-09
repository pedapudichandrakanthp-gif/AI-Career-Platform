"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
  }, []);

  const handleSubmit = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password for your AvsarGrid account.">
      {success ? (
        <div className="alert-success">Password updated. Redirecting to sign in...</div>
      ) : !ready ? (
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Loading reset session... If this persists, request a new reset link.
          </p>
          <Link href="/forgot-password" className="btn-secondary mt-4 inline-flex">
            Request New Link
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {error ? <div className="alert-error">{error}</div> : null}

          <div>
            <label className="label" htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}
    </AuthShell>
  );
}
