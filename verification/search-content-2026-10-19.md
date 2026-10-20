# EXJET search coverage and release scope

Research date: 19 October 2026 (America/Chicago). Base: `f663fd0031f1e7f8b5d8c4e0aff12a4ebdc494ac` on `fix/production-seo-2026-10-19`.

## Evidence and measurement

The live homepage was inspected in the browser and showed the seven services and the corporate, executive-assistant and family-office pages. A fresh clone of the production branch matched the supplied base commit. The web-search cache still showed older homepage copy; it is not a reliable source for the current production release.

Google Search Console and Bing Webmaster Tools opened at their signed-out entry pages. No authenticated performance or coverage reports were available. Sitemap submission status, indexed URL counts, impressions, clicks, CTR, query positions and AI citations remain unmeasured. A sitemap URL count is not an index count. No search-volume or ranking estimates are presented below.

## Keyword and question clusters

These are qualitative intent clusters and canonical destinations, not a volume forecast. Existing pages retain their URLs. New content answers distinct ownership decisions instead of generating near-duplicate city or aircraft pages.

| Audience / intent | Queries and buyer questions | Canonical destination | Coverage decision |
| --- | --- | --- | --- |
| Charter | business jet charter; aircraft charter solutions; how to request a complete trip quote | `/private-jet-charter/` | Existing service hub |
| Charter cost | charter quote inclusions; aircraft charter cost; positioning and additional charges | `/pricing/` | Existing cost guide; keep illustrative amounts labeled |
| Executive assistants | executive assistant aircraft charter; flight approval checklist; executive itinerary handoff | `/executive-assistants/` | Existing audience page |
| Fortune 500 travel | corporate aviation travel planning; board travel; corporate charter procurement | `/corporate-travel/fortune-500/` | Existing audience page; no customer relationship claims |
| Procurement | operator review; charter procurement checklist; compare charter proposals | `/guides/corporate-charter-procurement/` | Existing decision guide |
| Supplemental lift | flight department supplemental lift; travel during aircraft downtime | `/corporate-travel/supplemental-lift/` | Link from owner and MRO guides |
| Roadshows | multi-city executive travel; investor roadshow aircraft planning | `/corporate-travel/roadshows/` | Existing distinct itinerary guide |
| Family offices | family office private aviation; principal travel approvals; household flight planning | `/family-office-private-aviation/` | Existing audience page |
| Family office decisions | family office aircraft ownership support; compare management and upgrade proposals | `/aircraft-owners/` | New owner hub with service links |
| Group charter | corporate team air charter; event group flights; sports team charter | `/group-charter/` | Existing hub and team-specific guides |
| Sales & acquisitions | buy a business jet; aircraft acquisition consulting; sell an aircraft | `/sales/` | Preserve listing statuses; link buyer checklist |
| Acquisition due diligence | pre-purchase aircraft checklist; records vs title review; aircraft delivery planning | `/guides/buying-a-business-jet/` | New guide and comparison table |
| Aircraft management | aircraft management consulting; owner reporting; management provider selection | `/aircraft-management/` | Existing service page |
| Management comparison | aircraft management fees; pass-through costs; crew coverage; charter revenue assumptions | `/guides/aircraft-management-proposals/` | New guide; no projected earnings claim |
| MRO | aircraft MRO consulting; maintenance coordination; maintenance downtime planning | `/mro/` | Existing service page |
| MRO procurement | compare aircraft maintenance quotes; inspection exclusions; change orders; core returns | `/guides/aircraft-maintenance-quotes/` | New guide; no repair-station claim |
| Interior completions | business jet interior refurbishment; cabin completion consulting | `/interior-completions/` | Existing service page |
| Starlink | aircraft Starlink installation coordination; aircraft eligibility; installation scope | `/starlink-installation/` | Existing service page; no installer authorization claim |
| Cabin project decisions | aircraft cabin upgrade checklist; refurbishment downtime; Starlink approval requirements | `/guides/aircraft-cabin-upgrade-planning/` | New guide with FAA and Starlink sources |
| Dallas / DFW | Dallas business jet charter; Love Field vs Addison; DFW owner consulting | `/private-jet-charter/dallas/` and `/aircraft-owners/` | Different traveler and owner intents; no invented locations |
| Routes | Dallas–New York; Dallas–Miami; New York–Miami; Los Angeles–New York | Existing `/routes/` guides | Preserve 30 route pages and their specific planning context |
| Airports | KDAL, KADS, KTEB, KOPF, KVNY; FBO and ground transfer planning | Existing `/airports/` guides | Index facts and airport codes in site search |
| Aircraft types | Gulfstream, Global, Challenger, Citation, Falcon charter aircraft | `/aircraft/` and existing model pages | Preserve existing graphics and specifications |
| Performance | range vs payload; cruise speed assumptions; aircraft performance comparisons | `/aircraft-performance/` | Existing authoritative-source guides; no new numeric specifications |
| Specification verification | exact aircraft configuration; tail-number checks; ARGUS/WYVERN report scope | `/guides/aircraft-tail-number-verification/` and `/guides/argus-wyvern/` | Existing verification guides; no public fleet import |
| Access models | on-demand charter vs membership, fractional ownership or lease | `/guides/private-aviation-program-comparison/` | Existing neutral comparison; verify any future program-specific terms |

