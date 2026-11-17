# EXJET SEO release — 17 October 2026

## Release status

Implemented and verified against the actual Next.js production source. **Not pushed or deployed.** The connected Vercel account returned 403 for the owning team; GitHub push credentials are unavailable. Search Console, Bing Webmaster Tools, Cloudflare and Google Business Profile changes have not been made.

The source is based on deployed commit `6b737cb9145ddb97d5d6a8a6381a0463414ca888` in `EXJETS/EXJET`, rather than the separate Astro rebuild or an unrelated newer branch. Working branch: `fix/production-seo-2026-10-17`. All 62 source routes from that deployment are preserved. The earlier crawl's 58-page count was not used as the migration baseline.

## Implemented

- Public origin fixed at `https://www.exjet.com` for canonicals, sitemap, Open Graph, Twitter and structured-data assets. Page URLs use the site's trailing-slash convention.
- Production indexing based on `VERCEL_ENV=production`; previews remain noindex even if they inherit the public site URL. A non-Vercel production build requires explicit `NEXT_PUBLIC_SITE_URL=https://www.exjet.com`.
- Production robots allows crawling and references the public sitemap. The unsupported Host directive and global disallow are removed from production output.
- Search/account pages remain noindex. Existing legal drafts, unconfirmed membership/sales and other intentionally excluded commercial pages retain their exclusions. Production noindex pages permit link following.
- Distinct titles and descriptions, one descriptive H1 per page, consistent Article/FAQ/Breadcrumb structured data and visible FAQ content.
- Separate intent for `/private-jet-charter/` (service explanation) and `/charter/` (flight request).
- Responsive image optimisation and a small navigation logo response. Original approved image files and logo artwork are preserved.
- The actual Dallas address and existing +1 407 747 5288 number are reused in the footer, contact information and schema. A telephone area code is not proof of an incorrect business number; no replacement number was invented.
- 30 route guides, 13 airport guides, expanded coverage for all eight aircraft, Dallas charter/empty-leg/cargo pages, sports and corporate group pages, a pricing pillar, operator/safety guides, four destination guides, three aircraft comparisons and a glossary.
- All new pages are reachable through internal links. Existing articles link into pricing and charter planning.
- Palm Beach references use the airport's current DJT/KDJT identifiers, with a legacy `/airports/kpbi/` redirect. Citation Latitude's existing shortcut remains a permanent redirect.

## Content and claims

Prices are explicitly labelled illustrations based on a cited published category reference, not EXJET tariffs, live fares, guaranteed availability or model-specific market averages. Route time allowances are editorial planning estimates, not operator flight plans. The pricing page states the method and includes a clearly hypothetical tax calculation with an IRS source. Aircraft specifications are attributed to manufacturers where used; individual aircraft and operator details require trip-specific confirmation.

The guides do not claim EXJET owns the pictured aircraft, operates the brokered flights, or holds an ARGUS/WYVERN rating. Existing draft policy and commercial restrictions remain in place. No search volumes, backlinks, rankings or zero-traffic claim has been fabricated. A `site:` search cannot establish a complete indexed-page count. FAQ markup is retained as machine-readable content; it is not a promise of Google FAQ rich results.

## Apply the code

The package contains `source/` (full source including approved public assets), `EXJET-SEO.patch`, and verification evidence. No credentials, dependencies, build output or git database are included.

For a clean checkout of the exact baseline:

```sh
git checkout -b fix/production-seo-2026-10-17 6b737cb9145ddb97d5d6a8a6381a0463414ca888
git apply --check /path/to/EXJET-SEO.patch
git apply /path/to/EXJET-SEO.patch
npm ci
npm run lint
node --test tests/seo-environment.test.mjs
VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://www.exjet.com npm run build
python3 scripts/verify-seo.py production
```

If the live branch has changed, merge the patch into that branch and resolve conflicts before releasing. Do not replace newer business or integration changes with the bundled source snapshot.

## Publish to the existing Vercel project

