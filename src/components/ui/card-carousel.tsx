"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardCarouselProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Tailwind width classes applied to each card slot. Controls how many cards are visible at a time.
   * Default targets ~4 across on desktop with peek of next card.
   */
  itemClassName?: string;
  /**
   * Gap between cards (Tailwind gap class).
   */
  gap?: string;
  /**
   * Show arrow controls (default: true, hidden on touch / when not needed).
   */
  arrows?: boolean;
}

export function CardCarousel({
  children,
  className,
  itemClassName = "w-[85%] sm:w-[55%] md:w-[40%] lg:w-[27%]",
  gap = "gap-4",
  arrows = true,
}: CardCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Scroll roughly by viewport width minus a little for peek.
    const delta = el.clientWidth * 0.85 * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={cn("relative", className)}>
      {arrows && (
        <div className="pointer-events-none absolute -top-14 right-0 z-10 hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={cn(
              "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition-all",
              canScrollLeft
                ? "hover:border-neutral-400 hover:bg-neutral-100"
                : "cursor-not-allowed opacity-30"
            )}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={cn(
              "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-950 transition-all",
              canScrollRight
                ? "hover:border-neutral-400 hover:bg-neutral-100"
                : "cursor-not-allowed opacity-30"
            )}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Edge fade masks */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-white to-transparent transition-opacity",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-white to-transparent transition-opacity",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />

      <div
        ref={scrollerRef}
        className={cn(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
          gap
        )}
      >
        {items.map((child, idx) => (
          <div
            key={idx}
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
