import type { ExtractedProfile } from "@/types/ai";

export interface ResumeExtractedFields {
  readonly extracted_text: string | null;
  readonly extracted_skills: string[] | null;
  readonly extracted_education: string | null;
  readonly extracted_experience: string | null;
}

export function buildResumeExtractedFields(
  profile: ExtractedProfile,
  pdfText?: string,
): ResumeExtractedFields {
  const structuredText = [
    profile.full_name ? `Name: ${profile.full_name}` : "",
    profile.email ? `Email: ${profile.email}` : "",
    profile.phone ? `Phone: ${profile.phone}` : "",
    profile.location ? `Location: ${profile.location}` : "",
    profile.degree ? `Degree: ${profile.degree}` : "",
    profile.education ? `Education: ${profile.education}` : "",
    profile.experience ? `Experience: ${profile.experience}` : "",
    profile.projects ? `Projects: ${profile.projects}` : "",
    profile.skills.length > 0 ? `Skills: ${profile.skills.join(", ")}` : "",
    profile.certifications.length > 0
      ? `Certifications: ${profile.certifications.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const extractedText = (pdfText?.trim() || structuredText || "").trim() || null;

  return {
    extracted_text: extractedText,
    extracted_skills: profile.skills.length > 0 ? [...profile.skills] : null,
    extracted_education: profile.education?.trim() || profile.degree?.trim() || null,
    extracted_experience: profile.experience?.trim() || null,
  };
}
