export interface UserProfileRow {
  readonly id: string;
  readonly email: string | null;
  readonly full_name: string | null;
  readonly phone: string | null;
  readonly location: string | null;
  readonly education: string | null;
  readonly degree: string | null;
  readonly skills: string[] | null;
  readonly experience_years: number | null;
  readonly preferred_job_type: string | null;
  readonly expected_salary: number | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface JobRow {
  readonly id: string;
  readonly title: string | null;
  readonly company_name: string | null;
  readonly job_type: string | null;
  readonly category: string | null;
  readonly location: string | null;
  readonly salary_min: number | null;
  readonly salary_max: number | null;
  readonly qualification: string | null;
  readonly experience_required: number | null;
  readonly skills: string[] | null;
  readonly description: string | null;
  readonly apply_link: string | null;
  readonly application_deadline: string | null;
  readonly is_active: boolean | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface ResumeRow {
  readonly id: string;
  readonly user_id: string;
  readonly file_name: string | null;
  readonly file_url: string | null;
  readonly extracted_text: string | null;
  readonly extracted_skills: string[] | null;
  readonly extracted_education: string | null;
  readonly extracted_experience: string | null;
  readonly uploaded_at: string | null;
}

export interface SavedJobRow {
  readonly id: string;
  readonly user_id: string;
  readonly job_id: string;
  readonly saved_at: string | null;
}

export interface MatchScoreRow {
  readonly id: string;
  readonly user_id: string;
  readonly job_id: string;
  readonly match_percentage: number | null;
  readonly matching_skills: string[] | null;
  readonly missing_skills: string[] | null;
  readonly recommendation: string | null;
  readonly created_at: string | null;
}

export interface SavedJobWithJob extends Pick<SavedJobRow, "id" | "saved_at"> {
  readonly jobs: Pick<JobRow, "id" | "title" | "company_name" | "location" | "category"> | null;
}
