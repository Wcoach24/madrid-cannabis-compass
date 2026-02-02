

# Automatic Reminder Email System Plan (Revised)

## Overview
Create an automated system that sends reminder emails to invitation holders 48 hours after their visit date, unless they have been marked as "attended". This covers both no-shows and cases where the admin hasn't taken any action.

---

## Business Logic

| Scenario | Send Auto-Reminder? |
|----------|---------------------|
| Admin marks **attended = true** | ❌ No reminder |
| Admin marks **no-show (attended = false)** | ✅ Yes, after 48h |
| Admin takes **no action** | ✅ Yes, after 48h |

**Key Rule**: The ONLY way to prevent the automatic reminder is if `attended = true`.

---

## Duplicate Prevention Strategy

To ensure we never send multiple emails to the same person:

1. **New column**: `auto_reminder_sent_at` (TIMESTAMPTZ) 
   - NULL = no auto-reminder sent yet
   - Timestamp = auto-reminder already sent

2. **Query filter**: Only select invitations where `auto_reminder_sent_at IS NULL`

3. **Atomic update**: Set `auto_reminder_sent_at` immediately after successful email send

4. **Unique constraint consideration**: The email + club_slug + visit_date combination already prevents duplicate invitations at submission time

---

## Implementation Steps

### Step 1: Database Migration

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add tracking column for automatic reminders
ALTER TABLE invitation_requests 
ADD COLUMN auto_reminder_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for efficient querying
CREATE INDEX idx_invitation_requests_auto_reminder 
ON invitation_requests (visit_date, attended, auto_reminder_sent_at) 
WHERE auto_reminder_sent_at IS NULL;
```

### Step 2: Create Edge Function `auto-send-reminders`

**File**: `supabase/functions/auto-send-reminders/index.ts`

Query logic:
```sql
SELECT * FROM invitation_requests
WHERE 
  status IN ('sent', 'approved')           -- Valid invitations only
  AND (attended IS NULL OR attended = false) -- NOT marked as attended
  AND visit_date < NOW() - INTERVAL '48 hours' -- 48h after visit date
  AND auto_reminder_sent_at IS NULL         -- No auto-reminder sent yet
```

For each result:
1. Fetch club details
2. Generate reminder email using existing template
3. Send via Resend API
4. **Immediately** update `auto_reminder_sent_at = NOW()` 
5. Log to `invitation_audit_log` with action `auto_reminder_sent`

### Step 3: Configure Edge Function

**File**: `supabase/config.toml`

```toml
[functions.auto-send-reminders]
verify_jwt = false  # Called by cron, not user
```

### Step 4: Create Cron Job

Run daily at 10:00 AM UTC:

```sql
SELECT cron.schedule(
  'auto-send-reminders-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://sdpmwelfkseuhlhgatsc.supabase.co/functions/v1/auto-send-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcG13ZWxma3NldWhsaGdhdHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTU5NzUsImV4cCI6MjA3ODM3MTk3NX0.MkYa4jNxLAbYQBZqxJIezn50uuipLaZHKm3Ls2ONjpM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

### Step 5: Update Admin Panel UI (Optional)

Add visual indicator in `src/pages/AdminInvitations.tsx`:
- New column "Auto Reminder" showing timestamp if sent
- Helps admin see which invitations received automatic follow-up

---

## Edge Function Flow

```text
┌─────────────────────────────────────────────────────────────┐
│  CRON triggers auto-send-reminders at 10 AM UTC daily      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Query: Find invitations where                              │
│    • visit_date > 48 hours ago                              │
│    • attended ≠ true (NULL or false)                        │
│    • auto_reminder_sent_at IS NULL                          │
│    • status = 'sent' or 'approved'                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  For each invitation:                                       │
│    1. Fetch club name from clubs table                      │
│    2. Generate email HTML (reuse reminder-email template)   │
│    3. Send via Resend API                                   │
│    4. UPDATE auto_reminder_sent_at = NOW()                  │
│    5. INSERT audit log entry                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Return: { success: true, emailsSent: N }                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/auto-send-reminders/index.ts` | Create new edge function |
| `supabase/config.toml` | Add function config |
| `src/pages/AdminInvitations.tsx` | Add "Auto Reminder" column |
| Database migration | Add column + extensions + cron job |

---

## Duplicate Prevention Summary

| Layer | Mechanism |
|-------|-----------|
| Database | `auto_reminder_sent_at IS NULL` filter |
| Edge Function | Atomic update after each email |
| Audit Log | Record of every auto-reminder for debugging |
| Cron Schedule | Once daily (not every hour) |

---

## Expected Behavior Examples

| Visit Date | Admin Action | 48h Later | Auto-Reminder? |
|------------|--------------|-----------|----------------|
| Jan 1 | Marked attended ✓ | Jan 3 | ❌ No |
| Jan 1 | Marked no-show ✗ | Jan 3 | ✅ Yes |
| Jan 1 | No action taken | Jan 3 | ✅ Yes |
| Jan 1 | No-show, then manual reminder | Jan 3 | ✅ Yes (auto runs separately) |
| Jan 1 | Auto-reminder already sent | Jan 4 | ❌ No (already tracked) |

