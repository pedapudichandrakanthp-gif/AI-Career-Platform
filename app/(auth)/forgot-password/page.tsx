"use client";

import Link from "next/link";
import { useState } from "react";

import AuthShell from "@/components/auth/AuthShell";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a secure link to reset your AvsarGrid account."
    >
      {success ? (
        <div className="alert-success">Check your email for a password reset link.</div>
      ) : (
        <div className="space-y-4">
          {error ? <div className="alert-error">{error}</div> : null}

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          Back to Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
