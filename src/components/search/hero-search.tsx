"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, ArrowUpDown, Search, Minus, Plus } from "lucide-react";
import airports from "@/data/airports.json";
import type { Airport } from "@/types";
import { cn } from "@/lib/utils";

const typedAirports = airports as Airport[];

function AirportDropdown({
  query,
  onSelect,
  visible,
}: {
  query: string;
  onSelect: (a: Airport) => void;
  visible: boolean;
}) {
  if (!visible || query.length < 1) return null;
  const q = query.toLowerCase().trim();
  const filtered = typedAirports
    .filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    )
    .slice(0, 6);
  if (!filtered.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[#07101e]/10 bg-white shadow-lg">
      {filtered.map((a) => (
        <button
          key={a.code}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onSelect(a); }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f3ef]"
        >
          <span className="font-mono text-[13px] font-bold text-[#07101e]">{a.code}</span>
          <span className="text-[13px] text-[#07101e]/60">{a.city}, {a.country}</span>
        </button>
      ))}
    </div>
  );
}

export default function HeroSearch() {
  const router = useRouter();
  const [tripType, setTripType] = useState<"one_way" | "round_trip" | "multi_city">("one_way");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromOpen(false);
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const swapLocations = useCallback(() => {
    setFromQuery(toQuery);
    setToQuery(fromQuery);
    setFromCode(toCode);
    setToCode(fromCode);
  }, [fromQuery, toQuery, fromCode, toCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("trip", tripType);
    if (fromCode) params.set("from", fromCode);
    if (toCode) params.set("to", toCode);
    if (date) params.set("date", date);
    if (tripType === "round_trip" && returnDate) params.set("return", returnDate);
    if (passengers > 1) params.set("pax", String(passengers));
    router.push(`/search?${params.toString()}`);
  };

  const TRIP_TYPES = [
    { value: "one_way" as const, label: "One-way" },
    { value: "round_trip" as const, label: "Round trip" },
    { value: "multi_city" as const, label: "Multi-city" },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Trip type tabs */}
      <div className="mb-3 grid grid-cols-3 overflow-hidden rounded-xl border border-[#07101e]/10 bg-[#f0ede6]">
        {TRIP_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTripType(t.value)}
            className={cn(
              "py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.18em] transition-all",
              tripType === t.value
                ? "bg-[#07101e] text-white"
                : "text-[#07101e]/55 hover:text-[#07101e]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* From / To card */}
      <div className="mb-3 overflow-hidden rounded-xl border border-[#07101e]/10 bg-white">
        {/* From */}
        <div ref={fromRef} className="relative">
          <div className="flex items-center gap-3 px-4 py-4">
            <MapPin className="h-4 w-4 shrink-0 text-[#07101e]/35" strokeWidth={1.75} />
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">Departing from</p>
              <input
                type="text"
                placeholder="City or airport code"
                value={fromQuery}
                onChange={(e) => { setFromQuery(e.target.value); if (!e.target.value) setFromCode(""); setFromOpen(true); }}
                onFocus={() => setFromOpen(true)}
                className="w-full bg-transparent text-[14px] font-medium text-[#07101e] outline-none placeholder:text-[#07101e]/30"
              />
            </div>
          </div>
          <AirportDropdown
            query={fromQuery}
            visible={fromOpen}
            onSelect={(a) => { setFromQuery(`${a.city} (${a.code})`); setFromCode(a.code); setFromOpen(false); }}
          />
        </div>

        {/* Divider with swap */}
        <div className="relative flex items-center">
          <div className="flex-1 border-t border-[#07101e]/08" />
          <button
            type="button"
            onClick={swapLocations}
            aria-label="Swap airports"
            className="mx-4 flex h-7 w-7 items-center justify-center rounded-full border border-[#07101e]/15 bg-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-[#07101e]/50" strokeWidth={2} />
          </button>
          <div className="flex-1 border-t border-[#07101e]/08" />
        </div>

        {/* To */}
        <div ref={toRef} className="relative">
          <div className="flex items-center gap-3 px-4 py-4">
            <MapPin className="h-4 w-4 shrink-0 text-[#c4a052]" strokeWidth={1.75} />
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">Arriving at</p>
              <input
                type="text"
                placeholder="City or airport code"
                value={toQuery}
                onChange={(e) => { setToQuery(e.target.value); if (!e.target.value) setToCode(""); setToOpen(true); }}
                onFocus={() => setToOpen(true)}
                className="w-full bg-transparent text-[14px] font-medium text-[#07101e] outline-none placeholder:text-[#07101e]/30"
              />
            </div>
          </div>
          <AirportDropdown
            query={toQuery}
            visible={toOpen}
            onSelect={(a) => { setToQuery(`${a.city} (${a.code})`); setToCode(a.code); setToOpen(false); }}
          />
        </div>
      </div>

      {/* Passengers */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-[#07101e]/10 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-[#07101e]/35" strokeWidth={1.75} />
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">Passengers</p>
            <p className="text-[14px] font-medium text-[#07101e]">
              {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            disabled={passengers <= 1}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
              passengers <= 1
                ? "cursor-not-allowed border-[#07101e]/08 text-[#07101e]/20"
                : "border-[#07101e]/20 text-[#07101e] hover:border-[#07101e] hover:bg-[#07101e] hover:text-white"
            )}
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <span className="w-6 text-center text-[16px] font-semibold text-[#07101e]">{passengers}</span>
          <button
            type="button"
            onClick={() => setPassengers(Math.min(19, passengers + 1))}
            disabled={passengers >= 19}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
              passengers >= 19
                ? "cursor-not-allowed border-[#07101e]/08 text-[#07101e]/20"
                : "border-[#07101e]/20 text-[#07101e] hover:border-[#07101e] hover:bg-[#07101e] hover:text-white"
            )}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Date(s) */}
      <div className="mb-4 grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#07101e]/10 bg-white px-5 py-4">
          <Calendar className="h-4 w-4 shrink-0 text-[#07101e]/35" strokeWidth={1.75} />
          <div className="flex-1">
            <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">
              {tripType === "round_trip" ? "Departure date" : "Date and time"}
            </p>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                "w-full bg-transparent text-[14px] font-medium text-[#07101e] outline-none",
                !date && "text-[#07101e]/30"
              )}
            />
          </div>
        </div>
        {tripType === "round_trip" && (
          <div className="flex items-center gap-3 rounded-xl border border-[#07101e]/10 bg-white px-5 py-4">
            <Calendar className="h-4 w-4 shrink-0 text-[#c4a052]" strokeWidth={1.75} />
            <div className="flex-1">
              <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">Return date</p>
              <input
                type="date"
                min={date || today}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={cn(
                  "w-full bg-transparent text-[14px] font-medium text-[#07101e] outline-none",
                  !returnDate && "text-[#07101e]/30"
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#07101e] py-4 font-mono text-[12px] uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-88"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
        Search Aircraft
      </button>
    </form>
  );
}
