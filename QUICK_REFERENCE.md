# QUICK REFERENCE: Feature Priority & Migration Plan
## One-Page Executive Summary

**Status:** Architecture Complete | **No Code Changes Yet** | **Ready to Start Phase 1**

---

# CRITICAL PRIORITY (BUILD FIRST - Week 1)

| # | Feature | Hours | Impact | Status |
|---|---------|-------|--------|--------|
| 1 | **Eligibility Engine** | 8h | Core differentiator - users need to know if they can apply | ❌ Not started |
| 2 | **Gov Profile** | 4h | 80% done in onboarding, just finish it | ⏳ Partial |
| 3 | **Recommendations** | 4h | Replace match % with eligible/not eligible | ❌ Not started |
| 4 | **Dashboard Update** | 5h | Show gov metrics instead of match scores | ❌ Not started |
| 5 | **Study Plans** | 10h | HIGHEST ENGAGEMENT - users return daily | ❌ Not started |
| 6 | **App Tracking** | 4h | Show where user is in selection process | ⏳ Partial |
| 7 | **Alerts** | 2h | Notify of deadlines (7/3/1 day warnings) | ❌ Not started |

**Subtotal: 37 hours | Result: Core platform launches**

---

# HIGH PRIORITY (Week 2-3)

| # | Feature | Hours | Impact | 
|---|---------|-------|--------|
| 8 | Previous Papers | 4h | Users expect past papers for practice |
| 9 | Syllabus Mapping | 6h | Structure study plan by topics |
| 10 | Practice Tests | 10h | Most engaging - users validate readiness |
| 11 | Exam Readiness Score | 6h | AI tells users: "You're 65% ready" |
| 12 | State Exams | 5h | Expand to all 28 states |

**Subtotal: 31 hours | Result: Full learning ecosystem**

---

# MEDIUM PRIORITY (Week 4+)

| # | Feature | Hours | Impact |
|---|---------|-------|--------|
| 13-17 | Peer Compare, Interview Prep, Success Stories, AI Readiness, Results Archive | 23h | Gamification & engagement |

**Subtotal: 23 hours | Result: Sticky, engaging platform**

---

# POST-MVP (Premium Features)

| # | Feature | Hours | Impact |
|---|---------|-------|--------|
| 18-20 | AI Doubt Resolution, Mock Interviews, Coaching Tools | 40h+ | Monetization & enterprise |

**Subtotal: 40+ hours | Result: Premium tiers & B2B market**

---

# WHAT TO DELETE

**Files (10 total):**
```
❌ lib/matching/matchScores.ts
❌ lib/matching/scoring.ts
❌ lib/match-score.ts
❌ app/api/match-scores/ (folder)
❌ app/api/career-roadmap/ (folder)
❌ components/dashboard/CareerRoadmapWidget.tsx
❌ components/dashboard/SkillGapWidget.tsx
❌ components/dashboard/MissingSkillsWidget.tsx
❌ components/dashboard/ResumeAnalysisCard.tsx
❌ page.tsx (admin job form)
```

**Database Tables (6 total):**
```sql
❌ match_scores
❌ resume_analysis
❌ job_analysis
❌ career_roadmaps
❌ saved_searches
❌ (repurpose job_alerts as exam_notifications)
```

**API Endpoints (6 total):**
```
❌ POST /api/match-scores/generate
❌ POST /api/match-scores/regenerate
❌ GET /api/match-scores/get-user-recommendations
❌ POST /api/career-roadmap
❌ POST /api/ai/analyze-resume
❌ POST /api/ai/analyze-job
```

---

# WHAT TO CREATE

**Core Files (Week 1):**
```
✅ lib/eligibility/engine.ts (rules engine)
✅ app/api/eligibility/check/route.ts
✅ components/dashboard/EligibleJobsWidget.tsx
✅ lib/ai/study-plan.ts (AI study plan generator)
✅ components/dashboard/StudyProgressWidget.tsx
✅ lib/notifications/closing-soon.ts
```

**Database Schema (Week 1):**
```sql
✅ CREATE user_profiles (gov profile data)
✅ CREATE user_job_eligibility (eligibility cache)
✅ CREATE study_plans (exam prep plans)
✅ CREATE daily_study_tasks (daily assignments)
✅ CREATE exam_notifications (alerts)
✅ CREATE previous_papers (past papers archive)
✅ CREATE study_resources (books, videos, etc)
```

---

# MODIFIED DATABASE SCHEMA

**Remove from `jobs` table:**
- work_mode → not applicable
- external_id → Remotive ID not needed
- clean_title → artifact
- source → job source tracking

**Add to `jobs` table:**
```
age_min, age_max, category_relaxation (JSONB)
vacancies_by_category (JSONB)
exam_date, application_deadline
selection_process (TEXT[])
syllabus_url, previous_papers_url
conducting_body (SSC, UPSC, etc)
state_specific (BOOLEAN)
```

**Remove from `users` table:**
- expected_salary
- preferred_job_type
- work_mode
- experience_years
- projects

**Add to `users` table:**
```
exam_state_preference
exam_category_preferences (array)
```

