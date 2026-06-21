# Feature Deprecation Notice - Phase 2 Migration

**Date:** 2026-06-19  
**Status:** Deprecated Features Preserved for Backward Compatibility

---

## LEGACY FEATURES PRESERVED

The following legacy features from the private sector platform are preserved and functional:

### 1. Match Scores System
- **Table:** `match_scores`
- **Status:** ✅ Preserved
- **Current Usage:** `/recommendations` page
- **Migration Path:** Will be replaced by Eligibility Engine in Phase 3
- **Deprecation Timeline:** Q3 2026
- **Action Required:** None (automatic migration planned)

### 2. Resume Analysis
- **Table:** `resume_analysis`
- **Status:** ✅ Preserved
- **Current Usage:** Resume upload and analysis
- **Migration Path:** Will be replaced by Study Plan Generation in Phase 3
- **Deprecation Timeline:** Q3 2026
- **Action Required:** None (automatic migration planned)

### 3. Career Roadmaps
- **Table:** `career_roadmaps`
- **Status:** ✅ Preserved
- **Current Usage:** Career planning widget
- **Migration Path:** Will be replaced by Exam Strategy in Phase 3
- **Deprecation Timeline:** Q3 2026
- **Action Required:** None (automatic migration planned)

---

## NEW GOVERNMENT FEATURES IMPLEMENTED

### 1. Eligibility Engine ✅
- **Location:** `lib/eligibility/engine.ts`
- **API Endpoint:** `POST /api/eligibility/check`
- **Features:**
  - Age eligibility with category relaxation
  - Category-based vacancy checking
  - State-specific eligibility
  - Disability requirements
  - Ex-serviceman requirements
  - Gender requirements
  - Qualification matching
- **Storage:** `user_job_eligibility` table
- **Status:** ✅ Implemented and Active

### 2. User Profiles (Government) ✅
- **Table:** `user_profiles`
- **Current Usage:** Dashboard, Profile, Onboarding pages
- **Features:**
  - Government-specific fields (category, disability, ex-serviceman)
  - Educational details
  - State preferences
  - Profile completion tracking
- **Status:** ✅ Implemented and Active

### 3. Study Plans ✅
- **Table:** `study_plans`
- **Related Table:** `daily_study_tasks`
- **Status:** ✅ Database schema ready
- **Implementation:** UI pending Phase 3

### 4. Exam Notifications ✅
- **Table:** `exam_notifications`
- **Status:** ✅ Database schema ready
- **Implementation:** UI pending Phase 3

### 5. Previous Papers ✅
- **Table:** `previous_papers`
- **Status:** ✅ Database schema ready
- **Implementation:** UI pending Phase 3

### 6. Study Resources ✅
- **Table:** `study_resources`
- **Status:** ✅ Database schema ready
- **Implementation:** UI pending Phase 3

---

## MIGRATION PATH FOR LEGACY FEATURES

### Phase 2 (Current) - Foundation
- ✅ Preserve all legacy tables
- ✅ Create new government tables
- ✅ Implement Eligibility Engine
- ✅ Update profile pages to use user_profiles
- ✅ Keep recommendations page using match_scores (backward compatibility)

### Phase 3 (Planned) - Transition
- ⏳ Update recommendations page to use eligibility engine
- ⏳ Migrate match_scores data to user_job_eligibility
- ⏳ Replace resume analysis with study plan generation
- ⏳ Replace career roadmaps with exam strategy
- ⏳ Add deprecation warnings in UI

### Phase 4 (Planned) - Cleanup
- ⏳ Remove match_scores table (after 6-month grace period)
- ⏳ Remove resume_analysis table (after 6-month grace period)
- ⏳ Remove career_roadmaps table (after 6-month grace period)
- ⏳ Remove legacy API endpoints
- ⏳ Update documentation

---

## BACKWARD COMPATIBILITY GUARANTEES

1. **No Breaking Changes:** All existing features continue to work
2. **Data Preservation:** No data will be lost during migration
3. **Grace Period:** 6-month notice before removing legacy features
4. **Automatic Migration:** Data will be migrated automatically
5. **Rollback Plan:** Can revert to legacy system if needed

---

## ACTION ITEMS FOR DEVELOPERS

### Immediate (Phase 2)
- ✅ No action required - legacy features preserved
- ✅ New eligibility engine available for use
- ✅ Profile pages updated to government schema

### Phase 3 (Q3 2026)
- ⏳ Update recommendations page to use eligibility engine
- ⏳ Add deprecation notices to legacy features
- ⏳ Implement study plan generation UI
- ⏳ Implement exam notifications UI

### Phase 4 (Q4 2026)
- ⏳ Remove legacy tables after grace period
- ⏳ Clean up legacy code
- ⏳ Update all documentation

---

## DATABASE SCHEMA CHANGES

### Tables Added (Phase 2)
- ✅ `previous_papers` - Exam previous papers storage
- ✅ `study_resources` - Learning materials and resources
- ✅ Enhanced `jobs` table with government eligibility fields

### Tables Modified (Phase 2)
- ✅ `jobs` - Added age_min, age_max, category_relaxation, vacancies_by_category, qualification_required, state_specific, required_state, requires_disability, requires_ex_serviceman, selection_process, syllabus_url, syllabus

### Tables Preserved (Legacy)
- ✅ `match_scores` - Private sector match scores
- ✅ `resume_analysis` - Resume analysis results
- ✅ `career_roadmaps` - Career planning data

---

## API CHANGES

### New Endpoints (Phase 2)
- ✅ `POST /api/eligibility/check` - Check eligibility for a job
- ✅ `GET /api/eligibility/check?userId=X&jobId=Y` - Get cached eligibility

### Legacy Endpoints (Preserved)
- ✅ `POST /api/match-scores/generate` - Still functional
- ✅ `POST /api/career-roadmap` - Still functional
- ✅ `POST /api/ai/analyze-resume` - Still functional

---

## TESTING CHECKLIST

### Phase 2 Testing
- ✅ Dashboard loads with user_profiles data
- ✅ Profile page saves to user_profiles table
- ✅ Onboarding creates user_profiles record
- ✅ Eligibility engine API responds correctly
- ✅ Legacy match_scores still work on recommendations page
- ✅ Legacy resume analysis still functional
- ✅ Legacy career roadmaps still functional

### Phase 3 Testing (Planned)
- ⏳ Recommendations page uses eligibility engine
- ⏳ Study plan generation works
- ⏳ Exam notifications display correctly
- ⏳ Previous papers download works
- ⏳ Study resources display correctly

---

## ROLLBACK PLAN

If issues arise during Phase 3 transition:

1. **Immediate Rollback:** Switch recommendations page back to match_scores
2. **Data Recovery:** Restore legacy tables from backup
3. **Feature Flags:** Disable new features via environment variables
4. **Graceful Degradation:** Platform continues with legacy features

---

## CONTACT

For questions about this migration:
- Review `MIGRATION_ARCHITECTURE.md` for detailed architecture
- Review `PHASE_1_AUDIT_REPORT.md` for Phase 1 changes
- Review `PHASE_2_AUDIT_REPORT.md` for Phase 2 changes (this document)
