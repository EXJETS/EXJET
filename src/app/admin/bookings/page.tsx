"use client";

import { useState } from "react";
import { Search, Download, Plane } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DollarSign, Calendar, CheckCircle, Clock } from "lucide-react";

const allBookings = [
  { id: "B-1041", client: "Alexander M.", operator: "Sky Charter Co.", jet: "Gulfstream G500",    route: "KTEB→EGLL", date: "2026-04-15", pax: 8,  amount: 38400, commission: 3840, status: "confirmed"  as const },
  { id: "B-1042", client: "Sophia L.",    operator: "Elite Air",       jet: "Challenger 350",     route: "KSFO→KDAL", date: "2026-04-16", pax: 6,  amount: 22200, commission: 2220, status: "pending"    as const },
  { id: "B-1043", client: "James R.",     operator: "Sky Charter Co.", jet: "Citation Longitude", route: "KMIA→KBOS", date: "2026-04-17", pax: 10, amount: 19600, commission: 1960, status: "pending"    as const },
  { id: "B-1044", client: "Victoria K.", operator: "Premier Jets",    jet: "Falcon 900LX",       route: "KTEB→KLAS", date: "2026-04-18", pax: 4,  amount: 29800, commission: 2980, status: "confirmed"  as const },
  { id: "B-1040", client: "Michael B.",  operator: "Elite Air",       jet: "Praetor 600",        route: "KDAL→KDEN", date: "2026-04-10", pax: 7,  amount: 17400, commission: 1740, status: "completed"  as const },
  { id: "B-1039", client: "Emma W.",     operator: "Sky Charter Co.", jet: "Challenger 350",     route: "KORD→KATL", date: "2026-04-08", pax: 5,  amount: 14800, commission: 1480, status: "completed"  as const },
  { id: "B-1038", client: "Robert D.",   operator: "Premier Jets",    jet: "Citation Longitude", route: "KBOS→KMIA", date: "2026-04-05", pax: 9,  amount: 18200, commission: 1820, status: "cancelled"  as const },
  { id: "B-1037", client: "Linda S.",    operator: "Elite Air",       jet: "Global 6000",        route: "KJFK→LFPB", date: "2026-04-03", pax: 12, amount: 46800, commission: 4680, status: "completed"  as const },
];

type Tab = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export default function AdminBookingsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filtered = allBookings.filter((b) => {
    if (tab !== "all" && b.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.client.toLowerCase().includes(q) || b.jet.toLowerCase().includes(q) ||
        b.operator.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    }
    return true;
  });

  const totalRevenue   = allBookings.reduce((a, b) => a + b.amount, 0);
  const totalCommission= allBookings.reduce((a, b) => a + b.commission, 0);
  const completed      = allBookings.filter(b => b.status === "completed").length;
  const pending        = allBookings.filter(b => b.status === "pending").length;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Volume"    value={formatCurrency(totalRevenue)}    icon={DollarSign}    color="amber"  />
        <StatCard label="EXJET Commission" value={formatCurrency(totalCommission)} icon={DollarSign}    color="green"  sub="10% per booking" />
        <StatCard label="Completed"       value={String(completed)}               icon={CheckCircle}   color="blue"   />
        <StatCard label="Pending Review"  value={String(pending)}                 icon={Clock}         color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {(["all","pending","confirmed","completed","cancelled"] as Tab[]).map((t) => {
          const count = t === "all" ? allBookings.length : allBookings.filter(b => b.status === t).length;
          return (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
              {t} {count > 0 && <span className={cn("ml-1 px-1.5 py-0.5 rounded-full text-[9px]", tab === t ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600")}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client, jet, operator..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["ID","Client","Operator","Aircraft","Route","Date","Pax","Amount","Commission","Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{b.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{b.client}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{b.operator}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-700 text-xs">{b.jet}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.route}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{b.pax}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(b.amount)}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(b.commission)}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
