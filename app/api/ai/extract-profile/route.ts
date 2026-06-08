import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromPdf } from "@/lib/ai/gemini";
import { EXTRACT_PROFILE_PROMPT } from "@/lib/ai/prompts";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { ExtractedProfile } from "@/types/ai";

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

    const profile = await generateJsonFromPdf<ExtractedProfile>(
      EXTRACT_PROFILE_PROMPT,
      body.pdfBase64,
      body.mimeType ?? "application/pdf",
    );

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
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
