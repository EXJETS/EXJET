# EXJET API

FastAPI + SQLAlchemy 2 + Alembic + Postgres 16. Python 3.12+, managed with `uv`. The deterministic marketplace
services (matching, intake, RFQ text, quote ingest, manifest rules, flight watch, weather) live in `/product`
(package `exjet_product`, a path dependency of this project). Source of truth for behaviour: `/ARCHITECTURE.md`.

## Run

```bash
cd apps/api
uv sync
export EXJET_ENV=dev                      # database defaults to postgresql+psycopg://exjet:exjet@localhost:5432/exjet
uv run alembic upgrade head               # create / update the schema
EXJET_SEED_ADMIN_EMAIL=admin@example.com EXJET_SEED_ADMIN_PASSWORD='choose-a-long-password' \
  uv run python -m exjet_api.seed_dev      # reference data + SYNTHETIC operators + admin user (dev/test only)
uv run uvicorn exjet_api.main:app --port 8000
uv run python -m exjet_api.worker          # second terminal: job queue worker (RFQ dispatch, inbox, KYC check, reminders)
```

OpenAPI: `http://localhost:8000/openapi.json` (dev also serves `/docs`). Export the typed contract for the frontend:
`uv run python -m exjet_api.export_openapi` writes `apps/api/openapi.json`.

In dev with fake providers there is no worker-less shortcut for jobs except the dev endpoints
`POST /v1/dev/run-jobs`, `POST /v1/dev/inbound-email` (simulate an operator reply with PDF attachments) and
`POST /v1/dev/complete-checkout` (completes a fake checkout). They return 404 unless `EXJET_ENV` is `dev` or `test`.
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
  main.py            app, middleware (CSRF header, CORS, security headers), error envelope
  routers/           auth, kyc, billing, catalog, trips, quotes (+documents), flight (manifest/weather/track), admin, dev
  services/          trips, rfq, quote ingest, kyc, billing, manifest, flight watch, job handlers
  entitlements.py    the one place entitlement is computed
  serializers.py     response builders; member-only fields are nulled for non-entitled viewers
  supply.py          every supply query: is_excluded = false, go_live = live, name-match defense
  guardrails.py      KYC-approval guard; approval lookups
  mailer.py          mailer.send(): suppression check, per-purpose authorization, email_messages row, `blocked` + raise
  jobs.py / worker.py  Postgres queue (SKIP LOCKED, backoff, dedupe_key); run_pending() for tests
  providers/         interface + fake per provider; real clients where built; clearly marked stubs otherwise
  seed_dev.py        dev seed (refuses staging/prod); seed_data.py holds the fixtures
alembic/             migrations (0001 initial, 0002 widens agent_actions.status)
```

## Environment variables

Names only; see `.env.example`. All are prefixed `EXJET_`.

| Variable | Purpose |
|---|---|
| `ENV` | `dev`, `test`, `staging`, `prod`. staging/prod refuse to boot on fake providers or without secrets |
| `DATABASE_URL` | SQLAlchemy URL (psycopg) |
| `PII_KEY` | Fernet key for field-level PII encryption (required outside dev/test) |
| `JWT_SECRET` | signs the session cookie (required outside dev/test) |
| `SESSION_MINUTES` | session lifetime |
| `APP_BASE_URL`, `WEB_BASE_URL`, `CORS_ORIGINS` | links in emails; allowed browser origins |
| `BILLING_PROVIDER` | `fake` or `stripe` (stripe is NOT implemented) |
| `KYC_PROVIDER` | `fake` or `stripe_identity` (NOT implemented) |
| `MAIL_PROVIDER` | `fake` or `gmail` (NOT implemented) |
| `ADSB_PROVIDER` | `fake` or `flightaware` (NOT implemented) |
| `WEATHER_PROVIDER` | `aviationweather` (real client) or `fake` |
| `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `LLM_MODEL_FAST` | `none` (default) or `anthropic`; the model id is read from `LLM_MODEL_FAST` |
| `STORAGE_PROVIDER`, `STORAGE_DIR` | `local` or `s3` (NOT implemented) |
| `RFQ_FROM_ADDRESS`, `EXCLUDED_OPERATORS`, `MAX_FUEL_STOPS`, `MANIFEST_DUE_HOURS` | product rules |
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
7. Plan prices are constants in `services/billing_service.py`; there is no endpoint that edits them.
8. Logs never include PII: handlers log exception class names only, validation errors never echo values.

## Known gaps (TODO)

See the "TODO" list in the build report; each item is also marked `TODO(not implemented)` in code.
