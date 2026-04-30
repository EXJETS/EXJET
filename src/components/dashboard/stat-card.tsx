import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  color?: "amber" | "blue" | "green" | "purple" | "red" | "gray";
}

export function StatCard({ label, value, sub, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-5 backdrop-blur-xl transition-colors hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-ivory-deep)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-champagne/10 text-champagne">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">{label}</p>
        <p className="mt-1 text-[24px] font-semibold tracking-tight text-[var(--color-ink)]">{value}</p>
        {sub && <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">{sub}</p>}
        {trend && (
          <p
            className={cn(
              "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
              trend.up
                ? "bg-[var(--color-forest)]/10 text-[var(--color-forest)] ring-[var(--color-forest)]/20"
                : "bg-[var(--color-bordeaux)]/8 text-[var(--color-bordeaux)] ring-[var(--color-bordeaux)]/20"
            )}
          >
            {trend.up ? "▲" : "▼"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
