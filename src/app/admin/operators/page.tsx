"use client";

import { useState } from "react";
import { Building2, Plus, Search, Star, Plane, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";
import { Users } from "lucide-react";

const operators = [
  {
    id: "op-001", name: "Sky Charter Co.",  initials: "SC", email: "ops@skycharter.com",   phone: "+1 305 555 0192",
    location: "Miami, FL", jets: 4, bookings: 127, revenue: 745000,  status: "active"   as const,
    rating: 4.8, reviews: 312, joined: "Jan 2024", verified: true,
    aircraftList: ["Gulfstream G500","Challenger 350","Citation Longitude","Praetor 600"],
  },
  {
    id: "op-002", name: "Elite Air",         initials: "EA", email: "book@eliteair.com",    phone: "+1 212 555 0847",
    location: "New York, NY", jets: 6, bookings: 203, revenue: 1240000, status: "active"   as const,
    rating: 4.7, reviews: 489, joined: "Mar 2023", verified: true,
    aircraftList: ["Global 6000","Falcon 900LX","Gulfstream G650ER","Praetor 500","Challenger 650","Phenom 300E"],
  },
  {
    id: "op-003", name: "Premier Jets",      initials: "PJ", email: "charter@premjets.com", phone: "+1 310 555 0314",
    location: "Los Angeles, CA", jets: 3, bookings: 89, revenue: 528000, status: "active"  as const,
    rating: 4.9, reviews: 198, joined: "Jul 2024", verified: true,
    aircraftList: ["Gulfstream G280","Falcon 8X","Global 7500"],
  },
  {
    id: "op-004", name: "Summit Aviation",   initials: "SA", email: "ops@summit.aero",      phone: "+1 720 555 0561",
    location: "Denver, CO", jets: 2, bookings: 34, revenue: 198000, status: "inactive" as const,
    rating: 4.2, reviews: 67, joined: "Nov 2024", verified: false,
    aircraftList: ["Citation CJ4","Learjet 75 Liberty"],
  },
];

export default function AdminOperatorsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof operators[0] | null>(null);

  const filtered = operators.filter((op) =>
    !search || op.name.toLowerCase().includes(search.toLowerCase()) ||
    op.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Operators</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
          <Plus className="w-4 h-4" /> Add Operator
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Operators"  value={String(operators.length)}                                             icon={Building2}   color="amber"  />
        <StatCard label="Active"           value={String(operators.filter(o=>o.status==="active").length)}               icon={CheckCircle} color="green"  />
        <StatCard label="Total Fleet"      value={String(operators.reduce((a,o)=>a+o.jets,0)) + " jets"}                icon={Plane}       color="blue"   />
        <StatCard label="Platform Revenue" value={formatCurrency(operators.reduce((a,o)=>a+o.revenue,0))}               icon={DollarSign}  color="purple" />
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className={`${selected ? "hidden lg:block lg:w-1/2" : "w-full"}`}>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operators..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
          </div>

          <div className="space-y-3">
            {filtered.map((op) => (
              <button key={op.id} onClick={() => setSelected(op)}
                className={`w-full text-left bg-white rounded-2xl border p-5 hover:shadow-md transition-all ${selected?.id === op.id ? "border-amber-300 shadow-md" : "border-gray-200"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">{op.initials}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{op.name}</p>
                        {op.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-400">{op.location} · Joined {op.joined}</p>
                    </div>
                  </div>
                  <StatusBadge status={op.status} />
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100">
                  <div><p className="text-[10px] text-gray-400">Fleet</p><p className="text-sm font-semibold">{op.jets}</p></div>
                  <div><p className="text-[10px] text-gray-400">Bookings</p><p className="text-sm font-semibold">{op.bookings}</p></div>
                  <div><p className="text-[10px] text-gray-400">Revenue</p><p className="text-sm font-semibold">{formatCurrency(op.revenue)}</p></div>
                  <div><p className="text-[10px] text-gray-400">Rating</p><p className="text-sm font-semibold">★ {op.rating}</p></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="flex-1 lg:w-1/2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-lg">{selected.initials}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                      {selected.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-400">{selected.location}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Email",    val: selected.email    },
                  { label: "Phone",    val: selected.phone    },
                  { label: "Joined",   val: selected.joined   },
                  { label: "Reviews",  val: String(selected.reviews) },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fleet ({selected.jets} aircraft)</p>
                <div className="space-y-1.5">
                  {selected.aircraftList.map((ac) => (
                    <div key={ac} className="flex items-center gap-2 text-sm text-gray-700">
                      <Plane className="w-3.5 h-3.5 text-gray-400" /> {ac}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {selected.status === "active" ? "Suspend" : "Reactivate"}
                </button>
                <button className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600">
                  Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
