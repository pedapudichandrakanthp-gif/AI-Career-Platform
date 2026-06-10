import { NextRequest, NextResponse } from "next/server";

import { extractPdfText, generateJsonFromPdf } from "@/lib/ai/groq";
import { EXTRACT_PROFILE_PROMPT } from "@/lib/ai/prompts";
import { aiErrorResponse } from "@/lib/ai/route-handler";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { ExtractedProfile } from "@/types/ai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { pdfBase64?: string; mimeType?: string };

    if (!body.pdfBase64) {
      return NextResponse.json({ error: "pdfBase64 is required." }, { status: 400 });
    }

    const [profile, resumeText] = await Promise.all([
      generateJsonFromPdf<ExtractedProfile>(
        EXTRACT_PROFILE_PROMPT,
        body.pdfBase64,
      ),
      extractPdfText(body.pdfBase64),
    ]);

    return NextResponse.json({
      profile: {
        full_name: profile.full_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        skills: profile.skills ?? [],
        education: profile.education ?? "",
        degree: profile.degree ?? "",
        experience: profile.experience ?? "",
        experience_years: profile.experience_years ?? null,
        certifications: profile.certifications ?? [],
        projects: profile.projects ?? "",
      },
      resumeText,
    });
  } catch (error) {
    return aiErrorResponse("extract-profile", error);
  }
}
