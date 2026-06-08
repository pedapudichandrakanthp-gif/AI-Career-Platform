import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromText } from "@/lib/ai/gemini";
import { IMPORT_JOB_PROMPT } from "@/lib/ai/prompts";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { ImportedJobData } from "@/types/ai";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { url?: string; description?: string };

    let content = body.description ?? "";

    if (body.url?.trim()) {
      content = `Job URL: ${body.url.trim()}\n\n${content}`.trim();
    }

    if (!content) {
      return NextResponse.json({ error: "URL or job description is required." }, { status: 400 });
    }

    const jobData = await generateJsonFromText<ImportedJobData>(IMPORT_JOB_PROMPT, content);

    return NextResponse.json({
      job: {
        title: jobData.title ?? "",
        company_name: jobData.company_name ?? "",
        location: jobData.location ?? "",
        job_type: jobData.job_type ?? "",
        category: jobData.category ?? "",
        skills: jobData.skills ?? [],
        qualification: jobData.qualification ?? "",
        experience_required: jobData.experience_required ?? null,
        description: jobData.description ?? "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to import job.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
