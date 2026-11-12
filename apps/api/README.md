# EXJET API

FastAPI + SQLAlchemy 2 + Alembic + Postgres 16. Python 3.12+, managed with `uv`. The deterministic marketplace
services (matching, intake, RFQ text, quote ingest, manifest rules, flight watch, weather) live in `/product`
(package `exjet_product`, a path dependency of this project). Source of truth for behaviour: `/ARCHITECTURE.md`.

## Run

```bash
cd apps/api
uv sync
export EXJET_ENV=dev                      # REQUIRED (dev|test|staging|prod, no default); database defaults to postgresql+psycopg://exjet:exjet@localhost:5432/exjet
uv run alembic upgrade head               # create / update the schema
EXJET_SEED_ADMIN_EMAIL=admin@example.com EXJET_SEED_ADMIN_PASSWORD='choose-a-long-password' \
  uv run python -m exjet_api.seed_dev      # reference data + SYNTHETIC operators + admin user (dev/test only)
uv run uvicorn exjet_api.main:app --port 8000
uv run python -m exjet_api.worker          # second terminal: job queue worker (RFQ dispatch, inbox, KYC check, reminders)
```

OpenAPI: `http://localhost:8000/openapi.json` and `/docs` exist only when `EXJET_ENV` is `dev` or `test`. Export the typed contract for the frontend:
`uv run python -m exjet_api.export_openapi` writes `apps/api/openapi.json`.

