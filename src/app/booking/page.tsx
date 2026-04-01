"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plane, MapPin, Calendar, Users, ArrowRight, ChevronDown } from "lucide-react";
import jetsData from "@/data/jets.json";
import airportsData from "@/data/airports.json";
import { useBookingStore } from "@/stores/booking-store";
import BookingStepper from "@/components/booking/booking-stepper";
import TripSummary from "@/components/booking/trip-summary";
import { cn, formatCurrency, getCategoryLabel } from "@/lib/utils";
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
    return airports.filter(
      (a) => a.code.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    ).slice(0, 6);
  };

  const handleContinue = () => {
    if (!departureAirport || !arrivalAirport || !departureDate) return;
    setStep(2);
    router.push("/booking/passengers");
  };

  if (!jet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Plane className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No aircraft selected</h2>
        <p className="text-gray-500 mb-6">Please select a jet from our fleet first.</p>
        <Link href="/search" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors">
          Browse Jets
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingStepper currentStep={1} />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Main Form */}
          <div className="flex-1">
            {/* Selected Jet */}
            <div className="mb-6 p-4 rounded-xl bg-white border border-gray-200 flex items-center gap-4">
              <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{jet.name}</h3>
                <p className="text-sm text-gray-500">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
              </div>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(jet.hourlyRate)}/hr</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Trip Details</h2>

              {/* Departure Airport */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Departure Airport</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  <input
                    type="text"
                    placeholder="Search departure city or airport..."
                    value={depSearch}
                    onChange={(e) => { setDepSearch(e.target.value); setShowDepDropdown(true); }}
                    onFocus={() => setShowDepDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDepDropdown(false), 200)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                {showDepDropdown && filterAirports(depSearch).length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filterAirports(depSearch).map((a) => (
                      <button
                        key={a.code}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setDepartureAirport(a); setDepSearch(`${a.city} (${a.code})`); setShowDepDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 text-left"
                      >
                        <Plane className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="text-sm font-semibold">{a.code}</span>
                          <span className="text-sm text-gray-500 ml-2">{a.city}, {a.country}</span>
                          <p className="text-xs text-gray-400">{a.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrival Airport */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Arrival Airport</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    placeholder="Search arrival city or airport..."
                    value={arrSearch}
                    onChange={(e) => { setArrSearch(e.target.value); setShowArrDropdown(true); }}
                    onFocus={() => setShowArrDropdown(true)}
                    onBlur={() => setTimeout(() => setShowArrDropdown(false), 200)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                {showArrDropdown && filterAirports(arrSearch).length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filterAirports(arrSearch).map((a) => (
                      <button
                        key={a.code}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setArrivalAirport(a); setArrSearch(`${a.city} (${a.code})`); setShowArrDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 text-left"
                      >
                        <Plane className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="text-sm font-semibold">{a.code}</span>
                          <span className="text-sm text-gray-500 ml-2">{a.city}, {a.country}</span>
                          <p className="text-xs text-gray-400">{a.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Departure Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      min={today}
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Date (optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      min={departureDate || today}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Passengers</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    disabled={passengerCount <= 1}
                  >
                    −
                  </button>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900 w-8 text-center">{passengerCount}</span>
                  </div>
                  <button
                    onClick={() => setPassengerCount(Math.min(jet.passengers, passengerCount + 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    disabled={passengerCount >= jet.passengers}
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-400">Max {jet.passengers}</span>
                </div>
              </div>
            </div>

            {/* Continue */}
            <div className="flex justify-between mt-6">
              <Link href={`/jets/${jet.id}`} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Back to Jet
              </Link>
              <button
                onClick={handleContinue}
                disabled={!departureAirport || !arrivalAirport || !departureDate}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue to Passengers
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <TripSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Plane className="w-6 h-6 animate-pulse text-gray-400" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
