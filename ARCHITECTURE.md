# EXJET architecture

Source of truth for system design. The PRODUCT section of the build spec is locked and overrides anything here.

## Layout

```
apps/api      FastAPI + SQLAlchemy 2 + Alembic + Postgres 16. Python 3.12+, managed with uv.
apps/app      app.exjet.com. Next.js (App Router) + React + TypeScript. Member platform and Company OS.
apps/web      exjet.com marketing site (step 5; not built yet).
product/      Marketplace mechanics as deterministic Python services (package `exjet_product`).
              Agents and API routes call these. They are not agents.
agents/       One folder per runtime agent: config.yaml + system_prompt.md (step 6 onward).
data/raw      Founder-supplied files. data/fixtures holds clearly synthetic test fixtures only.
brand/        Brand assets and rules carried from the October site (marks, type, BRAND-PACKAGE.md).
(repo root)   Legacy April prototype. Kept only so the existing Vercel projects keep building;
              removed once Vercel root directories point at apps/web and apps/app.
```

## Ownership (build phase)

| Path | Owner |
|---|---|
| `apps/api/exjet_api/models.py`, `config.py`, `crypto.py`, `db.py` | architect (already written; propose changes, do not rewrite) |
| `apps/api/**` otherwise, `product/**` | backend |
| `apps/api/exjet_api/ingest/**`, `data/**`, `DATA_REPORT.md` | data |
| `apps/app/**` | frontend |
| `apps/web/**` | seo + frontend |
| tests inside each app | the owning subagent; qa adds e2e under `apps/app/e2e` and cross-cutting guardrail tests |

## Roles and entitlement

| State | Can do |
|---|---|
| Visitor (no session) | Browse categories, aircraft types, anonymized tail listings |
| Member, not entitled | Same as visitor, plus account, KYC, billing |
| **Entitled member** = account `kyc_status == approved` AND subscription `status == active` AND this member's own identity approved (the owner inherits the account result; an invited member passes their own individual check) AND not suspended | See operator name, tail number, operator contacts; send RFQs; see quotes |
| Admin (CEO) | Company OS, approvals, KYC final decision, data upload |

Entitlement is computed in one place, `exjet_api/entitlements.py`, and applied in the response layer:
every schema that can carry member-only fields is built through a function that takes the viewer and
nulls `operator`, `tail_number`, `contacts` when the viewer is not entitled. Routes never return ORM
objects directly. Anonymized listings expose a stable opaque `listing_id` (the aircraft UUID), type,
category, year, seats, home metro area (city, not operator base), amenities, and safety rating
(value only, never the rating source).

## Hard guardrails (code, with tests)

1. Member-only fields stripped for non-entitled viewers (response layer + tests on every listing/trip route).
2. No price anywhere except `Quote.total_amount_cents` and parsed line items, each traceable to a stored operator document. No estimator endpoints. Parser never invents a number: if a total cannot be read, the quote is `needs_review` with `total_amount_cents = NULL`.
3. Exclusions (NetJets, Flexjet, Nicholas Air; config `excluded_operators`) enforced at ingest (row rejected) and at query level (`is_excluded = false` in every supply query, plus name match as defense in depth).
4. Outbound mail goes through one function, `mailer.send()`, which (a) checks `suppressions` for every recipient, (b) requires an approval per purpose policy, (c) writes `email_messages`. Purposes `rfq`, `rfq_chase`, `quote_to_member`, `manifest` are transactional and authorized by the member's own action plus a standing `rfq_dispatch_policy` approval per operator go-live; `outreach` requires an approved `outreach_campaign` approval id. A send with no valid authorization is recorded as `blocked` and raises.
5. Only operators with `go_live_status == live` (CEO approval record) receive RFQs or appear in listings.
6. KYC: vendor check produces signals; only an admin decision sets `approved`. KYC documents are served only to admins through short-lived signed URLs, and each access writes `audit_log`.
7. Plan price changes, refunds and credits require an approved `plan_change` / `refund` approval.
8. PII columns use `EncryptedStr`. Logs never include PII, tokens or document contents.

