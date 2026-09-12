import "server-only";

import type { EmptyLeg } from "@/data/emptyLegs";
import {
  createAvinodeEmptyLegLeadPayload,
  createAvinodeLeadPayload,
  type ExjetAirport,
  type ExjetEmptyLegLeadInput,
  type ExjetLeadInput,
} from "./contracts";
import type { EmptyLegFeedResult, EmptyLegSearchInput } from "./emptyLegs";

type AvinodeMode = "disabled" | "sandbox" | "production";

type AvinodeRecord = {
  id?: string;
  icao?: string;
  iata?: string;
  name?: string;
  city?: string;
  country?: { name?: string } | string;
  attributes?: AvinodeRecord;
  [key: string]: unknown;
};

export class AvinodeError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "AvinodeError";
  }
}

function mode(): AvinodeMode {
  const value = process.env.AVINODE_MODE?.toLowerCase();
  return value === "sandbox" || value === "production" ? value : "disabled";
}

export function avinodeStatus() {
  const selectedMode = mode();
  const configured = Boolean(
    process.env.AVINODE_API_TOKEN &&
    process.env.AVINODE_AUTH_TOKEN &&
    process.env.AVINODE_BASE_URL,
  );
  return {
    mode: selectedMode,
    configured,
    enabled: configured && selectedMode !== "disabled",
  };
}

function headers() {
  const apiToken = process.env.AVINODE_API_TOKEN;
  const authToken = process.env.AVINODE_AUTH_TOKEN;
  if (!apiToken || !authToken) throw new Error("Avinode credentials are not configured");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
    "X-Avinode-ApiToken": apiToken,
    "X-Avinode-SentTimestamp": new Date().toISOString(),
    "X-Avinode-Product": process.env.AVINODE_PRODUCT || "EXJET-Website-v1.0",
    ...(process.env.AVINODE_ACT_AS_ACCOUNT
      ? { "X-Avinode-ActAsAccount": process.env.AVINODE_ACT_AS_ACCOUNT }
      : {}),
  };
}

function endpoint(path: string) {
  const base = process.env.AVINODE_BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("Avinode base URL is not configured");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function avinodeFetch(path: string, init?: RequestInit) {
  const status = avinodeStatus();
  if (!status.enabled) throw new Error("Avinode is not enabled for this environment");

  const response = await fetch(endpoint(path), {
    ...init,
    headers: { ...headers(), ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    const requestId = response.headers.get("x-request-id") ?? response.headers.get("x-avinode-request-id") ?? undefined;
    throw new AvinodeError(`Avinode request failed with status ${response.status}`, response.status, requestId);
  }
  return response;
}

function normalizeAirport(record: AvinodeRecord): ExjetAirport | null {
  const value = record.attributes ?? record;
  if (!value.icao || !value.name) return null;
  return {
    icao: value.icao,
    ...(value.iata ? { iata: value.iata } : {}),
    name: value.name,
    ...(value.city ? { city: value.city } : {}),
    ...(value.country
      ? { country: typeof value.country === "string" ? value.country : value.country.name }
      : {}),
  };
}

export async function searchAvinodeAirports(filter: string): Promise<ExjetAirport[]> {
  const params = new URLSearchParams({
    filter,
    filterMatchType: "contains",
    "page[number]": "1",
    "page[size]": "8",
  });
  ["icao", "iata", "name", "city", "country"].forEach((field) => params.append("fields[airports]", field));
  const response = await avinodeFetch(`/airports/search?${params}`);
  const payload = (await response.json()) as { data?: AvinodeRecord[] | { data?: AvinodeRecord[] } };
  const records = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.data?.data)
      ? payload.data.data
      : [];
  return records.map(normalizeAirport).filter((airport): airport is ExjetAirport => Boolean(airport));
}

export async function resolveAvinodeAirport(value: string): Promise<ExjetAirport | null> {
  const normalized = value.trim().toUpperCase();
  const airports = await searchAvinodeAirports(value);
  return airports.find((airport) => airport.icao.toUpperCase() === normalized || airport.iata?.toUpperCase() === normalized)
    ?? airports[0]
    ?? null;
}

export async function createAvinodeLead(input: ExjetLeadInput) {
  const response = await avinodeFetch("/leads", {
    method: "POST",
    body: JSON.stringify(createAvinodeLeadPayload(input)),
  });
  return response.json() as Promise<unknown>;
}


type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function textValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function nestedValue(record: JsonObject, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function airportValue(value: unknown) {
  const airport = object(value);
  if (!airport) return null;
  const attributes = object(airport.attributes) ?? airport;
  const icao = textValue(nestedValue(attributes, ["icao", "icaoCode", "code"]));
  if (!icao) return null;
  return {
    icao: icao.toUpperCase(),
    city: textValue(nestedValue(attributes, ["city", "cityName", "municipality"]))
      ?? textValue(nestedValue(object(attributes.location) ?? {}, ["city", "name"]))
      ?? textValue(nestedValue(attributes, ["name"]))
      ?? icao.toUpperCase(),
  };
}

function dateValue(value: unknown): string | undefined {
  const direct = textValue(value);
  if (direct) return direct.slice(0, 10);
  const record = object(value);
  if (!record) return undefined;
  return textValue(nestedValue(record, ["date", "departureDate", "localDate"]))?.slice(0, 10);
}

function timeValue(value: unknown): string | undefined {
  const direct = textValue(value);
  if (direct && /^\d{1,2}:\d{2}/.test(direct)) return direct.slice(0, 5);
  const record = object(value);
  if (!record) return undefined;
  return textValue(nestedValue(record, ["time", "departureTime", "localTime"]))?.slice(0, 5);
}

function collectObjects(value: unknown, results: JsonObject[] = [], seen = new Set<object>()): JsonObject[] {
  if (!value || typeof value !== "object" || seen.has(value as object)) return results;
  seen.add(value as object);
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, results, seen));
    return results;
  }
  const record = value as JsonObject;
  results.push(record);
  Object.values(record).forEach((item) => collectObjects(item, results, seen));
  return results;
}

