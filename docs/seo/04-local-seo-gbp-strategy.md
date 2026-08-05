# EXJET Local SEO & Google Business Profile Strategy — Dallas/Fort Worth

## 0. Prerequisite: EXJET needs a real, defensible local footprint

Google Business Profile (GBP) requires a legitimate business presence tied to the service area you claim, and local-pack ranking is driven heavily by proximity + prominence signals that don't exist yet on the site (no address, no phone, no NAP — confirmed in `01-technical-seo-audit.md`). Before any GBP work below can be effective:

1. **Establish a real Dallas-area address.** This can be a staffed office, a registered virtual office with mail handling and a real suite number (avoid pure mailbox-only services — Google increasingly suspends profiles at UPS Store/mailbox addresses for service-area businesses that imply a storefront), or — most credible for a charter broker — a **desk/office arrangement at Addison Airport (ADS)**, which is the actual operational hub for DFW private aviation and instantly credible to both Google and to HNW searchers who know the market.
2. **Get a local (214/972/469/817) phone number** and route it through a call-tracking number (CallRail or similar) so every GBP-driven call is attributable — critical for proving ROI in the 90-day plan's review cadence.
3. **Decide GBP business type: Service Area Business (SAB) vs. storefront.** A charter broker doesn't have walk-in customers, so this should be configured as a **Service Area Business with a hidden/undisclosed street address** and a defined service area (Dallas, Fort Worth, Addison, Plano, Frisco, Southlake, Highland Park, University Park, and the broader DFW metro) — not a storefront listing. This is a checkbox in the GBP setup and materially affects whether you're eligible for local-pack results at all.

Everything below assumes this foundation is in place by end of Week 2 (see `07-90-day-execution-plan.md`).

---

## 1. Categories

**Primary category:** `Charter` if available, otherwise the closest Google-supported aviation category — in practice GBP's aviation-adjacent categories are limited, so the standard approach used successfully by charter brokers is:

