# AVSARGRID Production Audit - Query Extraction

## Tables Referenced in Codebase

### Allowed Tables (per user requirements)
- profiles
- jobs
- saved_jobs
- applications
- resumes
- study_tracker
- users

### Forbidden Tables (per user requirements - should NOT be created in SQL fix)
- user_profiles
- match_scores
- user_job_eligibility
- career_roadmaps
- resume_analysis

## Query Extraction Results

### File: app/jobs/[id]/page.tsx
- **Line 13**: `.from("jobs")` - select: id, exam_name, conducting_body, location, application_deadline, exam_date, vacancies, status, syllabus, previous_papers, eligibility_criteria
- **Line 56**: `.from("previous_papers")` - select: *
- **Line 82**: `.from("exam_notifications")` - select: *
- **Line 115**: `.from("saved_jobs")` - select: id
- **Line 115**: `.from("saved_jobs")` - insert: user_id, job_id
- **Line 122**: `.from("saved_jobs")` - delete: id

### File: app/settings/page.tsx
- **Line 22**: `.from("user_settings")` - select: *
- **Line 22**: `.from("user_settings")` - upsert: user_id, theme, notifications_enabled, email_alerts
- **Line 48**: `.from("saved_searches")` - select: *
- **Line 48**: `.from("saved_searches")` - upsert: user_id, search_name, filters
- **Line 74**: `.from("job_alerts")` - select: *
- **Line 74**: `.from("job_alerts")` - upsert: user_id, alert_name, criteria
- **Line 100**: `.from("saved_searches")` - delete: id
- **Line 107**: `.from("job_alerts")` - delete: id

### File: app/admin/jobs/page.tsx
- **Line 64**: `.from("jobs")` - select: *
- **Line 64**: `.from("jobs")` - insert: exam_name, conducting_body, location, job_type, category, skills, qualification_required, experience_required, description, is_active, source
- **Line 89**: `.from("jobs")` - update: exam_name, conducting_body, location, job_type, category, skills, qualification_required, experience_required, description, is_active
- **Line 106**: `.from("jobs")` - delete: id

### File: app/api/notifications/generate/route.ts
- **Line 28**: `.from("saved_jobs")` - select: user_id, job_id
- **Line 28**: `.from("jobs")` - select: id, exam_name, application_deadline
- **Line 48**: `.from("exam_notifications")` - insert: user_id, job_id, notification_type, title, message, notification_data

### File: lib/matching/matchScores.ts
- **Line 14**: `.from("users")` - select: id, skills, education, experience_years
- **Line 20**: `.from("resumes")` - select: id, user_id, extracted_skills
- **Line 26**: `.from("jobs")` - select: id, skills, qualification_required, experience_required
- **Line 34**: `.from("match_scores")` - delete: user_id, job_id
- **Line 38**: `.from("match_scores")` - insert: user_id, job_id, match_score, skill_match_count, missing_skills

### File: lib/resumes/upload.ts
- **Line 28**: `.from("resumes")` - select: id, file_url, file_name, uploaded_at
- **Line 36**: `.from("resumes")` - insert: user_id, file_url, file_name, extracted_text, extracted_skills
- **Line 44**: `.from("resumes")` - delete: user_id

### File: app/admin/page.tsx
- **Line 25**: `.from("users")` - select: id, email, full_name, created_at
- **Line 31**: `.from("jobs")` - select: id, count
- **Line 37**: `.from("resumes")` - select: id, count
- **Line 43**: `.from("job_import_logs")` - select: *

### File: app/api/eligibility/check/route.ts
- **Line 35**: `.from("profiles")` - select: *
- **Line 35**: `.from("jobs")` - select: id, eligibility_criteria
- **Line 46**: `.from("user_job_eligibility")` - upsert: user_id, job_id, is_eligible, missing_criteria

