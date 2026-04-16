"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Plane, ArrowLeft } from "lucide-react";
import jetsData from "@/data/jets.json";
import airportsData from "@/data/airports.json";
import FilterSidebar from "@/components/search/filter-sidebar";
import { JetGrid } from "@/components/jets/jet-grid";
import { CategoryGrid } from "@/components/search/category-grid";
import { useSearchStore } from "@/stores/search-store";
import SearchBar from "@/components/search/search-bar";
import {
  calculateDistance,
  calculateFlightTime,
  getCategoryLabel,
} from "@/lib/utils";
import type { Jet, Airport, JetCategory } from "@/types";

const allAirports = airportsData as Airport[];

function findAirport(code?: string | null): Airport | undefined {
  if (!code) return undefined;
  return allAirports.find((a) => a.code === code);
}

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

  const fromAirport = findAirport(urlFrom);
  const toAirport = findAirport(urlTo);

  const distanceNm = useMemo(() => {
    if (!fromAirport || !toAirport) return null;
    return calculateDistance(
      fromAirport.lat,
      fromAirport.lng,
      toAirport.lat,
      toAirport.lng
    );
  }, [fromAirport, toAirport]);

  // Determine which category (if any) is currently selected — drives view mode.
  const selectedCategory = useMemo<JetCategory | null>(() => {
    if (categories.length === 1) return categories[0];
    if (urlCategory && !categories.length) {
      const normalized = urlCategory.replace("-", "_") as JetCategory;
      const valid: JetCategory[] = [
        "light",
        "midsize",
        "super_midsize",
        "heavy",
        "ultra_long",
      ];
      return valid.includes(normalized) ? normalized : null;
    }
    return null;
  }, [categories, urlCategory]);

  const showCategories = !selectedCategory;

  const filteredJets = useMemo(() => {
    let jets = [...(jetsData as Jet[])];

    if (selectedCategory) {
      jets = jets.filter((jet) => jet.category === selectedCategory);
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
  }, [selectedCategory, priceMin, priceMax, passengerCount, sortBy, urlPassengers]);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  // Build the href base used for category drill-in (preserve route params).
  const hrefBase = useMemo(() => {
    const params = new URLSearchParams();
    if (urlFrom) params.set("from", urlFrom);
    if (urlTo) params.set("to", urlTo);
    if (urlDate) params.set("date", urlDate);
    if (urlPassengers) params.set("pax", urlPassengers);
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  }, [urlFrom, urlTo, urlDate, urlPassengers]);

  // "Back to categories" href (drops category param).
  const backHref = hrefBase;

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {/* Compact Search Bar */}
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <SearchBar variant="compact" />
        </div>
      </div>

      {/* Route summary strip */}
      {(fromAirport || toAirport || distanceNm) && (
        <div className="border-b border-neutral-200 bg-neutral-50/50">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                Route
              </span>
              <span className="font-medium text-neutral-950">
                {fromAirport ? `${fromAirport.city} (${fromAirport.code})` : urlFrom}
                {" → "}
                {toAirport ? `${toAirport.city} (${toAirport.code})` : urlTo}
              </span>
            </div>
            {distanceNm && (
              <div className="flex items-center gap-2 text-[13px]">
                <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                  Distance
                </span>
                <span className="font-medium text-neutral-950">
                  {distanceNm.toLocaleString()} nm
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  · ~{calculateFlightTime(distanceNm, 470)} avg
                </span>
              </div>
            )}
            {urlDate && (
              <div className="flex items-center gap-2 text-[13px]">
                <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                  Date
                </span>
                <span className="font-medium text-neutral-950">{urlDate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {showCategories ? (
              <>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  Step 1 / 2
                </span>
                <h1 className="text-[15px] font-medium text-neutral-950">
                  Choose your aircraft category
                </h1>
              </>
            ) : (
              <>
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[12px] font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950"
                >
                  <ArrowLeft className="h-3 w-3" strokeWidth={2} />
                  Categories
                </Link>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                  {getCategoryLabel(selectedCategory)}
                </span>
                <h1 className="text-[14px] font-medium text-neutral-950">
                  <span className="text-neutral-950">{filteredJets.length}</span>{" "}
                  <span className="text-neutral-600">
                    {filteredJets.length === 1 ? "aircraft" : "aircraft"} available
                  </span>
                </h1>
              </>
            )}
          </div>

          {!showCategories && (
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
          )}
        </div>

        {showCategories ? (
          <div>
            {distanceNm && (
              <p className="mb-6 max-w-2xl text-[13px] text-neutral-600">
                We&apos;ve highlighted the categories best suited for your{" "}
                <span className="font-medium text-neutral-950">
                  {distanceNm.toLocaleString()} nm
                </span>{" "}
                flight. You can still pick any category — pricing and availability shown live.
              </p>
            )}
            <CategoryGrid routeDistanceNm={distanceNm} hrefBase={hrefBase} />
          </div>
        ) : (
          /* Two-column Layout */
          <div className="flex gap-8">
            <div className="hidden w-72 shrink-0 lg:block">
              <div className="sticky top-24">
                <FilterSidebar />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <JetGrid jets={filteredJets} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Slide-over */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
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
