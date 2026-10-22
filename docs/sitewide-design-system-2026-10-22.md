# EXJET sitewide UX/UI system

The public site had several visual systems: centered slogan-led introductions, dense directory cards, separate aircraft detail styling, and a green/beige client workspace. The shared templates now use EXJET Ubuntu type and a white, platinum and charcoal palette, informed by the previously reviewed Apple, Bombardier, Embraer and XO layouts. Gulfstream remained unavailable in that browser; no new Gulfstream visual audit is claimed.

## Template coverage

- All 224 generated public HTML pages receive the shared public layout and `app/design-system.css`.
- Standard pages: one prominent descriptive H1, shorter intro hierarchy, aligned section headers and consistent actions.
- Services, airports, routes, guides, destination articles and legal pages: consistent editorial measure, facts and tables. Pages with at least three sections receive desktop section navigation and a native mobile disclosure.
- Aircraft: aligned catalog filters, comparison cards, specification grids and detail headers; existing scene controls preserved.
- Travel Journal: consistent card geometry, larger metadata, existing search/category/region/sort controls preserved.
- Sales, contact, account support, FAQ and empty legs: shared heading, panel, control and spacing rules.
- Navigation/footer: repeated touch targets, grouped services/resources/audiences/company links; mobile disclosure navigation retained.
- Client workspace: neutral EXJET palette, Ubuntu typography, readable labels and larger controls across existing app routes. No new backend or account functionality is implied.
- Homepage: original hero artwork and tagline preserved. Audience discovery expanded to private clients, Fortune 500 teams, executive assistants, family offices, sports and entertainment travel.

## Size and interaction rules

| Element | Desktop | Mobile |
| --- | --- | --- |
| Main page title | 42–60px | 30–36px |
| Section heading | 30–44px | 28px |
| Reading heading | 30px | 26px |
| Reading copy | 17px | 16px |
| Primary action | 48px minimum height | 48px minimum height |
| Navigation and secondary controls | 44px minimum target | 44px minimum target |
| Page gutter | 24–64px | 18–20px |
| Reading width | 720px maximum | Available width |

The original navbar logo, transparent Find a flight link, Avinode widget/API, routes, structured data and canonical configuration are preserved. The client workspace styles do not reach into the vendor iframe.

## Validation

Production build, photograph provenance gate and ESLint pass. SEO verification checks 224 HTML pages, preserves all 62 original baseline routes, and validates 212 sitemap URLs. All 224 generated public pages have the shared layout class. Twenty representative routes pass 320px reflow checks; additional 390px, 768px and desktop checks pass. Aircraft filtering and comparison, mobile section disclosure, both menus and Escape dismissal were exercised. Exact results are in `verification/design-system-2026-10-22.json`.

This is shared-template coverage with representative visual and interaction testing, not a claim that every route was manually inspected or that the site is accessibility-certified. No inquiry or booking was submitted during testing.
