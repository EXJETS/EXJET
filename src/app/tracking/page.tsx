"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plane, Radio, MapPin, RefreshCw, Search } from "lucide-react";
import { cn, getCategoryLabel, formatCurrency } from "@/lib/utils";
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
    <div className="min-h-screen bg-white text-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
                <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Fleet Live Tracking</p>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-200">
                  ADS-B Exchange
                </span>
              </div>
              <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-neutral-950">Global Fleet Map</h1>
              <p className="mt-1 text-[13px] text-neutral-600">
                Real-time positions of all {aircraft.length} aircraft in our fleet
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200">
                <Plane className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
                <span className="text-[12px] font-medium text-emerald-700">{inFlight} in flight</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 ring-1 ring-neutral-200">
                <MapPin className="h-3.5 w-3.5 text-neutral-700" strokeWidth={2} />
                <span className="text-[12px] font-medium text-neutral-800">{onGround} on ground</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Map Area */}
          <div className="flex-1">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 backdrop-blur-xl">
              {/* Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.04),transparent_70%)]" />

              {/* Aircraft dots */}
              {!loading && filtered.map((a, idx) => {
                const x = 5 + ((a.lat * 3 + a.lng * 7 + idx * 13) % 85);
                const y = 5 + ((a.lng * 5 + a.lat * 11 + idx * 7) % 85);
                return (
                  <button
                    key={a.jet.id}
                    className={cn(
                      "group absolute z-10 transition-transform hover:scale-150",
                      selected?.jet.id === a.jet.id && "z-20 scale-150"
                    )}
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={() => setSelected(a)}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full ring-1",
                        a.onGround
                          ? "bg-neutral-100 text-neutral-950 ring-neutral-300"
                          : "bg-emerald-500 text-black ring-emerald-300/50"
                      )}
                    >
                      <Plane className="h-2.5 w-2.5" style={{ transform: `rotate(${a.heading}deg)` }} strokeWidth={2} />
                    </div>
                    {!a.onGround && (
                      <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                    )}
                  </button>
                );
              })}

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white/80 px-6 py-3 backdrop-blur-md">
                    <RefreshCw className="h-4 w-4 animate-spin text-neutral-700" strokeWidth={1.75} />
                    <span className="text-[12px] text-neutral-700">Loading fleet positions...</span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-4 rounded-lg border border-neutral-200 bg-white/80 px-3 py-2 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">In Flight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">On Ground</span>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 rounded border border-neutral-200 bg-white/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 backdrop-blur-md">
                Data via ADS-B Exchange · Updates every 30s
              </div>
            </div>

            {/* Selected Aircraft Detail */}
            {selected && (
              <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl ring-1",
                        selected.onGround
                          ? "bg-neutral-100 text-neutral-800 ring-neutral-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      )}
                    >
                      <Plane className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-tight text-neutral-950">{selected.jet.name}</h3>
                      <p className="text-[12px] text-neutral-500">{selected.jet.manufacturer} · {selected.registration}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-800">
                      {getCategoryLabel(selected.jet.category)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ring-1",
                        selected.onGround
                          ? "bg-neutral-100 text-neutral-700 ring-neutral-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      )}
                    >
                      {selected.onGround ? "On Ground" : "In Flight"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-4">
                  <DetailStat label="Altitude" value={selected.onGround ? "—" : `${selected.altitude.toLocaleString()} ft`} />
                  <DetailStat label="Speed" value={`${selected.speed} kts`} />
                  <DetailStat label="Heading" value={`${selected.heading}°`} />
                  <DetailStat label="Hourly Rate" value={formatCurrency(selected.jet.hourlyRate)} />
                </div>
                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/jets/${selected.jet.id}`}
                    className="flex-1 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-center text-[12px] font-medium text-neutral-950 transition-colors hover:border-neutral-400 hover:bg-neutral-100"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/booking?jet=${selected.jet.id}`}
                    className="flex-1 rounded-full bg-white px-4 py-2 text-center text-[12px] font-medium text-black transition-colors hover:bg-neutral-800"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Aircraft List Sidebar */}
          <div className="w-full shrink-0 lg:w-80">
            {/* Search & Filter */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search aircraft..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-4 text-[13px] text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "flying", "ground"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "flex-1 rounded-full py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                      filter === f
                        ? "bg-neutral-950 text-neutral-950"
                        : "border border-neutral-300 bg-neutral-50 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100"
                    )}
                  >
                    {f === "all" ? `All (${aircraft.length})` : f === "flying" ? `Fly (${inFlight})` : `Gnd (${onGround})`}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
              {filtered.map((a) => (
                <button
                  key={a.jet.id}
                  onClick={() => setSelected(a)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all",
                    selected?.jet.id === a.jet.id
                      ? "border-neutral-400 bg-neutral-100"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                        a.onGround
                          ? "bg-neutral-100 text-neutral-800 ring-neutral-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      )}
                    >
                      <Plane
                        className="h-4 w-4"
                        style={{ transform: `rotate(${a.heading}deg)` }}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-[13px] font-semibold text-neutral-950">{a.jet.name}</p>
                        <div
                          className={cn(
                            "ml-2 h-1.5 w-1.5 shrink-0 rounded-full",
                            a.onGround ? "bg-neutral-300" : "animate-pulse bg-emerald-500"
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
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

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-neutral-950">{value}</p>
    </div>
  );
}
