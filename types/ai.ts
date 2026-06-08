export interface ExtractedProfile {
  readonly full_name: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly skills: readonly string[];
  readonly education: string;
  readonly experience: string;
  readonly experience_years: number | null;
  readonly degree: string;
}

export interface ResumeAnalysis {
  readonly resume_score: number;
  readonly skills_found: readonly string[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
  readonly missing_skills: readonly string[];
  readonly recommendations: readonly string[];
}

export interface JobAnalysis {
  readonly required_skills: readonly string[];
  readonly important_keywords: readonly string[];
  readonly difficulty_level: string;
  readonly preparation_tips: readonly string[];
  readonly interview_topics: readonly string[];
}

export interface ImportedJobData {
  readonly title: string;
  readonly company_name: string;
  readonly location: string;
  readonly job_type: string;
  readonly category: string;
  readonly skills: readonly string[];
  readonly qualification: string;
  readonly experience_required: number | null;
  readonly description: string;
}
