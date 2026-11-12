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
  routers/           auth (sessions, password reset, seat invitations), kyc, billing, catalog, trips, quotes (+documents), flight (manifest/weather/track), admin, dev
  services/          trips, rfq, quote ingest, kyc, billing, manifest, flight watch, job handlers
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
alembic/             migrations (0001 initial, 0002 widens agent_actions.status, 0003 security controls)
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
| `SEAT_INVITE_TTL_HOURS`, `PASSWORD_RESET_TTL_MINUTES` | token lifetimes (72 h, 30 min) |
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

## Security controls

See `/ARCHITECTURE.md`, section "Security controls". Tests: `tests/test_security_*.py`, `tests/ingest/test_security_ingest.py`,
`../../product/tests/test_pdf_safe.py`. The mail provider (Gmail, not built) must supply `InboundAuth.dmarc_pass` from the
Authentication-Results header its own receiving servers stamped; messages without it are quarantined.

## Known gaps (TODO)

See the "TODO" list in the build report; each item is also marked `TODO(not implemented)` in code.