## Mission matching (product/matching.py)

Inputs: legs (origin, destination ICAO), passengers, bags. For each aircraft type:
- `great-circle distance * 1.07` routing factor per leg.
- Nonstop if `distance <= range_nm * payload_factor(pax)`; one fuel stop allowed if a US airport exists
  near the route midpoint with runway >= type `min_runway_ft` and each half within range. Never more than
  `max_fuel_stops` (1).
- `pax <= max_passengers` (type) and `<= passenger_seats` (tail).
- Runway: both airports' `longest_runway_ft >= min_runway_ft` adjusted for elevation (+3% per 1,000 ft).
- Baggage: estimated volume (checked 5, carry-on 2, golf 6, ski 4 cu ft) `<= baggage_cuft`.
Output per category: feasible types, each flagged `nonstop` or `one_stop` with reason codes for rejects.
Missing type data (null range, runway) means "not offered", never guessed.

## Trip state machine

`draft → rfq_sent → quoted → contracted → paid → manifest_due → scheduled → in_flight → completed`; `cancelled` from any pre-flight state.
- `rfq_sent`: at least one RFQ dispatched.
- `quoted`: first quote `ready`.
- `contracted`: member accepted a quote that has a contract document; member acknowledges contract.
- `paid`: member marks the operator's payment link as paid (EXJET never processes the payment).
- `manifest_due`: set on `paid`; `Manifest.due_at = first departure - 24h`; reminder job at T-48h and T-26h.
- `scheduled`: manifest submitted with one passenger record per pax; ID type must be REAL ID for domestic-only trips and passport if any leg is international.
- `in_flight` / `completed`: driven by flight watch.

## Quote ingest (product/quote_ingest.py)

Inbound mail to quotes@ → match RFQ by reference token in subject (`EXJ-XXXXXX`) or thread id → store
attachments as documents → classify each PDF (quote | contract | other) → extract total, currency,
validity, quote number, line items with page refs → find payment link (URL in body or PDF; host recorded)
→ create Quote (+ Contract, PaymentLink) → notify member by email and in app.
Extraction: rules first (regex over PDF text); LLM step (fast tier) only when configured, and its output
is verified against the PDF text (every amount must appear verbatim) before it is trusted.

## Job queue

`jobs` table, claimed with `FOR UPDATE SKIP LOCKED`, exponential backoff, `dedupe_key` for idempotency.
Worker: `python -m exjet_api.worker`. Kinds: `rfq.dispatch`, `mail.poll_inbox`, `quote.ingest`,
`kyc.vendor_check`, `manifest.remind`, `flight.watch`, `rfq.expire`, `faa.sync_tail`.
Tests run jobs synchronously via `run_pending()`.

## Providers (all behind interfaces in `exjet_api/providers/`, fake implementation for each)

billing (Stripe Billing) · kyc (Stripe Identity) · mail (Gmail API, quotes@exjet.com) · adsb (FlightAware AeroAPI)
· weather (aviationweather.gov METAR/TAF, no key) · llm (Anthropic; model router in `config/models.yaml`)
· storage (S3-compatible private bucket; local disk in dev). See DECISIONS.md.

## API contract (v1)

Base path `/v1`. JSON. Auth: httpOnly, Secure, SameSite=Lax session cookie `exjet_session` (signed JWT,
server-side `is_active` check). State-changing requests require header `X-Requested-With: exjet` (CSRF).
Errors: `{"error": {"code": "snake_case", "message": "..."}}`. 401 unauthenticated, 403 `not_entitled` /
`forbidden`, 404, 409 invalid state, 422 validation.
FastAPI serves `/openapi.json`; `apps/api/openapi.json` is exported in CI and is the typed source for the frontend.

