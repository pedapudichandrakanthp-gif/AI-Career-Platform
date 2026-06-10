import type { SupabaseClient } from "@supabase/supabase-js";

import { toAiUserMessage } from "@/lib/ai/errors";
import { buildResumeExtractedFields } from "@/lib/ai/resume-fields";
import { dispatchResumeUpdated } from "@/lib/events/resume";
import { fileToBase64 } from "@/lib/resumes/fileUtils";
import type { ExtractedProfile } from "@/types/ai";
import type { ResumeRow } from "@/types/database";

export interface UploadResumeOptions {
  readonly file: File;
  readonly userId: string;
  readonly accessToken: string;
  readonly replaceExisting?: boolean;
}

export interface UploadResumeResult {
  readonly resume: ResumeRow;
  readonly extractedProfile: ExtractedProfile | null;
  readonly isFirstUpload: boolean;
}

export async function uploadAndProcessResume(
  supabase: SupabaseClient,
  options: UploadResumeOptions,
): Promise<UploadResumeResult> {
  const { file, userId, accessToken, replaceExisting = false } = options;

  // Validate file type (PDF only)
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are allowed.");
  }

  // Validate file size (max 5 MB)
  const maxSize = 5 * 1024 * 1024; // 5 MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5 MB limit.");
  }

  const { data: priorResumes } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  const isFirstUpload = !priorResumes || priorResumes.length === 0;

  if (replaceExisting && priorResumes && priorResumes.length > 0) {
    await supabase.from("resumes").delete().eq("user_id", userId);
  }

  const fileName = `${userId}/${Date.now()}-${file.name}`;
  const base64 = await fileToBase64(file);
  const mimeType = file.type || "application/pdf";

  const { error: uploadError } = await supabase.storage.from("resumes").upload(fileName, file, {
    upsert: true,
  });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from("resumes").getPublicUrl(fileName);

  let extractedProfile: ExtractedProfile | null = null;
  let resumeText = "";

  const extractResponse = await fetch("/api/ai/extract-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ pdfBase64: base64, mimeType }),
  });

  if (!extractResponse.ok) {
    throw new Error(toAiUserMessage());
  }

  const extractData = (await extractResponse.json()) as {
    profile: ExtractedProfile;
    resumeText?: string;
  };

  extractedProfile = extractData.profile;
  resumeText = extractData.resumeText ?? "";

  const extractedFields = buildResumeExtractedFields(extractedProfile, resumeText);

  const { data: resume, error: dbError } = await supabase
    .from("resumes")
    .insert([
      {
        user_id: userId,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        extracted_text: extractedFields.extracted_text,
        extracted_skills: extractedFields.extracted_skills,
        extracted_education: extractedFields.extracted_education,
        extracted_experience: extractedFields.extracted_experience,
      },
    ])
    .select("*")
    .single();

  if (dbError) throw new Error(dbError.message);

  const processResponse = await fetch("/api/resume/process-complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      resumeId: resume.id,
      pdfBase64: base64,
      mimeType,
      extractedProfile,
      resumeText,
    }),
  });

  if (!processResponse.ok) {
    throw new Error(toAiUserMessage());
  }

  dispatchResumeUpdated();

  return {
    resume: resume as ResumeRow,
    extractedProfile,
    isFirstUpload,
  };
}

export async function refreshUserDataAfterResumeUpdate(accessToken: string): Promise<void> {
  await fetch("/api/match-scores/generate", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getAccessToken(supabase: SupabaseClient): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) throw new Error("Not authenticated.");

  return session.access_token;
}
