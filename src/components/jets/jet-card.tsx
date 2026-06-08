"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Users,
  Gauge,
  Navigation,
  ArrowUpRight,
} from "lucide-react";
import { cn, formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Jet } from "@/types";

const CATEGORY_GRADIENTS: Record<string, string> = {
  light:        "from-slate-600 to-slate-800",
  midsize:      "from-[#0d1f3c] to-[#162a50]",
  super_midsize:"from-[#091a35] to-[#0f2545]",
  heavy:        "from-[#071020] to-[#0a1a38]",
  ultra_long:   "from-[#050e1a] to-[#0a1830]",
};

interface JetCardProps {
  jet: Jet;
  dark?: boolean;
}

export function JetCard({ jet, dark = false }: JetCardProps) {
  const [imgError, setImgError] = useState(false);
  const gradient = CATEGORY_GRADIENTS[jet.category] ?? "from-[#0d1f3c] to-[#162a50]";
  const photo = !imgError && jet.images?.[0] ? jet.images[0] : null;

  return (
    <Link href={`/jets/${jet.id}`} className="block group">
      <article
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all duration-300",
          dark
            ? "border-neutral-200 bg-white hover:border-neutral-300"
            : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
        )}
      >
        {/* Image / gradient area */}
        <div className={cn("relative aspect-[16/10] overflow-hidden bg-gradient-to-br", gradient)}>
          {photo ? (
            <img
              src={photo}
              alt={jet.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            /* Plane SVG silhouette */
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 120 60"
                className="h-20 w-40 opacity-20 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-1"
                fill="white"
              >
                <path d="M10 32 L50 28 L75 10 L85 12 L65 30 L100 28 L108 32 L100 36 L65 34 L85 52 L75 54 L50 36 L10 32Z" />
              </svg>
            </div>
          )}

          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-sm">
              {getCategoryLabel(jet.category)}
            </span>
          </div>

          {/* Availability */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">
              Available
            </span>
          </div>

          {/* Hover arrow */}
          <div
            className={cn(
              "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0a1628] backdrop-blur-sm transition-all duration-300",
              "opacity-0 translate-x-1 -translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
            )}
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-[#0a1628]">
                {jet.name}
              </h3>
              <p className="mt-0.5 text-[12px] text-neutral-500">{jet.manufacturer}</p>
            </div>
            {jet.rating && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-[#0d1f3c] text-[#0d1f3c]" />
                <span className="text-[12px] font-medium text-neutral-800">
                  {jet.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Specs row */}
          <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.75} />
              <span className="text-[12px] text-neutral-700">
                <span className="font-medium">{jet.passengers}</span>
                <span className="text-neutral-400"> pax</span>
              </span>
            </div>
            {jet.speed && (
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.75} />
                <span className="text-[12px] text-neutral-700">
                  <span className="font-medium">{jet.speed}</span>
                  <span className="text-neutral-400"> kts</span>
                </span>
              </div>
            )}
            {jet.range && (
              <div className="flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.75} />
                <span className="text-[12px] text-neutral-700">
                  <span className="font-medium">{jet.range.toLocaleString()}</span>
                  <span className="text-neutral-400"> nm</span>
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-3 flex items-baseline justify-between border-t border-neutral-100 pt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">From</span>
              <span className="text-[17px] font-semibold tracking-tight text-[#0a1628]">
                {formatCurrency(jet.hourlyRate)}
              </span>
              <span className="text-[12px] text-neutral-400">/ hr</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0d1f3c]">
              View
              <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
