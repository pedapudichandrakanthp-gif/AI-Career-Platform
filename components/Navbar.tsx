"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ChevronDown, FileText, LogOut, Menu, User, X } from "lucide-react";

import { supabase } from "@/lib/supabase";

import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/saved-jobs", label: "Saved Jobs" },
] as const;

const profileMenuItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/resumes", label: "Resume", icon: FileText },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  const linkClass = (href: string) => {
    const active = isActiveRoute(pathname, href);

    return `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/login");
  };

  const isProfileSectionActive =
    pathname === "/profile" || pathname === "/resumes" || pathname.startsWith("/onboarding");

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/80"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold text-slate-900 dark:text-white sm:text-xl"
        >
          AI Career Platform
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <ProfileMenu />
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
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
          className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden"
        >
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block ${linkClass(item.href)}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <ThemeToggle />
          </div>

          <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
              aria-expanded={mobileProfileOpen}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium ${
                isProfileSectionActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <User size={18} aria-hidden="true" />
                Profile
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${mobileProfileOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {mobileProfileOpen ? (
              <div className="mt-1 space-y-1 pl-4">
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileProfileOpen(false);
                      }}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                        active
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
