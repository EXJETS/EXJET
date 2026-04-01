"use client";

import { useBookingStore } from "@/stores/booking-store";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import { Plane, MapPin, Calendar, Users, CreditCard } from "lucide-react";

export default function TripSummary() {
  const { jet, departureAirport, arrivalAirport, departureDate, returnDate, passengerCount } =
    useBookingStore();

  if (!jet) return null;

  const basePrice = jet.basePrice;
  const fuelSurcharge = Math.round(basePrice * 0.15);
  const taxes = Math.round((basePrice + fuelSurcharge) * 0.085);
  const total = basePrice + fuelSurcharge + taxes;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>

      {/* Jet Info */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{jet.name}</p>
          <p className="text-sm text-gray-500">{getCategoryLabel(jet.category)}</p>
        </div>
      </div>

      {/* Route */}
      {(departureAirport || arrivalAirport) && (
        <div className="py-4 border-b border-gray-100 space-y-2">
          {departureAirport && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">From:</span>
              <span className="font-medium">{departureAirport.city} ({departureAirport.code})</span>
            </div>
          )}
          {arrivalAirport && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">To:</span>
              <span className="font-medium">{arrivalAirport.city} ({arrivalAirport.code})</span>
            </div>
          )}
        </div>
      )}

      {/* Date & Passengers */}
      <div className="py-4 border-b border-gray-100 space-y-2">
        {departureDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Departure:</span>
            <span className="font-medium">{new Date(departureDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        )}
        {returnDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Return:</span>
            <span className="font-medium">{new Date(returnDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Passengers:</span>
          <span className="font-medium">{passengerCount}</span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="py-4 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Price Breakdown</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Base charter price</span>
          <span className="text-gray-900">{formatCurrency(basePrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Fuel surcharge (15%)</span>
          <span className="text-gray-900">{formatCurrency(fuelSurcharge)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Taxes & fees (8.5%)</span>
          <span className="text-gray-900">{formatCurrency(taxes)}</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200 mt-3">
          <span className="text-gray-900">Total</span>
          <span className="text-primary-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
