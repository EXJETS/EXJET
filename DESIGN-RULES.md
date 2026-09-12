# Latest photography update

See PHOTO-UPDATE.md for six additions across all five formerly empty aircraft pages. Official manufacturer media services are now supported through exact source/asset pairs. The Challenger 300 has one explicitly disclosed manufacturer-credited archival fallback for review; do not describe it as a download from bombardier.com. No deployment or updated browser page captures were performed. The historical notes below predate this update.

# Current authority — 12 September 2026

HANDOFF.md, DESIGN-REFERENCES.md, PHOTO-PLACEMENTS.md and PHOTO-SOURCES.json describe the current 57-page build and 19-image selection. The notes below are a chronological design record; earlier image counts and removed-image descriptions are superseded. Navbar remains unchanged in the latest pass.

# EXJET design system — review build

This implementation translates the user's Apple navbar reference into EXJET's own identity. It is an undeployed design review.

- **Navigation:** one 44px row; user-supplied `152BBB90-4C79-4050-8825-34294467405E.png` used unchanged as `public/brand/exjet-navbar-logo.png` in both the navbar and open menu. The 36 × 36px transparent canvas displays the mark at approximately 31 × 17px within a 46 × 44px home link. Use 20px Phosphor search, account, and two-line menu icons inside 44px controls. The booking pill has been removed from the navbar. The menu is a native modal dialog.
- **Typography:** self-hosted Ubuntu Light, Regular, and Medium from the supplied flight guide. Desktop display headings are generally 64px; mobile page headings are 32–42px and body text remains 16px. EXJET does not bundle Apple's SF Pro fonts.
- **Color:** white, neutral light gray #F4F4F4, ink #16181A, charcoal #0B0D0F, secondary text #5E646A, platinum and silver accents. The shared header uses restrained translucency.
- **Layout:** centered page introductions, concise primary actions, photography below aircraft names, quiet section backgrounds, compact mobile controls, and consistent gutters. The existing 27 routes remain intact.
- **Photography:** only documented manufacturer photographs are rendered in the updated pages. Exterior views use contain fitting to preserve the whole aircraft. No synthetic aircraft or invented EXJET livery were added. PHOTO-SOURCES.json records the selected files and gaps.
- **Accessibility:** native links and buttons, a skip link, visible focus styles, 44px main touch targets, native FAQ disclosures, labeled image toggles with aria-pressed, and reduced-motion support.

The separate charter page retains the Avinode widget. The widget UI loaded during the cloud-browser review. This does not verify search results, quote submission, authentication, or management synchronization. The account page remains a preview.

Use `app/apple-system.css` for the header/homepage and `app/brand-pages.css` for shared page styling. The development-only `/design-review` route frames real pages at 320, 390, or 768px and provides capture controls outside the frame; it returns 404 in production.

Reference: the user's Apple mobile screenshot, direct Apple.com desktop inspection, and https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md . Measurements in this file describe EXJET's implementation.

Owner correction, 11 September 2026: no tan or beige UI surfaces. Preserve the guide artwork and Ubuntu 300/400/500. Use white, neutral light gray #F4F4F4, silver #C9CDD1, ink #16181A and charcoal #0B0D0F. Original manufacturer photographs retain their natural colors.

Latest reference pass: APPLE-PHOTO-REVIEW.md records the actual Apple.com cloud-browser measurements and revisions. Mobile navigation opens full-height with uniform 28px links. Footer groups collapse on mobile. All previous photographs are removed; PHOTO-SOURCES.json contains only six new direct-domain manufacturer files. Prior page images are obsolete.

## Owner correction: promotional images only

Only official manufacturer product-page, product-gallery or campaign photography may be used. Pre-owned listing, dealer and stock imagery are excluded even when hosted by a manufacturer. Four Dassault pre-owned photos were removed. Only the two verified Citation Latitude promotional images remain; Falcon model pages now omit photographs until exact-model promotional replacements are available. Generic brand sections identify the Citation Latitude correctly. No deployment. Previous page screenshots and the six-photo review are superseded.

## Latest photo direction — all pages and types
Official manufacturer promotional photographs only. All exteriors must show the exact model in flight with the whole aircraft visible, following the Flight Guide cover composition. No parked aircraft, pre-owned listings, illustrations or model substitutions. Falcon 900LX gallery photo #200 is now added, bringing the approved selection to three images. Other model gaps remain; the current all-page screenshot review remains blocked by the stopped preview service. No deployment.

Homepage hero update: use the exact owner-supplied IMG_2095.webp (Global 8000 coastal flight image), unchanged. Natural 1500:671 aspect ratio, contain on mobile and desktop. This explicit user selection is recorded separately from independently verified manufacturer downloads. No deployment.

Homepage message update, 12 September 2026: the exact display line is “Global Access. On-Demand.” Retain the supplied Global 8000 coastal hero. AI-generated imagery is prohibited. Pinterest may be used only to discover an original manufacturer source; it is not acceptable as final provenance or publication permission.

Flight search: compact heading, #f2f2f2 continuous surface, no collapse control or promotional vendor footer. Preserve native booking controls and 44px action targets.

## Brand identity and all-page source review — current update
Flight Guide v3 remains the EXJET brand reference. Latest navbar uses the owner-supplied chevron PNG; Ubuntu300/400/500 and neutral white/silver/platinum/charcoal remain. Apple.com was opened in cloud again; product-led photography, simple hierarchy, restrained controls and full-height mobile navigation remain the structural reference. No new branding or tan UI.
Restored verified Boeing747-8 Freighter promotional flight photo to cargo, original960x600 displayed without enlargement. Global8000 detail now reuses the owner-selected coastal flight image. Falcon900LX has official gallery203 flight view and509 cabin; both appear on Home and Aircraft. Group-travel and About photography preserve original compositions. Replaced legacy600 CSSweights with500. Corrected Falcon route-review names.
Do not remove or replace approved user-selected images without an explicit reason and visible replacement. Correct manufacturer's promotional model photography is required; existing image gaps remain documented rather than substituted with another type.

## Cargo photograph correction
Owner clarified that cargo must use the exact previous747 image, not the newly sourced Boeing flight photo. Restored public/images/cargo-charter-747.webp unchanged from the original archive (1672x941, freighter loading at dusk). Treat this as an explicit owner-selected existing asset; do not replace it again. Independent manufacturer provenance is unverified. New image sourcing requirements remain unchanged for future additions.
