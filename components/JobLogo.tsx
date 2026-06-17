"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface JobLogoProps {
  companyName: string;
  size?: "sm" | "md";
}

export default function JobLogo({ companyName, size = "md" }: JobLogoProps) {
  const [error, setError] = useState(false);

  // Extract company domain: lowercase, strip spaces, add .com if missing
  const rawDomain = companyName.toLowerCase().replace(/\s+/g, "");
  const companyDomain = rawDomain.includes(".") ? rawDomain : `${rawDomain}.com`;

  const containerClasses = size === "md" 
    ? "h-14 w-14 rounded-2xl" 
    : "h-12 w-12 rounded-xl";
  
  return (
    <div className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden ${containerClasses}`}>
      {!error && companyName ? (
        <Image
          src={`https://logo.clearbit.com/${companyDomain}`}
          alt={companyName}
          width={32}
          height={32}
          className="rounded-md object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
          <span className="text-xl font-bold">{companyName?.charAt(0).toUpperCase() || <Building2 size={24} />}</span>
        </div>
      )}
    </div>
  );
}