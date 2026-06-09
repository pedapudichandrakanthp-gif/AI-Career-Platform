"use client";

import { useState } from "react";

import { ArrowRight, Map } from "lucide-react";

import { getAccessToken } from "@/lib/resumes/upload";
import { supabase } from "@/lib/supabase";
import type { CareerRoadmapData } from "@/types/ai";

export default function CareerRoadmapWidget() {
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmapData | null>(null);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!targetRole.trim()) {
      setError("Enter a target role.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken(supabase);

      const response = await fetch("/api/career-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ target_role: targetRole }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate roadmap.");
      }

      const data = (await response.json()) as { roadmap: CareerRoadmapData };
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="widget-card">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/25">
          <Map size={22} />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Career Roadmap</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            AI-generated path from your skills to your dream role
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input flex-1"
          placeholder="e.g. Senior Java Developer"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
        <button type="button" onClick={generate} disabled={loading} className="btn-primary shrink-0">
          {loading ? "Generating..." : "Generate Roadmap"}
        </button>
      </div>

      {error ? <p className="alert-error mt-4">{error}</p> : null}

      {roadmap ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
            <span className="badge-blue">Current Skills</span>
            <ArrowRight size={16} />
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              {roadmap.target_role}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <RoadmapSection title="Recommended Skills" items={roadmap.recommended_skills} color="blue" />
            <RoadmapSection title="Courses" items={roadmap.courses} color="green" />
            <RoadmapSection title="Certifications" items={roadmap.certifications} color="purple" />
            <RoadmapSection title="Milestones" items={roadmap.milestones} color="orange" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RoadmapSection({
  title,
  items,
  color,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      <h3 className="card-title text-base">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-1 text-xs font-medium ${colors[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
