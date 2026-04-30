"use client";

import Link from "next/link";
import {
  PlaneTakeoff,
  PlaneLanding,
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
        "bg-gradient-to-b from-[var(--color-ivory)] to-white p-6 transition-all",
        "hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-ivory)]"
      )}
    >
      {/* Discount pill */}
      <div className="mb-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline-strong)] bg-[var(--color-ivory-deep)] px-2.5 py-1 font-mono text-[11px] text-[var(--color-ink-soft)]">
          <Tag className="h-3 w-3" strokeWidth={2} />
          {leg.discountPct}% OFF
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-subtle)]">
          {leg.aircraft}
        </span>
      </div>

      {/* Route — airport codes, Apple-huge mono */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-subtle)]">
            {leg.from.city}
          </span>
          <span className="mt-1 font-mono text-[34px] font-semibold leading-none text-[var(--color-ink)]">
            {leg.from.code}
          </span>
        </div>

        {/* Animated plane rule */}
        <div className="relative flex-1 self-center">
          <div className="h-px w-full bg-gradient-to-r from-[var(--color-hairline)] via-[var(--color-hairline-strong)] to-[var(--color-hairline)]" />
          <PlaneTakeoff
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)] transition-transform duration-500 group-hover:translate-x-0 group-hover:text-[var(--color-ink)]"
            strokeWidth={1.75}
          />
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-subtle)]">
            {leg.to.city}
          </span>
          <span className="mt-1 font-mono text-[34px] font-semibold leading-none text-[var(--color-ink)]">
            {leg.to.code}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--color-hairline)] pt-5 text-[12px]">
        <MetaItem icon={Calendar} label={when} />
        <MetaItem icon={Clock} label={leg.departTime} />
        <MetaItem icon={Users} label={`Up to ${leg.capacity}`} />
      </div>

      {/* Price + CTA */}
      <div className="mt-6 flex items-end justify-between">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-subtle)] line-through">
            {formatCurrency(leg.retailPrice)}
          </span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-[28px] font-semibold tracking-tight text-[var(--color-ink)]">
              {formatCurrency(leg.price)}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
              flat
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline-strong)] bg-[var(--color-ivory-deep)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors group-hover:bg-[var(--color-ink)] group-hover:text-white">
          Reserve
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
}

function MetaItem({ icon: Icon, label }: { icon: typeof PlaneLanding; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[var(--color-ink-soft)]">
      <Icon className="h-3.5 w-3.5 text-[var(--color-muted)]" strokeWidth={1.75} />
      <span>{label}</span>
    </div>
  );
}
