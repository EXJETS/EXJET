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

export function JetCard({ jet, dark = false }: JetCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/jets/${jet.id}`} className="block">
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-all duration-300",
          dark
            ? "border-[var(--color-hairline)] bg-white hover:border-champagne hover:shadow-[0_24px_50px_-20px_rgba(184,155,110,0.35)]"
            : "border-[var(--color-hairline)] bg-white hover:border-champagne hover:shadow-[0_24px_50px_-20px_rgba(184,155,110,0.35)]"
        )}
      >
        {/* Image area — dark geometric with plane silhouette */}
        <div
          className={cn(
            "relative aspect-[16/10] overflow-hidden",
            dark ? "bg-gradient-to-br from-[var(--color-ivory)] to-[var(--color-ivory-deep)]" : "bg-[var(--color-ivory-deep)]"
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="absolute inset-0 flex items-center justify-center">
            <Plane
              className={cn(
                "h-16 w-16 transition-transform duration-500",
                dark ? "text-[var(--color-bone)]" : "text-[var(--color-bone)]",
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
                  ? "border-[var(--color-hairline)] bg-[var(--color-ivory-deep)] text-[var(--color-ink-soft)]"
                  : "border-[var(--color-hairline)] bg-white/80 text-[var(--color-ink-soft)]"
              )}
            >
              {getCategoryLabel(jet.category)}
            </span>
          </div>

          {/* Availability dot */}
          <div className="absolute left-4 bottom-4 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-champagne)]" />
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest",
                dark ? "text-[var(--color-muted)]" : "text-[var(--color-muted)]"
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
                ? "border-[var(--color-hairline)] bg-[var(--color-ivory-deep)] text-[var(--color-ink)] backdrop-blur-md"
                : "border-[var(--color-hairline)] bg-white/80 text-[var(--color-ink-soft)]",
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
                  dark ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]"
                )}
              >
                {jet.name}
              </h3>
              <p
                className={cn(
                  "mt-0.5 text-[12px]",
                  dark ? "text-[var(--color-muted)]" : "text-[var(--color-muted)]"
                )}
              >
                {jet.manufacturer}
              </p>
            </div>
            {jet.rating && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-white text-[var(--color-ink)]" />
                <span
                  className={cn(
                    "text-[12px] font-medium",
                    dark ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]"
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
              dark ? "border-[var(--color-hairline)]" : "border-[var(--color-hairline)]"
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
              dark ? "border-[var(--color-hairline)]" : "border-[var(--color-hairline)]"
            )}
          >
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest",
                  dark ? "text-[var(--color-subtle)]" : "text-[var(--color-muted)]"
                )}
              >
                From
              </span>
              <span
                className={cn(
                  "text-[18px] font-semibold tracking-tight",
                  dark ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]"
                )}
              >
                {formatCurrency(jet.hourlyRate)}
              </span>
              <span
                className={cn(
                  "text-[12px]",
                  dark ? "text-[var(--color-muted)]" : "text-[var(--color-muted)]"
                )}
              >
                / hr
              </span>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[12px] font-medium transition-transform",
                dark ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]",
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
        className={cn("h-3.5 w-3.5", dark ? "text-[var(--color-muted)]" : "text-[var(--color-subtle)]")}
        strokeWidth={1.75}
      />
      <span
        className={cn(
          "text-[12px]",
          dark ? "text-[var(--color-ink-soft)]" : "text-[var(--color-ink-soft)]"
        )}
      >
        <span className="font-medium">{value}</span>{" "}
        <span className={dark ? "text-[var(--color-subtle)]" : "text-[var(--color-subtle)]"}>
          {label}
        </span>
      </span>
    </div>
  );
}
