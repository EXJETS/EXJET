"use client";

import { useState } from "react";
import { Plane, Camera, Armchair, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Jet } from "@/types";

const exteriorLabels = ["Front Quarter", "Side Profile", "Tail Section", "Landing Gear", "Cockpit"];
const interiorLabels = ["Main Cabin", "Seating Area", "Galley", "Lavatory", "Entertainment"];

interface JetGalleryProps {
  jet: Jet;
}

export function JetGallery({ jet }: JetGalleryProps) {
  const [activeTab, setActiveTab] = useState<"exterior" | "interior">("exterior");
  const [activeIndex, setActiveIndex] = useState(0);

  const labels = activeTab === "exterior" ? exteriorLabels : interiorLabels;

  const handleTabChange = (tab: "exterior" | "interior") => {
    setActiveTab(tab);
    setActiveIndex(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Tab Switcher */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => handleTabChange("exterior")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-colors",
            activeTab === "exterior"
              ? "bg-white text-black"
              : "border border-white/15 bg-white/[0.03] text-white/70 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
          )}
        >
          <Camera className="h-3.5 w-3.5" strokeWidth={2} />
          Exterior
        </button>
        <button
          onClick={() => handleTabChange("interior")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition-colors",
            activeTab === "interior"
              ? "bg-white text-black"
              : "border border-white/15 bg-white/[0.03] text-white/70 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
          )}
        >
          <Armchair className="h-3.5 w-3.5" strokeWidth={2} />
          Interior
        </button>
      </div>

      {/* Main Image */}
      <div className="group relative">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-neutral-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {activeTab === "exterior" ? (
              <Plane className="h-32 w-32 text-white/20" strokeWidth={1} />
            ) : (
              <Armchair className="h-32 w-32 text-white/20" strokeWidth={1} />
            )}
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              {labels[activeIndex]} · {jet.name}
            </span>
          </div>

          {/* Nav arrows */}
          <button
            onClick={() => setActiveIndex((prev) => (prev === 0 ? labels.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all hover:border-white/30 hover:bg-black/60 group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev === labels.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all hover:border-white/30 hover:bg-black/60 group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur-md">
            {activeIndex + 1} / {labels.length}
          </div>

          {/* Tab indicator */}
          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur-md">
            {activeTab === "exterior" ? <Camera className="h-3 w-3" strokeWidth={2} /> : <Armchair className="h-3 w-3" strokeWidth={2} />}
            {activeTab}
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {labels.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-neutral-900 to-black transition-all",
              activeIndex === i
                ? "border-white/40 opacity-100"
                : "border-white/[0.08] opacity-60 hover:border-white/20 hover:opacity-90"
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative flex flex-col items-center">
              {activeTab === "exterior" ? (
                <Plane className="h-5 w-5 text-white/40" strokeWidth={1.25} />
              ) : (
                <Armchair className="h-5 w-5 text-white/40" strokeWidth={1.25} />
              )}
              <span className="mt-0.5 font-mono text-[8px] uppercase tracking-widest text-white/50">{label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
