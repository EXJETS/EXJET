import Link from "next/link";
import { ArrowLeft, Plane, MapPin, Calendar, Users, CreditCard, Download, Phone, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Sample booking data
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{booking.jet}</h1>
                <p className="text-sm text-gray-500">{booking.manufacturer} · {booking.category}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 capitalize">
              {booking.status}
            </span>
          </div>
          <p className="text-sm text-gray-400">Booking Ref: <span className="font-mono font-bold text-gray-700">{booking.ref}</span></p>
        </div>

        {/* Flight Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Flight Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-400">From</p>
                <p className="text-sm font-medium">{booking.from} ({booking.fromCode})</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-400">To</p>
                <p className="text-sm font-medium">{booking.to} ({booking.toCode})</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Departure</p>
                <p className="text-sm font-medium">{new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Passengers</p>
                <p className="text-sm font-medium">{booking.passengers} guests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Passenger Manifest</h2>
          <div className="space-y-3">
            {booking.passengerList.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
                <span className="text-xs text-gray-400 font-mono">{p.passport}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Price Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base charter price</span>
              <span>{formatCurrency(booking.basePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fuel surcharge</span>
              <span>{formatCurrency(booking.fuelSurcharge)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxes & fees</span>
              <span>{formatCurrency(booking.taxes)}</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-gray-200">
              <span>Total</span>
              <span className="text-amber-600">{formatCurrency(booking.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Download Itinerary
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Phone className="w-4 h-4" /> Contact Support
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50">
            <X className="w-4 h-4" /> Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
