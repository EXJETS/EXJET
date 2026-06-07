"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Calendar, Users, ArrowUpDown, PlaneTakeoff,
  Minus, Plus, Clock, Trash2, Sofa,
} from "lucide-react";
import airports from "@/data/airports.json";
import { useSearchStore, type TripType } from "@/stores/search-store";
import type { Airport } from "@/types";
import { cn } from "@/lib/utils";

const typedAirports = airports as Airport[];

const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: "one_way", label: "One-way" },
  { value: "round_trip", label: "Round trip" },
  { value: "multi_leg", label: "Multi-city" },
];

/* ── Airport dropdown ─────────────────────────────── */
function AirportDropdown({
  query,
  onSelect,
  visible,
  inputRef,
}: {
  query: string;
  onSelect: (a: Airport) => void;
  visible: boolean;
  inputRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<"below" | "above">("below");
  useEffect(() => {
    if (!visible || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPos(window.innerHeight - rect.bottom < 280 ? "above" : "below");
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
  if (!filtered.length) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 max-h-[280px] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14)]",
        pos === "below" ? "top-full mt-1" : "bottom-full mb-1"
      )}
    >
      {filtered.slice(0, 8).map((a) => (
        <button
          key={a.code}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(a);
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 font-mono text-[11px] font-semibold text-neutral-700">
            {a.code}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-neutral-900">
              {a.city}, {a.country}
            </div>
            <div className="truncate text-[11px] text-neutral-500">{a.name}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── Airport row field ────────────────────────────── */
function AirportRowField({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (a: Airport) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative px-4 py-3.5">
      <label className="mb-0.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full bg-transparent text-[15px] font-medium text-neutral-900 outline-none placeholder:text-neutral-300"
      />
      <AirportDropdown
        query={value}
        onSelect={(a) => {
          onSelect(a);
          setOpen(false);
        }}
        visible={open}
        inputRef={ref}
      />
    </div>
  );
}

/* ── Multi-leg row ────────────────────────────────── */
function MultiLegRow({
  index,
  leg,
  onUpdate,
  onRemove,
  today,
}: {
  index: number;
  leg: { from: string; to: string; fromCode: string; toCode: string; date: string; time: string };
  onUpdate: (patch: Partial<typeof leg>) => void;
  onRemove?: () => void;
  today: string;
}) {
  const [fromQ, setFromQ] = useState(leg.from);
  const [toQ, setToQ] = useState(leg.to);
  useEffect(() => setFromQ(leg.from), [leg.from]);
  useEffect(() => setToQ(leg.to), [leg.to]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-navy)]">
          Leg {index + 1}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-neutral-400 hover:text-neutral-700"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>
      <AirportRowField
        label="From"
        placeholder="Departure city"
        value={fromQ}
        onChange={(v) => { setFromQ(v); if (!v) onUpdate({ from: "", fromCode: "" }); }}
        onSelect={(a) => { onUpdate({ from: `${a.city} (${a.code})`, fromCode: a.code }); setFromQ(`${a.city} (${a.code})`); }}
      />
      <div className="border-t border-neutral-100" />
      <AirportRowField
        label="To"
        placeholder="Arrival city"
        value={toQ}
        onChange={(v) => { setToQ(v); if (!v) onUpdate({ to: "", toCode: "" }); }}
        onSelect={(a) => { onUpdate({ to: `${a.city} (${a.code})`, toCode: a.code }); setToQ(`${a.city} (${a.code})`); }}
      />
      <div className="border-t border-neutral-100 px-4 py-3.5 flex items-center gap-3">
        <Clock className="h-4 w-4 text-neutral-400" strokeWidth={1.75} />
        <div className="flex flex-1 gap-2">
          <input
            type="date"
            min={today}
            value={leg.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="flex-1 bg-transparent text-[14px] font-medium text-neutral-900 outline-none"
          />
          <input
            type="time"
            value={leg.time}
            onChange={(e) => onUpdate({ time: e.target.value })}
            className="w-[78px] bg-transparent text-[14px] font-medium text-neutral-900 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────── */
export default function SearchBar({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"charter" | "empty_legs">("charter");

  const {
    tripType, from, to, fromCode, toCode,
    date, time, returnDate, returnTime,
    passengers, bags, pets, legs,
    setTripType, setFrom, setTo, setDate, setTime,
    setReturnDate, setReturnTime, setPassengers, setBags, setPets,
    addLeg, removeLeg, updateLeg, swapLocations,
  } = useSearchStore();

  const [fromQuery, setFromQuery] = useState(from);
  const [toQuery, setToQuery] = useState(to);
  useEffect(() => setFromQuery(from), [from]);
  useEffect(() => setToQuery(to), [to]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (mode === "empty_legs") {
        router.push("/search?category=empty-legs");
        return;
      }
      const params = new URLSearchParams();
      params.set("trip", tripType);
      if (tripType === "multi_leg") {
        legs
          .filter((l) => l.fromCode && l.toCode)
          .forEach((l, i) => {
            params.set(`leg${i + 1}_from`, l.fromCode);
            params.set(`leg${i + 1}_to`, l.toCode);
            if (l.date) params.set(`leg${i + 1}_date`, l.date);
            if (l.time) params.set(`leg${i + 1}_time`, l.time);
          });
      } else {
        if (fromCode) params.set("from", fromCode);
        if (toCode) params.set("to", toCode);
        if (date) params.set("date", date);
        if (time) params.set("time", time);
        if (tripType === "round_trip" && returnDate) {
          params.set("return", returnDate);
          if (returnTime) params.set("return_time", returnTime);
        }
      }
      if (passengers > 1) params.set("pax", String(passengers));
      if (bags > 0) params.set("bags", String(bags));
      if (pets > 0) params.set("pets", String(pets));
      router.push(`/search?${params.toString()}`);
    },
    [mode, tripType, legs, fromCode, toCode, date, time, returnDate, returnTime, passengers, bags, pets, router]
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full">
      {/* Mode tabs */}
      <div className="mb-5 flex gap-6 border-b border-neutral-200">
        {(["charter", "empty_legs"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex items-center gap-2 pb-3 text-[14px] font-medium transition-all",
              mode === m
                ? "border-b-2 border-[var(--color-navy)] text-[var(--color-ink)]"
                : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            {m === "charter" ? (
              <PlaneTakeoff
                className={cn("h-4 w-4", mode === m ? "text-[var(--color-navy)]" : "")}
                strokeWidth={1.75}
              />
            ) : (
              <Sofa
                className={cn("h-4 w-4", mode === m ? "text-[var(--color-navy)]" : "")}
                strokeWidth={1.75}
              />
            )}
            {m === "charter" ? "Charter" : "Empty Legs"}
          </button>
        ))}
      </div>

      {/* Trip type pills */}
      <div className="mb-4 flex gap-2">
        {TRIP_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTripType(t.value)}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-medium transition-all",
              tripType === t.value
                ? "bg-[var(--color-ink)] text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {tripType !== "multi_leg" ? (
          <>
            {/* From / To card */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
              <AirportRowField
                label="From"
                placeholder="Departure city or airport"
                value={fromQuery}
                onChange={(v) => { setFromQuery(v); if (!v) setFrom("", ""); }}
                onSelect={(a) => {
                  setFrom(`${a.city} (${a.code})`, a.code);
                  setFromQuery(`${a.city} (${a.code})`);
                }}
              />
              {/* Divider + swap */}
              <div className="relative border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    swapLocations();
                    setFromQuery(to);
                    setToQuery(from);
                  }}
                  className="absolute right-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:border-neutral-400 hover:text-neutral-800 active:scale-90"
                  aria-label="Swap departure and arrival"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
              <AirportRowField
                label="To"
                placeholder="Arrival city or airport"
                value={toQuery}
                onChange={(v) => { setToQuery(v); if (!v) setTo("", ""); }}
                onSelect={(a) => {
                  setTo(`${a.city} (${a.code})`, a.code);
                  setToQuery(`${a.city} (${a.code})`);
                }}
              />
            </div>

            {/* Passengers card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-neutral-400" strokeWidth={1.75} />
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      Passengers
                    </div>
                    <div className="text-[15px] font-medium text-neutral-900">
                      {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                      {bags > 0 && ` · ${bags} bag${bags > 1 ? "s" : ""}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                      passengers <= 1
                        ? "cursor-not-allowed border-neutral-100 text-neutral-300"
                        : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                    )}
                    disabled={passengers <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <span className="w-5 text-center text-[15px] font-semibold text-neutral-900">
                    {passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(19, passengers + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-500"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>

            {/* Date card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-3 px-4 py-4">
                <Calendar className="h-5 w-5 text-neutral-400" strokeWidth={1.75} />
                <div className="flex-1">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    {tripType === "round_trip" ? "Depart" : "Date and time"}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={cn(
                        "flex-1 bg-transparent text-[15px] font-medium outline-none",
                        date ? "text-neutral-900" : "text-neutral-300"
                      )}
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={cn(
                        "w-[80px] bg-transparent text-[15px] font-medium outline-none",
                        time ? "text-neutral-900" : "text-neutral-300"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Return date (round trip only) */}
              {tripType === "round_trip" && (
                <>
                  <div className="border-t border-neutral-100" />
                  <div className="flex items-center gap-3 px-4 py-4">
                    <Calendar className="h-5 w-5 text-neutral-400" strokeWidth={1.75} />
                    <div className="flex-1">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        Return
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="date"
                          min={date || today}
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className={cn(
                            "flex-1 bg-transparent text-[15px] font-medium outline-none",
                            returnDate ? "text-neutral-900" : "text-neutral-300"
                          )}
                        />
                        <input
                          type="time"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className={cn(
                            "w-[80px] bg-transparent text-[15px] font-medium outline-none",
                            returnTime ? "text-neutral-900" : "text-neutral-300"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* Multi-leg */
          <div className="flex flex-col gap-3">
            {legs.map((leg, idx) => (
              <MultiLegRow
                key={idx}
                index={idx}
                leg={leg}
                onUpdate={(patch) => updateLeg(idx, patch)}
                onRemove={legs.length > 2 ? () => removeLeg(idx) : undefined}
                today={today}
              />
            ))}
            <button
              type="button"
              onClick={addLeg}
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 py-3.5 text-[13px] font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add another leg
            </button>

            {/* Passengers (multi-leg) */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-neutral-400" strokeWidth={1.75} />
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      Passengers
                    </div>
                    <div className="text-[15px] font-medium text-neutral-900">
                      {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                      passengers <= 1
                        ? "cursor-not-allowed border-neutral-100 text-neutral-300"
                        : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                    )}
                    disabled={passengers <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <span className="w-5 text-center text-[15px] font-semibold text-neutral-900">
                    {passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(19, passengers + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-500"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search button */}
        <button
          type="submit"
          className="w-full rounded-2xl bg-[var(--color-navy)] py-4 text-[16px] font-semibold text-white shadow-[0_4px_20px_rgba(13,31,60,0.4)] transition-all hover:bg-[var(--color-navy-light)] active:scale-[0.99]"
        >
          Search
        </button>
      </form>
    </div>
  );
}
