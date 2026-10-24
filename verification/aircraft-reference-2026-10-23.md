# Aircraft reference expansion — 23 October 2026

The Citation Longitude now has an exact-model profile, original manufacturer flight photography, the previously verified manufacturer cabin photograph, published specifications, and three selectable manufacturer floor plans (standard, aft couch, side-facing seat).

The catalogue and client-workspace comparison receive small summaries from the same model reference data. Published range, cabin dimensions and available baggage figures are shown for Citation Latitude, Citation Longitude, Global 8000 and Falcon 900LX, with manufacturer links and operating assumptions. Missing data remains explicitly unconfirmed.

The reference sections include direct navigation links. Portrait floor plans retain their source files and display at a readable scale on narrow screens. The photography guard now rejects floor plans associated with the wrong model or recorded dimensions.

## Verification

- Production build and TypeScript: passed.
- ESLint and git diff whitespace checks: passed.
- Production SEO audit: 232 public HTML pages, 220 indexable, zero issues, sitemap parity confirmed.
- Photography guard: 33 approved assets match recorded hashes; all five floor-plan files match their model and dimension records.
- Browser: the aircraft catalogue and four reference pages checked at 320, 390 and 768 pixels (15 page/width combinations), with no page overflow.
- Desktop: three-aircraft comparison, disabled fourth selection, and manufacturer figures verified.
- Mobile: layout switching, 48px black-label layout buttons, comparison selection/removal/clearing and search filtering verified.
- A hidden screen-reader label initially escaped the scrolling comparison container at 320px. Adding a positioned scroll container fixed the overflow; retest measured 320px page width at a 320px viewport.
- Longitude exterior and interior rendering verified. Full-size floor-plan URL changes with the selected layout.
- Navbar component, logo files and Avinode integration have no changes. Booking submission was not exercised.
- Screenshot: longitude-desktop-2026-10-23.jpg (local verified preview).

## Sources and limits

https://cessna.txtav.com/en/citation/longitude provides the model specifications, cabin options, gallery and social photograph. Original asset URLs, file sizes and hashes are in PHOTO-SOURCES.json. The official media kit at https://media.txtav.com/assets/225549/ supplies the 1000 × 667 exterior image (97,675 bytes). Next.js serves responsive optimized versions to page visitors. Source files were not edited. Manufacturer provenance does not establish commercial publication permission, which remains unverified as recorded in the manifest.

This update adds one model profile; remaining catalogue models without complete manufacturer references or floor plans are not represented as complete.
