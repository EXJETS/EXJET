# EXJET full website design review

Date: 11 September 2026. Scope: shared navigation and all 27 existing page routes, reviewed as a mobile website at 390 CSS pixels. A desktop homepage view is included. Deployment remains paused.

## Reference and evidence

The supplied Apple mobile screenshot is the navbar reference. The live Apple.com desktop navbar was previously measured at 44 CSS pixels. EXJET's updated header was compared against the supplied reference in EXJET-Navbar-Comparison.jpg, which includes the previous implementation and the corrected version in one image. The source phone header is normalized to the same width; Safari chrome is excluded. EXJET intentionally retains its original guide artwork, Ubuntu typography, and neutral palette.

EXJET-All-Pages.html and EXJET-Page-Images.zip contain all 27 full-length mobile page images, a desktop homepage, and the navbar comparison. Full mobile images are assembled from real browser screenshots at recorded scroll offsets. The 390 × 844 iframe is cropped from the browser canvas. Subsequent frames omit the repeated 44px sticky header; overlapping content is aligned using the actual scroll offset. No page pixels or missing content were reconstructed. Each page's opening, middle, and bottom excerpts were inspected. Initial blank or partially painted captures were rejected and replaced.

## Findings resolved

- P2: the navbar booking pill and larger logo made the header visually heavy. It now uses a small guide logo, 20px lightweight icons, 44px touch targets, and one 44px row.
- P2: inherited white text and excessive height made sales introductions unreadable on the new light surface. Text colors, spacing, and minimum height were corrected.
- P2: hidden decorative indices left aircraft model names in a narrow grid column. Model rows now use the available width.
- P2: the cargo list retained a narrow index column, overlapping model headings and descriptions. The cards now stack their content correctly.
- P2: sales detail notes touched the viewport edges. They now share the page gutters.
- P2: exterior photographs could crop parts of aircraft. Verified exterior media now uses contain fitting.
- Capture reliability: some screenshots were taken before client content painted. Accepted replacements were checked visually after settling.

No actionable P0, P1, or P2 visual findings remain in these reviewed states. This is a design acceptance result, not production or integration acceptance.

## Verification

- All 27 routes loaded and had no horizontal document overflow at 390px during the route audit.
- Menu opening/closing, search navigation, FAQ expansion, and the Challenger 350 Interior selection were verified in the cloud browser. The selected interior points to the official Challenger 350 cabin asset.
- The Avinode search form visibly loaded on charter/contact captures. No search or quote request was submitted.
- `npm run build` passed, including TypeScript and generation of all routes.
- `npm run lint` passed.
- Recent browser error logs contained extension metadata errors; no application error was present in the inspected log window.

## Limits and next decisions

- The account page is a preview; no real sign-in or widget-to-management synchronization is established by this work.
- Membership promises, aircraft specifications, sale/lease status, and prices are retained content requiring owner review. This pass does not verify commercial claims.
- Global 8000 has no verified photograph; G650 and Falcon 900LX currently have interior-only media; Citation X has exterior-only media. Sales and cargo pages use text where verified matching photographs were unavailable.
- The image review shows default page states at 390px. It is not an exhaustive accessibility audit, every menu state, or a complete desktop route audit.
- Source and image permission details are in PHOTO-SOURCES.json. No deployment was performed.

final result: passed
