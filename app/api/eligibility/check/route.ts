// API Endpoint: Check Eligibility for a Job
// POST /api/eligibility/check

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { EligibilityEngine } from '@/lib/eligibility/engine';
import type { UserProfile, ExamEligibility } from '@/lib/eligibility/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, examId, userProfile, examData } = body;

    // Get Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore
            }
          }
        }
      }
    );

    // Get user ID from auth if not provided
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      effectiveUserId = user.id;
    }

    // Fetch user profile if not provided
    let userProfileData: UserProfile = userProfile;
    if (!userProfileData) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', effectiveUserId)
        .single();

      if (profileError) {
        // Try to get from auth.users as fallback
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          userProfileData = {
            age: authUser.user.user_metadata?.age,
            category: authUser.user.user_metadata?.category,
            gender: authUser.user.user_metadata?.gender,
            has_pwd: authUser.user.user_metadata?.has_disability,
            ex_serviceman: authUser.user.user_metadata?.is_ex_serviceman,
            state: authUser.user.user_metadata?.state,
            qualification: authUser.user.user_metadata?.qualification,
          };
        } else {
          return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }
      } else {
        userProfileData = profile;
      }
    }

    // Fetch job data if not provided
    let examEligibilityData: ExamEligibility = examData;
    if (!examEligibilityData && examId) {
      const { data: exam, error: examError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }

      examEligibilityData = {
        job_id: exam.id,
        age_min: exam.age_min,
        age_max: exam.age_max,
        category_relaxation: exam.category_relaxation,
        vacancies_by_category: exam.vacancies_by_category,
        qualification_required: exam.qualification_required,
        state_specific: exam.state_specific,
        required_state: exam.required_state,
        requires_disability: exam.requires_disability,
        requires_ex_serviceman: exam.requires_ex_serviceman,
        gender_required: exam.gender_required,
      };
    }

    // If examId is provided, check single exam (existing behavior)
    if (examEligibilityData) {
      const eligibilityResult = EligibilityEngine.checkEligibility(
        userProfileData,
        examEligibilityData
      );

      // Store result in user_job_eligibility table
      if (examId) {
        const { error: insertError } = await supabase
          .from('user_job_eligibility')
          .upsert({
            user_id: effectiveUserId,
            job_id: examId,
            is_eligible: eligibilityResult.is_eligible,
            eligibility_status: eligibilityResult.eligibility_status,
            eligibility_reason: eligibilityResult.eligibility_reason,
            age_check: eligibilityResult.age_check,
            qualification_check: eligibilityResult.qualification_check,
            category_check: eligibilityResult.category_check,
            state_check: eligibilityResult.state_check,
            disability_check: eligibilityResult.disability_check,
            ex_serviceman_check: eligibilityResult.ex_serviceman_check,
            gender_check: eligibilityResult.gender_check,
            checked_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          }, {
            onConflict: 'user_id,job_id'
          });

        if (insertError) {
          console.error('Error storing eligibility result:', insertError.message);
        }
      }

      return NextResponse.json(eligibilityResult);
    }

    // If only userId is provided (from profile save), calculate eligibility for ALL jobs
    // Fetch all active jobs
    const { data: allJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true);

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError.message);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // Delete old eligibility for this user
    const { error: deleteError } = await supabase
      .from('user_job_eligibility')
      .delete()
      .eq('user_id', effectiveUserId);

    if (deleteError) {
      console.error('Error deleting old eligibility:', deleteError.message);
    }

    // Calculate eligibility for all jobs
    const eligibleJobs = [];
    const rowsToInsert = [];

    for (const job of allJobs || []) {
      const examEligibilityData = {
        job_id: job.id,
        age_min: job.age_min,
        age_max: job.age_max,
        category_relaxation: job.category_relaxation,
        vacancies_by_category: job.vacancies_by_category,
        qualification_required: job.qualification_required,
        state_specific: job.state_specific,
        required_state: job.required_state,
        requires_disability: job.requires_disability,
        requires_ex_serviceman: job.requires_ex_serviceman,
        gender_required: job.gender_required,
      };

      const eligibilityResult = EligibilityEngine.checkEligibility(
        userProfileData,
        examEligibilityData
      );

      if (eligibilityResult.is_eligible) {
        eligibleJobs.push(job);
        rowsToInsert.push({
          user_id: effectiveUserId,
          job_id: job.id,
          is_eligible: true,
          eligibility_status: eligibilityResult.eligibility_status,
          eligibility_reason: eligibilityResult.eligibility_reason,
          age_check: eligibilityResult.age_check,
          qualification_check: eligibilityResult.qualification_check,
          category_check: eligibilityResult.category_check,
          state_check: eligibilityResult.state_check,
          disability_check: eligibilityResult.disability_check,
          ex_serviceman_check: eligibilityResult.ex_serviceman_check,
          gender_check: eligibilityResult.gender_check,
          checked_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Insert eligible jobs
    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('user_job_eligibility')
        .insert(rowsToInsert);

      if (insertError) {
        console.error('Error inserting eligibility results:', insertError.message);
      }
    }

    return NextResponse.json({
      success: true,
      eligible_count: eligibleJobs.length,
      jobs: eligibleJobs
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve cached eligibility
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId'); 
    const examId = searchParams.get('examId');

    if (!userId || !examId) {
      return NextResponse.json(
        { error: 'userId and examId are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore
            }
          }
        }
      }
    );

    const { data: eligibility, error } = await supabase
      .from('user_job_eligibility')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', examId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Eligibility not found' },
        { status: 404 }
      );
    }

    // Check if cache is expired
    if (eligibility.expires_at && new Date(eligibility.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Eligibility cache expired' },
        { status: 410 }
      );
    }

    return NextResponse.json(eligibility);
  } catch (error) {
    console.error('Get eligibility error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
