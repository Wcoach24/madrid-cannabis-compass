

# Add Sortable Columns to Admin Invitations Table

## Overview
Add click-to-sort functionality on the table headers in the Admin Invitations page. Clicking a column header will toggle between ascending, descending, and default order. A small arrow icon will indicate the current sort direction.

## How It Works
- Click any sortable column header to sort ascending
- Click again to sort descending
- Click a third time to reset to default order (newest first by created_at)
- A small up/down arrow icon appears next to the active sort column
- The "Actions" column will NOT be sortable (it contains buttons, not data)

## Sortable Columns
| Column | Sort Type |
|--------|-----------|
| ID | Numeric |
| Club | Alphabetical |
| Email | Alphabetical |
| Phone | Alphabetical |
| Visitors | Numeric |
| Visit Date | Date |
| Status | Alphabetical |
| Code | Alphabetical |
| Attended | Boolean (attended first or last) |
| Actual Count | Numeric |
| Auto Reminder | Date |

## Technical Details

### Changes to `src/pages/AdminInvitations.tsx` only

**1. Add new state variables:**
- `sortColumn`: tracks which column is currently sorted (or null for default)
- `sortDirection`: tracks 'asc' or 'desc'

**2. Add a sort handler function:**
- Clicking a column that is not currently sorted sets it to ascending
- Clicking the same column toggles between ascending, descending, and reset (null)

**3. Add a `SortableHeader` inline component:**
- Wraps each `TableHead` content in a clickable button
- Shows `ArrowUp`, `ArrowDown`, or `ArrowUpDown` (neutral) icon from lucide-react
- Uses `cursor-pointer` styling for sortable headers

**4. Add a sort comparator function:**
- Handles string, number, date, and boolean comparisons
- Applied to `filteredRequests` before rendering (sorting happens after filtering)
- Null/undefined values are pushed to the end

**5. No changes to:**
- Data fetching logic
- Filter logic
- Attendance/reminder functionality
- Table UI component (`src/components/ui/table.tsx`)
- Any other files

### Minimal risk approach
- All sorting is done client-side on the already-fetched data
- No database queries or API calls are modified
- The existing `filteredRequests` array is simply sorted before mapping to rows
- No new dependencies needed (uses existing `lucide-react` icons)

