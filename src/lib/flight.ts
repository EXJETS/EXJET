import { getAircraftType, AIRCRAFT_TYPES } from "@/lib/data/aircraft";
import { getAirport } from "@/lib/data/airports";
import type { AircraftType, Quote, Segment } from "@/lib/types";

const EARTH_RADIUS_NM = 3440.065;
const ROUTING_FACTOR = 1.07; // airways are never a perfect great circle
const TAXI_CLIMB_HOURS = 0.25;
const MIN_BILLABLE_HOURS = 1;
const USABLE_RANGE = 0.85; // keep reserves; legs beyond this need a fuel stop
const FUEL_STOP_HOURS = 0.75;
const MAX_FUEL_STOPS = 2;
const US_FET = 0.075;
const CREW_OVERNIGHT = 1200;

export function distanceNm(fromCode: string, toCode: string): number {
  const a = getAirport(fromCode);
  const b = getAirport(toCode);
  if (!a || !b) return 0;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(h)));
}

export interface SegmentEstimate {
  distanceNm: number;
  hours: number; // block time including any fuel stops
  stops: number;
}

export function estimateSegment(type: AircraftType, from: string, to: string): SegmentEstimate {
  const distance = distanceNm(from, to);
  const routed = distance * ROUTING_FACTOR;
  const stops = Math.max(0, Math.ceil(routed / (type.rangeNm * USABLE_RANGE)) - 1);
  const hours = routed / type.speedKts + TAXI_CLIMB_HOURS + stops * FUEL_STOP_HOURS;
  return { distanceNm: distance, hours, stops };
}

function isDomesticUS(from: string, to: string): boolean {
  return getAirport(from)?.country === "US" && getAirport(to)?.country === "US";
}

function segmentFees(type: AircraftType): number {
  return type.category === "light" || type.category === "midsize" ? 950 : 1500;
}

function nightsBetween(a: string, b: string): number {
  const ms = new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/**
 * Indicative charter quote for one aircraft type across one or more segments.
 * Returns null when the aircraft can't do the trip (too many pax or stops).
 */
export function quoteCharter(typeId: string, segments: Segment[], pax: number): Quote | null {
  const type = getAircraftType(typeId);
  if (!type || segments.length === 0 || pax > type.seats) return null;

  let flight = 0;
  let fees = 0;
  let fet = 0;
  for (const s of segments) {
    const est = estimateSegment(type, s.from, s.to);
    if (est.distanceNm === 0 || est.stops > MAX_FUEL_STOPS) return null;
    const cost = Math.max(est.hours, MIN_BILLABLE_HOURS) * type.hourlyRate;
    flight += cost;
    fees += segmentFees(type) * (est.stops + 1);
    if (isDomesticUS(s.from, s.to)) fet += cost * US_FET;
  }

  // Crew stays with the aircraft between legs of a multi-day trip.
  let overnight = 0;
  for (let i = 1; i < segments.length; i++) {
    overnight += nightsBetween(segments[i - 1].date, segments[i].date) * CREW_OVERNIGHT;
  }

  const lines = [
    { label: "Flight time", amount: Math.round(flight) },
    { label: "Landing, handling & FBO fees", amount: fees },
  ];
  if (overnight) lines.push({ label: "Crew overnight expenses", amount: overnight });
  if (fet) lines.push({ label: "US Federal Excise Tax (7.5%)", amount: Math.round(fet) });
  return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0) };
}

export interface CharterOption {
  type: AircraftType;
  quote: Quote;
  hours: number; // sum of block hours
  stops: number;
}

/** Every aircraft type that can fly the itinerary, cheapest first. */
export function charterOptions(segments: Segment[], pax: number): CharterOption[] {
  const out: CharterOption[] = [];
  for (const type of AIRCRAFT_TYPES) {
    const quote = quoteCharter(type.id, segments, pax);
    if (!quote) continue;
    const ests = segments.map((s) => estimateSegment(type, s.from, s.to));
    out.push({
      type,
      quote,
      hours: ests.reduce((s, e) => s + e.hours, 0),
      stops: ests.reduce((s, e) => s + e.stops, 0),
    });
  }
  return out.sort((a, b) => a.quote.total - b.quote.total);
}
