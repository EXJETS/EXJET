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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Plane className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Start from the beginning</h2>
        <Link href="/search" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold">Browse Jets</Link>
      </div>
    );
  }

  const basePrice = jet.basePrice;
  const fuelSurcharge = Math.round(basePrice * 0.15);
  const taxes = Math.round((basePrice + fuelSurcharge) * 0.085);
  const total = basePrice + fuelSurcharge + taxes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingStepper currentStep={3} />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="flex-1 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review Your Booking</h2>

            {/* Flight Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Flight Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">{jet.name}</p>
                    <p className="text-sm text-gray-500">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 pl-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{departureAirport?.city} ({departureAirport?.code})</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{arrivalAirport?.city} ({arrivalAirport?.code})</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 pl-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{departureDate && new Date(departureDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                  {returnDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Return: {new Date(returnDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pl-8">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{passengerCount} passenger{passengerCount > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Passengers</h3>
              <div className="space-y-3">
                {passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">{i === 0 ? "Lead Passenger" : `Passenger ${i + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base charter price</span>
                  <span>{formatCurrency(basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fuel surcharge (15%)</span>
                  <span>{formatCurrency(fuelSurcharge)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes & fees (8.5%)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-amber-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                By confirming this booking, you agree to EXJET&apos;s terms of service and cancellation policy.
                Free cancellation up to 48 hours before departure.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => { setStep(2); router.push("/booking/passengers"); }}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleConfirm}
                className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
              >
                <Check className="w-5 h-5" /> Confirm Booking
              </button>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <TripSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
