"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, Minus, Plus } from "lucide-react";
import { cn, getCategoryLabel } from "@/lib/utils";
import { JetCategory } from "@/types";
import { useSearchStore } from "@/stores/search-store";

const JET_CATEGORIES: JetCategory[] = [
  "light",
  "midsize",
  "super_midsize",
  "heavy",
  "ultra_long",
];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "range", label: "Range" },
  { value: "speed", label: "Speed" },
] as const;

interface FilterSidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function FilterSidebar({ className, onClose }: FilterSidebarProps) {
  const {
    categories,
    toggleCategory,
    priceMin,
    priceMax,
    setPriceRange,
    passengerCount,
    setPassengerCount,
    sortBy,
    setSortBy,
    clearFilters,
  } = useSearchStore();

  const [sortOpen, setSortOpen] = useState(false);

  const activeFilterCount =
    categories.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0) +
    (passengerCount ? 1 : 0);

  return (
    <aside
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-white/50" strokeWidth={1.75} />
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-white/70">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-semibold text-black">
              {activeFilterCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Jet Category */}
      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Jet Category
        </h3>
        <div className="flex flex-col gap-1">
          {JET_CATEGORIES.map((category) => {
            const active = categories.includes(category);
            return (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    active
                      ? "border-white bg-white"
                      : "border-white/20 bg-transparent"
                  )}
                >
                  {active && (
                    <svg
                      className="h-3 w-3 text-black"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleCategory(category)}
                  className="sr-only"
                />
                <span className="text-[13px] text-white/80">
                  {getCategoryLabel(category)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.06]" />

      {/* Price Range */}
      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/30">
              $
            </span>
            <input
              type="number"
              placeholder="Min"
              value={priceMin ?? ""}
              onChange={(e) =>
                setPriceRange(
                  e.target.value ? Number(e.target.value) : null,
                  priceMax
                )
              }
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-6 pr-3 text-[13px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40"
            />
          </div>
          <span className="text-white/30">–</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/30">
              $
            </span>
            <input
              type="number"
              placeholder="Max"
              value={priceMax ?? ""}
              onChange={(e) =>
                setPriceRange(
                  priceMin,
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-6 pr-3 text-[13px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40"
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.06]" />

      {/* Passenger Count */}
      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Passengers
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setPassengerCount(Math.max(0, (passengerCount ?? 0) - 1) || null)
            }
            disabled={!passengerCount}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white transition-colors",
              !passengerCount
                ? "cursor-not-allowed opacity-30"
                : "hover:bg-white hover:text-black"
            )}
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <span className="min-w-[2rem] text-center text-[14px] font-semibold text-white">
            {passengerCount ?? "Any"}
          </span>
          <button
            onClick={() => setPassengerCount((passengerCount ?? 0) + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white hover:text-black"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.06]" />

      {/* Sort By */}
      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Sort By
        </h3>
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white transition-colors hover:border-white/20"
          >
            <span>
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ??
                "Price: Low to High"}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-white/40 transition-transform",
                sortOpen && "rotate-180"
              )}
              strokeWidth={2}
            />
          </button>
          {sortOpen && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-black/90 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              {SORT_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]",
                      sortBy === option.value
                        ? "font-medium text-white"
                        : "text-white/70"
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[12px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Clear Filters
        </button>
      )}
    </aside>
  );
}