### File: app/api/resume/process-complete/route.ts
- **Line 23**: `.from("resumes")` - update: processed, processed_at, extracted_text, extracted_skills
- **Line 31**: `.from("resume_analysis")` - delete: user_id
- **Line 35**: `.from("resume_analysis")` - insert: user_id, resume_id, ats_score, skills_found, missing_skills, missing_keywords, strengths, weaknesses, suggestions, recommended_certifications, recommended_skills

### File: app/dashboard/page.tsx
- **Line 58**: `.from("profiles")` - select: *
- **Line 64**: `.from("applications")` - select: id, job_id, status, created_at
- **Line 64**: `.from("jobs")` - select: id, exam_name, conducting_body, application_deadline
- **Line 82**: `.from("applications")` - update: status

### File: app/recommendations/page.tsx
- **Line 38**: `.from("profiles")` - select: *
- **Line 44**: `.from("jobs")` - select: *
- **Line 50**: `.from("saved_jobs")` - select: job_id
- **Line 56**: `.from("saved_jobs")` - insert: user_id, job_id

### File: lib/jobs/import-remotive.ts
- **Line 42**: `.from("job_import_logs")` - insert: source, status, jobs_count, error_message
- **Line 49**: `.from("jobs_raw")` - insert: external_id, raw_data, source
- **Line 56**: `.from("jobs")` - insert: exam_name, conducting_body, location, job_type, category, skills, qualification_required, experience_required, description, is_active, source, external_id

### File: app/[username]/page.tsx
- **Line 13**: `.from("users")` - select: full_name
- **Line 38**: `.from("users")` - select: *
- **Line 56**: `.from("resume_analysis")` - select: *

### File: app/api/notifications/exam-date-changed/route.ts
- **Line 28**: `.from("jobs")` - select: id, exam_name
- **Line 39**: `.from("saved_jobs")` - select: user_id
- **Line 52**: `.from("exam_notifications")` - insert: user_id, job_id, notification_type, title, message, notification_data

### File: app/api/notifications/result-released/route.ts
- **Line 28**: `.from("jobs")` - select: id, exam_name
- **Line 39**: `.from("saved_jobs")` - select: user_id
- **Line 52**: `.from("exam_notifications")` - insert: user_id, job_id, notification_type, title, message, notification_data

### File: app/admin/import-jobs/page.tsx
- **Line 73**: `.from("jobs")` - select: id
- **Line 87**: `.from("jobs")` - insert: exam_name, conducting_body, location, job_type, category, skills, qualification_required, experience_required, description, is_active, source

### File: app/api/ai/analyze-job/route.ts
- **Line 28**: `.from("resumes")` - select: extracted_text, extracted_skills
- **Line 70**: `.from("job_analysis")` - upsert: user_id, job_id, required_skills, preferred_skills, experience_needed, responsibilities, match_score, missing_skills, analysis_data

### File: app/api/ai/analyze-resume/route.ts
- **Line 78**: `.from("resume_analysis")` - delete: user_id
- **Line 80**: `.from("resume_analysis")` - insert: user_id, resume_id, ats_score, resume_strength, skills_found, missing_skills, missing_keywords, strengths, weaknesses, suggestions, recommended_certifications, recommended_skills

### File: app/api/ai/extract-profile/route.ts
- **Line 16**: `.from("jobs")` - select: exam_name, syllabus
- **Line 17**: `.from("study_tracker")` - select: topic

### File: app/api/career-roadmap/route.ts
- **Line 25**: `.from("users")` - select: *
- **Line 46**: `.from("career_roadmaps")` - insert: user_id, target_role, current_skills, recommended_skills, courses, certifications, roadmap_data

### File: app/api/profile/save-extracted/route.ts
- **Line 25**: `.from("users")` - select: *
- **Line 39**: `.from("users")` - update: (various profile fields)

### File: app/api/study-plans/generate/route.ts
- **Line 71**: `.from("jobs")` - select: *
- **Line 89**: `.from("study_plans")` - insert: user_id, job_id, title, duration_days, plan_json, start_date, end_date, status, created_at, updated_at

