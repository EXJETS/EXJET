import { type ButtonHTMLAttributes, type ElementType } from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-neutral-950 text-neutral-950 hover:bg-neutral-800 disabled:hover:bg-neutral-950",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-400",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
  danger:
    "bg-red-600 text-neutral-950 hover:bg-red-500",
  outline:
    "border border-neutral-300 bg-transparent text-neutral-900 hover:bg-neutral-50",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-[12px] rounded-full",
  md: "px-5 py-2 text-[13px] rounded-full",
  lg: "px-7 py-3 text-[13px] rounded-full",
} as const;

type Variant = keyof typeof variantStyles;
type Size = keyof typeof sizeStyles;

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  className?: string;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  "as" | "variant" | "size" | "className"
>;

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as ?? "button";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

export type { ButtonProps, Variant, Size };
