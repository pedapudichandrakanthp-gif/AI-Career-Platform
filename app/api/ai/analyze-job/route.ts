import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromText } from "@/lib/ai/groq";
import { ANALYZE_JOB_PROMPT } from "@/lib/ai/prompts";
import { aiErrorResponse } from "@/lib/ai/route-handler";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { JobAnalysis } from "@/types/ai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user || !auth.supabase) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      jobId?: string;
      title?: string;
      description?: string;
      skills?: string[];
      qualification?: string;
      experience_required?: number | null;
    };

    const { data: resume } = await auth.supabase
      .from("resumes")
      .select("extracted_text, extracted_skills")
      .eq("user_id", auth.user.id)
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const jobContent = [
      body.title ? `Title: ${body.title}` : "",
      body.qualification ? `Qualification: ${body.qualification}` : "",
      body.experience_required != null ? `Experience Required: ${body.experience_required} years` : "",
      body.skills?.length ? `Skills: ${body.skills.join(", ")}` : "",
      body.description ? `Description:\n${body.description}` : "",
      resume?.extracted_text ? `\nCandidate Resume:\n${resume.extracted_text}` : "",
      resume?.extracted_skills?.length
        ? `\nCandidate Skills: ${resume.extracted_skills.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!jobContent.trim()) {
      return NextResponse.json({ error: "Job content is required." }, { status: 400 });
    }

    const analysis = await generateJsonFromText<JobAnalysis>(ANALYZE_JOB_PROMPT, jobContent);

    const result = {
      required_skills: analysis.required_skills ?? [],
      preferred_skills: analysis.preferred_skills ?? [],
      experience_needed: analysis.experience_needed ?? "",
      responsibilities: analysis.responsibilities ?? [],
      important_keywords: analysis.important_keywords ?? [],
      difficulty_level: analysis.difficulty_level ?? "Mid",
      preparation_tips: analysis.preparation_tips ?? [],
      interview_topics: analysis.interview_topics ?? [],
      match_score: Math.min(100, Math.max(0, analysis.match_score ?? 0)),
      missing_skills: analysis.missing_skills ?? [],
    };

    if (body.jobId) {
      await auth.supabase.from("job_analysis").upsert(
        [
          {
            user_id: auth.user.id,
            job_id: body.jobId,
            required_skills: [...result.required_skills],
            preferred_skills: [...result.preferred_skills],
            experience_needed: result.experience_needed,
            responsibilities: [...result.responsibilities],
            match_score: result.match_score,
            missing_skills: [...result.missing_skills],
            analysis_data: result,
          },
        ],
        { onConflict: "user_id,job_id" },
      );
    }

    return NextResponse.json({ analysis: result });
  } catch (error) {
    return aiErrorResponse("analyze-job", error);
  }
}
