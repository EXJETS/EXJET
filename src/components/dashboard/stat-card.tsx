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

const colorMap = {
  amber:  { bg: "bg-amber-50",  icon: "bg-amber-100  text-amber-600",  trend: "text-amber-600"  },
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100   text-blue-600",   trend: "text-blue-600"   },
  green:  { bg: "bg-green-50",  icon: "bg-green-100  text-green-600",  trend: "text-green-600"  },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", trend: "text-purple-600" },
  red:    { bg: "bg-red-50",    icon: "bg-red-100    text-red-600",    trend: "text-red-600"    },
  gray:   { bg: "bg-gray-50",   icon: "bg-gray-100   text-gray-600",   trend: "text-gray-600"   },
};

export function StatCard({ label, value, sub, icon: Icon, trend, color = "amber" }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", c.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {trend && (
          <p className={cn("text-xs font-medium mt-1", trend.up ? "text-green-600" : "text-red-500")}>
            {trend.up ? "▲" : "▼"} {trend.value} vs last month
          </p>
        )}
      </div>
    </div>
  );
}
