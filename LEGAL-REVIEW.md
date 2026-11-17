# EXJET legal content — review and implementation notes

Prepared September 11, 2026 from the current source at `exjet-website`, after reading `AGENTS.md`. These are working drafts, not a legal-sufficiency certification. No website source was modified by this task. The source files have not established the actual live vendor configuration or business practices.

## How to use the drafts

- All five JSON entries have `status: "draft"`, `effectiveDate: null`, and a review note. Keep that status visible in review builds. Do not replace it with a fabricated effective date.
- The content is suitable for page layout review while open items are resolved. Full legal review should cover the adopted text and actual workflows together.
- Avoid treating generic footer text as completion of transaction-specific broker duties.
- Keep legal text readable and conspicuous. Compact layout must not mean low contrast, hidden mandatory wording, or an unreadably small size.
- The drafts do not add an arbitration clause, class-action waiver, governing-law selection, limitation of liability, fixed fee schedule, retention period, legal mailing address, no-sale assurance, or an assertion about insurance coverage.

## Verified source behavior

| Surface | Evidence | What the draft can say |
|---|---|---|
| Passenger and group inquiry; main Contact page | `components/QuoteForm.tsx` returns `FlightSearchPanel` for every mode except cargo | Passenger search runs through the hosted flight-search service. |
| Hosted search | `components/AvinodeWidget.tsx`, `integration/avinode/widget.ts` | A same-origin wrapper loads a script and frame from `apps.avinode.com`. It loads automatically when mounted. No consent gate was present in the inspected wrapper. |
| Native cargo form | `components/QuoteForm.tsx` | Asks for route, date, cargo type, name, phone, email, contact preference, and shipment notes. A honeypot is present; it is not a user purpose. |
| Cargo transmission | `app/api/requests/route.ts` | Email via Resend, internal SMS alerts via Twilio, and a webhook are conditional on environment configuration. Do not assert they are currently enabled. Cargo is explicitly excluded from the Avinode REST lead dispatch. |
| Request success | Same API route | It reports success only after a non-SMS configured dispatch succeeds. A success message is not a flight confirmation. It does not establish that every destination or follow-up message succeeded. |
| Network information | Same API route | Reads `x-forwarded-for` for an in-memory request limiter. No log retention period or full host logging inventory was verified. |
| Account | `components/AccountPreview.tsx` | The form prevents default submission, has no fetch or account persistence, and only changes a notice. It currently invites entry of a real-looking password before explaining the preview. This should be made explicit before data entry or replaced with a clear preview/contact state. |
| Analytics and consent | Search of `app`, `components`, `integration`; `app/layout.tsx` | No first-party analytics tag, ad pixel, cookie preference store, or consent manager was found in the inspected application code. This does not establish the behavior of hosting or embedded third parties. |
| Business identity | `data/site.ts` | `legalName` is currently `EXJET`; user instruction identifies EXJET LLC. Align after owner verification. Current general email, phone, and address come from existing configuration; delivery, address validity, and privacy-request handling were not verified. |

## Broker obligations and open business facts

The primary source is [14 CFR Part 295](https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-295), displayed by eCFR as current through September 9, 2026 when checked. Section references below are implementation notes, not complete restatements.

