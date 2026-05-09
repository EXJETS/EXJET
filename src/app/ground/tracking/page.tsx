"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { TripStatusTracker } from "@/components/ground/trip-status-tracker";
import type { GroundBookingStatus } from "@/types";

const DEMO_BOOKING = {
  confirmationCode: "EXG-DEMO01",
  status: "en_route" as GroundBookingStatus,
  chauffeurName: "Marcus D.",
  vehiclePlate: "NYC-EXG-4721",
  pickupAddress: "JFK International Airport, Terminal 4",
  dropoffAddress: "The Plaza Hotel, 768 5th Avenue, New York",
  eta: 12,
};

export default function GroundTrackingPage() {
  const [code, setCode] = useState("");
  const [booking, setBooking] = useState<typeof DEMO_BOOKING | null>(null);
  const [notFound, setNotFound] = useState(false);

  function handleLookup() {
    if (code.trim() === "" || code.toUpperCase() === DEMO_BOOKING.confirmationCode) {
      setBooking(DEMO_BOOKING);
      setNotFound(false);
    } else {
      setBooking(null);
      setNotFound(true);
    }
  }

  function handleDemoLoad() {
    setCode(DEMO_BOOKING.confirmationCode);
    setBooking(DEMO_BOOKING);
    setNotFound(false);
  }

  return (
    <div className="min-h-screen bg-[var(--color-ivory)]">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">

        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/ground"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-hairline)] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </Link>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">EXJET Ground</div>
            <h1 className="font-serif text-[28px] text-[var(--color-ink)]">Track Your Ride</h1>
          </div>
        </div>

        {/* Lookup */}
        {!booking && (
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Confirmation Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne" strokeWidth={1.75} />
                  <input
                    type="text"
                    placeholder="EXG-XXXXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 pl-10 pr-4 font-mono text-[14px] uppercase tracking-widest text-[var(--color-ink)] placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--color-subtle)] focus:border-champagne focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLookup}
                  className="rounded-full bg-[var(--color-ink)] px-5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
                >
                  Track
                </button>
              </div>
              {notFound && (
                <p className="mt-2 text-[12px] text-[var(--color-bordeaux)]">
                  No booking found for that code. Please check and try again.
                </p>
              )}
            </div>

            <div className="border-t border-[var(--color-hairline)] pt-4">
              <p className="text-[12px] text-[var(--color-muted)]">
                Don't have your code?{" "}
                <button
                  type="button"
                  onClick={handleDemoLoad}
                  className="font-medium text-champagne underline underline-offset-2"
                >
                  Load a demo booking
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Tracking view */}
        {booking && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--color-hairline)] bg-white px-5 py-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">Confirmation</div>
                <div className="mt-0.5 font-mono text-[18px] font-medium tracking-widest text-[var(--color-ink)]">
                  {booking.confirmationCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setBooking(null); setCode(""); }}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:text-champagne"
              >
                Change
              </button>
            </div>

            <TripStatusTracker
              status={booking.status}
              chauffeurName={booking.chauffeurName}
              vehiclePlate={booking.vehiclePlate}
              pickupAddress={booking.pickupAddress}
              dropoffAddress={booking.dropoffAddress}
              eta={booking.eta}
              autoProgress
            />

            <div className="flex gap-3">
              <Link
                href="/ground/book"
                className="flex-1 rounded-full border border-[var(--color-hairline-strong)] py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne"
              >
                Book Another
              </Link>
              <Link
                href="/ground"
                className="flex-1 rounded-full bg-[var(--color-ink)] py-3 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
