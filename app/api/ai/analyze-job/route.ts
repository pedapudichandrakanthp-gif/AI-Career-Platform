import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromText } from "@/lib/ai/gemini";
import { ANALYZE_JOB_PROMPT } from "@/lib/ai/prompts";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { JobAnalysis } from "@/types/ai";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      skills?: string[];
      qualification?: string;
      experience_required?: number | null;
    };

    const jobContent = [
      body.title ? `Title: ${body.title}` : "",
      body.qualification ? `Qualification: ${body.qualification}` : "",
      body.experience_required != null ? `Experience Required: ${body.experience_required} years` : "",
      body.skills?.length ? `Skills: ${body.skills.join(", ")}` : "",
      body.description ? `Description:\n${body.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (!jobContent.trim()) {
      return NextResponse.json({ error: "Job content is required." }, { status: 400 });
    }

    const analysis = await generateJsonFromText<JobAnalysis>(ANALYZE_JOB_PROMPT, jobContent);

    return NextResponse.json({
      analysis: {
        required_skills: analysis.required_skills ?? [],
        important_keywords: analysis.important_keywords ?? [],
        difficulty_level: analysis.difficulty_level ?? "Mid",
        preparation_tips: analysis.preparation_tips ?? [],
        interview_topics: analysis.interview_topics ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze job.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