- **Primary:** `Aviation Charter` (if not available in your account's category picker, use `Airline` or `Travel Agency` as documented fallback — test availability at setup time, category names/availability shift)
- **Secondary categories (add all that apply):** `Corporate Charter`, `Airport Shuttle Service` (only if you also do ground/FBO coordination — omit if not accurate), `Travel Agency`, `Tour Operator` (only if bundling travel packages — omit if pure charter), `Executive Suite Rental Agency` (omit — not applicable, listed here only as an example of a *wrong* category to avoid; category creep hurts relevance)

Do not over-add categories to try to rank for more terms — GBP relevance is hurt, not helped, by inaccurate secondary categories. Two to three tightly accurate categories outperform six loosely related ones.

## 2. Services (GBP "Services" section)

List each as its own service with a short description (this section is directly indexed and searchable within Maps/Search):

1. **Private Jet Charter** — "On-demand private jet charter across light, midsize, super-midsize, heavy, and ultra-long-range aircraft. Confirmed in under 4 hours."
2. **Corporate Jet Charter** — "Dedicated corporate travel program management for executive teams and boards — multi-leg itineraries, recurring route accounts, centralized billing."
3. **Empty Leg Flights** — "Repositioning flights at up to 75% off standard charter rates. Live Texas and national inventory."
4. **Private Jet Broker Services** — "Independent charter brokerage — we source and vet the aircraft, you don't own or lease anything."
5. **Group & Event Charter** — "Multi-aircraft coordination for sports, concerts, and corporate offsites — F1, Masters, Super Bowl, and the DFW sports/events calendar."
6. **Aircraft Sourcing for Special Requests** — "Pet-friendly cabins, AOG/urgent departures, international clearance handling."

Each maps directly to a service page from `03-site-architecture-sitemap.md` — the GBP service description and the live page copy should be near-identical (consistency helps both trust and Google's entity matching between the profile and the site).

## 3. Business description (750-character GBP limit)

> EXJET is a Dallas–Fort Worth-based private jet charter broker providing on-demand access to a curated fleet of ARGUS Platinum and Wyvern Wingman-audited aircraft across 5,000+ airports worldwide. Serving Dallas, Fort Worth, Addison, Plano, and the broader DFW metro, EXJET arranges light, midsize, super-midsize, heavy, and ultra-long-range charter for executives, corporate travel programs, and luxury travelers — with confirmed quotes in under four hours and no membership or initiation fees. We also offer empty leg flights across Texas at up to 75% off standard rates, and dedicated corporate account management for companies with recurring travel needs. 24/7 concierge support, pet-friendly cabins, and full-service ground transfer coordination.

(Written to naturally include: Dallas–Fort Worth, private jet charter, Addison, empty leg flights, Texas, corporate — without keyword-stuffing; GBP descriptions do carry minor relevance weight and are user-facing, so it has to read like real copy, not a keyword list.)

## 4. Google Posts strategy

GBP Posts (the "Updates" feed on the profile) should run **weekly at minimum**, tied to the content/event calendar rather than generic filler:

| Cadence | Post type | Example |
|---|---|---|
| Weekly | Empty leg deal-of-the-week | "This week's empty leg: Dallas (ADS) → Aspen (ASE), Wed 8/12, Citation Latitude, save 68%." Links to `/empty-leg-flights`. |
| Bi-weekly | Event-tied charter availability | Pull directly from `sports-events.json` (already structured with league/venue/date/airports — this data is ready-made for Posts): "Cowboys @ AT&T Stadium — book your game-day charter now." |
| Monthly | New blog article promotion | Push each new `/journal` article as a Post the day it publishes — direct traffic + a fresh-content signal to the profile. |
| As-needed | Offer posts | Seasonal (State Fair of Texas, Byron Nelson golf tournament, Dallas Market Center fashion weeks, Formula 1 Austin GP charter from DFW) |
| As-needed | Trust/milestone posts | New ARGUS-rated operator added to network, safety milestone, new aircraft category added |

Every Post must have a photo (real aircraft/cabin imagery — reuse the same photography referenced in `jets.json`'s `images` arrays, don't use stock) and a CTA button ("Book," "Learn more," or "Call now").

## 5. Review strategy

Zero reviews exist today (confirmed: no review platform integration in the codebase, and the hardcoded reviews on `jets/[id]/page.tsx` are placeholder/UI-demo content, not real customer feedback — see the audit doc's schema section for why this must not be marked up as `Review` schema as-is).

**Build the review engine:**

1. **Post-flight automated request.** Trigger an SMS + email review request 24–48 hours after a completed charter (hook into the existing booking/confirmation flow — `booking/confirmation/page.tsx` is the natural integration point) with a direct GBP review link (`https://g.page/r/[your-place-id]/review`) and a secondary Trustpilot link.
2. **Two-platform focus for the first 90 days:** Google Business Profile (for local-pack ranking) and Trustpilot (for the trust badge/schema you can then legitimately display sitewide, and because Trustpilot review schema is safe to mark up — unlike fabricating aircraft-page reviews). Don't spread thin across Yelp/BBB/TripAdvisor yet; add those in month 4+ once the core two have volume.
3. **Response protocol.** Respond to every review (positive and negative) within 24 hours — response velocity and rate are a measurable local-ranking factor, and for an HNW clientele, a visibly attentive owner response is itself a trust signal to the next reader.
4. **Never incentivize or gate reviews** (no "leave a review for a discount," no filtering who gets asked based on expected sentiment) — both violate Google's review policies and risk profile suspension, which would be catastrophic for a brand this early in its local SEO lifecycle.
5. **Target:** 25+ Google reviews by end of Month 3, sustained 4.8+ average — realistic given charter clientele's low volume/high satisfaction profile (unlike a restaurant, you won't get hundreds of reviews, but even 25-40 genuine 5-star reviews from named executives is a powerful local-pack and trust signal at this ticket size).

## 6. Citations (NAP consistency)

Once the real address/phone from §0 exists, build citations in this order — **exact NAP consistency across every listing is the actual ranking factor**, more than citation volume:

**Tier 1 — foundational (do first, week 2-3):**
- Google Business Profile (primary)
- Bing Places for Business
- Apple Maps / Apple Business Connect
- Facebook Business Page
- LinkedIn Company Page (critical for this B2B/corporate-travel audience specifically)

**Tier 2 — aviation & travel industry-specific (highest relevance for this niche):**
- ARGUS International operator/broker directory (if EXJET's network operators are ARGUS-rated, confirm EXJET itself has appropriate industry association/directory presence)
- Wyvern registry/directory presence
- NBAA (National Business Aviation Association) member directory, if applicable
- Private jet comparison/aggregator sites where a listing is earnable (these function as high-relevance niche citations even beyond referral traffic)

**Tier 3 — general local/business directories:**
- Better Business Bureau (Dallas/Fort Worth chapter)
- Dallas Regional Chamber / Fort Worth Chamber of Commerce
- Yelp
- Yellow Pages / YP.com
- Chamber of Commerce and local business journal directories (Dallas Business Journal, D CEO listings) — these carry real local relevance for a HNW/corporate audience and often allow a profile + backlink

**Ongoing:** audit NAP consistency quarterly with a tool like Moz Local or manually via search — a mismatched suite number or an old phone number sitting on even one directory measurably drags local-pack trust.

## 7. Local link building (supports GBP + organic together)

- Sponsor or get listed as a transportation partner for DFW-area events already represented in `sports-events.json` (charity galas, PGA Byron Nelson, high-profile Dallas events) — earns a genuine local backlink + real-world brand presence, not a purchased link.
- Guest content / expert quotes in Dallas Business Journal, D Magazine, D CEO — corporate-travel and luxury-lifestyle angles both fit EXJET's audience and these publications' editorial needs.
- Local chamber of commerce membership (already listed as a citation above) typically includes a backlink from the chamber's member directory — real relevance, not spam.