Auth and account
- `POST /auth/signup` {email, password, full_name, account_type: individual|family_office, signup_source?} → dev/test: 201 Me (new email, logged in, `user.email_verified` false) or 202 {status:"check_your_email"} (email already registered); staging/prod: 202 {status:"check_your_email"} for both, no session is issued. A new email always gets an `email_verification` message (transactional, through `mailer`) with a single-use, hashed, expiring (48 h, `EXJET_EMAIL_VERIFICATION_TTL_HOURS`) link `{APP_BASE_URL}/verify-email?token=…`
- `POST /auth/verify-email` {token} → Me with a session cookie, in every environment (409 `invalid_token` when used, expired or unknown) · `POST /auth/verify-email/resend` {email} → uniform 202 {status:"check_your_email"}, rate limited per address and per email; only an active unverified account is mailed
- `POST /auth/login` {email, password} → Me; dev/test never require verification; staging/prod answer 403 `email_not_verified` (after the password matched) until the email is verified · `POST /auth/logout` → 204 (ends ALL of the user's sessions) · `GET /me` → Me
- `POST /auth/password` {current_password, new_password} → 204 (revokes other sessions) · `POST /auth/password/reset-request` {email} → 202 (uniform) · `POST /auth/password/reset` {token, new_password} → 204
- Me = {user:{id,email,full_name,role,email_verified}, account:{id,type,display_name,seats,kyc_status}, subscription:{plan,status,current_period_end}|null, member:{is_owner,identity_status,is_suspended}|null, entitled: bool, next_step: "kyc"|"kyc_pending"|"billing"|"ready"}
- Seats are invitations. `POST /account/seats` {email} (owner only; family_office/enterprise; subscription active; account KYC approved; members + pending < plan seats) → 202 {status:"invitation_queued"} (identical whether or not the email has a login) · `GET /account/seats` → {account_id, seats, members[], invitations[]} · `DELETE /account/seats/invitations/{id}` → 204 · `POST /account/seats/accept` {token} (signed in as the invited email) → Me

KYC
- `POST /kyc/submissions` (owner: the account's check, individual or business; invited member: their own individual check only) multipart: kind (individual|business), holder_name, business_name?, business_tax_id?, files[] with doc_types[] (passport|drivers_license|business_doc) → 201 {id,status}
- `GET /kyc/status` → {kyc_status, latest_submission:{id,status,created_at,decision_note}|null, scope:"account"|"member"}

Billing (membership only)
- `GET /billing/plans` → [{plan,name,unit_amount_cents,interval:"month",seats}] (Individual 75000, Family Office 100000; Enterprise is inquiry and has no price)
- `POST /billing/checkout` {plan} → {checkout_url} · `POST /billing/portal` → {url}
- `POST /billing/webhook` (provider signature) · `POST /billing/enterprise-inquiry` {company, seats, notes?, contact_name, contact_email, contact_phone?} → 202 (all free text and contact fields are stored encrypted in `enterprise_inquiries`; the admin reads them at `GET /admin/enterprise-inquiries`). Fake provider URLs: `checkout_url` is `{APP_BASE_URL}/dev/checkout?session=…&plan=…` and the portal `url` is `{APP_BASE_URL}/dev/billing-portal?customer=…`; the app renders those pages only in dev/test and completes a checkout with `POST /v1/dev/complete-checkout` {account_id, plan}

Catalog (public; member-only fields null unless entitled)
- `GET /airports?q=` → [{icao,iata,name,city,state,elevation_ft,longest_runway_ft}] · `GET /airports/{icao}/fbos` → [{id, name, phone|null, email|null}] (public; phone and email only for entitled viewers; 404 for an unknown airport)
- `GET /categories` → [{category,name,type_count}] · `GET /aircraft-types?category=` → [AircraftType] · `GET /aircraft-types/{slug}`
- `GET /listings?type_slug=&category=&home=` → [Listing]
- Listing = {listing_id, type:{slug,manufacturer,model,category}, year_of_manufacture, year_refurbished, passenger_seats, home_city, amenities, photos, safety_rating, tail_number|null, operator:{id,dba_name,certificate_type,contacts:[{name,title,email,phone}]}|null}
- `GET /empty-legs` → [{id, origin, destination, available_from, available_to, listing: Listing}] (never a price)

Trips
- `POST /trips/intake` {text} → TripDraft parsed from plain language {trip_type, legs:[{origin_icao,destination_icao,depart_at|null,depart_local|null,origin_timezone|null}], passengers, checked_bags, carry_on_bags, golf_bags, ski_bags, unresolved:[field…], confidence}. Parses; does not save.
- Departure times (`POST /trips`, `PATCH /trips/{id}`): `depart_at` is either an instant with an offset (`2026-12-04T14:00:00-05:00`, `…Z`) or a naive wall-clock time `YYYY-MM-DDTHH:MM[:SS]` read in the ORIGIN airport's IANA zone; any other format is 422 `validation_error`. Stored as UTC. A zoneless or unrecognized airport zone is 422 `airport_timezone_unknown` (never guessed, never UTC). A wall time inside a DST gap is 422 `nonexistent_local_time`; a wall time that occurs twice (fall back) takes the FIRST occurrence (the daylight offset); pass an offset to mean the second. Every response leg carries `depart_at` (UTC instant), `depart_local` (naive wall time at the origin) and `origin_timezone` (the zone saved with the leg), so a client never guesses. In an intake draft a time whose origin has no zone is returned as null and listed in `unresolved`.
- `POST /trips` TripDraft → 201 Trip · `GET /trips` · `GET /trips/{id}` · `PATCH /trips/{id}` (draft only) · `POST /trips/{id}/cancel`
- `GET /trips/{id}/match` → {legs:[{distance_nm}], categories:[{category, types:[{slug,model,stops:0|1,fuel_stop_icao|null,flight_time_minutes, listing_count}]}], rejected:[{slug,reasons[]}]}
- `GET /trips/{id}/listings?type_slug=` → [Listing] feasible tails (entitled sees operator/tail)
- `POST /trips/{id}/rfqs` {listing_ids:[…]} (entitled only) → 201 [Rfq] and enqueues dispatch
- `POST /trips/{id}/ground-rfqs` {kind: rental_car|chauffeur, leg_sequence, fbo_id, details} (entitled only)
- Rfq = {id, reference, kind, status, sent_at, replied_at, listing: Listing}
- Trip = {id,status,trip_type,passengers,bags…,legs[],rfqs[],quotes[],manifest:{due_at,submitted_at}|null,weather_available:bool}; leg = {sequence, origin_icao, destination_icao, depart_at, depart_local, origin_timezone, origin:{icao,name,city,state,latitude,longitude,timezone}, destination:{…same}, distance_nm, is_international}
- Status and enum fields in every response model are closed `Literal` types in OpenAPI (kyc/identity status, Me.next_step, subscription status and plan, trip status and type, rfq status and kind, quote status, payment link status, go_live_status, safety_rating, aircraft category, approval kind and status, job status, id_type, flight status), so generated TypeScript types are exact unions.

Quotes, contract, payment
- `GET /trips/{id}/quotes` → [Quote]; Quote = {id,status,operator:{dba_name},listing,total_amount_cents|null,currency,valid_until,operator_quote_number,line_items[],quote_pdf_url,contract:{id,pdf_url,acknowledged_at}|null,payment_link:{url,host,status,host_approved,changed_since_first}|null}
- `POST /quotes/{id}/accept` → Trip (contracted; other quotes declined) · `POST /quotes/{id}/decline`
- `POST /contracts/{id}/acknowledge` · `POST /quotes/{id}/payment/mark-paid` → Trip (paid → manifest_due)
- `GET /documents/{id}` → 302 short-lived signed URL bound to document id + viewer (owner account or admin only; audited for KYC); the file is always served as an attachment (see Security controls)

Manifest and flight
- `GET /trips/{id}/manifest` → {due_at, submitted_at, required_id_type, expected_passengers, passengers:[{id, full_name, date_of_birth, id_type, id_number_last4, id_expiry, id_issuer, weight_lbs}]} (full ID numbers are never returned) · `PUT /trips/{id}/manifest` {passengers:[{id?, full_name, date_of_birth, id_type, id_number?, id_expiry, id_issuer, weight_lbs?}]} is an UPSERT by passenger `id`: an existing `id` without `id_number` keeps the stored number, an item without `id` is created (`id_number` required, 422 `manifest_invalid`), a foreign or unknown `id` is 422 `unknown_passenger`, a repeated `id` 422 `duplicate_passenger_id`, passengers missing from the list are deleted · `POST /trips/{id}/manifest/submit` (every passenger must have a full ID number on file; unchanged). Editing a submitted manifest (trip `scheduled`, before the first departure) reopens it: the trip returns to `manifest_due`, `submitted_at` clears and the operator's links are revoked; submit again to issue new ones.
- Manifest delivery is a SECURE LINK, never passenger PII by email. Submit enqueues `manifest.deliver`, which emails each address the accepted quote's RFQ went to (purpose `manifest`; same authorization as the RFQ) the RFQ reference, route, date and `{APP_BASE_URL}/operator/manifest?token=…` (one token per recipient, SHA-256 at rest, expires in 72 h `EXJET_MANIFEST_LINK_TTL_HOURS`, at most `EXJET_MANIFEST_LINK_MAX_VIEWS` (10) reads so a reload or a scanner's prefetch does not burn it) and sets `Manifest.sent_to_operator_at`. `GET /operator/manifest?token=` (no session; rate limited per address and per token; 404 `invalid_link` for unknown, expired, revoked or exhausted) → {trip_reference, legs:[{sequence,origin_icao,destination_icao,depart_local,origin_timezone}], submitted_at, expires_at, expected_passengers, passengers:[{full_name,date_of_birth,id_type,id_number,id_expiry,id_issuer,weight_lbs}]}, writing an `audit_log` row per use (ip, time, token id). Resubmission after a change revokes the old links and issues new ones.
- `GET /trips/{id}/weather` → per leg {origin:{metar,taf}, destination:{metar,taf}, summary}
- `GET /trips/{id}/track` → per leg {status, position:{lat,lon,altitude_ft,groundspeed_kts,heading,at}|null}

Admin / Company OS (role admin)
- `GET /admin/approvals?status=` · `POST /admin/approvals/{id}/decide` {decision: approved|rejected, note}
- `GET /admin/kyc/submissions?status=` · `GET /admin/kyc/submissions/{id}` (documents via signed URLs)
- `GET /admin/operators` · `POST /admin/operators/{id}/request-go-live` → 201 {operator: AdminOperatorOut, approval: ApprovalOut}
- `GET /admin/quotes?status=` · `GET /admin/quotes/{id}` · `POST /admin/quotes/{id}/resolve` all return AdminQuoteReview with `pdf_url` populated (short-lived signed URL bound to the document and the admin)
- `GET /admin/enterprise-inquiries` → [{id, created_at, account_id, user_id, company, seats, notes, contact_name, contact_email, contact_phone}] (audited read) · `POST /admin/trips/{id}/manifest/revoke-links` → {revoked: n}
- `POST /admin/ingest` multipart {dataset, file} → IngestRun · `GET /admin/ingest/runs`
- `GET /admin/metrics` → {mrr_cents, arr_cents, members_by_plan, kyc_queue, rfq_to_quote_rate, median_operator_response_minutes}
- `GET /admin/agent-actions` · `GET /admin/jobs`
- Also: `PUT /admin/operators/{id}/payment-hosts` · `POST /admin/operators/{id}/contacts/{cid}/confirm-rfq` · `GET|POST /admin/suppressions`, `DELETE /admin/suppressions/{id}` · `GET /admin/inbound/quarantined` · `POST /admin/users/{id}/deactivate`. New approval kinds decided through `POST /admin/approvals/{id}/decide`: `payment_host`, `inbound_review`, `seat_overage`, `legal_notice`.
- Dev/test only (`env in dev,test`; the router is not mounted at all otherwise): `POST /dev/inbound-email` simulates an operator reply to quotes@ with attachments and the provider's authentication verdict (`dmarc_pass`, `spf`, `dkim`); `POST /dev/run-jobs`.

## Security controls

Added after the security review (findings C1 to L9). Each control is enforced in code and covered by `apps/api/tests/test_security_*.py`.

**Environment.** `EXJET_ENV` is required and must be `dev`, `test`, `staging` or `prod`; startup fails with a clear message otherwise (no default, no free string). Fake providers, the published dev secrets, the dev router, `/docs` and `/openapi.json` exist only when `env in (dev, test)`; the dev router is not mounted in staging/prod. Non-dev refuses fake providers and requires `EXJET_JWT_SECRET` and `EXJET_PII_KEY`; session cookies are `Secure` outside dev/test; `EXJET_CORS_ORIGINS` may not contain `*`. The fake billing webhook secret is random per process. Every API response carries `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`, `Referrer-Policy: no-referrer` (and HSTS outside dev/test).

**Inbound quotes and payment links (C1).** A reply produces a member-visible quote only if: its From header parses (strict `email.utils`) to exactly one address; that address equals, after `normalize_email`, a stored `OperatorContact` of the RFQ's operator that was a recipient of that RFQ (no domain trust; for ground requests the FBO address); the mail provider reports an aligned DMARC pass (`InboundAuth.dmarc_pass`, default fail-closed), otherwise the message is `quarantined` with an `inbound_review` approval for an admin; attachments are PDFs only and parse within bounds; and the payment link host is in `Operator.payment_hosts` (admin-approved at onboarding or through a `payment_host` approval), otherwise the quote is `needs_review`. A later quote never expires or hides an earlier one; if its host or total differs it is `needs_review` (flag `differs_from_earlier_quote`) and both remain. The API reports `payment_link.host_approved` and `changed_since_first`. `accept` and `mark-paid` re-check the host.

**Seats and identity (C2).** Seats are invitations (`seat_invitations`: normalized email, SHA-256 of the token, expiry, accepted/revoked). Nothing about an invitee's account changes until they sign in with the invited email and accept; an account with a KYC submission, subscription, trip or other member is never deleted or merged (only a brand-new empty personal account is dropped, with the invitee's explicit accept). Plan seats come from the paid plan (`billing_service.plan_seats`); members plus pending invitations never exceed them, at invite time, at accept time and when a plan changes (extra members are suspended and a `seat_overage` approval is opened). Entitlement is per person (see Roles). An invited member submits their own individual KYC (`kyc_submissions.subject_user_id`); an admin decides it through the same `kyc_final` approval; a before-flush guard refuses `identity_status = approved` without it.

