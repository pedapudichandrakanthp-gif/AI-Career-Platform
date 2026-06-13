import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!

const INDIA_SEARCHES = [
  'software engineer India',
  'React developer Bangalore',
  'Python developer Mumbai',
  'data analyst Delhi',
  'product manager Hyderabad',
  'Java developer Pune',
  'DevOps engineer Chennai',
  'UI UX designer India',
  'machine learning engineer India',
  'business analyst India'
]

async function fetchJobs(query: string) {
  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=in&date_posted=week`
  
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  })
  
  if (!res.ok) {
    console.error(`JSearch error for "${query}":`, res.status)
    return []
  }
  
  const data = await res.json()
  return data.data || []
}

function mapJobType(type: string): string {
  const t = type?.toLowerCase() || ''
  if (t.includes('full')) return 'full_time'
  if (t.includes('part')) return 'part_time'
  if (t.includes('contract')) return 'contract'
  if (t.includes('intern')) return 'internship'
  return 'full_time'
}

function detectCategory(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase()
  if (text.includes('react') || text.includes('frontend') || text.includes('javascript')) return 'Engineering'
  if (text.includes('python') || text.includes('backend') || text.includes('java')) return 'Engineering'
  if (text.includes('data') || text.includes('analyst') || text.includes('ml')) return 'Data Science'
  if (text.includes('design') || text.includes('ui') || text.includes('ux')) return 'Design'
  if (text.includes('product') || text.includes('manager')) return 'Product'
  if (text.includes('devops') || text.includes('cloud') || text.includes('aws')) return 'DevOps'
  if (text.includes('marketing') || text.includes('seo')) return 'Marketing'
  if (text.includes('sales') || text.includes('business')) return 'Sales'
  return 'Engineering'
}

async function seed() {
  console.log('Starting India jobs seed from JSearch...\n')
  
  // Delete old API-fetched jobs first
  await supabase
    .from('jobs')
    .delete()
    .not('apply_link', 'is', null)
    .like('apply_link', 'http%')
  
  let totalInserted = 0
  
  for (const query of INDIA_SEARCHES) {
    console.log(`Fetching: "${query}"...`)
    
    const jobs = await fetchJobs(query)
    console.log(`  Found ${jobs.length} jobs`)
    
    if (jobs.length === 0) continue
    
    const rows = jobs.map((j: any) => ({
      title: j.job_title || 'Untitled',
      company_name: j.employer_name || 'Unknown',
      location: j.job_city 
        ? `${j.job_city}, ${j.job_country || 'India'}` 
        : (j.job_country || 'India'),
      job_type: mapJobType(j.job_employment_type),
      category: detectCategory(j.job_title, j.job_description || ''),
      description: j.job_description?.slice(0, 2000) || '',
      apply_link: j.job_apply_link || j.job_google_link || null,
      salary_min: j.job_min_salary ? Math.round(j.job_min_salary * 83) : null,
      salary_max: j.job_max_salary ? Math.round(j.job_max_salary * 83) : null,
      is_active: true,
      created_at: new Date().toISOString()
    }))
    
    // Insert batch
    const { error, data: inserted } = await supabase
      .from('jobs')
      .insert(rows)
      .select('id')
    
    if (error) {
      console.error(`  Error inserting ${query}:`, error.message)
    } else {
      console.log(`  ✅ Inserted ${inserted?.length} jobs`)
      totalInserted += inserted?.length || 0
    }
    
    // Wait 1 second between requests to avoid rate limit
    await new Promise(r => setTimeout(r, 1000))
  }
  
  console.log(`\n✅ Total inserted: ${totalInserted} Indian jobs`)
}

seed().catch(console.error)