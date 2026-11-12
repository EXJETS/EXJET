# EXJET STATUS

Audit date: 2026-11-12. Branch: `claude/intelligent-mccarthy-9cbrj4` (identical to `main` at `6a116b4` before this commit).
Scope: every tracked file read or scanned (75 files, about 9,900 lines excluding the lockfile). Build, typecheck and dependency audit were run.

> **Correction, 2026-11-12 (see REPO_CLEANUP.md).** This audit covers the `main` branch only. A later, much larger line of EXJET work exists on branch `fix/production-seo-2026-10-19` (last commit 2026-10-23, 280 files, Next.js 16, Supabase, tests, brand and SEO documents) and was never merged to `main`. It may be what is deployed. This audit will be redone against the canonical branch once that is confirmed. The spec conflicts and missing-backend findings below apply to `main`; they are unverified for the October line.

## Summary

The repo is a single Next.js 15 front-end prototype with hardcoded mock data. There is no backend, database, auth, billing, KYC, RFQ flow, agent framework, tests or CI. It models a different business from the locked PRODUCT spec: an instant-booking marketplace with prices, commission and a global fleet, where the spec is a US-only, membership-only, RFQ-only marketplace with no prices.

Of the 14 build steps, none is complete. Roughly: reusable UI primitives and visual direction exist; everything else is to be built, and most existing pages must be replaced rather than extended.

## 1. What exists

| Area | Detail |
|---|---|
| Stack | Next.js 15.5 (App Router), React 19, Tailwind 4, Zustand, lucide-react. Single app at repo root. Node 22. |
| Build health | `npm ci` ok. `tsc --noEmit` passes. `next build` passes, 28 routes, all static except `/jets/[id]` and `/dashboard/bookings/[id]`. |
| Public pages | `/` (671-line landing page), `/search`, `/jets/[id]`, `/tracking` |
| Booking flow | `/booking`, `/booking/passengers`, `/booking/review`, `/booking/confirmation` (client state only) |
| Auth pages | `/auth/login`, `/auth/register` (forms only) |
| Dashboards | `/dashboard/*` (client), `/operator/*` (operator portal), `/admin/*` (admin) |
| Components | Navbar, footer, search bar (one way, round trip, multi leg), category grid, filter sidebar, jet card/gallery/specs, carousel, stat card, mini chart, status badge, button, input, badge |
| Data | `src/data/*.json`: 20 aircraft types, 20 airports (5 non-US), 8 routes, 4 empty legs, 8 FAQs, 4 news items, 8 sports events. All hand-written, none from supplied files. |
| SEO | Root metadata, `robots.ts`, single `sitemap.ts`, JSON-LD on home (Organization, FAQPage, WebSite) |
| Deploy | `vercel.json` for a single Next.js project |
| Reusable | UI primitives, search bar trip-type logic, great-circle distance helper, typography and colour direction from the latest redesign (pending `/brand` assets) |

## 2. What is broken

| # | Issue | Where |
|---|---|---|
| B1 | No authentication. Login and register only run a `setTimeout`; nothing is submitted or stored. | `src/app/auth/*` |
| B2 | `/admin`, `/operator`, `/dashboard` are open to anyone. `robots.txt` disallow is the only "protection". | all three trees |
| B3 | 15 dead links (404): `/about`, `/careers`, `/contact`, `/cookies`, `/faq`, `/help`, `/jets`, `/press`, `/privacy`, `/refunds`, `/safety`, `/status`, `/terms`, `/dashboard/trips`, `/dashboard/payments`. Terms and Privacy on register point to `#`. | footer, sidebar, register |
| B4 | No `public/` directory. Aircraft image paths in `jets.json` (`/jets/*.jpg`) do not exist; no favicon or OG image. | `src/data/jets.json` |
| B5 | "Live tracking" is `Math.random()` positions on a fake map, refreshed on a timer. | `src/app/tracking`, `live-tracker.tsx` |
| B6 | Booking state lives in memory only; a refresh loses it. Confirmation and review compute different totals (`×1.235` vs base + surcharge + 8.5%). | `src/app/booking/*` |
| B7 | Lint is not configured (`next lint` prompts interactively) and is skipped in builds. | `next.config.ts` |
| B8 | `npm audit`: 5 advisories (4 high, 1 critical) in transitive deps including `sharp` and `source-map-js`; fixable with `npm audit fix`. | lockfile |
| B9 | Social links go to bare `instagram.com`, `twitter.com` etc. | footer |
| B10 | No tests of any kind, no CI. | repo |

## 3. Conflicts with the locked PRODUCT spec

These are not gaps; the current code asserts the opposite of the spec and must be removed.