**Files (H1, L7, M2).** Stored content types are sniffed from magic bytes, never taken from the uploader or an email header. Operator attachments: PDF only. KYC: PDF, JPEG, PNG. Everything else is not stored. Every served file is `Content-Disposition: attachment` (RFC 6266), `X-Content-Type-Options: nosniff`, `Content-Security-Policy: sandbox; default-src 'none'`, `Cache-Control: private, no-store`. Download tokens are bound to the storage key, the document id and the viewer's user id and are redeemed only by that signed-in user, who must still be allowed to read the document. Storage keys are random (`<prefix>/<owner>/<uuid>`); the original filename lives only in `documents.filename`. Local storage encrypts file bytes with the PII key (Fernet); the S3 provider, when built, must enforce private buckets and server-side encryption.

**Outbound mail (H3, M1, L8).** One ground request per (trip, FBO, kind, leg) (unique index, 409). Per-account rolling 24 hour caps: `rfq_daily_cap` (40) and `ground_rfq_daily_cap` (10), 429. Member free text in outbound operator/FBO mail has URLs, bare domains and email addresses removed, is capped at 500 characters and is labelled member-provided; RFQs use the KYC-verified holder name. `mailer.send` normalizes and case-folds every recipient before the suppression check, never commits the caller's transaction, and records blocked/failed sends in its own transaction. Suppressions have a unique index on `lower(email)`, a `suppress()` service, admin add/list/remove (audited), and an inbound handler that suppresses authenticated senders replying with unsubscribe, complaint or legal keywords (legal and complaint also open an admin item).

