"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import sportsEvents from "@/data/sports-events.json";

function leagueColor(league: string) {
  switch (league) {
    case "F1":
      return "bg-[var(--color-bordeaux)]/8 text-[var(--color-bordeaux)] ring-[var(--color-bordeaux)]/20";
    case "NBA":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "NFL":
      return "bg-blue-50 text-blue-800 ring-blue-200";
    case "NHL":
      return "bg-indigo-50 text-indigo-800 ring-indigo-200";
    case "FIFA":
    case "Masters":
      return "bg-[var(--color-forest)]/10 text-[var(--color-forest)] ring-[var(--color-forest)]/20";
    default:
      return "bg-[var(--color-hairline)] text-[var(--color-ink)] ring-[var(--color-hairline-strong)]";
  }
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (start === end) {
    return s.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  }
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  })}`;
}

const LEAGUES = ["F1", "NBA", "NFL", "NHL", "FIFA", "Masters"] as const;

export function SportsEventsList() {
  const [activeLeague, setActiveLeague] = useState<string | null>(null);

  const filtered = activeLeague
    ? sportsEvents.filter((e) => e.league === activeLeague)
    : sportsEvents;

  return (
    <>
      <div className="mt-12 flex flex-wrap items-center gap-2">
        {LEAGUES.map((l) => {
          const count = sportsEvents.filter((e) => e.league === l).length;
          const isActive = activeLeague === l;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLeague(isActive ? null : l)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ring-1 ring-inset transition-all",
                leagueColor(l),
                isActive && "ring-2 shadow-sm scale-105"
              )}
            >
              {l}
              <span className="rounded-full bg-[var(--color-ink)]/10 px-1.5 py-0.5 text-[10px] text-[var(--color-ink)]">
                {count}
              </span>
            </button>
          );
        })}
        {activeLeague && (
          <button
            type="button"
            onClick={() => setActiveLeague(null)}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            Clear ×
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-[14px] text-[var(--color-muted)]">
          No upcoming events for this league.
        </p>
      ) : (
        <ul className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
          {filtered.map((event, idx) => (
            <li
              key={event.id}
              className={cn(
                "group flex flex-col gap-3 p-6 transition-colors hover:bg-[var(--color-ivory)] sm:flex-row sm:items-center sm:gap-6",
                idx !== 0 && "border-t border-[var(--color-hairline)]"
              )}
            >
              <div className="flex w-28 shrink-0 items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-7 items-center justify-center rounded-full px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] ring-1 ring-inset",
                    leagueColor(event.league)
                  )}
                >
                  {event.league}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-serif text-[20px] leading-tight text-[var(--color-ink)]">
                    {event.event}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                    {event.city}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[var(--color-muted)]">
                  {event.venue}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-[var(--color-ink-soft)]">
                  <Calendar className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
                  <span className="text-[12px]">
                    {formatDateRange(event.date, event.endDate)}
                  </span>
                </div>
                <div className="hidden items-center gap-1.5 text-[var(--color-muted)] sm:flex">
                  <MapPin className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
                  <span className="font-mono text-[11px] tracking-wide">
                    {event.airports.slice(0, 3).join(" · ")}
                  </span>
                </div>
                <Link
                  href={`/search?event=${event.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--color-ink)] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-white"
                >
                  Reserve
                  <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
