

# Add Show/No-Show Buttons to Already-Marked Invitations (Safe & Reversible)

## Overview
Currently, once an invitation is marked as "No-Show", the admin only sees a "Send Reminder" button and a timestamp -- there's no way to correct mistakes. Similarly, once marked as "Attended", there's only a read-only timestamp. This change adds the ability to **re-mark** attendance at any time, with a confirmation dialog to prevent accidental clicks.

## What Changes

### 1. Admin UI (`src/pages/AdminInvitations.tsx`)

**When attendance is already marked as No-Show** (currently shows only "Send Reminder"):
- Keep the "Send Reminder" button
- Add a "Mark Attended" button (green/outline) so admins can correct mistakes

**When attendance is already marked as Attended** (currently shows only a timestamp):
- Add a "Mark No-Show" button (red/outline) so admins can correct mistakes
- Keep the attended date info

**Confirmation dialog for corrections:**
- When changing an already-marked record, show an `AlertDialog` asking "Are you sure you want to change the attendance status?" with the current and new status displayed
- This prevents accidental clicks since these are corrections to existing data

### 2. Edge Function (`supabase/functions/mark-attendance/index.ts`)

The edge function already supports re-marking (it simply updates the record with new values). No logic changes needed -- it already:
- Sets `attended`, `actual_attendee_count`, `attendance_marked_at`, `attendance_marked_by`
- Logs an audit entry each time

The only improvement: log the action as `corrected_to_attended` or `corrected_to_no_show` (instead of the regular action) when the record was already marked, so the audit trail clearly shows corrections.

### 3. Audit Trail Safety

Every change (including corrections) is logged in `invitation_audit_log` with:
- The admin who made the change
- Timestamp
- Previous and new attendance status in metadata

This provides full traceability -- no data is ever lost.

## Technical Details

### Changes to `src/pages/AdminInvitations.tsx`

1. **Add a confirmation state** for corrections:
   - `confirmCorrectionRequest`: holds the request being corrected (or null)
   - `confirmCorrectionAction`: 'attended' or 'no-show'

2. **Modify the "No-Show" section** (around line 322-340):
   - After the Send Reminder button, add a "Mark Attended" button
   - Clicking opens the attendance dialog (to also capture actual count)

3. **Modify the "Attended" section** (around line 341-345):
   - After the date text, add a "Mark No-Show" button
   - Clicking opens an AlertDialog confirmation, then calls `handleMarkAttendance(false)` with count 0

4. **Add an AlertDialog** for confirming corrections:
   - Uses the existing `@radix-ui/react-alert-dialog` already in the project
   - Shows: "This invitation was already marked as [current status]. Change to [new status]?"
   - Cancel and Confirm buttons

### Changes to `supabase/functions/mark-attendance/index.ts`

1. **Check previous attendance state** before updating
2. **Use distinct audit action names** for corrections:
   - `corrected_to_attended` / `corrected_to_no_show` (when changing existing)
   - `marked_attended` / `marked_no_show` (when marking for the first time)
3. **Include previous state in audit metadata**: `previous_attended`, `previous_actual_count`

### Files Modified
| File | Change |
|------|--------|
| `src/pages/AdminInvitations.tsx` | Add correction buttons + confirmation AlertDialog |
| `supabase/functions/mark-attendance/index.ts` | Distinguish corrections in audit log |

### No other files changed
- No database migration needed (existing columns support re-marking)
- No new edge functions
- No new dependencies

