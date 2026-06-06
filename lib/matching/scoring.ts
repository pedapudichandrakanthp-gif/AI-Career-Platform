export interface SkillComparisonResult {
  readonly matchingSkills: string[];
  readonly missingSkills: string[];
  readonly score: number;
}

export interface ExperienceComparisonResult {
  readonly score: number;
  readonly recommendation: string;
}

export interface QualificationComparisonResult {
  readonly score: number;
  readonly recommendation: string;
}

export interface MatchScoreInput {
  readonly userSkills: readonly string[];
  readonly userEducation: string | null;
  readonly userDegree: string | null;
  readonly userExperienceYears: number | null;
  readonly jobSkills: readonly string[];
  readonly jobQualification: string | null;
  readonly jobExperienceRequired: number | null;
}

export interface MatchScoreResult {
  readonly matchPercentage: number;
  readonly matchingSkills: string[];
  readonly missingSkills: string[];
  readonly recommendation: string;
}

const skillWeight = 0.5;
const experienceWeight = 0.25;
const qualificationWeight = 0.25;

export function compareSkills(
  userSkills: readonly string[],
  jobSkills: readonly string[]
): SkillComparisonResult {
  const normalizedUserSkills = new Map(
    userSkills.map((skill) => [normalizeComparableText(skill), skill.trim()] as const)
  );
  const requiredSkills = dedupeNormalizedValues(jobSkills);

  if (requiredSkills.length === 0) {
    return {
      matchingSkills: [],
      missingSkills: [],
      score: 100
    };
  }

  const matchingSkills = requiredSkills
    .filter((skill) => normalizedUserSkills.has(normalizeComparableText(skill)))
    .map((skill) => normalizedUserSkills.get(normalizeComparableText(skill)) ?? skill);
  const missingSkills = requiredSkills.filter(
    (skill) => !normalizedUserSkills.has(normalizeComparableText(skill))
  );

  return {
    matchingSkills,
    missingSkills,
    score: Math.round((matchingSkills.length / requiredSkills.length) * 100)
  };
}

export function compareExperience(
  userExperienceYears: number | null,
  jobExperienceRequired: number | null
): ExperienceComparisonResult {
  const requiredYears = Math.max(jobExperienceRequired ?? 0, 0);
  const userYears = Math.max(userExperienceYears ?? 0, 0);

  if (requiredYears === 0) {
    return {
      score: 100,
      recommendation: "No minimum experience requirement found."
    };
  }

  if (userYears >= requiredYears) {
    return {
      score: 100,
      recommendation: "Experience requirement met."
    };
  }

  return {
    score: Math.round((userYears / requiredYears) * 100),
    recommendation: `Needs ${requiredYears - userYears} more year(s) of experience.`
  };
}

export function compareQualification(
  userEducation: string | null,
  userDegree: string | null,
  jobQualification: string | null
): QualificationComparisonResult {
  const requiredQualification = tokenize(jobQualification);

  if (requiredQualification.length === 0) {
    return {
      score: 100,
      recommendation: "No specific qualification requirement found."
    };
  }

  const userQualificationTokens = new Set(tokenize(`${userEducation ?? ""} ${userDegree ?? ""}`));
  const matchingTokenCount = requiredQualification.filter((token) =>
    userQualificationTokens.has(token)
  ).length;
  const score = Math.round((matchingTokenCount / requiredQualification.length) * 100);

  return {
    score,
    recommendation:
      score >= 80
        ? "Qualification requirement is a strong match."
        : "Review qualification requirements before applying."
  };
}

export function calculateMatchScore(input: MatchScoreInput): MatchScoreResult {
  const skillComparison = compareSkills(input.userSkills, input.jobSkills);
  const experienceComparison = compareExperience(
    input.userExperienceYears,
    input.jobExperienceRequired
  );
  const qualificationComparison = compareQualification(
    input.userEducation,
    input.userDegree,
    input.jobQualification
  );
  const matchPercentage = Math.round(
    skillComparison.score * skillWeight +
      experienceComparison.score * experienceWeight +
      qualificationComparison.score * qualificationWeight
  );

  return {
    matchPercentage: clampScore(matchPercentage),
    matchingSkills: skillComparison.matchingSkills,
    missingSkills: skillComparison.missingSkills,
    recommendation: buildRecommendation(
      skillComparison,
      experienceComparison,
      qualificationComparison
    )
  };
}

function buildRecommendation(
  skillComparison: SkillComparisonResult,
  experienceComparison: ExperienceComparisonResult,
  qualificationComparison: QualificationComparisonResult
): string {
  const skillMessage =
    skillComparison.missingSkills.length === 0
      ? "Required skills are covered."
      : `Improve these skills: ${skillComparison.missingSkills.join(", ")}.`;

  return [
    skillMessage,
    experienceComparison.recommendation,
    qualificationComparison.recommendation
  ].join(" ");
}

function dedupeNormalizedValues(values: readonly string[]): string[] {
  const normalizedValues = new Map<string, string>();

  values.forEach((value) => {
    const normalizedValue = normalizeComparableText(value);

    if (normalizedValue && !normalizedValues.has(normalizedValue)) {
      normalizedValues.set(normalizedValue, value.trim());
    }
  });

  return [...normalizedValues.values()];
}

function tokenize(value: string | null): string[] {
  return normalizeComparableText(value ?? "")
    .split(" ")
    .filter((token) => token.length > 1);
}

function normalizeComparableText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ");
}

function clampScore(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}
