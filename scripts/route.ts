import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const res = await fetch('https://remotive.com/api/remote-jobs?limit=100')
    const { jobs } = await res.json()

    const rows = jobs.map((j: any) => ({
      title: j.title || 'Untitled',
      company_name: j.company_name || 'Unknown Company',
      job_type: j.job_type || 'full_time',
      category: j.category || 'Engineering',
      location: j.candidate_required_location || 'Remote',
      salary_min: null,
      salary_max: null,
      qualification: null,
      experience_required: 0,
      skills: [],
      description: j.description
        ?.replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .slice(0, 2000) || '',
      apply_link: j.url || null,
      application_deadline: null,
      is_active: true,
      created_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('jobs')
      .upsert(rows, { onConflict: 'apply_link', ignoreDuplicates: true })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      count: rows.length,
      message: `Refreshed ${rows.length} jobs`
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}