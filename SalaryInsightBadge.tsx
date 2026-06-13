"use client";

import { useState, useEffect } from "react";
import { Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

interface SalaryInsightData {
  min_salary: number;
  max_salary: number;
  median_salary: number;
  currency: "USD" | "INR" | "GBP";
  market_position: "below" | "competitive" | "above";
  insight: string;
}

interface SalaryInsightBadgeProps {
  jobTitle: string;
  location: string;
  experienceYears?: number;
  skills?: string[];
}

function formatCurrency(amount: number, currency: string) {
  if (currency === "INR") {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  } else if (currency === "USD") {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
    return `$${amount.toLocaleString("en-US")}`;
  } else if (currency === "GBP") {
    if (amount >= 1000) return `£${(amount / 1000).toFixed(0)}k`;
    return `£${amount.toLocaleString("en-GB")}`;
  }
  return `${amount} ${currency}`;
}

export default function SalaryInsightBadge({ jobTitle, location, experienceYears, skills }: SalaryInsightBadgeProps) {
  const [data, setData] = useState<SalaryInsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch("/api/ai/salary-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobTitle, location, experienceYears, skills }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.min_salary) {
            setData(json);
          }
        }
      } catch (error) {
        console.error("Failed to fetch salary insight", error);
      } finally {
        setLoading(false);
      }
    };

    if (jobTitle && location) {
      fetchInsight();
    } else {
      setLoading(false);
    }
  }, [jobTitle, location, experienceYears, skills]);

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-900/50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-xs text-[var(--muted-foreground)]">Analyzing market salary...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const marketColors = {
    above: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800",
    competitive: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    below: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
  };

  const MarketIcon = data.market_position === "above" ? TrendingUp : data.market_position === "below" ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <Sparkles size={14} className="text-purple-500" />
            Salary Intelligence
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[var(--foreground)]">
              {formatCurrency(data.min_salary, data.currency)} – {formatCurrency(data.max_salary, data.currency)}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Median: {formatCurrency(data.median_salary, data.currency)} • <span className="italic">AI estimate</span>
          </p>
        </div>
        <div className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${marketColors[data.market_position] || marketColors.competitive}`}>
          <MarketIcon size={14} />
          {data.market_position}
        </div>
      </div>
      {data.insight && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="text-sm text-[var(--foreground)]">{data.insight}</p>
        </div>
      )}
    </div>
  );
}