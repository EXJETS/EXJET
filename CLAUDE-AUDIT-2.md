# EXJET launch candidate - Audit #2

Audit the deployed EXJET candidate at:

`https://exjet-website-ppu6jfwzx-ex-7051.vercel.app/`

This is a **noindex Vercel preview**, not the indexed production domain. Treat the preview origin as intentional. The production domain will be `https://exjet.com` and is not being pointed at this build until intake delivery is configured and the candidate passes review.

## Scope

Perform an adversarial, evidence-based launch audit. Do not redesign the site or propose subjective visual changes unless they cause a concrete usability, accessibility, mobile, conversion, performance, or trust problem. Test the implementation that is actually deployed rather than assuming the earlier audit still describes it.

Check at minimum:

1. Every public route, navigation link, footer link, homepage inline link, aircraft detail route, and aircraft-sales detail route.
2. The permanent redirect from `/citation-latitude/` to `/aircraft/citation-latitude/`.
3. Unique titles, meta descriptions, canonicals, Open Graph titles, Twitter titles, robots directives, sitemap entries, and structured data.
4. Preview indexing safety: every preview page should be `noindex, nofollow` with a self-referencing preview canonical. Production behavior is gated by `NEXT_PUBLIC_SITE_URL=https://exjet.com`.
5. Desktop at 1920x1080 and mobile at 390x844, including the home hero crop, RFQ above the fold, horizontal overflow, image fit, and the mobile menu's ability to expose all navigation/account actions.
6. RFQ validation: city/airport/IATA/ICAO text, no past dates, 1-100 passengers, passenger counts above 18 routed to group charter, broker disclosure, and failure behavior when delivery is not configured.
7. Whether the API ever shows a false success. It should issue a success reference only after a durable provider succeeds; without delivery configuration it should return a controlled 503 with call/email fallback.
8. Accessibility: headings, labels, focus order, keyboard navigation, menu behavior, contrast, reduced motion, link purpose, and form errors.
9. Performance and Core Web Vitals risks, especially image payloads, hero rendering, layout shift, font loading, and unnecessary client JavaScript.
10. Legal/trust language. Flag any statement that implies EXJET itself is ARGUS- or WYVERN-certified. Current intent is only that available ARGUS and WYVERN **operator safety data may be considered** during trip-specific sourcing.
11. Any remaining hardcoded contact information outside the central config, broken images, external hotlinks, unlinked generated pages, or linked nonexistent pages.
12. Security and abuse resistance of `/api/requests/` and `/api/airports/`, without submitting a real request or sending data to a third party.

## Confirmed facts

- Primary phone: `+1 407 747 5288`
- Operating address: `1910 Pacific Ave, Dallas, TX 75201`
- Public emails: `sales@exjet.com`, `charter@exjet.com`, `cargo@exjet.com`
- Pilot credential allowed for publication: Commercial Pilot Certificate
- Type ratings allowed for publication: CE-650 and CL-65
- Response expectation: `shortly`; urgent requests should call
- EXJET does not offer turboprops
- EXJET arranges charter as a broker; licensed third-party air carriers operate flights and retain operational control

## Claims that are intentionally not published

Do not recommend filling these with guesses. They still require owner-supplied criteria:

- Exact operator certificate criteria beyond arranging with licensed third-party carriers
- Minimum insurance liability limits
- Pilot experience minimums
- Aircraft age/maintenance criteria
- Each founder's years in aviation, aircraft flown, and transaction history
- A claim that EXJET itself holds an ARGUS or WYVERN certification/rating

## Known launch gate

The intake handler is implemented but no durable provider is configured in this preview. Launch requires at least one of:

- Resend with a verified EXJET sender domain,
- an approved durable webhook/CRM destination, or
- rotated, approved live Avinode credentials.

Twilio SMS is an optional internal alert and does not count as durable lead storage.

## Required response format

Return only actionable findings, ordered by severity:

- **P0** - blocks launch, loses leads, creates legal exposure, or makes a core flow unusable
- **P1** - serious conversion, SEO, accessibility, performance, or trust defect
- **P2** - worthwhile post-launch correction

For every finding include the exact URL, reproducible evidence, expected behavior, and the smallest safe fix. Then include:

1. A route/link matrix with status codes.
2. A metadata matrix with title, description, canonical, robots, `og:title`, and `twitter:title`.
3. Desktop and mobile findings separately.
4. A final verdict: `BLOCKED`, `CONDITIONALLY READY`, or `READY`, with the precise launch gates.

Do not repeat resolved items from Audit #1 without fresh evidence. Do not invent facts, certifications, safety minimums, aircraft specifications, or business credentials.
