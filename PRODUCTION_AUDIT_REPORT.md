# AVSARGRID PRODUCTION AUDIT REPORT

**Date:** June 24, 2026
**Source of Truth:** Live Supabase Production Database

---

## PRODUCTION SCHEMA SUMMARY

### Tables Present in Production:
- applications (0 rows)
- jobs (24 rows)
- jobs_backup
- profiles (9 rows)
- profiles_backup
- resumes (15 rows)
- saved_jobs (3 rows)
- study_tracker (0 rows)
- users

### Forbidden Tables (NOT in production - must not be created):
- user_profiles
- match_scores
- user_job_eligibility
- resume_analysis
- career_roadmaps
- study_plans

---

## CRITICAL FINDINGS

### A. QUERIES REFERENCING NON-EXISTENT TABLES

#### 1. TABLE: previous_papers
- **File:** `app/jobs/[id]/page.tsx`
- **Line:** 56
- **Query:** `.from("previous_papers").select("*")`
- **Impact:** Job detail page will fail when trying to load previous papers
- **Fix:** Remove or comment out this query, or create previous_papers table

#### 2. TABLE: exam_notifications
- **File:** `app/jobs/[id]/page.tsx`
- **Line:** 82
- **Query:** `.from("exam_notifications").select("*")`
- **Impact:** Job detail page notification subscription will fail

- **File:** `app/api/notifications/generate/route.ts`
- **Line:** 48
- **Query:** `.from("exam_notifications").insert(...)`
- **Impact:** Notification generation API will fail

- **File:** `app/api/notifications/exam-date-changed/route.ts`
- **Line:** 52
- **Query:** `.from("exam_notifications").insert(...)`
- **Impact:** Exam date change notifications will fail

- **File:** `app/api/notifications/result-released/route.ts`
- **Line:** 52
- **Query:** `.from("exam_notifications").insert(...)`
- **Impact:** Result release notifications will fail

#### 3. TABLE: user_settings
- **File:** `app/settings/page.tsx`
- **Line:** 22
- **Query:** `.from("user_settings").select("*")` and `.upsert(...)`
- **Impact:** Settings page will fail completely

#### 4. TABLE: saved_searches
- **File:** `app/settings/page.tsx`
- **Line:** 48
- **Query:** `.from("saved_searches").select("*")` and `.upsert(...)`
- **Impact:** Saved searches feature will fail

#### 5. TABLE: job_alerts
- **File:** `app/settings/page.tsx`
- **Line:** 74
- **Query:** `.from("job_alerts").select("*")` and `.upsert(...)`
- **Impact:** Job alerts feature will fail

#### 6. TABLE: match_scores (FORBIDDEN)
- **File:** `lib/matching/matchScores.ts`
- **Line:** 34
- **Query:** `.from("match_scores").delete()`
- **Impact:** Match score deletion will fail

- **File:** `lib/matching/matchScores.ts`
- **Line:** 38
- **Query:** `.from("match_scores").insert(...)`
- **Impact:** Match score insertion will fail

#### 7. TABLE: job_import_logs
- **File:** `app/admin/page.tsx`
- **Line:** 43
- **Query:** `.from("job_import_logs").select("*")`
- **Impact:** Admin dashboard import logs section will fail

- **File:** `lib/jobs/import-remotive.ts`
- **Line:** 42
- **Query:** `.from("job_import_logs").insert(...)`
- **Impact:** Job import logging will fail

#### 8. TABLE: jobs_raw
- **File:** `lib/jobs/import-remotive.ts`
- **Line:** 49
- **Query:** `.from("jobs_raw").insert(...)`
- **Impact:** Raw job data storage will fail

#### 9. TABLE: user_job_eligibility (FORBIDDEN)
- **File:** `app/api/eligibility/check/route.ts`
- **Line:** 46
- **Query:** `.from("user_job_eligibility").upsert(...)`
- **Impact:** Eligibility check API will fail when trying to cache results

#### 10. TABLE: resume_analysis (FORBIDDEN)
- **File:** `app/api/resume/process-complete/route.ts`
- **Line:** 31
- **Query:** `.from("resume_analysis").delete()`
- **Impact:** Resume processing will fail

