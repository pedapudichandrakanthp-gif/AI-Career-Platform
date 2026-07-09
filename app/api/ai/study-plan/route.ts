import Groq from 'groq-sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const cookieStore = await cookies()
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
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jobId } = await request.json()

    // Fetch exam details
    const { data: job } = await supabase
      .from('jobs')
      .select('exam_name, conducting_body, exam_date, description, qualification_required, syllabus')
      .eq('id', jobId)
      .single()

    if (!job) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('age, qualification, skills, state')
      .eq('user_id', user.id)
      .single()

    // Calculate days remaining
    const today = new Date()
    const examDate = job.exam_date ? new Date(job.exam_date) : null
    const daysRemaining = examDate
      ? Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      : 90

    // Build Groq prompt
    const prompt = `You are an expert Indian government exam coach.

Exam: ${job.exam_name}
Conducting Body: ${job.conducting_body}
Days Remaining: ${daysRemaining}
Candidate: Age ${profile?.age || 'unknown'}, Qualification: ${profile?.qualification || 'Graduate'}
${job.description ? `Exam Description: ${job.description.slice(0, 500)}` : ''}

Create a comprehensive study plan. Return ONLY valid JSON, no markdown:
{
  "exam_overview": "2-3 sentence overview of this exam",
  "total_days": ${daysRemaining},
  "daily_hours": 3,
  "phases": [
    {
      "phase": 1,
      "name": "Foundation",
      "duration_days": ${Math.ceil(daysRemaining * 0.3)},
      "focus": "Basic concepts and fundamentals",
      "subjects": ["Subject 1", "Subject 2"]
    },
    {
      "phase": 2,
      "name": "Practice", 
      "duration_days": ${Math.ceil(daysRemaining * 0.4)},
      "focus": "Topic-wise practice and revision",
      "subjects": ["Subject 1", "Subject 2"]
    },
    {
      "phase": 3,
      "name": "Revision & Mock Tests",
      "duration_days": ${Math.ceil(daysRemaining * 0.3)},
      "focus": "Full mock tests and weak area revision",
      "subjects": ["All subjects revision"]
    }
  ],
  "weekly_schedule": {
    "Monday": ["Subject 1 - Topic A (1hr)", "Subject 2 - Topic B (1hr)"],
    "Tuesday": ["Subject 3 - Topic C (2hr)"],
    "Wednesday": ["Subject 1 revision (1hr)", "Mock test (1hr)"],
    "Thursday": ["Subject 2 - Topic D (2hr)"],
    "Friday": ["Subject 3 - Topic E (1hr)", "Previous year papers (1hr)"],
    "Saturday": ["Full mock test (3hr)"],
    "Sunday": ["Revision + weak areas (2hr)"]
  },
  "key_subjects": ["Subject 1", "Subject 2", "Subject 3"],
  "important_topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
  "preparation_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "recommended_books": ["Book 1 by Author", "Book 2 by Author"],
  "daily_checklist": ["Morning: 1hr theory", "Evening: 1hr practice", "Night: 30min revision"]
}`

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.3
    })

    let studyPlan
    try {
      const choice = completion.choices[0]
      if (!choice) {
        return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
      }
      const text = choice.message.content || '{}'
      studyPlan = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // Save to study_plans table
    const { data: savedPlan } = await supabase
      .from('study_plans')
      .upsert({
        user_id: user.id,
        job_id: jobId,
        exam_name: job.exam_name,
        exam_date: job.exam_date,
        days_remaining: daysRemaining,
        plan_data: studyPlan,
        coverage_percent: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,job_id' })
      .select()
      .single()

    return NextResponse.json({ success: true, plan: studyPlan, planId: savedPlan?.id })

  } catch (error) {
    console.error('Study plan error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
