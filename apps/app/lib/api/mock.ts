/**
 * In-memory mock of the EXJET API v1. Loaded ONLY when NEXT_PUBLIC_API_MOCK=1 (dynamic import from client.ts).
 * All data is SYNTHETIC. State persists in localStorage so a page reload keeps the session.
 */
import { requiredIdType } from "../rules";
import { MOCK_AIRPORTS, MOCK_CATEGORIES, MOCK_LISTING_SEED, MOCK_OPERATORS, MOCK_TYPES } from "./mock-data";
import type {
  AdminOperator, AgentAction, Approval, IngestRun, Job, KycSubmissionDetail, Listing, ManifestPassenger, Me, Quote, Rfq,
  Trip, TripIntake, TripStatus,
} from "./types";
import type { RequestOptions } from "./client";

export type Persona = "visitor" | "member" | "entitled" | "admin";

interface TripRec extends Trip {
  manifest_passengers: ManifestPassenger[];
  position_progress: number | null;
}
interface Db {
  persona: Persona;
  me: Me | null;
  seq: number;
  trips: TripRec[];
  kyc: { submittedAt: number; id: string } | null;
  seats: string[];
  approvals: Approval[];
  kycRows: KycSubmissionDetail[];
  operators: AdminOperator[];
  ingestRuns: IngestRun[];
  jobs: Job[];
  actions: AgentAction[];
}

const KEY = "exjet-mock-db-v1";
const SYN_DOC = "/mock/synthetic-document.pdf";
const EXCLUDED = ["netjets", "flexjet", "nicholas air"];

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

function personaMe(p: Persona): Me | null {
  if (p === "visitor") return null;
  const base = {
    user: { id: "usr_syn_1", email: "member@example.com", full_name: "SYNTHETIC Member", role: "member" },
    account: { id: "acc_syn_1", type: "individual", display_name: "SYNTHETIC Member", seats: 1, kyc_status: "not_started" as const },
    subscription: null as Me["subscription"],
    entitled: false,
    next_step: "kyc" as Me["next_step"],
  };
  if (p === "member") return base;
  const sub = { plan: "individual", status: "active", current_period_end: new Date(Date.now() + 20 * 86_400_000).toISOString() };
  if (p === "entitled") return { ...base, account: { ...base.account, kyc_status: "approved" }, subscription: sub, entitled: true, next_step: "ready" };
  return {
    user: { id: "usr_syn_admin", email: "admin@example.com", full_name: "SYNTHETIC Admin", role: "admin" },
    account: { id: "acc_syn_admin", type: "individual", display_name: "SYNTHETIC Admin", seats: 1, kyc_status: "approved" },
    subscription: sub,
    entitled: true,
    next_step: "ready",
  };
}

function seed(persona: Persona = "visitor"): Db {
  return {
    persona,
    me: personaMe(persona),
    seq: 1,
    trips: [],
    kyc: null,
    seats: [],
    approvals: [
      { id: "apr_1", kind: "kyc_decision", status: "pending", summary: "KYC submission from SYNTHETIC Applicant One (individual, passport)", subject_type: "kyc_submission", subject_id: "kyc_1", requested_by: "kyc.vendor_check", requested_at: ago(95), decided_at: null, decision_note: null, payload: { signals: "vendor check passed (synthetic)" } },
      { id: "apr_2", kind: "operator_go_live", status: "pending", summary: "Go-live for SYNTHETIC Test Operator C", subject_type: "operator", subject_id: "op_syn_c", requested_by: "admin", requested_at: ago(300), decided_at: null, decision_note: null, payload: { rfq_dispatch_policy: true } },
      { id: "apr_3", kind: "operator_go_live", status: "approved", summary: "Go-live for SYNTHETIC Test Operator A", subject_type: "operator", subject_id: "op_syn_a", requested_by: "admin", requested_at: ago(4000), decided_at: ago(3900), decision_note: "Certificate verified (synthetic).", payload: null },
    ],
    kycRows: [
      { id: "kyc_1", status: "pending", kind: "individual", holder_name: "SYNTHETIC Applicant One", business_name: null, created_at: ago(95), business_tax_id: null, decision_note: null, approval_id: "apr_1", documents: [{ id: "doc_1", doc_type: "passport", filename: "synthetic-passport.pdf", url: SYN_DOC }], signals: [{ name: "document_check", result: "pass", detail: "Synthetic signal" }, { name: "selfie_match", result: "pass", detail: null }] },
    ],
    operators: [
      { id: "op_syn_a", dba_name: MOCK_OPERATORS[0].dba_name, certificate_type: "Part 135", go_live_status: "live", tail_count: 5 },
      { id: "op_syn_b", dba_name: MOCK_OPERATORS[1].dba_name, certificate_type: "Part 135", go_live_status: "live", tail_count: 5 },
      { id: "op_syn_c", dba_name: MOCK_OPERATORS[2].dba_name, certificate_type: "Part 135", go_live_status: "pending_approval", tail_count: 4 },
    ],
    ingestRuns: [
      { id: "run_1", dataset: "operators", filename: "synthetic-operators.csv", status: "succeeded", loaded_count: 3, rejected_count: 1, started_at: ago(1500), finished_at: ago(1499), report: { rejections: [{ row: 4, reason: "Operator excluded by policy" }] } },
    ],
    jobs: [
      { id: "job_1", kind: "mail.poll_inbox", status: "succeeded", attempts: 1, run_at: ago(2), last_error: null, created_at: ago(2) },
      { id: "job_2", kind: "kyc.vendor_check", status: "succeeded", attempts: 1, run_at: ago(96), last_error: null, created_at: ago(97) },
      { id: "job_3", kind: "flight.watch", status: "failed", attempts: 3, run_at: ago(40), last_error: "Provider timeout (synthetic)", created_at: ago(180) },
    ],
    actions: [
      { id: "act_1", agent: "operations", action: "rfq.chase", status: "blocked", summary: "No approval record for outreach purpose (synthetic)", created_at: ago(60) },
    ],
  };
}

