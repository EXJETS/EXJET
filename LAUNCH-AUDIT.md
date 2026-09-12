# EXJET launch audit notes

## Confirmed public facts used

- Primary public phone: `+1 407 747 5288`
- Operating address: `1910 Pacific Ave, Dallas, TX 75201`
- Operator safety resources referenced during sourcing: ARGUS and WYVERN
- Founders: two pilots
- Published credential for one founder: Commercial Pilot Certificate
- Published type ratings for one founder: CE-650 and CL-65
- Client response expectation: shortly; urgent requests are directed to call

ARGUS and WYVERN are described as operator-safety resources that may be considered during trip-specific sourcing. The site does not state that EXJET itself holds an ARGUS or WYVERN certification or rating.

## Open inputs required before stronger claims are published

- `TODO:OPERATOR_CERTIFICATE_CRITERIA` — exact operating-authority requirements EXJET applies beyond using a licensed third-party air carrier.
- `TODO:MINIMUM_INSURANCE_LIMITS` — required liability limits and how they vary by mission or aircraft.
- `TODO:PILOT_EXPERIENCE_MINIMUMS` — minimum crew total time, time in type, recency, or other thresholds.
- `TODO:AIRCRAFT_MAINTENANCE_CRITERIA` — maintenance status, age, inspection, or program criteria.
- `TODO:FOUNDERS_YEARS_IN_AVIATION` — exact experience for each founder, only if EXJET wants it published.
- `TODO:FOUNDERS_AIRCRAFT_FLOWN` — exact list for each founder, separate from type ratings, only if EXJET wants it published.
- `TODO:FOUNDERS_TRANSACTION_EXPERIENCE` — exact, substantiated wording for each founder only.

These TODOs are documentation-only and are not rendered as public placeholder copy.

## Metadata and indexing behavior

- `NEXT_PUBLIC_SITE_URL` is the single public-origin setting.
- When it is exactly `https://exjet.com`, pages emit index/follow and production canonicals.
- Preview and staging origins emit noindex/nofollow and use their configured deployment origin for canonicals.
- `/account` remains noindex even in production because it is a client portal surface.

## Quote delivery status

The form posts to `/api/requests` and can deliver through Resend, a durable webhook/CRM, and approved Avinode integration. Twilio can add instant internal SMS alerts. A request returns a success reference only when at least one durable delivery provider succeeds. With no production delivery environment configured, the route intentionally returns a controlled `503` instead of showing a false success.

Production intake requires at least one of:

- `RESEND_API_KEY` with verified sender domain, or
- `LEAD_WEBHOOK_URL` for a durable approved destination, or
- approved, rotated Avinode credentials and live enablement.

Recommended launch configuration is Resend for desk + client email, Twilio for team SMS, then Avinode after API/use-case approval.

## Route audit

- Canonical aircraft route pattern: `/aircraft/[slug]/`
- Legacy `/citation-latitude/` redirects with HTTP 301 to `/aircraft/citation-latitude/`
- All eight aircraft records generate detail routes and are linked from the aircraft category page.
- Category examples without detail records are displayed as non-links; they are not broken routes.
- All four sales records generate detail routes and are linked from the sales page.
- No generated aircraft or sales detail route is orphaned.
- Turboprops are intentionally excluded because EXJET does not offer them.

## Aircraft asset status

Every generated aircraft detail page has a local image path in `public/images/aircraft`. No external aircraft image is hotlinked and no required image path is currently missing.

## Deliberate deviation from the first audit

The homepage was not expanded into six aircraft cards and no turboprop was added. EXJET is a broker rather than a fixed-fleet operator, and the owner explicitly confirmed that EXJET does not offer turboprops. The dedicated aircraft page communicates category breadth while the homepage remains focused on RFQ conversion.
