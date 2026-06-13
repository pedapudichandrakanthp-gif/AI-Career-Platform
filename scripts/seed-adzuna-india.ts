import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID!
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY!

const SEARCH_KEYWORDS = [
  'software developer',
  'data analyst',
  'product manager',
  'React developer'
]

function detectCategory(title: string): string {
  const text = title.toLowerCase()
  if (text.includes('data') || text.includes('analyst')) return 'Data Science'
  if (text.includes('product') || text.includes('manager')) return 'Product'
  return 'Engineering'
}

async function seed() {
  console.log('Starting Adzuna India jobs seed...\n')

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.error('Missing ADZUNA_APP_ID or ADZUNA_APP_KEY in .env.local')
    return
  }

  let totalInserted = 0

  for (const keyword of SEARCH_KEYWORDS) {
    console.log(`Fetching: "${keyword}"...`)
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50&what=${encodeURIComponent(keyword)}&where=india&content-type=application/json`

    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.error(`  Adzuna API error for "${keyword}":`, res.status)
        continue
      }

      const data = await res.json()
      const results = data.results || []
      console.log(`  Found ${results.length} jobs`)

      if (results.length === 0) continue

      const rows = results.map((j: any) => ({
        title: j.title || 'Untitled',
        company_name: j.company?.display_name || 'Unknown Company',
        location: j.location?.display_name || 'India',
        job_type: 'full_time',
        category: detectCategory(j.title || ''),
        description: j.description
          ?.replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&nbsp;/g, ' ')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .slice(0, 2000) || '',
        apply_link: j.redirect_url || null,
        salary_min: j.salary_min ? Math.round(j.salary_min) : null,
        salary_max: j.salary_max ? Math.round(j.salary_max) : null,
        is_active: true,
        created_at: new Date().toISOString()
      }))

      const { error, data: inserted } = await supabase
        .from('jobs')
        .insert(rows)
        .select('id')

      if (error) {
        console.error(`  Error inserting "${keyword}":`, error.message)
      } else {
        console.log(`  ✅ Inserted ${inserted?.length} jobs`)
        totalInserted += inserted?.length || 0
      }
    } catch (err) {
      console.error(`  Fetch exception for "${keyword}":`, err)
    }

    // Wait 1 second between requests to avoid rate limit
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n✅ Total inserted: ${totalInserted} Adzuna Indian jobs`)
}

seed().catch(console.error)