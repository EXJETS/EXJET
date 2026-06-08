"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlaneTakeoff, CreditCard, StickyNote, Tag, Shield, Check } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import BookingStepper from "@/components/booking/booking-stepper";

export default function ReviewPage() {
  const router = useRouter();
  const {
    jet,
    departureAirport,
    arrivalAirport,
    departureDate,
    returnDate,
    passengerCount,
    passengers,
    setStep,
  } = useBookingStore();

  const handleConfirm = () => {
    setStep(4);
    router.push("/booking/confirmation");
  };

  if (!jet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f0eb] text-[#0a1628]">
        <PlaneTakeoff className="mb-4 h-12 w-12 text-neutral-300" strokeWidth={1.25} />
        <h2 className="text-[20px] font-semibold tracking-tight">Begin your search</h2>
        <Link
          href="/search"
          className="mt-6 rounded-full bg-[#0d1f3c] px-6 py-3 text-[13px] font-medium text-white hover:bg-[#1a3461]"
        >
          Browse fleet
        </Link>
      </div>
    );
  }

  const basePrice = jet.basePrice;
  const fuelSurcharge = Math.round(basePrice * 0.15);
  const taxes = Math.round((basePrice + fuelSurcharge) * 0.085);
  const total = basePrice + fuelSurcharge + taxes;

  const formattedDate = departureDate
    ? new Date(departureDate).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const leadPassenger = passengers[0];
  const leadName = leadPassenger
    ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
    : "Passenger";

  return (
    <div className="min-h-screen bg-[#f5f0eb] pb-32 text-[#0a1628]">
      <div className="mx-auto max-w-lg px-4 pt-16 sm:px-6">
        <BookingStepper currentStep={3} />

        {/* Page title */}
        <div className="mb-6 mt-8 flex items-center gap-3">
          <button
            onClick={() => { setStep(2); router.push("/booking/passengers"); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center text-[20px] font-semibold text-[#0a1628]">
            Confirm reservation
          </h1>
          <div className="w-9" />
        </div>

        {/* Route visualisation — replaces map */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#08111e] to-[#1a3461]" style={{ aspectRatio: "16/7" }}>
          <div className="flex h-full flex-col items-center justify-center px-6">
            <div className="flex w-full items-center gap-3">
              <div className="text-right flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.45)]">
                  {departureAirport?.code ?? "—"}
                </p>
                <p className="text-[18px] font-semibold text-white">
                  {departureAirport?.city ?? "Origin"}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-10 bg-[rgba(255,255,255,0.2)]" />
                <PlaneTakeoff className="h-5 w-5 text-[rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                <div className="h-px w-10 bg-[rgba(255,255,255,0.2)]" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.45)]">
                  {arrivalAirport?.code ?? "—"}
                </p>
                <p className="text-[18px] font-semibold text-white">
                  {arrivalAirport?.city ?? "Destination"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Route detail card */}
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white">
          {/* Date + passenger row */}
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[14px] text-neutral-600">{formattedDate}</p>
            <p className="text-[13px] text-neutral-500">{leadName}</p>
          </div>

          <div className="mx-5 border-t border-neutral-100" />

          {/* From → To with flight icon */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 text-right">
              <p className="text-[15px] font-semibold text-[#0a1628]">{departureAirport?.city ?? "—"}</p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                {departureAirport?.code}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <PlaneTakeoff className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#0a1628]">{arrivalAirport?.city ?? "—"}</p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                {arrivalAirport?.code}
              </p>
            </div>
          </div>

          {returnDate && (
            <>
              <div className="mx-5 border-t border-neutral-100" />
              <div className="px-5 py-3">
                <p className="text-[12px] text-neutral-500">
                  Return:{" "}
                  {new Date(returnDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Aircraft + price */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#0a1628]">{jet.name}</p>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              {getCategoryLabel(jet.category)} · {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-[17px] font-semibold text-[#0a1628]">{formatCurrency(total)}</p>
        </div>

        {/* Payment method */}
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-neutral-400" strokeWidth={1.75} />
            <div>
              <p className="text-[14px] text-[#0a1628]">EXJET Card balance</p>
              <p className="text-[12px] text-neutral-500">Deducted from deposit on confirmation</p>
            </div>
          </div>
        </div>

        {/* Additional notes + apply credit */}
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white">
          <button className="flex w-full items-center gap-3 px-5 py-4 text-left">
            <StickyNote className="h-4 w-4 text-neutral-400 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-[14px] text-neutral-500">Flight notes (catering, preferences...)</span>
          </button>
          <div className="mx-5 border-t border-neutral-100" />
          <button className="flex w-full items-center justify-between px-5 py-4 text-left">
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-neutral-400 shrink-0" strokeWidth={1.75} />
              <span className="text-[14px] text-neutral-500">Apply offer or promo code</span>
            </div>
            <span className="text-[13px] font-medium text-[#0d1f3c]">+ Apply</span>
          </button>
        </div>

        {/* Price breakdown */}
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white px-5 py-5">
          <h2 className="mb-4 text-[15px] font-semibold text-[#0a1628]">Price breakdown</h2>
          <div className="space-y-3">
            {[
              { label: "Base charter price", val: formatCurrency(basePrice) },
              { label: "Fuel surcharge (15%)",  val: formatCurrency(fuelSurcharge) },
              { label: "Taxes & fees (8.5%)",   val: formatCurrency(taxes) },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[13px] text-neutral-600">{label}</span>
                <span className="text-[13px] text-[#0a1628]">{val}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-t border-neutral-200 pt-3">
              <span className="text-[14px] font-semibold text-[#0a1628]">Total</span>
              <span className="text-[20px] font-semibold tracking-tight text-[#0a1628]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms note */}
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={1.75} />
          <p className="text-[12px] leading-relaxed text-neutral-500">
            By confirming, you agree to EXJET&apos;s{" "}
            <Link href="/terms" className="text-[#0d1f3c] hover:underline">Terms of Service</Link>
            {" "}and cancellation policy. Free cancellation up to 48 hours before departure.
          </p>
        </div>
      </div>

      {/* Sticky bottom — Book now */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-lg">
          <button
            onClick={handleConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0d1f3c] py-4 text-[15px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98]"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Book now
          </button>
        </div>
      </div>
    </div>
  );
}
