import { avinodeStatus, searchAvinodeAirports } from "@/integration/avinode/client";
import guides from "@/data/airports-guide.json";
import { airportCoordinates } from "../charter-estimate/airports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };
const directory = [
  ...guides.map(({ icao, iata, name, city }) => ({ icao, iata, name, city })),
  ...airportCoordinates.filter(([icao]) => !guides.some(g => g.icao === icao)).map(([icao, iata, name]) => ({ icao, iata, name, city: "" })),
];

export async function GET(request: Request) {
  const filter = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (filter.length < 2) return Response.json({ items: [], enabled: true }, { headers });

  if (avinodeStatus().enabled) {
    try {
      const items = await searchAvinodeAirports(filter);
      if (items.length) return Response.json({ items, enabled: true }, { headers });
    } catch { /* Keep airport entry usable when the remote directory is unavailable. */ }
  }

  const query = filter.toLowerCase();
  const items = directory
    .filter(item => [item.icao, item.iata, item.name, item.city].some(value => value?.toLowerCase().includes(query)))
    .sort((a, b) => Number([b.icao.toLowerCase(), b.iata?.toLowerCase()].includes(query)) - Number([a.icao.toLowerCase(), a.iata?.toLowerCase()].includes(query)))
    .slice(0, 8);
  return Response.json({ items, enabled: true }, { headers });
}
