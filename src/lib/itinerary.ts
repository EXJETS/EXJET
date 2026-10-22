import { getAirport } from "@/lib/data/airports";
import type { Segment } from "@/lib/types";

export type TripType = "one-way" | "round-trip" | "multi-city";

export interface Itinerary {
  trip: TripType;
  segments: Segment[];
  pax: number;
}

// Compact, URL-safe itinerary encoding: legs=KTEB.KVNY.2027-01-10.09:00~KVNY.KTEB.2027-01-14.17:00
export function encodeItinerary(it: Itinerary): string {
  const p = new URLSearchParams();
  p.set("trip", it.trip);
  p.set("pax", String(it.pax));
  p.set("legs", it.segments.map((s) => [s.from, s.to, s.date, s.time].join(".")).join("~"));
  return p.toString();
}

export function decodeItinerary(params: URLSearchParams): Itinerary | null {
  const raw = params.get("legs");
  if (!raw) return null;
  const segments: Segment[] = [];
  for (const part of raw.split("~")) {
    const [from, to, date, time] = part.split(".");
    if (!getAirport(from ?? "") || !getAirport(to ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) return null;
    segments.push({ from, to, date, time: /^\d{2}:\d{2}$/.test(time ?? "") ? time : "09:00" });
  }
  const trip = params.get("trip");
  const pax = Math.min(19, Math.max(1, Number(params.get("pax")) || 1));
  return {
    trip: trip === "round-trip" || trip === "multi-city" ? trip : "one-way",
    segments,
    pax,
  };
}

/** Returns an error message, or null when the itinerary can be quoted. */
export function validateItinerary(it: Itinerary, todayDay: string): string | null {
  for (const [i, s] of it.segments.entries()) {
    const n = it.segments.length > 1 ? ` on flight ${i + 1}` : "";
    if (!s.from || !s.to) return `Choose departure and arrival airports${n}.`;
    if (s.from === s.to) return `Departure and arrival can't be the same${n}.`;
    if (!s.date) return `Pick a date${n}.`;
    if (s.date < todayDay) return `That date${n} is in the past.`;
    if (i > 0 && s.date < it.segments[i - 1].date) return `Flight ${i + 1} departs before flight ${i}.`;
  }
  return null;
}
