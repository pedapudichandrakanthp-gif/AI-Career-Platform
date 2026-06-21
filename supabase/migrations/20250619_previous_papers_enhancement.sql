-- Previous Papers Enhancement
-- Date: 2026-06-19
-- Add exam_name column to previous_papers table

-- Add exam_name column
ALTER TABLE previous_papers ADD COLUMN IF NOT EXISTS exam_name VARCHAR(255);

-- Add index for exam_name
CREATE INDEX IF NOT EXISTS idx_previous_papers_exam_name ON previous_papers(exam_name);
