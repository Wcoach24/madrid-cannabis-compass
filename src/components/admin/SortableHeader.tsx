import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
  label: string;
  columnKey: string;
  activeColumn: string | null;
  direction: SortDirection;
  onSort: (columnKey: string) => void;
}

const SortableHeader = ({
  label,
  columnKey,
  activeColumn,
  direction,
  onSort,
}: SortableHeaderProps) => {
  const isActive = activeColumn === columnKey;

  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-foreground transition-colors text-left w-full"
      onClick={() => onSort(columnKey)}
    >
      {label}
      {isActive && direction === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 shrink-0" />
      ) : isActive && direction === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
      )}
    </button>
  );
};

export default SortableHeader;
