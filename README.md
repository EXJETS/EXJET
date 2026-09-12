# EXJET Website

Production-oriented Next.js website for EXJET, a Dallas-based private aviation brokerage.

## Included experience

- Mobile-first passenger, group, and cargo charter request paths
- Aircraft category guide with model examples and aircraft detail pages
- Empty-leg discovery interface prepared for a verified production inventory feed
- Aircraft sales inventory with individual listing and acquisition-detail pages
- Four-tier membership presentation
- About, Why EXJET, FAQ, contact, privacy, and website-terms pages
- Returning-client portal concept for saved profiles, trip history, agreements, and invoices
- Canonical metadata, XML sitemap, robots directives, JSON-LD, social metadata, `llms.txt`, web manifest, and a custom 404 page
- Responsive EXJET brand system, email-signature template, and print-ready business-card template

## Business language

- EXJET arranges charter flights as a broker.
- Flights are operated by licensed third-party air carriers.
- Aircraft ownership, amenities, Wi-Fi, availability, range, and configuration are verified for each mission.
- The Citation Latitude is coming soon to EXJET management. Final operating and configuration details remain subject to confirmation.

## Contact routing

- Passenger and group charter: `charter@exjet.com`
- Cargo charter: `cargo@exjet.com`
- Aircraft sales and general: `sales@exjet.com`
- Primary phone: `+1 407-747-5288`
- Alternate phone: `+1 407-624-9708`
- Address: `1910 Pacific Ave, Dallas, TX 75201`

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

The project currently uses `output: "export"` and produces a static deployment in `out/`.

## Production integrations still required

### Quote delivery

The current request experience validates the form and prepares a structured email for the correct EXJET desk. Before accepting public traffic, connect the form to a reviewed server-side lead endpoint, add spam protection and rate limiting, and verify end-to-end delivery. The typed charter lead boundary is documented under `integration/`.

### Client accounts

`/account` is a no-index experience preview. Authentication and customer data are intentionally disabled. The security and data handoff is documented in `integration/account/README.md`.

### Social feed

The public site links to EXJET's official social profiles without loading third-party tracking scripts. A server-cached Instagram feed can be added later using the handoff in `integration/instagram/README.md`.

## Content and media

Aircraft content is defined in `data/aircraft.ts`, category guidance in `data/aircraftCategories.ts`, sales inventory in `data/sales.ts`, and membership tiers in `data/membership.ts`.

Exact image dimensions, filenames, and production prompts are in `IMAGE-PRODUCTION-BRIEF.md`. Brand usage and reusable collateral are in `BRAND-PACKAGE.md` and `public/brand/`.

## Launch checklist

- Connect and test the server-side quote endpoint.
- Confirm every published claim, aircraft listing, price, tier, phone label, and legal disclosure.
- Have aviation counsel review the privacy policy, website terms, membership terms, and charter language.
- Configure the canonical production domain and permanent redirect for the alternate host.
- Submit the sitemap to Google Search Console and Bing Webmaster Tools.
- Configure analytics and conversion events without logging sensitive itinerary data.
- Run `npm run lint` and `npm run build` after the final content freeze.
- Follow `SEO-LAUNCH-PLAYBOOK.md` for launch and ongoing authority building.
