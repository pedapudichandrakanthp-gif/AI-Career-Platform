-- Capture production schema for profiles, resumes, and study_tracker tables
-- Date: 2026-07-09
-- These tables exist in production but were not properly documented in migrations
-- This migration ensures the schema is properly tracked for future deployments

-- ============================================================================
-- TABLE 1: PROFILES - Extended user profile data
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT,
  category TEXT,
  state TEXT,
  has_pwd BOOLEAN,
  ex_serviceman BOOLEAN,
  qualification TEXT,
  degree TEXT,
  branch TEXT,
  institution TEXT,
  year_of_passing INTEGER,
  grade_percentage NUMERIC,
  skills TEXT[],
  languages TEXT[],
  certifications TEXT,
  exam_preference TEXT,
  experience_years INTEGER,
  resume_text TEXT,
  resume_url TEXT,
  ats_score INTEGER,
  ai_analysis JSONB,
  profile_complete BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 2: RESUMES - User resume uploads and analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  extracted_skills TEXT[],
  extracted_education TEXT,
  extracted_experience TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users read own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users manage own resumes" ON resumes FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 3: STUDY_TRACKER - User study progress tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  subject TEXT,
  topic TEXT,
  completed BOOLEAN,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_tracker_user_id ON study_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_study_tracker_job_id ON study_tracker(job_id);

ALTER TABLE study_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users manage own study_tracker" ON study_tracker FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This migration captures the actual production schema for:
-- 1. ✅ profiles - User extended profile data
-- 2. ✅ resumes - Resume uploads and extracted information
-- 3. ✅ study_tracker - Study progress tracking
--
-- NOTE: The migration 20250617_fix_production_issues.sql creates user_profiles
-- which is not used in production. This is documented here for clarity.
-- The actual profiles table (created via UI or external migration) is what the
-- application uses and is now properly captured in this migration file.