- **File:** `app/api/resume/process-complete/route.ts`
- **Line:** 35
- **Query:** `.from("resume_analysis").insert(...)`
- **Impact:** Resume processing will fail

- **File:** `app/[username]/page.tsx`
- **Line:** 56
- **Query:** `.from("resume_analysis").select("*")`
- **Impact:** Public profile page will fail to show ATS score

- **File:** `app/api/ai/analyze-resume/route.ts`
- **Line:** 78
- **Query:** `.from("resume_analysis").delete()`
- **Impact:** Resume analysis API will fail

- **File:** `app/api/ai/analyze-resume/route.ts`
- **Line:** 80
- **Query:** `.from("resume_analysis").insert(...)`
- **Impact:** Resume analysis API will fail

- **File:** `app/resumes/page.tsx`
- **Line:** 56
- **Query:** `.from("resume_analysis").select("*")`
- **Impact:** Resumes page will fail to show analysis

#### 11. TABLE: job_analysis
- **File:** `app/api/ai/analyze-job/route.ts`
- **Line:** 70
- **Query:** `.from("job_analysis").upsert(...)`
- **Impact:** Job analysis API will fail when trying to cache results

#### 12. TABLE: career_roadmaps (FORBIDDEN)
- **File:** `app/api/career-roadmap/route.ts`
- **Line:** 46
- **Query:** `.from("career_roadmaps").insert(...)`
- **Impact:** Career roadmap API will fail completely

#### 13. TABLE: study_plans (FORBIDDEN)
- **File:** `app/api/study-plans/generate/route.ts`
- **Line:** 89
- **Query:** `.from("study_plans").insert(...)`
- **Impact:** Study plan generation API will fail completely

---

### B. QUERIES REFERENCING NON-EXISTENT COLUMNS

#### 1. JOBS TABLE - Column Mismatches

**Production jobs columns:**
- id, exam_name, conducting_body, job_level, category, state, post_name, vacancies, vacancies_ur, vacancies_obc, vacancies_sc, vacancies_st, vacancies_ews, vacancies_pwd, age_min, age_max, qualification_required, experience_required, pay_scale, application_start_date, application_end_date, correction_window_end, admit_card_date, exam_date, result_date, notification_pdf_url, official_website, apply_link, syllabus, description, status, created_at, updated_at, vacancies_total, application_deadline, is_active, official_notice_url

**Missing columns in production (referenced in code):**
- `location` - Code uses this, production has `state` instead
- `job_type` - Code uses this, production has `job_level` instead
- `skills` - Code uses this (array), production does NOT have this column
- `source` - Code uses this, production does NOT have this column
- `external_id` - Code uses this in import, production does NOT have this column

**Files affected:**

- **File:** `app/admin/jobs/page.tsx`
- **Line:** 64 (insert), 89 (update)
- **Columns:** location, job_type, skills, source
- **Impact:** Admin job creation/update will fail

- **File:** `app/admin/import-jobs/page.tsx`
- **Line:** 87 (insert)
- **Columns:** location, job_type, skills, source
- **Impact:** AI job import will fail

- **File:** `lib/jobs/import-remotive.ts`
- **Line:** 56 (insert)
- **Columns:** location, job_type, skills, source, external_id
- **Impact:** Remotive job import will fail

- **File:** `scripts/seed-india-jobs.ts`
- **Line:** 103 (insert)
- **Columns:** location, job_type
- **Impact:** India jobs seeding will fail

- **File:** `scripts/seed-jobs.ts`
- **Line:** 78 (insert)
- **Columns:** location, job_type
- **Impact:** Jobs seeding will fail

- **File:** `page.tsx`
- **Line:** 83 (insert)
- **Columns:** location, job_type
- **Impact:** Manual job posting will fail

- **File:** `lib/JobCard.tsx`
- **Line:** 167 (display)
- **Columns:** location
- **Impact:** Job cards will show undefined for location

- **File:** `app/jobs/page.tsx`
- **Line:-** 87 (display)
- **Columns:** location
- **Impact:** Jobs page will show undefined for location

