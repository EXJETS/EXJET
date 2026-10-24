# EXJET public-site design QA

Review date: 24 October 2026. Baseline: production commit `6044594daa0ecc55ed2a7928eb8b58d126853c3f`. Scope: public-site visual redesign, replacement photography and removal of public source displays and gallery counters.

## Visual comparison

Reference and before/after captures are saved in `verification/`.

| Surface | Implemented result | Intentional EXJET treatment |
| --- | --- | --- |
| Page structure | Large photographic opening, spacious editorial chapters, alternating white/platinum sections and dark closing contact block | Original navbar and logo preserved |
| Typography | Large display headings, restrained small labels and readable body copy | Locally hosted display serif paired with existing Ubuntu body text |
| Photography | Full-width flight and cabin photography, large catalogue cards, interactive model selection | Only original images from the four owner-approved manufacturer sites; no embedded gallery UI |
| Spacing and alignment | Wide desktop gutters, chapter rules, generous section spacing and stacked mobile layouts | Existing navigation dimensions and black CTA labels retained |
| Components and interactions | Fly/Own/Operate services, model and cabin selection, comparisons and named floor-plan buttons | Existing Avinode integration and booking routes preserved |

## Photography and visible content

- Removed all 28 photographs from the baseline manifest. Added 20 different manufacturer photographs; retained five exact-model floor plans.
- All 25 packaged assets were visually inspected and match their recorded original-byte hashes. The build guard restricts both page and image URLs to the four approved manufacturer hosts.
- No visible photo credits, source lists, manufacturer reference links or numeric gallery counters remain in the edited public components.
- Five aircraft profiles have no approved exact-model replacement photograph and render text without substitute photos or placeholder canvases.
- New asset paths prevent reuse of the retired image cache, including the Falcon 900LX exterior.

## Browser verification

- Desktop homepage, services catalogue, charter service chapters, aircraft catalogue/detail and footer were visually inspected.
- Thirty route/viewport combinations were checked across 320, 390 and 768 CSS pixels: home, services, aircraft charter, MRO, aircraft catalogue, Longitude detail, charter search, contact, sales and travel journal. Settled documents had no horizontal overflow. A premature sales measurement was repeated after its styles loaded and passed.
- Mobile navigation opened and closed. Fly, Own and Operate panels displayed their corresponding services. The Falcon 900LX model selector and Interior control loaded the correct replacement cabin image.
- Longitude Interior selection and the Aft couch and Side-facing seat floor-plan buttons changed the displayed media correctly. Global 8000/Longitude comparison showed the two aircraft's values without a source row.
- Avinode's embedded form visibly loaded with One way, Round trip, From, To and Search controls. No booking/search submission was made.
- Homepage CTA text computed to black. Navbar, original logo artwork and Avinode implementation files are unchanged.

## Iterations and limits

- Fixed the tablet hero crop by placing its heading above the photograph and retaining the complete aircraft. Final 768px screenshot and document-width measurement passed.
- Rejected an unreliable full-page capture with unpainted image regions; accepted evidence uses settled viewport captures. Reviewed the page in sections.
- Historical development logs contained an earlier resolved stylesheet import error and browser-extension metadata/hydration noise. No functional application failure was observed in the reviewed final interactions.
- This is not an exhaustive accessibility audit or a real booking transaction test. Protected Vercel preview URLs are not part of browser acceptance; local visual verification, deployment build status and public production checks are used.

## Release checks

Final production build, lint and photography guard passed. SEO verification passed with 232 public pages, 220 indexable pages and zero issues. An initial local build used preview indexing rules; rebuilding with `VERCEL_ENV=production` verified the production crawler policy. No code change was needed for that environment distinction.

Final visual result: passed for the reviewed surfaces and states.
