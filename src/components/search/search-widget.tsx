"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search, ChevronDown, Minus, Plus } from "lucide-react";
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
    <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-[#07101e]/10 bg-white shadow-xl">
      {filtered.map((a) => (
        <button
          key={a.code}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(a);
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f3ef]"
        >
          <span className="w-10 shrink-0 font-mono text-[13px] font-bold text-[#07101e]">{a.code}</span>
          <div className="min-w-0">
            <p className="truncate text-[13px] text-[#07101e]/80">{a.city}</p>
            <p className="truncate text-[11px] text-[#07101e]/40">{a.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

type TripType = "one_way" | "round_trip" | "multi_city";

const TABS: { value: TripType; label: string }[] = [
  { value: "one_way", label: "One-Way" },
  { value: "round_trip", label: "Round Trip" },
  { value: "multi_city", label: "Multi-City" },
];

export default function SearchWidget() {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>("one_way");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [passengerOpen, setPassengerOpen] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const paxRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromOpen(false);
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToOpen(false);
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) setPassengerOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Trip type tabs */}
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setTripType(tab.value)}
            className={cn(
              "rounded-t-lg px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all",
              tripType === tab.value
                ? "bg-white text-[#07101e]"
                : "bg-white/10 text-white/55 hover:bg-white/20 hover:text-white/80"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex flex-col overflow-hidden rounded-b-2xl rounded-tr-2xl bg-white shadow-2xl md:flex-row md:items-stretch">

        {/* From */}
        <div ref={fromRef} className="relative flex-1 border-b border-[#07101e]/08 md:border-b-0 md:border-r">
          <div className="flex h-full items-center gap-3 px-5 py-[18px]">
            <MapPin className="h-4 w-4 shrink-0 text-[#07101e]/30" strokeWidth={1.75} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">From</p>
              <input
                type="text"
                placeholder="City or airport"
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  if (!e.target.value) setFromCode("");
                  setFromOpen(true);
                }}
                onFocus={() => setFromOpen(true)}
                className="w-full truncate bg-transparent text-[14px] font-medium text-[#07101e] outline-none placeholder:text-[#07101e]/28"
              />
            </div>
          </div>
          <AirportDropdown
            query={fromQuery}
            visible={fromOpen}
            onSelect={(a) => {
              setFromQuery(`${a.city} (${a.code})`);
              setFromCode(a.code);
              setFromOpen(false);
            }}
          />
        </div>

        {/* To */}
        <div ref={toRef} className="relative flex-1 border-b border-[#07101e]/08 md:border-b-0 md:border-r">
          <div className="flex h-full items-center gap-3 px-5 py-[18px]">
            <MapPin className="h-4 w-4 shrink-0 text-[#c4a052]" strokeWidth={1.75} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">To</p>
              <input
                type="text"
                placeholder="City or airport"
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  if (!e.target.value) setToCode("");
                  setToOpen(true);
                }}
                onFocus={() => setToOpen(true)}
                className="w-full truncate bg-transparent text-[14px] font-medium text-[#07101e] outline-none placeholder:text-[#07101e]/28"
              />
            </div>
          </div>
          <AirportDropdown
            query={toQuery}
            visible={toOpen}
            onSelect={(a) => {
              setToQuery(`${a.city} (${a.code})`);
              setToCode(a.code);
              setToOpen(false);
            }}
          />
        </div>

        {/* Depart date */}
        <div className="flex-1 border-b border-[#07101e]/08 md:border-b-0 md:border-r">
          <div className="flex h-full items-center gap-3 px-5 py-[18px]">
            <Calendar className="h-4 w-4 shrink-0 text-[#07101e]/30" strokeWidth={1.75} />
            <div className="flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">
                {tripType === "round_trip" ? "Depart" : "Date"}
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
        </div>

        {/* Return date — only when round trip */}
        {tripType === "round_trip" && (
          <div className="flex-1 border-b border-[#07101e]/08 md:border-b-0 md:border-r">
            <div className="flex h-full items-center gap-3 px-5 py-[18px]">
              <Calendar className="h-4 w-4 shrink-0 text-[#c4a052]" strokeWidth={1.75} />
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">Return</p>
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
          </div>
        )}

        {/* Passengers */}
        <div ref={paxRef} className="relative border-b border-[#07101e]/08 md:border-b-0 md:border-r">
          <button
            type="button"
            onClick={() => setPassengerOpen(!passengerOpen)}
            className="flex h-full w-full items-center gap-3 px-5 py-[18px]"
          >
            <Users className="h-4 w-4 shrink-0 text-[#07101e]/30" strokeWidth={1.75} />
            <div className="min-w-[60px] text-left">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#07101e]/40">Passengers</p>
              <p className="text-[14px] font-medium text-[#07101e]">
                {passengers} {passengers === 1 ? "Pax" : "Pax"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-[#07101e]/35 transition-transform",
                passengerOpen && "rotate-180"
              )}
              strokeWidth={2}
            />
          </button>

          {passengerOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-[#07101e]/10 bg-white p-5 shadow-xl">
              <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#07101e]/40">
                Passengers
              </p>
              <div className="flex items-center justify-between">
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
                  <Minus className="h-3 w-3" strokeWidth={2.5} />
                </button>
                <span className="text-center text-[18px] font-semibold text-[#07101e]">
                  {passengers}
                </span>
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
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2.5 bg-[#07101e] px-8 py-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-88 md:rounded-br-2xl"
        >
          <Search className="h-4 w-4" strokeWidth={2} />
          Search
        </button>
      </div>
    </form>
  );
}
