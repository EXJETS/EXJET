#!/usr/bin/env bash
# Resets the exjet_e2e database, seeds it (SYNTHETIC data + admin) and starts the real API on :8000.
# Used by playwright.api.config.ts as a webServer, so every e2e run starts from the same state.
set -euo pipefail
E2E_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$E2E_DIR/../../../api"
export EXJET_ENV=dev
export EXJET_DATABASE_URL="${E2E_DATABASE_URL:-postgresql+psycopg://exjet:exjet@localhost:5432/exjet_e2e}"
export EXJET_WEATHER_PROVIDER=fake
export EXJET_APP_BASE_URL=http://localhost:3002
export EXJET_CORS_ORIGINS=http://localhost:3002
case "$EXJET_DATABASE_URL" in *exjet_e2e*) ;; *) echo "refusing to reset a database that is not exjet_e2e" >&2; exit 1;; esac
# Drop and recreate the schema (alembic downgrade base fails once agent_actions holds statuses longer than 16 chars; see the e2e report).
psql "${EXJET_DATABASE_URL/+psycopg/}" -v ON_ERROR_STOP=1 -q -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
uv run alembic upgrade head >/dev/null
EXJET_SEED_ADMIN_EMAIL=admin@example.com EXJET_SEED_ADMIN_PASSWORD='dev-admin-password-1' uv run python -m exjet_api.seed_dev
exec uv run uvicorn --app-dir "$E2E_DIR" serve:app --port 8000
