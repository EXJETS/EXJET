"use client";

import Link from "next/link";
import {
  PlaneTakeoff,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Tag,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export interface EmptyLeg {
  id: string;
  from: { code: string; city: string; airport: string };
  to: { code: string; city: string; airport: string };
  date: string;
  departTime: string;
  aircraft: string;
  category?: string;
  capacity: number;
  retailPrice: number;
  price: number;
  discountPct: number;
}

export function EmptyLegCard({ leg }: { leg: EmptyLeg }) {
  const when = new Date(leg.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/booking?legId=${leg.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)]",
        "bg-white p-6 transition-all duration-300",
        "hover:border-champagne hover:shadow-[0_24px_50px_-20px_rgba(184,155,110,0.35)]"
      )}
    >
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 bg-champagne/8 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
          <Tag className="h-3 w-3" strokeWidth={2} />
          {leg.discountPct}% off
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
          {leg.aircraft}
        </span>
      </div>

      {/* Route — large serif airport codes */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {leg.from.city}
          </span>
          <span className="mt-1.5 font-serif text-[40px] leading-none text-[var(--color-ink)]">
            {leg.from.code}
          </span>
        </div>

        <div className="relative flex-1 self-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
          <PlaneTakeoff
            className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-champagne transition-transform duration-500 group-hover:translate-x-0"
            strokeWidth={1.5}
          />
        </div>

        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {leg.to.city}
          </span>
          <span className="mt-1.5 font-serif text-[40px] leading-none text-[var(--color-ink)]">
            {leg.to.code}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--color-hairline)] pt-5">
        <MetaItem icon={Calendar} label={when} />
        <MetaItem icon={Clock} label={leg.departTime} />
        <MetaItem icon={Users} label={`${leg.capacity} seats`} />
      </div>

      {/* Price + CTA */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)] line-through">
            {formatCurrency(leg.retailPrice)}
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-serif text-[30px] leading-none text-[var(--color-ink)]">
              {formatCurrency(leg.price)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne">
              flat
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink)] bg-transparent px-4 py-2 text-[12px] font-medium text-[var(--color-ink)] transition-all group-hover:bg-[var(--color-ink)] group-hover:text-white">
          Reserve
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
}

function MetaItem({ icon: Icon, label }: { icon: typeof Calendar; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-champagne" strokeWidth={1.75} />
      <span className="text-[12px]">{label}</span>
    </div>
  );
}
