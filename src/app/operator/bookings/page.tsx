"use client";

import { useState } from "react";
import { Search, Filter, Plane, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const bookings = [
  { id: "B-1038", client: "Alexander M.", jet: "Gulfstream G500",    route: "KTEB → EGLL", date: "2026-04-15", pax: 8,  amount: 38400, status: "confirmed"  as const, received: "2026-04-01" },
  { id: "B-1039", client: "Sophia L.",    jet: "Challenger 350",     route: "KSFO → KDAL", date: "2026-04-16", pax: 6,  amount: 22200, status: "confirmed"  as const, received: "2026-03-30" },
  { id: "B-1040", client: "James R.",     jet: "Citation Longitude", route: "KMIA → KBOS", date: "2026-04-17", pax: 10, amount: 19600, status: "pending"    as const, received: "2026-04-03" },
  { id: "B-1041", client: "Victoria K.", jet: "Gulfstream G500",    route: "KTEB → KLAS", date: "2026-04-18", pax: 4,  amount: 29800, status: "pending"    as const, received: "2026-04-03" },
  { id: "B-1036", client: "Michael B.",  jet: "Praetor 600",        route: "KDAL → KDEN", date: "2026-04-10", pax: 7,  amount: 17400, status: "completed"  as const, received: "2026-03-20" },
  { id: "B-1035", client: "Emma W.",     jet: "Challenger 350",     route: "KORD → KATL", date: "2026-04-08", pax: 5,  amount: 14800, status: "completed"  as const, received: "2026-03-18" },
  { id: "B-1034", client: "Robert D.",   jet: "Citation Longitude", route: "KBOS → KMIA", date: "2026-04-05", pax: 9,  amount: 18200, status: "cancelled"  as const, received: "2026-03-15" },
];

const tabs = ["all", "pending", "confirmed", "completed", "cancelled"] as const;
type Tab = typeof tabs[number];

export default function OperatorBookingsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    if (tab !== "all" && b.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.client.toLowerCase().includes(q) || b.jet.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = tabs.reduce((acc, t) => ({ ...acc, [t]: t === "all" ? bookings.length : bookings.filter(b => b.status === t).length }), {} as Record<Tab, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t} {counts[t] > 0 && <span className={cn("ml-1 px-1.5 py-0.5 rounded-full text-[9px]", tab === t ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600")}>{counts[t]}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bookings..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Booking ID", "Client", "Aircraft", "Route", "Date", "Pax", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{b.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {b.client.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-gray-900">{b.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700">{b.jet}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.route}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-4 py-3 text-gray-600">{b.pax}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(b.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    {b.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <button className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600" title="Accept"><CheckCircle className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500" title="Decline"><XCircle className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">View</button>
                    )}
                  </td>
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
