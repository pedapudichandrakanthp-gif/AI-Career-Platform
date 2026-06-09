-- Pre-launch upgrade migration

-- Users extensions
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS projects TEXT;

-- Jobs extensions
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_mode TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS clean_title TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);

-- Resume analysis
CREATE TABLE IF NOT EXISTS resume_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  ats_score INTEGER,
  resume_strength INTEGER,
  skills_found TEXT[],
  missing_skills TEXT[],
  missing_keywords TEXT[],
  strengths TEXT[],
  weaknesses TEXT[],
  suggestions TEXT[],
  recommended_certifications TEXT[],
  recommended_skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job analysis per user
CREATE TABLE IF NOT EXISTS job_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  required_skills TEXT[],
  preferred_skills TEXT[],
  experience_needed TEXT,
  responsibilities TEXT[],
  match_score INTEGER,
  missing_skills TEXT[],
  analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job alerts
CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  keywords TEXT,
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw jobs staging
CREATE TABLE IF NOT EXISTS jobs_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import logs
CREATE TABLE IF NOT EXISTS job_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  jobs_fetched INTEGER DEFAULT 0,
  jobs_inserted INTEGER DEFAULT 0,
  jobs_duplicated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  job_alert_notifications BOOLEAN DEFAULT TRUE,
  theme_preference TEXT DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career roadmaps
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  current_skills TEXT[],
  recommended_skills TEXT[],
  courses TEXT[],
  certifications TEXT[],
  roadmap_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match score breakdown extension
ALTER TABLE match_scores ADD COLUMN IF NOT EXISTS skills_score INTEGER;
ALTER TABLE match_scores ADD COLUMN IF NOT EXISTS experience_score INTEGER;
ALTER TABLE match_scores ADD COLUMN IF NOT EXISTS education_score INTEGER;
ALTER TABLE match_scores ADD COLUMN IF NOT EXISTS location_score INTEGER;
ALTER TABLE match_scores ADD COLUMN IF NOT EXISTS match_reasons TEXT[];

-- RLS
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;

-- resume_analysis policies
CREATE POLICY "Users read own resume_analysis" ON resume_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own resume_analysis" ON resume_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own resume_analysis" ON resume_analysis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own resume_analysis" ON resume_analysis FOR DELETE USING (auth.uid() = user_id);

-- job_analysis policies
CREATE POLICY "Users read own job_analysis" ON job_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own job_analysis" ON job_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own job_analysis" ON job_analysis FOR UPDATE USING (auth.uid() = user_id);

-- saved_searches policies
CREATE POLICY "Users manage own saved_searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- job_alerts policies
CREATE POLICY "Users manage own job_alerts" ON job_alerts FOR ALL USING (auth.uid() = user_id);

-- user_settings policies
CREATE POLICY "Users manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- career_roadmaps policies
CREATE POLICY "Users manage own roadmaps" ON career_roadmaps FOR ALL USING (auth.uid() = user_id);

-- jobs_raw: service role only (no user policies)
-- job_import_logs: admin read via service role
