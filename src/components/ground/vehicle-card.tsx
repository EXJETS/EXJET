"use client";

import { Users, Briefcase, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  selected?: boolean;
  estimatedPrice?: number;
  onSelect?: (vehicle: Vehicle) => void;
  compact?: boolean;
}

export function VehicleCard({ vehicle, selected, estimatedPrice, onSelect, compact }: VehicleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(vehicle)}
      className={cn(
        "group relative w-full rounded-2xl border p-6 text-left transition-all",
        selected
          ? "border-champagne bg-[var(--color-ivory-deep)] shadow-[0_0_0_2px_var(--color-champagne)]"
          : "border-[var(--color-hairline)] bg-white hover:border-champagne hover:shadow-[0_8px_32px_-12px_rgba(184,155,110,0.3)]",
        compact && "p-4"
      )}
    >
      {vehicle.badge && (
        <span className="absolute right-4 top-4 rounded-full bg-champagne/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-champagne">
          {vehicle.badge}
        </span>
      )}

      {selected && (
        <span className="absolute left-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-champagne">
          <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
        </span>
      )}

      <div className={cn("flex flex-col gap-4", compact && "gap-3")}>
        <div className={cn("h-28 rounded-xl bg-[var(--color-ivory-deep)]", compact && "h-20")} aria-hidden>
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
              {vehicle.category}
            </span>
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne">
            {vehicle.category}
          </div>
          <h3 className="mt-1 font-serif text-[22px] leading-tight text-[var(--color-ink)]">
            {vehicle.name}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--color-muted)]">
            {vehicle.model}
          </p>
        </div>

        {!compact && (
          <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">
            {vehicle.description}
          </p>
        )}

        <div className="flex items-center gap-4 border-t border-[var(--color-hairline)] pt-4">
          <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
            <Users className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
            <span className="text-[12px]">{vehicle.passengers} pax</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
            <Briefcase className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
            <span className="text-[12px]">{vehicle.luggage} bags</span>
          </div>
          {vehicle.category === "electric" && (
            <div className="flex items-center gap-1 text-[var(--color-forest)]">
              <Zap className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="text-[11px] font-mono uppercase tracking-wide">EV</span>
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-1.5">
            {vehicle.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="rounded-full border border-[var(--color-hairline)] px-2.5 py-0.5 text-[11px] text-[var(--color-muted)]"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">From</span>
            <div className="font-serif text-[26px] leading-none text-[var(--color-ink)]">
              ${estimatedPrice ? estimatedPrice.toFixed(0) : vehicle.basePrice}
            </div>
          </div>
          <span
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
              selected ? "text-champagne" : "text-[var(--color-muted)] group-hover:text-champagne"
            )}
          >
            {selected ? "Selected" : "Select"}
          </span>
        </div>
      </div>
    </button>
  );
}
