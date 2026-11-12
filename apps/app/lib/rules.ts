import type { IdType, ManifestRow, Trip, TripStatus } from "./api/types";

/** ICAO prefixes of US states and territories (contiguous K, Alaska PA/PF/PO/PP/PK, Hawaii PH, Guam PG, PR/USVI TJ/TI). */
const US_PREFIXES = ["K", "PA", "PF", "PO", "PP", "PK", "PH", "PG", "PM", "PW", "TJ", "TI"];

export function isUsIcao(icao: string): boolean {
  const c = icao.trim().toUpperCase();
  return c.length === 4 && US_PREFIXES.some((p) => c.startsWith(p));
}

/** Domestic-only trip: REAL ID. Any international leg: passport. Mirrors the trip state machine rule. */
export function requiredIdType(icaos: string[]): IdType {
  const all = icaos.filter(Boolean);
  return all.length > 0 && all.every(isUsIcao) ? "real_id" : "passport";
}

export function idTypeLabel(t: IdType | ""): string {
  return t === "passport" ? "Passport" : t === "real_id" ? "REAL ID" : "";
}

/** Force the ID type of every passenger to the required one. */
export function enforceIdType(rows: ManifestRow[], required: IdType): ManifestRow[] {
  return rows.map((r) => (r.id_type === required ? r : { ...r, id_type: required }));
}

export type PassengerErrors = Partial<Record<keyof ManifestRow, string>>;

export function validatePassenger(p: ManifestRow, required: IdType, today = new Date()): PassengerErrors {
  const e: PassengerErrors = {};
  if (!p.full_name.trim() || p.full_name.trim().split(/\s+/).length < 2) e.full_name = "Full legal name (first and last)";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date_of_birth) || new Date(p.date_of_birth) > today) e.date_of_birth = "Valid date of birth";
  if (p.id_type !== required) e.id_type = `${idTypeLabel(required)} is required for this trip`;
  if (!p.id_number.trim() && !(p.id && p.id_number_last4)) e.id_number = "ID number";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.id_expiry) || new Date(p.id_expiry) < today) e.id_expiry = "Unexpired ID required";
  if (!p.id_issuer.trim()) e.id_issuer = "Issuing state or country";
  return e;
}

export function manifestComplete(rows: ManifestRow[], required: IdType, pax: number): boolean {
  return rows.length === pax && rows.every((r) => Object.keys(validatePassenger(r, required)).length === 0);
}

export function emptyPassenger(required: IdType): ManifestRow {
  return { id: null, full_name: "", date_of_birth: "", id_type: required, id_number: "", id_number_last4: null, id_expiry: "", id_issuer: "" };
}

// ---- stage rail ----

export const STAGES = ["Request", "Aircraft", "RFQ", "Quotes", "Contract", "Payment", "Manifest", "Flight"] as const;
export type Stage = (typeof STAGES)[number];

export function acceptedQuote(trip: Trip) {
  return trip.quotes.find((q) => q.id === trip.accepted_quote_id || q.status === "accepted") ?? null;
}

/** Index in STAGES of the stage the member should act on now. */
export function currentStageIndex(trip: Trip): number {
  const q = acceptedQuote(trip);
  switch (trip.status as TripStatus) {
    case "draft":
      return 1;
    case "rfq_sent":
      return 2;
    case "quoted":
      return 3;
    case "contracted":
      return q?.contract && !q.contract.acknowledged_at ? 4 : 5;
    case "paid":
    case "manifest_due":
      return 6;
    case "scheduled":
    case "in_flight":
    case "completed":
      return 7;
    default:
      return 0;
  }
}

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  rfq_sent: "RFQ sent",
  quoted: "Quoted",
  contracted: "Contracted",
  paid: "Paid",
  manifest_due: "Manifest due",
  scheduled: "Scheduled",
  in_flight: "In flight",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type Tone = "neutral" | "ok" | "wait" | "problem";
