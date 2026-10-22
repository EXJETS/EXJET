# EXJET client web app

Branch: feat/client-webapp-2026-10-22. This implements a Next.js application at `/app/` alongside the public SEO website. It is a functional foundation, not completed XO or BookEmptyLegs parity.

## Implemented source

- Responsive application shell with shared navigation and EXJET assets.
- Overview, existing Avinode flight search, empty-leg browsing and aircraft comparison.
- Supabase SSR passwordless email-link sign-in and callback; cookie refresh limited to `/app/`.
- Account profile preferences; saved airport locations; private trip drafts; read-only confirmed trip records.
- Persistent client/advisor conversations and a staff-only inbox at `/app/team/`.
- Real Postgres row-level ownership rules and explicit column grants; no service-role key used by application code.
- User-provided travel-role preferences never confer permissions.
- Configuration fails closed. With no provisioned backend, private pages show an access notice and no simulated records. Automated alerts are explicitly unavailable.

## Required infrastructure


Create the `exjet-client-portal` project in the user-confirmed organization, in a US region appropriate to EXJET's retention and operations policy. Inspect project tables before applying `supabase/migrations/20261022051248_client_workspace.sql`. Run database advisors afterward and fix findings. The migration was generated with the CLI, but subsequent CLI analytics were blocked by automatic approval review; use the connected Supabase migration tools for deployment.

## Runtime configuration

Set these in the intended Vercel project and environment, never in committed source:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project API URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key only. No secret/service-role key.
- `EXJET_APP_ORIGIN`: exact HTTPS origin for this environment. Production is `https://www.exjet.com`. Set the exact preview origin for preview sign-in tests.
- `EXJET_PORTAL_ENABLED`: leave unset/false until migration, SMTP, auth URLs and verification are complete. Set `true` only for environments ready for authenticated use.

Configure Supabase Site URL and the exact allowed `/app/auth/callback/` redirect URL for production and the tested preview. Avoid wildcard production redirects. Use PKCE email links in the same browser. Do not enable anonymous authentication.

Configure an approved transactional email service and verify sender-domain authentication before public signup. Supabase's default mail delivery is not a production delivery configuration. Validate successful delivery, an expired link, replayed link, invalid callback and sign-out in a staging environment. No sign-in or outreach emails were sent during development.

Staff access requires an explicitly approved staff user ID inserted into `portal_staff` by an administrator. There is no public staff signup or role escalation route. Do not grant this access based on user-editable profile fields or email-domain guesses.

## Data rules

- Client records are scoped to the authenticated, verified user.
- Profile upserts can update only permitted columns; RLS prevents reassignment to another user.
- Trips saved by clients are drafts, never confirmed bookings.
- Confirmed trips are read-only to clients and must come from a verified operations process.
- Messages remain in-app; no email or push notifications are claimed.
- The app does not store card numbers, passwords, passport details, invoices or medical records.
- No personal trip or contact records are stored in browser localStorage.
- Personalized pages and callbacks are private/no-store, and the app is noindexed and absent from the public sitemap.

## Release gates

Local checks: build/TypeScript and ESLint passed; isolated Postgres tests verify ownership, cross-user reads/writes, immutable ownership, prevention of staff elevation, read-only confirmed trips, advisor-message spoofing rejection and anonymous access denial. These are not a substitute for verification on the actual Supabase project.

Before production activation: apply migration; run advisors; configure auth email/redirects; test two separate client accounts; test staff access and reply delivery; verify logout and cookie refresh; verify app noindex/no-store headers; verify public SEO routes and Avinode remain intact.

## Still to implement

Automated flight alerts and unsubscribe delivery, cross-device empty-leg watchlists, shared EA/family-office workspaces and delegated permissions, billing/payment-method management, checkout, membership entitlements, operations synchronization of confirmed trips, real-time chat/notifications, authenticated image/file handling and support retention/deletion workflows. Do not expose inactive controls or imply that those services work.
