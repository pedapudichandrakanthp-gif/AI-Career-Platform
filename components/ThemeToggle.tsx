"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-10 w-[7.5rem] rounded-lg border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
        aria-hidden="true"
      />
    );
  }

  return (
    <div>
      <label className="sr-only" htmlFor="theme-select">
        Theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="input w-auto min-w-[7.5rem] cursor-pointer py-2 text-sm"
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
