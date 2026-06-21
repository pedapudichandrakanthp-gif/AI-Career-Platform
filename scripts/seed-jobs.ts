import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('Deleting existing seeded jobs...')
  const { error: deleteError } = await supabase
    .from('jobs')
    .delete()
    .not('apply_link', 'is', null)

  if (deleteError) {
    console.error('Failed to delete old jobs:', deleteError.message)
  } else {
    console.log('Successfully cleared old seeded jobs.')
  }

  console.log('Fetching from Remotive API...')
  const res = await fetch('https://remotive.com/api/remote-jobs?limit=50')
  
  if (!res.ok) {
    console.error('Remotive API failed:', res.status)
    return
  }

  const data = await res.json() as { jobs: Record<string, unknown>[] }
  const jobs = data.jobs || []
  console.log('Fetched', jobs.length, 'jobs from Remotive')

  const rows = jobs
    .filter((j: Record<string, unknown>) => !!j.title) // Skip jobs without a title
    .map((j: Record<string, unknown>) => ({
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
      apply_link: j.url,
      application_deadline: null,
      is_active: true,
      created_at: new Date().toISOString()
    }))

  if (rows.length === 0) {
    console.log('No valid jobs found to insert.')
    return
  }

  console.log('Sample row:', JSON.stringify(rows[0], null, 2))

  console.log('\nPreparing to insert the following jobs:')
  rows.forEach((r: Record<string, unknown>, idx: number) => {
    console.log(`[${idx + 1}] Title: ${r.title} | Link: ${r.apply_link}`)
  })

  console.log(`\nInserting ${rows.length} rows in batches of 10...`)
  let totalInserted = 0
  
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10)
    const { error, data: inserted } = await supabase
      .from('jobs')
      .insert(batch)
      .select('id')

    if (error) {
      console.error(`\nBatch ${Math.floor(i / 10) + 1} Insert error:`, error.message)
      console.error('Details:', error.details)
    } else {
      totalInserted += inserted?.length || 0
      console.log(`Batch ${Math.floor(i / 10) + 1}: Inserted ${inserted?.length} jobs`)
    }
  }

  console.log(`\n✅ Successfully seeded a total of ${totalInserted} jobs!`)
}

seed().catch(console.error)