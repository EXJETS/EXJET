# EXJET Technical SEO Audit

Audit date: 2026-08-05. Scope: `exjet.com` production Next.js 15 App Router codebase (`src/app`), as committed on `main`. Findings are cited to file paths so engineering can action them directly.

## 0. Executive summary

EXJET is a well-built **booking application** (search, jets, booking flow, dashboard, operator/admin portals) with genuinely good bones on the pages that exist — clean metadata API usage, JSON-LD on the homepage, a programmatic `sitemap.ts`/`robots.ts`. But it is **not yet a marketing site**, and that is the whole ballgame for ranking:

- **Zero location pages.** Nothing targets "Dallas," "DFW," "Fort Worth," "Addison," or any city. The entire site is positioned as a global, city-agnostic booking tool ("Global Access, On-Demand"). Google has no page to rank for `private jet charter dallas`.
- **Zero content/blog infrastructure.** No `/blog`, no MDX/CMS pipeline, no article template. There is nothing to build topical authority with, and nothing for the 50-article plan (`05-content-plan-50-articles.md`) to live on.
- **Footer links to 12 pages that don't exist.** `/about`, `/careers`, `/press`, `/contact`, `/help`, `/safety`, `/faq`, `/status`, `/terms`, `/privacy`, `/cookies`, `/refunds` are all linked from `src/components/layout/footer.tsx:14-47` but there is no matching route under `src/app`. Every one of these is a 404 today, on every page of the site, in the crawlable footer. This is both a crawl-budget and a trust problem (no Terms/Privacy is a real legal exposure too, separate from SEO).
- **No NAP (Name / Address / Phone) anywhere.** No phone number, no physical address, no local business schema on the entire site. You cannot do local SEO without this — it's the foundation Google Business Profile, citations, and local schema all point back to.
- **Indexable low-value routes.** `/auth/login` and `/auth/register` are in `sitemap.ts` and are not disallowed in `robots.ts`, so Google will crawl and can index bare login/register forms — pure thin-content noise competing for crawl budget against pages that should matter.

None of this is a criticism of the current build — it reads exactly like what it is, a booking-engine MVP. The fix is additive: keep the booking engine, build a marketing/content layer around it.

---

## 1. Indexing issues

| Issue | Evidence | Impact | Fix |
|---|---|---|---|
| No location pages exist to index | No `src/app/locations/` or `src/app/dallas*` route | Can't rank for any city+service query — the entire premise of the Dallas push | Ship `/private-jet-charter/dallas-tx` etc. per `03-site-architecture-sitemap.md` |
| No blog/article routes exist | No `src/app/blog` or `.mdx` handling in `next.config.ts` | No informational-intent content to rank, no internal-link hub, no topical authority signal | Add `/journal/[slug]` (see architecture doc) with MDX or a headless CMS |
| Footer links 404 | `footer.tsx:14-47` links to `/about`, `/contact`, `/faq`, `/terms`, `/privacy`, `/safety`, `/help`, `/press`, `/careers`, `/status`, `/cookies`, `/refunds` — none exist under `src/app` | Googlebot hits 12 broken internal links from every page; users hitting these in nav lose trust instantly | Build the 6 real pages that matter now (About, Contact, FAQ, Safety, Terms, Privacy) and remove Careers/Press/Status/Cookies/Refunds links until those pages exist |
| `/auth/login`, `/auth/register` are indexable | Present in `sitemap.ts:13-14`; **not** in `robots.ts` disallow list (`robots.ts:9` only blocks `/admin/`, `/operator/`, `/dashboard/`) | Thin, duplicate-pattern pages compete for crawl budget and can surface in search as a bad first impression ("Login" ranking for brand queries) | Remove both from `sitemap.ts`; add `/auth/` to the `disallow` array in `robots.ts`; add `noindex` via route-segment metadata as a second layer |
| `/search` is the de facto category/fleet page but is a client component with no `generateMetadata` | `search/page.tsx:1` starts with `"use client"`; no `export const metadata` or `generateMetadata` anywhere in the file | Every filtered/faceted search URL (`/search?category=light`, `/search?event=...`) inherits the **homepage's** title/description from the root layout — Google sees dozens of near-duplicate `<title>`s | Split into a server component shell that exports per-category metadata (`generateMetadata` keyed off `category`/`event` search params) wrapping a client island for the interactive filtering |
| Jet detail pages have no per-jet metadata | `jets/[id]/page.tsx` has no `generateMetadata` export; falls back to the global title template ("`{default}` · EXJET.com") | 40+ aircraft pages (`src/data/jets.json`) all share the generic homepage description in search snippets — a wasted long-tail opportunity for "citation cj4 charter price" type queries | Add `generateMetadata({ params })` per jet: title `"{Manufacturer} {Name} Charter — Rates & Availability | EXJET"`, description pulling `description`, `hourlyRate`, `passengers` |
| No `generateStaticParams` observed for `jets/[id]` | `jets/[id]/page.tsx` is an `async` server component reading `jetsData` directly, no static params export visible in the reviewed range | Confirm whether these render as SSG or on-demand SSR; for a ~40-aircraft catalog, prerendering is cheap and better for TTFB/Core Web Vitals | Add `generateStaticParams()` returning all jet IDs |
| Canonical only set on homepage | `layout.tsx:58`: `alternates: { canonical: "/" }` is set in the **root** metadata object, meaning it's inherited by every page unless overridden | Every page without its own `alternates.canonical` currently canonicalizes to `https://exjet.com/` — if that inheritance isn't overridden per-route, Google may be told every jet/search page is a duplicate of the homepage | Set an explicit `alternates.canonical` in every route's own metadata/generateMetadata, not just the root |

