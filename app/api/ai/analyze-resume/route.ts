import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromPdf, generateJsonFromText } from "@/lib/ai/gemini";
import { ANALYZE_RESUME_PROMPT } from "@/lib/ai/prompts";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { ResumeAnalysis } from "@/types/ai";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      pdfBase64?: string;
      mimeType?: string;
      resumeText?: string;
    };

    let analysis: ResumeAnalysis;

    if (body.pdfBase64) {
      analysis = await generateJsonFromPdf<ResumeAnalysis>(
        ANALYZE_RESUME_PROMPT,
        body.pdfBase64,
        body.mimeType ?? "application/pdf",
      );
    } else if (body.resumeText) {
      analysis = await generateJsonFromText<ResumeAnalysis>(ANALYZE_RESUME_PROMPT, body.resumeText);
    } else {
      return NextResponse.json(
        { error: "pdfBase64 or resumeText is required." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      analysis: {
        resume_score: Math.min(100, Math.max(0, analysis.resume_score ?? 0)),
        skills_found: analysis.skills_found ?? [],
        strengths: analysis.strengths ?? [],
        weaknesses: analysis.weaknesses ?? [],
        missing_skills: analysis.missing_skills ?? [],
        recommendations: analysis.recommendations ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
