import { get, post, put, patch, del, request, apiUrl } from "./client";
import type * as T from "./types";

export { ApiError, isMock, apiUrl, API_BASE, setApiHandlers } from "./client";
export { friendlyError } from "./errors";
export type * from "./types";
export { sentToOperatorAt } from "./types";

export const api = {
  // auth + account
  signup: (b: T.SignupBody) => post<T.Me | T.SignupPending>("/auth/signup", b, { quiet401: true }),
  verifyEmail: (token: string) => post<T.Me>("/auth/verify-email", { token }, { quiet401: true }),
  resendVerification: (email: string) => post<T.SignupPending>("/auth/verify-email/resend", { email }, { quiet401: true }),
  changePassword: (current_password: string, new_password: string) => post<null>("/auth/password", { current_password, new_password }),
  resetRequest: (email: string) => post<T.SignupPending>("/auth/password/reset-request", { email }, { quiet401: true }),
  resetPassword: (token: string, new_password: string) => post<null>("/auth/password/reset", { token, new_password }, { quiet401: true }),
  login: (b: { email: string; password: string }) => post<T.Me>("/auth/login", b, { quiet401: true }),
  logout: () => post<null>("/auth/logout", undefined, { quiet401: true }),
  me: () => get<T.Me>("/me", { quiet401: true }),
  inviteSeat: (email: string) => post<T.SignupPending>("/account/seats", { email }),
  seats: () => get<T.SeatsOut>("/account/seats"),
  revokeInvitation: (id: string) => del<null>(`/account/seats/invitations/${id}`),
  acceptSeat: (token: string) => post<T.Me>("/account/seats/accept", { token }),
  // kyc
  submitKyc: (form: FormData) => request<{ id: string; status: string }>("POST", "/kyc/submissions", { form }),
  kycStatus: () => get<T.KycStatusResponse>("/kyc/status"),
  // billing
  plans: () => get<T.Plan[]>("/billing/plans", { quiet401: true }),
  checkout: (plan: string) => post<{ checkout_url: string }>("/billing/checkout", { plan }),
  portal: () => post<{ url: string }>("/billing/portal"),
  enterpriseInquiry: (b: T.EnterpriseInquiry) => post<null>("/billing/enterprise-inquiry", b, { quiet401: true }),
  // catalog
  fbos: (icao: string) => get<T.Fbo[]>(`/airports/${encodeURIComponent(icao)}/fbos`),
  operatorManifest: (token: string) => get<T.OperatorManifest>("/operator/manifest", { query: { token }, quiet401: true }),
  devCompleteCheckout: (account_id: string, plan: string) => post<unknown>("/dev/complete-checkout", { account_id, plan }),
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
  requestGoLive: (id: string) => post<T.GoLiveRequest>(`/admin/operators/${id}/request-go-live`),
  ingest: (form: FormData) => request<T.IngestRun>("POST", "/admin/ingest", { form }),
  ingestRuns: () => get<T.IngestRun[]>("/admin/ingest/runs"),
  metrics: () => get<T.Metrics>("/admin/metrics"),
  agentActions: () => get<T.AgentAction[]>("/admin/agent-actions"),
  jobs: () => get<T.Job[]>("/admin/jobs"),
  adminQuote: (id: string) => get<T.AdminQuote>(`/admin/quotes/${id}`),
  setPaymentHosts: (id: string, hosts: string[]) => put<T.AdminOperator>(`/admin/operators/${id}/payment-hosts`, { hosts }),
  confirmContactRfq: (opId: string, cid: string) => post<null>(`/admin/operators/${opId}/contacts/${cid}/confirm-rfq`),
  suppressions: () => get<T.Suppression[]>("/admin/suppressions"),
  addSuppression: (b: T.SuppressionBody) => post<T.Suppression>("/admin/suppressions", b),
  deleteSuppression: (id: string) => del<null>(`/admin/suppressions/${id}`),
  quarantined: () => get<T.QuarantinedMessage[]>("/admin/inbound/quarantined"),
  enterpriseInquiries: () => get<T.EnterpriseInquiryRecord[]>("/admin/enterprise-inquiries"),
  deactivateUser: (id: string) => post<null>(`/admin/users/${id}/deactivate`),
  revokeManifestLinks: (tripId: string) => post<{ revoked: number }>(`/admin/trips/${tripId}/manifest/revoke-links`),
  adminQuotes: (status?: string) => get<T.AdminQuote[]>("/admin/quotes", { query: { status } }),
  resolveQuote: (id: string, b: T.ResolveQuoteBody) => post<T.AdminQuote>(`/admin/quotes/${id}/resolve`, b),
};

export { apiUrl as documentUrl };
