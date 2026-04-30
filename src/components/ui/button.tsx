import { type ButtonHTMLAttributes, type ElementType } from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-soft)] disabled:hover:bg-[var(--color-ink)]",
  secondary:
    "border border-[var(--color-hairline)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-ivory)] hover:border-[var(--color-hairline-strong)]",
  ghost:
    "text-[var(--color-ink-soft)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-ink)]",
  danger:
    "bg-red-600 text-white hover:bg-red-500",
  outline:
    "border border-[var(--color-hairline)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ivory)]",
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hairline-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
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
