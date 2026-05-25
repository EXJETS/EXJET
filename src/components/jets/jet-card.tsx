"use client";

import Link from "next/link";
import { Users, Gauge, Ruler, Zap } from "lucide-react";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Jet } from "@/types";

const CATEGORY_STYLE: Record<string, { bg: string; text: string; accent: string }> = {
  light: {
    bg: "linear-gradient(160deg, #c8d8f0 0%, #e4eef8 100%)",
    text: "#0d2040",
    accent: "rgba(13,32,64,0.55)",
  },
  midsize: {
    bg: "linear-gradient(160deg, #6888b0 0%, #9ab0cc 100%)",
    text: "#ffffff",
    accent: "rgba(255,255,255,0.55)",
  },
  super_midsize: {
    bg: "linear-gradient(160deg, #2a4a70 0%, #5070a0 100%)",
    text: "#ffffff",
    accent: "rgba(255,255,255,0.55)",
  },
  heavy: {
    bg: "linear-gradient(160deg, #122038 0%, #2a3e5a 100%)",
    text: "#ffffff",
    accent: "rgba(255,255,255,0.50)",
  },
  ultra_long: {
    bg: "linear-gradient(160deg, #07101e 0%, #152030 100%)",
    text: "#ffffff",
    accent: "rgba(196,160,82,0.80)",
  },
};

export function JetCard({ jet }: { jet: Jet }) {
  const style = CATEGORY_STYLE[jet.category] ?? CATEGORY_STYLE.light;
  const isInstant = jet.featured;

  return (
    <Link href={`/jets/${jet.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-[#07101e]/08 bg-white shadow-sm transition-all hover:shadow-md hover:border-[#07101e]/15">

        {/* Image area */}
        <div
          className="relative overflow-hidden"
          style={{ background: style.bg, aspectRatio: "16/9" }}
        >
          {/* Grid texture overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Centered aircraft illustration (SVG silhouette) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 200 80"
              className="w-3/4 max-w-[220px] transition-transform duration-700 group-hover:translate-x-2 group-hover:-translate-y-1"
              style={{ opacity: 0.25 }}
              fill={style.text}
            >
              {/* Simple aircraft silhouette */}
              <path d="M10 45 L60 40 L80 20 L90 20 L85 40 L160 35 L175 32 L180 35 L175 40 L165 42 L85 48 L90 58 L80 58 L70 50 L60 52 Z" />
              <path d="M85 48 L95 65 L105 65 L100 48 Z" />
            </svg>
          </div>

          {/* Aircraft type specs in image */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-5 pb-4 pt-10">
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/60"
                >
                  {jet.manufacturer}
                </p>
                <p
                  className="font-serif text-[1.35rem] font-bold uppercase leading-none text-white"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {jet.name}
                </p>
              </div>
              {isInstant && (
                <span className="flex items-center gap-1 rounded bg-[#c4a052] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#07101e]">
                  <Zap className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Instant
                </span>
              )}
            </div>
          </div>

          {/* Category badge */}
          <div className="absolute left-4 top-4">
            <span className="rounded-full border border-white/25 bg-white/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              {getCategoryLabel(jet.category)}
            </span>
          </div>
        </div>

        {/* Card content */}
        <div className="p-5">
          {/* Name + category */}
          <div className="mb-4">
            <p className="text-[11px] text-[#07101e]/45">
              Or similar {getCategoryLabel(jet.category)}
            </p>
          </div>

          {/* Specs row */}
          <div className="mb-4 flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#07101e]/35" strokeWidth={1.75} />
              <span className="text-[12px] font-medium text-[#07101e]">{jet.passengers}</span>
              <span className="text-[11px] text-[#07101e]/40">seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5 text-[#07101e]/35" strokeWidth={1.75} />
              <span className="text-[12px] font-medium text-[#07101e]">{jet.range.toLocaleString()}</span>
              <span className="text-[11px] text-[#07101e]/40">nm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-[#07101e]/35" strokeWidth={1.75} />
              <span className="text-[12px] font-medium text-[#07101e]">{jet.speed}</span>
              <span className="text-[11px] text-[#07101e]/40">kts</span>
            </div>
          </div>

          {/* Price + Book */}
          <div className="flex items-center justify-between border-t border-[#07101e]/06 pt-4">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#07101e]/35">From</span>
              <span className="text-[20px] font-bold tracking-tight text-[#07101e]">
                {formatCurrency(jet.hourlyRate)}
              </span>
              <span className="text-[12px] text-[#07101e]/40">/ hr</span>
            </div>
            <span className="rounded-lg bg-[#07101e] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-all group-hover:bg-[#c4a052] group-hover:text-[#07101e]">
              Select
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