**PII at rest (M2).** `EncryptedStr`: `accounts.display_name`, `email_messages.body_text`, `trips.raw_request`, `trips.notes`, `rfqs.details` (ground request text), `passengers.id_issuer`, enterprise inquiry company/notes (`enterprise_inquiries`; `audit_log` holds only the inquiry id). `jobs.payload` carries ids only. One-time tokens (seat invitation, password reset) are stored hashed and kept out of the stored email body. Accepted exceptions, with reasons: `users.email` stays plaintext (it is the login identifier and is looked up by equality; it is never exposed to operators) and operator contacts stay plaintext (business contacts that must be matched exactly against inbound senders and are member-gated at the API).

**Sessions (M3).** The session JWT carries `users.session_version`; every request compares it with the row. Logout (all sessions), password change, password reset and admin deactivation bump it. Password reset uses a single-use, expiring, hashed token delivered through `mailer` (purpose `password_reset`); the request answer is always 202.

**Rate limits (M4).** Postgres fixed-window counters (`rate_limits`, upsert in a separate transaction, shared by all workers, periodic `ratelimit.cleanup` job). The client address is the socket peer unless `EXJET_TRUSTED_PROXY_HOPS` > 0, in which case it is the entry that many positions from the right of `X-Forwarded-For`. Limits (see `ratelimit.LIMITS`): login (IP and email), signup, password reset (IP and email), password change, seat invite and accept, KYC upload, enterprise inquiry, trip intake, RFQ and ground RFQ creation.

