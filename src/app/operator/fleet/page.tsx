"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Plus, Edit2, Trash2, Radio, Navigation, Users, Gauge, Camera, Armchair } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency, getCategoryLabel, getCategoryColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

const fleet = [
  {
    id: "n401gx", name: "Gulfstream G500", reg: "N401GX", manufacturer: "Gulfstream",
    category: "heavy" as const, passengers: 13, range: 5200, speed: 516,
    hourlyRate: 8200, status: "available" as const, yearBuilt: 2023,
    totalFlights: 47, totalHours: 312, rating: 4.9,
    interiorPhotos: 8, exteriorPhotos: 6,
  },
  {
    id: "n350cx", name: "Challenger 350", reg: "N350CX", manufacturer: "Bombardier",
    category: "super_midsize" as const, passengers: 10, range: 3200, speed: 470,
    hourlyRate: 5600, status: "in_flight" as const, yearBuilt: 2022,
    totalFlights: 62, totalHours: 448, rating: 4.7,
    interiorPhotos: 10, exteriorPhotos: 7,
  },
  {
    id: "n700cl", name: "Citation Longitude", reg: "N700CL", manufacturer: "Cessna",
    category: "super_midsize" as const, passengers: 12, range: 3500, speed: 476,
    hourlyRate: 5400, status: "maintenance" as const, yearBuilt: 2023,
    totalFlights: 38, totalHours: 256, rating: 4.8,
    interiorPhotos: 9, exteriorPhotos: 5,
  },
  {
    id: "n600px", name: "Praetor 600", reg: "N600PX", manufacturer: "Embraer",
    category: "super_midsize" as const, passengers: 12, range: 4018, speed: 466,
    hourlyRate: 5900, status: "available" as const, yearBuilt: 2023,
    totalFlights: 29, totalHours: 198, rating: 4.8,
    interiorPhotos: 7, exteriorPhotos: 6,
  },
];

const categoryGradients: Record<string, string> = {
  light: "from-sky-400 to-blue-600",
  midsize: "from-violet-400 to-purple-600",
  super_midsize: "from-amber-400 to-orange-600",
  heavy: "from-emerald-400 to-teal-600",
  ultra_long: "from-rose-400 to-red-600",
};

export default function OperatorFleetPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fleet</h1>
          <p className="text-sm text-gray-500 mt-0.5">{fleet.length} aircraft registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
            <button onClick={() => setView("grid")} className={cn("px-3 py-2 text-xs font-medium transition-colors", view === "grid" ? "bg-amber-500 text-neutral-950" : "text-gray-600 hover:bg-gray-50")}>Grid</button>
            <button onClick={() => setView("list")} className={cn("px-3 py-2 text-xs font-medium transition-colors", view === "list" ? "bg-amber-500 text-neutral-950" : "text-gray-600 hover:bg-gray-50")}>List</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-sm font-semibold hover:bg-amber-600 transition-colors">
            <Plus className="w-4 h-4" /> Add Aircraft
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Available", count: fleet.filter(f => f.status === "available").length,   color: "text-green-600 bg-green-50"  },
          { label: "In Flight", count: fleet.filter(f => f.status === "in_flight").length,   color: "text-blue-600 bg-blue-50"    },
          { label: "Maintenance", count: fleet.filter(f => f.status === "maintenance").length, color: "text-orange-600 bg-orange-50"},
          { label: "Total Hours", count: fleet.reduce((a,f) => a + f.totalHours, 0), suffix: "h", color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl px-4 py-3 flex items-center gap-3", s.color.split(" ")[1])}>
            <span className={cn("text-2xl font-bold", s.color.split(" ")[0])}>{s.count}{s.suffix}</span>
            <span className="text-sm font-medium text-gray-600">{s.label}</span>
          </div>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-5">
          {fleet.map((ac) => (
            <div key={ac.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Aircraft visual */}
              <div className={cn("relative h-36 bg-gradient-to-br flex items-center justify-center", categoryGradients[ac.category])}>
                <Plane className="w-16 h-16 text-neutral-300" strokeWidth={1} />
                <div className="absolute top-3 left-3"><StatusBadge status={ac.status} dot /></div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <button className="p-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-200 backdrop-blur-sm transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-neutral-950" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-neutral-200 hover:bg-red-100 backdrop-blur-sm transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-neutral-950" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded backdrop-blur-sm">{ac.reg}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", getCategoryColor(ac.category))}>{getCategoryLabel(ac.category)}</span>
                </div>
                {/* Photo count badges */}
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-neutral-800 bg-neutral-200 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    <Camera className="w-2.5 h-2.5" />{ac.exteriorPhotos}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-neutral-800 bg-neutral-200 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    <Armchair className="w-2.5 h-2.5" />{ac.interiorPhotos}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{ac.name}</h3>
                    <p className="text-xs text-gray-400">{ac.manufacturer} · {ac.yearBuilt}</p>
                  </div>
                  <p className="text-sm font-bold text-amber-600">{formatCurrency(ac.hourlyRate)}<span className="text-xs font-normal text-gray-400">/hr</span></p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { icon: Users, val: `${ac.passengers} pax` },
                    { icon: Navigation, val: `${ac.range} nm` },
                    { icon: Gauge, val: `${ac.speed} kts` },
                  ].map(({ icon: Icon, val }) => (
                    <div key={val} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      {val}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <span>{ac.totalFlights} flights · {ac.totalHours}h</span>
                  <span>★ {ac.rating}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit Details
                  </button>
                  <Link href="/tracking" className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1">
                    <Radio className="w-3 h-3" /> Track Live
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Aircraft", "Registration", "Category", "Status", "Passengers", "Rate/hr", "Flights", "Rating", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fleet.map((ac) => (
                <tr key={ac.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", categoryGradients[ac.category])}>
                        <Plane className="w-4 h-4 text-neutral-950" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{ac.name}</p>
                        <p className="text-xs text-gray-400">{ac.manufacturer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{ac.reg}</td>
                  <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", getCategoryColor(ac.category))}>{getCategoryLabel(ac.category)}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={ac.status} dot /></td>
                  <td className="px-4 py-3 text-gray-700">{ac.passengers}</td>
                  <td className="px-4 py-3 font-semibold text-amber-600">{formatCurrency(ac.hourlyRate)}</td>
                  <td className="px-4 py-3 text-gray-600">{ac.totalFlights}</td>
                  <td className="px-4 py-3 text-gray-700">★ {ac.rating}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
