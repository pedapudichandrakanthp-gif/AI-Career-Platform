"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            id: data.user.id,
            email: email,
            full_name: fullName,
          },
        ]);

      if (insertError) {
        console.error(insertError);
        alert(insertError.message);
        return;
      }
    }

    alert("Registration Successful");
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6">
        <h1 className="text-2xl font-bold">Create Account</h1>

        <input
          className="w-full rounded border p-2"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded border p-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full rounded bg-black p-2 text-white"
        >
          Register
        </button>
      </div>
    </main>
  );
}