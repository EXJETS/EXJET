# EXJET Perspective — frontend release

The frontend uses semantic HTML, CSS Modules, JavaScript interactions and TypeScript components in the existing Next.js application. No framework replacement and no Avinode API or widget changes.

## Visual identity

- Forest #203B2B: navigation, headings and support actions.
- Ivory #F7F8F2: primary page surface.
- Sage #E9ECDF: opportunity graphics and quiet supporting panels.
- Copper #AA442B: primary journey actions and selected details.
- System sans serif for interface text; Georgia italic for short editorial accents.
- Phosphor line icons, consistent stroke/size; solid weight only for selection.
- Original navbar symbol retained. New geometric SVG wordmark for non-navbar uses.
- Original vector route-line artwork. Approved manufacturer photographs retained.

## Implemented frontend

Public homepage, global header/footer and page tokens; app dashboard; charter and empty-leg screens; aircraft catalog and comparison styling; desktop side navigation; mobile bottom navigation and accessible modal menu; one-way, round-trip and multi-city itinerary planning; swap airports; date/order/passenger validation; review, copy and mail-app draft actions; browser-local trip storage with delete/undo.

Trip drafts stay on the user's browser and are explicitly not bookings. Airport suggestions in the planner are a convenience shortlist; free-text airports are accepted and suitability is confirmed by EXJET. Empty-leg inventory and requests still use the existing API. No fabricated price, availability or confirmation is shown.

## Backend deferred

The previously prepared Supabase source remains disabled unless configured. No project is provisioned by this frontend release. Sign-in, account messaging, synchronized trips, checkout and automated alerts are not active. Local trips are not synced into client accounts. Browser clearing removes them. They contain itinerary text only, never payment/passport information.

## Assets

- public/brand/identity/exjet-wordmark.svg
- public/brand/identity/exjet-wordmark-light.svg
- public/brand/identity/flight-lines.svg

Existing SEO URLs and canonical/preview controls are retained. Public informational pages inherit the visual system; custom layouts remain in place where they serve content or aircraft-detail browsing.

## Verification

Production build, TypeScript and ESLint pass. All 22 tests pass, including itinerary validation and isolated database access rules. SEO checks preserve 143 static pages, all 62 original URLs and 131 indexable sitemap entries. Desktop and 390px mobile navigation and layouts were inspected; itinerary review, local save, retrieval, removal and undo were exercised in the browser. The approved photographs and Avinode implementation have no changes. Backend services were not activated or end-to-end tested.
