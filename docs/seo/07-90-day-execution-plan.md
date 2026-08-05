# EXJET 90-Day SEO Execution Plan

Tracks every workstream from the other six docs into one weekly calendar. Article numbers reference `05-content-plan-50-articles.md`. Page names reference `03-site-architecture-sitemap.md`. At 2–3 articles/week, 90 days covers roughly 30–35 of the 50 articles — that's intentional pacing, not a shortfall; the remainder (mostly Category F seasonal/event content, tied to specific calendar dates anyway) rolls into month 4+ alongside the Tier 4 national expansion. Publishing 50 rushed articles in 13 weeks would cost more in quality/EEAT signal than it gains in volume.

Owners assumed: **Eng** (developer implementing the Next.js changes), **Content** (writer/editor for articles + on-page copy), **Local/Ops** (GBP, citations, reviews, the physical Dallas presence), **Growth** (tracking, outreach, reporting). Assign real names before Week 1 starts.

---

## Week 1 — Foundation & validation

| Workstream | Action |
|---|---|
| Data validation | Run every keyword in `02-keyword-strategy.md` Tier 1/2 through Google Keyword Planner + Ahrefs (or equivalent) — replace directional estimates with real volume/CPC/difficulty |
| Tracking | Install/verify Google Search Console + Bing Webmaster Tools; connect GA4 goal tracking for quote-form submits and `tel:` clicks (once those exist — flag as dependency for Week 5) |
| Physical presence | Finalize the Dallas-area address arrangement (Addison Airport office/desk per `04-local-seo-gbp-strategy.md` §0) and secure a local (214/972/469/817) tracked phone number |
| Technical quick fixes | Eng: add `/auth/` and `/booking/` to `robots.ts` disallow list; remove `/auth/login`, `/auth/register` from `sitemap.ts`; add `generateStaticParams` + per-jet `generateMetadata` to `jets/[id]/page.tsx` |
| Photography | Scope and book a real aircraft/cabin/DFW-market photo shoot (flagged in `06-conversion-optimization.md` §5) — lead time means booking this now, not in week 6 |
| Competitive scan | Growth: pull top 10 organic results for `private jet charter dallas` and `dfw private jet charter` today, screenshot/log as the baseline to measure movement against |

## Week 2 — Fix what's broken, stand up GBP

| Workstream | Action |
|---|---|
| Dead links | Eng: ship `/about`, `/contact`, `/faq`, `/safety`, `/terms`, `/privacy` (real pages, not stubs — Contact carries the NAP, FAQ carries real `FAQPage` schema) |
| Nav/footer | Eng: update `navbar.tsx` and `footer.tsx` per `03-site-architecture-sitemap.md` §6 (remove dead links, add Charter mega-menu placeholder, Locations column) |
| GBP | Local/Ops: create/claim Google Business Profile as a Service-Area Business, set categories + services + description per `04-local-seo-gbp-strategy.md` §1–3 |
| Citations | Local/Ops: submit Tier 1 citations (Bing Places, Apple Business Connect, Facebook, LinkedIn Company Page) |
| Reviews | Eng: wire the post-flight review-request trigger into `booking/confirmation/page.tsx` (SMS/email, 24-48hr delay, GBP + Trustpilot links) |
| Content | Content: draft Articles #1 (Dallas pillar), #19 (Empty legs pillar) — these two unlock the most internal-link targets for everything after them |

## Week 3 — Ship the flagship local pages

| Workstream | Action |
|---|---|
| Pages | Eng: ship `/private-jet-charter/dallas-tx` (with `LocalBusiness` schema, address/geo/phone) and `/private-jet-charter/addison-airport-ads` |
| Pages | Eng: ship `/empty-leg-flights` |
| Schema | Eng: add `address`/`geo`/`telephone` to the homepage `Organization` JSON-LD (`page.tsx:22-34`) now that real NAP exists |
| Indexing | Growth: manually request indexing in GSC for all 3 new pages same-day |
| Content | Content: publish Articles #1, #19; draft #2, #3, #20 |
| GBP | Local/Ops: first weekly Post (empty-leg deal of the week, per `04-local-seo-gbp-strategy.md` §4) |
| Citations | Local/Ops: Tier 2 aviation-specific citations |