function normalizeEmptyLeg(record: JsonObject, searchId: string): EmptyLeg | null {
  const attributes = object(record.attributes) ?? record;
  const id = textValue(nestedValue(record, ["id", "emptyLegId"]))
    ?? textValue(nestedValue(attributes, ["id", "emptyLegId"]));
  if (!id || !id.toLowerCase().startsWith("el-")) return null;

  const departure = airportValue(nestedValue(attributes, ["startAirport", "departureAirport", "originAirport", "fromAirport"]));
  const arrival = airportValue(nestedValue(attributes, ["endAirport", "arrivalAirport", "destinationAirport", "toAirport"]));
  if (!departure || !arrival) return null;

  const departureDateTime = nestedValue(attributes, ["dateTime", "departureDateTime", "startDateTime"]);
  const departureDate = dateValue(nestedValue(attributes, ["date", "departureDate", "startDate"]))
    ?? dateValue(departureDateTime);
  if (!departureDate) return null;

  const aircraft = object(nestedValue(attributes, ["aircraft", "aircraftType", "aircraftCategory"])) ?? {};
  const aircraftModel = textValue(nestedValue(attributes, ["aircraftModel", "aircraftTypeName", "model"]))
    ?? textValue(nestedValue(aircraft, ["name", "model", "displayName"]));
  const aircraftCategory = textValue(nestedValue(attributes, ["aircraftCategory", "categoryName", "category"]))
    ?? textValue(nestedValue(aircraft, ["category", "categoryName", "class"]))
    ?? "Private aircraft";
  const seatsRaw = Number(nestedValue(attributes, ["paxCapacity", "passengerCapacity", "seats", "maxPassengers"]));
  const departureTime = timeValue(nestedValue(attributes, ["departureTime", "startTime"])) ?? timeValue(departureDateTime);

  return {
    id,
    searchId,
    departureAirport: departure.icao,
    departureCity: departure.city,
    arrivalAirport: arrival.icao,
    arrivalCity: arrival.city,
    departureDate,
    ...(departureTime ? { departureWindow: departureTime } : {}),
    aircraftCategory,
    ...(aircraftModel ? { aircraftModel } : {}),
    ...(Number.isFinite(seatsRaw) && seatsRaw > 0 ? { seats: seatsRaw } : {}),
  };
}

export async function searchAvinodeEmptyLegs(input: EmptyLegSearchInput): Promise<EmptyLegFeedResult> {
  const response = await avinodeFetch("/emptylegs/search", {
    method: "POST",
    body: JSON.stringify({
      ...(input.departureIcao ? { startAirport: { icao: input.departureIcao.toUpperCase() } } : {}),
      ...(input.arrivalIcao ? { endAirport: { icao: input.arrivalIcao.toUpperCase() } } : {}),
      date: input.departureDate,
      numberOfDaysFlexibility: String(Math.max(0, Math.min(input.flexibilityDays ?? 3, 14))),
      requiredPartnerships: [],
      passengers: String(Math.max(1, Math.min(input.passengers, 100))),
    }),
  });
  const payload = await response.json() as unknown;
  const root = object(payload) ?? {};
  const data = object(root.data);
  const searchId = textValue(nestedValue(root, ["searchId", "id"]))
    ?? textValue(data ? nestedValue(data, ["searchId", "id"]) : undefined)
    ?? "";
  const items = searchId
    ? collectObjects(payload)
      .map((record) => normalizeEmptyLeg(record, searchId))
      .filter((item): item is EmptyLeg => Boolean(item))
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
    : [];
  return { items, fetchedAt: new Date().toISOString(), source: "avinode" };
}

export async function createAvinodeEmptyLegLead(input: ExjetEmptyLegLeadInput) {
  const response = await avinodeFetch("/leads", {
    method: "POST",
    body: JSON.stringify(createAvinodeEmptyLegLeadPayload(input)),
  });
  return response.json() as Promise<unknown>;
}
