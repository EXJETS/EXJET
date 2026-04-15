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
    <div className="sticky top-24 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
      <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Trip Summary</p>

      {/* Jet Info */}
      <div className="mt-4 flex items-center gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <Plane className="h-5 w-5 text-white/80" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-tight text-white">{jet.name}</p>
          <p className="text-[12px] text-white/50">{getCategoryLabel(jet.category)}</p>
        </div>
      </div>

      {/* Route */}
      {(departureAirport || arrivalAirport) && (
        <div className="space-y-2 border-b border-white/[0.08] py-4">
          {departureAirport && (
            <div className="flex items-center gap-2 text-[13px]">
              <MapPin className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} />
              <span className="text-white/50">From</span>
              <span className="font-medium text-white">{departureAirport.city} ({departureAirport.code})</span>
            </div>
          )}
          {arrivalAirport && (
            <div className="flex items-center gap-2 text-[13px]">
              <MapPin className="h-3.5 w-3.5 text-red-300" strokeWidth={2} />
              <span className="text-white/50">To</span>
              <span className="font-medium text-white">{arrivalAirport.city} ({arrivalAirport.code})</span>
            </div>
          )}
        </div>
      )}

      {/* Date & Passengers */}
      <div className="space-y-2 border-b border-white/[0.08] py-4">
        {departureDate && (
          <div className="flex items-center gap-2 text-[13px]">
            <Calendar className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
            <span className="text-white/50">Departure</span>
            <span className="font-medium text-white">
              {new Date(departureDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        )}
        {returnDate && (
          <div className="flex items-center gap-2 text-[13px]">
            <Calendar className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
            <span className="text-white/50">Return</span>
            <span className="font-medium text-white">
              {new Date(returnDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[13px]">
          <Users className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
          <span className="text-white/50">Passengers</span>
          <span className="font-medium text-white">{passengerCount}</span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Price Breakdown</span>
        </div>
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
        <div className="mt-3 flex items-baseline justify-between border-t border-white/[0.08] pt-3">
          <span className="text-[14px] font-semibold text-white">Total</span>
          <span className="text-[18px] font-semibold tracking-tight text-white">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
