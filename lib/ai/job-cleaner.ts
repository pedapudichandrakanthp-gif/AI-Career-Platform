import { generateJsonFromText } from "@/lib/ai/groq";
import { CLEAN_JOB_PROMPT } from "@/lib/ai/prompts";
import type { CleanedJobData } from "@/types/ai";

export async function cleanJobWithAI(rawContent: string): Promise<CleanedJobData> {
  const cleaned = await generateJsonFromText<CleanedJobData>(CLEAN_JOB_PROMPT, rawContent);

  return {
    clean_title: cleaned.clean_title ?? cleaned.title ?? "",
    title: cleaned.title ?? "",
    company_name: cleaned.company_name ?? "",
    location: cleaned.location ?? "",
    job_type: cleaned.job_type ?? "Full-time",
    work_mode: cleaned.work_mode ?? "Remote",
    category: cleaned.category ?? "General",
    skills: cleaned.skills ?? [],
    experience_required: cleaned.experience_required ?? null,
    qualification: cleaned.qualification ?? "",
    description: cleaned.description ?? "",
    summary: cleaned.summary ?? "",
  };
}

export function buildRawJobContent(job: Record<string, unknown>): string {
  return Object.entries(job)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join("\n");
}
