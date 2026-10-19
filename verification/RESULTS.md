# EXJET SEO verification

Release prepared: 17 October 2026. These results describe the local release candidate, not the currently deployed website.

Story: visitors and crawlers follow the homepage into useful charter content, receive complete server-rendered HTML and correctly sized images, and discover canonical production URLs through consistent links and a matching sitemap; preview builds remain excluded from search indexing.

| Check | Result | Evidence |
| --- | --- | --- |
| Production build and TypeScript | PASS | Next.js build completed; 120 framework outputs generated, including 114 public page HTML files |
| Preview build and TypeScript | PASS | Build completed with `VERCEL_ENV=preview` and the public site URL deliberately inherited |
| ESLint | PASS | `npm run lint` completed without errors |
| Environment regression suite | PASS | All nine Node tests passed |
| Existing URLs | PASS | All 62 routes from the exact production-source baseline retained |
| HTTP page crawl | PASS | 114 pages returned HTTP 200; deliberate unknown URL returned 404 |
| Production indexing | PASS | 99 indexable pages exactly match the 99 canonical sitemap URLs |
| Intentional exclusions | PASS | 15 legal, utility and unconfirmed commercial pages remain noindex |
| Preview indexing | PASS | All 114 pages noindex/nofollow; robots disallows crawling |
| Canonical and social metadata | PASS | Every page uses HTTPS www.exjet.com; page canonical and og:url match |
| Structured data | PASS | All JSON-LD parses; no preview-host URLs remain |
| Page metadata and headings | PASS | Unique titles/descriptions, exactly one H1 on each page |
| Internal links | PASS | No missing page targets or anchors; all pages reachable from homepage links |
| Images | PASS | Every img has an alt attribute; approved source photography hashes unchanged |
| Legacy redirects | PASS | `/citation-latitude/` and `/airports/kpbi/` return 301 to their canonical destinations |
| Navigation logo delivery | PASS | Image endpoint returned WebP, 1,368 bytes at 96px versus 330,133-byte original PNG |
| Browser rendering | PASS | Homepage, pricing, group charter, Challenger 350 and Dallas–Cabo at 1440px and 390px widths: no page errors, no page-wide horizontal overflow, no failed visible eager images |
| Browser interaction | PASS | Navigation dialog opens/closes; pricing FAQ expands at both viewport widths |
| Visual inspection | PASS | Homepage mobile, group charter desktop and complete mobile pricing page reviewed |
| Live release | BLOCKED | Vercel owning-team scope returned 403; no GitHub push credentials |
| Edge redirect, search submissions and Business Profile | NOT APPLIED | Prepared instructions/rule; required account access unavailable |

The HTTP check was run with the server and crawler in the same local network namespace. Chromium was supplied by a separate temporary QA installation; it is not a project dependency. Browser screenshots were used for inspection only and are not included in the release package.

Evidence files:
- `seo-production.json`: complete production metadata, HTTP status and preservation results.
- `seo-preview.json`: complete preview metadata and exclusion results.
- `browser.json`: ten browser/viewport checks, resource observations and interaction results.
- `delivery.json`: redirect responses and measured logo response.

Limits: this verifies the local implementation. It does not establish current Google/Bing indexing, rankings, organic traffic, live integration delivery, field Core Web Vitals or third-party business profile status. Post-deployment verification is necessary because a proxy or hosting header can override app-level crawler settings. No enquiry form was submitted and no external outreach was sent.
