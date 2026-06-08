"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Invalid credentials");
      setLoading(false);
      return;
    }

    alert("Login Successful");
    router.push("/dashboard");
  };

  return (
    <main className="page-main flex items-center justify-center">
      <div className="card w-full max-w-md space-y-4">
        <h1 className="section-title">Login</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sign in to access your career dashboard.
        </p>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
