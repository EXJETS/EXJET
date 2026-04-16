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
    <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 backdrop-blur-xl transition-colors hover:border-neutral-300 hover:bg-neutral-100">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-800">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
        <p className="mt-1 text-[24px] font-semibold tracking-tight text-neutral-950">{value}</p>
        {sub && <p className="mt-0.5 text-[12px] text-neutral-500">{sub}</p>}
        {trend && (
          <p
            className={cn(
              "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
              trend.up
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-red-50 text-red-700 ring-red-200"
            )}
          >
            {trend.up ? "▲" : "▼"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
