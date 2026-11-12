# DECISIONS

Defaults chosen where the spec left a choice open. Nothing has been purchased. Each can be changed; say so and it is updated here.

| # | Date | Decision | Reason | Reversible |
|---|---|---|---|---|
| 1 | 2026-11-12 | Build on branch `claude/intelligent-mccarthy-9cbrj4` with a commit and stop point per milestone | This session may push to this branch only | Yes |
| 2 | 2026-11-12 | The build spec is canonical for product behaviour. The October site (`fix/production-seo-2026-10-19`) is the source for brand and visual design only | The October site positions EXJET as a broker with cargo, sales and an Avinode widget, which conflicts with the locked B2C membership marketplace | Yes |
| 3 | 2026-11-12 | Brand assets, `BRAND-PACKAGE.md` and `DESIGN-RULES.md` copied from the October branch into `/brand` | `/brand` was empty; these are the founder-approved marks, palette and type | Yes |
| 4 | 2026-11-12 | Type: Libre Caslon Display for marketing headings, Ubuntu for body and all platform UI. Palette: white, #F4F4F4, #16181A, #0B0D0F, grays; black CTA labels; no rounded marketing cards | Latest owner direction in `DESIGN-RULES.md` (24 Oct 2026). Platform keeps the palette with a denser Stripe/TradingView layout | Yes |
| 5 | 2026-11-12 | Legacy April prototype stays at the repo root for now | Seven Vercel projects build the root; deleting it would break them before Vercel root directories can be changed | Yes |
| 6 | 2026-11-12 | Auth: first-party email + password (argon2id), signed session cookie, no auth vendor | Fewer vendors holding UHNW PII; simple RBAC | Yes |
| 7 | 2026-11-12 | Membership billing: Stripe Billing (Checkout + Customer Portal + webhooks) | Standard for SaaS subscriptions; investor-format MRR reporting is straightforward | Yes |
| 8 | 2026-11-12 | KYC: Stripe Identity for document + selfie checks, human final approval in Company OS | Same vendor as billing; supports passport and driver's license. Business (EIN) verification is manual review at launch | Yes |
| 9 | 2026-11-12 | RFQ mail: Gmail API on quotes@exjet.com (send + inbox polling) | Spec names Gmail and the mailbox | Yes |
| 10 | 2026-11-12 | Outreach sending tool: Smartlead, on secondary domains only | Spec default | Yes |
| 11 | 2026-11-12 | Transactional member email (receipts, reminders): same Gmail workspace through `mailer.send()` at launch volume | Avoids another vendor until volume needs it | Yes |
| 12 | 2026-11-12 | Flight tracking: FlightAware AeroAPI | Reliable tail-number lookup for US Part 135; pay per query | Yes |
| 13 | 2026-11-12 | Weather: aviationweather.gov Data API (METAR/TAF) | Free, authoritative, named in spec | Yes |
| 14 | 2026-11-12 | LLM: Anthropic. Router in `config/models.yaml`: strongest tier for C suite and directors, mid tier for staff, fast tier for classification and parsing. Provider behind an interface | Spec. Model IDs are verified against Anthropic docs when the router is implemented | Yes |
| 15 | 2026-11-12 | Job queue: Postgres (`jobs` table, SKIP LOCKED) | Spec default; no extra infrastructure | Yes |
| 16 | 2026-11-12 | API and worker hosting: a container host (Fly.io or Render) with managed Postgres (Neon or the host's own); both Next.js apps on Vercel | The queue worker and inbox polling need a long-running process, which Vercel functions do not provide | Yes |
| 17 | 2026-11-12 | Document storage: S3-compatible private bucket (Cloudflare R2 or AWS S3), server-side encryption, short-lived signed URLs; local disk in dev | KYC documents must never be public | Yes |
| 18 | 2026-11-12 | PII encryption: application-level Fernet per field, key from `EXJET_PII_KEY` | Protects PII even if a database dump leaks | Key rotation needs a re-encrypt job |
| 19 | 2026-11-12 | Payment status: the member marks the operator's link as paid; EXJET does not verify the payment | EXJET does not process flight payments and has no access to operator payment systems | Yes |
| 20 | 2026-11-12 | Fuel-stop matching uses a 1.07 routing factor and a pax-based range reduction; aircraft with missing range or runway data are not offered | Conservative; avoids offering a tail that cannot fly the mission. No data is guessed | Tunable in config |
| 21 | 2026-11-12 | Until founder data arrives in `/data/raw`, development and tests run on synthetic fixtures in `/data/fixtures`, marked `SYNTHETIC` and never loaded outside dev/test | Spec forbids invented operator data; fixtures are test doubles only | Yes |
| 22 | 2026-11-12 | The ARGUS registry scraper on branch `claude/argus-operator-scraping-6nj4bx` is not carried over | Spec: never scrape against site terms; never display the rating source | Yes |

## Open, needs the founder

- Which Vercel project and branch serve exjet.com (needs Vercel team access).
- Enterprise plan terms (inquiry only for now).
- CEO spend threshold value for the approvals config.
- Physical mailing address to print in outreach emails (the October brand package lists 1910 Pacific Ave, Dallas, TX 75201; confirm).
