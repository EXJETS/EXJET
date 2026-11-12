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
export type DraftLeg = S["LegDraftIO"];
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

// Exact unions come straight from the schema (closed Literal types in the API).
export type KycStatus = Me["account"] extends infer A ? (A extends { kyc_status: infer K } ? K : never) : never;
export type NextStep = Me["next_step"];
export type TripType = Trip["trip_type"];
export type TripStatus = Trip["status"];
export type KycDocType = "passport" | "drivers_license" | "business_doc"; // multipart field; the schema types doc_types as string[]
export type IdType = S["PassengerIn"]["id_type"];
export type GoLiveStatus = AdminOperator["go_live_status"];
export type ApprovalKind = Approval["kind"];

export type SignupPending = S["SignupPending"];
export type SeatsOut = S["SeatsOut"];
export type SeatMember = S["SeatMemberOut"];
export type SeatInvitation = S["SeatInvitationOut"];
export type Fbo = S["FboOut"];
export type PaymentLink = S["PaymentLinkOut"];
export type OperatorManifest = S["OperatorManifestOut"];
export type Suppression = S["SuppressionOut"];
export type SuppressionBody = S["SuppressionIn"];
export type QuarantinedMessage = S["QuarantinedMessageOut"];
export type EnterpriseInquiryRecord = S["EnterpriseInquiryOut"];
export type GoLiveRequest = S["GoLiveRequestOut"];
export type AirportBrief = S["AirportBrief"];

/** Manifest row as edited in the form. `id_number` is optional for passengers already on file (API returns last 4 only). */
export interface ManifestRow {
  id: string | null;
  full_name: string;
  date_of_birth: string;
  id_type: IdType;
  id_number: string;
  id_number_last4: string | null;
  id_expiry: string;
  id_issuer: string;
}

/** Present in the API's docs (Manifest.sent_to_operator_at) but not yet in the OpenAPI schema; read defensively. */
export const sentToOperatorAt = (m: unknown): string | null => (m as { sent_to_operator_at?: string | null } | null)?.sent_to_operator_at ?? null;
