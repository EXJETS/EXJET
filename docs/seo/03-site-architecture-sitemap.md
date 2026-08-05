# EXJET Ideal Site Architecture & Sitemap

Design principle: keep the existing booking engine (`/search`, `/jets/[id]`, `/booking/*`, `/tracking`, `/dashboard`, `/operator`, `/admin`) exactly as-is — it works and shouldn't be disrupted. **Add** a marketing/content layer around it using the same Next.js App Router conventions already established (`generateMetadata`, JSON-LD via inline `<script>`, `src/data/*.json` as the content source pattern). New top-level route groups:

```
src/app/
├── (marketing)/                          ← new route group, no URL segment added
│   ├── private-jet-charter/
│   │   ├── page.tsx                      /private-jet-charter (service hub)
│   │   ├── dallas-tx/page.tsx            /private-jet-charter/dallas-tx           ★ flagship
│   │   ├── fort-worth-tx/page.tsx        /private-jet-charter/fort-worth-tx
│   │   ├── addison-airport-ads/page.tsx  /private-jet-charter/addison-airport-ads
│   │   ├── dallas-love-field-dal/page.tsx
│   │   ├── mckinney-national-tki/page.tsx
│   │   ├── dfw-airport/page.tsx
│   │   ├── light-jets/page.tsx           category pages (mirrors JetCategory enum)
│   │   ├── midsize-jets/page.tsx
│   │   ├── super-midsize-jets/page.tsx
│   │   ├── heavy-jets/page.tsx
│   │   └── ultra-long-range-jets/page.tsx
│   ├── corporate-jet-charter/
│   │   ├── page.tsx                      /corporate-jet-charter (national hub)
│   │   └── dallas/page.tsx               /corporate-jet-charter/dallas            ★ high ACV
│   ├── empty-leg-flights/page.tsx        /empty-leg-flights (Texas-first, national inventory)
│   ├── private-jet-broker/page.tsx       /private-jet-broker (positioning/trust page)
│   ├── routes/
│   │   ├── page.tsx                      /routes (index of all city-pairs)
│   │   ├── dallas-to-aspen/page.tsx
│   │   ├── dallas-to-new-york/page.tsx
│   │   ├── dallas-to-los-angeles/page.tsx
│   │   ├── dallas-to-cabo-san-lucas/page.tsx
│   │   ├── dallas-to-vail/page.tsx
│   │   ├── dallas-to-miami/page.tsx
│   │   ├── dallas-to-las-vegas/page.tsx
│   │   └── dallas-to-jackson-hole/page.tsx
│   ├── about/page.tsx                    /about            (fixes dead footer link)
│   ├── contact/page.tsx                  /contact          (fixes dead footer link, NAP lives here)
│   ├── faq/page.tsx                      /faq              (fixes dead footer link; full FAQPage schema)
│   ├── safety/page.tsx                   /safety           (fixes dead footer link; ARGUS/Wyvern explainer)
│   ├── terms/page.tsx                    /terms            (fixes dead footer link; legal requirement)
│   └── privacy/page.tsx                  /privacy          (fixes dead footer link; legal requirement)
├── journal/
│   ├── page.tsx                          /journal (blog index — reuses "journal" naming already used in footer.tsx:219 "The journal")
│   ├── [slug]/page.tsx                   /journal/[slug] (article template, MDX or JSON-driven like existing news.json pattern)
│   └── category/[category]/page.tsx      /journal/category/[category] (Dallas, Corporate Travel, Aircraft Guides, Events, Empty Legs)
├── page.tsx                              (existing — homepage, unchanged structurally)
├── search/page.tsx                       (existing — refactor to server component per audit doc §3)
├── jets/[id]/page.tsx                    (existing — add generateMetadata per audit doc §1)
└── ...(booking, dashboard, operator, admin, auth — unchanged, already correctly non-indexed)
```

Why a `(marketing)` route group and not scattering pages at the root: it keeps the transactional app (`search`, `booking`, `dashboard`) and the content/marketing site (`private-jet-charter/*`, `journal/*`) organizationally separate in the codebase without changing any URLs, and lets you apply shared marketing-page layout (e.g., a consistent hero/CTA/FAQ template component) via a route-group `layout.tsx` without touching the app shell.

---

## 1. Homepage structure (revised)

Keep the existing editorial homepage (`page.tsx`) largely as-is — it's well-designed — but add:

1. A **"Serving Dallas–Fort Worth" strip** directly under the hero KPI band (new section between the existing hero and "The Collection"), with a single sentence + link to `/private-jet-charter/dallas-tx`. This is the fastest way to inject local relevance into the page Google already trusts most (the homepage carries the most authority by default).
2. A **"Popular Corridors" section** that links to the new `/routes/*` pages (currently `PopularRouteCard` links straight to `/search?from=X&to=Y` — keep that as the primary CTA on each card, but add a small secondary text link "Route guide →" to the corresponding `/routes/dallas-to-aspen` page for the routes that have one).
3. A **"Explore by City" module** (new, near the footer) linking to each location page as they ship — this is the internal-linking backbone that gets location pages crawled and passes homepage authority to them.
4. Homepage `Organization` JSON-LD (`page.tsx:22-34`) gets `address`, `geo`, and `telephone` added once those exist (see §4/local SEO doc) — turning it into a de facto `LocalBusiness`-enriched `Organization`.

## 2. Service pages

Each service page follows one template (build it once as a shared component, e.g. `src/components/marketing/service-page-template.tsx`):

