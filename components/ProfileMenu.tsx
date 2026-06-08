"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ChevronDown, FileText, LogOut, User } from "lucide-react";

import { supabase } from "@/lib/supabase";

const menuItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/resumes", label: "Resume", icon: FileText },
] as const;

interface ProfileMenuProps {
  readonly onNavigate?: () => void;
}

export default function ProfileMenu({ onNavigate }: ProfileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isProfileSectionActive =
    pathname === "/profile" || pathname === "/resumes" || pathname.startsWith("/onboarding");

  const handleLogout = async () => {
    setOpen(false);
    onNavigate?.();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleItemClick = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="profile-menu"
        className={`btn-secondary gap-2 ${
          isProfileSectionActive ? "border-blue-500 ring-2 ring-blue-500/20" : ""
        }`}
      >
        <User size={18} aria-hidden="true" />
        Profile
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id="profile-menu"
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {menuItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={handleItemClick}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 border-t border-slate-200 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
