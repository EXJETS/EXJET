# EXJET experience implementation — 22 October 2026

This change adapts observed interaction patterns from flyxo.com and app.bookemptylegs.com to EXJET's own content and approved assets. It is not a complete replica of either platform. Neither source's private backend, commercial inventory, pricing, customer records, licensed photographs, or brand assets have been copied.

## Implemented in this change

| Experience | EXJET implementation | Scope |
| --- | --- | --- |
| Homepage journey search | Existing FlightSearchPanel mounted below hero | Existing Avinode loader and endpoints unchanged |
| Fleet discovery | /aircraft/ | Search eight existing profiles; filter cabin class; compare up to three |
| SEO directories | Existing route, airport, article and other collection pages | Search and sort existing content; links remain server rendered |
| Booking process | /how-it-works/ | Original EXJET copy explaining request through confirmation |
| Ways to fly | /ways-to-fly/ | On-demand, groups, empty legs, corporate and family-office use |
| Operator relationships | /operator-partners/ | Original introduction content; no automatic approval or fleet claim |
| Service partnerships | /partnership/ | Original EXJET collaboration information |
| Navigation | Shared header and footer | Client-support shortcut; four new page links |
| Empty-leg browsing | Existing /empty-legs/ results | Responsive route cards; cabin filter; date/seat sort; visit-only shortlist; original inquiry handler |

## Existing EXJET coverage retained

Service pages, manufacturer aircraft profiles, sales listings, membership information, pricing, safety, FAQ, guides, corporate travel, executive assistants, family offices, airports, destinations, routes, contact forms, legal disclosures and search remain in place. All 62 paths in the existing URL preservation test remain available. No source-site prices, bookable inventory or membership promises are represented as EXJET offers.

## Remaining functionality and dependencies

| Source feature | EXJET status | Required before release |
| --- | --- | --- |
| Secure sign-in, profile and password changes | Not implemented | Managed identity provider, database, verified redirect and email configuration |
| Upcoming/past trips | Not implemented | Client ownership rules, actual confirmed trip source, staff update workflow |
| Saved frequent locations and cross-device watchlist | Not implemented | Authenticated persistence and retention controls |
| EA/family-office delegated access | Not implemented | Explicit organization membership, roles, trip-sharing authorization and audit events |
| Team chat and notifications | Not implemented | Real staffed inbox, authenticated messages, delivery provider, consent and notification preferences |
| Payment methods, Apple Pay and checkout | Not implemented | EXJET merchant setup, hosted payment collection, server-priced quotes, verified webhooks and refund/cancellation workflow |
| Membership purchases, referrals and promo codes | Not implemented | Approved EXJET commercial terms, entitlements and billing rules |
| Automated empty-leg alerts | Not implemented | Persistent subscriptions, scheduling, verified inventory access, email delivery, unsubscribe and consent |
| Radius, multi-airport, price and duration filters | Not implemented | Supported provider data and search contract; no Avinode API changes in this change |
| Mobile apps and shared-seat marketplace | Not implemented | EXJET product/inventory agreements and separate app work |

## Reference inspection limits

XO's public homepage, fleet carousel, routes directory, how-it-works and membership page were inspected. The signed-in navigation, trips tabs, frequent locations, payment-method entry point and chat entry point were observed without submitting account changes, messages or purchases. A flight-summary/payment layout was inspected without accepting terms or booking. Not every XO URL or every signed-in state has been verified.

BookEmptyLegs' public explore screen exposed its search controls, city-radius options, two-month date picker, passenger selector, result sorting, cabin filters and route cards. Alerts and watchlist navigation were visible, with registration/subscription access messaging. Full authenticated behavior was not verified. The EXJET frontend implements only the subset documented above.

## Validation

- Next production build and TypeScript validation passed after the public and empty-leg component additions.
- ESLint passed.
- Existing 17 tests passed: Avinode loader restrictions, selection validation, environment indexing rules and site search.
- Preview SEO verification: 143 HTML pages checked, all 62 baseline URLs preserved, 131 sitemap URLs, preview noindex and production canonical host correct.
- Existing 25 manufacturer photographs matched recorded hashes.
- Browser: fleet search, three-aircraft comparison limit, clear comparison, cabin filter, directory empty result/reset, homepage Avinode rendering, 390px responsive fleet cards.
- Empty-leg cards tested with explicitly labeled, temporary local fixtures: save/remove, shortlist-only view, empty shortlist, cabin filter and correct selected-flight callback. Fixtures were removed before commit. No real inquiry or booking was sent. Real provider inventory and request delivery were not end-to-end tested.
- Integration directory, API routes, AvinodeWidget files and public assets remain byte-for-byte unchanged. Only EmptyLegBoard's results presentation delegates to the new component; search and inquiry request handlers are unchanged.

## Deployment and infrastructure

Base production branch: fix/production-seo-2026-10-19 at 4ab3e4ef0ae4d7c1964f261cfdf40a0f88d3f179.

The Vercel connector returned a team-scope 403 for the existing project. GitHub access is available. The connected Supabase account has one organization and no projects; no database was created or billed. Production publication and the account platform are not implied by a successful local build.