- Owning team: `zacks-projects-3a637c51` (`team_ysTw176be3s2zmxAKKOSRDnb`).
- Project: `exjet-brand-review` (`prj_Kr8tRchsJb3lt0aGiqP1PaCcHgiV`).
- Production host: `www.exjet.com`; retain the apex domain's permanent redirect.
- Baseline deployment: `dpl_BxRgnXg14vCFWhoYx7c1c11QEjnc`.
- Observed live branch: `claude/nextjs-extraction-vercel-deploy-0qmo44`. Verify the current Production Branch before merging. Do not assume `main` is the deployed branch.
- Set `NEXT_PUBLIC_SITE_URL=https://www.exjet.com` in Production. Vercel sets `VERCEL_ENV`; do not manually force it to production in Preview.
- Keep existing integration secrets and environment settings. This release does not replace request-delivery or Avinode credentials.
- Create and inspect a preview first. Its pages must show noindex/nofollow, public www canonicals, and `Disallow: /`.
- Build/deploy for the Production target. Do not merely alias a preview build: metadata is generated at build time.
- Verify live HTML and response headers, sitemap and robots after the domain serves the new deployment. Check that no `X-Robots-Tag: noindex` is injected by a platform or proxy.
- Retain the previous deployment as a rollback target. Rolling back to it also restores the old SEO defects.

## Collapse the edge redirect chain

`deployment/cloudflare-canonical-redirect.json` is **one prepared rule**, not an applied configuration or a replacement ruleset. Add it to the existing `http_request_dynamic_redirect` ruleset, preserving all other rules. It redirects public GET/HEAD requests on the apex or HTTP www host directly to HTTPS www, preserving path and query string. It deliberately does not alter POST behaviour.

The rule must execute before any rule that separately changes HTTP to HTTPS. Inspect existing Cloudflare rules and the result before changing their order or disabling anything. Keep the current origin/DNS routing and HSTS. A missing trailing slash can still trigger the site's separate, intentional slash redirect.

Verify the root and a path with a query string from all three entry points: `http://exjet.com`, `https://exjet.com`, `http://www.exjet.com`. Each should reach the HTTPS www version directly. The Next.js patch cannot remove a redirect applied before a request reaches Vercel.

Reference: https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/

## Submit and measure indexing

After live production checks pass, submit `https://www.exjet.com/sitemap.xml` in the verified EXJET Google Search Console property and Bing Webmaster Tools. Use Google's live URL inspection for the home, Dallas, pricing, charter and one route page; confirm successful fetch, crawling allowed and indexing allowed, then request indexing where available. Review Google's selected canonical after processing.

Record Search Console's actual coverage and performance baseline. Compare impressions, clicks, enquiries and indexed URLs after recrawling; do not infer zero traffic or exact index coverage from a search operator. Discovery or a successful sitemap submission does not guarantee indexing.

References:
- https://support.google.com/webmasters/answer/7451001
- https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed
- https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site

## Business Profile and ongoing work

Use the genuine business name, current phone, public website and verified address for any eligible EXJET Business Profile. Verify ownership and eligibility of the Dallas location before displaying it; do not claim a virtual office as a staffed customer location. Do not merge it with the unrelated Orlando operator. Business Profile claiming and verification require the owner's account and business evidence.

Reference: https://support.google.com/business/answer/3038177

Links from Dallas business organisations, relevant FBOs, actual partners and industry directories require real relationships and editorial acceptance. None have been claimed or solicited. Do not represent ARGUS/WYVERN accreditation or directory eligibility without evidence. Additional seasonal event/Hamptons content and future publishing remain editorial work; the four destination guides in this release cover Aspen, Vail, Cabo and Palm Beach.

## Regression checks

```sh
# Production: 114 pages, 99 indexable/sitemap URLs, 15 intentional exclusions
VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://www.exjet.com npm run build
python3 scripts/verify-seo.py production

# Optional HTTP crawl while this build is running locally
npm start
python3 scripts/verify-seo.py production --base-url http://localhost:3000

# Preview: all 114 pages excluded, even with the inherited public URL
VERCEL_ENV=preview NEXT_PUBLIC_SITE_URL=https://www.exjet.com npm run build
python3 scripts/verify-seo.py preview
```

The verifier checks original URL preservation, unique metadata, one H1, canonical/social origins, schema parsing, image alt attributes, sitemap consistency, robots, internal links and homepage reachability. The optional HTTP crawl checks every page status, noindex response headers on indexable pages and a real 404. See `verification/` for the completed release results.
