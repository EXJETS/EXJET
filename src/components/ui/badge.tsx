import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const colorStyles = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-champagne/10 text-champagne ring-champagne/30",
  red: "bg-red-50 text-red-700 ring-red-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  gray: "bg-[var(--color-ivory-deep)] text-[var(--color-ink-soft)] ring-[var(--color-hairline)]",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  white: "bg-[var(--color-ink)] text-white ring-[var(--color-ink)]",
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
