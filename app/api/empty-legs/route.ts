import { readObject, intakeError, createRateLimit, notPastAnywhere } from "@/lib/request";
import {
  avinodeStatus,
  resolveAvinodeAirport,
  searchAvinodeEmptyLegs,
} from "@/integration/avinode/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const throttled = createRateLimit(12);

function clean(value: unknown, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (throttled(request)) return Response.json({ error: "Too many requests. Please try again later or contact EXJET." }, { status: 429, headers: { "Retry-After": "600", "Cache-Control": "no-store" } });
  const status = avinodeStatus();
  if (!status.enabled) {
    return Response.json({ error: "Online availability is unavailable. Please call or email EXJET for current options.", enabled: false }, { status: 503 });
  }

  let raw: Record<string, unknown>;
  try { raw = await readObject(request); } catch (error) { return intakeError(error); }

  const departure = clean(raw.departure);
  const destination = clean(raw.destination);
  const date = clean(raw.date, 10);
  const passengers = Number(raw.passengers ?? 2);
  const flexibilityDays = Number(raw.flexibilityDays ?? 3);
  if ((!departure && !destination) || !notPastAnywhere(date) || !Number.isInteger(passengers) || passengers < 1 || passengers > 100) {
    return Response.json({ error: "Enter at least one airport, a future date, and a valid passenger count." }, { status: 400 });
  }

  try {
    const [startAirport, endAirport] = await Promise.all([
      departure ? resolveAvinodeAirport(departure) : Promise.resolve(null),
      destination ? resolveAvinodeAirport(destination) : Promise.resolve(null),
    ]);
    if ((departure && !startAirport) || (destination && !endAirport)) {
      return Response.json({ error: "We could not match one of those airports. Try an ICAO or IATA code." }, { status: 422 });
    }
    const result = await searchAvinodeEmptyLegs({
      departureIcao: startAirport?.icao,
      arrivalIcao: endAirport?.icao,
      departureDate: date,
      flexibilityDays: Number.isFinite(flexibilityDays) ? flexibilityDays : 3,
      passengers,
    });
    return Response.json({
      ...result,
      enabled: true,
      resolved: { departure: startAirport ?? undefined, destination: endAirport ?? undefined },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[avinode] Empty-leg search failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Live availability could not be reached. Please try again shortly.", enabled: true }, { status: 502 });
  }
}
