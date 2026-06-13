import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

import { extractPdfText } from "@/lib/ai/groq";
import { aiErrorResponse } from "@/lib/ai/route-handler";
import { getAuthenticatedUser } from "@/lib/api/auth";

export const runtime = "nodejs";

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

    let resumeText = body.resumeText || "";
    if (body.pdfBase64) {
      resumeText = await extractPdfText(body.pdfBase64);
    }

    if (!resumeText) {
      return NextResponse.json({ error: "pdfBase64 or resumeText is required." }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const prompt = `Analyze this resume. Return ONLY valid JSON, no markdown:
{
  "ats_score": <0-100>,
  "skills": ["skill1","skill2"],
  "experience_years": <number>,
  "strengths": ["strength1"],
  "improvements": ["tip1","tip2"],
  "summary": "brief summary"
}
Resume: ${resumeText}`

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800
    })

    let analysis: Partial<{ ats_score: number; skills: string[]; strengths: string[]; improvements: string[] }>
    try {
      analysis = JSON.parse(completion.choices[0].message.content || '{}')
    } catch (err) {
      console.error("Groq JSON parsing error:", err);
      analysis = { ats_score: 0, skills: [], improvements: ['Unable to parse resume'] }
    }

    const result = {
      ats_score: Math.min(100, Math.max(0, analysis.ats_score ?? 0)),
      resume_strength: Math.min(100, Math.max(0, analysis.ats_score ?? 0)),
      skills_found: analysis.skills ?? [],
      missing_skills: [],
      missing_keywords: [],
      strengths: analysis.strengths ?? [],
      weaknesses: [],
      suggestions: analysis.improvements ?? [],
      recommended_certifications: [],
      recommended_skills: [],
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
    console.error("Resume analysis route error:", error);
    return aiErrorResponse("analyze-resume", error);
  }
}
