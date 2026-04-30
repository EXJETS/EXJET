"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ArrowRight, ArrowLeft, Plane } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import BookingStepper from "@/components/booking/booking-stepper";
import TripSummary from "@/components/booking/trip-summary";
import type { PassengerInfo } from "@/types";

export default function PassengersPage() {
  const router = useRouter();
  const { jet, passengerCount, passengers, setPassengers, setStep } = useBookingStore();

  const [forms, setForms] = useState<PassengerInfo[]>(
    passengers.length > 0
      ? passengers
      : Array.from({ length: passengerCount }, () => ({
          firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", passportNumber: "",
        }))
  );

  const updateField = (index: number, field: keyof PassengerInfo, value: string) => {
    setForms((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const isValid = forms.every((p) => p.firstName && p.lastName && p.email);

  const handleContinue = () => {
    setPassengers(forms);
    setStep(3);
    router.push("/booking/review");
  };

  if (!jet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-[var(--color-ink)]">
        <Plane className="mb-4 h-12 w-12 text-[var(--color-subtle)]" strokeWidth={1.25} />
        <h2 className="text-[20px] font-semibold tracking-tight">Start from the beginning</h2>
        <Link
          href="/search"
          className="mt-6 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink-soft)]"
        >
          Browse Jets
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-3 py-2.5 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] outline-none focus:border-[var(--color-champagne)]";
  const dateInputCls = inputCls + "";
  const labelCls = "mb-1 block font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]";

  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BookingStepper currentStep={2} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Passengers</p>
            <h2 className="text-[24px] font-semibold tracking-tight text-[var(--color-ink)]">Passenger Information</h2>
            <p className="text-[13px] text-[var(--color-muted)]">
              Please provide details for all {passengerCount} passenger{passengerCount > 1 ? "s" : ""}.
            </p>

            {forms.map((passenger, idx) => (
              <div key={idx} className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)]">
                    <User className="h-3.5 w-3.5 text-[var(--color-ink-soft)]" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[14px] font-semibold tracking-tight text-[var(--color-ink)]">
                    Passenger {idx + 1}{idx === 0 ? " (Lead)" : ""}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>First Name *</label>
                    <input
                      type="text" value={passenger.firstName}
                      onChange={(e) => updateField(idx, "firstName", e.target.value)}
                      className={inputCls}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name *</label>
                    <input
                      type="text" value={passenger.lastName}
                      onChange={(e) => updateField(idx, "lastName", e.target.value)}
                      className={inputCls}
                      placeholder="Smith"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input
                      type="email" value={passenger.email}
                      onChange={(e) => updateField(idx, "email", e.target.value)}
                      className={inputCls}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      type="tel" value={passenger.phone}
                      onChange={(e) => updateField(idx, "phone", e.target.value)}
                      className={inputCls}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Date of Birth</label>
                    <input
                      type="date" value={passenger.dateOfBirth}
                      onChange={(e) => updateField(idx, "dateOfBirth", e.target.value)}
                      className={dateInputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Passport Number</label>
                    <input
                      type="text" value={passenger.passportNumber}
                      onChange={(e) => updateField(idx, "passportNumber", e.target.value)}
                      className={inputCls}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => { setStep(1); router.push("/booking?jet=" + jet.id); }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-5 py-2.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-ivory)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!isValid}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-ink-soft)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Review <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-80">
            <TripSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
