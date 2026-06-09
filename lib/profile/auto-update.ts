import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExtractedProfile } from "@/types/ai";

export function buildAutoUpdatePayload(profile: ExtractedProfile): Record<string, unknown> {
  return {
    full_name: profile.full_name?.trim() || null,
    phone: profile.phone?.trim() || null,
    location: profile.location?.trim() || null,
    education: profile.education?.trim() || null,
    degree: profile.degree?.trim() || null,
    skills: profile.skills.length > 0 ? [...profile.skills] : null,
    experience_years: profile.experience_years,
    certifications:
      profile.certifications && profile.certifications.length > 0
        ? [...profile.certifications]
        : null,
    projects: profile.projects?.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export async function autoUpdateProfileFromResume(
  supabase: SupabaseClient,
  userId: string,
  profile: ExtractedProfile,
): Promise<void> {
  const payload = buildAutoUpdatePayload(profile);

  const { error } = await supabase.from("users").update(payload).eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
