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

  const normalizedQuery = query.toLowerCase().trim();
  const filtered = typedAirports.filter(
    (a) =>
      a.code.toLowerCase().includes(normalizedQuery) ||
      a.city.toLowerCase().includes(normalizedQuery) ||
      a.name.toLowerCase().includes(normalizedQuery) ||
      a.country.toLowerCase().includes(normalizedQuery)
  );

  if (filtered.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl",
        "max-h-[280px] overflow-y-auto",
        "animate-in fade-in slide-in-from-top-2 duration-200",
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
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-50/80"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700">
            <Plane className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {airport.code}
              </span>
              <span className="truncate text-sm text-gray-500">
                {airport.city}, {airport.country}
              </span>
            </div>
            <p className="truncate text-xs text-gray-400">{airport.name}</p>
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

  // Sync local state when store changes (e.g. swap)
  useEffect(() => {
    setFromQuery(from);
  }, [from]);

  useEffect(() => {
    setToQuery(to);
  }, [to]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
      if (
        passengersRef.current &&
        !passengersRef.current.contains(e.target as Node)
      ) {
        setShowPassengers(false);
      }
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

  const handleSwap = useCallback(() => {
    swapLocations();
  }, [swapLocations]);

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

  // Get today's date as minimum for date input
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
          "relative flex items-center",
          "rounded-full border border-white/30 bg-white/95 backdrop-blur-xl",
          "shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
          "transition-shadow duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08)]",
          isHero
            ? "flex-col gap-0 rounded-2xl p-2 md:flex-row md:rounded-full md:p-2"
            : "flex-row rounded-full p-1.5"
        )}
      >
        {/* FROM Field */}
        <div
          ref={fromRef}
          className={cn(
            "relative flex items-center gap-2",
            isHero
              ? "w-full px-4 py-3 md:w-auto md:flex-1 md:py-0"
              : "flex-1 px-3"
          )}
        >
          <MapPin
            className={cn(
              "shrink-0 text-amber-600",
              isHero ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <div className="min-w-0 flex-1">
            <label
              className={cn(
                "block font-medium uppercase tracking-wider text-gray-400",
                isHero ? "text-[10px]" : "hidden"
              )}
            >
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
              className={cn(
                "w-full bg-transparent outline-none placeholder:text-gray-300",
                isHero
                  ? "text-sm font-medium text-gray-900"
                  : "text-xs font-medium text-gray-900"
              )}
            />
          </div>
          <AirportDropdown
            query={fromQuery}
            onSelect={handleSelectFrom}
            visible={showFromDropdown}
            inputRef={fromRef}
          />
        </div>

        {/* Swap Button */}
        <button
          type="button"
          onClick={handleSwap}
          className={cn(
            "z-10 flex shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all",
            "hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600",
            "active:scale-90",
            isHero
              ? "mx-auto -my-2 h-9 w-9 shadow-md md:mx-0 md:my-0 md:h-8 md:w-8"
              : "mx-0 h-7 w-7"
          )}
          aria-label="Swap departure and arrival"
        >
          <ArrowLeftRight className={cn(isHero ? "h-4 w-4" : "h-3 w-3")} />
        </button>

        {/* TO Field */}
        <div
          ref={toRef}
          className={cn(
            "relative flex items-center gap-2",
            isHero
              ? "w-full px-4 py-3 md:w-auto md:flex-1 md:py-0"
              : "flex-1 px-3"
          )}
        >
          <MapPin
            className={cn(
              "shrink-0 text-amber-600",
              isHero ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <div className="min-w-0 flex-1">
            <label
              className={cn(
                "block font-medium uppercase tracking-wider text-gray-400",
                isHero ? "text-[10px]" : "hidden"
              )}
            >
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
              className={cn(
                "w-full bg-transparent outline-none placeholder:text-gray-300",
                isHero
                  ? "text-sm font-medium text-gray-900"
                  : "text-xs font-medium text-gray-900"
              )}
            />
          </div>
          <AirportDropdown
            query={toQuery}
            onSelect={handleSelectTo}
            visible={showToDropdown}
            inputRef={toRef}
          />
        </div>

        {/* Divider */}
        <div
          className={cn(
            "hidden bg-gray-200 md:block",
            isHero ? "h-10 w-px" : "h-7 w-px"
          )}
        />

        {/* DATE Field */}
        <div
          className={cn(
            "relative flex items-center gap-2",
            isHero
              ? "w-full px-4 py-3 md:w-auto md:min-w-[170px] md:py-0"
              : "min-w-[130px] px-3"
          )}
        >
          <Calendar
            className={cn(
              "shrink-0 text-amber-600",
              isHero ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <div className="min-w-0 flex-1">
            <label
              className={cn(
                "block font-medium uppercase tracking-wider text-gray-400",
                isHero ? "text-[10px]" : "hidden"
              )}
            >
              Date
            </label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                "w-full bg-transparent outline-none",
                "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute",
                isHero
                  ? "text-sm font-medium text-gray-900"
                  : "text-xs font-medium text-gray-900",
                !date && "text-gray-300"
              )}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          className={cn(
            "hidden bg-gray-200 md:block",
            isHero ? "h-10 w-px" : "h-7 w-px"
          )}
        />

        {/* PASSENGERS Field */}
        <div
          ref={passengersRef}
          className={cn(
            "relative flex items-center gap-2",
            isHero
              ? "w-full px-4 py-3 md:w-auto md:min-w-[140px] md:py-0"
              : "min-w-[100px] px-3"
          )}
        >
          <Users
            className={cn(
              "shrink-0 text-amber-600",
              isHero ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassengers(!showPassengers)}
            className="flex min-w-0 flex-1 items-center gap-1 text-left"
          >
            <div className="flex-1">
              <label
                className={cn(
                  "block font-medium uppercase tracking-wider text-gray-400",
                  isHero ? "pointer-events-none text-[10px]" : "hidden"
                )}
              >
                Passengers
              </label>
              <span
                className={cn(
                  "block font-medium text-gray-900",
                  isHero ? "text-sm" : "text-xs"
                )}
              >
                {passengers} {passengers === 1 ? "Guest" : "Guests"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "shrink-0 text-gray-400 transition-transform",
                showPassengers && "rotate-180",
                isHero ? "h-4 w-4" : "h-3 w-3"
              )}
            />
          </button>

          {/* Passengers Dropdown */}
          {showPassengers && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Passengers
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers(Math.max(1, passengers - 1))
                    }
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors",
                      passengers <= 1
                        ? "cursor-not-allowed opacity-40"
                        : "hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                    )}
                    disabled={passengers <= 1}
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-lg font-semibold text-gray-900">
                    {passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPassengers(Math.min(16, passengers + 1))
                    }
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors",
                      passengers >= 16
                        ? "cursor-not-allowed opacity-40"
                        : "hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                    )}
                    disabled={passengers >= 16}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH Button */}
        <button
          type="submit"
          className={cn(
            "group flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold text-white transition-all",
            "bg-gradient-to-r from-amber-600 to-amber-500",
            "shadow-[0_4px_16px_rgba(217,119,6,0.4)]",
            "hover:from-amber-500 hover:to-amber-400 hover:shadow-[0_6px_24px_rgba(217,119,6,0.5)]",
            "active:scale-[0.97]",
            isHero
              ? "mx-2 mt-2 w-full px-8 py-3.5 text-sm md:ml-2 md:mt-0 md:w-auto md:px-6 md:py-3"
              : "ml-1 px-4 py-2 text-xs"
          )}
        >
          <Search
            className={cn(
              "transition-transform group-hover:scale-110",
              isHero ? "h-4 w-4" : "h-3.5 w-3.5"
            )}
          />
          <span className={cn(isHero ? "md:hidden lg:inline" : "hidden sm:inline")}>
            Search Jets
          </span>
        </button>
      </div>
    </form>
  );
}
