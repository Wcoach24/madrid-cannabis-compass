

# Pre-Visit Reminder Email (2 Days Before Visit Date)

## Context

Currently there are two reminder systems, both for **after** the visit date:
- `send-reminder`: manual admin button for no-shows
- `auto-send-reminders`: automatic cron 48h after visit date for no-shows

Neither sends a reminder **before** the visit. Many users book for future dates and may forget. This plan adds an automatic friendly reminder 2 days before their visit.

## What Changes

### 1. New Database Column

Add `pre_visit_reminder_sent_at` (TIMESTAMPTZ, nullable) to `invitation_requests` to track whether the pre-visit reminder was already sent (idempotency guard, same pattern as `auto_reminder_sent_at`).

### 2. New Edge Function: `send-pre-visit-reminder`

A new edge function triggered daily by pg_cron that:
- Finds invitations where:
  - `status` is 'sent' or 'approved'
  - `visit_date` is exactly 2 days from now (today + 2)
  - `pre_visit_reminder_sent_at` is NULL
  - `attended` is not already true
- Sends a friendly, warm reminder email (different tone from the no-show reminder -- this is anticipation, not follow-up)
- Updates `pre_visit_reminder_sent_at` after successful send
- Logs to `invitation_audit_log` with action `pre_visit_reminder_sent`

### 3. Email Template (Friendly Tone)

The email will have a warm, excited tone (not "you haven't visited" but "your visit is coming up!"):
- Subject: "Your visit to [Club] is in 2 days!" / "Tu visita a [Club] es en 2 dias!"
- Content: greeting, visit date, invitation code, what to bring (ID), club address hints, benefits reminder
- Multi-language support (EN/ES) based on the invitation's `language` field

### 4. pg_cron Job

Schedule the function to run daily at 09:00 UTC (11:00 Madrid time) -- a good time for a "your visit is coming up" email.

## Technical Details

### Database Migration

```text
ALTER TABLE invitation_requests
ADD COLUMN pre_visit_reminder_sent_at TIMESTAMPTZ;
```

### Edge Function: `supabase/functions/send-pre-visit-reminder/index.ts`

Query logic:
```text
- status IN ('sent', 'approved')
- attended IS NULL or attended = false
- pre_visit_reminder_sent_at IS NULL
- visit_date = current_date + interval '2 days'
```

This uses date comparison (not timestamp math) so it catches all invitations for the day that is exactly 2 days away, regardless of when the cron runs.

### Config: `supabase/config.toml`

```text
[functions.send-pre-visit-reminder]
verify_jwt = false
```

### pg_cron Job (SQL to run manually)

```text
SELECT cron.schedule(
  'pre-visit-reminder-daily',
  '0 9 * * *',
  $$ SELECT net.http_post(
    url:='https://sdpmwelfkseuhlhgatsc.supabase.co/functions/v1/send-pre-visit-reminder',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id; $$
);
```

### Email Content (Key Differences from No-Show Reminder)

| Aspect | No-Show Reminder | Pre-Visit Reminder |
|--------|-----------------|-------------------|
| Tone | "We noticed you haven't visited" | "Your visit is coming up!" |
| Timing | 48h after visit date | 2 days before visit date |
| Purpose | Re-engage no-shows | Reduce no-shows proactively |
| Action | "Your invitation is still active" | "Here's what you need to know" |

### Admin Visibility

The `pre_visit_reminder_sent_at` column can optionally be shown in the admin table later, but for now it serves as an internal tracking field.

### Files Created/Modified

| File | Action |
|------|--------|
| `supabase/functions/send-pre-visit-reminder/index.ts` | Create new edge function |
| `supabase/config.toml` | Add function config |
| Migration SQL | Add `pre_visit_reminder_sent_at` column |
| pg_cron SQL | Schedule daily job at 09:00 UTC |

### No frontend changes needed
This is entirely a backend automation feature.

