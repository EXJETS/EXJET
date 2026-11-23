export const aircraftCapacity = { midsize: 8, large: 9, heavy: 13, ulr: 16 } as const;
export type AircraftCategory = keyof typeof aircraftCapacity;
export type TripType = "one_way" | "round_trip" | "multi_leg";
export type ItineraryLeg = {
  departure: string;
  destination: string;
  departureIcao?: string;
  destinationIcao?: string;
  date: string;
  time?: string;
};
export type Itinerary = { tripType: TripType; legs: ItineraryLeg[]; aircraftCategory?: AircraftCategory };

export const aircraftLabel: Record<AircraftCategory, string> = {
  midsize: "Midsize", large: "Large", heavy: "Heavy", ulr: "Ultra-long-range",
};
export const tripLabel: Record<TripType, string> = {
  one_way: "One way", round_trip: "Round trip", multi_leg: "Multi-leg",
};

export function civilDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function entry(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return trimmed.length <= max ? trimmed : null;
}

const normalized = (value: string) => value.trim().replace(/\s+/g, " ").toUpperCase();

function sameAirport(first: string, firstCode: string | undefined, second: string, secondCode: string | undefined) {
  if (firstCode && secondCode) return firstCode === secondCode;
  return normalized(first) === normalized(second) || Boolean(
    (firstCode && firstCode === normalized(second)) || (secondCode && secondCode === normalized(first)),
  );
}

function parseLeg(value: unknown, today: string, airportAliases: ReadonlyMap<string, string>): ItineraryLeg | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const departure = entry(raw.departure, 120);
  const destination = entry(raw.destination, 120);
  const date = entry(raw.date, 10);
  const time = raw.time === undefined ? "" : entry(raw.time, 5);
  const rawDepartureIcao = raw.departureIcao === undefined ? "" : entry(raw.departureIcao, 4)?.toUpperCase();
  const rawDestinationIcao = raw.destinationIcao === undefined ? "" : entry(raw.destinationIcao, 4)?.toUpperCase();
  const codePattern = /^[A-Z0-9]{4}$/;
  if (!departure || departure.length < 2 || !destination || destination.length < 2 ||
    !date || !civilDate(date) || date < today || time === null ||
    (time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) ||
    rawDepartureIcao === undefined || rawDestinationIcao === undefined ||
    (rawDepartureIcao && !codePattern.test(rawDepartureIcao)) ||
    (rawDestinationIcao && !codePattern.test(rawDestinationIcao))) return null;
  const departureIcao = rawDepartureIcao ? (airportAliases.get(rawDepartureIcao) ?? rawDepartureIcao) : airportAliases.get(normalized(departure));
  const destinationIcao = rawDestinationIcao ? (airportAliases.get(rawDestinationIcao) ?? rawDestinationIcao) : airportAliases.get(normalized(destination));
  if (sameAirport(departure, departureIcao, destination, destinationIcao)) return null;
  return { departure, destination, departureIcao, destinationIcao, date, time: time || undefined };
}

export function parseItinerary(
  raw: Record<string, unknown>,
  passengers: number,
  today: string,
  airportAliases: ReadonlyMap<string, string> = new Map(),
): Itinerary | null {
  const tripType = raw.tripType;
  if (tripType !== "one_way" && tripType !== "round_trip" && tripType !== "multi_leg") return null;
  if ((typeof raw.passengers !== "number" && (typeof raw.passengers !== "string" || !/^\d+$/.test(raw.passengers.trim()))) ||
      !Number.isInteger(passengers) || passengers < 1 || passengers > 100) return null;
  const category = raw.aircraftCategory;
  const hasCategory = category !== undefined && category !== null && category !== "";
  if (hasCategory && (typeof category !== "string" || !Object.hasOwn(aircraftCapacity, category))) return null;
  const aircraftCategory = hasCategory ? category as AircraftCategory : undefined;
  if (aircraftCategory ? passengers > aircraftCapacity[aircraftCategory] : passengers <= 16) return null;
  const count = Array.isArray(raw.legs) ? raw.legs.length : 0;
  if (!Array.isArray(raw.legs) || count < 1 || count > 6 ||
    (tripType === "one_way" && count !== 1) || (tripType === "round_trip" && count !== 2) ||
    (tripType === "multi_leg" && count < 2)) return null;
  const legs: ItineraryLeg[] = [];
  const latestLocalTimes = new Map<string, string>();
  for (const value of raw.legs) {
    const leg = parseLeg(value, today, airportAliases);
    if (!leg) return null;
    const prev = legs.at(-1);
    if (prev && leg.date < prev.date) return null;
    // Compare local wall times only for the same departure airport on the same day.
    const localKey = `${leg.date}:${leg.departureIcao || normalized(leg.departure)}`;
    const latestTime = latestLocalTimes.get(localKey);
    if (leg.time && latestTime && leg.time <= latestTime) return null;
    if (leg.time) latestLocalTimes.set(localKey, leg.time);
    legs.push(leg);
  }
  if (tripType === "round_trip") {
    const [outbound, inbound] = legs;
    if (!sameAirport(outbound.departure, outbound.departureIcao, inbound.destination, inbound.destinationIcao) ||
      !sameAirport(outbound.destination, outbound.destinationIcao, inbound.departure, inbound.departureIcao)) return null;
  }
  return { tripType, legs, aircraftCategory };
}

export function legLabel(leg: ItineraryLeg) {
  const from = leg.departureIcao && normalized(leg.departure) !== leg.departureIcao ? `${leg.departure} (${leg.departureIcao})` : leg.departure;
  const to = leg.destinationIcao && normalized(leg.destination) !== leg.destinationIcao ? `${leg.destination} (${leg.destinationIcao})` : leg.destination;
  return `${from} to ${to} · ${leg.date}${leg.time ? ` · ${leg.time} local` : " · time to be confirmed"}`;
}
