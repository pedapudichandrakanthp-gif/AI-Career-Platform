"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Recommendation {
  id: string;
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendation: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    category: string;
    job_type: string;
  };
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from("match_scores")
        .select(`
          id,
          match_percentage,
          matching_skills,
          missing_skills,
          recommendation,
          jobs (
            id,
            title,
            company_name,
            location,
            category,
            job_type
          )
        `)
        .order("match_percentage", { ascending: false });

      if (error) throw error;

      setRecommendations((data as Recommendation[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-10 text-white">
        Loading recommendations...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        Recommended Jobs
      </h1>

      {recommendations.length === 0 ? (
        <div className="bg-slate-900 p-6 rounded-lg">
          No recommendations available.
          Generate match scores first.
        </div>
      ) : (
        <div className="grid gap-6">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {item.jobs?.title}
                  </h2>

                  <p className="text-gray-400">
                    {item.jobs?.company_name}
                  </p>

                  <p className="text-gray-500">
                    {item.jobs?.location}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">
                    {item.match_percentage}%
                  </div>

                  <div className="text-sm text-gray-400">
                    Match Score
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-green-400 mb-2">
                  Matching Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {item.matching_skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-red-400 mb-2">
                  Missing Skills
                </h3>

                <div className="flex flex-wrap gap-2">
                  {item.missing_skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-red-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">
                  Recommendation
                </h3>

                <p className="text-gray-300">
                  {item.recommendation}
                </p>
              </div>

              <Link
                href={`/jobs/${item.jobs?.id}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                View Job
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}