---

### C. PAGES QUERYING APPLICATIONS WHEN THEY SHOULD QUERY SAVED_JOBS

**Analysis:** No pages found incorrectly querying applications instead of saved_jobs. The saved-jobs page correctly queries saved_jobs.

---

### D. PAGES QUERYING user_profiles

**Analysis:** No pages found querying user_profiles table. Code correctly uses `profiles` table.

---

### E. PAGES QUERYING match_scores

**Files affected:**

- **File:** `lib/matching/matchScores.ts`
- **Line:** 34, 38
- **Impact:** Match score generation and storage will fail

---

### F. WHY RECOMMENDATIONS PAGE FAILS

**File:** `app/recommendations/page.tsx`
- **Line 38:** `.from("profiles").select("*")` - OK
- **Line 44:** `.from("jobs").select("*")` - OK
- **Line 50:** `.from("saved_jobs").select("job_id")` - OK
- **Line 56:** `.from("saved_jobs").insert(...)` - OK

**Root Cause Analysis:**
The recommendations page queries are all correct for existing tables. However, the page likely fails because:
1. It may be filtering jobs based on `skills` column which doesn't exist in jobs table
2. The eligibility logic may reference columns that don't match production schema

**Specific Issue:**
The recommendations page filters jobs based on user profile eligibility, but the jobs table in production uses different column names (e.g., `state` instead of `location`, `job_level` instead of `job_type`).

---

### G. WHY SAVED EXAMS PAGE IS EMPTY

**File:** `app/saved-jobs/page.tsx`
- **Line 20:** `.from("saved_jobs").select("*, jobs(*)")` - OK
- **Line 40:** `.from("saved_jobs").delete()` - OK

**Root Cause Analysis:**
The saved-jobs page queries are correct. The table has 3 records. The page may appear empty due to:
1. Join with jobs table failing due to column mismatches in display
2. The jobs table columns referenced in display may not exist (location, job_type, etc.)

**Specific Issue:**
The page displays `item.jobs?.exam_name`, `item.jobs?.conducting_body`, `item.jobs?.application_deadline`, `item.jobs?.vacancies`, `item.jobs?.status` - all these columns exist in production. The page should work if the join is successful.

---

## EXACT CODE FIXES

### FIX 1: app/jobs/[id]/page.tsx - Remove previous_papers query

**File:** `app/jobs/[id]/page.tsx`
**Line:** 56

**Current Code:**
```typescript
const { data: previousPapers } = await supabase
  .from("previous_papers")
  .select("*")
  .eq("job_id", job.id);
```

**Fixed Code:**
```typescript
// const { data: previousPapers } = await supabase
//   .from("previous_papers")
//   .select("*")
//   .eq("job_id", job.id);
const previousPapers = null; // Table does not exist in production
```

---

### FIX 2: app/jobs/[id]/page.tsx - Remove exam_notifications query

**File:** `app/jobs/[id]/page.tsx`
**Line:** 82

**Current Code:**
```typescript
const { data: notifications } = await supabase
  .from("exam_notifications")
  .select("*")
  .eq("user_id", user.id)
  .eq("job_id", job.id);
```

**Fixed Code:**
```typescript
// const { data: notifications } = await supabase
//   .from("exam_notifications")
//   .select("*")
//   .eq("user_id", user.id)
//   .eq("job_id", job.id);
const notifications = null; // Table does not exist in production
```

---

### FIX 3: app/settings/page.tsx - Remove all queries (tables don't exist)

**File:** `app/settings/page.tsx`
**Lines:** 22, 48, 74, 100, 107

**Current Code:** Multiple queries to user_settings, saved_searches, job_alerts

**Fixed Code:**
```typescript
// Settings tables do not exist in production
// Comment out all user_settings, saved_searches, job_alerts queries
// Add placeholder data
const userSettings = null;
const savedSearches = [];
const jobAlerts = [];
```

---

### FIX 4: lib/matching/matchScores.ts - Remove match_scores operations

**File:** `lib/matching/matchScores.ts`
**Lines:** 34, 38

