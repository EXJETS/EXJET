"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PlaneTakeoff,
  X,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import emptyLegsData from "@/data/empty-legs.json";
import { cn, formatCurrency } from "@/lib/utils";
import type { EmptyLeg } from "@/components/booking/empty-leg-card";

const NAVY = "#07101e";
const GOLD = "#c4a052";
const CREAM = "#f0ebe0";

const allLegs = emptyLegsData as EmptyLeg[];

const CATEGORIES = [
  { value: "all", label: "All Types" },
  { value: "light", label: "Light Jet" },
  { value: "midsize", label: "Midsize" },
  { value: "super_midsize", label: "Super Midsize" },
  { value: "heavy", label: "Heavy Jet" },
  { value: "ultra_long", label: "Ultra Long Range" },
];

const SORT_OPTIONS = [
  { value: "date_asc", label: "Soonest Departure" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function EmptyLegsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_asc");

  const filtered = useMemo(() => {
    let legs = [...allLegs];

    if (categoryFilter !== "all") {
      legs = legs.filter(
        (l) => (l as EmptyLeg & { category?: string }).category === categoryFilter
      );
    }

    if (fromFilter.trim()) {
      const q = fromFilter.toLowerCase();
      legs = legs.filter(
        (l) =>
          l.from.city.toLowerCase().includes(q) ||
          l.from.code.toLowerCase().includes(q)
      );
    }

    if (toFilter.trim()) {
      const q = toFilter.toLowerCase();
      legs = legs.filter(
        (l) =>
          l.to.city.toLowerCase().includes(q) ||
          l.to.code.toLowerCase().includes(q)
      );
    }

    legs.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    return legs;
  }, [categoryFilter, fromFilter, toFilter, sortBy]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="mx-auto max-w-7xl px-8 pb-20 pt-36 sm:px-14 lg:pt-44">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="h-px w-10 shrink-0" style={{ backgroundColor: GOLD }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
                  Repositioning Flights
                </span>
              </div>
              <h1
                className="font-serif font-bold uppercase leading-[0.88] text-white"
                style={{ fontSize: "clamp(3.5rem, 9vw, 9rem)", letterSpacing: "-0.03em" }}
              >
                Available
                <br />
                <em className="not-italic" style={{ color: GOLD }}>Now</em>
                <br />
                Departures
              </h1>
            </div>

            <div>
              <p
                className="font-serif font-bold uppercase leading-none text-white"
                style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em" }}
              >
                {allLegs.length}
              </p>
              <p
                className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                Flights listed
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="mt-16 flex flex-wrap gap-x-12 gap-y-4 border-t pt-10"
            style={{ borderColor: "rgba(255,255,255,0.10)" }}
          >
            {[
              ["5,000+", "Airports"],
              ["2,400+", "Aircraft"],
              ["< 4 hrs", "Avg. confirmation"],
              ["ARGUS Platinum", "Safety standard"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="flex items-baseline gap-2.5">
                <span
                  className="font-serif font-bold uppercase leading-none text-white"
                  style={{ fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                >
                  {val}
                </span>
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.22em]"
                  style={{ color: "rgba(255,255,255,0.30)" }}
                >
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ───────────────────────────────────────────────── */}
      <div
        className="sticky top-16 z-30 border-b bg-white"
        style={{ borderColor: "rgba(7,16,30,0.10)" }}
      >
        <div className="mx-auto max-w-7xl px-8 py-3 sm:px-14">
          <div className="flex flex-wrap items-center gap-3">

            {/* From */}
            <div
              className="flex items-center gap-2 border px-4 py-2.5"
              style={{ borderColor: "rgba(7,16,30,0.12)" }}
            >
              <PlaneTakeoff
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: GOLD }}
                strokeWidth={1.75}
              />
              <input
                type="text"
                placeholder="Departing from"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="w-32 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] outline-none placeholder:text-neutral-400"
                style={{ color: NAVY }}
              />
              {fromFilter && (
                <button onClick={() => setFromFilter("")} type="button">
                  <X className="h-3 w-3 text-neutral-400 hover:text-neutral-700" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* To */}
            <div
              className="flex items-center gap-2 border px-4 py-2.5"
              style={{ borderColor: "rgba(7,16,30,0.12)" }}
            >
              <PlaneTakeoff
                className="h-3.5 w-3.5 shrink-0 rotate-90"
                style={{ color: GOLD }}
                strokeWidth={1.75}
              />
              <input
                type="text"
                placeholder="Arriving to"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="w-32 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] outline-none placeholder:text-neutral-400"
                style={{ color: NAVY }}
              />
              {toFilter && (
                <button onClick={() => setToFilter("")} type="button">
                  <X className="h-3 w-3 text-neutral-400 hover:text-neutral-700" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none border bg-white px-4 py-2.5 pr-8 font-mono text-[11px] uppercase tracking-[0.18em] outline-none"
                style={{ borderColor: "rgba(7,16,30,0.12)", color: NAVY }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400"
                strokeWidth={2}
              />
            </div>

            {/* Sort */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none border bg-white px-4 py-2.5 pr-8 font-mono text-[11px] uppercase tracking-[0.18em] outline-none"
                style={{ borderColor: "rgba(7,16,30,0.12)", color: NAVY }}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400"
                strokeWidth={2}
              />
            </div>

            <span
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "rgba(7,16,30,0.38)" }}
            >
              {filtered.length} {filtered.length === 1 ? "leg" : "legs"}
            </span>
          </div>
        </div>
      </div>

      {/* ── CARDS ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-8 py-16 sm:px-14">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center">
            <PlaneTakeoff
              className="h-10 w-10"
              style={{ color: "rgba(7,16,30,0.18)" }}
              strokeWidth={1}
            />
            <h2
              className="mt-8 font-serif font-bold uppercase leading-none"
              style={{ fontSize: "2rem", letterSpacing: "-0.02em", color: NAVY }}
            >
              No flights found
            </h2>
            <p
              className="mt-4 text-[14px]"
              style={{ color: "rgba(7,16,30,0.45)" }}
            >
              Adjust your filters or check back — inventory updates daily.
            </p>
            <button
              onClick={() => { setCategoryFilter("all"); setFromFilter(""); setToFilter(""); }}
              type="button"
              className="mt-8 inline-flex items-center gap-2 border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-all hover:opacity-70"
              style={{ borderColor: NAVY, color: NAVY }}
            >
              Clear filters
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2" style={{ backgroundColor: "rgba(7,16,30,0.08)" }}>
            {filtered.map((leg) => (
              <FlightCard
                key={leg.id}
                leg={leg as EmptyLeg & { category?: string }}
              />
            ))}
          </div>
        )}

        {/* Operator CTA */}
        <div
          className="mt-20 px-10 py-14 lg:px-16"
          style={{ backgroundColor: NAVY }}
        >
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <div className="mb-4 h-px w-10" style={{ backgroundColor: GOLD }} />
              <h2
                className="font-serif font-bold uppercase leading-tight text-white"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
              >
                Have an empty leg
                <br />
                to fill?
              </h2>
              <p
                className="mt-4 max-w-sm text-[14px] leading-[1.85]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                List repositioning flights on EXJET and reach qualified
                charter clients. No commission on cancelled legs.
              </p>
            </div>
            <Link
              href="/operator/empty-legs"
              className="inline-flex items-center gap-2.5 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] transition-opacity hover:opacity-85"
              style={{ backgroundColor: GOLD, color: "#07101e" }}
            >
              Post an empty leg
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Flight card ─────────────────────────────────────────────────────── */
function FlightCard({ leg }: { leg: EmptyLeg & { category?: string } }) {
  const when = new Date(leg.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/booking?legId=${leg.id}`}
      className="group flex flex-col justify-between bg-white p-8 transition-colors hover:bg-[#faf8f4]"
    >
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: GOLD }}
        >
          Repositioning
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(7,16,30,0.38)" }}
        >
          {leg.aircraft}
        </span>
      </div>

      {/* IATA route */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "rgba(7,16,30,0.38)" }}
          >
            {leg.from.city}
          </p>
          <p
            className="mt-1 font-serif font-bold uppercase leading-none"
            style={{ fontSize: "3rem", letterSpacing: "-0.025em", color: NAVY }}
          >
            {leg.from.code}
          </p>
        </div>

        <div className="relative mt-7 flex-1 self-center">
          <div
            className="h-px w-full"
            style={{ backgroundColor: `${GOLD}40` }}
          />
          <PlaneTakeoff
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:translate-x-1"
            style={{ color: GOLD }}
            strokeWidth={1.5}
          />
        </div>

        <div className="text-right">
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "rgba(7,16,30,0.38)" }}
          >
            {leg.to.city}
          </p>
          <p
            className="mt-1 font-serif font-bold uppercase leading-none"
            style={{ fontSize: "3rem", letterSpacing: "-0.025em", color: NAVY }}
          >
            {leg.to.code}
          </p>
        </div>
      </div>

      {/* Meta strip */}
      <div
        className="mt-8 flex gap-6 border-t pt-6"
        style={{ borderColor: "rgba(7,16,30,0.08)" }}
      >
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} strokeWidth={1.75} />
          <span className="text-[12px]" style={{ color: "rgba(7,16,30,0.50)" }}>{when}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} strokeWidth={1.75} />
          <span className="text-[12px]" style={{ color: "rgba(7,16,30,0.50)" }}>{leg.departTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} strokeWidth={1.75} />
          <span className="text-[12px]" style={{ color: "rgba(7,16,30,0.50)" }}>{leg.capacity} seats</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div
        className="mt-6 flex items-end justify-between border-t pt-6"
        style={{ borderColor: "rgba(7,16,30,0.08)" }}
      >
        <div>
          <p
            className="font-mono text-[10px] line-through"
            style={{ color: "rgba(7,16,30,0.28)" }}
          >
            {formatCurrency(leg.retailPrice)}
          </p>
          <p
            className="mt-0.5 font-serif font-bold uppercase leading-none"
            style={{ fontSize: "1.85rem", letterSpacing: "-0.025em", color: NAVY }}
          >
            {formatCurrency(leg.price)}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all group-hover:opacity-70"
          style={{ borderColor: NAVY, color: NAVY }}
        >
          Reserve
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
