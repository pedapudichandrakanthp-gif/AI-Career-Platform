"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isAdmin } from "@/lib/auth/admin";
import { supabase } from "@/lib/supabase";

interface AdminRouteProps {
  readonly children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const admin = await isAdmin(supabase, user.id);

      if (!admin) {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);
      setChecking(false);
    }

    check();
  }, [router]);

  if (checking) {
    return (
      <main className="page-main flex items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">Verifying admin access...</p>
      </main>
    );
  }

  if (!authorized) return null;

  return children;
}
