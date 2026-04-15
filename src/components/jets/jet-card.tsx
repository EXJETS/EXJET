"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Users,
  Gauge,
  Ruler,
  Plane,
  ArrowUpRight,
} from "lucide-react";
import { cn, formatCurrency, getCategoryLabel } from "@/lib/utils";
import type { Jet } from "@/types";

interface JetCardProps {
  jet: Jet;
  dark?: boolean;
}

export function JetCard({ jet, dark = true }: JetCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/jets/${jet.id}`} className="block">
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-all duration-300",
          dark
            ? "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            : "border-neutral-200 bg-white hover:border-neutral-300"
        )}
      >
        {/* Image area — dark geometric with plane silhouette */}
        <div
          className={cn(
            "relative aspect-[16/10] overflow-hidden",
            dark ? "bg-gradient-to-br from-neutral-900 to-black" : "bg-neutral-100"
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="absolute inset-0 flex items-center justify-center">
            <Plane
              className={cn(
                "h-16 w-16 transition-transform duration-500",
                dark ? "text-white/20" : "text-neutral-300",
                hovered && "translate-x-2 -translate-y-1"
              )}
              strokeWidth={1}
            />
          </div>

          {/* Category eyebrow */}
          <div className="absolute left-4 top-4">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md",
                dark
                  ? "border-white/15 bg-black/40 text-white/80"
                  : "border-neutral-300 bg-white/70 text-neutral-700"
              )}
            >
              {getCategoryLabel(jet.category)}
            </span>
          </div>

          {/* Availability dot */}
          <div className="absolute left-4 bottom-4 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest",
                dark ? "text-white/60" : "text-neutral-600"
              )}
            >
              Available
            </span>
          </div>

          {/* Hover arrow */}
          <div
            className={cn(
              "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
              dark
                ? "border-white/15 bg-black/40 text-white backdrop-blur-md"
                : "border-neutral-300 bg-white/70 text-neutral-800",
              hovered ? "opacity-100 translate-x-0 -translate-y-0" : "opacity-0 translate-x-1 translate-y-1"
            )}
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={cn(
                  "truncate text-[15px] font-semibold tracking-tight",
                  dark ? "text-white" : "text-neutral-950"
                )}
              >
                {jet.name}
              </h3>
              <p
                className={cn(
                  "mt-0.5 text-[12px]",
                  dark ? "text-white/50" : "text-neutral-500"
                )}
              >
                {jet.manufacturer}
              </p>
            </div>
            {jet.rating && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-white text-white" />
                <span
                  className={cn(
                    "text-[12px] font-medium",
                    dark ? "text-white" : "text-neutral-900"
                  )}
                >
                  {jet.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Specs */}
          <div
            className={cn(
              "mt-5 flex items-center gap-4 border-t pt-4",
              dark ? "border-white/[0.06]" : "border-neutral-200"
            )}
          >
            <Spec
              icon={Users}
              value={`${jet.passengers}`}
              label="pax"
              dark={dark}
            />
            {jet.speed ? (
              <Spec
                icon={Gauge}
                value={`${jet.speed}`}
                label="kts"
                dark={dark}
              />
            ) : null}
            {jet.range ? (
              <Spec
                icon={Ruler}
                value={`${jet.range}`}
                label="nm"
                dark={dark}
              />
            ) : null}
          </div>

          {/* Price */}
          <div
            className={cn(
              "mt-4 flex items-baseline justify-between border-t pt-4",
              dark ? "border-white/[0.06]" : "border-neutral-200"
            )}
          >
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest",
                  dark ? "text-white/40" : "text-neutral-500"
                )}
              >
                From
              </span>
              <span
                className={cn(
                  "text-[18px] font-semibold tracking-tight",
                  dark ? "text-white" : "text-neutral-950"
                )}
              >
                {formatCurrency(jet.hourlyRate)}
              </span>
              <span
                className={cn(
                  "text-[12px]",
                  dark ? "text-white/50" : "text-neutral-500"
                )}
              >
                / hr
              </span>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[12px] font-medium transition-transform",
                dark ? "text-white" : "text-neutral-900",
                hovered && "translate-x-0.5"
              )}
            >
              View
              <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Spec({
  icon: Icon,
  value,
  label,
  dark,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  dark: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon
        className={cn("h-3.5 w-3.5", dark ? "text-white/50" : "text-neutral-400")}
        strokeWidth={1.75}
      />
      <span
        className={cn(
          "text-[12px]",
          dark ? "text-white/80" : "text-neutral-700"
        )}
      >
        <span className="font-medium">{value}</span>{" "}
        <span className={dark ? "text-white/40" : "text-neutral-400"}>
          {label}
        </span>
      </span>
    </div>
  );
}
