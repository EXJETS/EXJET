/**
 * Hand-written from ARCHITECTURE.md "API contract (v1)".
 * To be regenerated from apps/api/openapi.json. Fields the contract leaves open are marked ASSUMED.
 */

export interface ApiErrorEnvelope {
  error: { code: string; message: string };
}

export type Role = "member" | "admin" | string; // ASSUMED values
export type AccountType = "individual" | "family_office" | string;
/** ASSUMED: contract names the field but not its values. */
export type KycStatus = "not_started" | "pending" | "approved" | "rejected";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "incomplete" | "trialing" | string;
export type NextStep = "kyc" | "kyc_pending" | "billing" | "ready";
export type PlanId = "individual" | "family_office" | "enterprise" | string;

export interface Me {
  user: { id: string; email: string; full_name: string; role: Role };
  account: { id: string; type: AccountType; display_name: string; seats: number; kyc_status: KycStatus };
  subscription: { plan: PlanId; status: SubscriptionStatus; current_period_end: string | null } | null;
  entitled: boolean;
  next_step: NextStep;
}

export interface SignupBody {
  email: string;
  password: string;
  full_name: string;
  account_type: "individual" | "family_office";
  signup_source?: string;
}

export interface KycStatusResponse {
  kyc_status: KycStatus;
  latest_submission: { id: string; status: string; created_at: string; decision_note: string | null } | null;
}

export type KycDocType = "passport" | "drivers_license" | "business_doc";

export interface Plan {
  plan: PlanId;
  name: string;
  unit_amount_cents: number;
  interval: "month";
  seats: number;
}

export interface Airport {
  icao: string;
  iata: string | null;
  name: string;
  city: string;
  state: string;
  elevation_ft: number | null;
  longest_runway_ft: number | null;
}

export type Category = { category: string; name: string; type_count: number };

export interface AircraftType {
  slug: string;
  manufacturer: string;
  model: string;
  category: string;
  // ASSUMED optional spec fields; shown only when present
  max_passengers?: number | null;
  range_nm?: number | null;
  cruise_speed_kts?: number | null;
  baggage_cuft?: number | null;
}

export interface OperatorContact {
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
}

export type SafetyRating = "Not rated" | "Gold" | "Gold+" | "Platinum" | "Platinum+" | string;

export interface Listing {
  listing_id: string;
  type: { slug: string; manufacturer: string; model: string; category: string };
  year_of_manufacture: number | null;
  year_refurbished: number | null;
  passenger_seats: number | null;
  home_city: string | null;
  amenities: string[];
  photos: string[];
  safety_rating: SafetyRating | null;
  tail_number: string | null;
  operator: {
    id: string;
    dba_name: string;
    certificate_type: string | null;
    contacts: OperatorContact[];
  } | null;
}

export interface EmptyLeg {
  id: string;
  origin: string;
  destination: string;
  available_from: string;
  available_to: string;
  listing: Listing;
}

export type TripType = "one_way" | "round_trip" | "multi_leg";
export type TripStatus =
  | "draft"
  | "rfq_sent"
  | "quoted"
  | "contracted"
  | "paid"
  | "manifest_due"
  | "scheduled"
  | "in_flight"
  | "completed"
  | "cancelled";

export interface LegInput {
  origin_icao: string;
  destination_icao: string;
  /** ASSUMED: local time at origin, `YYYY-MM-DDTHH:mm:00` with no offset (or a full ISO instant). */
  depart_at: string | null;
}

export interface TripDraft {
  trip_type: TripType;
  legs: LegInput[];
  passengers: number;
  checked_bags: number;
  carry_on_bags: number;
  golf_bags: number;
  ski_bags: number;
}

export interface TripIntake extends TripDraft {
  /** ASSUMED format: "passengers", "legs[0].depart_at", "legs.1.origin_icao" */
  unresolved: string[];
  confidence: number;
}

export interface Leg extends LegInput {
  sequence?: number;
}

export type RfqStatus = "queued" | "sent" | "replied" | "declined" | "expired" | "failed" | string;

export interface Rfq {
  id: string;
  reference: string;
  kind: "charter" | "empty_leg" | "rental_car" | "chauffeur" | string;
  status: RfqStatus;
  sent_at: string | null;
  replied_at: string | null;
  listing: Listing | null;
}

export type QuoteStatus = "ready" | "needs_review" | "accepted" | "declined" | "expired" | string;

export interface QuoteLineItem {
  description: string;
  amount_cents: number | null;
  page?: number | null;
}

