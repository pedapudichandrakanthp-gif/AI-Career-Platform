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
  readonly certifications: readonly string[];
  readonly projects: string;
}

export interface ResumeAnalysis {
  readonly ats_score: number;
  readonly resume_strength: number;
  readonly skills_found: readonly string[];
  readonly missing_skills: readonly string[];
  readonly missing_keywords: readonly string[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
  readonly suggestions: readonly string[];
  readonly recommended_certifications: readonly string[];
  readonly recommended_skills: readonly string[];
}

export interface JobAnalysis {
  readonly required_skills: readonly string[];
  readonly preferred_skills: readonly string[];
  readonly experience_needed: string;
  readonly responsibilities: readonly string[];
  readonly important_keywords: readonly string[];
  readonly difficulty_level: string;
  readonly preparation_tips: readonly string[];
  readonly interview_topics: readonly string[];
  readonly match_score: number;
  readonly missing_skills: readonly string[];
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

export interface CleanedJobData {
  readonly clean_title: string;
  readonly title: string;
  readonly company_name: string;
  readonly location: string;
  readonly job_type: string;
  readonly work_mode: string;
  readonly category: string;
  readonly skills: readonly string[];
  readonly experience_required: number | null;
  readonly qualification: string;
  readonly description: string;
  readonly summary: string;
}

export interface CareerRoadmapData {
  readonly target_role: string;
  readonly current_skills: readonly string[];
  readonly recommended_skills: readonly string[];
  readonly courses: readonly string[];
  readonly certifications: readonly string[];
  readonly milestones: readonly string[];
}

export interface RemotiveJob {
  readonly id: number;
  readonly title: string;
  readonly company_name: string;
  readonly category: string;
  readonly job_type: string;
  readonly candidate_required_location: string;
  readonly salary: string;
  readonly description: string;
  readonly publication_date: string;
  readonly url: string;
}
