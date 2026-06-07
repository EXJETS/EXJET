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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f2f2f7] text-[#0a1628]">
        <Plane className="mb-4 h-12 w-12 text-neutral-300" strokeWidth={1.25} />
        <h2 className="text-[20px] font-semibold tracking-tight">No booking found</h2>
        <Link
          href="/search"
          className="mt-6 rounded-full bg-[#0d1f3c] px-6 py-3 text-[13px] font-medium text-white hover:bg-[#1a3461]"
        >
          Browse Jets
        </Link>
      </div>
    );
  }

  const basePrice = jet.basePrice;
  const total = Math.round(basePrice * 1.235);

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-[#0a1628]">
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <BookingStepper currentStep={4} />

        <div className="mt-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(13,31,60,0.08)] ring-1 ring-[rgba(13,31,60,0.2)]">
            <CheckCircle className="h-8 w-8 text-[#0d1f3c]" strokeWidth={1.75} />
          </div>

          <p className="font-mono text-[11px] uppercase tracking-widest text-[#0d1f3c]">Confirmed for departure</p>
          <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-[#0a1628]">Booking Confirmed</h1>
          <p className="mt-2 text-[14px] text-neutral-600">Your private jet charter has been successfully booked.</p>
          <p className="mt-3 text-[12px] text-neutral-500">
            Booking Reference:{" "}
            <span className="font-mono font-semibold text-[#0a1628]">{bookingRef}</span>
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4 border-b border-neutral-200 pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100">
              <Plane className="h-6 w-6 text-neutral-800" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-tight text-[#0a1628]">{jet.name}</h3>
              <p className="text-[12px] text-neutral-500">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-2">
            <InfoLine
              icon={<MapPin className="h-4 w-4 text-[#0d1f3c]" strokeWidth={1.75} />}
              label="From"
              value={`${departureAirport?.city} (${departureAirport?.code})`}
            />
            <InfoLine
              icon={<MapPin className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />}
              label="To"
              value={`${arrivalAirport?.city} (${arrivalAirport?.code})`}
            />
            <InfoLine
              icon={<Calendar className="h-4 w-4 text-neutral-600" strokeWidth={1.75} />}
              label="Date"
              value={
                departureDate
                  ? new Date(departureDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                  : "—"
              }
            />
            <InfoLine
              icon={<Users className="h-4 w-4 text-neutral-600" strokeWidth={1.75} />}
              label="Passengers"
              value={`${passengerCount} guest${passengerCount > 1 ? "s" : ""}`}
            />
          </div>

          <div className="flex items-baseline justify-between border-t border-neutral-200 pt-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Total Paid</span>
            <span className="text-[24px] font-semibold tracking-tight text-[#0a1628]">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">What&apos;s Next?</p>
          <div className="mt-4 space-y-3">
            {[
              "You'll receive a confirmation email with your complete itinerary and boarding details.",
              "Our concierge team will contact you 24 hours before departure to finalize catering and ground transport.",
              "Arrive at the FBO 15 minutes before your scheduled departure. No lines, no waiting.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100">
                  <span className="font-mono text-[10px] font-semibold text-[#0a1628]">{i + 1}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-neutral-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0d1f3c] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98]"
          >
            View Dashboard <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
          <Link
            href="/search"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 px-6 py-3 text-[13px] font-medium text-[#0a1628] transition-colors hover:border-neutral-400 hover:bg-neutral-100"
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
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium text-[#0a1628]">{value}</p>
      </div>
    </div>
  );
}
