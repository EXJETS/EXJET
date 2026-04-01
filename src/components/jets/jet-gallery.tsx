"use client";

import { useState } from "react";
import { Plane, Camera, Armchair, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Jet } from "@/types";

const categoryGradients: Record<string, string> = {
  light: "from-sky-400 to-blue-600",
  midsize: "from-violet-400 to-purple-600",
  super_midsize: "from-amber-400 to-orange-600",
  heavy: "from-emerald-400 to-teal-600",
  ultra_long: "from-rose-400 to-red-600",
};

const exteriorLabels = ["Front Quarter", "Side Profile", "Tail Section", "Landing Gear", "Cockpit"];
const interiorLabels = ["Main Cabin", "Seating Area", "Galley", "Lavatory", "Entertainment"];

interface JetGalleryProps {
  jet: Jet;
}

export function JetGallery({ jet }: JetGalleryProps) {
  const [activeTab, setActiveTab] = useState<"exterior" | "interior">("exterior");
  const [activeIndex, setActiveIndex] = useState(0);

  const gradient = categoryGradients[jet.category] || categoryGradients.light;
  const labels = activeTab === "exterior" ? exteriorLabels : interiorLabels;

  const handleTabChange = (tab: "exterior" | "interior") => {
    setActiveTab(tab);
    setActiveIndex(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => handleTabChange("exterior")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            activeTab === "exterior"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Camera className="w-4 h-4" />
          Exterior
        </button>
        <button
          onClick={() => handleTabChange("interior")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            activeTab === "interior"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Armchair className="w-4 h-4" />
          Interior
        </button>
      </div>

      {/* Main Image */}
      <div className="relative group">
        <div
          className={cn(
            "relative aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br",
            activeTab === "interior"
              ? "from-gray-700 via-gray-800 to-gray-900"
              : gradient
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {activeTab === "exterior" ? (
              <Plane className="w-32 h-32 text-white/20" strokeWidth={1} />
            ) : (
              <Armchair className="w-32 h-32 text-white/20" strokeWidth={1} />
            )}
            <span className="text-white/40 text-sm font-medium">{labels[activeIndex]}</span>
          </div>

          {/* Nav arrows */}
          <button
            onClick={() => setActiveIndex((prev) => (prev === 0 ? labels.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev === labels.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
            {activeIndex + 1} / {labels.length}
          </div>

          {/* Tab indicator */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            {activeTab === "exterior" ? <Camera className="w-3 h-3" /> : <Armchair className="w-3 h-3" />}
            {activeTab === "exterior" ? "Exterior" : "Interior"}
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {labels.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gradient-to-br transition-all",
              activeTab === "interior"
                ? "from-gray-600 to-gray-800"
                : gradient,
              activeIndex === i
                ? "ring-2 ring-amber-500 ring-offset-2 opacity-100"
                : "opacity-50 hover:opacity-75"
            )}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {activeTab === "exterior" ? (
                <Plane className="w-5 h-5 text-white/30" strokeWidth={1} />
              ) : (
                <Armchair className="w-5 h-5 text-white/30" strokeWidth={1} />
              )}
              <span className="text-[8px] text-white/50 mt-0.5">{label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
