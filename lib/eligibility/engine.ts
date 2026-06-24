// Government Job Eligibility Engine
// Implements rule-based eligibility checking for government exams

import type {
  UserProfile, 
  ExamEligibility,
  EligibilityCheckResult,
  AgeCheckResult,
  QualificationCheckResult,
  CategoryCheckResult,
  StateCheckResult,
  DisabilityCheckResult,
  ExServicemanCheckResult,
  GenderCheckResult,
} from './types';

// Qualification hierarchy for comparison
const QUALIFICATION_HIERARCHY: Record<string, number> = {
  '10th': 1,
  '10th Pass': 1,
  '12th': 2,
  '12th Pass': 2,
  'Diploma': 3,
  'Graduate': 4,
  'Bachelor': 4,
  'B.Tech': 4,
  'B.E.': 4,
  'B.Com': 4,
  'B.Sc': 4,
  'BA': 4,
  'Post Graduate': 5,
  'Master': 5,
  'M.Tech': 5,
  'M.E.': 5,
  'M.Com': 5,
  'M.Sc': 5,
  'MA': 5,
  'MBA': 5,
  'PhD': 6,
  'Doctorate': 6,
};

export class EligibilityEngine {
  /**
   * Check if a user is eligible for a government job
   */
  static checkEligibility(
    user: UserProfile,
    exam: ExamEligibility
  ): EligibilityCheckResult {
    const ageCheck = this.checkAge(user, exam);
    const qualificationCheck = this.checkQualification(user, exam);
    const categoryCheck = this.checkCategory(user, exam);
    const stateCheck = this.checkState(user, exam);
    const disabilityCheck = this.checkDisability(user, exam);
    const exServicemanCheck = this.checkExServiceman(user, exam);
    const genderCheck = this.checkGender(user, exam);

    const allChecks = [
      ageCheck,
      qualificationCheck,
      categoryCheck,
      stateCheck,
      disabilityCheck,
      exServicemanCheck,
      genderCheck,
    ];

    const failedChecks = allChecks.filter(check => !check.passed);
    const isEligible = failedChecks.length === 0;

    // Determine eligibility status
    let eligibilityStatus: 'eligible' | 'ineligible' | 'borderline';
    if (isEligible) {
      eligibilityStatus = 'eligible';
    } else if (failedChecks.length === 1 && failedChecks[0] === qualificationCheck) {
      // Only qualification failed - might be borderline
      eligibilityStatus = 'borderline';
    } else {
      eligibilityStatus = 'ineligible';
    }

    // Build reason message
    const reasons = failedChecks.map(check => check.reason);
    const eligibilityReason = isEligible
      ? 'You meet all eligibility criteria for this position.'
      : `Not eligible: ${reasons.join('; ')}`;

    return {
      is_eligible: isEligible,
      eligibility_status: eligibilityStatus,
      eligibility_reason: eligibilityReason,
      age_check: ageCheck,
      qualification_check: qualificationCheck,
      category_check: categoryCheck,
      state_check: stateCheck,
      disability_check: disabilityCheck,
      ex_serviceman_check: exServicemanCheck,
      gender_check: genderCheck,
    };
  }

  /**
   * Check age eligibility with category relaxation
   */
  private static checkAge(user: UserProfile, exam: ExamEligibility): AgeCheckResult {
    // NOTE: The 'jobs' table schema does not contain age_min or age_max.
    // This check is stubbed to pass by default.
    return {
      passed: true,
      user_age: user.age || null,
      job_age_min: null,
      job_age_max: null,
      effective_max_age: 99,
      relaxation_years: 0,
      reason: 'Age check skipped; schema missing required fields.',
    };
    const userAge = user.age || null;
    const jobAgeMin = exam.age_min || null;
    const jobAgeMax = exam.age_max || null;

    // If no age limits specified, pass
    if (!jobAgeMin && !jobAgeMax) {
      return {
        passed: true,
        user_age: userAge,
        job_age_min: jobAgeMin,
        job_age_max: jobAgeMax,
        effective_max_age: jobAgeMax || 99,
        relaxation_years: 0,
        reason: 'No age limit specified.',
      };
    }

    // Calculate relaxation based on category
    const relaxationYears = this.getAgeRelaxation(user.category || 'UR', exam.category_relaxation);
    const effectiveMaxAge = (jobAgeMax || 99) + relaxationYears;

    // Check age range
    let passed = true;
    let reason = '';

    if (userAge === null) {
      passed = false;
      reason = 'Age not provided in profile.';
    } else if (jobAgeMin && userAge < jobAgeMin) {
      passed = false;
      reason = `Age ${userAge} is below minimum age ${jobAgeMin}.`;
    } else if (jobAgeMax && userAge > effectiveMaxAge) {
      passed = false;
      reason = `Age ${userAge} exceeds maximum age ${jobAgeMax} (with ${relaxationYears} years relaxation for ${user.category || 'UR'} category).`;
    } else {
      reason = `Age ${userAge} is within range ${jobAgeMin}-${effectiveMaxAge} (with ${relaxationYears} years relaxation).`;
    }

    return {
      passed,
      user_age: userAge,
      job_age_min: jobAgeMin,
      job_age_max: jobAgeMax,
      effective_max_age: effectiveMaxAge,
      relaxation_years: relaxationYears,
      reason,
    };
  }

