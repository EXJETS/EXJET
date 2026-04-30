"use client";

import { TrendingUp, DollarSign, Plane, Users, Globe, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { MiniChart } from "@/components/dashboard/mini-chart";
import { formatCurrency } from "@/lib/utils";

const monthlyRevenue  = [182, 165, 210, 195, 248, 224, 290, 275, 318, 302, 365, 348].map(v => v * 1000);
const monthlyBookings = [32,  28,  38,  34,  44,  40,  52,  48,  58,  54,  66,  62];
const monthlyUsers    = [180, 195, 220, 248, 271, 300, 334, 368, 410, 449, 498, 541];
const months = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];

const topRoutes = [
  { route: "KTEB → EGLL", count: 42, revenue: 1612800, pct: 85 },
  { route: "KSFO → KLAS", count: 38, revenue: 486400,  pct: 77 },
  { route: "KMIA → KBOS", count: 31, revenue: 607600,  pct: 63 },
  { route: "KTEB → KLAS", count: 28, revenue: 558400,  pct: 57 },
  { route: "KJFK → LFPB", count: 22, revenue: 924000,  pct: 45 },
];

const categoryRevenue = [
  { name: "Ultra Long Range", revenue: 1240000, pct: 38, color: "bg-rose-500"   },
  { name: "Heavy",            revenue:  890000, pct: 27, color: "bg-emerald-500"},
  { name: "Super Midsize",    revenue:  620000, pct: 19, color: "bg-amber-500"  },
  { name: "Midsize",          revenue:  390000, pct: 12, color: "bg-violet-500" },
  { name: "Light",            revenue:  130000, pct:  4, color: "bg-sky-500"    },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">Analytics</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Platform performance · Last 12 months</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] font-semibold flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> All metrics up YoY
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Gross Revenue"    value={formatCurrency(monthlyRevenue.reduce((a,b)=>a+b,0))}   icon={DollarSign} color="amber"  trend={{ value: "38%",  up: true }} />
        <StatCard label="Total Bookings"   value={String(monthlyBookings.reduce((a,b)=>a+b,0))}          icon={Plane}      color="blue"   trend={{ value: "24%",  up: true }} />
        <StatCard label="Active Users"     value={String(monthlyUsers[monthlyUsers.length-1])}            icon={Users}      color="green"  trend={{ value: "201%", up: true }} />
        <StatCard label="Avg Booking Val." value={formatCurrency(Math.round(monthlyRevenue.reduce((a,b)=>a+b,0)/monthlyBookings.reduce((a,b)=>a+b,0)))} icon={BarChart3} color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {[
          { label: "Revenue",  data: monthlyRevenue.map(v=>v/1000), suffix: "k", color: "#b89b6e" },
          { label: "Bookings", data: monthlyBookings,                suffix: "",  color: "#b89b6e" },
          { label: "Users",    data: monthlyUsers,                   suffix: "",  color: "#b89b6e" },
        ].map(({ label, data, suffix, color }) => (
          <div key={label} className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-5">
            <h3 className="font-semibold text-[var(--color-ink)] mb-1">{label}</h3>
            <p className="text-xs text-[var(--color-subtle)] mb-3">Monthly · 12 months</p>
            <div className="h-24"><MiniChart data={data} color={color} height={96} /></div>
            <div className="flex justify-between mt-2">
              {months.map((m) => <span key={m} className="text-[9px] text-[var(--color-subtle)]">{m}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top routes */}
        <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-5">
          <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-champagne" /> Top Routes
          </h2>
          <div className="space-y-4">
            {topRoutes.map((r) => (
              <div key={r.route}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-mono font-medium text-[var(--color-ink)]">{r.route}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">{r.count}</span>
                    <span className="text-xs text-[var(--color-subtle)] ml-2">{formatCurrency(r.revenue)}</span>
                  </div>
                </div>
                <div className="w-full bg-[var(--color-bone)] rounded-full h-1.5">
                  <div className="bg-champagne h-1.5 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by category */}
        <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] p-5">
          <h2 className="font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <Plane className="w-4 h-4 text-champagne" /> Revenue by Category
          </h2>
          {/* Stacked bar */}
          <div className="flex rounded-xl overflow-hidden h-8 mb-4">
            {categoryRevenue.map((c) => (
              <div key={c.name} className={`${c.color} h-full`} style={{ width: `${c.pct}%` }} title={`${c.name}: ${c.pct}%`} />
            ))}
          </div>
          <div className="space-y-3">
            {categoryRevenue.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                  <span className="text-sm text-[var(--color-ink-soft)]">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--color-ink)]">{formatCurrency(c.revenue)}</span>
                  <span className="text-xs text-[var(--color-subtle)] w-8 text-right">{c.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
