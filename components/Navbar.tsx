"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { Session } from "@supabase/supabase-js";
import { Menu, Sparkles, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";

const guestNavItems = [
  { href: "/jobs", label: "Exams" },
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Get Started" },
] as const;

const authenticatedNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Exams" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/saved-jobs", label: "Saved Exams" },
  { href: "/profile", label: "Profile" },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Supabase Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on outside click and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  const isAuthenticated = !!session;

  const navItems = isAuthenticated ? authenticatedNavItems : guestNavItems;

  const linkClass = (href: string) => {
    const active = isActiveRoute(pathname, href);

    return `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
        : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
    }`;
  };

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div className="hidden sm:block">
            <span className="font-display text-lg font-bold tracking-tight">AvsarGrid</span>
            <p className="text-[10px] font-medium leading-none text-blue-600 dark:text-blue-400">
              Government Exam Intelligence
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {!isLoading &&
            navItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))
          }
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!isLoading && isAuthenticated && <ProfileMenu />}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--surface)] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav-menu"
          className="border-t border-[var(--border)] bg-[var(--background)] md:hidden"
        >
          <div className="space-y-1 px-4 py-3">
            {!isLoading &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block ${linkClass(item.href)}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))
            }
          </div>

          <div className="border-t border-[var(--border)] px-4 py-3">
            <div className="mb-3 flex items-center justify-between">
              <ThemeToggle />
            </div>
            {!isLoading && isAuthenticated && (
              <ProfileMenu onNavigate={() => setMobileOpen(false)} />
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
