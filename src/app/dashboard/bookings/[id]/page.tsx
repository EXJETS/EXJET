"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plane, MapPin, Calendar, Users, Download, Phone, X, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const booking = {
    id,
    ref: `EXJ-${id.toUpperCase().slice(-6)}`,
    jet: "Gulfstream G650ER",
    manufacturer: "Gulfstream",
    category: "Ultra Long Range",
    from: "Teterboro", fromCode: "KTEB",
    to: "London Heathrow", toCode: "EGLL",
    date: "2026-04-15",
    returnDate: "2026-04-20",
    passengers: 4,
    status: cancelled ? "cancelled" : "confirmed",
    basePrice: 46000,
    fuelSurcharge: 6900,
    taxes: 4497,
    total: 57397,
    passengerList: [
      { name: "John Doe", email: "john@example.com", passport: "US1234567" },
      { name: "Jane Doe", email: "jane@example.com", passport: "US7654321" },
      { name: "Alex Smith", email: "alex@example.com", passport: "US1122334" },
      { name: "Sarah Johnson", email: "sarah@example.com", passport: "US4433221" },
    ],
  };

  const handleDownload = () => window.print();

  const handleCancel = () => {
    setCancelled(true);
    setCancelConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb] text-[#0a1628]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-[#0a1628]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100">
                <Plane className="h-6 w-6 text-neutral-800" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold tracking-tight text-[#0a1628]">{booking.jet}</h1>
                <p className="text-[12px] text-neutral-500">{booking.manufacturer} · {booking.category}</p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ring-1 ${
              cancelled
                ? "bg-red-50 text-red-700 ring-red-200"
                : "bg-emerald-50 text-emerald-700 ring-emerald-200"
            }`}>
              {booking.status}
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Booking Ref: <span className="font-semibold text-neutral-800">{booking.ref}</span>
          </p>
        </div>

        {/* Flight Info */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Flight Information</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={<MapPin className="h-4 w-4 text-emerald-700" strokeWidth={2} />}
              label="From"
              value={`${booking.from} (${booking.fromCode})`}
            />
            <InfoItem
              icon={<MapPin className="h-4 w-4 text-red-700" strokeWidth={2} />}
              label="To"
              value={`${booking.to} (${booking.toCode})`}
            />
            <InfoItem
              icon={<Calendar className="h-4 w-4 text-neutral-600" strokeWidth={1.75} />}
              label="Departure"
              value={new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            />
            <InfoItem
              icon={<Users className="h-4 w-4 text-neutral-600" strokeWidth={1.75} />}
              label="Passengers"
              value={`${booking.passengers} guests`}
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Passenger Manifest</p>
          <div className="mt-4">
            {booking.passengerList.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-neutral-200 py-3 last:border-0"
              >
                <div>
                  <p className="text-[13px] font-medium text-[#0a1628]">{p.name}</p>
                  <p className="text-[11px] text-neutral-500">{p.email}</p>
                </div>
                <span className="font-mono text-[11px] text-neutral-400">{p.passport}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Price Breakdown</p>
          <div className="mt-4 space-y-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-neutral-600">Base charter price</span>
              <span className="text-[#0a1628]">{formatCurrency(booking.basePrice)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-neutral-600">Fuel surcharge</span>
              <span className="text-[#0a1628]">{formatCurrency(booking.fuelSurcharge)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-neutral-600">Taxes &amp; fees</span>
              <span className="text-[#0a1628]">{formatCurrency(booking.taxes)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-neutral-200 pt-3">
              <span className="text-[14px] font-semibold text-[#0a1628]">Total</span>
              <span className="text-[20px] font-semibold tracking-tight text-[#0a1628]">{formatCurrency(booking.total)}</span>
            </div>
          </div>
        </div>

        {/* Cancel confirm modal */}
        {cancelConfirm && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-[14px] font-semibold text-red-900">Cancel this booking?</p>
            <p className="mt-1 text-[13px] text-red-700">
              Free cancellation applies up to 48 hours before departure. This action cannot be undone.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-[12px] font-medium text-white hover:bg-red-700"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} /> Yes, cancel booking
              </button>
              <button
                onClick={() => setCancelConfirm(false)}
                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-[12px] font-medium text-[#0a1628] hover:bg-neutral-100"
              >
                Keep booking
              </button>
            </div>
          </div>
        )}

        {/* Cancelled success */}
        {cancelled && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0d1f3c]" strokeWidth={1.75} />
            <p className="text-[13px] text-neutral-700">
              Booking cancelled. A refund of <span className="font-semibold">{formatCurrency(booking.total)}</span> will be processed within 5–7 business days.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-5 py-2.5 text-[12px] font-medium text-[#0a1628] transition-colors hover:border-neutral-400 hover:bg-neutral-100"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} /> Download Itinerary
          </button>
          <a
            href="tel:+18883995387"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-5 py-2.5 text-[12px] font-medium text-[#0a1628] transition-colors hover:border-neutral-400 hover:bg-neutral-100"
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> Contact Support
          </a>
          {!cancelled && (
            <button
              onClick={() => setCancelConfirm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-[12px] font-medium text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-500/15"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} /> Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
