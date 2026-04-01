"use client";

import { Check } from "lucide-react";

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
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${
                    step.number < currentStep
                      ? "bg-green-500 text-white"
                      : step.number === currentStep
                      ? "bg-blue-600 text-white ring-4 ring-blue-600/20"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  }
                `}
              >
                {step.number < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium whitespace-nowrap
                  ${
                    step.number <= currentStep
                      ? "text-white"
                      : "text-zinc-500"
                  }
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3 mt-[-1.5rem]">
                <div
                  className={`
                    h-0.5 w-full transition-all duration-300
                    ${
                      step.number < currentStep
                        ? "bg-green-500"
                        : "bg-zinc-700"
                    }
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
