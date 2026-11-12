# EXJET STATUS

Updated 2026-11-12. Branch `claude/intelligent-mccarthy-9cbrj4`, draft PR EXJETS/EXJET#53.
Design docs: `ARCHITECTURE.md`, `DECISIONS.md`. Data: `DATA_REPORT.md`. Repo hygiene: `REPO_CLEANUP.md`.

## Where the build stands

| Step | Status | Evidence |
|---|---|---|
| 1. Audit + build subagents | Done | `.claude/agents/` (8 subagents) |
| 2. Architecture, schema, API contract | Done | `ARCHITECTURE.md`, `apps/api/exjet_api/models.py` (30 tables), `apps/api/openapi.json` |
| 3. Data ingest pipeline | Built, **no founder data loaded** | `apps/api/exjet_api/ingest/`, 157 tests. `/data/raw` is empty |
| 4. Product loop | API done on fake providers; member app built; **integration in progress** | 286 API tests incl. end-to-end loop and guardrails; app passes lint, build, unit and mock e2e |
| 5. Marketing site | Not started | |
| 6. Agent framework | Tables only (`agent_actions`, `approvals`, `jobs`) | |
| 7 to 11. Agent orgs | Not started | |
| 12. Company OS | First screens (overview, approvals, KYC review, operators, data upload, jobs, agent actions) | |
| 13. Full tests, evals, Lighthouse | Partial (unit, integration, guardrail, mock e2e) | |
| 14. Vercel staging | Not started; needs Vercel team access | |

## What works today (fake providers, synthetic fixtures)

Signup → KYC document upload → vendor check → admin final approval → membership checkout → plain-language trip intake → mission match (nonstop or one fuel stop) → tail listings → RFQ dispatch through the mailer → operator reply with PDF → quote ingest → accept → contract acknowledge → mark operator payment link paid → manifest (REAL ID / passport rule, due T-24h) → flight watch and weather.

Hard guardrails enforced in code and covered by tests: member-only fields stripped for non-entitled viewers; excluded operators rejected at ingest and filtered at query, RFQ and mail level; no send to suppressed addresses or without authorization; KYC approval only through an admin decision; no amount stored unless it appears verbatim in the operator's PDF; PII columns encrypted; dev endpoints and fake providers refused outside dev/test.

## Not built (do not treat as done)

Real integrations, each behind an interface and currently raising on use:
1. Stripe Billing (checkout, portal, webhook verification) — `providers/billing.py`
2. Stripe Identity KYC — `providers/kyc.py`
3. Gmail send and inbox polling for quotes@exjet.com — `providers/mail.py`
4. FlightAware tracking — `providers/adsb.py`
5. S3-compatible document storage — `providers/storage.py`
6. aviationweather.gov client and Anthropic LLM client are written but never run against the live services

Product gaps:
7. FAA registry sync job (no data source chosen)
8. Manifest delivery to the operator (passenger PII by email needs a design decision)
9. Family Office second-seat invite (only attaches an existing login)
10. In-app notifications (members learn of quotes by email and by opening the trip)
11. Plan prices are code constants; `config/plans.yaml` and `config/models.yaml` do not exist yet
12. Rate limiting is single-instance, in memory
13. Legal Terms page is a placeholder pending counsel; AOG disclaimer sentence is present
14. Seed airport and aircraft-type figures were entered from memory for development and must be replaced by founder data or verified sources before any public page uses them

Open review items:
15. Member app is being connected to the real API; several response shapes were guessed while both were built in parallel
16. Security review of the API in progress
17. 4 lint findings in `apps/api` to clear

## Legacy and repo hygiene

- The April prototype still sits at the repo root (`src/`), kept only so the existing Vercel projects build. It conflicts with the spec (prices, instant booking, commission, fabricated stats) and is removed once Vercel root directories are repointed.
- The October site (`fix/production-seo-2026-10-19`) was never merged to `main`. Its brand assets are in `/brand`; its product positioning (broker, cargo, sales, Avinode widget) is not carried over. Which Vercel project and branch serve exjet.com is unverified.
- Repo and branch cleanup is paused; nothing was archived or deleted. See `REPO_CLEANUP.md`.

## Needed from the founder

1. Data files in `/data/raw`: operators, aircraft, airports_fbos, outreach_lists (the folder is gitignored; the repo is public).
2. Vercel team access for staging and for identifying the production project.
3. Decisions listed at the end of `DECISIONS.md` and in `REPO_CLEANUP.md`.
4. Safety rating mapping for any vendor rating outside Gold / Gold+ / Platinum / Platinum+.
5. Whether a passport should be accepted on a domestic trip in place of REAL ID (currently rejected, per the spec wording).
