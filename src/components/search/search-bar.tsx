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
  Clock,
  Trash2,
} from "lucide-react";
import airports from "@/data/airports.json";
import { useSearchStore, type TripType } from "@/stores/search-store";
import type { Airport } from "@/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

const typedAirports = airports as Airport[];

const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: "one_way", label: "One way" },
  { value: "round_trip", label: "Round trip" },
  { value: "multi_leg", label: "Multi leg" },
];

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
        "absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] backdrop-blur-xl",
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
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-neutral-700">
            <Plane className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-semibold tracking-wide text-neutral-950">
                {airport.code}
              </span>
              <span className="truncate text-[13px] text-neutral-600">
                {airport.city}, {airport.country}
              </span>
            </div>
            <p className="truncate text-[11px] text-neutral-400">{airport.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------- Reusable: airport input cell ---------- */
function AirportField({
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
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-neutral-50"
    >
      <MapPin className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400">
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
          className="w-full bg-transparent text-[14px] font-medium text-neutral-950 outline-none placeholder:text-neutral-400"
        />
      </div>
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

/* ---------- Reusable: stepper popover ---------- */
function StepperField({
  icon: Icon,
  label,
  summary,
  items,
}: {
  icon: typeof Users;
  label: string;
  summary: string;
  items: {
    key: string;
    title: string;
    subtitle?: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
  }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-neutral-50"
      >
        <Icon className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            {label}
          </span>
          <span className="block text-[14px] font-medium text-neutral-950">
            {summary}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          {items.map((it) => (
            <div
              key={it.key}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-neutral-950">
                  {it.title}
                </div>
                {it.subtitle && (
                  <div className="text-[11px] text-neutral-500">{it.subtitle}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => it.onChange(Math.max(it.min, it.value - 1))}
                  disabled={it.value <= it.min}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-950 transition-colors",
                    it.value <= it.min
                      ? "cursor-not-allowed opacity-30"
                      : "hover:bg-neutral-950 hover:text-white"
                  )}
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <span className="w-6 text-center text-[15px] font-semibold text-neutral-950">
                  {it.value}
                </span>
                <button
                  type="button"
                  onClick={() => it.onChange(Math.min(it.max, it.value + 1))}
                  disabled={it.value >= it.max}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-950 transition-colors",
                    it.value >= it.max
                      ? "cursor-not-allowed opacity-30"
                      : "hover:bg-neutral-950 hover:text-white"
                  )}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const {
    tripType,
    from,
    to,
    fromCode,
    toCode,
    date,
    time,
    returnDate,
    returnTime,
    passengers,
    bags,
    pets,
    legs,
    setTripType,
    setFrom,
    setTo,
    setDate,
    setTime,
    setReturnDate,
    setReturnTime,
    setPassengers,
    setBags,
    setPets,
    addLeg,
    removeLeg,
    updateLeg,
    swapLocations,
  } = useSearchStore();

  const [fromQuery, setFromQuery] = useState(from);
  const [toQuery, setToQuery] = useState(to);

  useEffect(() => setFromQuery(from), [from]);
  useEffect(() => setToQuery(to), [to]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
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
        if (tripType === "round_trip") {
          if (returnDate) params.set("return", returnDate);
          if (returnTime) params.set("return_time", returnTime);
        }
      }
      if (passengers > 1) params.set("pax", String(passengers));
      if (bags > 0) params.set("bags", String(bags));
      if (pets > 0) params.set("pets", String(pets));
      router.push(`/search?${params.toString()}`);
    },
    [
      tripType,
      legs,
      fromCode,
      toCode,
      date,
      time,
      returnDate,
      returnTime,
      passengers,
      bags,
      pets,
      router,
    ]
  );

  const isHero = variant === "hero";
  const today = new Date().toISOString().split("T")[0];

  const passengersSummary = `${passengers} ${passengers === 1 ? "Passenger" : "Passengers"}${
    bags > 0 ? ` · ${bags} bag${bags === 1 ? "" : "s"}` : ""
  }${pets > 0 ? ` · ${pets} pet${pets === 1 ? "" : "s"}` : ""}`;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full transition-all duration-300",
        isHero ? "max-w-5xl" : "max-w-5xl"
      )}
    >
      {/* Trip-type tabs */}
      <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 backdrop-blur-xl">
        {TRIP_TYPES.map((t) => {
          const active = tripType === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTripType(t.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                active
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-2 backdrop-blur-xl">
        {tripType !== "multi_leg" ? (
          <div className="flex flex-col gap-0 md:flex-row md:items-stretch">
            {/* FROM */}
            <AirportField
              label="From"
              placeholder="Departure city"
              value={fromQuery}
              onChange={(v) => {
                setFromQuery(v);
                if (!v) setFrom("", "");
              }}
              onSelect={(a) => {
                setFrom(`${a.city} (${a.code})`, a.code);
                setFromQuery(`${a.city} (${a.code})`);
              }}
            />

            {/* Swap */}
            <button
              type="button"
              onClick={() => {
                swapLocations();
                setFromQuery(to);
                setToQuery(from);
              }}
              className="z-10 mx-auto -my-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-all hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 active:scale-90 md:mx-1 md:my-auto md:h-8 md:w-8"
              aria-label="Swap departure and arrival"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>

            {/* TO */}
            <AirportField
              label="To"
              placeholder="Arrival city"
              value={toQuery}
              onChange={(v) => {
                setToQuery(v);
                if (!v) setTo("", "");
              }}
              onSelect={(a) => {
                setTo(`${a.city} (${a.code})`, a.code);
                setToQuery(`${a.city} (${a.code})`);
              }}
            />

            <div className="hidden h-10 w-px self-center bg-neutral-200 md:block" />

            {/* DATE + TIME */}
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-neutral-50 md:max-w-[260px]">
              <Calendar className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  {tripType === "round_trip" ? "Depart" : "Date / Time"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={cn(
                      "min-w-0 flex-1 bg-transparent text-[14px] font-medium text-neutral-950 outline-none",
                      !date && "text-neutral-400"
                    )}
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={cn(
                      "w-[78px] bg-transparent text-[14px] font-medium text-neutral-950 outline-none",
                      !time && "text-neutral-400"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* RETURN (only round_trip) */}
            {tripType === "round_trip" && (
              <>
                <div className="hidden h-10 w-px self-center bg-neutral-200 md:block" />
                <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-neutral-50 md:max-w-[260px]">
                  <Calendar
                    className="h-4 w-4 shrink-0 text-neutral-500"
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0 flex-1">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                      Return
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        min={date || today}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className={cn(
                          "min-w-0 flex-1 bg-transparent text-[14px] font-medium text-neutral-950 outline-none",
                          !returnDate && "text-neutral-400"
                        )}
                      />
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className={cn(
                          "w-[78px] bg-transparent text-[14px] font-medium text-neutral-950 outline-none",
                          !returnTime && "text-neutral-400"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="hidden h-10 w-px self-center bg-neutral-200 md:block" />

            {/* PASSENGERS / BAGS / PETS */}
            <div className="md:min-w-[220px]">
              <StepperField
                icon={Users}
                label="Passengers"
                summary={passengersSummary}
                items={[
                  {
                    key: "pax",
                    title: "Passengers",
                    subtitle: "Ages 2+",
                    value: passengers,
                    min: 1,
                    max: 19,
                    onChange: setPassengers,
                  },
                  {
                    key: "bags",
                    title: "Bags",
                    subtitle: "Standard checked",
                    value: bags,
                    min: 0,
                    max: 30,
                    onChange: setBags,
                  },
                  {
                    key: "pets",
                    title: "Pets",
                    subtitle: "Cabin-friendly",
                    value: pets,
                    min: 0,
                    max: 4,
                    onChange: setPets,
                  },
                ]}
              />
            </div>

            {/* SEARCH */}
            <button
              type="submit"
              className="group ml-auto mt-2 flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-neutral-950 px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 active:scale-[0.98] md:ml-2 md:mt-0"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2.25} />
              <span>Search Jets</span>
            </button>
          </div>
        ) : (
          /* MULTI LEG */
          <div className="flex flex-col gap-2">
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

            <div className="flex flex-col items-stretch gap-2 px-1 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={addLeg}
                className="inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-[12px] font-medium text-neutral-950 transition-colors hover:border-neutral-400 hover:bg-neutral-100"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add another leg
              </button>

              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <div className="min-w-[200px]">
                  <StepperField
                    icon={Users}
                    label="Passengers"
                    summary={passengersSummary}
                    items={[
                      {
                        key: "pax",
                        title: "Passengers",
                        subtitle: "Ages 2+",
                        value: passengers,
                        min: 1,
                        max: 19,
                        onChange: setPassengers,
                      },
                      {
                        key: "bags",
                        title: "Bags",
                        subtitle: "Standard checked",
                        value: bags,
                        min: 0,
                        max: 30,
                        onChange: setBags,
                      },
                      {
                        key: "pets",
                        title: "Pets",
                        subtitle: "Cabin-friendly",
                        value: pets,
                        min: 0,
                        max: 4,
                        onChange: setPets,
                      },
                    ]}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-neutral-950 px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 active:scale-[0.98]"
                >
                  <Search className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Search Jets
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

/* ---------- Multi-leg row ---------- */
function MultiLegRow({
  index,
  leg,
  onUpdate,
  onRemove,
  today,
}: {
  index: number;
  leg: { from: string; to: string; fromCode: string; toCode: string; date: string; time: string };
  onUpdate: (patch: Partial<{ from: string; to: string; fromCode: string; toCode: string; date: string; time: string }>) => void;
  onRemove?: () => void;
  today: string;
}) {
  const [fromQuery, setFromQuery] = useState(leg.from);
  const [toQuery, setToQuery] = useState(leg.to);

  useEffect(() => setFromQuery(leg.from), [leg.from]);
  useEffect(() => setToQuery(leg.to), [leg.to]);

  return (
    <div className="flex flex-col items-stretch gap-1 rounded-xl border border-neutral-200 bg-neutral-50/50 p-1 md:flex-row md:items-center">
      <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md font-mono text-[11px] uppercase tracking-widest text-neutral-500 md:ml-2">
        Leg {index + 1}
      </div>

      <AirportField
        label="From"
        placeholder="Departure city"
        value={fromQuery}
        onChange={(v) => {
          setFromQuery(v);
          if (!v) onUpdate({ from: "", fromCode: "" });
        }}
        onSelect={(a) => {
          onUpdate({ from: `${a.city} (${a.code})`, fromCode: a.code });
          setFromQuery(`${a.city} (${a.code})`);
        }}
      />

      <AirportField
        label="To"
        placeholder="Arrival city"
        value={toQuery}
        onChange={(v) => {
          setToQuery(v);
          if (!v) onUpdate({ to: "", toCode: "" });
        }}
        onSelect={(a) => {
          onUpdate({ to: `${a.city} (${a.code})`, toCode: a.code });
          setToQuery(`${a.city} (${a.code})`);
        }}
      />

      <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-neutral-50 md:max-w-[260px]">
        <Clock className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Date / Time
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              min={today}
              value={leg.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
              className={cn(
                "min-w-0 flex-1 bg-transparent text-[14px] font-medium text-neutral-950 outline-none",
                !leg.date && "text-neutral-400"
              )}
            />
            <input
              type="time"
              value={leg.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
              className={cn(
                "w-[78px] bg-transparent text-[14px] font-medium text-neutral-950 outline-none",
                !leg.time && "text-neutral-400"
              )}
            />
          </div>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove leg ${index + 1}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 md:mr-2"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