let cache: Db | null = null;
function db(): Db {
  if (cache) return cache;
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      cache = JSON.parse(raw) as Db;
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = seed();
  return cache;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

// ---------- dev controls (used by the mock switcher) ----------
export function mockPersona(): Persona {
  return db().persona;
}
export function mockSetPersona(p: Persona) {
  const d = db();
  d.persona = p;
  d.me = personaMe(p);
  save();
}
export function mockReset() {
  cache = seed();
  save();
}
/** Make every sent RFQ reply now (as if the operator answered quotes@). */
export function mockSimulateReplies() {
  const d = db();
  d.trips.forEach((t) => settleReplies(t, true));
  save();
}
export function mockSetSubscription(plan: string): Me | null {
  const d = db();
  if (!d.me) return null;
  d.me.subscription = { plan, status: "active", current_period_end: new Date(Date.now() + 30 * 86_400_000).toISOString() };
  if (plan === "family_office") d.me.account.seats = 2;
  const kycOk = d.me.account.kyc_status === "approved";
  d.me.entitled = kycOk;
  d.me.next_step = kycOk ? "ready" : d.me.account.kyc_status === "pending" ? "kyc_pending" : "kyc";
  save();
  return d.me;
}
export function mockAdvanceFlight() {
  const d = db();
  const t = [...d.trips].reverse().find((x) => ["scheduled", "in_flight"].includes(x.status));
  if (!t) return false;
  t.status = "in_flight";
  t.position_progress = Math.min(0.9, (t.position_progress ?? 0.1) + 0.3);
  save();
  return true;
}

// ---------- helpers ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
class MockErr {
  constructor(public status: number, public code: string, public message: string) {}
}
const fail = (status: number, code: string, message: string): never => {
  throw new MockErr(status, code, message);
};
const nid = (p: string) => `${p}_${db().seq++}_${Math.random().toString(36).slice(2, 7)}`;

function needAuth(): Me {
  const m = db().me;
  if (!m) fail(401, "unauthenticated", "Sign in to continue.");
  return m as Me;
}
function needAdmin(): Me {
  const m = needAuth();
  if (m.user.role !== "admin") fail(403, "forbidden", "Admin access required.");
  return m;
}
function needEntitled(): Me {
  const m = needAuth();
  if (!m.entitled) fail(403, "not_entitled", "KYC approval and an active membership are required.");
  return m;
}
const entitled = () => !!db().me?.entitled;

function haversineNm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 3440.065;
  const r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Coordinates used only by the mock matcher/track (real airport locations, approximate).
const COORDS: Record<string, [number, number]> = {
  KTEB: [40.85, -74.06], KHPN: [41.07, -73.71], KJFK: [40.64, -73.78], KBOS: [42.36, -71.01], KPBI: [26.68, -80.1],
  KMIA: [25.79, -80.29], KOPF: [25.91, -80.28], KPDK: [33.88, -84.3], KATL: [33.64, -84.43], KMDW: [41.79, -87.75],
  KORD: [41.98, -87.9], KDAL: [32.85, -96.85], KDFW: [32.9, -97.04], KHOU: [29.65, -95.28], KAUS: [30.2, -97.67],
  KAPA: [39.57, -104.85], KASE: [39.22, -106.87], KEGE: [39.64, -106.92], KSDL: [33.62, -111.91], KLAS: [36.08, -115.15],
  KVNY: [34.21, -118.49], KLAX: [33.94, -118.41], KSFO: [37.62, -122.38], KSNA: [33.68, -117.87], KTEX: [37.95, -107.91],
  KSEA: [47.45, -122.31], KBFI: [47.53, -122.3], KIAD: [38.95, -77.46], MMSD: [23.15, -109.72],
};
const pt = (icao: string) => {
  const c = COORDS[icao];
  return c ? { lat: c[0], lon: c[1] } : null;
};
const ROUTING = 1.07;

function legDistance(o: string, d: string): number | null {
  const a = pt(o), b = pt(d);
  return a && b ? Math.round(haversineNm(a, b) * ROUTING) : null;
}

function viewListing(l: Listing): Listing {
  if (entitled()) return l;
  return { ...l, tail_number: null, operator: null };
}

let LISTINGS: Listing[] | null = null;
function allListings(): Listing[] {
  if (LISTINGS) return LISTINGS;
  LISTINGS = MOCK_LISTING_SEED.map(([slug, opIdx, home, seats, year, refurb, rating, amenities], i) => {
    const t = MOCK_TYPES.find((x) => x.slug === slug)!;
    const op = MOCK_OPERATORS[opIdx];
    return {
      listing_id: `lst_syn_${String(i + 1).padStart(3, "0")}`,
      type: { slug: t.slug, manufacturer: t.manufacturer, model: t.model, category: t.category },
      year_of_manufacture: year,
      year_refurbished: refurb,
      passenger_seats: seats,
      home_city: home,
      amenities,
      photos: [],
      safety_rating: rating,
      tail_number: `N00TST${i + 1}`,
      operator: { id: op.id, dba_name: op.dba_name, certificate_type: op.certificate_type, contacts: [op.contact] },
    };
  });
  return LISTINGS;
}

// ---------- matching ----------
function matchTrip(t: Trip) {
  const dists = t.legs.map((l) => legDistance(l.origin_icao, l.destination_icao) ?? 0);
  const rejected: { slug: string; reasons: string[] }[] = [];
  const byCat = new Map<string, { slug: string; model: string; stops: 0 | 1; fuel_stop_icao: string | null; flight_time_minutes: number | null; listing_count: number }[]>();
  const apt = (c: string) => MOCK_AIRPORTS.find((a) => a.icao === c);
  for (const ty of MOCK_TYPES) {
    const reasons: string[] = [];
    if (t.passengers > ty.max_passengers) reasons.push("passengers_exceed_capacity");
    const cuft = t.checked_bags * 5 + t.carry_on_bags * 2 + t.golf_bags * 6 + t.ski_bags * 4;
    if (cuft > ty.baggage_cuft) reasons.push("baggage_exceeds_capacity");
    const payload = Math.max(0.8, 1 - Math.max(0, t.passengers - 4) * 0.02);
    const eff = ty.range_nm * payload;
    let stops: 0 | 1 = 0;
    let fuel: string | null = null;
    let timeMin = 0;
    for (const [i, l] of t.legs.entries()) {
      for (const c of [l.origin_icao, l.destination_icao]) {
        const a = apt(c);
        if (!a || a.longest_runway_ft === null) {
          reasons.push("airport_data_missing");
          continue;
        }
        const need = ty.min_runway_ft * (1 + 0.03 * ((a.elevation_ft ?? 0) / 1000));
        if (a.longest_runway_ft < need) reasons.push(`runway_too_short_${c}`);
      }
      const d = dists[i];
      if (!d) {
        reasons.push("distance_unknown");
        continue;
      }
      if (d <= eff) {
        timeMin += Math.round((d / ty.cruise_speed_kts) * 60 + 20);
      } else {
        const o = pt(l.origin_icao)!, de = pt(l.destination_icao)!;
        let best: { icao: string; total: number } | null = null;
        for (const a of MOCK_AIRPORTS) {
          const p = pt(a.icao);
          if (!p || a.icao === l.origin_icao || a.icao === l.destination_icao) continue;
          if ((a.longest_runway_ft ?? 0) < ty.min_runway_ft) continue;
          const d1 = haversineNm(o, p) * ROUTING, d2 = haversineNm(p, de) * ROUTING;
          if (d1 <= eff && d2 <= eff && (!best || d1 + d2 < best.total)) best = { icao: a.icao, total: d1 + d2 };
        }
        if (best) {
          stops = 1;
          fuel = best.icao;
          timeMin += Math.round((best.total / ty.cruise_speed_kts) * 60 + 50);
        } else reasons.push("range_exceeded");
      }
    }
    if (reasons.length) {
      rejected.push({ slug: ty.slug, reasons: [...new Set(reasons)] });
      continue;
    }
    const lc = allListings().filter((x) => x.type.slug === ty.slug && (x.passenger_seats ?? 0) >= t.passengers).length;
    const arr = byCat.get(ty.category) ?? [];
    arr.push({ slug: ty.slug, model: ty.model, stops, fuel_stop_icao: fuel, flight_time_minutes: timeMin, listing_count: lc });
    byCat.set(ty.category, arr);
  }
  return {
    legs: dists.map((d) => ({ distance_nm: d })),
    categories: MOCK_CATEGORIES.filter((c) => byCat.has(c.category)).map((c) => ({ category: c.category, types: byCat.get(c.category)! })),
    rejected,
  };
}

// ---------- quotes / replies ----------
function settleReplies(t: TripRec, force = false) {
  if (t.status !== "rfq_sent" && t.status !== "quoted") return;
  const now = Date.now();
  let changed = false;
  t.rfqs.forEach((r, i) => {
    if (r.kind !== "charter" || r.status !== "sent" || !r.sent_at) return;
    if (!force && now - new Date(r.sent_at).getTime() < 3000) return;
    if (i >= 2) return; // later RFQs stay unanswered so the table shows a waiting state
    r.status = "replied";
    r.replied_at = new Date().toISOString();
    const n = t.quotes.length + 1;
    const total = i === 0 ? 1_234_500 : 1_456_700;
    const l = r.listing!;
    const q: Quote = {
      id: nid("qte"),
      status: "ready",
      operator: l.operator ? { dba_name: l.operator.dba_name } : null,
      listing: l,
      total_amount_cents: total,
      currency: "USD",
      valid_until: new Date(Date.now() + 72 * 3_600_000).toISOString(),
      operator_quote_number: `SYN-Q-${String(n).padStart(4, "0")}`,
      line_items: [
        { description: "Charter flight, all legs (SYNTHETIC)", amount_cents: total - 123_400, page: 1 },
        { description: "Taxes and segment fees (SYNTHETIC)", amount_cents: 123_400, page: 2 },
      ],
      quote_pdf_url: "/mock/synthetic-quote.pdf",
      contract: { id: nid("ctr"), pdf_url: "/mock/synthetic-contract.pdf", acknowledged_at: null },
      payment_link: { url: `https://pay.example.com/synthetic/${r.reference}`, host: "pay.example.com", status: "open" },
    };
    t.quotes.push(q);
    changed = true;
  });
  if (changed && t.status === "rfq_sent") t.status = "quoted";
  if (changed) save();
}

function tripView(t: TripRec): Trip {
  settleReplies(t);
  const { manifest_passengers: _mp, position_progress: _pp, ...rest } = t;
  void _mp; void _pp;
  const e = entitled();
  const tv: Trip = {
    ...rest,
    rfqs: rest.rfqs.map((r) => ({ ...r, listing: r.listing ? viewListing(r.listing) : null })),
    quotes: e ? rest.quotes : [],
    weather_available: ["manifest_due", "scheduled", "in_flight", "completed"].includes(t.status),
  };
  return JSON.parse(JSON.stringify(tv));
}

function findTrip(id: string): TripRec {
  const t = db().trips.find((x) => x.id === id);
  if (!t) fail(404, "not_found", "Trip not found.");
  return t as TripRec;
}

// ---------- intake parser (deterministic, regex based; stands in for the LLM parser) ----------
function resolveAirport(frag: string): string | null {
  const s = frag.toLowerCase().trim();
  if (!s) return null;
  for (const a of MOCK_AIRPORTS) {
    if (s === a.icao.toLowerCase() || s === a.iata?.toLowerCase()) return a.icao;
  }
  for (const a of MOCK_AIRPORTS) {
    const nameW = a.name.toLowerCase();
    if (s.includes(a.city.toLowerCase()) || nameW.includes(s) || s.includes(nameW.split(" ")[0])) return a.icao;
  }
  return null;
}
const DOW = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
function parseWhen(text: string, afterDate?: string): { date: string | null; time: string | null } {
  const t = text.toLowerCase();
  let date: string | null = null;
  const iso = /(\d{4}-\d{2}-\d{2})/.exec(t);
  if (iso) date = iso[1];
  const dow = new RegExp(`(next\\s+)?(${DOW.join("|")})`).exec(t);
  if (!date && dow) {
    const base = afterDate ? new Date(afterDate + "T12:00:00") : new Date();
    const target = DOW.indexOf(dow[2]);
    let diff = (target - base.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    base.setDate(base.getDate() + diff);
    date = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
  }
  let time: string | null = null;
  const tm = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/.exec(t) ?? /\b(\d{1,2}):(\d{2})\b/.exec(t);
  if (tm) {
    let h = Number(tm[1]);
    const mm = tm[2] ?? "00";
    const ap = tm[3];
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    time = `${String(h).padStart(2, "0")}:${mm}`;
  }
  return { date, time };
}
function intake(text: string): TripIntake {
  const unresolved: string[] = [];
  const t = text.trim();
  const low = t.toLowerCase();
  const m = /(.+?)\s+to\s+(.+?)(?:\s+(?:next|on|this|tomorrow|at|\d{4}-)|,|$)/i.exec(t);
  const o = m ? resolveAirport(m[1]) : null;
  const d = m ? resolveAirport(m[2]) : null;
  if (!o) unresolved.push("legs[0].origin_icao");
  if (!d) unresolved.push("legs[0].destination_icao");
  const w = parseWhen(t);
  const legs = [{ origin_icao: o ?? "", destination_icao: d ?? "", depart_at: w.date ? `${w.date}T${w.time ?? "09:00"}:00` : null }];
  if (!w.date) unresolved.push("legs[0].depart_at");
  else if (!w.time) unresolved.push("legs[0].depart_time");
  let tripType: TripIntake["trip_type"] = "one_way";
  if (/round\s*trip|return|back/.test(low)) {
    tripType = "round_trip";
    const ret = /(?:return(?:ing)?|back)\s+(.*)$/i.exec(t);
    const rw = ret ? parseWhen(ret[1], w.date ?? undefined) : { date: null, time: null };
    legs.push({ origin_icao: d ?? "", destination_icao: o ?? "", depart_at: rw.date ? `${rw.date}T${rw.time ?? "09:00"}:00` : null });
    if (!rw.date) unresolved.push("legs[1].depart_at");
  }
  const num = (re: RegExp) => {
    const x = re.exec(low);
    return x ? Number(x[1]) : 0;
  };
  let pax = num(/(\d+)\s*(?:passengers?|pax|people|travell?ers|guests)/);
  if (!pax) {
    pax = 1;
    unresolved.push("passengers");
  }
  return {
    trip_type: tripType,
    legs,
    passengers: pax,
    checked_bags: num(/(\d+)\s*(?:checked|suitcases?)/),
    carry_on_bags: num(/(\d+)\s*carry/),
    golf_bags: num(/(\d+)\s*golf/),
    ski_bags: num(/(\d+)\s*ski/),
    unresolved,
    confidence: Math.max(0.2, 0.95 - unresolved.length * 0.2),
  };
}

// ---------- router ----------
type Handler = (m: RegExpExecArray, o: RequestOptions) => unknown | Promise<unknown>;
interface Route { method: string; re: RegExp; h: Handler; status?: number }
const routes: Route[] = [];
const route = (method: string, pattern: string, h: Handler, status = 200) =>
  routes.push({ method, re: new RegExp(`^${pattern.replace(/\{(\w+)\}/g, "([^/]+)")}$`), h, status });

route("POST", "/auth/signup", (_m, o) => {
  const b = o.body as { email: string; password: string; full_name: string; account_type: string };
  if (!b.email || !b.password || !b.full_name) fail(422, "validation_error", "Email, password and full name are required.");
  if (b.password.length < 10) fail(422, "validation_error", "Password must be at least 10 characters.");
  const d = db();
  d.persona = "member";
  d.me = {
    user: { id: nid("usr"), email: b.email, full_name: b.full_name, role: "member" },
    account: { id: nid("acc"), type: b.account_type, display_name: b.full_name, seats: b.account_type === "family_office" ? 2 : 1, kyc_status: "not_started" },
    subscription: null,
    entitled: false,
    next_step: "kyc",
  };
  d.kyc = null;
  save();
  return d.me;
}, 201);
route("POST", "/auth/login", (_m, o) => {
  const b = o.body as { email: string; password: string };
  if (!b.email || !b.password) fail(401, "invalid_credentials", "Email or password is incorrect.");
  const d = db();
  if (!d.me) {
    d.persona = "entitled";
    d.me = { ...personaMe("entitled")!, user: { ...personaMe("entitled")!.user, email: b.email } };
    save();
  }
  return d.me;
});
route("POST", "/auth/logout", () => {
  const d = db();
  d.persona = "visitor";
  d.me = null;
  save();
  return null;
}, 204);
function refreshKyc() {
  const d = db();
  if (d.me && d.kyc && d.me.account.kyc_status === "pending" && Date.now() - d.kyc.submittedAt > 4000) {
    d.me.account.kyc_status = "approved";
    d.me.next_step = d.me.subscription?.status === "active" ? "ready" : "billing";
    d.me.entitled = d.me.subscription?.status === "active";
    save();
  }
}
route("GET", "/me", () => {
  refreshKyc();
  return needAuth();
});
route("POST", "/account/seats", (_m, o) => {
  const m = needAuth();
  if (m.account.type !== "family_office") fail(409, "invalid_state", "Only Family Office accounts have a second seat.");
  const email = (o.body as { email: string }).email;
  if (!email) fail(422, "validation_error", "Email is required.");
  db().seats.push(email);
  save();
  return { email, status: "invited" };
}, 201);

route("POST", "/kyc/submissions", (_m, o) => {
  const m = needAuth();
  const f = o.form;
  if (!f || !f.get("holder_name")) fail(422, "validation_error", "Account holder name is required.");
  if (f!.getAll("files").length === 0) fail(422, "validation_error", "At least one document is required.");
  const d = db();
  const id = nid("kyc");
  d.kyc = { id, submittedAt: Date.now() };
  m.account.kyc_status = "pending";
  m.next_step = "kyc_pending";
  save();
  return { id, status: "pending" };
}, 201);
route("GET", "/kyc/status", () => {
  const m = needAuth();
  refreshKyc();
  const d = db();
  return {
    kyc_status: m.account.kyc_status,
    latest_submission: d.kyc ? { id: d.kyc.id, status: m.account.kyc_status, created_at: new Date(d.kyc.submittedAt).toISOString(), decision_note: null } : null,
  };
});

route("GET", "/billing/plans", () => [
  { plan: "individual", name: "Individual", unit_amount_cents: 75000, interval: "month", seats: 1 },
  { plan: "family_office", name: "Family Office", unit_amount_cents: 100000, interval: "month", seats: 2 },
]);
route("POST", "/billing/checkout", (_m, o) => {
  needAuth();
  const plan = (o.body as { plan: string }).plan;
  return { checkout_url: `/mock/checkout?plan=${encodeURIComponent(plan)}` };
});
route("POST", "/billing/portal", () => {
  needAuth();
  return { url: "/account?portal=mock" };
});
route("POST", "/billing/enterprise-inquiry", (_m, o) => {
  const b = o.body as { company: string; seats: number };
  if (!b.company) fail(422, "validation_error", "Company is required.");
  return null;
}, 202);

route("GET", "/airports", (_m, o) => {
  const q = String(o.query?.q ?? "").toLowerCase().trim();
  if (!q) return [];
  return MOCK_AIRPORTS.filter((a) => [a.icao, a.iata ?? "", a.name, a.city].some((s) => s.toLowerCase().includes(q))).slice(0, 8);
});
route("GET", "/categories", () =>
  MOCK_CATEGORIES.map((c) => ({ ...c, type_count: MOCK_TYPES.filter((t) => t.category === c.category).length })));
const typeView = (t: (typeof MOCK_TYPES)[number]) => ({
  slug: t.slug, manufacturer: t.manufacturer, model: t.model, category: t.category,
  max_passengers: t.max_passengers, range_nm: t.range_nm, cruise_speed_kts: t.cruise_speed_kts, baggage_cuft: t.baggage_cuft,
});
route("GET", "/aircraft-types", (_m, o) => MOCK_TYPES.filter((t) => !o.query?.category || t.category === o.query.category).map(typeView));
route("GET", "/aircraft-types/{slug}", (m) => {
  const t = MOCK_TYPES.find((x) => x.slug === m[1]);
  if (!t) fail(404, "not_found", "Aircraft type not found.");
  return typeView(t!);
});
route("GET", "/listings", (_m, o) =>
  allListings()
    .filter((l) => (!o.query?.type_slug || l.type.slug === o.query.type_slug) && (!o.query?.category || l.type.category === o.query.category) && (!o.query?.home || (l.home_city ?? "").toLowerCase().includes(String(o.query.home).toLowerCase())))
    .map(viewListing));
route("GET", "/empty-legs", () => {
  const L = allListings();
  const mk = (i: number, o: string, d: string, fromDays: number) => ({
    id: `el_syn_${i}`,
    origin: o,
    destination: d,
    available_from: new Date(Date.now() + fromDays * 86_400_000).toISOString(),
    available_to: new Date(Date.now() + (fromDays + 2) * 86_400_000).toISOString(),
    listing: viewListing(L[i]),
  });
  return [mk(2, "KTEB", "KPBI", 2), mk(7, "KTEB", "KBOS", 3), mk(8, "KVNY", "KLAS", 4), mk(13, "KLAS", "KVNY", 5)];
});

route("POST", "/trips/intake", (_m, o) => {
  needAuth();
  const text = (o.body as { text: string }).text ?? "";
  if (text.trim().length < 5) fail(422, "validation_error", "Describe the trip in a sentence.");
  return intake(text);
});
route("POST", "/trips", (_m, o) => {
  const m = needAuth();
  void m;
  const b = o.body as Trip;
  if (!b.legs?.length || b.legs.some((l) => !l.origin_icao || !l.destination_icao || !l.depart_at)) fail(422, "validation_error", "Every leg needs an origin, destination and departure.");
  if (!(b.passengers >= 1)) fail(422, "validation_error", "At least one passenger is required.");
  const t: TripRec = {
    id: nid("trp"),
    status: "draft",
    trip_type: b.trip_type,
    passengers: b.passengers,
    checked_bags: b.checked_bags ?? 0,
    carry_on_bags: b.carry_on_bags ?? 0,
    golf_bags: b.golf_bags ?? 0,
    ski_bags: b.ski_bags ?? 0,
    legs: b.legs.map((l, i) => ({ ...l, sequence: i })),
    rfqs: [],
    quotes: [],
    manifest: null,
    weather_available: false,
    created_at: new Date().toISOString(),
    manifest_passengers: [],
    position_progress: null,
  };
  db().trips.push(t);
  save();
  return tripView(t);
}, 201);
route("GET", "/trips", () => {
  needAuth();
  return db().trips.map(tripView).reverse();
});
route("GET", "/trips/{id}", (m) => {
  needAuth();
  return tripView(findTrip(m[1]));
});
route("PATCH", "/trips/{id}", (m, o) => {
  needAuth();
  const t = findTrip(m[1]);
  if (t.status !== "draft") fail(409, "invalid_state", "Only draft trips can be edited.");
  Object.assign(t, o.body);
  save();
  return tripView(t);
});
route("POST", "/trips/{id}/cancel", (m) => {
  needAuth();
  const t = findTrip(m[1]);
  if (["in_flight", "completed", "cancelled"].includes(t.status)) fail(409, "invalid_state", "This trip can no longer be cancelled.");
  t.status = "cancelled";
  save();
  return tripView(t);
});
route("GET", "/trips/{id}/match", (m) => {
  needAuth();
  return matchTrip(findTrip(m[1]));
});
route("GET", "/trips/{id}/listings", (m, o) => {
  needAuth();
  const t = findTrip(m[1]);
  const mr = matchTrip(t);
  const ok = new Set(mr.categories.flatMap((c) => c.types.map((x) => x.slug)));
  return allListings()
    .filter((l) => ok.has(l.type.slug) && (!o.query?.type_slug || l.type.slug === o.query.type_slug) && (l.passenger_seats ?? 0) >= t.passengers)
    .map(viewListing);
});
route("POST", "/trips/{id}/rfqs", (m, o) => {
  needEntitled();
  const t = findTrip(m[1]);
  if (!["draft", "rfq_sent", "quoted"].includes(t.status)) fail(409, "invalid_state", "RFQs can no longer be sent for this trip.");
  const ids = (o.body as { listing_ids: string[] }).listing_ids ?? [];
  if (!ids.length) fail(422, "validation_error", "Select at least one aircraft.");
  const out: Rfq[] = [];
  for (const id of ids) {
    const l = allListings().find((x) => x.listing_id === id);
    if (!l) fail(422, "validation_error", "Unknown listing.");
    if (t.rfqs.some((r) => r.listing?.listing_id === id && r.kind === "charter")) continue;
    const r: Rfq = {
      id: nid("rfq"),
      reference: `EXJ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      kind: "charter",
      status: "sent",
      sent_at: new Date().toISOString(),
      replied_at: null,
      listing: l ?? null,
    };
    t.rfqs.push(r);
    out.push(r);
  }
  if (t.status === "draft") t.status = "rfq_sent";
  save();
  return out.map((r) => ({ ...r }));
}, 201);
route("POST", "/trips/{id}/ground-rfqs", (m, o) => {
  needEntitled();
  const t = findTrip(m[1]);
  const b = o.body as { kind: string; leg_sequence: number; fbo_id: string; details: string };
  if (!b.fbo_id) fail(422, "validation_error", "FBO is required.");
  const r: Rfq = { id: nid("rfq"), reference: `EXJ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, kind: b.kind, status: "sent", sent_at: new Date().toISOString(), replied_at: null, listing: null };
  t.rfqs.push(r);
  save();
  return r;
}, 201);

route("GET", "/trips/{id}/quotes", (m) => {
  needEntitled();
  const t = findTrip(m[1]);
  settleReplies(t);
  return JSON.parse(JSON.stringify(t.quotes));
});
function findQuote(id: string): [TripRec, Quote] {
  for (const t of db().trips) {
    const q = t.quotes.find((x) => x.id === id);
    if (q) return [t, q];
  }
  return fail(404, "not_found", "Quote not found.");
}
route("POST", "/quotes/{id}/accept", (m) => {
  needEntitled();
  const [t, q] = findQuote(m[1]);
  if (q.status !== "ready") fail(409, "invalid_state", "This quote cannot be accepted.");
  if (!q.contract) fail(409, "invalid_state", "This quote has no contract document yet.");
  t.quotes.forEach((x) => (x.status = x.id === q.id ? "accepted" : "declined"));
  t.status = "contracted";
  save();
  return tripView(t);
});
route("POST", "/quotes/{id}/decline", (m) => {
  needEntitled();
  const [, q] = findQuote(m[1]);
  if (q.status !== "ready") fail(409, "invalid_state", "This quote cannot be declined.");
  q.status = "declined";
  save();
  return q;
});
route("POST", "/contracts/{id}/acknowledge", (m) => {
  needEntitled();
  for (const t of db().trips) {
    const q = t.quotes.find((x) => x.contract?.id === m[1]);
    if (q?.contract) {
      if (q.status !== "accepted") fail(409, "invalid_state", "Accept the quote before acknowledging its contract.");
      q.contract.acknowledged_at = new Date().toISOString();
      save();
      return { id: q.contract.id, acknowledged_at: q.contract.acknowledged_at };
    }
  }
  return fail(404, "not_found", "Contract not found.");
});
route("POST", "/quotes/{id}/payment/mark-paid", (m) => {
  needEntitled();
  const [t, q] = findQuote(m[1]);
  if (q.status !== "accepted" || t.status !== "contracted") fail(409, "invalid_state", "Accept the quote first.");
  if (!q.contract?.acknowledged_at) fail(409, "invalid_state", "Acknowledge the contract first.");
  if (q.payment_link) q.payment_link.status = "marked_paid";
  const first = t.legs[0].depart_at ?? new Date().toISOString();
  const dep = /(Z|[+-]\d{2}:?\d{2})$/.test(first) ? new Date(first) : new Date(first + "Z");
  t.manifest = { due_at: new Date(dep.getTime() - 24 * 3_600_000).toISOString(), submitted_at: null };
  t.status = "manifest_due";
  save();
  return tripView(t);
});

function manifestView(t: TripRec) {
  if (!t.manifest) fail(409, "invalid_state", "The manifest opens after payment is marked.");
  const icaos = t.legs.flatMap((l) => [l.origin_icao, l.destination_icao]);
  return { due_at: t.manifest!.due_at, submitted_at: t.manifest!.submitted_at, required_id_type: requiredIdType(icaos), passengers: t.manifest_passengers };
}
route("GET", "/trips/{id}/manifest", (m) => {
  needEntitled();
  return manifestView(findTrip(m[1]));
});
route("PUT", "/trips/{id}/manifest", (m, o) => {
  needEntitled();
  const t = findTrip(m[1]);
  if (t.manifest?.submitted_at) fail(409, "invalid_state", "The manifest has been submitted.");
  t.manifest_passengers = (o.body as { passengers: ManifestPassenger[] }).passengers;
  save();
  return manifestView(t);
});
route("POST", "/trips/{id}/manifest/submit", (m) => {
  needEntitled();
  const t = findTrip(m[1]);
  const mv = manifestView(t);
  if (t.manifest_passengers.length !== t.passengers) fail(422, "validation_error", `One passenger record per passenger is required (${t.passengers}).`);
  if (t.manifest_passengers.some((p) => p.id_type !== mv.required_id_type)) fail(422, "validation_error", `ID type must be ${mv.required_id_type === "passport" ? "passport" : "REAL ID"} for this trip.`);
  t.manifest!.submitted_at = new Date().toISOString();
  t.status = "scheduled";
  save();
  return tripView(t);
});
route("GET", "/trips/{id}/weather", (m) => {
  needEntitled();
  const t = findTrip(m[1]);
  return t.legs.map((l) => ({
    origin: { metar: `METAR ${l.origin_icao} 121551Z 28010KT 10SM FEW050 12/03 A3012 (SYNTHETIC)`, taf: `TAF ${l.origin_icao} 121130Z 1212/1318 28010KT P6SM SCT050 (SYNTHETIC)` },
    destination: { metar: `METAR ${l.destination_icao} 121553Z 24006KT 10SM CLR 19/07 A3003 (SYNTHETIC)`, taf: `TAF ${l.destination_icao} 121130Z 1212/1318 24008KT P6SM SKC (SYNTHETIC)` },
    summary: "Synthetic summary: VFR conditions at both ends, no significant weather.",
  }));
});
route("GET", "/trips/{id}/track", (m) => {
  needEntitled();
  const t = findTrip(m[1]);
  return t.legs.map((l, i) => {
    const a = pt(l.origin_icao), b = pt(l.destination_icao);
    if (t.status === "in_flight" && i === 0 && a && b && t.position_progress !== null) {
      const p = t.position_progress;
      return { status: "en_route", position: { lat: +(a.lat + (b.lat - a.lat) * p).toFixed(4), lon: +(a.lon + (b.lon - a.lon) * p).toFixed(4), altitude_ft: 41000, groundspeed_kts: 462, heading: 270, at: new Date().toISOString() } };
    }
    return { status: t.status === "completed" ? "landed" : "not_departed", position: null };
  });
});

// ----- admin -----
route("GET", "/admin/approvals", (_m, o) => {
  needAdmin();
  return db().approvals.filter((a) => !o.query?.status || a.status === o.query.status);
});
route("POST", "/admin/approvals/{id}/decide", (m, o) => {
  needAdmin();
  const a = db().approvals.find((x) => x.id === m[1]);
  if (!a) fail(404, "not_found", "Approval not found.");
  if (a!.status !== "pending") fail(409, "invalid_state", "This approval has already been decided.");
  const b = o.body as { decision: "approved" | "rejected"; note: string };
  if (!b.note?.trim()) fail(422, "validation_error", "A decision note is required.");
  a!.status = b.decision;
  a!.decision_note = b.note;
  a!.decided_at = new Date().toISOString();
  const k = db().kycRows.find((x) => x.id === a!.subject_id);
  if (k) {
    k.status = b.decision;
    k.decision_note = b.note;
  }
  const op = db().operators.find((x) => x.id === a!.subject_id);
  if (op && a!.kind === "operator_go_live") op.go_live_status = b.decision === "approved" ? "live" : "not_live";
  save();
  return a;
});
route("GET", "/admin/kyc/submissions", (_m, o) => {
  needAdmin();
  return db().kycRows.filter((k) => !o.query?.status || k.status === o.query.status);
});
route("GET", "/admin/kyc/submissions/{id}", (m) => {
  needAdmin();
  const k = db().kycRows.find((x) => x.id === m[1]);
  if (!k) fail(404, "not_found", "Submission not found.");
  return k;
});
route("GET", "/admin/operators", () => {
  needAdmin();
  return db().operators;
});
route("POST", "/admin/operators/{id}/request-go-live", (m) => {
  needAdmin();
  const op = db().operators.find((x) => x.id === m[1]);
  if (!op) fail(404, "not_found", "Operator not found.");
  if (op!.go_live_status === "live") fail(409, "invalid_state", "Operator is already live.");
  op!.go_live_status = "pending_approval";
  if (!db().approvals.some((a) => a.subject_id === op!.id && a.status === "pending")) {
    db().approvals.unshift({ id: nid("apr"), kind: "operator_go_live", status: "pending", summary: `Go-live for ${op!.dba_name}`, subject_type: "operator", subject_id: op!.id, requested_by: "admin", requested_at: new Date().toISOString(), decided_at: null, decision_note: null, payload: null });
  }
  save();
  return op;
});
route("POST", "/admin/ingest", async (_m, o) => {
  needAdmin();
  const f = o.form;
  const dataset = String(f?.get("dataset") ?? "");
  const file = f?.get("file");
  if (!dataset || !(file instanceof File)) fail(422, "validation_error", "Dataset and file are required.");
  const text = await (file as File).text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const rows = lines.slice(1);
  const rejections: { row: number; reason: string }[] = [];
  rows.forEach((r, i) => {
    if (EXCLUDED.some((x) => r.toLowerCase().includes(x))) rejections.push({ row: i + 2, reason: "Operator excluded by policy" });
    else if (r.split(",").length < 2) rejections.push({ row: i + 2, reason: "Missing required columns" });
  });
  const run: IngestRun = {
    id: nid("run"), dataset, filename: (file as File).name, status: "succeeded",
    loaded_count: rows.length - rejections.length, rejected_count: rejections.length,
    started_at: new Date().toISOString(), finished_at: new Date().toISOString(), report: { rejections },
  };
  db().ingestRuns.unshift(run);
  save();
  return run;
}, 201);
route("GET", "/admin/ingest/runs", () => {
  needAdmin();
  return db().ingestRuns;
});
route("GET", "/admin/metrics", () => {
  needAdmin();
  const by = { individual: 3, family_office: 1 };
  const mrr = by.individual * 75000 + by.family_office * 100000;
  const rfqs = db().trips.flatMap((t) => t.rfqs).filter((r) => r.kind === "charter");
  return {
    mrr_cents: mrr,
    arr_cents: mrr * 12,
    members_by_plan: by,
    kyc_queue: db().kycRows.filter((k) => k.status === "pending").length,
    rfq_to_quote_rate: rfqs.length ? rfqs.filter((r) => r.status === "replied").length / rfqs.length : null,
    median_operator_response_minutes: null,
  };
});
route("GET", "/admin/agent-actions", () => {
  needAdmin();
  return db().actions;
});
route("GET", "/admin/jobs", () => {
  needAdmin();
  return db().jobs;
});

export async function mockRequest(method: string, path: string, opts: RequestOptions): Promise<{ status: number; data: unknown }> {
  await sleep(120);
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = r.re.exec(path);
    if (!m) continue;
    try {
      const data = await r.h(m, opts);
      // Clone like a real network response so React never sees in-place mutation of cached objects.
      return { status: r.status ?? 200, data: data === undefined || data === null ? null : JSON.parse(JSON.stringify(data)) };
    } catch (e) {
      if (e instanceof MockErr) return { status: e.status, data: { error: { code: e.code, message: e.message } } };
      throw e;
    }
  }
  return { status: 404, data: { error: { code: "not_found", message: `No mock route for ${method} ${path}` } } };
}

export type { TripStatus };
