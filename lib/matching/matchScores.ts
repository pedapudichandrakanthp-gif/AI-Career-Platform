import type { SupabaseClient } from "@supabase/supabase-js";

import { calculateMatchScore } from "@/lib/matching/scoring";
import type { JobRow, MatchScoreRow, ResumeRow, UserProfileRow } from "@/types/database";

export interface GenerateMatchScoresResult {
  readonly generatedCount: number;
  readonly scores: MatchScoreRow[];
}

export async function generateAndStoreMatchScoresForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<GenerateMatchScoresResult> {
  const now = new Date().toISOString();

  const [profileResult, resumeResult, jobsResult] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`),
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (resumeResult.error) throw new Error(resumeResult.error.message);
  if (jobsResult.error) throw new Error(jobsResult.error.message);

  const profile = profileResult.data as UserProfileRow | null;
  const latestResume = resumeResult.data as ResumeRow | null;
  const jobs = (jobsResult.data ?? []) as JobRow[];

  if (!profile) {
    return { generatedCount: 0, scores: [] };
  }

  const userSkills = mergeSkills(profile.skills, latestResume?.extracted_skills ?? null);
  const storedScores: MatchScoreRow[] = [];

  for (const job of jobs) {
    const score = calculateMatchScore({
      userSkills,
      userEducation: profile.education,
      userDegree: profile.degree,
      userExperienceYears: profile.experience_years,
      userLocation: profile.location,
      jobSkills: job.skills ?? [],
      jobQualification: job.qualification,
      jobExperienceRequired: job.experience_required,
      jobLocation: job.location,
    });

    const storedScore = await replaceMatchScore(supabase, {
      userId,
      jobId: job.id,
      ...score,
    });

    storedScores.push(storedScore);
  }

  return { generatedCount: storedScores.length, scores: storedScores };
}

interface ReplaceMatchScoreInput {
  readonly userId: string;
  readonly jobId: string;
  readonly matchPercentage: number;
  readonly matchingSkills: readonly string[];
  readonly missingSkills: readonly string[];
  readonly recommendation: string;
  readonly skillsScore: number;
  readonly experienceScore: number;
  readonly educationScore: number;
  readonly locationScore: number;
  readonly matchReasons: readonly string[];
}

async function replaceMatchScore(
  supabase: SupabaseClient,
  input: ReplaceMatchScoreInput,
): Promise<MatchScoreRow> {
  await supabase
    .from("match_scores")
    .delete()
    .eq("user_id", input.userId)
    .eq("job_id", input.jobId);

  const insertResult = await supabase
    .from("match_scores")
    .insert([
      {
        user_id: input.userId,
        job_id: input.jobId,
        match_percentage: input.matchPercentage,
        matching_skills: [...input.matchingSkills],
        missing_skills: [...input.missingSkills],
        recommendation: input.recommendation,
        skills_score: input.skillsScore,
        experience_score: input.experienceScore,
        education_score: input.educationScore,
        location_score: input.locationScore,
        match_reasons: [...input.matchReasons],
      },
    ])
    .select("*")
    .single();

  if (insertResult.error) throw new Error(insertResult.error.message);

  return insertResult.data as MatchScoreRow;
}

function mergeSkills(
  profileSkills: readonly string[] | null,
  resumeSkills: readonly string[] | null,
): string[] {
  const mergedSkills = new Map<string, string>();

  [...(profileSkills ?? []), ...(resumeSkills ?? [])].forEach((skill) => {
    const normalizedSkill = skill.trim().toLowerCase();
    if (normalizedSkill && !mergedSkills.has(normalizedSkill)) {
      mergedSkills.set(normalizedSkill, skill.trim());
    }
  });

  return [...mergedSkills.values()];
}
