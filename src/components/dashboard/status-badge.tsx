import { cn } from "@/lib/utils";

type Status = "confirmed" | "pending" | "completed" | "cancelled" | "active" | "inactive" | "available" | "in_flight" | "maintenance";

const styles: Record<Status, string> = {
  confirmed:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending:     "bg-amber-50   text-amber-700   ring-amber-200",
  completed:   "bg-neutral-100   text-neutral-700    ring-neutral-200",
  cancelled:   "bg-red-50     text-red-700     ring-red-200",
  active:      "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive:    "bg-neutral-100   text-neutral-500    ring-neutral-200",
  available:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  in_flight:   "bg-sky-500/10     text-sky-300     ring-sky-400/20",
  maintenance: "bg-amber-50   text-amber-700   ring-amber-200",
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ring-1 ring-inset",
        styles[status]
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "in_flight" ? "bg-sky-400 animate-pulse" : "bg-current"
          )}
        />
      )}
      {labels[status]}
    </span>
  );
}
