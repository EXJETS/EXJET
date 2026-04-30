"use client";

import Link from "next/link";
import { CheckCircle, Plane, MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import BookingStepper from "@/components/booking/booking-stepper";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

export default function ConfirmationPage() {
  const { jet, departureAirport, arrivalAirport, departureDate, passengerCount } = useBookingStore();

  const bookingRef = `EXJ-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).toUpperCase().slice(2, 5)}`;

  if (!jet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-[var(--color-ink)]">
        <Plane className="mb-4 h-12 w-12 text-[var(--color-subtle)]" strokeWidth={1.25} />
        <h2 className="text-[20px] font-semibold tracking-tight">No booking found</h2>
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
  const total = Math.round(basePrice * 1.235);

  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <BookingStepper currentStep={4} />

        <div className="mt-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-ivory-deep)] ring-1 ring-[var(--color-bone)]">
            <CheckCircle className="h-8 w-8 text-champagne" strokeWidth={1.75} />
          </div>

          <p className="font-mono text-[11px] uppercase tracking-widest text-champagne">Cleared for takeoff</p>
          <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-[var(--color-ink)]">Booking Confirmed</h1>
          <p className="mt-2 text-[14px] text-[var(--color-muted)]">Your private jet charter has been successfully booked.</p>
          <p className="mt-3 text-[12px] text-[var(--color-muted)]">
            Booking Reference:{" "}
            <span className="font-mono font-semibold text-[var(--color-ink)]">{bookingRef}</span>
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="mt-8 rounded-2xl border border-[var(--color-hairline)] bg-white p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 border-b border-[var(--color-hairline)] pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)]">
              <Plane className="h-6 w-6 text-[var(--color-ink-soft)]" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-tight text-[var(--color-ink)]">{jet.name}</h3>
              <p className="text-[12px] text-[var(--color-muted)]">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-2">
            <InfoLine
              icon={<MapPin className="h-4 w-4 text-emerald-700" strokeWidth={2} />}
              label="From"
              value={`${departureAirport?.city} (${departureAirport?.code})`}
            />
            <InfoLine
              icon={<MapPin className="h-4 w-4 text-red-700" strokeWidth={2} />}
              label="To"
              value={`${arrivalAirport?.city} (${arrivalAirport?.code})`}
            />
            <InfoLine
              icon={<Calendar className="h-4 w-4 text-[var(--color-muted)]" strokeWidth={1.75} />}
              label="Date"
              value={
                departureDate
                  ? new Date(departureDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                  : "—"
              }
            />
            <InfoLine
              icon={<Users className="h-4 w-4 text-[var(--color-muted)]" strokeWidth={1.75} />}
              label="Passengers"
              value={`${passengerCount} guest${passengerCount > 1 ? "s" : ""}`}
            />
          </div>

          <div className="flex items-baseline justify-between border-t border-[var(--color-hairline)] pt-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-muted)]">Total Paid</span>
            <span className="text-[24px] font-semibold tracking-tight text-[var(--color-ink)]">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 rounded-2xl border border-[var(--color-hairline)] bg-white p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">What&apos;s Next?</p>
          <div className="mt-4 space-y-3">
            {[
              "You'll receive a confirmation email with your complete itinerary and boarding details.",
              "Our concierge team will contact you 24 hours before departure to finalize catering and ground transport.",
              "Arrive at the FBO 15 minutes before your scheduled departure. No lines, no waiting.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)]">
                  <span className="font-mono text-[10px] font-semibold text-[var(--color-ink)]">{i + 1}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--color-ink-soft)]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-ink-soft)] active:scale-[0.98]"
          >
            View Dashboard <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
          <Link
            href="/search"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-6 py-3 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-ivory)]"
          >
            Book Another Flight
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium text-[var(--color-ink)]">{value}</p>
      </div>
    </div>
  );
}
