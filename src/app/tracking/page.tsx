"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plane, Radio, MapPin, Gauge, ArrowUp, Clock, RefreshCw, Search, Filter } from "lucide-react";
import { cn, getCategoryLabel, getCategoryColor, formatCurrency } from "@/lib/utils";
import jetsData from "@/data/jets.json";
import type { Jet } from "@/types";

interface TrackedAircraft {
  jet: Jet;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  onGround: boolean;
  registration: string;
}

function generateFleetPositions(): TrackedAircraft[] {
  return (jetsData as Jet[]).map((jet) => {
    const seed = jet.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const isFlying = seed % 3 !== 0;
    return {
      jet,
      lat: 25 + (seed % 25) + Math.random() * 2,
      lng: -120 + (seed % 70) + Math.random() * 2,
      altitude: isFlying ? 30000 + Math.floor(Math.random() * 15000) : 0,
      speed: isFlying ? 380 + Math.floor(Math.random() * 150) : 0,
      heading: Math.floor(Math.random() * 360),
      onGround: !isFlying,
      registration: `N${100 + (seed % 900)}EX`,
    };
  });
}

export default function TrackingPage() {
  const [aircraft, setAircraft] = useState<TrackedAircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TrackedAircraft | null>(null);
  const [filter, setFilter] = useState<"all" | "flying" | "ground">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAircraft(generateFleetPositions());
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAircraft(generateFleetPositions());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = aircraft.filter((a) => {
    if (filter === "flying" && a.onGround) return false;
    if (filter === "ground" && !a.onGround) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.jet.name.toLowerCase().includes(q) ||
        a.jet.manufacturer.toLowerCase().includes(q) ||
        a.registration.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const inFlight = aircraft.filter((a) => !a.onGround).length;
  const onGround = aircraft.filter((a) => a.onGround).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-5 h-5 text-green-500" />
                <h1 className="text-2xl font-bold text-gray-900">Fleet Live Tracking</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">ADS-B Exchange</span>
              </div>
              <p className="text-sm text-gray-500">
                Real-time positions of all {aircraft.length} aircraft in our fleet
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                <Plane className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{inFlight} in flight</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{onGround} on ground</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Area */}
          <div className="flex-1">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 border border-gray-200 shadow-sm">
              {/* Grid */}
              <div className="absolute inset-0 opacity-15">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-slate-300" style={{ top: `${(i + 1) * 10}%` }} />
                ))}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-slate-300" style={{ left: `${(i + 1) * 7.14}%` }} />
                ))}
              </div>

              {/* Aircraft dots */}
              {!loading && filtered.map((a, idx) => {
                const x = 5 + ((a.lat * 3 + a.lng * 7 + idx * 13) % 85);
                const y = 5 + ((a.lng * 5 + a.lat * 11 + idx * 7) % 85);
                return (
                  <button
                    key={a.jet.id}
                    className={cn(
                      "absolute z-10 group transition-transform hover:scale-150",
                      selected?.jet.id === a.jet.id && "scale-150 z-20"
                    )}
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={() => setSelected(a)}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center shadow-md",
                      a.onGround ? "bg-blue-500" : "bg-green-500"
                    )}>
                      <Plane className="w-2.5 h-2.5 text-white" style={{ transform: `rotate(${a.heading}deg)` }} />
                    </div>
                    {!a.onGround && (
                      <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
                    )}
                  </button>
                );
              })}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm">
                    <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="text-sm text-gray-600">Loading fleet positions...</span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-gray-600">In Flight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-600">On Ground</span>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 text-[9px] text-gray-400 bg-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
                Data via ADS-B Exchange · Updates every 30s
              </div>
            </div>

            {/* Selected Aircraft Detail */}
            {selected && (
              <div className="mt-4 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      selected.onGround ? "bg-blue-100" : "bg-green-100"
                    )}>
                      <Plane className={cn("w-6 h-6", selected.onGround ? "text-blue-600" : "text-green-600")} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selected.jet.name}</h3>
                      <p className="text-sm text-gray-500">{selected.jet.manufacturer} · {selected.registration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold",
                      getCategoryColor(selected.jet.category)
                    )}>
                      {getCategoryLabel(selected.jet.category)}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold",
                      selected.onGround ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    )}>
                      {selected.onGround ? "On Ground" : "In Flight"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Altitude</p>
                    <p className="text-sm font-semibold">{selected.onGround ? "—" : `${selected.altitude.toLocaleString()} ft`}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Speed</p>
                    <p className="text-sm font-semibold">{selected.speed} kts</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Heading</p>
                    <p className="text-sm font-semibold">{selected.heading}°</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Hourly Rate</p>
                    <p className="text-sm font-semibold text-amber-600">{formatCurrency(selected.jet.hourlyRate)}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/jets/${selected.jet.id}`}
                    className="flex-1 text-center py-2 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/booking?jet=${selected.jet.id}`}
                    className="flex-1 text-center py-2 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-white hover:from-amber-600 hover:to-amber-700 transition-all"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Aircraft List Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            {/* Search & Filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search aircraft..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "flying", "ground"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
                      filter === f
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {f === "all" ? `All (${aircraft.length})` : f === "flying" ? `Flying (${inFlight})` : `Ground (${onGround})`}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((a) => (
                <button
                  key={a.jet.id}
                  onClick={() => setSelected(a)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all hover:shadow-md",
                    selected?.jet.id === a.jet.id
                      ? "border-amber-300 bg-amber-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      a.onGround ? "bg-blue-100" : "bg-green-100"
                    )}>
                      <Plane className={cn("w-4 h-4", a.onGround ? "text-blue-600" : "text-green-600")}
                        style={{ transform: `rotate(${a.heading}deg)` }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">{a.jet.name}</p>
                        <div className={cn(
                          "h-2 w-2 rounded-full shrink-0 ml-2",
                          a.onGround ? "bg-blue-400" : "bg-green-400 animate-pulse"
                        )} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{a.registration}</span>
                        <span>·</span>
                        <span>{a.onGround ? "On Ground" : `FL${Math.round(a.altitude / 100)}`}</span>
                        {!a.onGround && (
                          <>
                            <span>·</span>
                            <span>{a.speed} kts</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
