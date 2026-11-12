#!/usr/bin/env bash
# Resets the exjet_e2e database, seeds it (SYNTHETIC data + admin) and starts the real API on :8000.
# Used by playwright.api.config.ts as a webServer, so every e2e run starts from the same state.
set -euo pipefail
cd "$(dirname "$0")/../../../api"
export EXJET_ENV=dev
export EXJET_DATABASE_URL="${E2E_DATABASE_URL:-postgresql+psycopg://exjet:exjet@localhost:5432/exjet_e2e}"
export EXJET_WEATHER_PROVIDER=fake
export EXJET_APP_BASE_URL=http://localhost:3002
export EXJET_CORS_ORIGINS=http://localhost:3002
case "$EXJET_DATABASE_URL" in *exjet_e2e*) ;; *) echo "refusing to reset a database that is not exjet_e2e" >&2; exit 1;; esac
uv run alembic downgrade base >/dev/null 2>&1 || true
uv run alembic upgrade head >/dev/null
EXJET_SEED_ADMIN_EMAIL=admin@example.com EXJET_SEED_ADMIN_PASSWORD='dev-admin-password-1' uv run python -m exjet_api.seed_dev
exec uv run uvicorn exjet_api.main:app --port 8000
