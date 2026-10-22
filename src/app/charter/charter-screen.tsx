"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Fuel, Luggage, Users, Wifi } from "lucide-react";
import { CharterSearchForm } from "@/components/charter-search-form";
import { RouteLine } from "@/components/route";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { CATEGORY_LABELS } from "@/lib/data/aircraft";
import { charterOptions } from "@/lib/flight";
import { cn, duration, money, plural, shortDate } from "@/lib/format";
import { decodeItinerary, encodeItinerary } from "@/lib/itinerary";

export function CharterScreen() {
  const params = useSearchParams();
  const itinerary = useMemo(() => decodeItinerary(new URLSearchParams(params.toString())), [params]);
  const [editing, setEditing] = useState(false);

  if (!itinerary) {
    return (
      <>
        <PageHeader
          eyebrow="Charter"
          title="Where are you flying?"
          description="Every aircraft that can fly your trip, priced instantly. Your price includes flight time, fees and taxes."
        />
        <Card className="mt-8 p-5 sm:p-7">
          <CharterSearchForm />
        </Card>
      </>
    );
  }

  const options = charterOptions(itinerary.segments, itinerary.pax);
  const query = encodeItinerary(itinerary);
  const first = itinerary.segments[0];
  const last = itinerary.segments[itinerary.segments.length - 1];

  return (
    <>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <RouteLine from={first.from} to={itinerary.trip === "round-trip" ? first.to : last.to} />
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="text-[13px] text-muted">
              {itinerary.trip === "round-trip"
                ? `${shortDate(first.date)} – ${shortDate(last.date)}`
                : itinerary.segments.length > 1
                  ? `${plural(itinerary.segments.length, "flight")} from ${shortDate(first.date)}`
                  : shortDate(first.date)}
              {" · "}
              {plural(itinerary.pax, "guest")}
            </p>
            <button type="button" onClick={() => setEditing((v) => !v)} className={buttonClass("secondary", "sm")}>
              Edit <ChevronDown className={cn("h-4 w-4 transition", editing && "rotate-180")} />
            </button>
          </div>
        </div>
        {editing && (
          <div className="mt-5 border-t border-line pt-5">
            <CharterSearchForm key={query} initial={itinerary} compact />
          </div>
        )}
      </Card>

      <div className="mt-8 flex items-baseline justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight">{plural(options.length, "aircraft option")}</h1>
        <p className="text-[13px] text-muted">Cheapest first</p>
      </div>

      {options.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No aircraft can fly this trip as planned"
            body="Try fewer passengers, or split very long routes into separate flights."
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {options.map((o) => (
            <li key={o.type.id}>
              <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">{CATEGORY_LABELS[o.type.category]}</p>
                  <p className="mt-1 text-[19px] font-semibold tracking-tight">{o.type.name}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Up to {o.type.seats}
                    </span>
                    <span>{duration(o.hours)} total</span>
                    {o.stops > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-amber-700">
                        <Fuel className="h-3.5 w-3.5" /> {plural(o.stops, "fuel stop")}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Luggage className="h-3.5 w-3.5" /> {o.type.baggageCuFt} ft³
                    </span>
                    {o.type.amenities.some((a) => a.includes("Wi-Fi")) && (
                      <span className="inline-flex items-center gap-1.5">
                        <Wifi className="h-3.5 w-3.5" /> Wi-Fi
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <div className="sm:text-right">
                    <p className="text-[22px] font-semibold tracking-tight tabular-nums">{money(o.quote.total)}</p>
                    <p className="text-[12px] text-subtle">all-in estimate</p>
                  </div>
                  <Link href={`/charter/book/?${query}&type=${o.type.id}`} className={buttonClass("primary", "md")}>
                    Select
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-[12px] leading-relaxed text-subtle">
        Quotes are estimates based on great-circle distance, typical cruise speeds and published hourly rates. Your
        final price is locked when the operator confirms the aircraft.
      </p>
    </>
  );
}
