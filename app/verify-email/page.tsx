"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      setMessage("No email found. Please try logging in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Verification email sent! Please check your inbox.");
    setLoading(false);
    setCanResend(false);
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Verify your email</h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
            </p>
          </div>

          {message && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${
              message.includes("sent") 
                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : canResend ? "Resend verification email" : `Resend in ${countdown}s`}
          </button>

          <div className="mt-6 text-center text-sm">
            <p className="text-[var(--muted-foreground)]">
              Already verified?{" "}
              <button
                onClick={() => router.push("/dashboard")}
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Go to dashboard
              </button>
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
            <p>Didn't receive the email? Check your spam folder or request a new link above.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
