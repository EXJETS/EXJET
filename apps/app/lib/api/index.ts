import { get, post, put, patch, request, apiUrl } from "./client";
import type * as T from "./types";

export { ApiError, isMock, apiUrl, API_BASE, setApiHandlers } from "./client";
export type * from "./types";

export const api = {
  // auth + account
  signup: (b: T.SignupBody) => post<T.Me>("/auth/signup", b, { quiet401: true }),
  login: (b: { email: string; password: string }) => post<T.Me>("/auth/login", b, { quiet401: true }),
  logout: () => post<null>("/auth/logout", undefined, { quiet401: true }),
  me: () => get<T.Me>("/me", { quiet401: true }),
  inviteSeat: (email: string) => post<unknown>("/account/seats", { email }),
  // kyc
  submitKyc: (form: FormData) => request<{ id: string; status: string }>("POST", "/kyc/submissions", { form }),
  kycStatus: () => get<T.KycStatusResponse>("/kyc/status"),
  // billing
  plans: () => get<T.Plan[]>("/billing/plans", { quiet401: true }),
  checkout: (plan: string) => post<{ checkout_url: string }>("/billing/checkout", { plan }),
  portal: () => post<{ url: string }>("/billing/portal"),
  enterpriseInquiry: (b: T.EnterpriseInquiry) => post<null>("/billing/enterprise-inquiry", b, { quiet401: true }),
  // catalog
  airports: (q: string) => get<T.Airport[]>("/airports", { query: { q }, quiet401: true }),
  categories: () => get<T.Category[]>("/categories", { quiet401: true }),
  aircraftTypes: (category?: string) => get<T.AircraftType[]>("/aircraft-types", { query: { category }, quiet401: true }),
  aircraftType: (slug: string) => get<T.AircraftType>(`/aircraft-types/${encodeURIComponent(slug)}`, { quiet401: true }),
  listings: (q: { type_slug?: string; category?: string; home?: string }) => get<T.Listing[]>("/listings", { query: q, quiet401: true }),
  emptyLegs: () => get<T.EmptyLeg[]>("/empty-legs", { quiet401: true }),
  // trips
  intake: (text: string) => post<T.TripIntake>("/trips/intake", { text }),
  createTrip: (d: T.TripDraft) => post<T.Trip>("/trips", d),
  trips: () => get<T.Trip[]>("/trips"),
  trip: (id: string) => get<T.Trip>(`/trips/${id}`),
  updateTrip: (id: string, d: Partial<T.TripDraft>) => patch<T.Trip>(`/trips/${id}`, d),
  cancelTrip: (id: string) => post<T.Trip>(`/trips/${id}/cancel`),
  match: (id: string) => get<T.MatchResult>(`/trips/${id}/match`),
  tripListings: (id: string, type_slug?: string) => get<T.Listing[]>(`/trips/${id}/listings`, { query: { type_slug } }),
  sendRfqs: (id: string, listing_ids: string[], empty_leg_id?: string) => post<T.Rfq[]>(`/trips/${id}/rfqs`, { listing_ids, ...(empty_leg_id ? { empty_leg_id } : {}) }),
  groundRfq: (id: string, b: T.GroundRfqBody) => post<T.Rfq>(`/trips/${id}/ground-rfqs`, b),
  // quotes, contract, payment
  quotes: (id: string) => get<T.Quote[]>(`/trips/${id}/quotes`),
  acceptQuote: (id: string) => post<T.Trip>(`/quotes/${id}/accept`),
  declineQuote: (id: string) => post<T.Quote>(`/quotes/${id}/decline`),
  acknowledgeContract: (id: string) => post<unknown>(`/contracts/${id}/acknowledge`),
  markPaid: (quoteId: string) => post<T.Trip>(`/quotes/${quoteId}/payment/mark-paid`),
  // manifest + flight
  manifest: (id: string) => get<T.Manifest>(`/trips/${id}/manifest`),
  saveManifest: (id: string, passengers: T.ManifestPassengerIn[]) => put<T.Manifest>(`/trips/${id}/manifest`, { passengers }),
  submitManifest: (id: string) => post<T.Manifest>(`/trips/${id}/manifest/submit`),
  weather: (id: string) => get<T.WeatherResponse>(`/trips/${id}/weather`),
  track: (id: string) => get<T.TrackResponse>(`/trips/${id}/track`),
  // admin
  approvals: (status?: string, kind?: string) => get<T.Approval[]>("/admin/approvals", { query: { status, kind } }),
  decideApproval: (id: string, decision: "approved" | "rejected", note: string) =>
    post<T.Approval>(`/admin/approvals/${id}/decide`, { decision, note }),
  kycSubmissions: (status?: string) => get<T.KycSubmissionDetail[]>("/admin/kyc/submissions", { query: { status } }),
  kycSubmission: (id: string) => get<T.KycSubmissionDetail>(`/admin/kyc/submissions/${id}`),
  adminOperators: () => get<T.AdminOperator[]>("/admin/operators"),
  requestGoLive: (id: string) => post<T.Approval>(`/admin/operators/${id}/request-go-live`),
  ingest: (form: FormData) => request<T.IngestRun>("POST", "/admin/ingest", { form }),
  ingestRuns: () => get<T.IngestRun[]>("/admin/ingest/runs"),
  metrics: () => get<T.Metrics>("/admin/metrics"),
  agentActions: () => get<T.AgentAction[]>("/admin/agent-actions"),
  jobs: () => get<T.Job[]>("/admin/jobs"),
  adminQuotes: (status?: string) => get<T.AdminQuote[]>("/admin/quotes", { query: { status } }),
  resolveQuote: (id: string, b: T.ResolveQuoteBody) => post<T.AdminQuote>(`/admin/quotes/${id}/resolve`, b),
};

export { apiUrl as documentUrl };