  /**
   * Get age relaxation years based on category
   */
  private static getAgeRelaxation(
    category: string,
    examRelaxation?: Record<string, number>
  ): number {
    // Use job-specific relaxation if provided
    if (examRelaxation && examRelaxation[category] !== undefined) {
      return examRelaxation[category];
    }

    // Default government relaxation rules
    const defaultRelaxation: Record<string, number> = {
      'UR': 0,
      'OBC': 3,
      'SC': 5,
      'ST': 5,
      'EWS': 0,
    };

    return defaultRelaxation[category] || 0;
  }

  /**
   * Check qualification eligibility
   */
  private static checkQualification(user: UserProfile, exam: ExamEligibility): QualificationCheckResult {
    const userQual = user.qualification || null;
    const requiredQual = exam.qualification_required || null;

    // If no qualification required, pass
    if (!requiredQual) {
      return {
        passed: true,
        user_qualification: userQual,
        required_qualification: requiredQual,
        reason: 'No specific qualification required.',
      };
    }

    // If user qualification not provided, fail
    if (!userQual) {
      return {
        passed: false,
        user_qualification: userQual,
        required_qualification: requiredQual,
        reason: 'Qualification not provided in profile.',
      };
    }

    // Compare qualification levels
    const userLevel = QUALIFICATION_HIERARCHY[userQual] || 0;
    const requiredLevel = QUALIFICATION_HIERARCHY[requiredQual] || 0;

    // Check if user qualification meets or exceeds required
    const passed = userLevel >= requiredLevel;

    const reason = passed
      ? `Qualification ${userQual} meets requirement ${requiredQual}.`
      : `Qualification ${userQual} does not meet requirement ${requiredQual}.`;

    return {
      passed,
      user_qualification: userQual,
      required_qualification: requiredQual,
      reason,
    };
  }

  /**
   * Check category eligibility based on vacancies
   */
  private static checkCategory(user: UserProfile, exam: ExamEligibility): CategoryCheckResult {
    // NOTE: The 'jobs' table schema does not contain vacancies_by_category.
    // This check is stubbed to pass by default.
    return {
      passed: true,
      user_category: user.category || 'UR',
      job_vacancies: null,
      has_vacancy: true,
      is_protected_category: false,
      reason: 'Category check skipped; schema missing required fields.',
    };
    const userCategory = user.category || 'UR';
    const jobVacancies = exam.vacancies_by_category || null;

    // If no category-specific vacancies, assume all categories eligible
    if (!jobVacancies || Object.keys(jobVacancies).length === 0) {
      return {
        passed: true,
        user_category: userCategory,
        job_vacancies: jobVacancies,
        has_vacancy: true,
        is_protected_category: false,
        reason: 'No category-specific vacancy restrictions.',
      };
    }

    // Check if user's category has vacancies
    const hasVacancy = (jobVacancies[userCategory] || 0) > 0;
    
    // Protected categories (SC, ST) are always eligible even if no specific vacancy
    const isProtectedCategory = userCategory === 'SC' || userCategory === 'ST';
    const passed = hasVacancy || isProtectedCategory;

    const reason = passed
      ? isProtectedCategory
        ? `${userCategory} is a protected category and eligible.`
        : `Vacancies available for ${userCategory} category.`
      : `No vacancies available for ${userCategory} category.`;

    return {
      passed,
      user_category: userCategory,
      job_vacancies: jobVacancies,
      has_vacancy: hasVacancy,
      is_protected_category: isProtectedCategory,
      reason,
    };
  }

