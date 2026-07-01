export interface UserProfileRow {
  readonly id: string;
  readonly email: string | null;
  readonly full_name: string | null;
  readonly phone: string | null;
  readonly location: string | null;
  readonly state: string | null;
  readonly education: string | null;
  readonly qualification: string | null;
  readonly degree: string | null;
  readonly age: number | null;
  readonly skills: string[] | null;
  readonly experience_years: number | null;
  readonly preferred_job_type: string | null;
  readonly expected_salary: number | null;
  readonly role: string | null;
  readonly certifications: string[] | null;
  readonly projects: string | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface JobRow {
  id: string
  exam_name: string
  conducting_body: string
  job_type: string | null
  category: string | null
  location: string | null
  state: string | null
  salary_min: number | null
  salary_max: number | null
  qualification_required: string | null
  experience_required: number | null
  skills: string[] | null
  description: string | null
  apply_link: string | null
  application_deadline: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  status: string | null
  vacancies: number | null
  // Government platform fields
  age_min: number | null
  age_max: number | null
  category_relaxation: Record<string, number> | null
  vacancies_by_category: Record<string, number> | null
  state_specific: boolean | null
  required_state: string | null
  requires_disability: boolean | null
  requires_ex_serviceman: boolean | null
  gender_required: string | null
  selection_process: string[] | null
  syllabus_url: string | null
  syllabus: Record<string, unknown> | null
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
  readonly skills_score: number | null;
  readonly experience_score: number | null;
  readonly education_score: number | null;
  readonly location_score: number | null;
  readonly match_reasons: string[] | null;
  readonly created_at: string | null;
}

export interface ResumeAnalysisRow {
  readonly id: string;
  readonly user_id: string;
  readonly resume_id: string | null;
  readonly ats_score: number | null;
  readonly resume_strength: number | null;
  readonly skills_found: string[] | null;
  readonly missing_skills: string[] | null;
  readonly missing_keywords: string[] | null;
  readonly strengths: string[] | null;
  readonly weaknesses: string[] | null;
  readonly suggestions: string[] | null;
  readonly recommended_certifications: string[] | null;
  readonly recommended_skills: string[] | null;
  readonly created_at: string | null;
}

export interface JobAnalysisRow {
  readonly id: string;
  readonly user_id: string;
  readonly job_id: string;
  readonly required_skills: string[] | null;
  readonly preferred_skills: string[] | null;
  readonly experience_needed: string | null;
  readonly responsibilities: string[] | null;
  readonly match_score: number | null;
  readonly missing_skills: string[] | null;
  readonly analysis_data: Record<string, unknown> | null;
  readonly created_at: string | null;
}

export interface SavedSearchRow {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly filters: JobFilters;
  readonly created_at: string | null;
}

export interface JobAlertRow {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly keywords: string | null;
  readonly filters: JobFilters;
  readonly is_active: boolean | null;
  readonly created_at: string | null;
}

export interface JobFilters {
  readonly keyword?: string;
  readonly location?: string;
  readonly experience?: string;
  readonly salaryMin?: number;
  readonly salaryMax?: number;
  readonly jobType?: string;
  readonly category?: string;
}

export interface JobsRawRow {
  readonly id: string;
  readonly external_id: string | null;
  readonly source: string;
  readonly raw_data: Record<string, unknown>;
  readonly processed: boolean | null;
  readonly created_at: string | null;
}

export interface JobImportLogRow {
  readonly id: string;
  readonly source: string;
  readonly status: string;
  readonly jobs_fetched: number | null;
  readonly jobs_inserted: number | null;
  readonly jobs_duplicated: number | null;
  readonly error_message: string | null;
  readonly created_at: string | null;
}

export interface UserSettingsRow {
  readonly user_id: string;
  readonly email_notifications: boolean | null;
  readonly job_alert_notifications: boolean | null;
  readonly theme_preference: string | null;
  readonly updated_at: string | null;
}

export interface CareerRoadmapRow {
  readonly id: string;
  readonly user_id: string;
  readonly target_role: string;
  readonly current_skills: string[] | null;
  readonly recommended_skills: string[] | null;
  readonly courses: string[] | null;
  readonly certifications: string[] | null;
  readonly roadmap_data: Record<string, unknown> | null;
  readonly created_at: string | null;
}

export interface SavedJobWithJob extends Pick<SavedJobRow, "id" | "saved_at"> {
  readonly jobs: Pick<JobRow, "id" | "exam_name" | "conducting_body" | "location" | "category"> | null;
}
