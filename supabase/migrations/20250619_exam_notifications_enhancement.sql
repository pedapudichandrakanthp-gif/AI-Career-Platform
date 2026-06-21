-- Exam Notifications Enhancement
-- Date: 2026-06-19
-- Add missing notification types to exam_notifications table

-- Drop existing CHECK constraint and recreate with additional types
ALTER TABLE exam_notifications DROP CONSTRAINT IF EXISTS exam_notifications_notification_type_check;

ALTER TABLE exam_notifications ADD CONSTRAINT exam_notifications_notification_type_check 
CHECK (notification_type IN (
  'new_exam', 'registration_open', 'closing_soon_7d', 'closing_soon_3d', 'closing_soon_1d',
  'exam_reminder', 'admit_card_released', 'result_announced', 'interview_scheduled',
  'application_closing', 'admit_card', 'exam_date_change', 'result_declared'
));
