"use client";

import Link from "next/link";
import {
  Plane, Navigation, Star, MapPin, ArrowRight,
  Radio, CreditCard,
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

const nearbyJets = [
  { id: "gulfstream-g500",   name: "Gulfstream G500",   distance: "3.2 mi", airport: "KTEB", category: "heavy",        hourlyRate: 8200, rating: 4.9, status: "available" as const },
  { id: "challenger-350",    name: "Challenger 350",    distance: "3.2 mi", airport: "KTEB", category: "super_midsize", hourlyRate: 5600, rating: 4.7, status: "available" as const },
  { id: "phenom-300e",       name: "Phenom 300E",       distance: "8.1 mi", airport: "KJFK", category: "light",         hourlyRate: 3500, rating: 4.9, status: "available" as const },
  { id: "citation-longitude",name: "Citation Longitude",distance: "11 mi",  airport: "KHPN", category: "super_midsize", hourlyRate: 5400, rating: 4.8, status: "available" as const },
];

export default function ClientDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Overview</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-white">Welcome back, John</h1>
          <p className="mt-1 text-[13px] text-white/50">4 jets available near Teterboro · Updated just now</p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-colors hover:bg-white/90 active:scale-[0.98]"
        >
          <Plane className="h-3.5 w-3.5" strokeWidth={2} /> Book a Flight
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Flights"  value="12"        icon={Plane}       trend={{ value: "3 this year", up: true }} />
        <StatCard label="Miles Flown"    value="45,200"    icon={Navigation}  sub="~18 trips around Earth" />
        <StatCard label="Total Spent"    value="$259,562"  icon={CreditCard}  trend={{ value: "14%", up: true }} />
        <StatCard label="Avg Rating"     value="4.9 ★"    icon={Star}        sub="Your given ratings" />
      </div>

      {/* Nearby Jets + Spend Chart */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Spend chart */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Spend (12 mo)</p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              {formatCurrency(spendData.reduce((a, b) => a + b, 0))} total
            </span>
          </div>
          <div className="h-28">
            <MiniChart data={spendData} color="#ffffff" height={112} />
          </div>
        </div>

        {/* Nearby jets */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-white/60" strokeWidth={2} />
              <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Jets Near You</p>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">· Teterboro</span>
            </div>
            <Link href="/search" className="inline-flex items-center gap-1 text-[12px] font-medium text-white/70 transition-colors hover:text-white">
              See all <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {nearbyJets.map((j) => (
              <Link
                key={j.id}
                href={`/jets/${j.id}`}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                  <Plane className="h-4 w-4 text-white/80" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{j.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {j.airport} · {j.distance}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[12px] font-semibold text-white">
                    {formatCurrency(j.hourlyRate)}
                    <span className="font-normal text-white/40">/hr</span>
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Available</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">Upcoming Trips</p>
          <Link
            href="/dashboard/tracking"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/70 transition-colors hover:text-white"
          >
            <Radio className="h-3 w-3 text-emerald-300" strokeWidth={2} /> Track Fleet Live
          </Link>
        </div>
        <div className="grid gap-3">
          {upcomingTrips.map((trip) => (
            <Link
              key={trip.id}
              href={`/dashboard/bookings/${trip.id}`}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.04] sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                  <Plane className="h-5 w-5 text-white/80" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold tracking-tight text-white">{trip.jet}</h3>
                  <div className="mt-1 flex items-center gap-2 text-[12px] text-white/60">
                    <span>{trip.from} ({trip.fromCode})</span>
                    <ArrowRight className="h-3 w-3 text-white/30" strokeWidth={2} />
                    <span>{trip.to} ({trip.toCode})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[12px] text-white/60">
                    {new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-white">{formatCurrency(trip.price)}</p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Past Trips */}
      <div>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-white/60">Past Trips</p>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
          {pastTrips.map((trip, i) => (
            <Link
              key={trip.id}
              href={`/dashboard/bookings/${trip.id}`}
              className={`flex items-center justify-between p-4 transition-colors hover:bg-white/[0.04] ${
                i < pastTrips.length - 1 ? "border-b border-white/[0.06]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Plane className="h-3.5 w-3.5 text-white/40" strokeWidth={1.75} />
                <div>
                  <p className="text-[13px] font-medium text-white">{trip.jet}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {trip.from} → {trip.to} · {new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-white/80">{formatCurrency(trip.price)}</span>
                <StatusBadge status={trip.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
