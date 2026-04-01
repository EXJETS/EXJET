"use client";

import Link from "next/link";
import {
  Plane, Calendar, Navigation, Star, MapPin, ArrowRight,
  Radio, Clock, TrendingUp, CreditCard,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { formatCurrency } from "@/lib/utils";

const spendData = [12000, 0, 35000, 8000, 22000, 0, 41000, 18000, 29000, 0, 56000, 38000];

const upcomingTrips = [
  {
    id: "bk-001", jet: "Gulfstream G650ER", from: "New York", fromCode: "KTEB",
    to: "London", toCode: "EGLL", date: "2026-04-15", status: "confirmed" as const, price: 56810,
  },
  {
    id: "bk-002", jet: "Praetor 500", from: "Miami", fromCode: "KMIA",
    to: "Austin", toCode: "KAUS", date: "2026-04-22", status: "confirmed" as const, price: 23712,
  },
];

const pastTrips = [
  { id: "bk-003", jet: "Citation CJ4",   from: "Palm Beach", to: "Chicago",     date: "2026-03-10", status: "completed" as const, price: 15808 },
  { id: "bk-004", jet: "Falcon 900LX",   from: "San Francisco", to: "Las Vegas", date: "2026-02-28", status: "completed" as const, price: 35568 },
  { id: "bk-005", jet: "Challenger 350", from: "Dallas",       to: "Denver",     date: "2026-01-15", status: "cancelled" as const, price: 27664 },
];

// Nearby available jets (Turo-style, location-based)
const nearbyJets = [
  { id: "gulfstream-g500",   name: "Gulfstream G500",   distance: "3.2 mi", airport: "KTEB", category: "heavy",       hourlyRate: 8200, rating: 4.9, status: "available" as const },
  { id: "challenger-350",    name: "Challenger 350",    distance: "3.2 mi", airport: "KTEB", category: "super_midsize", hourlyRate: 5600, rating: 4.7, status: "available" as const },
  { id: "phenom-300e",       name: "Phenom 300E",       distance: "8.1 mi", airport: "KJFK", category: "light",        hourlyRate: 3500, rating: 4.9, status: "available" as const },
  { id: "citation-longitude",name: "Citation Longitude",distance: "11 mi",  airport: "KHPN", category: "super_midsize", hourlyRate: 5400, rating: 4.8, status: "available" as const },
];

const categoryGradients: Record<string, string> = {
  light: "from-sky-400 to-blue-600", midsize: "from-violet-400 to-purple-600",
  super_midsize: "from-amber-400 to-orange-500", heavy: "from-emerald-400 to-teal-600",
  ultra_long: "from-rose-400 to-red-600",
};

export default function ClientDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, John</h1>
          <p className="text-sm text-gray-500 mt-0.5">4 jets available near Teterboro · Updated just now</p>
        </div>
        <Link href="/search" className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2">
          <Plane className="w-4 h-4" /> Book a Flight
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Flights"  value="12"        icon={Plane}       color="amber"  trend={{ value: "3 this year", up: true }} />
        <StatCard label="Miles Flown"    value="45,200"    icon={Navigation}  color="blue"   sub="~18 trips around Earth" />
        <StatCard label="Total Spent"    value="$259,562"  icon={CreditCard}  color="purple" trend={{ value: "14%", up: true }} />
        <StatCard label="Avg Rating"     value="4.9 ★"    icon={Star}        color="green"  sub="Your given ratings" />
      </div>

      {/* Nearby Jets + Spend Chart */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Spend chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Spend (12 mo)</h2>
            <span className="text-xs text-gray-400">{formatCurrency(spendData.reduce((a,b)=>a+b,0))} total</span>
          </div>
          <div className="h-28">
            <MiniChart data={spendData} color="#8b5cf6" height={112} />
          </div>
        </div>

        {/* Nearby jets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Jets Near You</h2>
              <span className="text-xs text-gray-400">· Teterboro area</span>
            </div>
            <Link href="/search" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {nearbyJets.map((j) => (
              <Link key={j.id} href={`/jets/${j.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 ${categoryGradients[j.category]}`}>
                  <Plane className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-700">{j.name}</p>
                  <p className="text-xs text-gray-400">{j.airport} · {j.distance} away</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-amber-600">{formatCurrency(j.hourlyRate)}<span className="text-gray-400 font-normal">/hr</span></p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] text-gray-400">Available</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Upcoming Trips</h2>
          <Link href="/dashboard/tracking" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
            <Radio className="w-3 h-3" /> Track Fleet Live
          </Link>
        </div>
        <div className="grid gap-4">
          {upcomingTrips.map((trip) => (
            <Link key={trip.id} href={`/dashboard/bookings/${trip.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{trip.jet}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    <span>{trip.from} ({trip.fromCode})</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{trip.to} ({trip.toCode})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-sm font-semibold text-amber-600">{formatCurrency(trip.price)}</p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Past Trips */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Past Trips</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {pastTrips.map((trip, i) => (
            <Link key={trip.id} href={`/dashboard/bookings/${trip.id}`}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${i < pastTrips.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="flex items-center gap-3">
                <Plane className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{trip.jet}</p>
                  <p className="text-xs text-gray-400">{trip.from} → {trip.to} · {new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{formatCurrency(trip.price)}</span>
                <StatusBadge status={trip.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
