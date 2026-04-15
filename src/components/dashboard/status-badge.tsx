import { cn } from "@/lib/utils";

type Status = "confirmed" | "pending" | "completed" | "cancelled" | "active" | "inactive" | "available" | "in_flight" | "maintenance";

const styles: Record<Status, string> = {
  confirmed:   "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  pending:     "bg-amber-500/10   text-amber-300   ring-amber-400/20",
  completed:   "bg-white/[0.06]   text-white/70    ring-white/10",
  cancelled:   "bg-red-500/10     text-red-300     ring-red-400/20",
  active:      "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  inactive:    "bg-white/[0.06]   text-white/50    ring-white/10",
  available:   "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  in_flight:   "bg-sky-500/10     text-sky-300     ring-sky-400/20",
  maintenance: "bg-amber-500/10   text-amber-300   ring-amber-400/20",
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