## Week 4 — Round out DFW airport coverage

| Workstream | Action |
|---|---|
| Pages | Eng: ship `/private-jet-charter/fort-worth-tx`, `/private-jet-charter/dallas-love-field-dal`, `/private-jet-charter/mckinney-national-tki` |
| Pages | Eng: ship `/corporate-jet-charter/dallas` |
| Technical | Eng: begin `/search` server-component refactor (audit doc §3) — target completion Week 5 |
| Content | Content: publish Articles #2, #3, #20; draft #4, #5, #21 |
| GBP | Local/Ops: weekly Post; respond to any reviews received |
| Reporting | Growth: Week-4 baseline report — indexation status (GSC coverage), impressions for Tier 1 terms (too early for rankings, but confirm pages are being crawled) |

## Week 5 — Category pages, CRO phase 1, first route pages

| Workstream | Action |
|---|---|
| Pages | Eng: ship all 5 aircraft category pages (`light-jets` through `ultra-long-range-jets`) |
| Pages | Eng: ship `/routes/dallas-to-aspen`, `/routes/dallas-to-new-york` |
| Technical | Eng: complete `/search` refactor; ship per-category `generateMetadata` |
| CRO | Eng: add phone number to navbar + every primary CTA area sitewide (`06-conversion-optimization.md` §1–2); ship the lightweight quote-request form |
| Content | Content: publish Articles #4, #5, #21; draft #6, #7, #22 |
| GBP | Local/Ops: weekly Post |

## Week 6 — Remaining route pages, broker positioning, PR outreach begins

| Workstream | Action |
|---|---|
| Pages | Eng: ship `/routes/dallas-to-los-angeles`, `/routes/dallas-to-cabo-san-lucas`, `/routes/dallas-to-vail` |
| Pages | Eng: ship `/private-jet-broker` |
| Outreach | Growth: begin digital PR pitch for Article #12 angle (DFW Fortune 500 corporate travel) to Dallas Business Journal, D CEO, D Magazine |
| Content | Content: publish Articles #6, #7, #22; draft #8, #9, #23 |
| CRO | Eng: ship sticky "Request this aircraft" CTA on `jets/[id]/page.tsx`; fix the hardcoded-identical-reviews issue flagged in the audit (either real per-jet reviews or remove until available) |
| GBP | Local/Ops: weekly Post; Tier 3 citations begin |

## Week 7 — Corporate lead path, mid-cycle content

| Workstream | Action |
|---|---|
| CRO | Eng: ship dedicated "Request Corporate Account Info" form, distinct from the individual quote form |
| Content | Content: publish Articles #8, #9, #23; draft #10, #11, #24 |
| Link building | Growth: local link building — chamber of commerce membership, event-sponsorship outreach per `04-local-seo-gbp-strategy.md` §7 |
| GBP | Local/Ops: weekly Post; review-count checkpoint (target: 10+ genuine reviews by end of week) |
| Copy | Content: ship homepage copy updates — "Why EXJET" trust paragraph moved above the fold, no-membership messaging elevated (`06-conversion-optimization.md` §3) |

## Week 8 — Mid-point technical re-audit

| Workstream | Action |
|---|---|
| Technical | Eng + Growth: full re-run of the technical audit — Core Web Vitals via PageSpeed Insights/CrUX (finally testable once the site is live and crawlable), GSC Coverage report, mobile usability report |
| Content | Content: publish Articles #10, #11, #24; draft #12, #13, #25 |
| Schema | Eng: add `Service` schema to all service pages, `BreadcrumbList` to all location/service pages now that the hierarchy exists |
| GBP | Local/Ops: weekly Post |
| Reporting | Growth: Week-8 report — early ranking movement check for long-tail Tier 1 terms (airport-specific pages typically move faster than the head "private jet charter dallas" term) |