- H1 with primary keyword
- Trust bar (ARGUS Platinum, Wyvern Wingman, <4hr confirm, no membership — already established brand hallmarks per `page.tsx:140-156`)
- "How it works" 3–4 step block
- Aircraft category cards relevant to the service (pull from `jets.json`, filtered)
- Pricing transparency block (hourly rate ranges — data already exists in `faq.json`'s pricing answer, promote it to a visible module, not just an accordion answer)
- Service-specific FAQ (3–5 Qs, own `FAQPage` schema subset — not a copy of the homepage's)
- Route/location cross-links
- Primary CTA (quote form) + phone CTA, both above the fold and repeated after each major section (see `06-conversion-optimization.md`)

Pages: `/private-jet-charter` (hub), `/corporate-jet-charter`, `/empty-leg-flights`, `/private-jet-broker`, plus the 5 category pages (`light-jets`, `midsize-jets`, `super-midsize-jets`, `heavy-jets`, `ultra-long-range-jets` — these map 1:1 to the existing `JetCategory` type).

## 3. Location pages

Two-level hierarchy:

**Level 1 — City hub** (`/private-jet-charter/dallas-tx`, and its Fort Worth counterpart): city-level H1, all DFW-area airports summarized with links to their Level 2 pages, corporate/HNW context specific to Dallas (Highland Park/Preston Hollow HNW residential density, Dallas Market Center, AT&T/ExxonMobil/Toyota NA/American Airlines HQ presence — the actual corporate-travel demand drivers), `LocalBusiness` schema, embedded map, and the fullest FAQ set of any page type (price, timing, nearest airport, aircraft recommendation).

**Level 2 — Airport-specific pages** (`addison-airport-ads`, `dallas-love-field-dal`, `mckinney-national-tki`, `dfw-airport`, and Fort Worth's `meacham-ftw`/`alliance-afw` if warranted by demand once Tier 1 keywords are validated): airport code, FBOs served, ground-transfer notes, "why this airport" content (e.g., Addison as the actual GA charter hub vs. DFW being commercial-first), links back up to the city hub and sideways to relevant route pages.

Location pages are the only page type that should carry full `LocalBusiness`/`GeoCoordinates` schema — service pages stay `Service` schema, not `LocalBusiness`.

## 4. Blog/content pages (`/journal`)

- `/journal` index: filterable by category (Dallas & DFW, Corporate Travel, Aircraft Guides, Empty Legs, Events & Seasonal, Industry & Safety) — categories match the 50-article plan's groupings in `05-content-plan-50-articles.md`.
- `/journal/[slug]`: article template with `BlogPosting` schema, author/date, estimated reading time (pattern already exists for `news.json`'s `readingTime` field — reuse it), a mandatory "Related reading" block (2-3 internal links) and a mandatory "Get a quote" inline CTA module after the second H2 — every article's outline in the content plan specifies its required internal links, this template is what renders them consistently.
- `/journal/category/[category]`: category archive, useful for internal linking depth and for building `journal/category/dallas-fort-worth` into a secondary local-relevance signal.
- Existing `news.json`-powered "News & dispatches" homepage section (`page.tsx:211-232`) should point its "Read" CTAs at real `/journal/[slug]` articles once they exist, rather than being a dead-end visual carousel — currently these `NewsCard` components render title/excerpt with no `href` at all (`page.tsx:606-639`), so today they're not even links.

---

## 5. robots.ts / sitemap.ts changes required

```ts
// robots.ts — add /auth/ and /booking/
disallow: ["/admin/", "/operator/", "/dashboard/", "/auth/", "/booking/"]
```

```ts
// sitemap.ts — remove auth routes, add new sections
const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE}/`, priority: 1, changeFrequency: "weekly" },
  { url: `${BASE}/search`, priority: 0.9, changeFrequency: "daily" },
  { url: `${BASE}/private-jet-charter/dallas-tx`, priority: 0.95, changeFrequency: "weekly" },
  { url: `${BASE}/private-jet-charter/fort-worth-tx`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${BASE}/corporate-jet-charter/dallas`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${BASE}/empty-leg-flights`, priority: 0.9, changeFrequency: "daily" }, // inventory changes daily
  // ...remaining service, location, route pages at 0.8–0.9
  { url: `${BASE}/journal`, priority: 0.7, changeFrequency: "daily" },
  // ...journal posts mapped from a new src/data/journal.json or CMS export, priority 0.6–0.7
  { url: `${BASE}/about`, priority: 0.3, changeFrequency: "monthly" },
  { url: `${BASE}/faq`, priority: 0.5, changeFrequency: "monthly" },
  { url: `${BASE}/terms`, priority: 0.1, changeFrequency: "yearly" },
  { url: `${BASE}/privacy`, priority: 0.1, changeFrequency: "yearly" },
];
```

Keep the existing `jetRoutes` mapping pattern (`sitemap.ts:17-24`) — it's the correct model to replicate for `locationRoutes`, `serviceRoutes`, and `journalRoutes` once their data sources exist.

## 6. Navigation changes required

- **Navbar** (`navbar.tsx:8-13`): add a "Charter" item that opens a mega-menu (By Service: Private Jet Charter, Corporate Jet Charter, Empty Legs, Private Jet Broker — By Location: Dallas, Fort Worth, + city list as it grows) and add "Journal." Keep the existing Fleet/Live/Trips/Account items — those serve the returning/transactional user, the new items serve the discovery/new-visitor user, both audiences need to coexist in one nav.
- **Footer** (`footer.tsx:11-48`): replace the current dead-link columns with: Column 1 "Charter" (Private Jet Charter Dallas, Corporate Jet Charter, Empty Leg Flights, Browse Fleet), Column 2 "Locations" (Dallas, Fort Worth, Addison Airport, + growing city list), Column 3 "Company" (About, Contact, FAQ, Safety — only real pages), Column 4 "Legal" (Terms, Privacy — only real pages until Cookies/Refunds pages actually exist).
