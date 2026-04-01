import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const colorStyles = {
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  yellow: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  gray: "bg-gray-50 text-gray-700 ring-gray-600/20",
  purple: "bg-purple-50 text-purple-700 ring-purple-600/20",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
} as const;

type BadgeColor = keyof typeof colorStyles;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

export function Badge({ color = "blue", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        colorStyles[color],
        className
      )}
      {...props}
    />
  );
}
