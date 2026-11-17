# Homepage and navigation layout review — 22 October 2026

## Scope

Refine the restored EXJET design, consolidate Avinode on `/charter/`, and improve phone layouts. Keep the original navbar artwork, Ubuntu typography, monochrome palette and approved photography. No changes to API routes, Avinode integration, widget code or vendor styling.

## Reference observations

Reviewed the public desktop homepages and navigation of flyxo.com, vistajet.com/en-us and flexjet.com/en-us in the browser. Their useful common principles are a focused primary navigation, a clear hero action, aligned content gutters and distinct editorial sections. Applied those organizational principles to EXJET's existing identity; did not copy their assets or claim that their mobile layouts were tested.

## Resolved findings

- Homepage embedded a full booking interface before the services. Removed it and routed the primary actions to Find a Flight.
- Contact, group charter and legacy app search repeated the same widget. Replaced these with a shared flight-search link panel. Retained the saved-trip planner and contact preference flow. Cargo's separate request form is unchanged.
- The mobile header exposed four competing icon actions. It now presents the existing logo, Find a Flight and menu; phone, site search and support remain available in the menu.
- Navigation was a long list on phones. Four native disclosure groups now organize services, flight planning, resources and company information, with a desktop column layout.
- The homepage repeated several large content collections. Replaced them with focused audience cards and planning links. All destination pages remain intact.
- Service cards were excessively tall on phones; the homepage variant now uses compact icon-and-title rows. Desktop cards retain descriptions. Aircraft cards use two columns where space permits. Experience imagery and copy share a desktop row and stack on phones.
- Fixed a global CSS height conflict so the new header's content stays within its sticky surface.

## Verification

- `npm run build`, TypeScript build checks and `npm run lint`: passed.
- Approved photography integrity: all 25 files match recorded hashes.
- `python3 scripts/verify-seo.py preview`: passed for 143 static HTML pages, all 62 original routes and 131 sitemap entries. Preview noindex remains intentional; production SEO configuration was not changed.
- Homepage: no horizontal overflow at 320, 390, 768 and 1363 CSS pixels. No embedded frames. At 390px the page is approximately 6,148px tall, down from approximately 11,794px before this update.
- Find a Flight: loaded the vendor form at 320px and 390px. At 320px both the outer page and vendor form have matching client/scroll widths (320px and 286px respectively).
- Contact at 320px; group charter, aircraft, services, executive assistants, family offices and legacy app search at 390px: rendered headings confirmed, no horizontal overflow or embedded frames.
- Mobile disclosure opening, native dialog Escape close, desktop menu, and Citation Latitude Interior photo selection: checked in the browser.
- Source diff confirms no changes to `app/api`, `integration`, `AvinodeWidget`, `FlightSearchPanel`, or `QuoteForm`.
- No flight searches, quote requests, contact messages or bookings were submitted. Browser checks cover representative shared layouts, not a claim of full accessibility conformance or every possible device.