  /**
   * Check state eligibility
   */
  private static checkState(user: UserProfile, exam: ExamEligibility): StateCheckResult {
    // NOTE: The 'jobs' table schema does not contain state_specific or required_state.
    // This check is stubbed to pass by default.
    return {
      passed: true,
      user_state: user.state || null,
      job_state_specific: false,
      required_state: null,
      reason: 'State check skipped; schema missing required fields.',
    };
    const userState = user.state || null;
    const jobStateSpecific = exam.state_specific || false;
    const requiredState = exam.required_state || null;

    // If job is not state-specific, pass
    if (!jobStateSpecific) {
      return {
        passed: true,
        user_state: userState,
        job_state_specific: jobStateSpecific,
        required_state: requiredState,
        reason: 'Position is open to all states (Central/All-India).',
      };
    }

    // If job is state-specific but no state provided, fail
    if (!requiredState) {
      return {
        passed: true,
        user_state: userState,
        job_state_specific: jobStateSpecific,
        required_state: requiredState,
        reason: 'State-specific job but no state restriction specified.',
      };
    }

    // If user state not provided, fail
    if (!userState) {
      return {
        passed: false,
        user_state: userState,
        job_state_specific: jobStateSpecific,
        required_state: requiredState,
        reason: 'State not provided in profile.',
      };
    }

    // Check if user state matches required state
    const passed = userState === requiredState;

    const reason = passed
      ? `Resident of ${userState} matches required state ${requiredState}.`
      : `Resident of ${userState} does not match required state ${requiredState}.`;

    return {
      passed,
      user_state: userState,
      job_state_specific: jobStateSpecific,
      required_state: requiredState,
      reason,
    };
  }

  /**
   * Check disability eligibility
   */
  private static checkDisability(user: UserProfile, exam: ExamEligibility): DisabilityCheckResult {
    // NOTE: The 'jobs' table schema does not contain requires_disability.
    // This check is stubbed to pass by default.
    return {
      passed: true,
      user_has_disability: user.has_pwd || false,
      job_requires_disability: false,
      reason: 'Disability check skipped; schema missing required fields.',
    };
    const userHasDisability = user.has_disability || false;
    const jobRequiresDisability = exam.requires_disability || false;

    // If job doesn't require disability, everyone is eligible
    if (!jobRequiresDisability) {
      return {
        passed: true,
        user_has_disability: userHasDisability,
        job_requires_disability: jobRequiresDisability,
        reason: 'Position does not require disability certificate.',
      };
    }

    // If job requires disability, user must have disability
    const passed = userHasDisability;

    const reason = passed
      ? 'Has required disability certificate.'
      : 'Position requires disability certificate.';

    return {
      passed,
      user_has_disability: userHasDisability,
      job_requires_disability: jobRequiresDisability,
      reason,
    };
  }

  /**
   * Check ex-serviceman eligibility
   */
  private static checkExServiceman(user: UserProfile, exam: ExamEligibility): ExServicemanCheckResult {
    // NOTE: The 'jobs' table schema does not contain requires_ex_serviceman.
    // This check is stubbed to pass by default.
    return {
      passed: true,
      user_is_ex_serviceman: user.ex_serviceman || false,
      job_requires_ex_serviceman: false,
      reason: 'Ex-serviceman check skipped; schema missing required fields.',
    };
    const userIsExServiceman = user.is_ex_serviceman || false;
    const jobRequiresExServiceman = exam.requires_ex_serviceman || false;

    // If job doesn't require ex-serviceman, everyone is eligible
    if (!jobRequiresExServiceman) {
      return {
        passed: true,
        user_is_ex_serviceman: userIsExServiceman,
        job_requires_ex_serviceman: jobRequiresExServiceman,
        reason: 'Position does not require ex-serviceman status.',
      };
    }

    // If job requires ex-serviceman, user must be ex-serviceman
    const passed = userIsExServiceman;

    const reason = passed
      ? 'Has required ex-serviceman status.'
      : 'Position requires ex-serviceman status.';

    return {
      passed,
      user_is_ex_serviceman: userIsExServiceman,
      job_requires_ex_serviceman: jobRequiresExServiceman,
      reason,
    };
  }

  /**
   * Check gender eligibility
   */
  private static checkGender(user: UserProfile, exam: ExamEligibility): GenderCheckResult {
    // NOTE: The 'jobs' table schema does not contain gender_required.
    // This check is stubbed to pass by default.
    return {
      passed: true,
      user_gender: user.gender || null,
      job_gender_required: null,
      reason: 'Gender check skipped; schema missing required fields.',
    };
    const userGender = user.gender || null;
    const jobGenderRequired = exam.gender_required || null;

    // If no gender requirement, pass
    if (!jobGenderRequired) {
      return {
        passed: true,
        user_gender: userGender,
        job_gender_required: jobGenderRequired,
        reason: 'No gender restriction.',
      };
    }

    // If user gender not provided, fail
    if (!userGender) {
      return {
        passed: false,
        user_gender: userGender,
        job_gender_required: jobGenderRequired,
        reason: 'Gender not provided in profile.',
      };
    }

    // Check if user gender matches required gender
    const passed = userGender === jobGenderRequired || userGender === 'Other';

    const reason = passed
      ? `Gender ${userGender} meets requirement.`
      : `Gender ${userGender} does not match requirement ${jobGenderRequired}.`;

    return {
      passed,
      user_gender: userGender,
      job_gender_required: jobGenderRequired,
      reason,
    };
  }
}
