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

    // Category filter from store or URL
    const activeCategories = categories.length > 0 ? categories : [];
    if (urlCategory && activeCategories.length === 0) {
      const catSlug = urlCategory.replace("-", "_");
      jets = jets.filter((jet) => jet.category === catSlug);
    } else if (activeCategories.length > 0) {
      jets = jets.filter((jet) => activeCategories.includes(jet.category));
    }

    // Price range filter
    if (priceMin != null) {
      jets = jets.filter((jet) => jet.hourlyRate >= priceMin);
    }
    if (priceMax != null) {
      jets = jets.filter((jet) => jet.hourlyRate <= priceMax);
    }

    // Passenger count filter
    const paxFilter = passengerCount ?? (urlPassengers ? Number(urlPassengers) : null);
    if (paxFilter != null && paxFilter > 0) {
      jets = jets.filter((jet) => jet.passengers >= paxFilter);
    }

    // Sort
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
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SearchBar variant="compact" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="h-5 w-5 text-amber-500" />
            <h1 className="text-lg font-semibold text-gray-900">
              <span className="text-amber-600">{filteredJets.length}</span>{" "}
              {filteredJets.length === 1 ? "jet" : "jets"} available
            </h1>
            {(urlFrom || urlTo) && (
              <span className="hidden text-sm text-gray-500 sm:inline">
                {urlFrom && urlTo
                  ? `${urlFrom} → ${urlTo}`
                  : urlFrom
                    ? `from ${urlFrom}`
                    : `to ${urlTo}`}
                {urlDate ? ` on ${urlDate}` : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy ?? "price_asc"}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 md:block"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="range">Range</option>
              <option value="speed">Speed</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
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
            {filteredJets.length > 0 ? (
              <JetGrid jets={filteredJets} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20">
                <Plane className="mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-700">No jets found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Slide-over */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm">
            <div className="relative flex w-full flex-col overflow-y-auto bg-white shadow-xl">
              <div className="p-4">
                <FilterSidebar className="border-0 shadow-none" onClose={() => setMobileFiltersOpen(false)} />
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="flex items-center gap-3 text-gray-500">
            <Plane className="h-5 w-5 animate-pulse" />
            <span className="text-sm">Loading search results...</span>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
