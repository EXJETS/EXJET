"use client";

import Link from "next/link";
import { Plane, Calendar, MapPin, Clock, CreditCard, User, TrendingUp, Navigation, ArrowRight, Star } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const stats = [
  { label: "Total Flights", value: "12", icon: Plane, color: "text-amber-600 bg-amber-100" },
  { label: "Miles Flown", value: "45,200", icon: Navigation, color: "text-blue-600 bg-blue-100" },
  { label: "Upcoming", value: "2", icon: Calendar, color: "text-green-600 bg-green-100" },
  { label: "Member Since", value: "2024", icon: Star, color: "text-purple-600 bg-purple-100" },
];

const upcomingTrips = [
  {
    id: "bk-001", jet: "Gulfstream G650ER", from: "New York", fromCode: "KTEB",
    to: "London", toCode: "EGLL", date: "2026-04-15", status: "confirmed" as const,
    price: 56810, category: "ultra_long",
  },
  {
    id: "bk-002", jet: "Praetor 500", from: "Miami", fromCode: "KMIA",
    to: "Austin", toCode: "KAUS", date: "2026-04-22", status: "confirmed" as const,
    price: 23712, category: "midsize",
  },
];

const pastTrips = [
  {
    id: "bk-003", jet: "Citation CJ4", from: "Palm Beach", fromCode: "KPBI",
    to: "Chicago", toCode: "KORD", date: "2026-03-10", status: "completed" as const, price: 15808,
  },
  {
    id: "bk-004", jet: "Falcon 900LX", from: "San Francisco", fromCode: "KSFO",
    to: "Las Vegas", toCode: "KLAS", date: "2026-02-28", status: "completed" as const, price: 35568,
  },
  {
    id: "bk-005", jet: "Challenger 350", from: "Dallas", fromCode: "KDAL",
    to: "Denver", toCode: "KDEN", date: "2026-01-15", status: "cancelled" as const, price: 27664,
  },
];

const statusColors = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
              JD
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, John</h1>
              <p className="text-sm text-gray-500">Manage your trips and account</p>
            </div>
          </div>
          <div className="hidden sm:flex gap-3">
            <Link href="/search" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 transition-all">
              Book New Flight
            </Link>
            <Link href="/dashboard/profile" className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              View Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Trips */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Trips</h2>
            <Link href="/tracking" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              Track Fleet <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            {upcomingTrips.map((trip) => (
              <Link key={trip.id} href={`/dashboard/bookings/${trip.id}`} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                      <Plane className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trip.jet}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <span>{trip.from} ({trip.fromCode})</span>
                        <span>→</span>
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
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", statusColors[trip.status])}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Past Trips */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Trips</h2>
          <div className="grid gap-3">
            {pastTrips.map((trip) => (
              <Link key={trip.id} href={`/dashboard/bookings/${trip.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plane className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{trip.jet}</h3>
                      <p className="text-xs text-gray-500">{trip.from} → {trip.to} · {new Date(trip.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(trip.price)}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold capitalize", statusColors[trip.status])}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
