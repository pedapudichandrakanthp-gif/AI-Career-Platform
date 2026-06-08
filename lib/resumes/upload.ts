import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExtractedProfile } from "@/types/ai";
import type { ResumeRow } from "@/types/database";

export interface UploadResumeOptions {
  readonly file: File;
  readonly userId: string;
  readonly accessToken: string;
  readonly replaceExisting?: boolean;
  readonly isFirstUpload?: boolean;
}

export interface UploadResumeResult {
  readonly resume: ResumeRow;
  readonly extractedProfile: ExtractedProfile | null;
  readonly isFirstUpload: boolean;
}

import { fileToBase64 } from "@/lib/resumes/fileUtils";

export async function uploadAndProcessResume(
  supabase: SupabaseClient,
  options: UploadResumeOptions,
): Promise<UploadResumeResult> {
  const { file, userId, accessToken, replaceExisting = false } = options;

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

  const { error: uploadError } = await supabase.storage.from("resumes").upload(fileName, file, {
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage.from("resumes").getPublicUrl(fileName);

  let extractedProfile: ExtractedProfile | null = null;
  let extractedText = "";
  let extractedSkills: string[] = [];
  let extractedEducation = "";
  let extractedExperience = "";

  try {
    const base64 = await fileToBase64(file);
    const mimeType = file.type || "application/pdf";

    const extractResponse = await fetch("/api/ai/extract-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ pdfBase64: base64, mimeType }),
    });

    if (extractResponse.ok) {
      const data = (await extractResponse.json()) as {
        profile: ExtractedProfile;
        extracted_text?: string;
      };
      extractedProfile = data.profile;
      extractedText = data.extracted_text ?? "";
      extractedSkills = [...(data.profile.skills ?? [])];
      extractedEducation = data.profile.education ?? "";
      extractedExperience = data.profile.experience ?? "";
    }
  } catch {
    // AI extraction is best-effort; resume upload still succeeds
  }

  const { data: resume, error: dbError } = await supabase
    .from("resumes")
    .insert([
      {
        user_id: userId,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        extracted_text: extractedText || null,
        extracted_skills: extractedSkills.length > 0 ? extractedSkills : null,
        extracted_education: extractedEducation || null,
        extracted_experience: extractedExperience || null,
      },
    ])
    .select("*")
    .single();

  if (dbError) {
    throw new Error(dbError.message);
  }

  return {
    resume: resume as ResumeRow,
    extractedProfile,
    isFirstUpload,
  };
}

export async function refreshUserDataAfterResumeUpdate(accessToken: string): Promise<void> {
  await fetch("/api/match-scores/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getAccessToken(supabase: SupabaseClient): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated.");
  }

  return session.access_token;
}