In dev with fake providers there is no worker-less shortcut for jobs except the dev endpoints
`POST /v1/dev/run-jobs`, `POST /v1/dev/inbound-email` (simulate an operator reply with PDF attachments) and
`POST /v1/dev/complete-checkout` (completes a fake checkout). The dev router is not mounted unless `EXJET_ENV` is `dev` or `test`.
`/v1/dev/inbound-email` must send `from_address` from a stored operator contact (the seed's SYNTHETIC operators: `ops-a@example.com`, `ops-c@example.com`) and carries the provider's authentication verdict (`dmarc_pass` default true, `spf`, `dkim`); the SYNTHETIC operators' approved payment host is `pay.example.com`, so quote PDFs must link there for the dev loop to produce a ready quote.
All state-changing requests need the header `X-Requested-With: exjet` (CSRF), except the billing webhook.

## Test

```bash
uv run pytest            # API + product tests; uses ONLY the exjet_test database
uv run ruff check exjet_api tests alembic ../../product
```

Tests build the schema by running the real Alembic migrations (downgrade to base, upgrade to head), use fake
providers, and never touch the network. Test PDFs are generated with `reportlab` (dev dependency).

## Layout

```
exjet_api/
  main.py            app, middleware (CSRF header, CORS, security headers on every response), error envelope
  routers/           auth (sessions, email verification, password reset, seat invitations), kyc, billing, catalog (+FBOs), trips, quotes (+documents), flight (manifest/weather/track), operator (secure manifest link), admin, dev
  services/          trips, rfq, quote ingest, kyc, billing, manifest, manifest_links (operator secure links), flight watch, job handlers
  timeutil.py        origin-airport wall time <-> UTC (DST rules below)
  entitlements.py    the one place entitlement is computed (account KYC + subscription + this member's own identity)
  opname.py          the one operator-name normalizer and exclusion matcher (ingest and supply share it)
  emailnorm.py       the one email normalizer and strict From-header parser
  ratelimit.py       Postgres fixed-window limiter, trusted-proxy client address
  filetypes.py       magic-byte sniffing, allowlists, RFC 6266 Content-Disposition, file response headers
  serializers.py     response builders; member-only fields are nulled for non-entitled viewers
  supply.py          every supply query: is_excluded = false, go_live = live, name-match defense
  guardrails.py      KYC-approval guard; approval lookups
  mailer.py          mailer.send(): suppression check, per-purpose authorization, email_messages row, `blocked` + raise
  jobs.py / worker.py  Postgres queue (SKIP LOCKED, backoff, dedupe_key); run_pending() for tests
  providers/         interface + fake per provider; real clients where built; clearly marked stubs otherwise
  seed_dev.py        dev seed (refuses staging/prod); seed_data.py holds the fixtures
alembic/             migrations (0001 initial, 0002 widens agent_actions.status, 0003 security controls, 0004 member app integration)
```

## Environment variables

Names only; see `.env.example`. All are prefixed `EXJET_`.

| Variable | Purpose |
|---|---|
| `ENV` | REQUIRED, no default: `dev`, `test`, `staging` or `prod`. A missing or unknown value stops startup. Anything but dev/test refuses fake providers and boots without the dev router, `/docs`, `/openapi.json` or dev secrets, and requires `JWT_SECRET` and `PII_KEY` |
| `DATABASE_URL` | SQLAlchemy URL (psycopg) |
| `PII_KEY` | Fernet key for field-level PII encryption (required outside dev/test) |
| `JWT_SECRET` | signs the session cookie (required outside dev/test) |
| `SESSION_MINUTES` | session lifetime |
| `APP_BASE_URL`, `WEB_BASE_URL`, `CORS_ORIGINS` | links in emails; allowed browser origins (a `*` is rejected) |
| `TRUSTED_PROXY_HOPS` | reverse proxies in front of the API (default 0). `>0`: the client address is that many entries from the right of `X-Forwarded-For`, used for rate limits |
| `BILLING_PROVIDER` | `fake` or `stripe` (stripe is NOT implemented) |
| `KYC_PROVIDER` | `fake` or `stripe_identity` (NOT implemented) |
| `MAIL_PROVIDER` | `fake` or `gmail` (NOT implemented) |
| `ADSB_PROVIDER` | `fake` or `flightaware` (NOT implemented) |
| `WEATHER_PROVIDER` | `aviationweather` (real client) or `fake` |
| `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `LLM_MODEL_FAST` | `none` (default) or `anthropic`; the model id is read from `LLM_MODEL_FAST` |
| `STORAGE_PROVIDER`, `STORAGE_DIR` | `local` or `s3` (NOT implemented) |
| `RFQ_FROM_ADDRESS`, `EXCLUDED_OPERATORS`, `MAX_FUEL_STOPS`, `MANIFEST_DUE_HOURS` | product rules |
| `EXCLUDED_OPERATOR_ALIASES`, `EXCLUDED_CERTIFICATES` | comma separated extra exclusions (trade names, affiliates, certificate numbers). Empty by default: the founder fills them |
| `RFQ_DAILY_CAP`, `GROUND_RFQ_DAILY_CAP` | per account, rolling 24 hours (defaults 40 and 10) |
| `SEAT_INVITE_TTL_HOURS`, `PASSWORD_RESET_TTL_MINUTES`, `EMAIL_VERIFICATION_TTL_HOURS` | token lifetimes (72 h, 30 min, 48 h) |
| `MANIFEST_LINK_TTL_HOURS`, `MANIFEST_LINK_MAX_VIEWS` | operator manifest link lifetime (72 h) and reads per link (10; set 1 for strictly one view) |
| `PDF_MAX_BYTES`, `PDF_MAX_PAGES`, `PDF_MAX_CHARS`, `PDF_TIMEOUT_SECONDS` | attachment parsing bounds (10 MB, 50, 400000, 20 s) |
| `STRIPE_*`, `FLIGHTAWARE_API_KEY`, `GMAIL_SERVICE_ACCOUNT_JSON` | secrets for the real providers once built |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | read only by `seed_dev` |

## Guardrails and where they are enforced

1. Member-only fields: `serializers.Builder` takes the viewer; `entitlements.can_see_member_fields` decides. Routes never return ORM objects.
2. No prices: only `Quote.total_amount_cents`, copied from an operator PDF and verified verbatim against its text.
   An unreadable or ambiguous total is `needs_review` with a null amount; admins can set it only to an amount that appears in the PDF.
3. Exclusions: `supply.sellable_aircraft_stmt` (SQL, including punctuation-insensitive name match), `supply.operator_sellable` (python), RFQ create, dispatch and mailer; go-live refuses excluded operators.
4. Mail: `mailer.send()` only. Operator-facing purposes need the member's own action, an operator that is live, and an approved `rfq_dispatch_policy`.
5. Go-live: admin route -> `operator_go_live` approval -> decision sets `live` and records the standing dispatch policy.
6. KYC: the vendor check only moves a submission to `in_review`; a before-flush guard refuses `approved` without an approved, human-decided `kyc_final` approval. KYC documents are admin-only via short-lived signed URLs and audited.
7. Plan prices are constants in `services/billing_service.py`; there is no endpoint that edits them. Billing events are idempotent, time-ordered and state-checked.
8. Logs never include PII: handlers log exception class names only, validation errors never echo values.

## Contract notes for the member app

**Departure times.** `depart_at` on `POST /v1/trips` and `PATCH /v1/trips/{id}` is either an instant with an offset or a naive wall-clock
time (`YYYY-MM-DDTHH:MM[:SS]`) that is read in the ORIGIN airport's IANA time zone (`exjet_api/timeutil.py`). It is stored as UTC.
Rules: an airport with no zone, or one `zoneinfo` does not know, is refused with 422 `airport_timezone_unknown` (no guess, no UTC fallback);
a wall time inside a DST gap (02:30 on spring-forward day) is 422 `nonexistent_local_time`; a wall time that occurs twice (01:30 on
fall-back day) takes the first occurrence (the daylight offset, `fold=0`), and sending an offset selects the second. Responses carry
`depart_at` (UTC), `depart_local` (naive wall time at the origin), `origin_timezone`, and `origin` / `destination` airport objects
(`icao, name, city, state, latitude, longitude, timezone`) on every leg. The seed sets a zone for every seeded airport; ingested airports
come from the founder file (`timezone` column of `airports_fbos`).

**Manifest.** `PUT /v1/trips/{id}/manifest` upserts by passenger `id` (see ARCHITECTURE). Full ID numbers are write-only. Operators receive the
manifest only through `GET /v1/operator/manifest?token=`; the email carries the RFQ reference, route and date and no passenger details.
Tokens are per recipient, stored as SHA-256, expire after `MANIFEST_LINK_TTL_HOURS`, are revoked when the manifest changes or is submitted
again, or by `POST /v1/admin/trips/{id}/manifest/revoke-links`; each use writes `audit_log` (`manifest.link_accessed`: ip, time, token id).

**Email verification.** Signup mails a single-use link (`{APP_BASE_URL}/verify-email?token=`, purpose `email_verification`). `POST /v1/auth/verify-email`
verifies and signs in. In staging/prod login answers 403 `email_not_verified` until then; dev/test keep the immediate session. Accounts that existed
before migration 0004 have no `email_verified_at` and must verify (resend endpoint) before they can log in outside dev/test; the dev seed admin is verified.

**Fake billing (dev/test).** `checkout_url` is `{APP_BASE_URL}/dev/checkout?session=…&plan=…`, the portal URL `{APP_BASE_URL}/dev/billing-portal?customer=…`.
The member app renders those pages only in dev/test and completes a checkout with `POST /v1/dev/complete-checkout` {account_id, plan}.

**Reversible migrations.** `alembic downgrade base` works on a database with data (tested in `tests/test_api_gaps.py`): 0002 maps statuses longer than 16 characters (`awaiting_approval` becomes `pending_approval`) before narrowing; 0003 keeps `accounts.display_name` and `passengers.id_issuer` as TEXT instead of truncating encrypted values; 0005 gives rows with a NULL aircraft category the sentinel `unclassified` before restoring NOT NULL. Downgrading drops the columns and tables added by later revisions together with their data.

**Inbound mail from a non-contact.** Stored as a `quarantined` message (`sender_not_contact`) with an `inbound_review` approval and listed under `/admin/inbound/quarantined`. Approval never trusts the sender by itself: on release the exact-contact rule runs again, and the message is accepted only if the sender is a stored contact of the RFQ's operator that an admin confirmed through `POST /admin/operators/{id}/contacts/{cid}/confirm-rfq`. Otherwise it is rejected.

**Payment host baseline.** `rfqs.first_payment_host` is written once, when the first payment link arrives on an RFQ. `payment_link.first_host` exposes it and `changed_since_first` compares to it.

**Types without a category.** Ingest loads an aircraft whose new type has no category and flags `type_needs_category`; `aircraft_types.category` is nullable and such types are excluded from matching and every public listing/category endpoint. Ingest also flags `airport_timezone_missing` and `invalid_timezone` for airports.

**Dev outbox.** `GET /v1/dev/outbox` (dev/test only) reads the in-process fake mail outbox. Jobs run by a separate `python -m exjet_api.worker` have their own outbox: use `POST /v1/dev/run-jobs` for end-to-end runs. `seed_dev` adds SYNTHETIC FBOs (`SYNTHETIC FBO A/B`).

**Enums.** All status-like response fields are `Literal` types (`exjet_api/schemas.py`, top), so OpenAPI declares exact enums.

## Security controls

See `/ARCHITECTURE.md`, section "Security controls". Tests: `tests/test_security_*.py`, `tests/ingest/test_security_ingest.py`,
`../../product/tests/test_pdf_safe.py`. The mail provider (Gmail, not built) must supply `InboundAuth.dmarc_pass` from the
Authentication-Results header its own receiving servers stamped; messages without it are quarantined.

## Known gaps (TODO)

See the "TODO" list in the build report; each item is also marked `TODO(not implemented)` in code.
