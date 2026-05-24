"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PlaneTakeoff,
  SlidersHorizontal,
  ArrowUpRight,
  X,
  Tag,
  ChevronDown,
  ArrowRight,
  Calendar,
  Clock,
  Users,
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
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount_desc", label: "Biggest Discount" },
];

export default function EmptyLegsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let legs = [...allLegs];

    if (categoryFilter !== "all") {
      legs = legs.filter((l) => (l as EmptyLeg & { category?: string }).category === categoryFilter);
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
        case "discount_desc":
          return b.discountPct - a.discountPct;
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    return legs;
  }, [categoryFilter, fromFilter, toFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--color-ivory)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-hairline)] bg-white">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8">
          <div className="mb-6 flex justify-center">
            <span className="chapter-rule">
              <span className="text-champagne">Live Inventory</span>
              <span className="text-[var(--color-muted)]">Repositioning Fleet</span>
            </span>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              Empty Legs,
              <br />
              <em className="display-serif-italic text-champagne">up to 75% off.</em>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.75] text-[var(--color-muted)]">
              Fixed-price one-way charter on returning aircraft. Book a
              deadhead repositioning flight at a fraction of the charter rate.
            </p>
          </div>

          {/* Stats band */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)]">
            <div className="flex flex-col items-center gap-1.5 bg-[var(--color-ivory)] px-6 py-5 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">Available now</span>
              <span className="font-serif text-[26px] leading-none text-[var(--color-ink)]">{allLegs.length}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 bg-[var(--color-ivory)] px-6 py-5 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">Avg. saving</span>
              <span className="font-serif text-[26px] leading-none text-[var(--color-ink)]">61%</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 bg-[var(--color-ivory)] px-6 py-5 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">Destinations</span>
              <span className="font-serif text-[26px] leading-none text-[var(--color-ink)]">Global</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-[var(--color-hairline)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* From */}
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5">
              <PlaneTakeoff className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Departing from"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="w-32 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-subtle)]"
              />
              {fromFilter && (
                <button onClick={() => setFromFilter("")}>
                  <X className="h-3 w-3 text-[var(--color-subtle)]" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* To */}
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5">
              <PlaneTakeoff className="h-3.5 w-3.5 rotate-90 text-champagne" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Arriving to"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="w-32 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-subtle)]"
              />
              {toFilter && (
                <button onClick={() => setToFilter("")}>
                  <X className="h-3 w-3 text-[var(--color-subtle)]" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5 pr-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--color-subtle)]" strokeWidth={2} />
            </div>

            {/* Sort */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5 pr-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--color-subtle)]" strokeWidth={2} />
            </div>

            {/* Result count */}
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              {filtered.length} {filtered.length === 1 ? "leg" : "legs"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center">
            <PlaneTakeoff className="h-10 w-10 text-[var(--color-bone)]" strokeWidth={1} />
            <h2 className="mt-6 font-serif text-[28px] text-[var(--color-ink)]">
              No empty legs found
            </h2>
            <p className="mt-3 text-[14px] text-[var(--color-muted)]">
              Try adjusting your filters or check back — inventory updates daily.
            </p>
            <button
              onClick={() => {
                setCategoryFilter("all");
                setFromFilter("");
                setToFilter("");
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-ink)] px-6 py-3 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-white"
            >
              Clear filters
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((leg) => (
              <EmptyLegCardFull key={leg.id} leg={leg as EmptyLeg & { category?: string }} />
            ))}
          </div>
        )}

        {/* Operator CTA */}
        <div className="mt-20 overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
          <div className="mesh-ink relative px-8 py-12 text-center md:px-16">
            <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              <span className="h-px w-6 bg-champagne/60" />
              For Operators
              <span className="h-px w-6 bg-champagne/60" />
            </span>
            <h2 className="display-serif-md mt-5 text-white">
              Have an empty leg
              <br />
              <em className="display-serif-italic text-champagne">to fill?</em>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[14px] leading-[1.8] text-white/70">
              List your repositioning flights on EXJET and reach thousands of
              qualified charter clients. No commission on cancelled legs.
            </p>
            <Link
              href="/operator/empty-legs"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:bg-champagne hover:text-white"
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

/* Full card used on this listing page */
function EmptyLegCardFull({ leg }: { leg: EmptyLeg & { category?: string } }) {
  const when = new Date(leg.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/booking?legId=${leg.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white p-6 transition-all duration-300 hover:border-champagne hover:shadow-[0_24px_50px_-20px_rgba(184,155,110,0.35)]"
    >
      {/* Discount + aircraft */}
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne/8 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
          <Tag className="h-3 w-3" strokeWidth={2} />
          {leg.discountPct}% off
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
          {leg.aircraft}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {leg.from.city}
          </p>
          <p className="mt-1 font-serif text-[38px] leading-none text-[var(--color-ink)]">
            {leg.from.code}
          </p>
        </div>
        <div className="relative mt-5 flex-1 self-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
          <PlaneTakeoff
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-champagne transition-transform duration-500 group-hover:translate-x-0"
            strokeWidth={1.5}
          />
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {leg.to.city}
          </p>
          <p className="mt-1 font-serif text-[38px] leading-none text-[var(--color-ink)]">
            {leg.to.code}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-5 grid grid-cols-3 gap-1 border-t border-[var(--color-hairline)] pt-4">
        <div className="flex items-center gap-1 text-[var(--color-muted)]">
          <Calendar className="h-3 w-3 shrink-0 text-champagne" strokeWidth={1.75} />
          <span className="text-[11px]">{when}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-muted)]">
          <Clock className="h-3 w-3 shrink-0 text-champagne" strokeWidth={1.75} />
          <span className="text-[11px]">{leg.departTime}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-muted)]">
          <Users className="h-3 w-3 shrink-0 text-champagne" strokeWidth={1.75} />
          <span className="text-[11px]">{leg.capacity} seats</span>
        </div>
      </div>

      {/* Price */}
      <div className="mt-5 flex items-end justify-between border-t border-[var(--color-hairline)] pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)] line-through">
            {formatCurrency(leg.retailPrice)}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-serif text-[28px] leading-none text-[var(--color-ink)]">
              {formatCurrency(leg.price)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne">
              flat
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink)] px-3.5 py-2 text-[12px] font-medium text-[var(--color-ink)] transition-all group-hover:bg-[var(--color-ink)] group-hover:text-white">
          Reserve
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