---

## 2. Site structure

Current routes (from `src/app`):

```
/                     (marketing home, single page, no location targeting)
/search               (client-rendered fleet/category browser)
/jets/[id]            (per-aircraft detail — good bones, missing metadata)
/tracking             (live flight tracking)
/booking, /booking/passengers, /booking/review, /booking/confirmation
/auth/login, /auth/register
/dashboard/*          (customer portal — correctly excluded from robots)
/operator/*           (operator portal — correctly excluded from robots)
/admin/*              (internal — correctly excluded from robots)
```

There is no `/private-jet-charter/*`, no `/empty-legs`, no `/locations/*`, no `/blog` or `/journal`, no `/about`, `/contact`, `/faq` as real routes (only as broken footer links).

**Structural problems:**

1. **Flat, app-only architecture.** Everything under `src/app` is transactional (search, book, track, account). A ranking site needs three tiers: transactional (what you have), commercial/service (what's missing — `/private-jet-charter/dallas-tx`, `/empty-leg-flights`), and informational (what's missing — the blog).
2. **No breadcrumb hierarchy.** Because there's no nesting beyond `/jets/[id]`, there's nothing to build `BreadcrumbList` schema from, and no way to funnel topical link equity (e.g., Dallas page → Addison Airport page → specific route page).
3. **Empty legs have no dedicated URL.** `empty-leg-card.tsx` renders empty-leg inventory only as a homepage carousel section (`page.tsx:186-209`) and a `/search?category=empty-legs` filter — there is no standalone, indexable `/empty-legs` page, despite "empty leg flights Texas" being an explicit target keyword. A filtered search URL is a poor target for a head term with real volume.
4. **Popular routes are homepage-only.** `popular-routes.json` powers a homepage carousel (`page.tsx:161-184`) linking to `/search?from=X&to=Y`, but there's no static, indexable page per high-value route (e.g., `/routes/dallas-to-aspen`) that could rank and carry route-specific content (flight time, aircraft recommendation, prices).

---

## 3. Page speed issues

Can't run Lighthouse against production from this environment (outbound access to `exjet.com` is blocked at the network policy level in this session), so this is a code-level review, not a lab measurement. Flag these for a real CrUX/PageSpeed Insights run in week 1 of execution (see `07-90-day-execution-plan.md`):

- **Fonts:** `layout.tsx` loads `GeistSans`, `GeistMono`, and a Google Font (`Cormorant_Garamond`) with 5 weights × 2 styles (`layout.tsx:9-15`). That's a lot of font-weight variants for a marketing site; each unused weight is wasted bytes on first paint. Audit which weights are actually used in `globals.css`/components and trim to what's rendered. `display: "swap"` is correctly set, which is good.
- **Client-heavy search page:** `search/page.tsx` is `"use client"` end-to-end and does client-side filtering/sorting over the full `jetsData`/`airportsData` arrays (`search/page.tsx:79+`). For a page meant to be a primary landing target for commercial-intent traffic, shipping the filtering logic to the client means slower LCP and no server-rendered content for that first paint. Move initial render to the server (server component reads the query params, renders a filtered list on the first response) and only hydrate the interactive filter controls client-side.
- **Carousels:** Homepage stacks four `CardCarousel` instances (routes, empty legs, news, plus sports-events list) — verify `CardCarousel` lazy-loads offscreen images and doesn't mount all slide images eagerly (check `src/components/ui/card-carousel.tsx` for `loading="lazy"` / `next/image` usage). Aircraft photography (`jets.json` → `/jets/*.jpg`) should be served via `next/image` with explicit `sizes` so the browser doesn't download desktop-resolution images on mobile.
- **JSON-LD payload:** Homepage inlines three `<script type="application/ld+json">` blocks (`page.tsx:60-71`) built from `faq.json` client-side-shaped data — harmless for speed at current size, but if `faq.json` grows, keep the JSON-LD data separate from any client-fetched data to avoid render-blocking work.

