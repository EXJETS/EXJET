import "server-only";
import { aircraftCapacity, type AircraftCategory } from "../requests/itinerary";
import { airportCoordinates } from "./airports";

type Airport = { code: string; label: string; lat: number; lon: number };
type Segment = { from: Airport; to: Airport };
type Estimate = { estimateUsd: number | null; segments: Segment[]; currency: "USD"; reason?: string; cabinTotals?: Partial<Record<AircraftCategory, number>> };

const normalized = (value: string) => value.normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase();
const airports = new Map<string, Airport>();
for (const [code, iata, label, lat, lon] of airportCoordinates) {
  const airport = { code, label: code === "KDJT" ? "Palm Beach International / DJT" : label, lat, lon };
  for (const alias of [code, iata, label, airport.label]) if (alias) airports.set(normalized(alias), airport);
  // Both the former FAA/IATA codes and their current replacements identify
  // the same airport in the pinned source snapshot.
  if (code === "KDJT") for (const alias of ["KPBI", "PBI", "Palm Beach International Airport"]) airports.set(normalized(alias), airport);
}

// Internal planning assumptions, not published hourly rates, not performance
// or dispatch figures. Per-leg billable floors are hours. Cruise speeds are
// generic planning speeds in knots. Allow 7% for route stretch and 0.35 hours
// for block movement; round the itinerary total to the nearest $100.
const planning = {
  midsize: { hourly: 6500, minimum: 2, knots: 430 },
  large: { hourly: 7500, minimum: 2, knots: 445 },
  heavy: { hourly: 8500, minimum: 5, knots: 460 },
  ulr: { hourly: 9500, minimum: 5, knots: 480 },
} satisfies Record<AircraftCategory, { hourly: number; minimum: number; knots: number }>;

const radians = Math.PI / 180;

function distanceNm(segment: Segment) {
  const { from, to } = segment;
  const dLat = (to.lat - from.lat) * radians;
  const dLon = (to.lon - from.lon) * radians;
  const haversine = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * radians) *
    Math.cos(to.lat * radians) * Math.sin(dLon / 2) ** 2;
  return 2 * 3440.065 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, haversine))));
}

function resolveAirport(display: unknown, preferredCode: unknown) {
  if (preferredCode !== undefined && preferredCode !== null && preferredCode !== "") {
    if (typeof preferredCode !== "string" || !/^[A-Z0-9]{3,4}$/i.test(preferredCode.trim())) return undefined;
    return airports.get(normalized(preferredCode));
  }
  if (typeof display !== "string" || display.length > 120) return undefined;
  return airports.get(normalized(display));
}

function unavailable(segments: Segment[], reason: string): Estimate {
  return { estimateUsd: null, segments, currency: "USD", reason };
}

export function calculateCharterEstimate(payload: unknown): Estimate {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return unavailable([], "Enter a route to estimate the trip total.");
  const raw = payload as Record<string, unknown>;
  if (!Array.isArray(raw.legs) || raw.legs.length < 1 || raw.legs.length > 6) {
    return unavailable([], "Add between one and six flight segments.");
  }
  const segments: Segment[] = [];
  for (const entry of raw.legs) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return unavailable([], "Choose a departure and destination airport for each segment.");
    const leg = entry as Record<string, unknown>;
    const from = resolveAirport(leg.departure, leg.departureIcao);
    const to = resolveAirport(leg.destination, leg.destinationIcao);
    // Do not present a partial map if another segment could not be resolved.
    if (!from || !to) return unavailable([], "Select a supported airport for each stop or enter its IATA or ICAO code. You can still request a quote for other airports.");
    if (from.code === to.code) return unavailable([], "Departure and destination must be different airports.");
    segments.push({ from, to });
  }
  const category = raw.aircraftCategory;
  const passengers = typeof raw.passengers === "number" ? raw.passengers
    : typeof raw.passengers === "string" && /^\d{1,3}$/.test(raw.passengers.trim()) ? Number(raw.passengers) : NaN;
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 100) return unavailable(segments, "Enter a passenger count to estimate the trip total.");
  if (passengers > 16) return unavailable(segments, "Request a group charter quote for this passenger count.");
  const totalFor = (key: AircraftCategory) => {
    const profile = planning[key];
    const total = segments.reduce((sum, segment) => {
      const hours = Math.max(profile.minimum, (distanceNm(segment) * 1.07 / profile.knots) + 0.35);
      return sum + profile.hourly * hours;
    }, 0);
    return Math.round(total / 100) * 100;
  };
  if (raw.compareCabins === true) {
    const eligible = (Object.keys(planning) as AircraftCategory[]).filter(key => passengers <= aircraftCapacity[key]);
    return {
      estimateUsd: totalFor(eligible[0]),
      segments, currency: "USD",
      cabinTotals: Object.fromEntries(eligible.map(key => [key, totalFor(key)])),
    };
  }
  if (typeof category !== "string" || !Object.hasOwn(planning, category)) return unavailable(segments, "Choose an aircraft category to estimate the trip total.");
  const key = category as AircraftCategory;
  if (passengers > aircraftCapacity[key]) return unavailable(segments, "Choose an aircraft category that seats everyone.");
  return { estimateUsd: totalFor(key), segments, currency: "USD" };
}