### File: app/profile/page.tsx
- **Line 70**: `.from("profiles")` - select: *
- **Line 121**: `.from("profiles")` - upsert: user_id, full_name, phone, state, qualification, degree, branch, skills, languages, exam_preference, updated_at

### File: app/resumes/page.tsx
- **Line 51**: `.from("resumes")` - select: *
- **Line 56**: `.from("resume_analysis")` - select: *

### File: app/saved-jobs/page.tsx
- **Line 20**: `.from("saved_jobs")` - select: *, jobs(*)
- **Line 40**: `.from("saved_jobs")` - delete: id

### File: lib/jobs/duplicate.ts
- **Line 9**: `.from("jobs")` - select: id
- **Line 24**: `.from("jobs")` - select: id

### File: page.tsx
- **Line 52**: `.from("jobs")` - select: id, exam_name, conducting_body, created_at, is_active
- **Line 83**: `.from("jobs")` - insert: exam_name, conducting_body, location, job_type, category, salary_min, salary_max, description, apply_link, is_active, created_at, updated_at, source

### File: scripts/seed-india-jobs.ts
- **Line 70**: `.from("jobs")` - delete: apply_link
- **Line 103**: `.from("jobs")` - insert: title, company_name, location, job_type, category, description, apply_link, salary_min, salary_max, is_active, created_at

### File: scripts/seed-jobs.ts
- **Line 12**: `.from("jobs")` - delete: apply_link
- **Line 78**: `.from("jobs")` - insert: title, company_name, job_type, category, location, salary_min, salary_max, qualification, experience_required, skills, description, apply_link, application_deadline, is_active, created_at

### File: app/api/jobs/expire/route.ts
- **Line 23**: `.from("jobs")` - update: is_active

### File: app/api/jobs/seed/route.ts
- **Line 11**: `.from("jobs")` - select: id

### File: app/jobs/page.tsx
- **Line 45**: `.from("jobs")` - select: *

### File: app/onboarding/page.tsx
- **Line 164**: `.from("profiles")` - upsert: (all profile fields)

### File: app/register/page.tsx
- **Line 103**: `.from("users")` - insert: id, email, full_name

### File: lib/JobCard.tsx
- **Line 126**: `.from("applications")` - insert: user_id, job_id, company, title, status

## Summary of All Tables Referenced

### Tables in Codebase:
1. **jobs** - Referenced in 20+ files
2. **users** - Referenced in 8+ files
3. **profiles** - Referenced in 5+ files
4. **saved_jobs** - Referenced in 6+ files
5. **resumes** - Referenced in 5+ files
6. **applications** - Referenced in 3+ files
7. **resume_analysis** - Referenced in 4+ files (FORBIDDEN)
8. **match_scores** - Referenced in 1 file (FORBIDDEN)
9. **user_job_eligibility** - Referenced in 1 file (FORBIDDEN)
10. **career_roadmaps** - Referenced in 1 file (FORBIDDEN)
11. **exam_notifications** - Referenced in 3+ files
12. **previous_papers** - Referenced in 1 file
13. **study_tracker** - Referenced in 2+ files
14. **study_plans** - Referenced in 1 file
15. **job_import_logs** - Referenced in 2+ files
16. **jobs_raw** - Referenced in 1 file
17. **user_settings** - Referenced in 1 file
18. **saved_searches** - Referenced in 1 file
19. **job_alerts** - Referenced in 1 file
20. **job_analysis** - Referenced in 1 file

### Tables NOT in allowed list:
- exam_notifications
- previous_papers
- study_plans
- job_import_logs
- jobs_raw
- user_settings
- saved_searches
- job_alerts
- job_analysis

### Forbidden tables referenced in code:
- resume_analysis (4+ references)
- match_scores (1 reference)
- user_job_eligibility (1 reference)
- career_roadmaps (1 reference)