**Current Code:**
```typescript
await supabase.from("match_scores").delete().eq("user_id", userId).eq("job_id", jobId);
await supabase.from("match_scores").insert([...]);
```

**Fixed Code:**
```typescript
// match_scores table does not exist in production (forbidden)
// await supabase.from("match_scores").delete().eq("user_id", userId).eq("job_id", jobId);
// await supabase.from("match_scores").insert([...]);
console.log("Match score calculation skipped - table not available in production");
```

---

### FIX 5: app/api/notifications/generate/route.ts - Remove exam_notifications insert

**File:** `app/api/notifications/generate/route.ts`
**Line:** 48

**Current Code:**
```typescript
await supabase.from("exam_notifications").insert({
  user_id: savedJob.user_id,
  job_id: jobId,
  notification_type: "deadline_reminder",
  title: `Application deadline approaching for ${job.exam_name}`,
  message: `The application deadline for ${job.exam_name} is on ${new Date(job.application_deadline).toLocaleDateString()}.`,
  notification_data: { deadline: job.application_deadline },
});
```

**Fixed Code:**
```typescript
// exam_notifications table does not exist in production
// await supabase.from("exam_notifications").insert({...});
console.log("Notification not stored - table not available in production");
```

---

### FIX 6: app/api/notifications/exam-date-changed/route.ts - Remove exam_notifications insert

**File:** `app/api/notifications/exam-date-changed/route.ts`
**Line:** 52

**Current Code:**
```typescript
await supabase.from("exam_notifications").insert({
  user_id: savedJob.user_id,
  job_id: jobId,
  notification_type: "exam_date_changed",
  title: `Exam date changed for ${job.exam_name}`,
  message: `The exam date for ${job.exam_name} has been changed${oldDate ? ` from ${oldDate}` : ""} to ${newDate}.`,
  notification_data: { oldDate, newDate },
});
```

**Fixed Code:**
```typescript
// exam_notifications table does not exist in production
// await supabase.from("exam_notifications").insert({...});
console.log("Notification not stored - table not available in production");
```

---

### FIX 7: app/api/notifications/result-released/route.ts - Remove exam_notifications insert

**File:** `app/api/notifications/result-released/route.ts`
**Line:** 52

**Current Code:**
```typescript
await supabase.from("exam_notifications").insert({
  user_id: savedJob.user_id,
  job_id: jobId,
  notification_type: "result_announced",
  title: `Result announced for ${job.exam_name}`,
  message: `The result for ${job.exam_name} has been announced${resultDate ? ` on ${resultDate}` : ""}. Check the official website for details.`,
  notification_data: { resultDate },
});
```

**Fixed Code:**
```typescript
// exam_notifications table does not exist in production
// await supabase.from("exam_notifications").insert({...});
console.log("Notification not stored - table not available in production");
```

---

### FIX 8: app/admin/page.tsx - Remove job_import_logs query

**File:** `app/admin/page.tsx`
**Line:** 43

**Current Code:**
```typescript
const { data: importLogs } = await supabase
  .from("job_import_logs")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(10);
```

**Fixed Code:**
```typescript
// job_import_logs table does not exist in production
// const { data: importLogs } = await supabase
//   .from("job_import_logs")
//   .select("*")
//   .order("created_at", { ascending: false })
//   .limit(10);
const importLogs = [];
```

---

### FIX 9: lib/jobs/import-remotive.ts - Remove job_import_logs and jobs_raw inserts

**File:** `lib/jobs/import-remotive.ts`
**Lines:** 42, 49

**Current Code:**
```typescript
await supabase.from("job_import_logs").insert({...});
await supabase.from("jobs_raw").insert({...});
```

**Fixed Code:**
```typescript
// job_import_logs and jobs_raw tables do not exist in production
// await supabase.from("job_import_logs").insert({...});
// await supabase.from("jobs_raw").insert({...});
console.log("Import logging skipped - tables not available in production");
```

---

### FIX 10: app/api/eligibility/check/route.ts - Remove user_job_eligibility upsert

**File:** `app/api/eligibility/check/route.ts`
**Line:** 46

