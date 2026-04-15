import { type ButtonHTMLAttributes, type ElementType } from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-white text-black hover:bg-white/90 disabled:hover:bg-white",
  secondary:
    "border border-white/15 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/25",
  ghost:
    "text-white/70 hover:bg-white/5 hover:text-white",
  danger:
    "bg-red-500/90 text-white hover:bg-red-500",
  outline:
    "border border-white/20 bg-transparent text-white hover:bg-white/5",
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
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
