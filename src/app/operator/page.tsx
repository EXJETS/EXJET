"use client";

import Link from "next/link";
import {
  Plane, DollarSign, Calendar, Star, TrendingUp, Clock,
  ChevronRight, AlertCircle, CheckCircle, ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { formatCurrency } from "@/lib/utils";

const revenueData = [42000, 38000, 51000, 46000, 60000, 55000, 72000, 68000, 80000, 74000, 91000, 87000];
const bookingsData = [8, 6, 9, 7, 11, 9, 13, 12, 15, 13, 17, 16];

const pendingBookings = [
  { id: "B-1041", client: "Alexander M.", jet: "Gulfstream G500", route: "KTEB → EGLL", date: "Apr 18", amount: 38400, received: "2h ago" },
  { id: "B-1042", client: "Sophia L.", jet: "Challenger 350", route: "KMIA → KAUS", date: "Apr 21", amount: 22200, received: "5h ago" },
  { id: "B-1043", client: "James R.", jet: "Citation Longitude", route: "KSFO → KORD", date: "Apr 25", amount: 19600, received: "1d ago" },
];

const upcomingFlights = [
  { id: "F-891", jet: "Gulfstream G500",     route: "KTEB → KLAS", date: "Apr 15", pax: 8,  status: "confirmed" as const },
  { id: "F-892", jet: "Challenger 350",       route: "KSFO → KDAL", date: "Apr 16", pax: 6,  status: "confirmed" as const },
  { id: "F-893", jet: "Citation Longitude",   route: "KMIA → KBOS", date: "Apr 17", pax: 10, status: "pending"   as const },
];

const fleetStatus = [
  { name: "Gulfstream G500",    reg: "N401GX", status: "available"   as const },
  { name: "Challenger 350",     reg: "N350CX", status: "in_flight"   as const },
  { name: "Citation Longitude", reg: "N700CL", status: "maintenance" as const },
  { name: "Praetor 600",        reg: "N600PX", status: "available"   as const },
];

export default function OperatorPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operator Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Sky Charter Co. · April 2026</p>
        </div>
        <Link href="/operator/fleet" className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2">
          <Plane className="w-4 h-4" /> Manage Fleet
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Monthly Revenue"  value="$87,400"  icon={DollarSign} color="amber"  trend={{ value: "12%", up: true  }} />
        <StatCard label="Active Bookings"  value="16"       icon={Calendar}   color="blue"   trend={{ value: "8%",  up: true  }} />
        <StatCard label="Fleet Size"       value="4 jets"   icon={Plane}      color="purple" sub="3 active" />
        <StatCard label="Avg Rating"       value="4.8 ★"    icon={Star}       color="green"  trend={{ value: "0.1", up: true  }} />
      </div>

      {/* Revenue Chart + Fleet Status */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue (12 months)</h2>
              <p className="text-sm text-gray-400">Total: {formatCurrency(revenueData.reduce((a, b) => a + b, 0))}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +34% YoY
            </span>
          </div>
          <div className="h-32">
            <MiniChart data={revenueData} color="#f59e0b" height={128} />
          </div>
          <div className="flex justify-between mt-2">
            {["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"].map((m) => (
              <span key={m} className="text-[9px] text-gray-400">{m}</span>
            ))}
          </div>
        </div>

        {/* Fleet Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Fleet Status</h2>
            <Link href="/operator/fleet" className="text-xs text-amber-600 hover:text-amber-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {fleetStatus.map((ac) => (
              <div key={ac.reg} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{ac.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{ac.reg}</p>
                  </div>
                </div>
                <StatusBadge status={ac.status} dot />
              </div>
            ))}
          </div>
          <Link href="/tracking" className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" /> Live Tracking
          </Link>
        </div>
      </div>

      {/* Pending Requests + Upcoming */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending booking requests */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Pending Requests</h2>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">{pendingBookings.length}</span>
            </div>
            <Link href="/operator/bookings" className="text-xs text-amber-600 hover:text-amber-700 font-medium">See all</Link>
          </div>
          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <div key={b.id} className="flex items-start justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{b.client}</p>
                  <p className="text-xs text-gray-500">{b.jet} · {b.route} · {b.date}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Received {b.received}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-amber-700">{formatCurrency(b.amount)}</p>
                  <div className="flex gap-1 mt-1.5">
                    <button className="px-2 py-1 rounded-lg bg-green-500 text-white text-[10px] font-semibold hover:bg-green-600">Accept</button>
                    <button className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50">Decline</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming flights */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Flights</h2>
            <Link href="/operator/bookings" className="text-xs text-amber-600 hover:text-amber-700 font-medium">See all</Link>
          </div>
          <div className="space-y-3">
            {upcomingFlights.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.route}</p>
                    <p className="text-xs text-gray-400">{f.jet} · {f.date} · {f.pax} pax</p>
                  </div>
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">Citation Longitude is currently in scheduled maintenance. Expected return: Apr 19.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