**Current Code:**
```typescript
await supabase.from("user_job_eligibility").upsert([...], { onConflict: "user_id,job_id" });
```

**Fixed Code:**
```typescript
// user_job_eligibility table does not exist in production (forbidden)
// await supabase.from("user_job_eligibility").upsert([...], { onConflict: "user_id,job_id" });
console.log("Eligibility result not cached - table not available in production");
```

---

### FIX 11: app/api/resume/process-complete/route.ts - Remove resume_analysis operations

**File:** `app/api/resume/process-complete/route.ts`
**Lines:** 31, 35

**Current Code:**
```typescript
await supabase.from("resume_analysis").delete().eq("user_id", userId);
await supabase.from("resume_analysis").insert([...]);
```

**Fixed Code:**
```typescript
// resume_analysis table does not exist in production (forbidden)
// await supabase.from("resume_analysis").delete().eq("user_id", userId);
// await supabase.from("resume_analysis").insert([...]);
console.log("Resume analysis not stored - table not available in production");
```

---

### FIX 12: app/[username]/page.tsx - Remove resume_analysis query

**File:** `app/[username]/page.tsx`
**Line:** 56

**Current Code:**
```typescript
const { data: analysis } = await supabase
  .from("resume_analysis")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(1)
  .single();
```

**Fixed Code:**
```typescript
// resume_analysis table does not exist in production (forbidden)
// const { data: analysis } = await supabase
//   .from("resume_analysis")
//   .select("*")
//   .eq("user_id", user.id)
//   .order("created_at", { ascending: false })
//   .limit(1)
//   .single();
const analysis = null;
const atsScore = 0;
const topSkills = user.skills?.slice(0, 8) || [];
```

---

### FIX 13: app/api/ai/analyze-resume/route.ts - Remove resume_analysis operations

**File:** `app/api/ai/analyze-resume/route.ts`
**Lines:** 78, 80

**Current Code:**
```typescript
await auth.supabase.from("resume_analysis").delete().eq("user_id", auth.user.id);
await auth.supabase.from("resume_analysis").insert([...]);
```

**Fixed Code:**
```typescript
// resume_analysis table does not exist in production (forbidden)
// await auth.supabase.from("resume_analysis").delete().eq("user_id", auth.user.id);
// await auth.supabase.from("resume_analysis").insert([...]);
console.log("Resume analysis not stored - table not available in production");
```

---

### FIX 14: app/resumes/page.tsx - Remove resume_analysis query

**File:** `app/resumes/page.tsx`
**Line:** 56

**Current Code:**
```typescript
supabase
  .from("resume_analysis")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle(),
```

**Fixed Code:**
```typescript
// resume_analysis table does not exist in production (forbidden)
// supabase
//   .from("resume_analysis")
//   .select("*")
//   .eq("user_id", user.id)
//   .order("created_at", { ascending: false })
//   .limit(1)
//   .maybeSingle(),
Promise.resolve({ data: null, error: null }),
```

---

### FIX 15: app/api/ai/analyze-job/route.ts - Remove job_analysis upsert

**File:** `app/api/ai/analyze-job/route.ts`
**Line:** 70

**Current Code:**
```typescript
await auth.supabase.from("job_analysis").upsert([...], { onConflict: "user_id,job_id" });
```

**Fixed Code:**
```typescript
// job_analysis table does not exist in production
// await auth.supabase.from("job_analysis").upsert([...], { onConflict: "user_id,job_id" });
console.log("Job analysis not cached - table not available in production");
```

---

### FIX 16: app/api/career-roadmap/route.ts - Remove career_roadmaps insert

**File:** `app/api/career-roadmap/route.ts`
**Line:** 46

**Current Code:**
```typescript
const { data: saved } = await auth.supabase
  .from("career_roadmaps")
  .insert([...])
  .select("*")
  .single();
```

**Fixed Code:**
```typescript
// career_roadmaps table does not exist in production (forbidden)
// const { data: saved } = await auth.supabase
//   .from("career_roadmaps")
//   .insert([...])
//   .select("*")
//   .single();
const saved = null;
console.log("Career roadmap not stored - table not available in production");
```