export interface Quote {
  id: string;
  status: QuoteStatus;
  operator: { dba_name: string } | null;
  listing: Listing | null;
  total_amount_cents: number | null;
  currency: string;
  valid_until: string | null;
  operator_quote_number: string | null;
  line_items: QuoteLineItem[];
  quote_pdf_url: string | null;
  contract: { id: string; pdf_url: string | null; acknowledged_at: string | null } | null;
  payment_link: { url: string; host: string; status: string } | null;
}

export interface Trip {
  id: string;
  status: TripStatus;
  trip_type: TripType;
  passengers: number;
  checked_bags: number;
  carry_on_bags: number;
  golf_bags: number;
  ski_bags: number;
  legs: Leg[];
  rfqs: Rfq[];
  quotes: Quote[];
  manifest: { due_at: string; submitted_at: string | null } | null;
  weather_available: boolean;
  created_at?: string; // ASSUMED
}

export interface MatchType {
  slug: string;
  model: string;
  stops: 0 | 1;
  fuel_stop_icao: string | null;
  flight_time_minutes: number | null;
  listing_count: number;
}

export interface MatchResult {
  legs: { distance_nm: number }[];
  categories: { category: string; types: MatchType[] }[];
  rejected: { slug: string; reasons: string[] }[];
}

export interface GroundRfqBody {
  kind: "rental_car" | "chauffeur";
  leg_sequence: number;
  fbo_id: string;
  details: string;
}

export type IdType = "real_id" | "passport";

export interface ManifestPassenger {
  full_name: string;
  date_of_birth: string;
  id_type: IdType | "";
  id_number: string;
  id_expiry: string;
  id_issuer: string;
  weight_lbs?: number | null;
}

export interface Manifest {
  due_at: string;
  submitted_at: string | null;
  required_id_type: IdType;
  passengers: ManifestPassenger[];
}

export interface MetarTaf {
  metar: string | null;
  taf: string | null;
}
export interface WeatherLeg {
  origin: MetarTaf;
  destination: MetarTaf;
  summary: string | null;
}
export type WeatherResponse = WeatherLeg[]; // ASSUMED: array, one entry per leg

export interface TrackLeg {
  status: string;
  position: {
    lat: number;
    lon: number;
    altitude_ft: number | null;
    groundspeed_kts: number | null;
    heading: number | null;
    at: string;
  } | null;
}
export type TrackResponse = TrackLeg[]; // ASSUMED: array, one entry per leg

// ---- Admin / Company OS (shapes ASSUMED except metrics) ----

export interface Metrics {
  mrr_cents: number | null;
  arr_cents: number | null;
  members_by_plan: Record<string, number> | null;
  kyc_queue: number | null;
  rfq_to_quote_rate: number | null;
  median_operator_response_minutes: number | null;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | string;
export interface Approval {
  id: string;
  kind: string;
  status: ApprovalStatus;
  summary: string | null;
  subject_type: string | null;
  subject_id: string | null;
  requested_by: string | null;
  requested_at: string;
  decided_at: string | null;
  decision_note: string | null;
  payload: Record<string, unknown> | null;
}

export interface KycSubmissionRow {
  id: string;
  status: string;
  kind: "individual" | "business";
  holder_name: string;
  business_name: string | null;
  created_at: string;
  account_id?: string;
}
export interface KycSubmissionDetail extends KycSubmissionRow {
  business_tax_id: string | null;
  decision_note: string | null;
  approval_id: string | null;
  documents: { id: string; doc_type: KycDocType | string; filename: string | null; url: string }[];
  signals: { name: string; result: string; detail: string | null }[];
}

export type GoLiveStatus = "not_live" | "pending_approval" | "live" | string;
export interface AdminOperator {
  id: string;
  dba_name: string;
  certificate_type: string | null;
  go_live_status: GoLiveStatus;
  tail_count: number | null;
  is_excluded?: boolean;
}

export interface IngestRun {
  id: string;
  dataset: string;
  filename: string | null;
  status: string;
  loaded_count: number | null;
  rejected_count: number | null;
  started_at: string;
  finished_at: string | null;
  report: { rejections?: { row: number | string; reason: string }[]; [k: string]: unknown } | null;
}

export interface Job {
  id: string;
  kind: string;
  status: string;
  attempts: number;
  run_at: string | null;
  last_error: string | null;
  created_at: string;
}

export interface AgentAction {
  id: string;
  agent: string;
  action: string;
  status: string;
  summary: string | null;
  created_at: string;
}

export interface EnterpriseInquiry {
  company: string;
  seats: number;
  notes: string;
}
