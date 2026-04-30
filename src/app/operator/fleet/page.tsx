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
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">My Fleet</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{fleet.length} aircraft registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-[var(--color-hairline)] overflow-hidden bg-[var(--color-ivory)]">
            <button onClick={() => setView("grid")} className={cn("px-3 py-2 text-xs font-medium transition-colors", view === "grid" ? "bg-champagne text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-ivory-deep)]")}>Grid</button>
            <button onClick={() => setView("list")} className={cn("px-3 py-2 text-xs font-medium transition-colors", view === "list" ? "bg-champagne text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-ivory-deep)]")}>List</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-champagne text-white text-sm font-semibold hover:bg-[var(--color-ink-soft)] transition-colors">
            <Plus className="w-4 h-4" /> Add Aircraft
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Available",   count: fleet.filter(f => f.status === "available").length,    color: "text-[var(--color-forest)] bg-[var(--color-forest)]/10"  },
          { label: "In Flight",   count: fleet.filter(f => f.status === "in_flight").length,    color: "text-sky-600 bg-sky-500/10"    },
          { label: "Maintenance", count: fleet.filter(f => f.status === "maintenance").length,  color: "text-champagne bg-champagne/10" },
          { label: "Total Hours", count: fleet.reduce((a,f) => a + f.totalHours, 0), suffix: "h", color: "text-champagne bg-champagne/10" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl px-4 py-3 flex items-center gap-3", s.color.split(" ")[1])}>
            <span className={cn("text-2xl font-bold", s.color.split(" ")[0])}>{s.count}{s.suffix}</span>
            <span className="text-sm font-medium text-[var(--color-muted)]">{s.label}</span>
          </div>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-5">
          {fleet.map((ac) => (
            <div key={ac.id} className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] overflow-hidden hover:shadow-lg transition-shadow">
              {/* Aircraft visual */}
              <div className={cn("relative h-36 bg-gradient-to-br flex items-center justify-center", categoryGradients[ac.category])}>
                <Plane className="w-16 h-16 text-white/30" strokeWidth={1} />
                <div className="absolute top-3 left-3"><StatusBadge status={ac.status} dot /></div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <button className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-white/20 hover:bg-[var(--color-bordeaux)]/40 backdrop-blur-sm transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-white bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">{ac.reg}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", getCategoryColor(ac.category))}>{getCategoryLabel(ac.category)}</span>
                </div>
                {/* Photo count badges */}
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-white bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    <Camera className="w-2.5 h-2.5" />{ac.exteriorPhotos}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    <Armchair className="w-2.5 h-2.5" />{ac.interiorPhotos}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--color-ink)]">{ac.name}</h3>
                    <p className="text-xs text-[var(--color-subtle)]">{ac.manufacturer} · {ac.yearBuilt}</p>
                  </div>
                  <p className="text-sm font-bold text-champagne">{formatCurrency(ac.hourlyRate)}<span className="text-xs font-normal text-[var(--color-subtle)]">/hr</span></p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { icon: Users, val: `${ac.passengers} pax` },
                    { icon: Navigation, val: `${ac.range} nm` },
                    { icon: Gauge, val: `${ac.speed} kts` },
                  ].map(({ icon: Icon, val }) => (
                    <div key={val} className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                      <Icon className="w-3.5 h-3.5 text-[var(--color-subtle)]" />
                      {val}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-hairline)] text-xs text-[var(--color-subtle)]">
                  <span>{ac.totalFlights} flights · {ac.totalHours}h</span>
                  <span>★ {ac.rating}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-1.5 rounded-lg border border-[var(--color-hairline)] text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-ivory-deep)] flex items-center justify-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit Details
                  </button>
                  <Link href="/tracking" className="flex-1 py-1.5 rounded-lg border border-[var(--color-hairline)] text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-ivory-deep)] flex items-center justify-center gap-1">
                    <Radio className="w-3 h-3" /> Track Live
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--color-ivory)] rounded-2xl border border-[var(--color-hairline)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-ivory-deep)] border-b border-[var(--color-hairline)]">
              <tr>
                {["Aircraft", "Registration", "Category", "Status", "Passengers", "Rate/hr", "Flights", "Rating", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-hairline)]">
              {fleet.map((ac) => (
                <tr key={ac.id} className="hover:bg-[var(--color-ivory-deep)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", categoryGradients[ac.category])}>
                        <Plane className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">{ac.name}</p>
                        <p className="text-xs text-[var(--color-subtle)]">{ac.manufacturer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{ac.reg}</td>
                  <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", getCategoryColor(ac.category))}>{getCategoryLabel(ac.category)}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={ac.status} dot /></td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{ac.passengers}</td>
                  <td className="px-4 py-3 font-semibold text-champagne">{formatCurrency(ac.hourlyRate)}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{ac.totalFlights}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">★ {ac.rating}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-[var(--color-ivory-deep)] text-[var(--color-subtle)] hover:text-[var(--color-muted)]"><Edit2 className="w-4 h-4" /></button>
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
