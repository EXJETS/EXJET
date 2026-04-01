"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
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
        "flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Jet Category */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Jet Category
        </h3>
        <div className="flex flex-col gap-2">
          {JET_CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <input
                type="checkbox"
                checked={categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 rounded border-zinc-300 text-amber-500 accent-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {getCategoryLabel(category)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Price Range */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Price Range
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
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
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-7 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <span className="text-sm text-zinc-400">&ndash;</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
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
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-7 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Passenger Count */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Passengers
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setPassengerCount(Math.max(0, (passengerCount ?? 0) - 1) || null)
            }
            disabled={!passengerCount}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500"
          >
            &minus;
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {passengerCount ?? "Any"}
          </span>
          <button
            onClick={() => setPassengerCount((passengerCount ?? 0) + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500"
          >
            +
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Sort By */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Sort By
        </h3>
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors hover:border-zinc-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <span>
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ??
                "Price: Low to High"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-zinc-400 transition-transform",
                sortOpen && "rotate-180"
              )}
            />
          </button>
          {sortOpen && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {SORT_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800",
                      sortBy === option.value
                        ? "font-medium text-amber-600 dark:text-amber-400"
                        : "text-zinc-700 dark:text-zinc-300"
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
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      )}
    </aside>
  );
}
