"use client";

import Link from "next/link";
import {
  DollarSign, Users, Plane, Building2, TrendingUp, ArrowUpRight,
  AlertTriangle, CheckCircle, Clock, Globe,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { formatCurrency } from "@/lib/utils";

const revenueData  = [182000, 165000, 210000, 195000, 248000, 224000, 290000, 275000, 318000, 302000, 365000, 348000];
const bookingsData = [32, 28, 38, 34, 44, 40, 52, 48, 58, 54, 66, 62];

const recentBookings = [
  { id: "B-1041", client: "Alexander M.", operator: "Sky Charter Co.", jet: "Gulfstream G500",   amount: 38400, status: "confirmed"  as const, time: "2h ago"  },
  { id: "B-1042", client: "Sophia L.",    operator: "Elite Air",       jet: "Challenger 350",    amount: 22200, status: "pending"    as const, time: "3h ago"  },
  { id: "B-1043", client: "James R.",     operator: "Sky Charter Co.", jet: "Citation Longitude", amount: 19600, status: "pending"    as const, time: "5h ago"  },
  { id: "B-1044", client: "Victoria K.", operator: "Premier Jets",    jet: "Falcon 900LX",      amount: 29800, status: "confirmed"  as const, time: "8h ago"  },
  { id: "B-1040", client: "Michael B.",  operator: "Elite Air",       jet: "Praetor 600",       amount: 17400, status: "completed"  as const, time: "1d ago"  },
];

const operators = [
  { name: "Sky Charter Co.",  jets: 4, bookings: 127, revenue: 745000, status: "active" as const,   rating: 4.8 },
  { name: "Elite Air",        jets: 6, bookings: 203, revenue: 1240000, status: "active" as const,  rating: 4.7 },
  { name: "Premier Jets",     jets: 3, bookings: 89,  revenue: 528000, status: "active" as const,   rating: 4.9 },
  { name: "Summit Aviation",  jets: 2, bookings: 34,  revenue: 198000, status: "inactive" as const, rating: 4.2 },
];

const alerts = [
  { type: "warning", msg: "Summit Aviation has not responded to 3 booking requests", time: "30m ago" },
  { type: "success", msg: "New operator 'Pacific Charters' completed verification",  time: "2h ago"  },
  { type: "warning", msg: "Booking B-1039 dispute filed by client – requires review", time: "4h ago" },
];

export default function AdminPage() {
  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform health · April 2026</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics" className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/admin/operators" className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Operators
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Annual Revenue"   value={formatCurrency(totalRevenue)}  icon={DollarSign} color="amber"  trend={{ value: "38%",  up: true }} />
        <StatCard label="Active Users"     value="2,841"                         icon={Users}      color="blue"   trend={{ value: "12%",  up: true }} />
        <StatCard label="Total Bookings"   value="556"                           icon={Plane}      color="green"  trend={{ value: "24%",  up: true }} />
        <StatCard label="Active Operators" value="3"                             icon={Building2}  color="purple" sub="1 inactive"                   />
      </div>

      {/* Revenue + Bookings Chart */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Platform Revenue (12 mo)</h2>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +38%
            </span>
          </div>
          <div className="h-32"><MiniChart data={revenueData} color="#f59e0b" height={128} /></div>
          <div className="flex justify-between mt-1">
            {["M","J","J","A","S","O","N","D","J","F","M","A"].map((m, i) => (
              <span key={i} className="text-[9px] text-gray-400">{m}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Bookings (12 mo)</h2>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-semibold">{bookingsData.reduce((a,b)=>a+b,0)} total</span>
          </div>
          <div className="h-32"><MiniChart data={bookingsData} color="#3b82f6" height={128} /></div>
          <div className="flex justify-between mt-1">
            {["M","J","J","A","S","O","N","D","J","F","M","A"].map((m, i) => (
              <span key={i} className="text-[9px] text-gray-400">{m}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {b.client.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.client}</p>
                    <p className="text-xs text-gray-400">{b.jet} · {b.operator}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(b.amount)}</p>
                    <p className="text-[10px] text-gray-400">{b.time}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts + Operator summary */}
        <div className="space-y-5">
          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Alerts</h2>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${a.type === "warning" ? "bg-amber-50 border border-amber-100" : "bg-green-50 border border-green-100"}`}>
                  {a.type === "warning"
                    ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    : <CheckCircle  className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-xs text-gray-700">{a.msg}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top operators */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Operators</h2>
              <Link href="/admin/operators" className="text-xs text-amber-600 font-medium">View all</Link>
            </div>
            <div className="space-y-2">
              {operators.map((op) => (
                <div key={op.name} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{op.name}</p>
                    <p className="text-xs text-gray-400">{op.jets} jets · {op.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-700">{formatCurrency(op.revenue)}</p>
                    <StatusBadge status={op.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
