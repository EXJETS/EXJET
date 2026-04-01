import { cn } from "@/lib/utils";

type Status = "confirmed" | "pending" | "completed" | "cancelled" | "active" | "inactive" | "available" | "in_flight" | "maintenance";

const styles: Record<Status, string> = {
  confirmed:   "bg-green-100  text-green-700  ring-green-200",
  pending:     "bg-yellow-100 text-yellow-700 ring-yellow-200",
  completed:   "bg-gray-100   text-gray-600   ring-gray-200",
  cancelled:   "bg-red-100    text-red-600    ring-red-200",
  active:      "bg-green-100  text-green-700  ring-green-200",
  inactive:    "bg-gray-100   text-gray-500   ring-gray-200",
  available:   "bg-emerald-100 text-emerald-700 ring-emerald-200",
  in_flight:   "bg-blue-100   text-blue-700   ring-blue-200",
  maintenance: "bg-orange-100 text-orange-700 ring-orange-200",
};

const labels: Record<Status, string> = {
  confirmed: "Confirmed", pending: "Pending", completed: "Completed",
  cancelled: "Cancelled", active: "Active", inactive: "Inactive",
  available: "Available", in_flight: "In Flight", maintenance: "Maintenance",
};

interface StatusBadgeProps {
  status: Status;
  dot?: boolean;
}

export function StatusBadge({ status, dot = false }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset",
      styles[status]
    )}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", status === "in_flight" ? "bg-blue-500 animate-pulse" : "bg-current")} />}
      {labels[status]}
    </span>
  );
}
