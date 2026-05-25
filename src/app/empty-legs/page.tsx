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
  SlidersHorizontal,
} from "lucide-react";
import emptyLegsData from "@/data/empty-legs.json";
import { cn, formatCurrency } from "@/lib/utils";
import type { EmptyLeg } from "@/components/booking/empty-leg-card";

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
  { value: "price_asc", label: "Lowest Price" },
  { value: "price_desc", label: "Highest Price" },
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
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────────────── */}
      <div className="bg-[#07101e] px-4 py-2.5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
          Confirmed within 4 hours &nbsp;·&nbsp; 5,000+ airports worldwide &nbsp;·&nbsp; ARGUS Platinum safety
        </p>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#07101e] px-6 pb-16 pt-28 sm:px-8 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#c4a052]">
                Available Now
              </p>
              <h1
                className="font-serif font-bold uppercase leading-[0.92] text-white"
                style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", letterSpacing: "-0.03em" }}
              >
                Repositioning
                <br />
                Flights
              </h1>
              <p className="mt-4 max-w-md text-[14px] leading-[1.75] text-white/45">
                Aircraft repositioning to fill empty legs — book at a fraction of
                the charter rate with no membership required.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 text-center">
              <p
                className="font-serif font-bold uppercase leading-none text-white"
                style={{ fontSize: "3.5rem", letterSpacing: "-0.03em" }}
              >
                {allLegs.length}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
                Flights listed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-[#07101e]/08 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-[#07101e]/35" strokeWidth={1.75} />

            {/* From */}
            <div className="flex items-center gap-2 rounded-lg border border-[#07101e]/10 bg-[#f7f8fa] px-3 py-2">
              <PlaneTakeoff className="h-3.5 w-3.5 shrink-0 text-[#c4a052]" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="From city"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="w-24 bg-transparent font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e] outline-none placeholder:text-[#07101e]/35"
              />
              {fromFilter && (
                <button onClick={() => setFromFilter("")} type="button">
                  <X className="h-3 w-3 text-[#07101e]/35 hover:text-[#07101e]" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* To */}
            <div className="flex items-center gap-2 rounded-lg border border-[#07101e]/10 bg-[#f7f8fa] px-3 py-2">
              <PlaneTakeoff className="h-3.5 w-3.5 shrink-0 rotate-90 text-[#c4a052]" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="To city"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="w-24 bg-transparent font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e] outline-none placeholder:text-[#07101e]/35"
              />
              {toFilter && (
                <button onClick={() => setToFilter("")} type="button">
                  <X className="h-3 w-3 text-[#07101e]/35 hover:text-[#07101e]" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="hidden items-center gap-2 lg:flex">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategoryFilter(c.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                    categoryFilter === c.value
                      ? "bg-[#07101e] text-white"
                      : "border border-[#07101e]/10 text-[#07101e]/55 hover:border-[#07101e]/25"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Category select (mobile) */}
            <div className="relative lg:hidden">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none rounded-lg border border-[#07101e]/10 bg-[#f7f8fa] py-2 pl-3 pr-7 font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#07101e]/40" strokeWidth={2} />
            </div>

            {/* Sort */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-lg border border-[#07101e]/10 bg-[#f7f8fa] py-2 pl-3 pr-7 font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e] outline-none"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#07101e]/40" strokeWidth={2} />
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#07101e]/35">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>
      </div>

      {/* ── RESULTS ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center">
            <PlaneTakeoff className="h-10 w-10 text-[#07101e]/15" strokeWidth={1} />
            <h2
              className="mt-8 font-serif font-bold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "2rem", letterSpacing: "-0.025em" }}
            >
              No flights found
            </h2>
            <p className="mt-3 text-[14px] text-[#07101e]/45">
              Try adjusting your filters — inventory updates daily.
            </p>
            <button
              onClick={() => { setCategoryFilter("all"); setFromFilter(""); setToFilter(""); }}
              type="button"
              className="mt-8 rounded-lg border border-[#07101e]/15 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#07101e]/55 transition-all hover:border-[#07101e] hover:text-[#07101e]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((leg) => (
              <FlightCard
                key={leg.id}
                leg={leg as EmptyLeg & { category?: string }}
              />
            ))}
          </div>
        )}

        {/* Operator CTA */}
        <div className="mt-16 rounded-2xl bg-[#07101e] p-10 sm:p-14">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
                For Operators
              </p>
              <h2
                className="font-serif font-bold uppercase leading-tight text-white"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.025em" }}
              >
                Have an empty leg
                <br />
                to fill?
              </h2>
              <p className="mt-3 max-w-sm text-[13px] leading-[1.8] text-white/45">
                List repositioning flights and reach thousands of qualified charter
                clients. No commission on cancelled legs.
              </p>
            </div>
            <Link
              href="/operator/empty-legs"
              className="inline-flex items-center gap-2 rounded-lg bg-[#c4a052] px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e] transition-opacity hover:opacity-88 shrink-0"
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
      className="group rounded-xl border border-[#07101e]/08 bg-white p-6 shadow-sm transition-all hover:border-[#c4a052]/40 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <span
            className="font-serif font-bold uppercase leading-none text-[#07101e]"
            style={{ fontSize: "2rem", letterSpacing: "-0.025em" }}
          >
            {leg.from.code}
          </span>
          <span className="font-mono text-[11px] text-[#c4a052]">→</span>
          <span
            className="font-serif font-bold uppercase leading-none text-[#07101e]"
            style={{ fontSize: "2rem", letterSpacing: "-0.025em" }}
          >
            {leg.to.code}
          </span>
        </div>
        <span className="rounded-full bg-[#f4f7fc] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#07101e]/50">
          {leg.aircraft}
        </span>
      </div>

      {/* Cities */}
      <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#07101e]/40">
        {leg.from.city} to {leg.to.city}
      </p>

      {/* Meta */}
      <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#c4a052]" strokeWidth={1.75} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#07101e]/45">{when}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#c4a052]" strokeWidth={1.75} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#07101e]/45">{leg.departTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#c4a052]" strokeWidth={1.75} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#07101e]/45">{leg.capacity} seats</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex items-end justify-between border-t border-[#07101e]/06 pt-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#07101e]/28 line-through">
            {formatCurrency(leg.retailPrice)}
          </p>
          <p
            className="font-serif font-bold uppercase leading-none text-[#07101e]"
            style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}
          >
            {formatCurrency(leg.price)}
          </p>
        </div>
        <span className="rounded-lg bg-[#07101e] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors group-hover:bg-[#c4a052] group-hover:text-[#07101e]">
          Reserve
        </span>
      </div>
    </Link>
  );
}
