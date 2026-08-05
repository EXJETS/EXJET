# EXJET Conversion Optimization — Quotes, Calls, and HNW/Corporate Trust

Grounded in the actual current UI (`page.tsx`, `navbar.tsx`, `footer.tsx`, `jets/[id]/page.tsx`) — this is not generic CRO advice, it's specific to what's on the page today.

## 1. The biggest conversion gap: there is no phone number anywhere

Confirmed across `navbar.tsx`, `footer.tsx`, `page.tsx`, and `layout.tsx` — zero instances of a phone number or `tel:` link on the entire site. For a $10K–$250K+ purchase decision, a huge share of HNW and corporate buyers want to **talk to a human before they submit any form**, especially on a first visit to an unfamiliar brand. Right now that path doesn't exist.

**Fix:**
- Add a persistent phone number in the navbar (`navbar.tsx:69-81`, next to or replacing part of the "Reserve" pill on desktop) — format as a `tel:` link so mobile visitors can tap-to-call directly.
- Add "Or call [number], 24/7" as a secondary CTA line under every primary "Reserve"/"Begin a search" button sitewide (hero, closing CTA section at `page.tsx:404-418`, every future service/location page per the template in `03-site-architecture-sitemap.md`).
- Staff it — a phone number that rings to voicemail after 6pm undermines the "24/7 concierge" claim already made in copy (`page.tsx:145` "Live trip specialists, never automated phone trees") the moment someone tests it.

## 2. CTA placement audit (current state → fix)

| Location | Current state | Fix |
|---|---|---|
| Navbar | Single "Reserve" pill → `/search` (`navbar.tsx:70-80`) | Keep, but this sends every visitor into the transactional search flow immediately — add a secondary, smaller "Talk to a specialist" text link next to it for visitors who aren't ready to self-serve a route search yet |
| Hero | Search bar only (`page.tsx:104-106`) | Good primary CTA for a returning/high-intent visitor. Add a one-line secondary path directly beneath it: "Not sure where to start? Call [number] or request a callback" — first-time HNW visitors often don't know origin/destination airport codes and will bounce rather than guess |
| Mid-page sections (Collection, Routes, Empty Legs, News, Events) | No CTA at all except implicit card links (`page.tsx:118-331`) | Each section should end with a light-touch CTA line, not just card clicks — e.g. after "The Collection" section: "Have a specific aircraft in mind? Request it." linking to a general quote form, not only the search tool |
| Closing CTA section | Two buttons: "Begin a search" and "View empty legs" (`page.tsx:404-418`) | Both push to on-page anchors (`#popular-routes`, `#empty-legs`), not an actual conversion action — for visitors who've scrolled this far (high engagement), anchor-scrolling them back up is a wasted moment. Replace or add a direct "Request a Quote" button here that opens a short form (route, date, passengers, contact) rather than routing back into the search UI |
| Jet detail pages | No visible quote/CTA button in the reviewed portion of `jets/[id]/page.tsx` (only "Back to all jets") | This is the highest-intent page type on the site (someone looking at a specific aircraft) and needs a sticky/persistent "Request this aircraft" CTA, ideally sticky on scroll on mobile, with the aircraft's `hourlyRate`/`basePrice` (already in `jets.json`) shown next to it for pricing transparency |
| Footer | Zero CTA — footer is purely navigational (`footer.tsx`) | Add a compact "Ready to fly? [Request a Quote] or call [number]" bar directly above the footer's legal strip — footers get disproportionate scroll-depth attention from engaged researchers |

## 3. Copy improvements

The existing editorial/luxury voice ("An invitation to travel without compromise," "The world, one cabin away") is genuinely strong brand writing — don't flatten it into generic conversion-bro copy. The fix is **adding** conversion clarity around the existing voice, not replacing it:

1. **Quantify the "confirmed in under 4 hours" claim everywhere it appears** (currently in hero copy `page.tsx:99` and hero KPI band `page.tsx:112`) — this is EXJET's strongest differentiator against slower brokers and against the "how long does this take" anxiety of a first-time charterer. It should also appear near every CTA, not just in the hero.
2. **Make "no membership, pay per flight" more prominent** (currently a single Hallmark item, `page.tsx:152-155`) — this is the direct answer to "how is this different from NetJets/Wheels Up," which is the #1 comparison question in this category (see Article #34 in the content plan). Surface it in the meta description and above-the-fold hero area, not just a mid-page card.
3. **Add a "Why EXJET" trust paragraph near the top of the homepage**, not only the mid-page "Collection" section (`page.tsx:119-159`) — first-time visitors decide credibility in seconds; ARGUS Platinum/Wyvern Wingman/pilot vetting is currently 1.5 scrolls down.
4. **Dallas-specific proof line for the local push**: once the local page ships, the homepage itself should carry one sentence acknowledging the Dallas base ("Based in Dallas–Fort Worth, flying clients worldwide") — this simultaneously helps local relevance (audit doc §5) and reassures visitors this isn't a faceless global aggregator.
5. **Corporate-specific copy path.** Nothing on the current homepage speaks to a travel manager/corporate buyer distinctly from an individual HNW leisure traveler — these are different buyers with different objections (a travel manager cares about billing/duty-of-care/reporting, not "invitation to travel without compromise"). Add a homepage module or a dedicated nav path ("For Business") pointing corporate visitors straight to `/corporate-jet-charter/dallas`.

