import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full rounded-lg border border-[var(--color-hairline)] bg-white px-4 py-3 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] transition-colors",
            "hover:border-[var(--color-hairline-strong)]",
            "focus:border-[var(--color-hairline-strong)] focus:bg-white focus:outline-none focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/60 focus:border-red-500",
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-[12px] text-red-600"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-[12px] text-[var(--color-subtle)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
