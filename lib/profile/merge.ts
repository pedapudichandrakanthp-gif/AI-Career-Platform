import type { ExtractedProfile } from "@/types/ai";
import type { UserProfileRow } from "@/types/database";

export function mergeExtractedProfile(
  existing: UserProfileRow | null,
  extracted: ExtractedProfile,
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  if (!existing?.full_name?.trim() && extracted.full_name?.trim()) {
    merged.full_name = extracted.full_name.trim();
  }

  if (!existing?.phone?.trim() && extracted.phone?.trim()) {
    merged.phone = extracted.phone.trim();
  }

  if (!existing?.location?.trim() && extracted.location?.trim()) {
    merged.location = extracted.location.trim();
  }

  if (!existing?.education?.trim() && extracted.education?.trim()) {
    merged.education = extracted.education.trim();
  }

  if (!existing?.degree?.trim() && extracted.degree?.trim()) {
    merged.degree = extracted.degree.trim();
  }

  if ((!existing?.skills || existing.skills.length === 0) && extracted.skills.length > 0) {
    merged.skills = [...extracted.skills];
  }

  if (
    (existing?.experience_years == null || existing.experience_years === 0) &&
    extracted.experience_years != null
  ) {
    merged.experience_years = extracted.experience_years;
  }

  if ((!existing?.certifications || existing.certifications.length === 0) && extracted.certifications?.length) {
    merged.certifications = [...extracted.certifications];
  }

  if (!existing?.projects?.trim() && extracted.projects?.trim()) {
    merged.projects = extracted.projects.trim();
  }

  merged.updated_at = new Date().toISOString();

  return merged;
}

export function buildProfileFromExtracted(extracted: ExtractedProfile): Record<string, unknown> {
  return {
    full_name: extracted.full_name?.trim() || null,
    phone: extracted.phone?.trim() || null,
    location: extracted.location?.trim() || null,
    education: extracted.education?.trim() || null,
    degree: extracted.degree?.trim() || null,
    skills: extracted.skills.length > 0 ? [...extracted.skills] : null,
    experience_years: extracted.experience_years,
    certifications: extracted.certifications?.length ? [...extracted.certifications] : null,
    projects: extracted.projects?.trim() || null,
    updated_at: new Date().toISOString(),
  };
}
