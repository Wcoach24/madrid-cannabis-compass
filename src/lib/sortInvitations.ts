import type { SortDirection } from "@/components/admin/SortableHeader";

type InvitationRequest = {
  id: number;
  club_slug: string;
  email: string;
  phone: string;
  visitor_names: string[];
  visitor_first_names?: string[];
  visitor_last_names?: string[];
  visitor_count: number;
  visit_date: string;
  status: string;
  created_at: string;
  notes?: string;
  invitation_code?: string;
  email_sent_at?: string;
  attended?: boolean;
  actual_attendee_count?: number;
  attendance_marked_at?: string;
  auto_reminder_sent_at?: string;
};

type SortableColumn =
  | "id"
  | "club_slug"
  | "email"
  | "phone"
  | "visitor_count"
  | "visit_date"
  | "status"
  | "invitation_code"
  | "attended"
  | "actual_attendee_count"
  | "auto_reminder_sent_at";

export function handleSortToggle(
  columnKey: string,
  currentColumn: string | null,
  currentDirection: SortDirection
): { column: string | null; direction: SortDirection } {
  if (currentColumn !== columnKey) {
    return { column: columnKey, direction: "asc" };
  }
  if (currentDirection === "asc") {
    return { column: columnKey, direction: "desc" };
  }
  // desc -> reset
  return { column: null, direction: null };
}

export function sortRequests(
  requests: InvitationRequest[],
  column: string | null,
  direction: SortDirection
): InvitationRequest[] {
  if (!column || !direction) return requests;

  const sorted = [...requests];
  const dir = direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    const aVal = (a as any)[column];
    const bVal = (b as any)[column];

    // Push nulls/undefined to end
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Boolean (attended)
    if (column === "attended") {
      return (Number(aVal) - Number(bVal)) * dir;
    }

    // Numeric
    if (column === "id" || column === "visitor_count" || column === "actual_attendee_count") {
      return (Number(aVal) - Number(bVal)) * dir;
    }

    // Date
    if (column === "visit_date" || column === "auto_reminder_sent_at") {
      return (new Date(aVal).getTime() - new Date(bVal).getTime()) * dir;
    }

    // String (alphabetical)
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  return sorted;
}
