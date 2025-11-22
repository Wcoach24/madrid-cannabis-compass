-- Add invitation code and email sent timestamp to invitation_requests
ALTER TABLE invitation_requests 
ADD COLUMN invitation_code TEXT,
ADD COLUMN email_sent_at TIMESTAMPTZ;

-- Create index for faster lookups by invitation code
CREATE INDEX idx_invitation_code ON invitation_requests(invitation_code) WHERE invitation_code IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN invitation_requests.invitation_code IS 'Unique invitation code sent to user (format: WEED-XXXXXX)';
COMMENT ON COLUMN invitation_requests.email_sent_at IS 'Timestamp when invitation email was sent';