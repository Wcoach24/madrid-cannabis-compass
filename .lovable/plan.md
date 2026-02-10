
# Split Admin Invitations into Upcoming/Past Tables + Add Name Columns

## Overview
Reorganize the admin invitations panel with a time-based toggle (Today & Upcoming vs Past) and add First Name / Last Name columns for better visitor identification.

## Changes (single file: `src/pages/AdminInvitations.tsx`)

### 1. Time-Based View Toggle
Add a prominent toggle above the existing status filter tabs:
- **"Today & Upcoming"** (default): shows invitations where `visit_date >= today`, sorted by `visit_date` ascending (soonest first)
- **"Past"**: shows invitations where `visit_date < today`, sorted by `visit_date` descending (most recent first)

The toggle will show count badges so the admin instantly knows how many invitations are in each group.

The existing status filters (All, Sent, Failed, Attended, No-Shows) continue to work within the selected time view.

### 2. First Name + Last Name Columns
Add two new columns between "Club" and "Email":
- **First Name**: reads from `visitor_first_names` array, comma-separated if multiple visitors. Falls back to extracting from `visitor_names` for older records.
- **Last Name**: reads from `visitor_last_names` array, comma-separated. Empty for legacy records without split names.

### 3. Default Sort by Visit Date
When no manual sort is active, the table auto-sorts by `visit_date` -- ascending for upcoming, descending for past. Manual sort headers still work for overriding.

## Technical Details

### Type Update
Add to the `InvitationRequest` type:
```text
visitor_first_names?: string[];
visitor_last_names?: string[];
```

### State Addition
```text
const [timeView, setTimeView] = useState<'upcoming' | 'past'>('upcoming');
```

### Filtering Pipeline
```text
1. Time filter: visit_date >= today (upcoming) or < today (past)
2. Status filter: existing All/Sent/Failed/Attended/No-Shows
3. Sort: default visit_date asc/desc based on view, or manual sort override
```

### UI Layout
```text
[Today & Upcoming (12)]  [Past (45)]       <-- new time toggle (styled buttons)

[All] [Sent] [Failed] [Attended] [No-Shows] <-- existing status tabs

+----+------+------------+-----------+-------+...
| ID | Club | First Name | Last Name | Email |...
+----+------+------------+-----------+-------+...
```

### Fetch Query Update
Change the Supabase query to also select `visitor_first_names` and `visitor_last_names` (they already exist in the DB from the previous migration). No database migration needed.

### Name Display Helper
For each invitation, display names as comma-separated lists:
- First Names: `request.visitor_first_names?.join(', ')` or fallback to splitting `visitor_names`
- Last Names: `request.visitor_last_names?.join(', ')` or empty for legacy

### Files Modified
| File | Change |
|------|--------|
| `src/pages/AdminInvitations.tsx` | Time toggle, name columns, default sort |
| `src/lib/sortInvitations.ts` | Add `visitor_first_names` / `visitor_last_names` to type, no logic change needed |

No database migrations. No edge function changes. No new dependencies.
