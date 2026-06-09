export interface MatchScoreInput {
  readonly userSkills: readonly string[];
  readonly userEducation: string | null;
  readonly userDegree: string | null;
  readonly userExperienceYears: number | null;
  readonly userLocation: string | null;
  readonly jobSkills: readonly string[];
  readonly jobQualification: string | null;
  readonly jobExperienceRequired: number | null;
  readonly jobLocation: string | null;
}

export interface MatchScoreResult {
  readonly matchPercentage: number;
  readonly matchingSkills: string[];
  readonly missingSkills: string[];
  readonly recommendation: string;
  readonly skillsScore: number;
  readonly experienceScore: number;
  readonly educationScore: number;
  readonly locationScore: number;
  readonly matchReasons: string[];
}

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

function calculateSkillsScore(
  userSkills: readonly string[],
  jobSkills: readonly string[],
): { score: number; matching: string[]; missing: string[] } {
  if (jobSkills.length === 0) {
    return { score: 100, matching: [], missing: [] };
  }

  const normalizedUserSkills = new Set(userSkills.map(normalizeSkill));
  const matching: string[] = [];
  const missing: string[] = [];

  jobSkills.forEach((jobSkill) => {
    const normalized = normalizeSkill(jobSkill);

    if (normalizedUserSkills.has(normalized)) {
      matching.push(jobSkill);
    } else {
      const partialMatch = [...normalizedUserSkills].some(
        (userSkill) => userSkill.includes(normalized) || normalized.includes(userSkill),
      );

      if (partialMatch) {
        matching.push(jobSkill);
      } else {
        missing.push(jobSkill);
      }
    }
  });

  const score = Math.round((matching.length / jobSkills.length) * 100);
  return { score, matching, missing };
}

function calculateExperienceScore(
  userExperienceYears: number | null,
  jobExperienceRequired: number | null,
): number {
  if (jobExperienceRequired == null || jobExperienceRequired === 0) return 100;
  if (userExperienceYears == null) return 0;

  if (userExperienceYears >= jobExperienceRequired) return 100;

  return Math.max(0, Math.round((userExperienceYears / jobExperienceRequired) * 100));
}

function calculateEducationScore(
  userEducation: string | null,
  userDegree: string | null,
  jobQualification: string | null,
): number {
  if (!jobQualification) return 100;

  const userText = `${userEducation ?? ""} ${userDegree ?? ""}`.toLowerCase();
  const jobText = jobQualification.toLowerCase();

  if (!userText.trim()) return 30;

  const keywords = ["bachelor", "master", "phd", "diploma", "degree", "b.tech", "mba"];

  const userHas = keywords.some((k) => userText.includes(k));
  const jobNeeds = keywords.some((k) => jobText.includes(k));

  if (!jobNeeds) return 80;
  if (userHas) return 100;
  return 40;
}

function calculateLocationScore(
  userLocation: string | null,
  jobLocation: string | null,
): number {
  if (!jobLocation) return 100;
  if (!userLocation) return 50;

  const user = userLocation.toLowerCase();
  const job = jobLocation.toLowerCase();

  if (user === job) return 100;
  if (job.includes("remote") || job.includes("anywhere")) return 100;
  if (user.includes(job) || job.includes(user)) return 80;
  return 30;
}

export function calculateMatchScore(input: MatchScoreInput): MatchScoreResult {
  const skills = calculateSkillsScore(input.userSkills, input.jobSkills);
  const experienceScore = calculateExperienceScore(
    input.userExperienceYears,
    input.jobExperienceRequired,
  );
  const educationScore = calculateEducationScore(
    input.userEducation,
    input.userDegree,
    input.jobQualification,
  );
  const locationScore = calculateLocationScore(input.userLocation, input.jobLocation);

  const matchPercentage = Math.round(
    skills.score * 0.4 + experienceScore * 0.3 + educationScore * 0.2 + locationScore * 0.1,
  );

  const matchReasons: string[] = [];

  if (skills.score >= 60) matchReasons.push("Skill Match");
  if (experienceScore >= 60) matchReasons.push("Experience Match");
  if (educationScore >= 60) matchReasons.push("Education Match");
  if (locationScore >= 60) matchReasons.push("Location Match");

  let recommendation = "Consider applying after improving your profile.";

  if (matchPercentage >= 80) {
    recommendation = "Excellent match — strongly recommended to apply.";
  } else if (matchPercentage >= 60) {
    recommendation = "Good match — worth applying with minor skill gaps.";
  } else if (matchPercentage >= 40) {
    recommendation = "Moderate match — upskill in missing areas first.";
  }

  return {
    matchPercentage,
    matchingSkills: skills.matching,
    missingSkills: skills.missing,
    recommendation,
    skillsScore: skills.score,
    experienceScore,
    educationScore,
    locationScore,
    matchReasons,
  };
}
