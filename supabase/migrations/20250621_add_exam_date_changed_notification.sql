-- Add exam_date_changed notification type
-- Date: 2026-06-21

-- Drop existing CHECK constraint and recreate with exam_date_changed
ALTER TABLE exam_notifications DROP CONSTRAINT IF EXISTS exam_notifications_notification_type_check;

ALTER TABLE exam_notifications ADD CONSTRAINT exam_notifications_notification_type_check 
CHECK (notification_type IN (
  'new_exam', 'registration_open', 'closing_soon_7d', 'closing_soon_3d', 'closing_soon_1d',
  'exam_reminder', 'admit_card_released', 'result_announced', 'interview_scheduled',
  'exam_date_changed'
));
