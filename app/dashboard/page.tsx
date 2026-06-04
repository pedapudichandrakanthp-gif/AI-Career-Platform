"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setEmail(session.user.email || "");
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-4">
        Welcome {email}
      </p>

      <button
        onClick={handleLogout}
        className="mt-6 rounded bg-red-600 px-4 py-2 text-white"
      >
        Logout
      </button>
    </main>
  );
}