1. Confirm the exact contracting entity and whether EXJET contracts as an indirect air carrier, the charterer's authorized agent, or the operating carrier's authorized agent for each product. A generic assertion of “agent” is insufficient. This task has not selected a capacity.
2. Confirm the actual broker insurance: existence or absence, whom and what it covers, and monetary limits. Do not state “fully insured,” conflate carrier liability insurance with broker insurance, or imply passengers have direct coverage without evidence.
3. Record the operating carrier's corporate name and public-facing names per flight. Check applicable economic and safety authority; do not describe EXJET as FAA-certified to operate aircraft.
4. Implement the §295.24(a) distinction: items (1), (2), and (6) are mandatory before contracting; items (3), (4), and (5) are upon charterer request. Offering clear total pricing routinely is a sensible product choice, but do not misdescribe the particular rule. Item (3) applies where EXJET acts as the charterer's agent.
5. Handle initially unknown details and changes under §295.24(b)–(f); provide required/requested details before transportation begins and timely changes thereafter. Preserve delivery timestamps, versions, and the charterer's response; the reviewed website does not implement this contract workflow.
6. Match cancellation/refund operation to §§295.24 and 295.26. Do not insert a blanket “no refunds,” an operator-refund-first condition, or a newly invented fee. Confirm who takes payment and which processor issues refunds. The draft does not assume a generic airline seven-day rule for every payment.
7. Passenger-charter rules must not be presented as the complete cargo compliance framework. Obtain a separate review for cargo brokerage, the services EXJET actually arranges, carrier authority, dangerous goods and other relevant shipment conditions. Do not sell individual passenger seats under a whole-aircraft/single-entity assumption.
8. Review all public commercial statements, including membership pricing, “24/7” response, empty-leg availability, operator/rating assertions, aircraft availability, sales prices, and photographs. Model imagery must not imply a binding offer of that aircraft or cabin.

Suggested concise disclosure for charter marketing surfaces:

> EXJET LLC is an air charter broker, not a direct air carrier, and does not exercise operational control of aircraft. Advertised air transportation is provided by a properly licensed direct air carrier or direct foreign air carrier.

Placement must satisfy [§295.23](https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-295#p-295.23). It should be conspicuous on relevant solicitation pages and requests, with the fuller policies linked nearby or in the footer. Do not imply that a single hidden footer paragraph necessarily meets the rule on every page.

## Privacy and cookies — facts to confirm

- Inventory the live production host, CDN, access/error logs, Avinode and its downstream providers, reCAPTCHA if used, email delivery, internal SMS, webhook/CRM destination, payment tools, and offline business records. Source code alone cannot prove the live inventory.
- Perform a real browser network and storage inspection before and after loading search and making the relevant choices. Record each identifier/provider, purpose, type, lifetime, and domain. No actual inquiry should be submitted without the user's authorization for that external communication.
- Determine whether any disclosure or advertising arrangement is a legal “sale” or “sharing,” not only whether money is exchanged. The old policy's “does not sell for monetary consideration” statement was not adopted.
- Confirm state-law scope and relevant non-U.S. audiences. Texas residence of the business does not settle every visitor's rights. Texas's small-business exemption is conditional and does not justify a blanket exemption claim. See [Texas AG guidance](https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint/consumer-privacy-rights/texas-data-privacy-and-security-act).
- Confirm the privacy mailbox and responsible person, request verification, response deadlines, appeal process, complaint information, opt-out handling, and any required universal opt-out signal. The draft's Contact-page route is an interim route to existing published contact details, not evidence those operational processes exist.
- Confirm whether sensitive traveler information, children’s information, precise location, accessibility/health details, or passport data is collected elsewhere. Limit the general inquiry form; arrange an appropriate channel and any required consent before collecting sensitive details.
- Confirm security safeguards, record retention and deletion by category, provider contracts, subprocessors, international transfers, incident procedures, and access controls. The draft deliberately does not claim verified encryption-at-rest, certifications, a fixed retention schedule, or immunity from breaches.
- Request-related contact preference is not marketing consent. Confirm actual email/SMS marketing practices separately; do not preselect unrelated marketing permission.
- The current automatically loaded third-party search has no verified consent gate. Assess what consent or other choice is actually required for the deployed technologies and jurisdictions. A decorative cookie banner or switch that does not affect requests would be misleading.
- Sources: [FTC data-security guidance](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business), [FTC tracking guidance](https://consumer.ftc.gov/articles/how-websites-and-apps-collect-and-use-your-information).

## Draft count and route intent

`privacy`, `terms`, `charter-terms`, `cancellation-refunds`, `cookies`.

No refund processor, cookie manager, sign-in system, consent mechanism, or legal review workflow was implemented in this task. Parent task owns website integration and storage of these deliverables with the completed project.
