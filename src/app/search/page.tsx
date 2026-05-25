"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Plane, ChevronDown, ArrowLeft } from "lucide-react";
import jetsData from "@/data/jets.json";
import airportsData from "@/data/airports.json";
import FilterSidebar from "@/components/search/filter-sidebar";
import { JetGrid } from "@/components/jets/jet-grid";
import SearchBar from "@/components/search/search-bar";
import {
  calculateDistance,
  calculateFlightTime,
  getCategoryLabel,
} from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";
import type { Jet, Airport, JetCategory } from "@/types";

const allAirports = airportsData as Airport[];

function findAirport(code?: string | null): Airport | undefined {
  if (!code) return undefined;
  return allAirports.find((a) => a.code === code);
}

/** Maps route distance (nm) to the recommended aircraft category. */
function getDistanceCategory(nm: number): JetCategory {
  if (nm <= 750) return "light";
  if (nm <= 1500) return "midsize";
  if (nm <= 2500) return "super_midsize";
  if (nm <= 4000) return "heavy";
  return "ultra_long";
}

const ALL_CATEGORIES: JetCategory[] = [
  "light",
  "midsize",
  "super_midsize",
  "heavy",
  "ultra_long",
];

const CATEGORY_RANGE_LABEL: Record<JetCategory, string> = {
  light: "Up to 1,500 nm",
  midsize: "Up to 2,800 nm",
  super_midsize: "Up to 3,500 nm",
  heavy: "Up to 4,500 nm",
  ultra_long: "Up to 7,500 nm",
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { sortBy, setSortBy, priceMin, priceMax, passengerCount } = useSearchStore();

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

  // Auto-select category from distance; can be overridden by URL param
  const [selectedCategory, setSelectedCategory] = useState<JetCategory | "all">("all");

  useEffect(() => {
    if (urlCategory) {
      const normalized = urlCategory.replace("-", "_") as JetCategory;
      if (ALL_CATEGORIES.includes(normalized)) {
        setSelectedCategory(normalized);
        return;
      }
    }
    if (distanceNm) {
      setSelectedCategory(getDistanceCategory(distanceNm));
    } else {
      setSelectedCategory("all");
    }
  }, [urlCategory, distanceNm]);

  const filteredJets = useMemo(() => {
    let jets = [...(jetsData as Jet[])];

    if (selectedCategory !== "all") {
      jets = jets.filter((j) => j.category === selectedCategory);
    }

    if (priceMin != null) jets = jets.filter((j) => j.hourlyRate >= priceMin);
    if (priceMax != null) jets = jets.filter((j) => j.hourlyRate <= priceMax);

    const paxFilter = passengerCount ?? (urlPassengers ? Number(urlPassengers) : null);
    if (paxFilter && paxFilter > 0) {
      jets = jets.filter((j) => j.passengers >= paxFilter);
    }

    jets.sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.hourlyRate - b.hourlyRate;
        case "price_desc": return b.hourlyRate - a.hourlyRate;
        case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
        case "range": return (b.range ?? 0) - (a.range ?? 0);
        case "speed": return (b.speed ?? 0) - (a.speed ?? 0);
        default: return a.hourlyRate - b.hourlyRate;
      }
    });

    return jets;
  }, [selectedCategory, priceMin, priceMax, passengerCount, sortBy, urlPassengers]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  const routeLabel =
    fromAirport && toAirport
      ? `${fromAirport.city} → ${toAirport.city}`
      : urlFrom && urlTo
      ? `${urlFrom} → ${urlTo}`
      : null;

  return (
    <div className="min-h-screen bg-[#f5f3ef]">

      {/* Compact search bar */}
      <div className="border-b border-[#07101e]/08 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <SearchBar variant="compact" />
        </div>
      </div>

      {/* Route + category bar */}
      <div className="border-b border-[#07101e]/08 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">

          {/* Route */}
          {routeLabel && (
            <div className="flex items-center gap-2">
              <Plane className="h-3.5 w-3.5 text-[#07101e]/35" strokeWidth={1.75} />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e]/65">
                {routeLabel}
              </span>
              {distanceNm && (
                <span className="font-mono text-[10px] text-[#07101e]/35">
                  · {distanceNm.toLocaleString()} nm · ~{calculateFlightTime(distanceNm, 470)}
                </span>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Category selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center gap-2 rounded-full border border-[#07101e]/15 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e] shadow-sm transition-colors hover:border-[#07101e]/30"
            >
              {selectedCategory === "all" ? "All Aircraft" : getCategoryLabel(selectedCategory)}
              <ChevronDown
                className={`h-3.5 w-3.5 text-[#07101e]/40 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                strokeWidth={2}
              />
            </button>

            {categoryOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#07101e]/10 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => { setSelectedCategory("all"); setCategoryOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.15em] transition-colors hover:bg-[#f5f3ef] ${selectedCategory === "all" ? "text-[#07101e] font-bold" : "text-[#07101e]/60"}`}
                >
                  All Aircraft
                </button>
                {ALL_CATEGORIES.map((cat) => {
                  const isRecommended = distanceNm != null && getDistanceCategory(distanceNm) === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                      className={`flex w-full items-start justify-between px-4 py-3 text-left transition-colors hover:bg-[#f5f3ef] ${selectedCategory === cat ? "bg-[#f0ede6]" : ""}`}
                    >
                      <div>
                        <p className={`font-mono text-[11px] uppercase tracking-[0.15em] ${selectedCategory === cat ? "text-[#07101e] font-bold" : "text-[#07101e]/70"}`}>
                          {getCategoryLabel(cat)}
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] text-[#07101e]/38">
                          {CATEGORY_RANGE_LABEL[cat]}
                        </p>
                      </div>
                      {isRecommended && (
                        <span className="ml-2 mt-0.5 rounded bg-[#c4a052] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em] text-[#07101e]">
                          Rec.
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy ?? "price_asc"}
            onChange={(e) => setSortBy(e.target.value)}
            className="hidden rounded-full border border-[#07101e]/15 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e] shadow-sm outline-none transition-colors hover:border-[#07101e]/30 md:block"
          >
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="range">Longest Range</option>
            <option value="speed">Fastest</option>
          </select>

          {/* Filters (mobile) */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#07101e]/15 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e] shadow-sm lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
            Filters
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Result count */}
        <div className="mb-6 flex items-center gap-3">
          <h1 className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#07101e]/55">
            {filteredJets.length} {filteredJets.length === 1 ? "aircraft" : "aircraft"} available
          </h1>
          {selectedCategory !== "all" && (
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#07101e]/35">
              · {getCategoryLabel(selectedCategory)}
            </span>
          )}
          {distanceNm && (
            <span className="ml-auto font-mono text-[10px] text-[#07101e]/30">
              Category selected for {distanceNm.toLocaleString()} nm route
            </span>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filter sidebar */}
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Jet grid */}
          <div className="min-w-0 flex-1">
            <JetGrid jets={filteredJets} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Slide-over */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#07101e]/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white">
            <div className="p-4">
              <FilterSidebar onClose={() => setMobileFiltersOpen(false)} />
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
        <div className="flex min-h-screen items-center justify-center bg-[#f5f3ef]">
          <div className="flex items-center gap-3 text-[#07101e]/40">
            <Plane className="h-5 w-5 animate-pulse" strokeWidth={1.5} />
            <span className="font-mono text-[11px] uppercase tracking-widest">Loading</span>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
