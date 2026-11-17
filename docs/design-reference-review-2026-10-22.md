# EXJET design reference review — 22 October 2026

Scope: desktop homepage inspection of Apple, Bombardier, Embraer and XO, plus Embraer Executive Jets; EXJET implementation and responsive checks. Gulfstream returned a CloudFront 403 after one reload, so its live layout was not verified. Reference-site mobile rendering was not captured; mobile sizes below are EXJET design decisions, not claims about those sites.

## Observed patterns

- Apple: compact navigation; centered product imagery; strong headline/subheading/action hierarchy. Main desktop product headings measured 56px with 60px line height.
- Bombardier: minimal menu; full-width campaign imagery; subsequent headings measured 32–64px. Photography provides the visual identity rather than large decorative icons.
- Embraer: layered corporate navigation and an image/video-led hero; Executive Jets provides a focused aircraft navigation and comparison flow. Corporate hero measured 70px and section titles 35–45px.
- XO: prominent trip entry; large editorial headings measured 60px; split image/text sections. EXJET keeps flight entry on Find a flight as requested.

## Applied changes

1. Service discovery: replaced the first three icon-only cards with manufacturer aircraft and cabin photography already held in the verified provenance inventory. Restrained borders, 4px corners and unboxed supporting icons reduce visual noise. Single-column mobile cards retain descriptions on the services page. Compact homepage service navigation remains shorter on mobile.
2. Aircraft discovery: expanded the homepage showcase from two to four aircraft, adding Gulfstream G650 and Bombardier Challenger 350. Exterior/interior controls appear only for available scenes. Responsive image sizes now match the actual two-column layout instead of requesting 1200px for every card.
3. Shared hierarchy: consolidated page and section headline sizes into tokens. Page headings scale from 42–60px on desktop; existing dedicated mobile sizing remains 30–34px. Section headings use 30–44px desktop and 24px mobile. Body copy remains 16–18px; interactive targets remain at least 44px.

Existing Ubuntu typography, EXJET palette, original homepage hero, navbar logo and transparent black Find a flight link are retained. Avinode integration is unchanged. No public source captions were added; PHOTO-SOURCES.json retains asset provenance and the existing publication-permission status. This change does not claim new commercial image licenses.

## Verification

Production build and ESLint passed. Responsive browser checks use the EXJET iframe harness, not device emulation. This is a focused template review, not a full accessibility conformance audit.