**Attachment parsing (M5).** Size (10 MB), pages (50) and extracted text length are capped; the PDF is parsed once in a child process with CPU and address-space rlimits, an empty environment and a wall-clock timeout (`exjet_product.pdf_safe`). A breach quarantines the message with an admin item and finishes the job (never retried; `jobs.NonRetryable` exists for the same purpose).

**Exclusions (M6).** `exjet_api/opname.py` is the single normalizer and matcher: NFKD, accents, format characters, casefold, Cyrillic/Greek/fullwidth lookalike folding, punctuation and corporate suffixes. The ingest layer (`ingest/normalize.excluded_match`) and the supply layer use the same function; the SQL filter uses a regex generated from it against `operators.name_norm` / `legal_name_norm`, kept current by a mapper listener, so the three agree. Configuration: `EXJET_EXCLUDED_OPERATORS` (NetJets, Flexjet, Nicholas Air), `EXJET_EXCLUDED_OPERATOR_ALIASES` and `EXJET_EXCLUDED_CERTIFICATES` (both EMPTY by default: the founder fills these with trade names, affiliates and certificate numbers; none are invented here). Matching is token-boundary aware: "Nicholas Aircraft Services" and "Net Zero Air" do not match. An operator is sellable only if it is live AND an approved, human-decided `operator_go_live` approval exists. Contacts added to a live operator by ingest default to `receives_rfq = false` until an admin confirms them.

**Billing (L9).** Provider events are applied at most once (`billing_events` ledger by event id), within a timestamp tolerance (not more than 5 minutes in the future, not older than 3 days), in provider time order (`subscriptions.last_event_at`), and through a state machine: a canceled subscription is reopened only by a fresh `checkout.completed`.

**Listings (L1).** Visitors and non-entitled members can narrow `GET /listings?home=` by city or metro only; an airport code is ignored, so the filter cannot reveal which tail is based where.
