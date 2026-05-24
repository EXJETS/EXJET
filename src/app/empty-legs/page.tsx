"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PlaneTakeoff,
  X,
  ChevronDown,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  ArrowUpRight,
  Tag,
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
      {/* ============================================================
          HERO — Full-width navy banner
          ============================================================ */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(26,95,168,0.30), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">
                  Live Inventory
                </span>
              </div>
              <h1
                className="font-serif font-semibold uppercase text-white"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 6rem)",
                  lineHeight: "0.94",
                  letterSpacing: "-0.02em",
                }}
              >
                Live Empty Leg
                <br />
                Inventory
              </h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center rounded-full border border-[var(--color-champagne)]/40 bg-[var(--color-champagne)]/15 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-champagne)]">
                {allLegs.length} legs available
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
                Up to 75% off charter rate
              </span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
            <div className="flex flex-col items-center gap-1.5 bg-white/5 px-6 py-6 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                Available Now
              </span>
              <span className="font-serif text-[2rem] font-semibold leading-none text-white">
                {allLegs.length}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 bg-white/5 px-6 py-6 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                Avg. Saving
              </span>
              <span className="font-serif text-[2rem] font-semibold leading-none text-white">
                61%
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 bg-white/5 px-6 py-6 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                Destinations
              </span>
              <span className="font-serif text-[2rem] font-semibold leading-none text-white">
                Global
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FILTER BAR — White, sticky
          ============================================================ */}
      <div className="sticky top-16 z-30 border-b border-[var(--color-hairline)] bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* From */}
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5">
              <PlaneTakeoff
                className="h-3.5 w-3.5 shrink-0 text-[var(--color-champagne)]"
                strokeWidth={1.75}
              />
              <input
                type="text"
                placeholder="Departing from"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="w-32 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-subtle)]"
              />
              {fromFilter && (
                <button onClick={() => setFromFilter("")} type="button">
                  <X
                    className="h-3 w-3 text-[var(--color-subtle)] hover:text-[var(--color-ink)]"
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>

            {/* To */}
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5">
              <PlaneTakeoff
                className="h-3.5 w-3.5 shrink-0 rotate-90 text-[var(--color-champagne)]"
                strokeWidth={1.75}
              />
              <input
                type="text"
                placeholder="Arriving to"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="w-32 bg-transparent font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-subtle)]"
              />
              {toFilter && (
                <button onClick={() => setToFilter("")} type="button">
                  <X
                    className="h-3 w-3 text-[var(--color-subtle)] hover:text-[var(--color-ink)]"
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5 pr-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--color-subtle)]"
                strokeWidth={2}
              />
            </div>

            {/* Sort — pushed right */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-lg border border-[var(--color-hairline)] bg-[var(--color-ivory)] px-4 py-2.5 pr-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] outline-none"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--color-subtle)]"
                strokeWidth={2}
              />
            </div>

            {/* Count */}
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              {filtered.length} {filtered.length === 1 ? "leg" : "legs"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          GRID
          ============================================================ */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center">
            <PlaneTakeoff
              className="h-10 w-10 text-[var(--color-bone)]"
              strokeWidth={1}
            />
            <h2 className="mt-6 font-serif text-[1.75rem] font-semibold uppercase leading-none tracking-tight text-[var(--color-ink)]">
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
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded border border-[var(--color-ink)] px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-white"
            >
              Clear filters
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {filtered.map((leg) => (
              <EmptyLegCardFull
                key={leg.id}
                leg={leg as EmptyLeg & { category?: string }}
              />
            ))}
          </div>
        )}

        {/* Operator CTA */}
        <div className="mt-20 overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ink)]">
          <div
            className="relative px-8 py-14 text-center md:px-16"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(26,95,168,0.30), transparent 60%)",
            }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-champagne)]">
              For Operators
            </span>
            <h2
              className="mt-5 font-serif font-semibold uppercase text-white"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                lineHeight: "0.98",
                letterSpacing: "-0.015em",
              }}
            >
              Have an empty leg to fill?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[14px] leading-[1.8] text-white/60">
              List your repositioning flights on EXJET and reach thousands of
              qualified charter clients. No commission on cancelled legs.
            </p>
            <Link
              href="/operator/empty-legs"
              className="mt-8 inline-flex items-center gap-2 rounded bg-white px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-colors hover:bg-white/90"
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

/* ------------------------------------------------------------------ */
/* Full card                                                            */
/* ------------------------------------------------------------------ */

function EmptyLegCardFull({ leg }: { leg: EmptyLeg & { category?: string } }) {
  const when = new Date(leg.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/booking?legId=${leg.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white p-7 transition-all duration-200 hover:border-[var(--color-champagne)] hover:shadow-[0_20px_50px_-16px_rgba(26,95,168,0.25)]"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded border border-[var(--color-champagne)]/30 bg-[var(--color-champagne)]/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-champagne)]">
          <Tag className="h-3 w-3" strokeWidth={2} />
          {leg.discountPct}% off
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
          {leg.aircraft}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {leg.from.city}
          </p>
          <p className="mt-1 font-serif text-[2.5rem] font-semibold leading-none text-[var(--color-ink)]">
            {leg.from.code}
          </p>
        </div>
        <div className="relative mt-6 flex-1 self-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-champagne)]/50 to-transparent" />
          <PlaneTakeoff
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-[var(--color-champagne)] transition-transform duration-500 group-hover:translate-x-0"
            strokeWidth={1.5}
          />
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {leg.to.city}
          </p>
          <p className="mt-1 font-serif text-[2.5rem] font-semibold leading-none text-[var(--color-ink)]">
            {leg.to.code}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--color-hairline)] pt-5">
        <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
          <Calendar
            className="h-3.5 w-3.5 shrink-0 text-[var(--color-champagne)]"
            strokeWidth={1.75}
          />
          <span className="text-[12px]">{when}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
          <Clock
            className="h-3.5 w-3.5 shrink-0 text-[var(--color-champagne)]"
            strokeWidth={1.75}
          />
          <span className="text-[12px]">{leg.departTime}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
          <Users
            className="h-3.5 w-3.5 shrink-0 text-[var(--color-champagne)]"
            strokeWidth={1.75}
          />
          <span className="text-[12px]">{leg.capacity} seats</span>
        </div>
      </div>

      {/* Price */}
      <div className="mt-5 flex items-end justify-between border-t border-[var(--color-hairline)] pt-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)] line-through">
            {formatCurrency(leg.retailPrice)}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-serif text-[1.75rem] font-semibold leading-none text-[var(--color-ink)]">
              {formatCurrency(leg.price)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-champagne)]">
              flat
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded border border-[var(--color-ink)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-all group-hover:border-[var(--color-champagne)] group-hover:bg-[var(--color-champagne)] group-hover:text-white">
          Reserve
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
