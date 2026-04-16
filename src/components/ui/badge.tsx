import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const colorStyles = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  gray: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  white: "bg-neutral-950 text-neutral-950 ring-neutral-950",
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