---

## 4. Schema markup recommendations

**What exists today** (`page.tsx:22-56`, homepage only):
- `Organization` — has `name`, `url`, `logo`, `contactPoint` (but `contactPoint` has no `telephone`, just `contactType`/`areaServed`/`availableLanguage` — **a ContactPoint without a phone number is close to useless for local intent**).
- `WebSite` with `SearchAction` (sitelinks search box eligibility) — good, keep.
- `FAQPage` sourced from `faq.json` — good pattern, but only lives on the homepage; should also appear on the dedicated FAQ page once built, and per-topic FAQs should appear on relevant service/location pages (don't duplicate the *exact same* FAQPage block site-wide — use a distinct, page-relevant question subset per page, or Google may collapse/ignore rich results for duplicated FAQ markup).

**What's missing:**

1. **`LocalBusiness` / `TravelAgency` schema** with real `address` (`PostalAddress`), `geo` (`GeoCoordinates`), `telephone`, `areaServed` (Dallas–Fort Worth, then expanding), `priceRange`. This is the single highest-priority schema gap for the local SEO goal — without it, there is no structured signal tying EXJET to Dallas/Addison at all. Add to the new Dallas location page and to `Organization` on the homepage once a real office/phone exists.
2. **`Service` schema** per service page (Private Jet Charter, Empty Leg Flights, Jet Card / On-Demand Broker, Corporate Aviation Solutions), each with `areaServed` and `provider` pointing back to the `Organization`/`LocalBusiness`.
3. **`BreadcrumbList`** on every non-homepage route once the location/service hierarchy exists — currently impossible because that hierarchy doesn't exist.
4. **`AggregateRating`/`Review` schema** on jet detail pages — `jets/[id]/page.tsx:12-29` hardcodes the **same four reviews** (Alexander M., Sophia L., James R., Victoria K.) on every single aircraft page. This is a real risk, not just a missed opportunity: identical review content and ratings across 40+ pages reads as templated/fake to both users and to Google's spam systems, and marking up fabricated-looking reviews with `Review`/`AggregateRating` JSON-LD would be a **schema markup policy violation** if the reviews aren't genuinely tied to that aircraft. Fix the data model before adding review schema — either collect real per-jet reviews or use `rating`/`reviewCount` already present in `jets.json` (aggregate figures) without fabricated review *bodies*.
5. **`Article`/`BlogPosting`** schema on every future blog post (author, datePublished, dateModified, image) — needed once `/journal` ships.
6. **`Product`/`Vehicle`-style schema or `Offer`** on jet detail pages tying `hourlyRate`/`basePrice` (present in `jets.json`) to an `Offer` — useful for rich results and for AI-search citation (ChatGPT/Perplexity/Gemini increasingly parse structured price data when citing charter options).
7. **`Event` schema** for the sports-calendar feature (`sports-events.json` already has league/venue/date/airports) — this data is *made* for `Event` schema with a `location` and tie-in to charter availability; currently rendered as plain HTML list items only (`page.tsx:268-329`).

---

## 5. Meta titles and descriptions

Current state is competent but generic-global, not intent-matched:

- Homepage title: `"EXJET.com — Global Access, On-Demand."` (`layout.tsx:20`) — brand-forward, zero keyword signal. For a brand this early in its ranking lifecycle, a keyword-inclusive title beats a pure-brand title. Recommended: `"Private Jet Charter | On-Demand Access to 5,000+ Airports | EXJET"` for the homepage, reserving the editorial brand line for the H1/OG description instead.
- Description (`layout.tsx:23-24`) is well-written but, again, has no city/region anchor — for the Dallas push specifically, the homepage should still mention Dallas/DFW if that's the flagship market, e.g., append "Based in Dallas–Fort Worth, serving clients nationwide."
- `keywords` array in `layout.tsx:26-42` is 2026-irrelevant for rankings (the meta keywords tag has been ignored by Google since ~2009) but harmless; not worth maintaining effort on, don't expand it further.
- No per-page titles/descriptions exist anywhere except the homepage (see Indexing section above — `search`, `jets/[id]` inherit the global template).
- `title.template: "%s · EXJET.com"` (`layout.tsx:21`) is correctly configured so any page that *does* export a `title` will format consistently — the infrastructure is there, it's just unused outside the homepage.

**Action:** for every new page in the architecture doc, write unique title (≤60 characters incl. brand suffix) and description (150–160 characters) that includes the primary keyword + a differentiator (ARGUS Platinum, <4hr confirm, no membership) + a soft CTA.

---

## 6. Internal linking strategy

Today's internal link graph is essentially a star: homepage → {search, jets/[id], tracking}, plus a footer with 12 dead links. There is no hub-and-spoke content structure because there's no content to link.

**Target structure** (detailed in `03-site-architecture-sitemap.md`):

1. **Homepage → Location hub → City pages → Airport/route pages.** Dallas becomes the flagship city page; it links out to Addison (ADS), Love Field (DAL), DFW, Fort Worth Meacham (FTW), Fort Worth Alliance (AFW), and McKinney (TKI) sub-pages, and to 8–10 popular route pages (Dallas–Aspen, Dallas–NYC, Dallas–LA, Dallas–Cabo, etc.).
2. **Service pages ↔ Location pages, bidirectionally.** "Empty Leg Flights" service page links to "Empty Leg Flights Texas" location-service combo page and vice versa; "Corporate Jet Charter" links to "Dallas Corporate Jet Charter."
3. **Blog → Service/Location pages.** Every article's outline (see `05-content-plan-50-articles.md`) specifies which commercial pages it must link to — this is how topical/informational content passes equity into the money pages instead of sitting orphaned.
4. **Jet detail pages → Category + relevant City pages.** Each aircraft page should link to its category (e.g., "Light Jets") and to "this aircraft is popular for Dallas–Aspen" style route callouts, not just back to `/search`.
5. **Fix the footer now.** Replace the 12 dead links with a real, smaller set (About, Contact, FAQ, Safety, Terms, Privacy) and add a "Popular Searches" footer block linking to the priority city/service pages once they exist — footers are one of the highest-crawl-frequency internal link blocks on any site.
6. **Navbar is under-built for a marketing site.** `navbar.tsx:8-13` only has Fleet/Live/Trips/Account — no Locations, no Empty Legs, no About/Company. Once service and location pages exist, add a "Charter" mega-menu (by service) and a "Locations" item (by city), not just the transactional links.

---

## 7. Sitemap/robots recommendations

**`robots.ts` — action items:**
```ts
disallow: ["/admin/", "/operator/", "/dashboard/", "/auth/", "/booking/"]
```
Add `/auth/` (currently missing — see Indexing #4) and `/booking/` (the multi-step booking flow — `/booking/passengers`, `/booking/review`, `/booking/confirmation` — is transactional/session-based and should not be indexed; only the entry point, if it becomes a real landing page, should be indexable). Keep `sitemap`/`host` fields as-is — that pattern is correct.

**`sitemap.ts` — action items:**
- Remove `/auth/login`, `/auth/register` (lines 13–14) — see above.
- Add every new location page, service page, and blog post programmatically as those directories are built — mirror the existing pattern of importing JSON data and mapping to sitemap entries (already done well for `jetsData` at lines 17–24; do the same for a future `locations.json`/`blog-posts.json`).
- Add `changeFrequency`/`priority` tiers deliberately once the new pages exist: location/service pages at `0.9`, blog posts at `0.6-0.7`, evergreen legal pages at `0.2`.
- Once the blog exists, ensure `lastModified` reflects real content update dates (currently everything uses `now` at request/build time — fine for the current static set, but should switch to per-item `updatedAt` fields once content has real revision history, so Google can trust the freshness signal instead of seeing every URL "modified" on every deploy).

**Google Search Console / Bing Webmaster Tools (process, not code):**
- Verify property, submit `sitemap.xml`, and set up the Dallas/DFW city page + homepage for manual "Request Indexing" the day each ships (don't wait for organic crawl discovery in the first 90 days).
- Monitor the Coverage/Pages report weekly for the 12 currently-broken footer URLs — once real pages replace them, confirm they move from "Not Found (404)" to "Indexed."
- Set the international/geo-targeting is **not** needed (no `hreflang` required — single-market English site), but do set the GSC "target country" (if using a ccTLD/gTLD ambiguity) — `exjet.com` is a gTLD so this isn't automatic; confirm no unintended geo-restriction is set.
