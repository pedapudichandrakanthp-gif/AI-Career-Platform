import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromPdf } from "@/lib/ai/gemini";
import { ANALYZE_RESUME_PROMPT } from "@/lib/ai/prompts";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { generateAndStoreMatchScoresForUser } from "@/lib/matching/matchScores";
import { autoUpdateProfileFromResume } from "@/lib/profile/auto-update";
import type { ExtractedProfile, ResumeAnalysis } from "@/types/ai";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user || !auth.supabase) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      resumeId?: string;
      pdfBase64?: string;
      mimeType?: string;
      extractedProfile?: ExtractedProfile | null;
    };

    if (body.extractedProfile) {
      await autoUpdateProfileFromResume(auth.supabase, auth.user.id, body.extractedProfile);
    }

    if (body.pdfBase64 && body.resumeId) {
      const analysis = await generateJsonFromPdf<ResumeAnalysis>(
        ANALYZE_RESUME_PROMPT,
        body.pdfBase64,
        body.mimeType ?? "application/pdf",
      );

      await auth.supabase.from("resume_analysis").delete().eq("user_id", auth.user.id);

      await auth.supabase.from("resume_analysis").insert([
        {
          user_id: auth.user.id,
          resume_id: body.resumeId,
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
        },
      ]);
    }

    await generateAndStoreMatchScoresForUser(auth.supabase, auth.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
