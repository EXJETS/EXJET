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
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <Plane className="mb-4 h-12 w-12 text-white/20" strokeWidth={1.25} />
        <h2 className="text-[20px] font-semibold tracking-tight">Start from the beginning</h2>
        <Link
          href="/search"
          className="mt-6 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-black hover:bg-white/90"
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
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BookingStepper currentStep={3} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Review</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-white">Review Your Booking</h2>
            </div>

            {/* Flight Details */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Flight Details</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                    <Plane className="h-4 w-4 text-white/80" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold tracking-tight text-white">{jet.name}</p>
                    <p className="text-[12px] text-white/50">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 pl-[52px]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} />
                    <span className="text-[13px] text-white/85">{departureAirport?.city} ({departureAirport?.code})</span>
                  </div>
                  <span className="text-white/30">→</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-red-300" strokeWidth={2} />
                    <span className="text-[13px] text-white/85">{arrivalAirport?.city} ({arrivalAirport?.code})</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 pl-[52px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
                    <span className="text-[13px] text-white/85">
                      {departureDate &&
                        new Date(departureDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {returnDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
                      <span className="text-[13px] text-white/85">
                        Return: {new Date(returnDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pl-[52px]">
                  <Users className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
                  <span className="text-[13px] text-white/85">
                    {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Passengers</p>
              <div className="mt-4 space-y-0">
                {passengers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-white">{p.firstName} {p.lastName}</p>
                      <p className="text-[11px] text-white/50">{p.email}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                      {i === 0 ? "Lead" : `Pax ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Price Breakdown</p>
              <div className="mt-4 space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/60">Base charter price</span>
                  <span className="text-white">{formatCurrency(basePrice)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/60">Fuel surcharge (15%)</span>
                  <span className="text-white">{formatCurrency(fuelSurcharge)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/60">Taxes &amp; fees (8.5%)</span>
                  <span className="text-white">{formatCurrency(taxes)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-white/[0.08] pt-3">
                  <span className="text-[14px] font-semibold text-white">Total</span>
                  <span className="text-[20px] font-semibold tracking-tight text-white">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-white/70" strokeWidth={1.75} />
              <p className="text-[13px] leading-relaxed text-white/70">
                By confirming this booking, you agree to EXJET&apos;s terms of service and cancellation policy.
                Free cancellation up to 48 hours before departure.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => { setStep(2); router.push("/booking/passengers"); }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.06]"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back
              </button>
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-[13px] font-medium text-black transition-colors hover:bg-white/90 active:scale-[0.98]"
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
