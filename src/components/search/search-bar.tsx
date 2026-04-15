"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowLeftRight,
  ChevronDown,
  Plane,
  Minus,
  Plus,
} from "lucide-react";
import airports from "@/data/airports.json";
import { useSearchStore } from "@/stores/search-store";
import type { Airport } from "@/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

const typedAirports = airports as Airport[];

function AirportDropdown({
  query,
  onSelect,
  visible,
  inputRef,
}: {
  query: string;
  onSelect: (airport: Airport) => void;
  visible: boolean;
  inputRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [position, setPosition] = useState<"below" | "above">("below");

  useEffect(() => {
    if (!visible || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPosition(spaceBelow < 280 ? "above" : "below");
  }, [visible, inputRef]);

  if (!visible || query.length < 1) return null;

  const q = query.toLowerCase().trim();
  const filtered = typedAirports.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  );

  if (filtered.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl",
        "max-h-[280px] overflow-y-auto",
        position === "below" ? "top-full mt-2" : "bottom-full mb-2"
      )}
    >
      {filtered.slice(0, 8).map((airport) => (
        <button
          key={airport.code}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(airport);
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/70">
            <Plane className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-semibold tracking-wide text-white">
                {airport.code}
              </span>
              <span className="truncate text-[13px] text-white/60">
                {airport.city}, {airport.country}
              </span>
            </div>
            <p className="truncate text-[11px] text-white/40">{airport.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const {
    from,
    to,
    fromCode,
    toCode,
    date,
    passengers,
    setFrom,
    setTo,
    setDate,
    setPassengers,
    swapLocations,
  } = useSearchStore();

  const [fromQuery, setFromQuery] = useState(from);
  const [toQuery, setToQuery] = useState(to);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showPassengers, setShowPassengers] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const passengersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFromQuery(from);
  }, [from]);

  useEffect(() => {
    setToQuery(to);
  }, [to]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node))
        setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(e.target as Node))
        setShowToDropdown(false);
      if (
        passengersRef.current &&
        !passengersRef.current.contains(e.target as Node)
      )
        setShowPassengers(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectFrom = useCallback(
    (airport: Airport) => {
      setFrom(`${airport.city} (${airport.code})`, airport.code);
      setFromQuery(`${airport.city} (${airport.code})`);
      setShowFromDropdown(false);
    },
    [setFrom]
  );

  const handleSelectTo = useCallback(
    (airport: Airport) => {
      setTo(`${airport.city} (${airport.code})`, airport.code);
      setToQuery(`${airport.city} (${airport.code})`);
      setShowToDropdown(false);
    },
    [setTo]
  );

  const handleSwap = useCallback(() => swapLocations(), [swapLocations]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (fromCode) params.set("from", fromCode);
      if (toCode) params.set("to", toCode);
      if (date) params.set("date", date);
      if (passengers > 1) params.set("pax", String(passengers));
      router.push(`/search?${params.toString()}`);
    },
    [fromCode, toCode, date, passengers, router]
  );

  const isHero = variant === "hero";
  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full transition-all duration-300",
        isHero ? "max-w-5xl" : "max-w-4xl"
      )}
    >
      <div
        className={cn(
          "relative flex items-stretch",
          "rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl",
          isHero
            ? "flex-col gap-0 p-2 md:flex-row"
            : "flex-row p-1.5"
        )}
      >
        {/* FROM */}
        <div
          ref={fromRef}
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-4 transition-colors hover:bg-white/[0.03]",
            isHero
              ? "w-full py-3 md:w-auto md:flex-1 md:py-3"
              : "flex-1"
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-white/50" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40">
              From
            </label>
            <input
              type="text"
              placeholder="Departure city"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromDropdown(true);
                if (!e.target.value) setFrom("", "");
              }}
              onFocus={() => setShowFromDropdown(true)}
              className="w-full bg-transparent text-[14px] font-medium text-white outline-none placeholder:text-white/30"
            />
          </div>
          <AirportDropdown
            query={fromQuery}
            onSelect={handleSelectFrom}
            visible={showFromDropdown}
            inputRef={fromRef}
          />
        </div>

        {/* Swap */}
        <button
          type="button"
          onClick={handleSwap}
          className={cn(
            "z-10 flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-black text-white/60 transition-all",
            "hover:border-white/25 hover:bg-white/10 hover:text-white",
            "active:scale-90",
            isHero
              ? "mx-auto -my-2 h-9 w-9 md:mx-1 md:my-auto md:h-8 md:w-8"
              : "mx-1 h-7 w-7"
          )}
          aria-label="Swap departure and arrival"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        {/* TO */}
        <div
          ref={toRef}
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-4 transition-colors hover:bg-white/[0.03]",
            isHero
              ? "w-full py-3 md:w-auto md:flex-1 md:py-3"
              : "flex-1"
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-white/50" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40">
              To
            </label>
            <input
              type="text"
              placeholder="Arrival city"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setShowToDropdown(true);
                if (!e.target.value) setTo("", "");
              }}
              onFocus={() => setShowToDropdown(true)}
              className="w-full bg-transparent text-[14px] font-medium text-white outline-none placeholder:text-white/30"
            />
          </div>
          <AirportDropdown
            query={toQuery}
            onSelect={handleSelectTo}
            visible={showToDropdown}
            inputRef={toRef}
          />
        </div>

        <div className="hidden h-10 w-px self-center bg-white/[0.08] md:block" />

        {/* DATE */}
        <div
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-4 transition-colors hover:bg-white/[0.03]",
            isHero
              ? "w-full py-3 md:min-w-[170px] md:py-3"
              : "min-w-[130px]"
          )}
        >
          <Calendar className="h-4 w-4 shrink-0 text-white/50" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40">
              Date
            </label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                "w-full bg-transparent text-[14px] font-medium text-white outline-none",
                "[color-scheme:dark]",
                !date && "text-white/30"
              )}
            />
          </div>
        </div>

        <div className="hidden h-10 w-px self-center bg-white/[0.08] md:block" />

        {/* PASSENGERS */}
        <div
          ref={passengersRef}
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-4 transition-colors hover:bg-white/[0.03]",
            isHero
              ? "w-full py-3 md:min-w-[150px] md:py-3"
              : "min-w-[110px]"
          )}
        >
          <Users className="h-4 w-4 shrink-0 text-white/50" strokeWidth={1.75} />
          <button
            type="button"
            onClick={() => setShowPassengers(!showPassengers)}
            className="flex min-w-0 flex-1 items-center gap-1 text-left"
          >
            <div className="flex-1">
              <label className="pointer-events-none block font-mono text-[10px] uppercase tracking-widest text-white/40">
                Passengers
              </label>
              <span className="block text-[14px] font-medium text-white">
                {passengers} {passengers === 1 ? "Guest" : "Guests"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-white/40 transition-transform",
                showPassengers && "rotate-180"
              )}
              strokeWidth={2}
            />
          </button>

          {showPassengers && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/10 bg-black/90 p-4 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">
                  Passengers
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    disabled={passengers <= 1}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white transition-colors",
                      passengers <= 1
                        ? "cursor-not-allowed opacity-30"
                        : "hover:bg-white hover:text-black"
                    )}
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <span className="w-6 text-center text-[15px] font-semibold text-white">
                    {passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(16, passengers + 1))}
                    disabled={passengers >= 16}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white transition-colors",
                      passengers >= 16
                        ? "cursor-not-allowed opacity-30"
                        : "hover:bg-white hover:text-black"
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH */}
        <button
          type="submit"
          className={cn(
            "group flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white font-medium text-black transition-colors hover:bg-white/90 active:scale-[0.98]",
            isHero
              ? "mx-2 mt-2 w-full px-6 py-3 text-[13px] md:ml-2 md:mt-0 md:w-auto md:px-6"
              : "ml-1 px-4 py-2 text-[12px]"
          )}
        >
          <Search className="h-3.5 w-3.5" strokeWidth={2.25} />
          <span>Search Jets</span>
        </button>
      </div>
    </form>
  );
}
