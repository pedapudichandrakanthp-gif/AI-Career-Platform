// API Endpoint: Generate Study Plan
// POST /api/study-plans/generate

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface StudyPlanRequest {
  jobId: string;
  examType?: 'SSC' | 'Banking' | 'Railway' | 'UPSC' | 'State PSC';
  durationDays?: number;
}

interface StudyPlanWeek {
  week: number;
  topics: string[];
  hours: number;
  focus: string;
}

interface StudyPlanData {
  exam_type: string;
  duration_days: number;
  total_hours: number;
  weekly_breakdown: StudyPlanWeek[];
  daily_schedule: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  recommended_resources: string[];
  milestones: {
    week: number;
    milestone: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as StudyPlanRequest;
    const { jobId, examType, durationDays = 90 } = body;

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

    // Get user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Determine exam type from job title if not provided
    const detectedExamType = examType || detectExamType(job.title || '');
    const title = `${detectedExamType} Exam Study Plan - ${job.title}`;

    // Generate study plan based on exam type
    const planData = generateStudyPlan(detectedExamType, durationDays);

    // Save study plan to database
    const { data: studyPlan, error: insertError } = await supabase
      .from('study_plans')
      .insert({
        user_id: user.id,
        job_id: jobId,
        title,
        duration_days: durationDays,
        plan_json: planData as unknown as Record<string, unknown>,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving study plan:', insertError);
      return NextResponse.json({ error: 'Failed to save study plan' }, { status: 500 });
    }

    return NextResponse.json({ studyPlan, planData });
  } catch (error) {
    console.error('Study plan generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function detectExamType(title: string): 'SSC' | 'Banking' | 'Railway' | 'UPSC' | 'State PSC' {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('ssc') || lowerTitle.includes('staff selection')) {
    return 'SSC';
  }
  if (lowerTitle.includes('bank') || lowerTitle.includes('ibps') || lowerTitle.includes('sbi')) {
    return 'Banking';
  }
  if (lowerTitle.includes('railway') || lowerTitle.includes('rrb')) {
    return 'Railway';
  }
  if (lowerTitle.includes('upsc') || lowerTitle.includes('civil services') || lowerTitle.includes('ias')) {
    return 'UPSC';
  }
  
  return 'State PSC';
}

function generateStudyPlan(examType: string, durationDays: number): StudyPlanData {
  const weeks = Math.ceil(durationDays / 7);
  const weeklyBreakdown: StudyPlanWeek[] = [];
  const milestones: { week: number; milestone: string }[] = [];

  // Generate weekly breakdown based on exam type
  for (let week = 1; week <= weeks; week++) {
    const topics = getTopicsForWeek(examType, week, weeks);
    const hours = getHoursForWeek(examType, week, weeks);
    const focus = getFocusForWeek(examType, week, weeks);

    weeklyBreakdown.push({
      week,
      topics,
      hours,
      focus,
    });

    // Add milestone every 4 weeks
    if (week % 4 === 0) {
      milestones.push({
        week,
        milestone: `Complete ${getMilestoneForWeek(examType)}`,
      });
    }
  }

  // Add final milestone
  milestones.push({
    week: weeks,
    milestone: 'Final revision and mock tests',
  });

  return {
    exam_type: examType,
    duration_days: durationDays,
    total_hours: weeks * 35, // Average 35 hours per week
    weekly_breakdown: weeklyBreakdown,
    daily_schedule: {
      morning: '6:00 AM - 9:00 AM: Theory and Concept Building',
      afternoon: '2:00 PM - 5:00 PM: Practice and Problem Solving',
      evening: '7:00 PM - 9:00 PM: Revision and Current Affairs',
    },
    recommended_resources: getResourcesForExam(examType),
    milestones,
  };
}

function getTopicsForWeek(examType: string, currentWeek: number, totalWeeks: number): string[] {
  const phase = currentWeek / totalWeeks;
  
  if (examType === 'SSC') {
    if (phase < 0.3) {
      return ['Quantitative Aptitude', 'Reasoning', 'General Awareness'];
    } else if (phase < 0.6) {
      return ['English Comprehension', 'Advanced Maths', 'Current Affairs'];
    } else {
      return ['Mock Tests', 'Previous Year Papers', 'Speed Tests'];
    }
  }
  
  if (examType === 'Banking') {
    if (phase < 0.3) {
      return ['Quantitative Aptitude', 'Reasoning', 'English Language'];
    } else if (phase < 0.6) {
      return ['Banking Awareness', 'Computer Knowledge', 'Data Interpretation'];
    } else {
      return ['Mock Tests', 'Previous Year Papers', 'Speed Tests'];
    }
  }
  
  if (examType === 'Railway') {
    if (phase < 0.3) {
      return ['Mathematics', 'General Intelligence', 'General Science'];
    } else if (phase < 0.6) {
      return ['General Awareness', 'Current Affairs', 'Technical Subjects'];
    } else {
      return ['Mock Tests', 'Previous Year Papers', 'Psychometric Tests'];
    }
  }
  
  if (examType === 'UPSC') {
    if (phase < 0.25) {
      return ['Polity', 'History', 'Geography'];
    } else if (phase < 0.5) {
      return ['Economy', 'Environment', 'Science & Tech'];
    } else if (phase < 0.75) {
      return ['Current Affairs', 'Ethics', 'Essay Writing'];
    } else {
      return ['Mock Tests', 'Previous Year Papers', 'Interview Prep'];
    }
  }
  
  // State PSC
  if (phase < 0.3) {
    return ['State History', 'State Geography', 'General Knowledge'];
  } else if (phase < 0.6) {
    return ['State Polity', 'Current Affairs', 'Regional Language'];
  } else {
    return ['Mock Tests', 'Previous Year Papers', 'Interview Prep'];
  }
}

function getHoursForWeek(examType: string, week: number, totalWeeks: number): number {
  const phase = week / totalWeeks;
  
  if (phase < 0.3) return 40; // Foundation phase - more hours
  if (phase < 0.6) return 35; // Building phase
  return 30; // Revision phase - fewer hours, more practice
}

function getFocusForWeek(examType: string, week: number, totalWeeks: number): string {
  const phase = week / totalWeeks;
  
  if (phase < 0.3) return 'Foundation Building';
  if (phase < 0.6) return 'Concept Mastery';
  if (phase < 0.8) return 'Practice & Revision';
  return 'Final Preparation';
}

function getMilestoneForWeek(examType: string): string {
  if (examType === 'SSC') {
    return 'SSC Tier 1 Syllabus Coverage';
  }
  if (examType === 'Banking') {
    return 'Bank PO/Clerk Prelims Syllabus';
  }
  if (examType === 'Railway') {
    return 'RRB NTPC CBT 1 Syllabus';
  }
  if (examType === 'UPSC') {
    return 'UPSC Prelims Syllabus';
  }
  return 'State PSC Prelims Syllabus';
}

function getResourcesForExam(examType: string): string[] {
  const commonResources = [
    'Previous Year Question Papers',
    'Mock Test Series',
    'Current Affairs Compilation',
  ];

  const examSpecificResources: Record<string, string[]> = {
    SSC: [
      'Quantitative Aptitude by R.S. Aggarwal',
      'SSC CGL Previous Papers',
      'English for Competitive Exams by Wren & Martin',
      ...commonResources,
    ],
    Banking: [
      'Quantitative Aptitude for Banking by R.S. Aggarwal',
      'IBPS PO/Clerk Previous Papers',
      'Banking Awareness by Arihant',
      ...commonResources,
    ],
    Railway: [
      'RRB NTPC Guide by Kiran Prakashan',
      'Railway Previous Year Papers',
      'General Science for Railways',
      ...commonResources,
    ],
    UPSC: [
      'Indian Polity by M. Laxmikanth',
      'Modern India by Bipan Chandra',
      'Certificate Physical Geography by G.C. Leong',
      'Economic Survey',
      'Yojana Magazine',
      ...commonResources,
    ],
    'State PSC': [
      'State-specific History Books',
      'State Geography Books',
      'State PSC Previous Papers',
      'Regional Language Grammar',
      ...commonResources,
    ],
  };

  return examSpecificResources[examType] || commonResources;
}
