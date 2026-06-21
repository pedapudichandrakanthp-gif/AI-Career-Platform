// Eligibility Engine Types for Government Job Platform

export interface UserProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  date_of_birth?: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  category?: 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS';
  has_disability?: boolean;
  disability_type?: string;
  is_ex_serviceman?: boolean;
  ex_service_years?: number;
  current_state?: string;
  highest_qualification?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  grade_percentage?: number;
}

export interface JobEligibility {
  id?: string;
  job_id?: string;
  age_min?: number;
  age_max?: number;
  category_relaxation?: Record<string, number>;
  vacancies_by_category?: Record<string, number>;
  qualification_required?: string;
  state_specific?: boolean;
  required_state?: string;
  requires_disability?: boolean;
  requires_ex_serviceman?: boolean;
  gender_required?: string;
}

export interface EligibilityCheckResult {
  is_eligible: boolean;
  eligibility_status: 'eligible' | 'ineligible' | 'borderline';
  eligibility_reason: string;
  age_check: AgeCheckResult;
  qualification_check: QualificationCheckResult;
  category_check: CategoryCheckResult;
  state_check: StateCheckResult;
  disability_check: DisabilityCheckResult;
  ex_serviceman_check: ExServicemanCheckResult;
  gender_check: GenderCheckResult;
}

export interface AgeCheckResult {
  passed: boolean;
  user_age: number | null;
  job_age_min: number | null;
  job_age_max: number | null;
  effective_max_age: number;
  relaxation_years: number;
  reason: string;
}

export interface QualificationCheckResult {
  passed: boolean;
  user_qualification: string | null;
  required_qualification: string | null;
  reason: string;
}

export interface CategoryCheckResult {
  passed: boolean;
  user_category: string | null;
  job_vacancies: Record<string, number> | null;
  has_vacancy: boolean;
  is_protected_category: boolean;
  reason: string;
}

export interface StateCheckResult {
  passed: boolean;
  user_state: string | null;
  job_state_specific: boolean | null;
  required_state: string | null;
  reason: string;
}

export interface DisabilityCheckResult {
  passed: boolean;
  user_has_disability: boolean | null;
  job_requires_disability: boolean | null;
  reason: string;
}

export interface ExServicemanCheckResult {
  passed: boolean;
  user_is_ex_serviceman: boolean | null;
  job_requires_ex_serviceman: boolean | null;
  reason: string;
}

export interface GenderCheckResult {
  passed: boolean;
  user_gender: string | null;
  job_gender_required: string | null;
  reason: string;
}

export interface EligibilityCacheEntry {
  user_id: string;
  job_id: string;
  is_eligible: boolean;
  eligibility_status: 'eligible' | 'ineligible' | 'borderline';
  eligibility_reason: string;
  age_check: AgeCheckResult;
  qualification_check: QualificationCheckResult;
  category_check: CategoryCheckResult;
  state_check: StateCheckResult;
  disability_check: DisabilityCheckResult;
  ex_serviceman_check: ExServicemanCheckResult;
  checked_at: string;
  expires_at: string;
}
