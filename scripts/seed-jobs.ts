import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) {
    console.log('Already seeded:', count, 'jobs. Skipping.')
    return
  }

  const res = await fetch('https://remotive.com/api/remote-jobs?limit=50')
  const { jobs } = await res.json()

  const rows = jobs.map((j: any) => ({
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location || 'Remote',
    job_type: j.job_type || 'full_time',
    work_mode: 'remote',
    category: j.category || 'Engineering',
    description: j.description?.replace(/<[^>]*>/g, '').slice(0, 1500) || '',
    apply_url: j.url,
    is_active: true,
    created_at: j.publication_date || new Date().toISOString()
  }))

  const { error } = await supabase.from('jobs').insert(rows)
  if (error) console.error('Seed error:', error)
  else console.log('Seeded', rows.length, 'jobs successfully')
}

seed()