## 4. Trust signals

**What's already working:** ARGUS Platinum / Wyvern Wingman badges (`page.tsx:140-144`), "5,000+ airports / 2,400+ tails / <4hr / ARGUS Platinum" KPI band (`page.tsx:109-114`) — keep and expand these, they're doing real work.

**What's missing and matters most for this buyer:**

1. **Real reviews, visible on the homepage and on service/location pages** — not just the hardcoded, identical four testimonials currently duplicated across every jet detail page (`jets/[id]/page.tsx:12-29`, flagged as a schema risk in the technical audit too). Once the review pipeline from `04-local-seo-gbp-strategy.md` is live, surface a rotating set of *real, attributed* Google/Trustpilot reviews on the homepage.
2. **Named leadership/team presence.** Zero "About"/team content exists (the page is a 404 today). For a purchase this size, HNW and corporate buyers routinely look up who's actually behind the company before they call. A real About page with founders/leadership (even brief bios) measurably increases trust-to-call conversion in high-ticket B2C/B2B categories.
3. **Third-party press/media mentions.** Currently none referenced anywhere. Even 2-3 "As seen in" logos (achievable via the digital-PR angle on Article #50 in the content plan) meaningfully lift perceived legitimacy for a brand without decades of history.
4. **Security/privacy language for HNW clients specifically.** Nothing on the site currently addresses discretion/confidentiality — a real concern for this audience (executives, celebrities, family offices). A single trust line ("Every booking is handled with full discretion — no passenger manifests shared beyond what's operationally required") costs nothing and directly answers an unstated objection.
5. **Certifications/insurance disclosure.** Corporate travel managers specifically will ask about liability insurance minimums per aircraft/operator — worth a line item on the `/safety` page (once built) even if the detail is "ask your specialist," since it signals the company is sophisticated enough to expect the question.
6. **Live/visible response proof.** Since the brand promises "Live trip specialists, never automated phone trees" (`page.tsx:145-146`), consider a visible average-response-time stat once you have real data (e.g., "Avg. quote response: 11 minutes") — specific, believable numbers convert better than the claim alone.

## 5. Luxury branding suggestions

The existing design system (serif display type, champagne/ink/ivory palette, editorial "chapter" numbering I–VI through the homepage sections, restrained mono-uppercase labels) is already doing legitimate luxury-brand work — this is not a template that needs a redesign. Refinements:

1. **Photography is the biggest lever left on the table.** The current build references stock-pattern image paths (`/jets/light-1.jpg` etc. in `jets.json`) — for a luxury brand, real, consistent, high-production photography (cabin interiors, tarmac/golden-hour exteriors, DFW-specific imagery like Addison's ramp) will outperform any copy change. Budget for a proper aircraft/lifestyle photo shoot before scaling content, since every new location and service page needs imagery that matches this bar.
2. **Extend the "chapter" editorial device to new pages.** The homepage's Roman-numeral section device (I · The Collection, II · Popular routes, etc. — `page.tsx:122`, `168`) is a distinctive, ownable brand pattern. Carry it onto service/location pages so the whole site feels like one authored piece, not a homepage plus bolted-on landing pages.
3. **Corporate sub-brand tone, same visual system.** For the corporate/travel-manager path, keep the visual language identical but shift copy register slightly toward precision and reliability language over pure editorial romance — luxury and corporate-competence aren't visually different, they're verbally different.
4. **Empty legs shouldn't feel "discount."** "Up to 75% off" (`page.tsx:196`) is accurate and a real selling point, but for a luxury brand, frame savings language carefully everywhere it appears (including new Article #19-24 content) — pair every discount mention with a scarcity/curation frame ("limited, live inventory," not "deals" or "sale") to avoid undercutting the premium positioning elsewhere on the site.

## 6. Form/quote-flow specific recommendations

- The current path to a "quote" is entirely through `/search` → aircraft selection → booking flow. That's appropriate for a self-serve, high-intent user, but there is no lightweight, low-commitment quote request option ("just tell us your trip, we'll call you") for a visitor who isn't ready to browse the full fleet. Add a short-form quote request (origin, destination, date, passengers, name, phone) reachable from every CTA identified in §2 — this is the single highest-leverage net-new conversion path missing from the site today.
- For corporate visitors specifically, add a distinct "Request Corporate Account Info" form separate from the individual trip-quote form — different intent, different qualifying questions (company name, estimated annual flight hours, number of travelers).