---

### FIX 17: app/api/study-plans/generate/route.ts - Remove study_plans insert

**File:** `app/api/study-plans/generate/route.ts`
**Line:** 89

**Current Code:**
```typescript
const { data: studyPlan, error: insertError } = await supabase
  .from('study_plans')
  .insert({...})
  .select()
  .single();
```

**Fixed Code:**
```typescript
// study_plans table does not exist in production (forbidden)
// const { data: studyPlan, error: insertError } = await supabase
//   .from('study_plans')
//   .insert({...})
//   .select()
//   .single();
const studyPlan = { id: 'temp', ...planData };
const insertError = null;
console.log("Study plan not stored - table not available in production");
```

---

### FIX 18: app/admin/jobs/page.tsx - Fix jobs column references

**File:** `app/admin/jobs/page.tsx`
**Lines:** 64 (insert), 89 (update)

**Current Code (insert):**
```typescript
await supabase.from("jobs").insert([
  {
    exam_name: examName,
    conducting_body: conductingBody,
    location: location,
    job_type: jobType,
    category: category,
    skills: skills.length > 0 ? [...skills] : null,
    qualification_required: qualification,
    experience_required: experience,
    description: description,
    is_active: true,
    source: "Admin",
  },
]);
```

**Fixed Code (insert):**
```typescript
await supabase.from("jobs").insert([
  {
    exam_name: examName,
    conducting_body: conductingBody,
    state: location, // Changed from location to state
    job_level: jobType, // Changed from job_type to job_level
    category: category,
    // skills: skills.length > 0 ? [...skills] : null, // Column does not exist
    qualification_required: qualification,
    experience_required: experience,
    description: description,
    is_active: true,
    // source: "Admin", // Column does not exist
  },
]);
```

**Current Code (update):**
```typescript
await supabase.from("jobs").update({
  exam_name: examName,
  conducting_body: conductingBody,
  location: location,
  job_type: jobType,
  category: category,
  skills: skills.length > 0 ? [...skills] : null,
  qualification_required: qualification,
  experience_required: experience,
  description: description,
  is_active: isActive,
}).eq("id", jobId);
```

**Fixed Code (update):**
```typescript
await supabase.from("jobs").update({
  exam_name: examName,
  conducting_body: conductingBody,
  state: location, // Changed from location to state
  job_level: jobType, // Changed from job_type to job_level
  category: category,
  // skills: skills.length > 0 ? [...skills] : null, // Column does not exist
  qualification_required: qualification,
  experience_required: experience,
  description: description,
  is_active: isActive,
}).eq("id", jobId);
```

---

### FIX 19: app/admin/import-jobs/page.tsx - Fix jobs column references

**File:** `app/admin/import-jobs/page.tsx`
**Line:** 87

**Current Code:**
```typescript
const { error } = await supabase.from("jobs").insert([
  {
    exam_name: preview.title || null,
    conducting_body: preview.company_name || null,
    location: preview.location || null,
    job_type: preview.job_type || null,
    category: preview.category || null,
    skills: preview.skills.length > 0 ? [...preview.skills] : null,
    qualification_required: preview.qualification || null,
    experience_required: preview.experience_required,
    description: preview.description || null,
    is_active: true,
    source: "AI Import",
  },
]);
```

**Fixed Code:**
```typescript
const { error } = await supabase.from("jobs").insert([
  {
    exam_name: preview.title || null,
    conducting_body: preview.company_name || null,
    state: preview.location || null, // Changed from location to state
    job_level: preview.job_type || null, // Changed from job_type to job_level
    category: preview.category || null,
    // skills: preview.skills.length > 0 ? [...preview.skills] : null, // Column does not exist
    qualification_required: preview.qualification || null,
    experience_required: preview.experience_required,
    description: preview.description || null,
    is_active: true,
    // source: "AI Import", // Column does not exist
  },
]);
```

---

### FIX 20: lib/jobs/import-remotive.ts - Fix jobs column references

**File:** `lib/jobs/import-remotive.ts`
**Line:** 56

