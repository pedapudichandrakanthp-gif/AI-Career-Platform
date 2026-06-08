"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: email,
          full_name: fullName,
        },
      ]);

      if (insertError) {
        console.error(insertError);
        alert(insertError.message);
        setLoading(false);
        return;
      }
    }

    alert("Registration Successful");
    router.push("/login");
  };

  return (
    <main className="page-main flex items-center justify-center">
      <div className="card w-full max-w-md space-y-4">
        <h1 className="section-title">Create Account</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Start your AI-powered job search today.
        </p>

        <div>
          <label className="label" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            className="input"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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
          onClick={handleRegister}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
