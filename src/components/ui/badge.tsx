import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const colorStyles = {
  blue: "bg-blue-500/10 text-blue-300 ring-blue-400/20",
  green: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  red: "bg-red-500/10 text-red-300 ring-red-400/20",
  yellow: "bg-amber-500/10 text-amber-300 ring-amber-400/20",
  gray: "bg-white/[0.06] text-white/70 ring-white/15",
  purple: "bg-purple-500/10 text-purple-300 ring-purple-400/20",
  indigo: "bg-indigo-500/10 text-indigo-300 ring-indigo-400/20",
  white: "bg-white text-black ring-white",
} as const;

type BadgeColor = keyof typeof colorStyles;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

export function Badge({ color = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ring-1 ring-inset",
        colorStyles[color],
        className
      )}
      {...props}
    />
  );
}
