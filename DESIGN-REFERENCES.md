# EXJET — Apple and Tesla reference pass

Inspected both public homepages in Cloud Browser on 12 September 2026. These are observations of the pages rendered in that session, not an official specification for either website.

| Reference | Observed treatment | EXJET application |
| --- | --- | --- |
| [Apple.com](https://www.apple.com/) | Centered short headings; large separate product images; filled and outlined pill actions; neutral section transitions | Keep EXJET heading/photography separation; pair Find a flight and Explore aircraft; preserve the complete aircraft |
| [Tesla.com](https://www.tesla.com/) | Large exterior/interior photography; simple paired actions; 24px thin chevrons; concise captions and small footer details | Use varied manufacturer flight, cabin, workspace and flight-deck views; lighten body chevrons; simplify related links |

Apple mobile measurements in the inspected session included 48px/52px page headings, 28px/32px section headings, 14px/18px action text, a 42px primary pill, 11px by 21px pill padding, and a fully rounded 980px radius. The observed content gutter at a 500px viewport was 33px. EXJET applies those proportions responsively through a 36px to 42px mobile page heading, a 28px mobile section heading, 14px action text, 44px minimum action targets, and a 22px to 44px fluid gutter. EXJET retains Ubuntu 300/400/500 and its graphite, white, silver, and platinum palette.

The navbar is excluded from this pass by explicit user direction. `components/SiteHeader.tsx` and `app/apple-system.css` have identical hashes before and after the edits.

No Apple/Tesla proprietary artwork, logos, fonts or product photos were imported. A bounded official-source review found no generic commercial website asset license: [Apple site terms](https://www.apple.com/legal/internet-services/terms/site.html), [Tesla intellectual-property terms](https://www.tesla.com/legal/additional-resources). EXJET body icons use the existing MIT-licensed Phosphor package. All new aircraft photographs come from official manufacturer promotional pages; each image's source and separate permission status are in PHOTO-SOURCES.json.

The finished implementation was captured from the optimized production build at 390px. All 62 routes are presented as complete page images in the offline review. The capture found no horizontal overflow, blank pages, missing images, or framework error overlays. The hosted search provider does not load in the isolated capture environment, so its three pages show the designed EXJET fallback state; that capture is not evidence of live search submission.
