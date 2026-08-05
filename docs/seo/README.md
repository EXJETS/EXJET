# EXJET SEO Growth Plan — Dallas/Fort Worth First, National Second

Prepared 2026-08-05. Goal: rank EXJET for high-intent private jet charter searches, dominate DFW local SEO, then expand nationally.

Every finding in this plan is grounded in the actual `exjet.com` Next.js codebase (`src/app`, `src/components`, `src/data`) as of this audit, not generic SEO advice. File/line references throughout point engineering and content teams to exactly what to change.

## The core finding

EXJET today is a well-built **booking application** — global, transactional, no city targeting, no blog, and a footer that links to 12 pages (`/about`, `/contact`, `/faq`, `/terms`, etc.) which don't exist yet. It cannot rank for `private jet charter dallas` because there is no page about Dallas, and it cannot do local SEO because there is no address, phone number, or `LocalBusiness` schema anywhere on the site. Everything in this plan is built around fixing that gap without disrupting the booking engine, which works and should stay untouched.

## Read in this order

1. **[01-technical-seo-audit.md](./01-technical-seo-audit.md)** — indexing issues, site structure, page speed, schema, meta tags, internal linking, sitemap/robots — all cited to specific files/lines.
2. **[02-keyword-strategy.md](./02-keyword-strategy.md)** — prioritized keyword tiers (branded → Dallas/DFW commercial → national category terms → informational → Phase 2 expansion cities) with intent, competition, and value estimates.
3. **[03-site-architecture-sitemap.md](./03-site-architecture-sitemap.md)** — the ideal IA: new location pages, service pages, route pages, and a `/journal` blog, laid out as an actual `src/app` route tree that extends the current codebase.
4. **[04-local-seo-gbp-strategy.md](./04-local-seo-gbp-strategy.md)** — Google Business Profile categories/services/description/posts, review strategy, and a tiered citation-building plan for DFW.
5. **[05-content-plan-50-articles.md](./05-content-plan-50-articles.md)** — 50 articles across 7 categories (Dallas/DFW, Corporate Travel, Empty Legs, Aircraft Guides, Cost/Broker Education, Events/Seasonal, Safety/Trust), each with title, target keyword, search intent, outline, and required internal links.
6. **[06-conversion-optimization.md](./06-conversion-optimization.md)** — copy, CTA placement, trust signals, and luxury-branding fixes to turn traffic into quote requests and calls, including the single biggest gap: there is no phone number anywhere on the site today.
7. **[07-90-day-execution-plan.md](./07-90-day-execution-plan.md)** — week-by-week breakdown tying all of the above together, with owners, dependencies, and weekly success metrics.

## Top 5 things to do first (if you only read this page)

1. **Get a real Dallas-area address and local phone number.** Nothing else in the local SEO plan works without this — an Addison Airport (ADS) office/desk is the most credible, on-brand option (see `04-local-seo-gbp-strategy.md` §0).
2. **Fix the 12 dead footer links** (`src/components/layout/footer.tsx:14-47`) — they 404 on every page today, including `/terms` and `/privacy`, which is a legal exposure as much as an SEO one.
3. **Ship `/private-jet-charter/dallas-tx`** — the single highest-value page in this entire plan, and currently the site has nothing like it.
4. **Add a phone number to the navbar and every CTA.** Confirmed absent site-wide; for a $10K–$250K+ purchase decision, this is costing quote requests today, independent of any SEO work.
5. **Claim and configure Google Business Profile** as a Service-Area Business once the address/phone above exist (`04-local-seo-gbp-strategy.md` §1–3).

Full sequencing, dependencies, and weekly detail: `07-90-day-execution-plan.md`.
