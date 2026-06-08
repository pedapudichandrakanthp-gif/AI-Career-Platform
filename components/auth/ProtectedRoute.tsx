"use client";

import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  readonly children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!currentSession) {
        router.replace("/login");
        return;
      }

      setSession(currentSession);
      setIsCheckingSession(false);
    };

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!currentSession) {
        setSession(null);
        router.replace("/login");
        return;
      }

      setSession(currentSession);
      setIsCheckingSession(false);
    });

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isCheckingSession || !session) {
    return (
      <main className="page-main flex items-center justify-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">Checking your session...</p>
      </main>
    );
  }

  return children;
}
