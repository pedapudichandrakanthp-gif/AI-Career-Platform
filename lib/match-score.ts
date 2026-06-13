/**
 * Calculates a match score percentage based on how many user skills are found in a job description.
 * @param userSkills - An array of skills the user has.
 * @param jobDescription - The job description text.
 * @returns A match percentage (0-99), or null if inputs are invalid.
 */
export function calculateMatchScore(
  userSkills: string[] | null | undefined,
  jobDescription: string | null | undefined,
): number | null {
  if (!userSkills || userSkills.length === 0 || !jobDescription) {
    return null;
  }

  const descriptionLower = jobDescription.toLowerCase();
  let matches = 0;

  userSkills.forEach((skill) => {
    // Use a regex with word boundaries to avoid matching substrings (e.g., "react" in "proactive").
    // We also escape special regex characters in the skill string.
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const skillPattern = new RegExp(`\\b${escapedSkill.toLowerCase()}\\b`);
    if (skillPattern.test(descriptionLower)) {
      matches++;
    }
  });

  const score = (matches / userSkills.length) * 100;

  // As per requirement, cap the score at 99.
  return Math.min(score, 99);
}