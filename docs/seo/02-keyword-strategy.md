# EXJET Keyword Strategy — Dallas/DFW First, National Second

Methodology note: figures below are directional, built from private-aviation industry benchmarks (charter broker CPCs typically run $15–$90+, average charter ticket value $8K–$150K+) and standard SERP-competition heuristics, not a live Ahrefs/SEMrush/GKP pull — this session has no connectivity to those tools. **Week 1 of execution must validate every volume/CPC number against Google Keyword Planner, Ahrefs, and GSC** (see `07-90-day-execution-plan.md`, Week 1). Prioritization logic (intent tiering, page mapping) holds regardless of exact volume.

Scoring: **Value = Est. monthly search volume × close probability × average transaction value contribution.** A charter closes at $8K–$40K average ticket for light/midsize trips and $50K–$250K+ for heavy/ultra-long-range and international — so even low-volume, high-intent keywords are worth aggressive pursuit; this is not a business where you chase volume for its own sake.

---

## Tier 0 — Branded & near-branded (defend, don't build)

| Keyword | Intent | Competition | Priority |
|---|---|---|---|
| exjet | Navigational | Low | Must rank #1 — monitor for competitor bidding on brand |
| exjet.com | Navigational | Low | Same |
| exjet reviews | Navigational/trust | Low | Needed once real review volume exists (Trustpilot/Google) |

Action: nothing content-heavy needed, just make sure homepage title/schema (per audit doc) don't dilute brand signal, and claim Google Business Profile + Trustpilot before a competitor or scraper does.

---

## Tier 1 — Dallas/DFW commercial & buyer-intent (highest priority, build first)

This is the core of the 90-day plan. Every keyword here maps to a **service or location page**, not a blog post — these are the pages that take the call.

