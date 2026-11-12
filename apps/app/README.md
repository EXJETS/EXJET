# EXJET member platform (apps/app)

Next.js 16 (App Router) + React 19 + TypeScript. Member platform and Company OS for app.exjet.com.

## Run

```bash
npm install                 # uses legacy-peer-deps (see .npmrc): openapi-typescript pins typescript ^5 as a peer
npm run dev                 # http://localhost:3001, API expected at http://localhost:8000
npm run dev:mock            # NEXT_PUBLIC_API_MOCK=1: in-memory SYNTHETIC API, MOCK DATA badge, persona switcher
npm run build && npm start
npm run lint && npm run typecheck && npm test
npm run gen:api             # regenerate lib/api/schema.d.ts from ../api/openapi.json
npm run e2e                 # Playwright against the mock (builds a mock-mode build on :3001)
npm run e2e:api             # Playwright against the REAL API + the exjet_e2e database (see e2e/api)
```

## API access: same-origin proxy (decision)

The browser always calls `/v1/...` on the app's own origin. `next.config.ts` rewrites `/v1/:path*` to
`$API_ORIGIN/v1/:path*` (server-side env, default `http://localhost:8000`). Reasons:

- the httpOnly `exjet_session` cookie is first-party (SameSite=Lax works without CORS or third-party cookie rules),
- the same setup works in production (`app.exjet.com/v1` -> API), with no CORS surface,
- API-issued relative URLs (`/v1/files/...` signed document links, `/v1/documents/{id}` redirects) resolve correctly.

The API's own CORS + credentials (allowed origins `http://localhost:3001`) is also sufficient for direct calls: set
`NEXT_PUBLIC_API_URL=http://localhost:8000` to bypass the proxy. The default is the proxy.

## Test pages and flags

- `/dev/checkout` and `/dev/billing-portal` stand in for the billing provider in dev. They render only when `NEXT_PUBLIC_DEV_BILLING=1`
  (set at build time) or in mock mode; a production build without the flag returns 404 for them.
- `NEXT_PUBLIC_API_MOCK=1` turns on the in-memory SYNTHETIC mock (MOCK DATA badge, persona switcher).

## End-to-end suites

- `npm run e2e` runs against the mock (Chromium, 1440 and 390).
- `npm run e2e:api` runs against the real API and the `exjet_e2e` database (1440 and 390): `e2e/api/start-api.sh` drops and recreates the
  schema, migrates, seeds, and starts the API through `e2e/api/serve.py`. That wrapper adds one test-only route, `GET /v1/e2e/outbox`
  (the fake mail provider's outbox), because tokens for email verification, seat invitations and operator manifest links exist only in sent
  mail. Nothing in `apps/api` is modified. Specs: `journey` (member loop, operator secure link, entitlement checks, password reset),
  `fraud` (inbound checks, payment host approval), `seats` (invitation, per-person entitlement).
- The API rate-limits logins and signups per address, so the admin session is created once in global setup and reused. Set `E2E_REUSE=1`
  to run against servers you started yourself (no database reset).

## Types

`lib/api/schema.d.ts` is generated (openapi-typescript) and committed. `lib/api/types.ts` holds thin named aliases and
the few string enums the schema leaves as `string`. Mock mode (`lib/api/mock.ts`) is typed against the same schema.

## Mock mode

Only enabled by `NEXT_PUBLIC_API_MOCK=1`. All data is SYNTHETIC. Never set it in production.
