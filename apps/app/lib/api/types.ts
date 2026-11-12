/**
 * Named aliases over the generated OpenAPI types (schema.d.ts, produced by `npm run gen:api` from
 * apps/api/openapi.json). Do not hand-edit shapes here; only narrow string enums the schema leaves as `string`.
 */
import type { components } from "./schema";

type S = components["schemas"];

export interface ApiErrorEnvelope {
  error: { code: string; message: string };
}

export type Me = S["Me"];
export type UserOut = S["UserOut"];
export type AccountOut = S["AccountOut"];
export type SignupBody = S["SignupIn"];
export type KycStatusResponse = S["KycStatusOut"];
export type Plan = S["PlanOut"];
export type Airport = S["AirportOut"];
export type Category = S["CategoryOut"];
export type AircraftType = S["AircraftTypeOut"];
export type Listing = S["Listing"];
export type OperatorContact = S["ContactOut"];
export type EmptyLeg = S["EmptyLegOut"];
export type TripDraft = S["TripCreate"];
export type TripIntake = S["TripDraftOut"];
export type LegDraft = S["LegDraftIO"];
export type LegInput = S["LegIn"];
export type Leg = S["LegOut"];
export type Rfq = S["RfqOut"];
export type Quote = S["QuoteOut"];
export type QuoteLineItem = S["LineItemOut"];
export type Trip = S["TripOut"];
export type MatchResult = S["MatchOut"];
export type MatchType = S["MatchTypeOut"];
export type GroundRfqBody = S["GroundRfqIn"];
export type Manifest = S["ManifestOut"];
export type ManifestPassengerIn = S["PassengerIn"];
export type ManifestPassengerOut = S["PassengerOut"];
export type WeatherResponse = S["WeatherOut"];
export type WeatherLeg = S["LegWeather"];
export type TrackResponse = S["TrackOut"];
export type TrackLeg = S["LegTrack"];
export type Metrics = S["MetricsOut"];
export type Approval = S["ApprovalOut"];
export type KycSubmissionDetail = S["AdminKycSubmission"];
export type KycDocument = S["AdminDocument"];
export type AdminOperator = S["AdminOperatorOut"];
export type AdminQuote = S["AdminQuoteReview"];
export type ResolveQuoteBody = S["ResolveQuoteIn"];
export type IngestRun = S["IngestRunOut"];
export type Job = S["JobOut"];
export type AgentAction = S["AgentActionOut"];
export type EnterpriseInquiry = S["EnterpriseInquiryIn"];

// Enums the schema leaves as plain strings (values from the API implementation and ARCHITECTURE.md).
export type KycStatus = "not_started" | "submitted" | "in_review" | "approved" | "rejected";
export type NextStep = Me["next_step"];
export type TripType = "one_way" | "round_trip" | "multi_leg";
export type TripStatus = "draft" | "rfq_sent" | "quoted" | "contracted" | "paid" | "manifest_due" | "scheduled" | "in_flight" | "completed" | "cancelled";
export type KycDocType = "passport" | "drivers_license" | "business_doc";
export type IdType = S["PassengerIn"]["id_type"];
export type GoLiveStatus = "draft" | "pending_ceo" | "live" | "suspended";

/** Manifest row as edited in the form: the ID number is write-only (the API returns only the last 4). */
export interface ManifestRow {
  full_name: string;
  date_of_birth: string;
  id_type: IdType;
  id_number: string;
  id_number_last4: string | null;
  id_expiry: string;
  id_issuer: string;
}
