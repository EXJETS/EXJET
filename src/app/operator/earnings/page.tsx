"use client";

import { DollarSign, TrendingUp, Calendar, Plane, Download } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { formatCurrency } from "@/lib/utils";

const monthlyData = [
  { month: "May",  revenue: 42000, bookings: 8,  hours: 52  },
  { month: "Jun",  revenue: 38000, bookings: 6,  hours: 44  },
  { month: "Jul",  revenue: 51000, bookings: 9,  hours: 63  },
  { month: "Aug",  revenue: 46000, bookings: 7,  hours: 57  },
  { month: "Sep",  revenue: 60000, bookings: 11, hours: 76  },
  { month: "Oct",  revenue: 55000, bookings: 9,  hours: 68  },
  { month: "Nov",  revenue: 72000, bookings: 13, hours: 91  },
  { month: "Dec",  revenue: 68000, bookings: 12, hours: 86  },
  { month: "Jan",  revenue: 80000, bookings: 15, hours: 102 },
  { month: "Feb",  revenue: 74000, bookings: 13, hours: 94  },
  { month: "Mar",  revenue: 91000, bookings: 17, hours: 118 },
  { month: "Apr",  revenue: 87000, bookings: 16, hours: 112 },
];

const payouts = [
  { id: "P-0412", period: "April 2026",  amount: 74190, status: "pending",    date: "Apr 30, 2026" },
  { id: "P-0411", period: "March 2026",  amount: 77350, status: "completed",  date: "Mar 31, 2026" },
  { id: "P-0410", period: "Feb 2026",    amount: 62900, status: "completed",  date: "Feb 28, 2026" },
  { id: "P-0409", period: "Jan 2026",    amount: 68000, status: "completed",  date: "Jan 31, 2026" },
];

const byAircraft = [
  { name: "Gulfstream G500",    reg: "N401GX", revenue: 312000, flights: 47, share: 42 },
  { name: "Challenger 350",     reg: "N350CX", revenue: 248000, flights: 62, share: 33 },
  { name: "Praetor 600",        reg: "N600PX", revenue: 119000, flights: 29, share: 16 },
  { name: "Citation Longitude", reg: "N700CL", revenue:  66000, flights: 38, share:  9 },
];

export default function OperatorEarningsPage() {
  const total = monthlyData.reduce((a, m) => a + m.revenue, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue breakdown for your fleet</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Annual Revenue"  value={formatCurrency(total)}   icon={DollarSign} color="amber"  trend={{ value: "34%",  up: true }} />
        <StatCard label="This Month"      value="$87,400"                  icon={TrendingUp}  color="green"  trend={{ value: "12%",  up: true }} />
        <StatCard label="Avg per Booking" value="$5,437"                   icon={Calendar}    color="blue"                                      />
        <StatCard label="Flight Hours"    value="863h"                     icon={Plane}       color="purple" trend={{ value: "18%",  up: true }} />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Monthly Revenue</h2>
          <div className="flex gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded" /> Revenue</span>
          </div>
        </div>
        <div className="h-40">
          <MiniChart data={monthlyData.map(m => m.revenue)} color="#f59e0b" height={160} />
        </div>
        <div className="flex justify-between mt-2">
          {monthlyData.map((m) => (
            <div key={m.month} className="text-center">
              <p className="text-[9px] text-gray-400">{m.month}</p>
              <p className="text-[9px] font-semibold text-gray-600">${(m.revenue/1000).toFixed(0)}k</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by aircraft */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue by Aircraft</h2>
          <div className="space-y-4">
            {byAircraft.map((ac) => (
              <div key={ac.reg}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ac.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{ac.reg} · {ac.flights} flights</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(ac.revenue)}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                    style={{ width: `${ac.share}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{ac.share}% of total</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payouts */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Payout History</h2>
          <div className="space-y-3">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.period}</p>
                  <p className="text-xs text-gray-400">{p.date} · {p.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
