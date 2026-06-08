-- Add source tracking column to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN jobs.source IS 'Job source: Company Careers, Government, Manual Admin, Remote API, AI Import, etc.';
