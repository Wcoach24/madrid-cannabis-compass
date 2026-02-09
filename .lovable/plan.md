

# Add Separate First Name and Last Name Fields to Invitation Form

## Overview
Split the current single "name" field per visitor into two separate fields: **First Name** and **Last Name**. This requires changes to the database, form UI, validation, edge function, and admin panel.

## Backward Compatibility Strategy

The current database stores visitor names as a `text[]` array (`visitor_names`). Rather than altering this existing column (which would break existing data), we will:

1. **Add two new columns**: `visitor_first_names` (text[]) and `visitor_last_names` (text[])
2. **Keep `visitor_names` populated** as a combined "First Last" array for backward compatibility (used in emails, admin panel display, audit logs, etc.)
3. Existing rows remain untouched -- they only have `visitor_names` filled, the new columns will be NULL for old records

This ensures nothing breaks.

---

## Changes Summary

| File / Resource | Change |
|-----------------|--------|
| **Database** | Add `visitor_first_names` and `visitor_last_names` text[] columns to `invitation_requests` |
| **`src/components/invitation/InvitationWizard.tsx`** | Add `visitorFirstNames` and `visitorLastNames` to FormData state |
| **`src/components/invitation/steps/Step2VisitorInfo.tsx`** | Replace single name input with two inputs (First Name + Last Name) per visitor |
| **`src/components/invitation/steps/Step5Review.tsx`** | Display "First Last" combined in review |
| **`src/lib/invitationValidation.ts`** | Add `visitor_first_names` and `visitor_last_names` to zod schema |
| **`supabase/functions/submit-invitation-request/index.ts`** | Accept and store new fields, auto-populate `visitor_names` as combined |
| **`src/pages/AdminInvitations.tsx`** | No change needed -- still reads `visitor_names` which remains populated |

---

## Technical Details

### Step 1: Database Migration

```sql
ALTER TABLE invitation_requests 
ADD COLUMN visitor_first_names text[] DEFAULT NULL,
ADD COLUMN visitor_last_names text[] DEFAULT NULL;
```

Both columns are nullable so existing rows are unaffected.

### Step 2: Update Zod Validation (`src/lib/invitationValidation.ts`)

Add two new array fields:
- `visitor_first_names`: array of trimmed non-empty strings
- `visitor_last_names`: array of trimmed non-empty strings
- Keep `visitor_names` as a combined "First Last" array (computed before validation)

### Step 3: Update Form State (`InvitationWizard.tsx`)

- Add `visitorFirstNames: string[]` and `visitorLastNames: string[]` to `FormData`
- Add handlers: `handleVisitorFirstNameChange`, `handleVisitorLastNameChange`
- On submit, compute `visitor_names` as `firstName + " " + lastName` for each visitor
- Pass new fields to Step2 and Step5

### Step 4: Update Step 2 UI (`Step2VisitorInfo.tsx`)

- Replace single `Input` per visitor with two side-by-side inputs: "First Name" and "Last Name"
- Add translations for "firstName" and "lastName" labels in all 5 languages (EN, ES, DE, FR, IT)
- Validation: both first name AND last name must be non-empty for each visitor

### Step 5: Update Step 5 Review (`Step5Review.tsx`)

- Accept `visitorFirstNames` and `visitorLastNames` props
- Display combined "First Last" in the review list

### Step 6: Update Edge Function (`submit-invitation-request/index.ts`)

- Add `visitor_first_names` and `visitor_last_names` to the request interface
- Store them in the database insert
- Continue computing `visitor_names` as the combined array for backward compatibility (emails, admin notifications, audit logs all use this field)

### Step 7: Admin Panel

No changes needed -- the admin panel reads `visitor_names` which will continue to be populated with combined "First Last" values.

---

## What Won't Break

- Existing invitation records (new columns are nullable, old data untouched)
- Email templates (still use `visitor_names` combined array)
- Admin panel display (still reads `visitor_names`)
- Auto-reminder system (doesn't depend on name fields)
- Audit logs (use `visitor_names`)
- Duplicate detection (uses email, not names)

