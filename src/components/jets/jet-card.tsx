"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, Users, Gauge, Navigation, ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { cn, formatCurrency, getCategoryLabel, getCategoryColor } from "@/lib/utils";
import type { Jet } from "@/types";

const categoryGradients: Record<string, string> = {
  light: "from-navy-800 to-navy-900",
  midsize: "from-navy-700 to-navy-900",
  super_midsize: "from-navy-800 to-navy-950",
  heavy: "from-navy-700 to-navy-950",
  ultra_long: "from-navy-800 to-navy-950",
};

interface JetCardProps {
  jet: Jet;
}

export function JetCard({ jet }: JetCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const imageCount = jet.images?.length || 3;
  const totalDots = Math.max(imageCount, 3);
  const gradient = categoryGradients[jet.category] || categoryGradients.light;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? totalDots - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === totalDots - 1 ? 0 : prev + 1));
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited((prev) => !prev);
  };

  return (
    <Link href={`/jets/${jet.id}`}>
      <div
        className={cn(
          "group rounded-2xl overflow-hidden bg-white border border-navy-100 transition-all duration-300",
          isHovered && "scale-[1.02] shadow-xl shadow-navy-900/10"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image area */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br flex items-center justify-center",
              gradient
            )}
          >
            <Plane className="w-20 h-20 text-white/20" strokeWidth={1.5} />
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-navy-600"
              )}
            />
          </button>

          {/* Category badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-navy-900 backdrop-blur-sm"
              )}
            >
              {getCategoryLabel(jet.category)}
            </span>
          </div>

          {/* Live indicator */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-navy-950/60 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-white">Available</span>
          </div>

          {/* Carousel arrows */}
          <button
            onClick={handlePrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white/90 shadow-md opacity-0 transition-opacity hover:bg-white",
              isHovered && "opacity-100"
            )}
          >
            <ChevronLeft className="w-4 h-4 text-navy-700" />
          </button>
          <button
            onClick={handleNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white/90 shadow-md opacity-0 transition-opacity hover:bg-white",
              isHovered && "opacity-100"
            )}
          >
            <ChevronRight className="w-4 h-4 text-navy-700" />
          </button>

          {/* Carousel dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {Array.from({ length: totalDots }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i === currentImage ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-navy-900 text-base leading-tight">
                {jet.name}
              </h3>
              <p className="text-sm text-navy-500">{jet.manufacturer}</p>
            </div>
            {jet.rating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 fill-navy-900 text-navy-900" />
                <span className="text-sm font-medium text-navy-900">
                  {jet.rating.toFixed(1)}
                </span>
                {jet.reviewCount != null && (
                  <span className="text-sm text-navy-500">
                    ({jet.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Specs row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-navy-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{jet.passengers} pax</span>
            </div>
            {jet.speed && (
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                <span>{jet.speed} kts</span>
              </div>
            )}
            {jet.range && (
              <div className="flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                <span>{jet.range} nm</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-3 pt-3 border-t border-navy-100">
            <p className="text-navy-900">
              <span className="text-sm text-navy-500">From </span>
              <span className="font-semibold">
                {formatCurrency(jet.hourlyRate)}
              </span>
              <span className="text-sm text-navy-500"> /hr</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
