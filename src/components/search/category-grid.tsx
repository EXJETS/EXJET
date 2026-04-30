"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Gauge, MapPin, CheckCircle2 } from "lucide-react";
import jetsData from "@/data/jets.json";
import { cn, formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Jet, JetCategory } from "@/types";

interface CategoryGridProps {
  /** Optional flight distance in nm — used to flag recommended categories. */
  routeDistanceNm?: number | null;
  /** Pre-built href base, e.g. "/search?from=KTEB&to=KVNY". Category will be appended. */
  hrefBase: string;
}

interface CategoryMeta {
  key: JetCategory;
  tagline: string;
  minRangeNm: number;
  maxRangeNm: number;
  image?: string;
  featuredAircraft?: string;
}

const CATEGORY_META: CategoryMeta[] = [
  {
    key: "light",
    tagline: "Short hops, fastest turnaround",
    minRangeNm: 0,
    maxRangeNm: 1500,
  },
  {
    key: "midsize",
    tagline: "Coast-to-coast comfort",
    minRangeNm: 1200,
    maxRangeNm: 2500,
  },
  {
    key: "super_midsize",
    tagline: "Range with stand-up cabin",
    minRangeNm: 2200,
    maxRangeNm: 3500,
  },
  {
    key: "heavy",
    tagline: "Long range, full galley",
    minRangeNm: 3000,
    maxRangeNm: 5000,
    image: "/jets/global-5500.png",
    featuredAircraft: "Global 5500",
  },
  {
    key: "ultra_long",
    tagline: "Intercontinental, non-stop",
    minRangeNm: 5000,
    maxRangeNm: 8000,
    featuredAircraft: "Global 7500",
  },
];

const allJets = jetsData as Jet[];

function aggregate(category: JetCategory) {
  const jets = allJets.filter((j) => j.category === category);
  if (!jets.length) {
    return null;
  }
  const passengersMin = Math.min(...jets.map((j) => j.passengers));
  const passengersMax = Math.max(...jets.map((j) => j.passengers));
  const rangeMin = Math.min(...jets.map((j) => j.range));
  const rangeMax = Math.max(...jets.map((j) => j.range));
  const speedAvg = Math.round(
    jets.reduce((sum, j) => sum + j.speed, 0) / jets.length
  );
  const fromPrice = Math.min(...jets.map((j) => j.hourlyRate));
  const sample = jets.slice(0, 3).map((j) => j.name);
  return {
    count: jets.length,
    passengersMin,
    passengersMax,
    rangeMin,
    rangeMax,
    speedAvg,
    fromPrice,
    sample,
  };
}

export function CategoryGrid({ routeDistanceNm, hrefBase }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {CATEGORY_META.map((meta) => {
        const stats = aggregate(meta.key);
        if (!stats) return null;
        const isRecommended =
          routeDistanceNm != null &&
          routeDistanceNm >= meta.minRangeNm &&
          routeDistanceNm <= meta.maxRangeNm;

        const sep = hrefBase.includes("?") ? "&" : "?";
        const href = `${hrefBase}${sep}category=${meta.key}`;

        return (
          <Link
            key={meta.key}
            href={href}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:bg-[var(--color-ivory)]",
              isRecommended
                ? "border-[var(--color-champagne)] ring-1 ring-[var(--color-champagne)]"
                : "border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]"
            )}
          >
            {/* Jet image banner */}
            {meta.image && (
              <div className="relative h-36 w-full overflow-hidden bg-[var(--color-ivory-deep)]">
                <Image
                  src={meta.image}
                  alt={meta.featuredAircraft ?? getCategoryLabel(meta.key)}
                  fill
                  className="object-contain object-center py-3 transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            )}

            <div className="flex flex-col flex-1 p-6">
              {isRecommended && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[var(--color-champagne)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
                  <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                  Recommended
                </span>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">
                    Category
                  </span>
                  <h3 className="mt-1 text-[20px] font-semibold tracking-tight text-[var(--color-ink)]">
                    {getCategoryLabel(meta.key)}
                  </h3>
                  {meta.featuredAircraft && (
                    <p className="mt-0.5 font-serif italic text-[14px] text-champagne">
                      {meta.featuredAircraft}
                    </p>
                  )}
                  <p className="mt-1 text-[13px] text-[var(--color-muted)]">
                    {meta.tagline}
                  </p>
                </div>
              </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--color-hairline)] pt-4 text-[12px]">
              <Stat
                icon={Users}
                label="Pax"
                value={`${stats.passengersMin}-${stats.passengersMax}`}
              />
              <Stat
                icon={MapPin}
                label="Range"
                value={`${stats.rangeMin.toLocaleString()}-${stats.rangeMax.toLocaleString()} nm`}
              />
              <Stat
                icon={Gauge}
                label="Speed"
                value={`${stats.speedAvg} kt`}
              />
            </div>

            <div className="mt-4 border-t border-[var(--color-hairline)] pt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">
                Available aircraft
              </div>
              <div className="mt-1 text-[12px] text-[var(--color-ink-soft)]">
                {stats.sample.join(" · ")}
                {stats.count > 3 && (
                  <span className="text-[var(--color-muted)]"> + {stats.count - 3} more</span>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between border-t border-[var(--color-hairline)] pt-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">
                  From
                </span>
                <div className="text-[18px] font-semibold text-[var(--color-ink)]">
                  {formatCurrency(stats.fromPrice)}
                  <span className="ml-1 font-mono text-[11px] font-normal text-[var(--color-muted)]">
                    /hr
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-champagne)] px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors group-hover:opacity-90">
                Select
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </span>
            </div>
            </div>{/* end p-6 wrapper */}
          </Link>
        );
      })}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-subtle)]">
        <Icon className="h-3 w-3" strokeWidth={1.75} />
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-medium text-[var(--color-ink)]">
        {value}
      </div>
    </div>
  );
}
