import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";
import type { BookingStatus, EmptyLegStatus } from "@/lib/types";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2",
  secondary: "border border-line-strong bg-surface text-ink hover:border-ink",
  ghost: "text-ink hover:bg-black/5",
  gold: "bg-gold text-white hover:brightness-95",
  danger: "border border-danger/30 bg-surface text-danger hover:bg-danger/5",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-13 px-6 text-[15px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-surface", className)} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
  group,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  /** Use for controls that aren't a single input (e.g. Counter) so label clicks don't press a button. */
  group?: boolean;
}) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[12px] text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-muted">{hint}</span>
      ) : null}
    </Tag>
  );
}

const inputBase =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-ink outline-none transition placeholder:text-subtle focus:border-ink focus:ring-4 focus:ring-black/5";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputBase, "h-11", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputBase, "h-11 appearance-none bg-[length:12px] pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputBase, "min-h-24", className)} {...props} />;
}

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[12px] font-medium text-ink-2",
        className
      )}
      {...props}
    />
  );
}

const statusStyles: Record<BookingStatus | EmptyLegStatus, string> = {
  requested: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  completed: "border-line bg-canvas text-muted",
  cancelled: "border-red-200 bg-red-50 text-red-800",
  available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  booked: "border-sky-200 bg-sky-50 text-sky-800",
  withdrawn: "border-line bg-canvas text-muted",
};

export function StatusBadge({ status }: { status: BookingStatus | EmptyLegStatus }) {
  return <Badge className={cn("capitalize", statusStyles[status])}>{status}</Badge>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[44px]">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      {icon && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted">{icon}</div>}
      <p className="text-[17px] font-semibold">{title}</p>
      {body && <p className="mx-auto mt-1.5 max-w-sm text-[14px] text-muted">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-black/[0.05]", className)} />;
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-44" />
      ))}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-full border border-line bg-surface p-1", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-[13px] font-medium transition",
            value === o.value ? "bg-ink text-white" : "text-muted hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Counter({
  value,
  min = 1,
  max = 19,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex h-11 items-center justify-between rounded-xl border border-line-strong bg-surface px-1.5">
      <button
        type="button"
        aria-label={`Fewer ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="h-8 w-8 rounded-full text-[18px] leading-none text-ink hover:bg-black/5 disabled:opacity-30"
      >
        −
      </button>
      <span className="text-[15px] font-medium tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`More ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="h-8 w-8 rounded-full text-[18px] leading-none text-ink hover:bg-black/5 disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

/** Standard screen wrapper: clears the fixed header (incl. notch) and adds breathing room. */
export function Screen({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("pb-16 pt-[calc(env(safe-area-inset-top)+5rem)] sm:pt-28", className)} {...props} />;
}
