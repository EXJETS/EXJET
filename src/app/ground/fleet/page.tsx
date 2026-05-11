"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Briefcase, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import vehicles from "@/data/vehicles.json";
import type { Vehicle, VehicleCategory } from "@/types";

const CATEGORIES: { key: VehicleCategory | "all"; label: string; desc: string }[] = [
  { key: "all", label: "All Vehicles", desc: "Full fleet overview" },
  { key: "sedan", label: "Sedan", desc: "Executive & first class" },
  { key: "suv", label: "SUV", desc: "Business & luxury" },
  { key: "electric", label: "Electric", desc: "Zero emission" },
  { key: "van", label: "Sprinter Van", desc: "Group & road show" },
  { key: "limousine", label: "Limousine", desc: "Events & celebrations" },
];

export default function FleetPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = activeCategory === "all"
    ? vehicles
    : vehicles.filter((v) => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--color-ivory)]">
      {/* Header */}
      <section className="border-b border-[var(--color-hairline)] bg-white">
        <div className="mx-auto max-w-7xl px-5 pt-28 pb-12 sm:px-8">
          <div className="mb-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              EXJET Ground · Fleet
            </span>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="display-serif-md text-[var(--color-ink)]">
                The fleet,
                <br />
                <em className="display-serif-italic">without compromise.</em>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-[var(--color-muted)]">
                Every vehicle is no older than 3 years, immaculately maintained, and detailed before each booking.
              </p>
            </div>
            <Link
              href="/ground/book"
              className="group inline-flex items-center gap-2 self-start rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-champagne md:self-end"
            >
              <span className="font-mono uppercase tracking-[0.18em]">Book Now</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 border-b border-[var(--color-hairline)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const count = cat.key === "all" ? vehicles.length : vehicles.filter((v) => v.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-all",
                    activeCategory === cat.key
                      ? "bg-[var(--color-ink)] text-white"
                      : "border border-[var(--color-hairline)] text-[var(--color-muted)] hover:border-champagne hover:text-champagne"
                  )}
                >
                  {cat.label}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", activeCategory === cat.key ? "bg-white/20 text-white" : "bg-[var(--color-ivory)] text-[var(--color-subtle)]")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vehicle) => (
            <FleetVehicleCard
              key={vehicle.id}
              vehicle={vehicle as Vehicle}
              expanded={expanded === vehicle.id}
              onToggle={() => setExpanded(expanded === vehicle.id ? null : vehicle.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FleetVehicleCard({
  vehicle,
  expanded,
  onToggle,
}: {
  vehicle: Vehicle;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white transition-all",
        expanded ? "border-champagne shadow-[0_16px_40px_-16px_rgba(184,155,110,0.3)]" : "border-[var(--color-hairline)]"
      )}
    >
      {/* Hero image area */}
      <div className="relative h-48 bg-[var(--color-ivory-deep)]">
        {vehicle.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-champagne px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white">
            {vehicle.badge}
          </span>
        )}
        {vehicle.category === "electric" && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[var(--color-forest)]/10 px-2.5 py-0.5 text-[var(--color-forest)]">
            <Zap className="h-3 w-3" strokeWidth={2} />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em]">EV</span>
          </span>
        )}
        <div className="flex h-full items-center justify-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {vehicle.model}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne">{vehicle.category}</div>
          <h3 className="mt-1 font-serif text-[22px] leading-tight text-[var(--color-ink)]">{vehicle.name}</h3>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--color-muted)]">{vehicle.model}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
            <Users className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
            <span className="text-[12px]">{vehicle.passengers} pax</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
            <Briefcase className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
            <span className="text-[12px]">{vehicle.luggage} bags</span>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">{vehicle.description}</p>

        {/* Amenities toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-between text-left"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {expanded ? "Hide amenities" : "View amenities"}
          </span>
          <span className={cn("font-mono text-[11px] text-champagne transition-transform", expanded && "rotate-180")}>▾</span>
        </button>

        {expanded && (
          <div className="flex flex-wrap gap-1.5 border-t border-[var(--color-hairline)] pt-4">
            {vehicle.amenities.map((a) => (
              <span key={a} className="flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-0.5 text-[11px] text-[var(--color-muted)]">
                <Check className="h-2.5 w-2.5 text-champagne" strokeWidth={2.5} />
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between border-t border-[var(--color-hairline)] pt-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-champagne">From</span>
            <div className="font-serif text-[26px] leading-none text-[var(--color-ink)]">${vehicle.basePrice}</div>
          </div>
          <Link
            href={`/ground/book?vehicle=${vehicle.id}`}
            className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}
