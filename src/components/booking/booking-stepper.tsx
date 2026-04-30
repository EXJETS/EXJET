"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Trip Details" },
  { number: 2, label: "Passengers" },
  { number: 3, label: "Review" },
  { number: 4, label: "Confirmation" },
];

interface BookingStepperProps {
  currentStep: number;
}

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const complete = step.number < currentStep;
          const active = step.number === currentStep;
          return (
            <div key={step.number} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-300",
                    complete && "bg-[var(--color-ink)] text-white",
                    active && "border border-champagne bg-[var(--color-ivory-deep)] text-[var(--color-ink)] ring-4 ring-[var(--color-ivory-deep)]",
                    !complete && !active && "border border-[var(--color-hairline)] bg-white text-[var(--color-subtle)]"
                  )}
                >
                  {complete ? <Check className="h-4 w-4" strokeWidth={2.25} /> : step.number}
                </div>
                <span
                  className={cn(
                    "mt-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest",
                    step.number <= currentStep ? "text-[var(--color-ink-soft)]" : "text-[var(--color-subtle)]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="mx-3 mt-[-1.5rem] flex-1">
                  <div
                    className={cn(
                      "h-px w-full transition-all duration-300",
                      step.number < currentStep ? "bg-[var(--color-muted)]" : "bg-[var(--color-hairline)]"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