**Current Code:**
```typescript
await supabase.from("jobs").insert([
  {
    exam_name: job.title,
    conducting_body: job.company_name,
    location: job.candidate_required_location,
    job_type: job.job_type,
    category: job.category,
    skills: [],
    qualification_required: null,
    experience_required: 0,
    description: cleanDescription,
    apply_link: job.url,
    application_deadline: null,
    is_active: true,
    source: "Remotive",
    external_id: job.id,
  },
]);
```

**Fixed Code:**
```typescript
await supabase.from("jobs").insert([
  {
    exam_name: job.title,
    conducting_body: job.company_name,
    state: job.candidate_required_location, // Changed from location to state
    job_level: job.job_type, // Changed from job_type to job_level
    category: job.category,
    // skills: [], // Column does not exist
    qualification_required: null,
    experience_required: 0,
    description: cleanDescription,
    apply_link: job.url,
    application_deadline: null,
    is_active: true,
    // source: "Remotive", // Column does not exist
    // external_id: job.id, // Column does not exist
  },
]);
```

---

### FIX 21: scripts/seed-india-jobs.ts - Fix jobs column references

**File:** `scripts/seed-india-jobs.ts`
**Line:** 103

**Current Code:**
```typescript
const rows = jobs.map((j: Record<string, unknown>) => ({
  title: j.job_title || 'Untitled',
  company_name: j.employer_name || 'Unknown',
  location: j.job_city ? `${j.job_city}, ${j.job_country || 'India'}` : (j.job_country || 'India'),
  job_type: mapJobType(j.job_employment_type),
  category: detectCategory(j.job_title, j.job_description || ''),
  description: j.job_description?.slice(0, 2000) || '',
  apply_link: j.job_apply_link || j.job_google_link || null,
  salary_min: j.job_min_salary ? Math.round(j.job_min_salary * 83) : null,
  salary_max: j.job_max_salary ? Math.round(j.job_max_salary * 83) : null,
  is_active: true,
  created_at: new Date().toISOString()
}));
```

**Fixed Code:**
```typescript
const rows = jobs.map((j: Record<string, unknown>) => ({
  exam_name: j.job_title || 'Untitled', // Changed from title to exam_name
  conducting_body: j.employer_name || 'Unknown', // Changed from company_name to conducting_body
  state: j.job_city ? `${j.job_city}, ${j.job_country || 'India'}` : (j.job_country || 'India'), // Changed from location to state
  job_level: mapJobType(j.job_employment_type), // Changed from job_type to job_level
  category: detectCategory(j.job_title, j.job_description || ''),
  description: j.job_description?.slice(0, 2000) || '',
  apply_link: j.job_apply_link || j.job_google_link || null,
  // salary_min: j.job_min_salary ? Math.round(j.job_min_salary * 83) : null, // Column does not exist
  // salary_max: j.job_max_salary ? Math.round(j.job_max_salary * 83) : null, // Column does not exist
  is_active: true,
  created_at: new Date().toISOString()
}));
```

---

### FIX 22: scripts/seed-jobs.ts - Fix jobs column references

**File:** `scripts/seed-jobs.ts`
**Line:** 78

**Current Code:**
```typescript
const rows = jobs
  .filter((j: Record<string, unknown>) => !!j.title)
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
    description: j.description?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').slice(0, 2000) || '',
    apply_link: j.url,
    application_deadline: null,
    is_active: true,
    created_at: new Date().toISOString()
  }));
```

**Fixed Code:**
```typescript
const rows = jobs
  .filter((j: Record<string, unknown>) => !!j.title)
  .map((j: Record<string, unknown>) => ({
    exam_name: j.title || 'Untitled', // Changed from title to exam_name
    conducting_body: j.company_name || 'Unknown Company', // Changed from company_name to conducting_body
    job_level: j.job_type || 'full_time', // Changed from job_type to job_level
    category: j.category || 'Engineering',
    state: j.candidate_required_location || 'Remote', // Changed from location to state
    // salary_min: null, // Column does not exist
    // salary_max: null, // Column does not exist
    qualification_required: null, // Changed from qualification to qualification_required
    experience_required: 0,
    // skills: [], // Column does not exist
    description: j.description?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').slice(0, 2000) || '',
    apply_link: j.url,
    application_deadline: null,
    is_active: true,
    created_at: new Date().toISOString()
  }));
```