export function statusTone(s: string): Tone {
  if (["completed", "scheduled", "in_flight", "paid", "contracted", "approved", "live", "active", "succeeded", "replied", "ready", "accepted", "loaded", "airborne", "landed", "done", "succeeded", "marked_paid"].includes(s)) return "ok";
  if (["rfq_sent", "quoted", "manifest_due", "pending", "pending_approval", "queued", "sent", "running", "needs_review", "past_due", "incomplete", "submitted", "in_review", "pending_ceo", "received", "scheduled_wait"].includes(s)) return "wait";
  if (["cancelled", "rejected", "failed", "declined", "expired", "canceled", "error", "blocked", "suspended"].includes(s)) return "problem";
  return "neutral";
}

export function nextAction(trip: Trip): string {
  const q = acceptedQuote(trip);
  switch (trip.status) {
    case "draft":
      return "Select aircraft and send RFQ";
    case "rfq_sent":
      return "Awaiting operator quotes";
    case "quoted":
      return "Review quotes";
    case "contracted":
      return q?.contract && !q.contract.acknowledged_at ? "Acknowledge contract" : "Pay operator";
    case "paid":
    case "manifest_due":
      return "Submit manifest";
    case "scheduled":
      return "View flight";
    case "in_flight":
      return "Track flight";
    case "completed":
      return "Completed";
    default:
      return "Cancelled";
  }
}

// ---- formatting ----

export function formatMoney(cents: number | null | undefined, currency = "USD"): string {
  if (cents === null || cents === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NAIVE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

/** Wall-clock text for a leg: `depart_local` (naive, at the origin airport) with the zone abbreviation from the instant. */
export function formatLegDeparture(leg: { depart_local: string | null; depart_at: string; origin_timezone: string | null }): string {
  const wall = leg.depart_local ?? leg.depart_at;
  const m = NAIVE.exec(wall);
  if (!m) return wall;
  let abbr = "";
  if (leg.origin_timezone) {
    try {
      abbr = new Intl.DateTimeFormat("en-US", { timeZone: leg.origin_timezone, timeZoneName: "short" }).formatToParts(new Date(leg.depart_at)).find((p) => p.type === "timeZoneName")?.value ?? "";
    } catch {
      abbr = "";
    }
  }
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}${m[4] ? ` ${m[4]}:${m[5]}` : ""}${abbr ? ` ${abbr}` : ""}`;
}

/** Instants (due dates, sent/replied times) are shown in the viewer's zone; strings with no offset are shown verbatim. */
export function formatWhen(s: string | null | undefined): string {
  if (!s) return "—";
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(s);
  if (!hasZone) {
    const m = NAIVE.exec(s);
    if (m) return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}${m[4] ? ` ${m[4]}:${m[5]}` : ""}`;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  const m = NAIVE.exec(s);
  if (m && !/(Z|[+-]\d{2}:?\d{2})$/.test(s)) return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function splitDepart(s: string | null | undefined): { date: string; time: string } {
  const m = s ? NAIVE.exec(s) : null;
  return m ? { date: `${m[1]}-${m[2]}-${m[3]}`, time: m[4] ? `${m[4]}:${m[5]}` : "" } : { date: "", time: "" };
}

export function joinDepart(date: string, time: string): string | null {
  if (!date) return null;
  return `${date}T${time || "00:00"}:00`;
}

export function countdown(dueIso: string, now = Date.now()): { overdue: boolean; text: string } {
  const ms = new Date(dueIso).getTime() - now;
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const d = Math.floor(h / 24);
  const text = d > 0 ? `${d}d ${h % 24}h` : `${h}h ${m}m`;
  return { overdue: ms < 0, text };
}

export function formatDuration(min: number | null | undefined): string {
  if (min === null || min === undefined) return "—";
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;
}

/** True if `field` (optionally for a leg) appears in the unresolved list in any of the tolerated spellings. */
export function isUnresolved(unresolved: string[] | undefined, field: string, leg?: number): boolean {
  if (!unresolved?.length) return false;
  return unresolved.some((u) => {
    const s = u.toLowerCase().replace(/\[(\d+)\]/g, ".$1");
    if (leg === undefined) return s === field;
    return s === `legs.${leg}.${field}` || s === `legs.${leg}` || (s === field && leg === 0) || s === `${field}.${leg}`;
  });
}

export function tripTitle(t: Trip): string {
  const l = t.legs;
  if (!l.length) return "Trip";
  const chain = [l[0].origin_icao, ...l.map((x) => x.destination_icao)];
  return chain.join(" – ");
}
