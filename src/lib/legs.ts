import { getAircraftType } from "@/lib/data/aircraft";
import { airportMatches, getAirport } from "@/lib/data/airports";
import { estimateSegment, quoteCharter } from "@/lib/flight";
import type { Airport, AircraftCategory, AircraftType, EmptyLeg, FleetAircraft, Operator, Region } from "@/lib/types";

export interface LegView {
  leg: EmptyLeg;
  from: Airport;
  to: Airport;
  type: AircraftType;
  fleet?: FleetAircraft;
  operator?: Operator;
  hours: number;
  distanceNm: number;
  /** What the same flight would cost as a regular charter. */
  retailPrice: number;
  discountPct: number;
}

export function departureTime(leg: Pick<EmptyLeg, "date" | "time">): number {
  // Local wall-clock time; precise enough for ordering and expiry.
  return new Date(`${leg.date}T${leg.time}:00`).getTime();
}

export function isLive(leg: EmptyLeg, now = Date.now()): boolean {
  return leg.status === "available" && departureTime(leg) > now;
}

export function viewLeg(
  leg: EmptyLeg,
  fleet: FleetAircraft[],
  operators: Operator[]
): LegView | null {
  const f = fleet.find((x) => x.id === leg.fleetId);
  const type = f && getAircraftType(f.typeId);
  const from = getAirport(leg.from);
  const to = getAirport(leg.to);
  if (!type || !from || !to) return null;
  const est = estimateSegment(type, leg.from, leg.to);
  const retail =
    quoteCharter(type.id, [{ from: leg.from, to: leg.to, date: leg.date, time: leg.time }], 1)?.total ?? leg.price;
  const retailPrice = Math.max(retail, leg.price);
  return {
    leg,
    from,
    to,
    type,
    fleet: f,
    operator: operators.find((o) => o.id === leg.operatorId),
    hours: est.hours,
    distanceNm: est.distanceNm,
    retailPrice,
    discountPct: Math.round((1 - leg.price / retailPrice) * 100),
  };
}

export type LegSort = "soonest" | "price" | "discount";

export interface LegFilters {
  from?: string;
  to?: string;
  date?: string; // earliest departure day
  pax?: number;
  maxPrice?: number;
  region?: Region | "all";
  category?: AircraftCategory | "all";
  sort?: LegSort;
}

export function filterLegs(views: LegView[], f: LegFilters): LegView[] {
  const out = views.filter((v) => {
    if (f.from && !airportMatches(v.leg.from, f.from)) return false;
    if (f.to && !airportMatches(v.leg.to, f.to)) return false;
    if (f.date && v.leg.date < f.date) return false;
    if (f.pax && v.type.seats < f.pax) return false;
    if (f.maxPrice && v.leg.price > f.maxPrice) return false;
    if (f.region && f.region !== "all" && v.from.region !== f.region && v.to.region !== f.region) return false;
    if (f.category && f.category !== "all" && v.type.category !== f.category) return false;
    return true;
  });
  const sort = f.sort ?? "soonest";
  out.sort((a, b) => {
    if (sort === "price") return a.leg.price - b.leg.price;
    if (sort === "discount") return b.discountPct - a.discountPct;
    return departureTime(a.leg) - departureTime(b.leg);
  });
  return out;
}

export const REGION_LABELS: Record<Region, string> = {
  "north-america": "North America",
  europe: "Europe",
  caribbean: "Caribbean",
  "middle-east": "Middle East",
};
