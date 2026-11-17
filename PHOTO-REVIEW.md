# Photography correction — 11 September 2026

The owner rejected the inherited design and questioned its photo sourcing. The overall design is not approved. No deployment was performed.

## Findings and corrections

- The source package contained 52 unapproved legacy image files under public/images. None were referenced by current app, component, data, or script source. All 52 were removed from the website package; the uploaded original remains recoverable through its earlier file version.
- All 11 retained photos exactly matched bytes downloaded from their recorded manufacturer asset URLs on 11 September 2026. SHA-256 values and verification dates are in PHOTO-SOURCES.json.
- Bombardier Challenger 300 and 350 photos originate from official manufacturer pre-owned listings. They should not be described as newly selected campaign photography. Direct source files were reachable; fresh listing-page inspection was limited by an access check. Indexed official listings corroborated the models and serial numbers.
- The Dassault Falcon 2000LX pair and Falcon 900LX cabin source pages and linked original image URLs were freshly verified.
- The Cessna Citation Latitude pair is embedded in the current official Cessna model gallery. The Citation X exterior is linked by the official Textron newsroom article through its selected CDN. Its source resolution is limited to 870 × 574.
- Gulfstream's main website links GulfstreamNews.com. The retained G650 cabin file matches its recorded newsroom asset bytes. The exact G650 caption remains prior verification evidence; this pass could not independently reread the dynamic caption.
- The homepage hero now uses the complete Citation Latitude exterior from Cessna's official model gallery. The experience section uses its matching official interior. Captions and alt text identify the aircraft.
- Homepage exterior images now use contain fitting, including both Challenger collection cards. The hero preserves the original image aspect ratio.
- The original EXJET artwork, Ubuntu fonts, 44px navbar, 27 routes and booking/account behavior are retained.
- npm run build now first checks every packaged photograph against the verified manifest. It fails on extra public/images files, missing photographs or changed photo bytes.

## Verification

- Production build and TypeScript passed after clearing a failed generated Turbopack cache.
- Photo prebuild check passed for all 11 manufacturer originals, with no extra public/images files.
- Browser review at 390px: homepage header measured 44px, document width and scroll width both 390px; Cessna hero loaded at its original 2000px width and used contain fitting.
- Browser capture of collection cards confirmed complete exterior photos; Challenger 300 image loaded and used contain fitting.
- React review found no added effects, state, data fetching or dependency changes. Photo dimensions and responsive image sizing remain explicit.
- The original all-pages image review predates these changes. EXJET-Photo-Review.html and EXJET-Home-Photo-Correction.jpg are the current photography review deliverables.
- Booking submission, real account sign-in and management synchronization remain unverified. Other layouts and commercial claims remain subject to owner review.