## Week 9 — Empty-leg cluster completion, seasonal alignment

| Workstream | Action |
|---|---|
| Content | Content: publish Articles #12, #13, #25; draft #14, #15, #26 |
| Seasonal | Content: check upcoming event calendar (`sports-events.json`) against Category F articles — if any event falls within the next 6-8 weeks, pull that article forward in the queue ahead of its default slot |
| GBP | Local/Ops: weekly Post tied to an upcoming `sports-events.json` entry (per §4 event-tied post strategy) |
| Journal template | Eng: confirm `/journal` category archive pages (`03-site-architecture-sitemap.md` §4) are live and internal linking correctly |

## Week 10 — Route coverage expansion, outreach follow-through

| Workstream | Action |
|---|---|
| Pages | Eng: ship `/routes/dallas-to-miami`, `/routes/dallas-to-las-vegas`, `/routes/dallas-to-jackson-hole` |
| Content | Content: publish Articles #14, #15, #26; draft #16, #17, #27 |
| Outreach | Growth: follow up on Week 6 PR pitches; pitch Article #46 (safety/vetting angle) as a second wave |
| GBP | Local/Ops: weekly Post; citation NAP consistency spot-check |

## Week 11 — Brand/luxury polish

| Workstream | Action |
|---|---|
| Brand | Eng/Design: roll out real photography from the Week 1 shoot across homepage, service, and location pages, replacing placeholder imagery |
| Content | Content: publish Articles #16, #17, #27; draft #18, #28 |
| CRO | Content: add named leadership/team content to `/about`; add discretion/privacy trust line sitewide per `06-conversion-optimization.md` §4 |
| GBP | Local/Ops: weekly Post |

## Week 12 — Second technical audit, review milestone

| Workstream | Action |
|---|---|
| Technical | Eng + Growth: second full technical re-audit — confirm indexation of every page shipped since Week 3, check for any new crawl errors, re-verify Core Web Vitals after the photography rollout (large images are a common regression point) |
| Content | Content: publish Articles #18, #28; draft #29, #30 |
| Reviews | Local/Ops: review-count checkpoint (target: 25+ genuine reviews, 4.8+ average per `04-local-seo-gbp-strategy.md` §5) |
| GBP | Local/Ops: weekly Post |

## Week 13 — 90-day retrospective & Phase 2 kickoff

| Workstream | Action |
|---|---|
| Content | Content: publish Articles #29, #30; finalize the Month 4+ content calendar for the remaining ~20 articles, prioritizing Category F (seasonal — align to actual upcoming event dates) and Category D (aircraft guides) |
| Reporting | Growth: full 90-day report — ranking positions for every Tier 1/2 keyword vs. Week 1 baseline, organic traffic to `/private-jet-charter/*` and `/journal/*`, quote-form submissions and tracked-phone-call volume attributed to organic/local, GBP call/direction-request volume |
| Retro | All: what worked (double down), what didn't (cut or fix), which Tier 1 pages are page-1/page-2 vs. still unranked |
| Phase 2 | Growth: confirm go/no-go on Houston as the first Tier 4 expansion market (`02-keyword-strategy.md` Tier 4) based on Dallas performance — don't start national expansion until Dallas is showing clear ranking movement |

---

## Success metrics to report weekly (not just at Week 13)

- **Indexation:** pages indexed vs. pages submitted (GSC Coverage report)
- **Rankings:** position tracking for all Tier 1 keywords (weekly, even before they move — establishes trend lines)
- **GBP:** calls, direction requests, website clicks from the profile (GBP Insights)
- **Reviews:** count + average rating, response time to new reviews
- **Content:** articles published vs. plan, internal links fired correctly (spot-check per the content plan's link requirements)
- **Conversion:** quote-form submissions, `tel:` clicks, corporate-account-request submissions — segmented by landing page so you know which page type (location vs. service vs. blog) is actually driving contact, not just traffic
