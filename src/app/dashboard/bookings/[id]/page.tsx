import Link from "next/link";
import { ArrowLeft, Plane, MapPin, Calendar, Users, Download, Phone, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    status: "confirmed",
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                <Plane className="h-6 w-6 text-white/80" strokeWidth={1.75} />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold tracking-tight text-white">{booking.jet}</h1>
                <p className="text-[12px] text-white/50">{booking.manufacturer} · {booking.category}</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/20">
              {booking.status}
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Booking Ref: <span className="font-semibold text-white/80">{booking.ref}</span>
          </p>
        </div>

        {/* Flight Info */}
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Flight Information</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={<MapPin className="h-4 w-4 text-emerald-300" strokeWidth={2} />}
              label="From"
              value={`${booking.from} (${booking.fromCode})`}
            />
            <InfoItem
              icon={<MapPin className="h-4 w-4 text-red-300" strokeWidth={2} />}
              label="To"
              value={`${booking.to} (${booking.toCode})`}
            />
            <InfoItem
              icon={<Calendar className="h-4 w-4 text-white/60" strokeWidth={1.75} />}
              label="Departure"
              value={new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            />
            <InfoItem
              icon={<Users className="h-4 w-4 text-white/60" strokeWidth={1.75} />}
              label="Passengers"
              value={`${booking.passengers} guests`}
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Passenger Manifest</p>
          <div className="mt-4">
            {booking.passengerList.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0"
              >
                <div>
                  <p className="text-[13px] font-medium text-white">{p.name}</p>
                  <p className="text-[11px] text-white/50">{p.email}</p>
                </div>
                <span className="font-mono text-[11px] text-white/40">{p.passport}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Price Breakdown</p>
          <div className="mt-4 space-y-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-white/60">Base charter price</span>
              <span className="text-white">{formatCurrency(booking.basePrice)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-white/60">Fuel surcharge</span>
              <span className="text-white">{formatCurrency(booking.fuelSurcharge)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-white/60">Taxes &amp; fees</span>
              <span className="text-white">{formatCurrency(booking.taxes)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-white/[0.08] pt-3">
              <span className="text-[14px] font-semibold text-white">Total</span>
              <span className="text-[20px] font-semibold tracking-tight text-white">{formatCurrency(booking.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.06]">
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} /> Download Itinerary
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.06]">
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> Contact Support
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-2.5 text-[12px] font-medium text-red-300 ring-1 ring-red-400/20 transition-colors hover:bg-red-500/15">
            <X className="h-3.5 w-3.5" strokeWidth={1.75} /> Cancel Booking
          </button>
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
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium text-white">{value}</p>
      </div>
    </div>
  );
}
