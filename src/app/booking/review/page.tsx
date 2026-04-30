"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plane, MapPin, Calendar, Users, ArrowLeft, Check, Shield } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import BookingStepper from "@/components/booking/booking-stepper";
import TripSummary from "@/components/booking/trip-summary";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

export default function ReviewPage() {
  const router = useRouter();
  const { jet, departureAirport, arrivalAirport, departureDate, returnDate, passengerCount, passengers, setStep } = useBookingStore();

  const handleConfirm = () => {
    setStep(4);
    router.push("/booking/confirmation");
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

  const basePrice = jet.basePrice;
  const fuelSurcharge = Math.round(basePrice * 0.15);
  const taxes = Math.round((basePrice + fuelSurcharge) * 0.085);
  const total = basePrice + fuelSurcharge + taxes;

  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BookingStepper currentStep={3} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Review</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-[var(--color-ink)]">Review Your Booking</h2>
            </div>

            {/* Flight Details */}
            <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6 backdrop-blur-xl">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Flight Details</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)]">
                    <Plane className="h-4 w-4 text-[var(--color-ink-soft)]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold tracking-tight text-[var(--color-ink)]">{jet.name}</p>
                    <p className="text-[12px] text-[var(--color-muted)]">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 pl-[52px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
                    <span className="text-[13px] text-[var(--color-ink-soft)]">{departureAirport?.city} ({departureAirport?.code})</span>
                  </div>
                  <span className="text-[var(--color-subtle)]">→</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-red-700" strokeWidth={2} />
                    <span className="text-[13px] text-[var(--color-ink-soft)]">{arrivalAirport?.city} ({arrivalAirport?.code})</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 pl-[52px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[var(--color-subtle)]" strokeWidth={1.75} />
                    <span className="text-[13px] text-[var(--color-ink-soft)]">
                      {departureDate &&
                        new Date(departureDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {returnDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[var(--color-subtle)]" strokeWidth={1.75} />
                      <span className="text-[13px] text-[var(--color-ink-soft)]">
                        Return: {new Date(returnDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pl-[52px]">
                  <Users className="h-3.5 w-3.5 text-[var(--color-subtle)]" strokeWidth={1.75} />
                  <span className="text-[13px] text-[var(--color-ink-soft)]">
                    {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6 backdrop-blur-xl">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Passengers</p>
              <div className="mt-4 space-y-0">
                {passengers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-[var(--color-hairline)] py-3 last:border-0"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[var(--color-ink)]">{p.firstName} {p.lastName}</p>
                      <p className="text-[11px] text-[var(--color-muted)]">{p.email}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">
                      {i === 0 ? "Lead" : `Pax ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6 backdrop-blur-xl">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">Price Breakdown</p>
              <div className="mt-4 space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--color-muted)]">Base charter price</span>
                  <span className="text-[var(--color-ink)]">{formatCurrency(basePrice)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--color-muted)]">Fuel surcharge (15%)</span>
                  <span className="text-[var(--color-ink)]">{formatCurrency(fuelSurcharge)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--color-muted)]">Taxes &amp; fees (8.5%)</span>
                  <span className="text-[var(--color-ink)]">{formatCurrency(taxes)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-[var(--color-hairline)] pt-3">
                  <span className="text-[14px] font-semibold text-[var(--color-ink)]">Total</span>
                  <span className="text-[20px] font-semibold tracking-tight text-[var(--color-ink)]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 rounded-xl border border-[var(--color-hairline)] bg-white p-4">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-ink-soft)]" strokeWidth={1.75} />
              <p className="text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
                By confirming this booking, you agree to EXJET&apos;s terms of service and cancellation policy.
                Free cancellation up to 48 hours before departure.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => { setStep(2); router.push("/booking/passengers"); }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-5 py-2.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-ivory)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back
              </button>
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-ink-soft)] active:scale-[0.98]"
              >
                <Check className="h-4 w-4" strokeWidth={2.25} /> Confirm Booking
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
