-- Drop the old status constraint
ALTER TABLE invitation_requests DROP CONSTRAINT IF EXISTS valid_status;

-- Add new constraint with 'sent' and 'failed' status values
ALTER TABLE invitation_requests 
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'sent', 'failed'));

-- Add attendance tracking columns
ALTER TABLE invitation_requests 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS actual_attendee_count INTEGER,
ADD COLUMN IF NOT EXISTS attendance_marked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attendance_marked_by UUID REFERENCES auth.users(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invitation_requests_attended ON invitation_requests(attended);
CREATE INDEX IF NOT EXISTS idx_invitation_requests_status ON invitation_requests(status);
CREATE INDEX IF NOT EXISTS idx_invitation_requests_created_at ON invitation_requests(created_at);