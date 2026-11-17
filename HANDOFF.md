# EXJET — current source and page review

Updated 12 September 2026. This source supersedes the earlier 27-page handoffs and screenshots.

## Current result

62 pages: the original 27 plus 35 new pages. The homepage retains the owner's Global 8000 coastal hero and now uses the exact tagline “Global Access. On-Demand.” Shared navigation and footer expose the expanded website. The editorial system covers eleven original articles—including family travel and aircraft ownership—four airports, four routes, five discovery hubs, website search, seven service/information pages, and three additional policy pages. Existing privacy and terms pages are replaced with new drafts.

Use `data/reviewRoutes.json` as the complete page list. Earlier 62-page image reviews predate the latest aircraft photography update. They must not be presented as updated screenshots. The cloud browser could not connect to the local preview for recapture. See PHOTO-UPDATE.md and PHOTO-ROUTE-QA.json for the current photo additions and verification.

## Branding and photography

Preserve the supplied navbar PNG, Ubuntu 300/400/500, 44px navigation and touch targets, white/silver/platinum/charcoal, and no tan UI. Apple.com and Tesla.com were both inspected in Cloud Browser on 12 September 2026. The navbar was expressly left alone (component and stylesheet hashes unchanged). Body changes include paired filled/outlined homepage actions, lightweight chevrons and unboxed related links. Their site artwork was not imported; licensed Phosphor icons provide the matching interface style. Apple.com is the primary visual reference; its public Human Interface Guidelines inform hierarchy, readability, accessibility, and motion, but are not an exact Apple.com web specification.

Preserve the owner's Global 8000 coastal hero and original 747 cargo-loading photograph byte for byte. Seventeen other images are traced to official Cessna and Dassault product galleries. This update adds 13 distinct editorial photographs: flight views, cabins, a flight deck and material details. The photo guard now verifies all 25 file hashes and rejects shared primary article/service images. Do not generate jets or substitute a different model. The guard does not establish commercial reuse permission.

All eight catalog models now have at least one photograph. The five previously empty pages were updated with six files: Citation X exterior; Challenger 350 exterior; G650 exterior and interior; Falcon 2000LX interior; Challenger 300 exterior. Challenger 300 is a disclosed archival fallback, explicitly credited to Bombardier Aerospace by Business Jet Traveler, not a direct manufacturer-domain download. Missing views and source limitations are listed in PHOTO-UPDATE.md. Sales detail pages remain without verified matching listing imagery. No dealer/pre-owned photos, model substitutions or generated aircraft were added.

## Search, accounts and legal

Flight search retains the compact gray heading, without Hide search, Open full search, the vendor-promotional footer, or an EXJET broker disclaimer inside the search panel. Current compiled Charter, Contact and Group pages contain no visible Avinode wording. Bootstrap iframe accessibility titles are relabeled EXJET/search/airport/date. No visible provider branding was found in its returned HTML, but the hosted UI has not been visually reverified. Do not claim a logo was removed inside a cross-origin iframe. The general broker disclosure remains in the site footer and legal pages. Avinode retains responsibility for the hosted search UI; website copy does not claim successful quote submission, booking, or synchronization.

The account page is a clearly identified preview with contact links and no password collection. No authentication has been implemented. The separate website search filters the website's content; it is not flight availability.

Privacy, website terms, charter terms, cancellations/refunds, and cookies are drafts and noindex. Membership, sales, management and interiors commercial details require confirmation; affected pages are noindex. Consult LEGAL-REVIEW.md for business facts and integration questions. A website disclaimer does not replace trip-specific operator, broker-role, insurance, contract or refund disclosures. Passenger broker advertising is addressed under DOT 14 CFR Part 295; cargo has a different regulatory framework.

## Validation and limits

- Production build and TypeScript passed after the final source changes.
- All 62 compiled pages have one H1; internal route links, local image existence, and alt attributes passed a static check.
- All 19 recorded photo hashes and distinct article/service hero checks passed; no unapproved photo files were packaged.
- ESLint passed; two existing internal anchor links were changed to Next.js Link.
- A local headless Chromium pass captured all 62 pages at 390 × 844 on 12 September 2026. No page was blank, no Next.js error overlay appeared, all images loaded, and no horizontal overflow was detected. Full-length JPEGs are in `EXJET-All-62-Page-Images.zip`.
- The hosted aircraft-search resource returned an empty response in the local capture environment on Charter, Contact and Group Charter, so those three images show the designed EXJET fallback. The live provider UI, search submission and quote flow remain separately unverified.
- The offline review shows current compiled markup and CSS. It does not run external booking, forms, authentication, or Next.js hydration.
- This update was not deployed. Earlier Vercel access returned 403. Do not bypass that access restriction.

See PHOTO-PLACEMENTS.md for the new images and DESIGN-REFERENCES.md for the current Apple/Tesla observations.

## Main code

- `components/SiteHeader.tsx`, `SiteFooter.tsx`, `BrokerNotice.tsx`: shared chrome and disclosure.
- `app/page.tsx`, `app/landing.module.css`: homepage.
- `components/EditorialPage.tsx`, `app/editorial.css`: new page system.
- `data/editorial.ts`, `articles.json`, `airports-guide.json`, `routes-guide.json`, `services.json`, `legal.json`: content registry and source data.
- `app/[...content]/page.tsx`: static content routes with page metadata.
- `components/SiteSearch.tsx`, `app/search/page.tsx`: local website search.
- `data/seo.ts`, `app/sitemap.ts`, `app/robots.ts`: metadata and crawl controls. Preview origins are noindex; production indexing requires the verified production origin configuration.

Read AGENTS.md and relevant installed Next.js documentation before editing. Use npm ci only if dependencies are absent, then npm run build. Keep credentials out of source, reviews, screenshots and handoffs. Continue with the owner's feedback on the current 62 pages, exact-model photo completion, confirmation of business/legal claims, and separate booking-flow verification.
