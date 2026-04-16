"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Plane } from "lucide-react";
import jetsData from "@/data/jets.json";
import FilterSidebar from "@/components/search/filter-sidebar";
import { JetGrid } from "@/components/jets/jet-grid";
import { useSearchStore } from "@/stores/search-store";
import SearchBar from "@/components/search/search-bar";
import type { Jet } from "@/types";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    categories,
    priceMin,
    priceMax,
    passengerCount,
    sortBy,
    setSortBy,
  } = useSearchStore();

  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");
  const urlDate = searchParams.get("date");
  const urlPassengers = searchParams.get("pax");
  const urlCategory = searchParams.get("category");

  const filteredJets = useMemo(() => {
    let jets = [...(jetsData as Jet[])];

    const activeCategories = categories.length > 0 ? categories : [];
    if (urlCategory && activeCategories.length === 0) {
      const catSlug = urlCategory.replace("-", "_");
      jets = jets.filter((jet) => jet.category === catSlug);
    } else if (activeCategories.length > 0) {
      jets = jets.filter((jet) => activeCategories.includes(jet.category));
    }

    if (priceMin != null) {
      jets = jets.filter((jet) => jet.hourlyRate >= priceMin);
    }
    if (priceMax != null) {
      jets = jets.filter((jet) => jet.hourlyRate <= priceMax);
    }

    const paxFilter = passengerCount ?? (urlPassengers ? Number(urlPassengers) : null);
    if (paxFilter != null && paxFilter > 0) {
      jets = jets.filter((jet) => jet.passengers >= paxFilter);
    }

    jets.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.hourlyRate - b.hourlyRate;
        case "price_desc":
          return b.hourlyRate - a.hourlyRate;
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "range":
          return (b.range ?? 0) - (a.range ?? 0);
        case "speed":
          return (b.speed ?? 0) - (a.speed ?? 0);
        default:
          return a.hourlyRate - b.hourlyRate;
      }
    });

    return jets;
  }, [categories, priceMin, priceMax, passengerCount, sortBy, urlPassengers, urlCategory]);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {/* Compact Search Bar */}
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <SearchBar variant="compact" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Results
            </span>
            <h1 className="text-[14px] font-medium text-neutral-950">
              <span className="text-neutral-950">{filteredJets.length}</span>{" "}
              <span className="text-neutral-600">
                {filteredJets.length === 1 ? "jet" : "jets"} available
              </span>
            </h1>
            {(urlFrom || urlTo) && (
              <span className="hidden truncate font-mono text-[11px] uppercase tracking-widest text-neutral-400 sm:inline">
                {urlFrom && urlTo
                  ? `${urlFrom} → ${urlTo}`
                  : urlFrom
                    ? `from ${urlFrom}`
                    : `to ${urlTo}`}
                {urlDate ? ` · ${urlDate}` : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy ?? "price_asc"}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[12px] text-neutral-950 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-400 md:block"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="range">Range</option>
              <option value="speed">Speed</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-[12px] font-medium text-neutral-950 transition-colors hover:border-neutral-400 hover:bg-neutral-100 lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
              Filters
            </button>
          </div>
        </div>

        {/* Two-column Layout */}
        <div className="flex gap-8">
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <JetGrid jets={filteredJets} dark />
          </div>
        </div>
      </div>

      {/* Mobile Filter Slide-over */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-white backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm">
            <div className="relative flex w-full flex-col overflow-y-auto bg-white">
              <div className="p-4">
                <FilterSidebar onClose={() => setMobileFiltersOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="flex items-center gap-3 text-neutral-500">
            <Plane className="h-5 w-5 animate-pulse" strokeWidth={1.5} />
            <span className="font-mono text-[11px] uppercase tracking-widest">
              Loading results
            </span>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
