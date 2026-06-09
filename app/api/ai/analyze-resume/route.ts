import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromPdf, generateJsonFromText } from "@/lib/ai/gemini";
import { ANALYZE_RESUME_PROMPT } from "@/lib/ai/prompts";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { ResumeAnalysis } from "@/types/ai";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user || !auth.supabase) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      pdfBase64?: string;
      mimeType?: string;
      resumeText?: string;
      resumeId?: string;
      store?: boolean;
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
      return NextResponse.json({ error: "pdfBase64 or resumeText is required." }, { status: 400 });
    }

    const result = {
      ats_score: Math.min(100, Math.max(0, analysis.ats_score ?? 0)),
      resume_strength: Math.min(100, Math.max(0, analysis.resume_strength ?? 0)),
      skills_found: analysis.skills_found ?? [],
      missing_skills: analysis.missing_skills ?? [],
      missing_keywords: analysis.missing_keywords ?? [],
      strengths: analysis.strengths ?? [],
      weaknesses: analysis.weaknesses ?? [],
      suggestions: analysis.suggestions ?? [],
      recommended_certifications: analysis.recommended_certifications ?? [],
      recommended_skills: analysis.recommended_skills ?? [],
    };

    if (body.store !== false) {
      await auth.supabase.from("resume_analysis").delete().eq("user_id", auth.user.id);

      await auth.supabase.from("resume_analysis").insert([
        {
          user_id: auth.user.id,
          resume_id: body.resumeId ?? null,
          ...result,
        },
      ]);
    }

    return NextResponse.json({ analysis: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
