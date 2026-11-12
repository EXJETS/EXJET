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
| **Entitled member** = account `kyc_status == approved` AND subscription `status == active` | See operator name, tail number, operator contacts; send RFQs; see quotes |
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
- `POST /auth/signup` {email, password, full_name, account_type: individual|family_office, signup_source?} → 201 Me
- `POST /auth/login` {email, password} → Me · `POST /auth/logout` → 204 · `GET /me` → Me
- Me = {user:{id,email,full_name,role}, account:{id,type,display_name,seats,kyc_status}, subscription:{plan,status,current_period_end}|null, entitled: bool, next_step: "kyc"|"kyc_pending"|"billing"|"ready"}
- `POST /account/seats` {email} (family office second seat) → 201

KYC
- `POST /kyc/submissions` multipart: kind (individual|business), holder_name, business_name?, business_tax_id?, files[] with doc_types[] (passport|drivers_license|business_doc) → 201 {id,status}
- `GET /kyc/status` → {kyc_status, latest_submission:{id,status,created_at,decision_note}|null}

Billing (membership only)
- `GET /billing/plans` → [{plan,name,unit_amount_cents,interval:"month",seats}] (Individual 75000, Family Office 100000; Enterprise is inquiry and has no price)
- `POST /billing/checkout` {plan} → {checkout_url} · `POST /billing/portal` → {url}
- `POST /billing/webhook` (provider signature) · `POST /billing/enterprise-inquiry` {company,seats,notes} → 202

Catalog (public; member-only fields null unless entitled)
- `GET /airports?q=` → [{icao,iata,name,city,state,elevation_ft,longest_runway_ft}]
- `GET /categories` → [{category,name,type_count}] · `GET /aircraft-types?category=` → [AircraftType] · `GET /aircraft-types/{slug}`
- `GET /listings?type_slug=&category=&home=` → [Listing]
- Listing = {listing_id, type:{slug,manufacturer,model,category}, year_of_manufacture, year_refurbished, passenger_seats, home_city, amenities, photos, safety_rating, tail_number|null, operator:{id,dba_name,certificate_type,contacts:[{name,title,email,phone}]}|null}
- `GET /empty-legs` → [{id, origin, destination, available_from, available_to, listing: Listing}] (never a price)

Trips
- `POST /trips/intake` {text} → TripDraft parsed from plain language {trip_type, legs:[{origin_icao,destination_icao,depart_at}], passengers, checked_bags, carry_on_bags, golf_bags, ski_bags, unresolved:[field…], confidence}. Parses; does not save.
- `POST /trips` TripDraft → 201 Trip · `GET /trips` · `GET /trips/{id}` · `PATCH /trips/{id}` (draft only) · `POST /trips/{id}/cancel`
- `GET /trips/{id}/match` → {legs:[{distance_nm}], categories:[{category, types:[{slug,model,stops:0|1,fuel_stop_icao|null,flight_time_minutes, listing_count}]}], rejected:[{slug,reasons[]}]}
- `GET /trips/{id}/listings?type_slug=` → [Listing] feasible tails (entitled sees operator/tail)
- `POST /trips/{id}/rfqs` {listing_ids:[…]} (entitled only) → 201 [Rfq] and enqueues dispatch
- `POST /trips/{id}/ground-rfqs` {kind: rental_car|chauffeur, leg_sequence, fbo_id, details} (entitled only)
- Rfq = {id, reference, kind, status, sent_at, replied_at, listing: Listing}
- Trip = {id,status,trip_type,passengers,bags…,legs[],rfqs[],quotes[],manifest:{due_at,submitted_at}|null,weather_available:bool}

Quotes, contract, payment
- `GET /trips/{id}/quotes` → [Quote]; Quote = {id,status,operator:{dba_name},listing,total_amount_cents|null,currency,valid_until,operator_quote_number,line_items[],quote_pdf_url,contract:{id,pdf_url,acknowledged_at}|null,payment_link:{url,host,status}|null}
- `POST /quotes/{id}/accept` → Trip (contracted; other quotes declined) · `POST /quotes/{id}/decline`
- `POST /contracts/{id}/acknowledge` · `POST /quotes/{id}/payment/mark-paid` → Trip (paid → manifest_due)
- `GET /documents/{id}` → 302 short-lived signed URL (owner account or admin only; audited for KYC)

Manifest and flight
- `GET /trips/{id}/manifest` → {due_at, submitted_at, required_id_type, passengers:[…]} · `PUT /trips/{id}/manifest` {passengers:[{full_name,date_of_birth,id_type,id_number,id_expiry,id_issuer,weight_lbs?}]} · `POST /trips/{id}/manifest/submit`
- `GET /trips/{id}/weather` → per leg {origin:{metar,taf}, destination:{metar,taf}, summary}
- `GET /trips/{id}/track` → per leg {status, position:{lat,lon,altitude_ft,groundspeed_kts,heading,at}|null}

Admin / Company OS (role admin)
- `GET /admin/approvals?status=` · `POST /admin/approvals/{id}/decide` {decision: approved|rejected, note}
- `GET /admin/kyc/submissions?status=` · `GET /admin/kyc/submissions/{id}` (documents via signed URLs)
- `GET /admin/operators` · `POST /admin/operators/{id}/request-go-live`
- `POST /admin/ingest` multipart {dataset, file} → IngestRun · `GET /admin/ingest/runs`
- `GET /admin/metrics` → {mrr_cents, arr_cents, members_by_plan, kyc_queue, rfq_to_quote_rate, median_operator_response_minutes}
- `GET /admin/agent-actions` · `GET /admin/jobs`
- Dev/test only (`env in dev,test`): `POST /dev/inbound-email` simulates an operator reply to quotes@ with attachments; `POST /dev/run-jobs`.