## Competitor review

The following observations concern publicly retrieved content, not competitor traffic, rankings or market share. Opportunity assessments are EXJET editorial judgments.

| Source reviewed | Observable emphasis | EXJET response |
| --- | --- | --- |
| [NetJets business travel](https://www.netjets.com/en-us/business-jet-travel) | Corporate travel and the operator's scale and reliability proposition | Keep executive travel planning clear without borrowing customer claims or implying EXJET owns an operating fleet |
| [Flexjet programs](https://flexjet.com/en-us/programs) and [Corporate Solutions announcement](https://flexjet.com/en-us/press/flexjet-launches-corporate-solutions-complement-flight-department-needs) | Access models and support for flight departments; the Corporate Solutions announcement is historical (2018) | Retain supplemental-lift and access-model guides; add owner proposal-comparison questions |
| [VistaJet corporate membership](https://www.vistajet.com/en-us/memberships/corporate/) | Corporate membership aligned with business requirements | Explain procurement, approvals and itinerary requirements without promising program benefits EXJET has not established |
| [Air Charter Service events](https://www.aircharterserviceusa.com/specialist-solutions/events) and [travel-company solutions](https://www.aircharterservice.com/specialist-solutions/travel-companies) | Group logistics, event needs and specialist travel arrangements | Keep group/team content connected to traveler brief, airport and timing guides |
| [Wheels Up](https://www.wheelsup.com/) | Business solutions and a mix of owned fleet, charter network and commercial connectivity in retrieved public text | Explain EXJET's consulting and coordination scope, and connect flight needs with owner downtime decisions |

No competitor text, performance figures, guarantees or customer relationships are copied into EXJET content.

## Cloudflare findings

Live `robots.txt` contains a Cloudflare-managed `Google-Extended: Disallow /` group, alongside other crawler restrictions, `Content-Signal: search=yes,ai-train=no,use=reference`, and the origin sitemap declaration.

[Google's crawler documentation](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers) states that Google-Extended controls both future Gemini training and the specified Gemini/Vertex grounding uses; it is not a Google Search inclusion or ranking signal. Allowing this token is therefore not a grounding-only permission.

[Cloudflare's current documentation](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/) places configuration in Security Settings → Bot traffic → Configure AI bot policies, with Training and Enable Bot Preference Sync controlling managed directives. Current documentation also describes coupled edge blocking for training crawlers, with mixed-use crawlers excluded. Inspect the actual account UI before modifying a legacy managed-robots control or the newer policy system.

The secure Cloudflare sign-in attempt returned a page-visible login API 403; a fresh dashboard page remained signed out. No policy was changed. Do not append a contradictory Allow rule at the origin. When access is restored, choose the narrowest supported change, preserve other crawler preferences and WAF/bot protections, review the exact resulting robots response, and obtain a decision if broader training permission is unavoidable.

## Data provenance and protected scope

`ARGUS_Operators_and_Emails.xlsx`, version 4, modified 16 October 2026, was located and its introductory coverage notes read. It describes a partial JETNET-derived fleet and says aircraft authorization is not verified. It is a research input, not proof of current availability or permission to publish specific tails. No tail data was imported.

The supplied [N74KM M2 reference](https://www.aircraft.com/aircraft/252345811/n74km-2014-cessna-citation-m2) remains an archived listing reference. No availability, representation or EXJET-sale claim was added.

Protected scope includes all tracked public assets, `app/api/`, `integration/`, Avinode files, flight-search and inquiry components and associated selection/date helpers. Compare their SHA-256 hashes against the production base before release. All public graphics and the navbar logo must remain unchanged.

## Validation gates

Run lint, TypeScript, production build, the existing integration/SEO tests plus the site-search regression tests, and `scripts/verify-seo.py production`. Verify original routes, canonical host, sitemap exclusions, internal links and JSON-LD. Browser-check the new owner page, table scrolling, guide anchors, menu and search/clear behavior. The local build establishes implementation correctness; report production deployment and live checks separately.

After authenticated webmaster access is restored: inspect the exact domain property, sitemap submission/processing status, exclusions and representative URLs; record date range, clicks, impressions, CTR and position by page/query. Compare equivalent periods and separate branded from non-branded demand. Do not infer indexing or generative-answer inclusion from successful deployment.

## Prepared release result

This local release passed lint, TypeScript, the production build and all 17 tests. The build verified 25 approved photography hashes. The HTTP/SEO check passed for 139 HTML pages, with 127 indexable sitemap URLs, all 62 original routes preserved, and zero reported errors. All 65 protected file hashes matched the production baseline. New-page browser interaction and visual checks remain pending.

The changes are prepared on `fix/owner-guides-2026-10-20` from the stated production base. They have not been pushed or deployed: GitHub write authentication was unavailable, and the connected Vercel account could not access the requested team. Do not interpret this local report as a production release or search-index result.

Cloudflare's official setup instructions were fetched from `https://developers.cloudflare.com/agent-setup/prompt.md`. Its 19 skills were installed and the Cloudflare MCP endpoint registered in this coding environment. OAuth authorization is incomplete. Automatic approval review rejected account/zone read plus bot-management read/write authorization because the bot-management write scope extends beyond one managed-robots setting. No Cloudflare setting was changed.