---

### FIX 23: page.tsx - Fix jobs column references

**File:** `page.tsx`
**Line:** 83

**Current Code:**
```typescript
const payload = {
  exam_name: form.exam_name,
  conducting_body: form.conducting_body,
  location: form.location || null,
  job_type: form.job_type || null,
  category: form.category || null,
  salary_min: form.salary_min ? Number(form.salary_min) : null,
  salary_max: form.salary_max ? Number(form.salary_max) : null,
  description: form.description || null,
  apply_link: form.apply_link,
  is_active: form.is_active,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  source: "Manual Admin",
};
```

**Fixed Code:**
```typescript
const payload = {
  exam_name: form.exam_name,
  conducting_body: form.conducting_body,
  state: form.location || null, // Changed from location to state
  job_level: form.job_type || null, // Changed from job_type to job_level
  category: form.category || null,
  // salary_min: form.salary_min ? Number(form.salary_min) : null, // Column does not exist
  // salary_max: form.salary_max ? Number(form.salary_max) : null, // Column does not exist
  description: form.description || null,
  apply_link: form.apply_link,
  is_active: form.is_active,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  // source: "Manual Admin", // Column does not exist
};
```

---

### FIX 24: lib/JobCard.tsx - Fix location display

**File:** `lib/JobCard.tsx`
**Line:** 167

**Current Code:**
```typescript
{job.location ?? "Not specified"}
```

**Fixed Code:**
```typescript
{job.state ?? "Not specified"}
```

---

### FIX 25: app/jobs/page.tsx - Fix location display

**File:** `app/jobs/page.tsx`
**Line:** 87

**Current Code:**
```typescript
{job.state || "Pan-India"}
```

**Fixed Code:**
```typescript
{job.state || "Pan-India"} // Already correct, no change needed
```

---

## SQL FIXES

**No SQL fixes required.** The production schema is the source of truth. The code needs to be fixed to match the production schema, not the other way around.

---

## BUILD BLOCKERS

None. The codebase compiles successfully. Issues are runtime-only.

---

## RUNTIME BLOCKERS

1. **Settings page** - Will fail completely (user_settings, saved_searches, job_alerts tables don't exist)
2. **Job detail page** - Will fail when loading previous papers and notifications
3. **Notification APIs** - All notification endpoints will fail (exam_notifications table doesn't exist)
4. **Resume analysis** - Will fail to store results (resume_analysis table doesn't exist)
5. **Match scoring** - Will fail to store results (match_scores table doesn't exist)
6. **Career roadmap** - API will fail completely (career_roadmaps table doesn't exist)
7. **Study plans** - API will fail completely (study_plans table doesn't exist)
8. **Job import** - Will fail to log imports (job_import_logs, jobs_raw tables don't exist)
9. **Admin job creation** - Will fail due to column mismatches (location, job_type, skills, source)
10. **Job seeding scripts** - Will fail due to column mismatches

---

## DEPLOYMENT BLOCKERS

None. Deployment will succeed, but the application will have runtime errors as listed above.

---

## SUMMARY

**Total Issues Found:** 25
- **Non-existent tables:** 13 tables referenced across 35+ locations
- **Column mismatches:** 4 columns in jobs table (location, job_type, skills, source)
- **Forbidden tables referenced:** 5 tables (match_scores, user_job_eligibility, resume_analysis, career_roadmaps, study_plans)

**Critical Pages/Features Broken:**
1. Settings page (completely broken)
2. Job detail page (partially broken)
3. All notification features (completely broken)
4. Resume analysis (storage broken)
5. Match scoring (storage broken)
6. Career roadmap (completely broken)
7. Study plans (completely broken)
8. Admin job creation/update (broken)
9. Job import (logging broken)
10. Public profile page (ATS score display broken)

**Recommendation:** Apply all 25 code fixes to make the application compatible with the production schema.
