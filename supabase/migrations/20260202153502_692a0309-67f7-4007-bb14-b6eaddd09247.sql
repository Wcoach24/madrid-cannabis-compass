-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add tracking column for automatic reminders
ALTER TABLE invitation_requests 
ADD COLUMN IF NOT EXISTS auto_reminder_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for efficient querying of pending auto-reminders
CREATE INDEX IF NOT EXISTS idx_invitation_requests_auto_reminder 
ON invitation_requests (visit_date, attended, auto_reminder_sent_at) 
WHERE auto_reminder_sent_at IS NULL;