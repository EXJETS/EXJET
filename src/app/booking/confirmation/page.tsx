"use client";

import Link from "next/link";
import { CheckCircle, Plane, MapPin, Calendar, Users, ArrowRight, Download, Phone } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import BookingStepper from "@/components/booking/booking-stepper";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

export default function ConfirmationPage() {
  const { jet, departureAirport, arrivalAirport, departureDate, passengerCount } = useBookingStore();

  const bookingRef = `EXJ-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).toUpperCase().slice(2, 5)}`;

  if (!jet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Plane className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No booking found</h2>
        <Link href="/search" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold">Browse Jets</Link>
      </div>
    );
  }

  const basePrice = jet.basePrice;
  const total = Math.round(basePrice * 1.235);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingStepper currentStep={4} />

        <div className="mt-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-2">Your private jet charter has been successfully booked.</p>
          <p className="text-sm text-gray-400 mb-8">
            Booking Reference: <span className="font-mono font-bold text-gray-900">{bookingRef}</span>
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{jet.name}</h3>
              <p className="text-sm text-gray-500">{jet.manufacturer} · {getCategoryLabel(jet.category)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm font-medium">{departureAirport?.city} ({departureAirport?.code})</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-400">To</p>
                <p className="text-sm font-medium">{arrivalAirport?.city} ({arrivalAirport?.code})</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm font-medium">
                  {departureDate && new Date(departureDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Passengers</p>
                <p className="text-sm font-medium">{passengerCount} guest{passengerCount > 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Paid</span>
            <span className="text-2xl font-bold text-amber-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-600">1</span>
              </div>
              <p className="text-sm text-gray-600">You&apos;ll receive a confirmation email with your complete itinerary and boarding details.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-600">2</span>
              </div>
              <p className="text-sm text-gray-600">Our concierge team will contact you 24 hours before departure to finalize catering and ground transport.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-600">3</span>
              </div>
              <p className="text-sm text-gray-600">Arrive at the FBO 15 minutes before your scheduled departure. No lines, no waiting.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 text-center py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
          >
            View Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/search"
            className="flex-1 text-center py-3 px-6 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Book Another Flight
          </Link>
        </div>
      </div>
    </div>
  );
}
