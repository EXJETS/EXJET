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
    <div className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.04]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/80">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</p>
        <p className="mt-1 text-[24px] font-semibold tracking-tight text-white">{value}</p>
        {sub && <p className="mt-0.5 text-[12px] text-white/50">{sub}</p>}
        {trend && (
          <p
            className={cn(
              "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
              trend.up
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                : "bg-red-500/10 text-red-300 ring-red-400/20"
            )}
          >
            {trend.up ? "▲" : "▼"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
