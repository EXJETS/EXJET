export type FleetCategory = "midsize" | "large" | "heavy" | "ulr";
export type FleetRecord = {
  id: string;
  tail: string;
  modelSlug: string;
  seats: number;
  category: FleetCategory;
  coverage: { kind: "floating_us" } | { kind: "home_base"; airport: string };
};
const categorySeats = { midsize: 8, large: 9, heavy: 13, ulr: 16 } as const;
export const isNTail = (value: string) => /^N[1-9](?:[0-9]{0,4}|[0-9]{0,3}[A-HJ-NP-Z]|[0-9]{0,2}[A-HJ-NP-Z]{2})$/.test(value);
const isIcao = (value: string) => /^[A-Z]{4}$/.test(value);
export function isUsAirport(icao: string) {
  return isIcao(icao) && /^(?:K[A-Z]{3}|P[AH][A-Z]{2})$/.test(icao);
}

export function parseFleetCatalog(value: unknown): FleetRecord[] {
  if (!Array.isArray(value)) return [];
  const result: FleetRecord[] = [];
  const ids = new Set<string>();
  const tails = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const { id, tail, modelSlug, seats, category, coverage } = item as Partial<FleetRecord>;
    if (typeof id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,59}$/.test(id) || ids.has(id) ||
        typeof tail !== "string" || !isNTail(tail) || tails.has(tail) ||
        typeof modelSlug !== "string" || !/^[a-z0-9-]{1,75}$/.test(modelSlug) ||
        typeof category !== "string" || !Object.hasOwn(categorySeats, category) ||
        typeof seats !== "number" || !Number.isInteger(seats) || seats < 1 || seats > categorySeats[category] ||
        !coverage || (coverage.kind !== "floating_us" && (coverage.kind !== "home_base" ||
        typeof coverage.airport !== "string" || !isIcao(coverage.airport)))) continue;
    ids.add(id);
    tails.add(tail);
    result.push({
      id, tail, modelSlug, seats, category,
      coverage: coverage.kind === "floating_us" ? { kind: coverage.kind } : { kind: coverage.kind, airport: coverage.airport },
    });
  }
  return result;
}

export function matchFleet(records: readonly FleetRecord[], airport: string, passengers: number, floatingEnabled = false) {
  const icao = airport.trim().toUpperCase();
  if (!isIcao(icao) || !Number.isInteger(passengers) || passengers < 1 || passengers > 16) return { floating: [], based: [] };
  const fitting = records.filter(row => row.seats >= passengers);
  return {
    floating: floatingEnabled && isUsAirport(icao) ? fitting.filter(row => row.coverage.kind === "floating_us") : [],
    based: fitting.filter(row => row.coverage.kind === "home_base" && row.coverage.airport === icao),
  };
}

export function fleetCategoryLabel(category: FleetCategory) {
  return { midsize: "Midsize", large: "Large", heavy: "Heavy", ulr: "Ultra long range" }[category];
}
