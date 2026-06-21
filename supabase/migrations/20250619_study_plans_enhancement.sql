-- Study Plans Enhancement
-- Date: 2026-06-19
-- Add columns to support AI-generated study plans

-- Add missing columns to study_plans table
ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS duration_days SMALLINT CHECK (duration_days > 0);
ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS plan_json JSONB;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_study_plans_title ON study_plans(title);
CREATE INDEX IF NOT EXISTS idx_study_plans_duration ON study_plans(duration_days);
CREATE INDEX IF NOT EXISTS idx_study_plans_plan_json ON study_plans USING GIN(plan_json);
