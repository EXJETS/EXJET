"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plane, MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import jetsData from "@/data/jets.json";
import airportsData from "@/data/airports.json";
import { useBookingStore } from "@/stores/booking-store";
import BookingStepper from "@/components/booking/booking-stepper";
import TripSummary from "@/components/booking/trip-summary";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Jet, Airport } from "@/types";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jetId = searchParams.get("jet");

  const {
    jet, setJet, departureAirport, arrivalAirport,
    setDepartureAirport, setArrivalAirport,
    departureDate, setDepartureDate, returnDate, setReturnDate,
    passengerCount, setPassengerCount, setStep, setTotalPrice,
  } = useBookingStore();

  const [depSearch, setDepSearch] = useState("");
  const [arrSearch, setArrSearch] = useState("");
  const [showDepDropdown, setShowDepDropdown] = useState(false);
  const [showArrDropdown, setShowArrDropdown] = useState(false);

  const airports = airportsData as Airport[];
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (jetId) {
      const found = (jetsData as Jet[]).find((j) => j.id === jetId);
      if (found) {
        setJet(found);
        setStep(1);
        setTotalPrice(Math.round(found.basePrice * 1.235));
      }
    }
  }, [jetId, setJet, setStep, setTotalPrice]);

  useEffect(() => {
    if (departureAirport) setDepSearch(`${departureAirport.city} (${departureAirport.code})`);
  }, [departureAirport]);

  useEffect(() => {
    if (arrivalAirport) setArrSearch(`${arrivalAirport.city} (${arrivalAirport.code})`);
  }, [arrivalAirport]);

  const filterAirports = (query: string) => {
    if (!query) return [];
    const q = query.toLowerCase();
    return airports
      .filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q)
      )
      .slice(0, 6);
  };

  const handleContinue = () => {
    if (!departureAirport || !arrivalAirport || !departureDate) return;
    setStep(2);
    router.push("/booking/passengers");
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-[13px] text-[#0a1628] placeholder:text-neutral-400 outline-none focus:border-neutral-400";
  const dateInputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-3 text-[13px] text-[#0a1628] placeholder:text-neutral-400 outline-none focus:border-neutral-400";
  const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-600";

  if (!jet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f0eb] px-4 text-[#0a1628]">
        <Plane className="mb-4 h-12 w-12 text-neutral-300" strokeWidth={1.25} />
        <h2 className="text-[20px] font-semibold tracking-tight text-[#0a1628]">No aircraft selected</h2>
        <p className="mt-2 text-[13px] text-neutral-600">Please select a jet from our fleet first.</p>
        <Link
          href="/search"
          className="mt-6 rounded-full bg-[#0d1f3c] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461]"
        >
          Browse Jets
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] text-[#0a1628]">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <BookingStepper currentStep={1} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Main Form */}
          <div className="flex-1">
            {/* Selected Jet */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 backdrop-blur-xl">
              <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100">
                <Plane className="h-5 w-5 text-neutral-800" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-semibold tracking-tight text-[#0a1628]">{jet.name}</h3>
                <p className="text-[12px] text-neutral-500">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
              </div>
              <p className="text-[16px] font-semibold tracking-tight text-[#0a1628]">
                {formatCurrency(jet.hourlyRate)}
                <span className="text-[12px] font-normal text-neutral-500">/hr</span>
              </p>
            </div>

            <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
              <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Trip Details</p>

              {/* Departure Airport */}
              <div className="relative">
                <label className={labelCls}>Departure Airport</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0d1f3c]" strokeWidth={1.75} />
                  <input
                    type="text"
                    placeholder="Search departure city or airport..."
                    value={depSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDepSearch(e.target.value); setShowDepDropdown(true); }}
                    onFocus={() => setShowDepDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDepDropdown(false), 200)}
                    className={inputCls}
                  />
                </div>
                {showDepDropdown && filterAirports(depSearch).length > 0 && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                    {filterAirports(depSearch).map((a) => (
                      <button
                        key={a.code}
                        type="button"
                        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setDepartureAirport(a); setDepSearch(`${a.city} (${a.code})`); setShowDepDropdown(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
                      >
                        <Plane className="h-3.5 w-3.5 text-neutral-600" strokeWidth={1.75} />
                        <div>
                          <span className="text-[13px] font-semibold text-[#0a1628]">{a.code}</span>
                          <span className="ml-2 text-[13px] text-neutral-600">{a.city}, {a.country}</span>
                          <p className="text-[11px] text-neutral-400">{a.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrival Airport */}
              <div className="relative">
                <label className={labelCls}>Arrival Airport</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                  <input
                    type="text"
                    placeholder="Search arrival city or airport..."
                    value={arrSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setArrSearch(e.target.value); setShowArrDropdown(true); }}
                    onFocus={() => setShowArrDropdown(true)}
                    onBlur={() => setTimeout(() => setShowArrDropdown(false), 200)}
                    className={inputCls}
                  />
                </div>
                {showArrDropdown && filterAirports(arrSearch).length > 0 && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                    {filterAirports(arrSearch).map((a) => (
                      <button
                        key={a.code}
                        type="button"
                        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setArrivalAirport(a); setArrSearch(`${a.city} (${a.code})`); setShowArrDropdown(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
                      >
                        <Plane className="h-3.5 w-3.5 text-neutral-600" strokeWidth={1.75} />
                        <div>
                          <span className="text-[13px] font-semibold text-[#0a1628]">{a.code}</span>
                          <span className="ml-2 text-[13px] text-neutral-600">{a.city}, {a.country}</span>
                          <p className="text-[11px] text-neutral-400">{a.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                    <input
                      type="date"
                      min={today}
                      value={departureDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartureDate(e.target.value)}
                      className={dateInputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Return Date (optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={1.75} />
                    <input
                      type="date"
                      min={departureDate || today}
                      value={returnDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReturnDate(e.target.value)}
                      className={dateInputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className={labelCls}>Number of Passengers</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 text-[#0a1628] transition-colors hover:border-neutral-400 hover:bg-neutral-100 disabled:opacity-40"
                    disabled={passengerCount <= 1}
                  >
                    −
                  </button>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
                    <span className="w-8 text-center text-[18px] font-semibold text-[#0a1628]">{passengerCount}</span>
                  </div>
                  <button
                    onClick={() => setPassengerCount(Math.min(jet.passengers, passengerCount + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 text-[#0a1628] transition-colors hover:border-neutral-400 hover:bg-neutral-100 disabled:opacity-40"
                    disabled={passengerCount >= jet.passengers}
                  >
                    +
                  </button>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Max {jet.passengers}</span>
                </div>
              </div>
            </div>

            {/* Continue */}
            <div className="mt-6 flex justify-between">
              <Link
                href={`/jets/${jet.id}`}
                className="rounded-full border border-neutral-300 bg-neutral-50 px-5 py-2.5 text-[12px] font-medium text-[#0a1628] transition-colors hover:border-neutral-400 hover:bg-neutral-100"
              >
                Back to Jet
              </Link>
              <button
                onClick={handleContinue}
                disabled={!departureAirport || !arrivalAirport || !departureDate}
                className="inline-flex items-center gap-2 rounded-full bg-[#0d1f3c] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Passengers
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-80">
            <TripSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f0eb]">
          <Plane className="h-6 w-6 animate-pulse text-neutral-400" strokeWidth={1.75} />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
