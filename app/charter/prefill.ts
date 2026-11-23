import guides from "@/data/airports-guide.json";
import { airportCoordinates } from "@/app/api/charter-estimate/airports";

export type PrefillAirport = { label: string; icao: string };

type Guide = { icao: string; iata?: string; name: string; city?: string };

const directory: Guide[] = [
  ...(guides as Guide[]),
  ...airportCoordinates
    .filter(([icao]) => !(guides as Guide[]).some(guide => guide.icao === icao))
    .map(([icao, iata, name]) => ({ icao, iata, name, city: "" })),
];

function labelFor(airport: Guide) {
  const title = [airport.city, airport.name].filter(Boolean).join(" · ");
  const codes = [airport.iata, airport.icao].filter(Boolean).join(" / ");
  return `${title} (${codes})`.slice(0, 120);
}

/** Resolve a `from` or `to` query value to a quote-form airport. */
export function prefillAirport(value: string | string[] | undefined): PrefillAirport | undefined {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim().toUpperCase() ?? "";
  const code = raw.replace(/[^A-Z0-9]/g, "");
  if (code.length < 3 || code.length > 4) return undefined;
  const airport = directory.find(item => item.icao === code || item.iata?.toUpperCase() === code);
  if (!airport) return undefined;
  return { label: labelFor(airport), icao: airport.icao };
}