| Keyword | Search intent | Buyer intent | Competition | Est. value | Target page |
|---|---|---|---|---|---|
| private jet charter dallas | Commercial | Very high | Medium (local players: Jet Linx Dallas, Priester, Solairus regional presence; low national-broker saturation on this exact phrase) | Highest | `/private-jet-charter/dallas-tx` |
| dfw private jet charter | Commercial | Very high | Medium | Highest | `/private-jet-charter/dallas-fort-worth` (or canonical to Dallas page w/ DFW as primary alt phrasing in copy/H2) |
| private jet charter fort worth | Commercial | High | Low-Medium | High | `/private-jet-charter/fort-worth-tx` |
| dallas corporate jet charter | Commercial | Very high (B2B, higher ticket) | Low | Highest (highest ACV of any DFW term — corporate accounts book repeat, multi-leg trips) | `/corporate-jet-charter/dallas` |
| private jet charter addison tx | Commercial, airport-specific | Very high | Low | High — Addison (ADS) is the actual GA/charter hub for Dallas, underserved by name | `/private-jet-charter/addison-airport-ads` |
| private jet charter love field | Commercial, airport-specific | High | Low | High | `/private-jet-charter/dallas-love-field-dal` |
| jet charter mckinney tx | Commercial, airport-specific | Medium-High | Low | Medium-High | `/private-jet-charter/mckinney-national-tki` |
| private jet company dallas | Commercial | High | Low-Medium | High | Same as `dallas-tx` page (secondary H2 target) |
| dallas private jet rental | Commercial | High | Medium | High | Same page (secondary target — "rental" phrasing converts a different searcher segment, worth its own H2/FAQ, not a new page) |
| charter flight dallas | Commercial | Medium-High | Medium | Medium-High | Same page |
| dallas to aspen private jet | Route commercial | Very high (seasonal ski spikes Nov–Mar) | Low | High | `/routes/dallas-to-aspen` |
| dallas to new york private jet | Route commercial | High | Low-Medium | High | `/routes/dallas-to-new-york` |
| dallas to los angeles private jet | Route commercial | High | Low-Medium | High | `/routes/dallas-to-los-angeles` |
| dallas to cabo private jet | Route commercial | High (seasonal) | Low | High | `/routes/dallas-to-cabo-san-lucas` |
| dallas to vail private jet | Route commercial | High (seasonal) | Low | High | `/routes/dallas-to-vail` |
| private jet charter cost dallas | Commercial, price-research | Very high (bottom-funnel, ready to compare) | Low | High | FAQ/pricing module on the Dallas page + supporting article (see content plan #3) |
| empty leg flights dallas | Commercial | High | Low | Medium-High | `/empty-leg-flights` (Texas-filtered section) |
| empty leg flights texas | Commercial | High | Low-Medium | Medium-High | `/empty-leg-flights` (state-level H1, TX inventory front and center) |
| dallas empty legs | Commercial | Medium | Low | Medium | Same page, secondary H2 |
| jet charter near me (Dallas-geo-modified via GBP/local pack, not literal page) | Local-pack | Very high | High (this phrase is nationally contested but resolved locally by Google via GBP, not by page content) | Highest local-pack value | Google Business Profile (see `04-local-seo-gbp-strategy.md`) — do not build a page targeting literal "near me," optimize GBP instead |

---

## Tier 2 — National broker/category terms (build second, higher competition)

These are contested nationally by Wheels Up, NetJets, Villiers, Stratos Jets, Paramount Business Jets, Air Charter Service, Monarch Air Group, and similar. EXJET can win long-tail cuts of these but shouldn't expect page-1 on the bare head term inside 90 days — these are 6–18 month plays that the Dallas pages fund via authority transfer.

| Keyword | Search intent | Buyer intent | Competition | Est. value | Target page |
|---|---|---|---|---|---|
| private jet broker | Commercial/informational blend | High | Very high (established national brokers dominate) | Very high | `/private-jet-broker` — differentiate on ARGUS Platinum vetting + <4hr confirm, don't try to out-content the incumbents, out-position them |
| private jet charter company | Commercial | High | Very high | High | Homepage secondary target |
| how does a private jet broker work | Informational, upper-funnel | Medium | Medium | Medium (educates toward broker trust — high assist value even if it doesn't convert directly) | Article #8 |
| private jet charter vs membership | Comparison, mid-funnel | High | Medium | High (directly answers "why EXJET over Wheels Up/NetJets") | Article #4 |
| empty leg flights | Commercial | High | High (established empty-leg aggregators: JSX, JetSmarter legacy, Villiers) | High | `/empty-leg-flights` (national H1, with Texas as the featured region) |
| luxury private jet charter | Commercial, brand-adjacent | Medium-High | High | Medium-High | Homepage / `/private-jet-charter` service hub |
| on demand private jet | Commercial | Medium | Medium (EXJET's actual tagline — should own this) | Medium-High | Homepage — already the brand's positioning per `layout.tsx`, reinforce with on-page H2 |
| light jet charter cost | Informational/commercial | Medium | Medium | Medium | Article #12 (aircraft-category cost guide) |
| midsize jet charter | Commercial, category | Medium | Medium | Medium | Category filter page (`/private-jet-charter/midsize-jets` — from existing `JetCategory` taxonomy in `src/types/index.ts`) |
| heavy jet charter | Commercial, category | Medium | Low-Medium | Medium-High (higher ACV) | Category filter page |
| ultra long range jet charter | Commercial, category | Medium | Low | High (highest ACV category) | Category filter page |

---

## Tier 3 — Informational / top-of-funnel (blog fuel, builds authority + internal links to Tier 1/2)

Full list with outlines lives in `05-content-plan-50-articles.md`. Representative sample showing the intent spread:

| Keyword theme | Intent | Funnel stage | Why it matters |
|---|---|---|---|
| "how much does a private jet cost per hour" | Informational | Top | High volume, answers the #1 objection, links to pricing/quote CTA |
| "empty leg flights explained" | Informational | Top-mid | Educates the exact buyer for `/empty-leg-flights` |
| "private jet charter vs first class" | Comparison | Mid | Targets the exec who's never chartered before |
| "best private jets for Dallas to Aspen ski trips" | Informational, seasonal | Mid | Feeds route pages, timely (Nov–Mar surge) |
| "ARGUS platinum rating explained" | Informational, trust | Mid | Supports the safety/trust differentiator across every commercial page |
| "ExxonMobil / AT&T / Toyota HQ relocation exec travel" (DFW corporate angle) | Informational, hyper-local | Mid | DFW is HQ to Fortune 500s (AT&T, ExxonMobil, American Airlines, Toyota North America, Kimberly-Clark) — content that speaks to corporate travel managers directly |
| "State Fair of Texas / Byron Nelson / Cowboys private jet travel" | Informational, event/seasonal | Mid | DFW-specific event demand spikes, feeds the app's existing sports-calendar feature (`sports-events.json`) |

---

## Tier 4 — National expansion (Phase 2, months 4–9 — do not start before Dallas ranks)

Once Dallas/Fort Worth pages are ranking and the content engine is proven (roughly month 4+, see `07-90-day-execution-plan.md`), replicate the exact page template for the next markets in this order, chosen for HNW/corporate density and charter demand:

1. **Houston, TX** (energy-sector corporate travel, close to Dallas ops base — easiest expansion)
2. **Austin, TX** (tech HQs, SXSW event spikes)
3. **Miami, FL** (international/LatAm gateway, highest ACV market in the US for charter)
4. **Los Angeles, CA / Van Nuys (VNY)** (entertainment industry — already referenced in `layout.tsx` keywords array)
5. **New York, NY / Teterboro (TEB)** (already referenced in `layout.tsx` keywords array — finance HQ density)
6. **Scottsdale/Phoenix, AZ** (seasonal HNW migration, winter demand)

Each city gets: 1 city hub page, 2–4 airport-specific sub-pages, 4–6 route pages to/from the flagship Dallas hub (cross-linking Dallas ↔ new city compounds authority for both), and 3–5 city-specific articles. This is the same production template as Dallas — don't reinvent it per city.

---

## Prioritization summary (what gets built in what order)

1. **Weeks 1–3:** Dallas-Fort Worth hub page + Addison/Love Field/DFW airport sub-pages + Empty Leg Flights page + Corporate Jet Charter Dallas page (Tier 1, the 6 highest-value pages).
2. **Weeks 3–6:** Route pages (Dallas–Aspen, NYC, LA, Cabo, Vail, Miami) + Private Jet Broker positioning page (Tier 1/2 bridge).
3. **Weeks 2–12 (parallel):** 50-article content calendar (Tier 3), 2–3 articles/week, each linking into the Tier 1/2 pages above.
4. **Month 4+:** Tier 4 national expansion, repeating the same template city by city.