---

# API TRANSFORMATION

## DELETE (6 endpoints)
```
❌ POST /api/match-scores/generate
❌ POST /api/match-scores/regenerate
❌ GET /api/match-scores/get-user-recommendations
❌ POST /api/career-roadmap
❌ POST /api/ai/analyze-resume
❌ POST /api/ai/analyze-job
```

## CREATE (12 endpoints)
```
✅ GET /api/eligibility/check
✅ POST /api/eligibility/bulk-check
✅ GET /api/eligibility/get-eligible-jobs
✅ POST /api/eligibility/recalculate
✅ POST /api/ai/exam-readiness
✅ POST /api/ai/exam-strategy
✅ POST /api/ai/generate-study-plan
✅ GET /api/study-plans/{id}
✅ POST /api/study-plans/{id}/mark-task-complete
✅ GET /api/notifications/exam
✅ POST /api/admin/import-government-jobs
✅ POST /api/previous-papers/{jobId}
```

## MODIFY (1 endpoint)
```
🔄 POST /api/jobs
   OLD: Generate cover letter
   NEW: Generate study plan
```

---

# UI COMPONENTS

## DELETE (5)
- CareerRoadmapWidget
- SkillGapWidget
- MissingSkillsWidget
- ResumeAnalysisCard
- page.tsx (admin form)

## CREATE (9)
- EligibleJobsWidget
- ExamReadinessCard
- ClosingSoonExamsWidget
- ApplicationStatusWidget
- StudyProgressWidget
- WeakTopicsWidget
- ExamStrategyWidget
- SyllabusSection
- PreviousPapersSection

## MODIFY (6)
- JobCard (show eligibility instead of match %)
- app/recommendations/page.tsx (new sorting)
- app/jobs/[id]/page.tsx (enhanced with syllabus, papers)
- app/profile/page.tsx (simplified)
- DashboardStats (new metrics)
- app/resumes/page.tsx (repurpose or delete)

---

# BUSINESS VALUE RANKING

## 🔴 CRITICAL (Can't launch without)
1. Eligibility Engine - users need to know if they can apply
2. Government Profile - can't determine eligibility without data
3. Study Plans - users need structured prep path
4. Application Tracking - users need to see progress
5. Recommendations - homepage experience
6. Dashboard - engagement driver
7. Alerts - prevent missed deadlines

## 🟠 HIGH (Essential for full experience)
8. Previous Papers - users expect practice materials
9. Syllabus Mapping - structure for study
10. Practice Tests - validation mechanism
11. Readiness Scoring - "Am I ready?" metric
12. State Exams - geographic coverage

## 🟡 MEDIUM (Nice to have)
13-17. Gamification, Interview Prep, Success Stories, Analytics

## ⚪ LOW (Premium)
18-20. AI Doubt, Mock Interviews, Coaching Tools

---

# EFFORT & TIMELINE

```
PHASE 1: Foundation (Week 1)    = 37 hours
PHASE 2: Engagement (Week 2)    = 10 hours
PHASE 3: Resources (Week 3)     = 10 hours
PHASE 4: Validation (Week 4)    = 16 hours
PHASE 5: Enhancement (Week 5)   = 15 hours
Post-MVP: Premium (Ongoing)     = 40+ hours

TOTAL MVP: 88 hours ≈ 2-3 weeks
```

---

# KEY METRICS TO TRACK

## Week 1 Success
- ✅ npm run build passes
- ✅ Eligibility engine works
- ✅ Profile collection completes
- ✅ 1000+ users sign up
- ✅ 50%+ complete profile

## Week 2 Success
- ✅ 5000+ users
- ✅ 40%+ have study plan
- ✅ 60%+ daily active users
- ✅ 30+ min avg session time

## Week 3+ Success
- ✅ 20000+ users
- ✅ All major states
- ✅ 70%+ daily active users
- ✅ 50%+ took practice test

---

# DECISION POINTS

**Ready to proceed with Phase 1?**
- ✅ YES → Start with database migration + eligibility engine
- ⚠️  NO → Review specific features first

**Any features to prioritize differently?**
- High volume from India? → Focus on state exams earlier
- International focus? → Build previous papers sooner
- B2B first? → Build coaching tools as Phase 2

**Integration with existing auth?**
- ✅ All changes preserve Supabase auth
- ✅ No breaking changes to authentication flow
- ✅ User data fully maintained

---

# COMPLETE DOCUMENTATION

📄 Full architecture: `MIGRATION_ARCHITECTURE.md`
📄 Detailed plan: `/memories/session/migration-plan-detailed.md`
📄 Feature ranking: `/memories/session/feature-priority-ranking.md`
📄 Codebase audit: `/memories/session/codebase-audit-report.md`

---

# NEXT STEPS

1. ✅ Review this summary
2. ✅ Approve Phase 1 scope
3. ⏳ Create database migration
4. ⏳ Implement eligibility engine
5. ⏳ Test and deploy
6. ⏳ Launch Phase 2

**Status:** Ready to start Phase 1 ✨