| # | Spec | Current code |
|---|---|---|
| C1 | No prices or estimates anywhere | Prices in 24 files: hourly rates, "from" prices, 2/4/8-hour estimates, price filters and sort, FAQ price ranges, empty-leg prices with "up to 75% off" |
| C2 | RFQ only, no instant booking | Full instant-booking checkout; copy says "Reserve a private jet in minutes", "bookable in a single tap", "Book Now" |
| C3 | Membership revenue only, no commission | Admin has a commission setting (default 10%) and commission per booking; operator portal has earnings and payouts |
| C4 | EXJET does not process flight payments | Booking flow computes totals, taxes and fees as if EXJET charges the member |
| C5 | Each listing is a specific tail; operator and tail visible to KYC-approved members only | Listings are generic aircraft types; no entitlement gating exists |
| C6 | US market only | "Global Access", "5,000+ airports worldwide", London, Paris, Amsterdam, Dubai, Hong Kong airports, Monaco GP, Paris to Venice empty leg |
| C7 | No fabricated stats | "5,000+ airports", "2,400+ network tails", ratings and review counts per aircraft, four invented customer reviews, invented news ("adds two G700s to fleet"; EXJET has no fleet), invented admin revenue |
| C8 | Never display the rating source; ratings are Not rated to Platinum+ | "ARGUS Platinum", "Wyvern Wingman", "IS-BAO Stage 3" named on home, footer, FAQ, metadata, news |
| C9 | No invented operator data | Fictional operators with emails and phone numbers ("Sky Charter Co.", "Elite Air", "Premier Jets", "Summit Aviation") and fictional tails (N401GX and others) |
| C10 | Operators reply by email with PDF quote; first accounts onboarded one at a time | A self-serve operator portal with fleet management, bookings and earnings. Not in spec. Decision needed (see section 6). |
| C11 | Flow includes checked bags, carry on, golf, ski | Search has bags and pets only |
| C12 | No emojis | 6 symbol/dingbat characters in source to review and replace with icons |
| C13 | "Concierge", "24/7", "confirmed in under four hours" | Unsupported service claims; members self source |

## 4. Missing versus spec, by build step

| Step | Status | Notes |
|---|---|---|
| 1. STATUS.md + `.claude/agents/` | Done in this commit | 8 subagents defined: architect, backend, frontend, data, seo, qa, devops, security |
| 2. Architecture, schema, API contracts | Missing | No monorepo (`apps/web`, `apps/app`, `apps/api`, `/agents`, `/product`, `/data`, `/brand`), no schema, no OpenAPI, no DECISIONS.md |
| 3. Data ingest | Missing and blocked | No pipeline. `/data/raw` does not exist: no operator, aircraft, airports_fbos or outreach files have been supplied |
| 4. Product loop | Missing | Signup, KYC upload and review, membership billing, plain-language intake, mission matching (range, runway, elevation, pax, max one fuel stop), RFQ dispatch from quotes@exjet.com, quote and contract ingest, payment link, manifest T-24h, flight watch, weather summaries, rental car and chauffeur RFQs: none exist |
| 5. Marketing site | Mostly missing | Only a home page. No How it works, Membership, Routes, Aircraft, Categories, Articles, Blog, Guides, FAQ, Glossary, Legal. No programmatic pages, split sitemap, canonicals per page, BreadcrumbList/Article/Service schema, IndexNow or llms.txt. `/brand` does not exist |
| 6. Agent framework | Missing | No registry, router, queue, permissions, `agent_actions` log or approvals |
| 7 to 11. Agent orgs | Missing | No `/agents` folder; none of the C suite, director or staff agents exist |
| 12. Company OS | Missing | Current `/admin` is static mock data and models the wrong business |
| 13. Tests, evals, Lighthouse | Missing | Zero tests |
| 14. Vercel staging | Partial | One project config for a single app; no staging/prod split, no API hosting, no env config |

Hard guardrails (member-only data, no fabricated prices, approval before send, suppression, PII encryption): none exist because there is no backend.

## 5. Proposed disposition of existing code

| Keep and adapt | Replace | Delete |
|---|---|---|
| UI primitives, navbar/footer shell, search bar (extend with golf, ski, carry on), category grid, distance helper, type and colour direction | Home page copy, `/search` (becomes category → type → tail → RFQ), `/jets/[id]` (splits into public aircraft-type page and member-only tail page), client dashboard (becomes trips), `/admin` (becomes Company OS) | Booking checkout, price fields and filters, commission and earnings, fake reviews, news, sports events and empty legs data, simulated tracking, non-US airports, all mock operators and tails |

## 6. Blockers and decisions needed from you

1. **Data files.** `/data/raw` is empty. Step 3 cannot start, and steps 4 and 5 can only be built against synthetic test fixtures until operators, aircraft, airports_fbos and outreach_lists arrive.
2. **Brand assets.** `/brand` is empty. I can carry the current editorial look forward as a placeholder, or wait.
3. **Operator portal.** The spec has operators replying by email only. Confirm I should remove the existing `/operator` portal rather than keep it.
4. **Sports events and news sections.** Not in the spec's page list, and the news is invented. I plan to remove both unless you want events kept as real, dated content.
5. **Empty legs.** Spec says they are RFQ like everything else. Confirm they appear only when sourced from operator data, with no price and no discount shown.
6. **Phase A git flow.** Spec says one branch per milestone. This session is restricted to pushing to `claude/intelligent-mccarthy-9cbrj4`. Either I use this one branch with a commit and stop point per milestone, or you grant additional branches.
7. **Vendor defaults** (will be logged in DECISIONS.md at step 2, nothing purchased): Stripe Billing for membership, Stripe Identity or Persona for KYC, FlightAware AeroAPI or ADS-B Exchange for tracking, Smartlead for outreach, Postmark or Resend for transactional email, API hosting on Vercel Python functions versus a container host (Postgres queue workers need a long-running process, so this needs a real decision).

## 7. TODO register

No code TODO markers exist in the repo. Open items are everything in sections 2 to 4. This file is updated at each milestone.

## 8. Subagent notes

Files are in `.claude/agents/` using the current documented format (Markdown with YAML frontmatter: `name`, `description`, optional `model`, `tools`; body is the system prompt). Architect and security inherit the session model; the rest run on `sonnet`. Tools are left unrestricted for now; tightening per role is a step 2 item.
