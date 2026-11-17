# EXJET image production brief

Send original files at the dimensions below. Do not send screenshots, social-media downloads, or images with interface chrome around them. PNG or maximum-quality JPG is ideal; EXJET can convert the final selections to AVIF/WebP for the website.

## Exact deliverables

| Use | Desktop source | Mobile source | Composition requirement | Filename |
| --- | ---: | ---: | --- | --- |
| Home hero | 3840 × 2400 (8:5) | 1800 × 2400 (3:4) | Desktop: aircraft in right 55%; mobile: aircraft in lower 45%. Full nose, tail, wings, and landing gear visible. | `home-hero-desktop.jpg`, `home-hero-mobile.jpg` |
| Group charter hero | 3840 × 2160 (16:9) | 1800 × 2400 (3:4) | Calm, premium group-travel moment with clear negative space for web copy. | `group-hero-desktop.jpg`, `group-hero-mobile.jpg` |
| Cargo hero | 3840 × 2160 (16:9) | 1800 × 2400 (3:4) | Freighter to the right on desktop and lower half on mobile; loading environment clean and credible. | `cargo-hero-desktop.jpg`, `cargo-hero-mobile.jpg` |
| Aircraft sales hero | 3840 × 2160 (16:9) | 1800 × 2400 (3:4) | Abstract hangar/detail image; never imply a pictured aircraft is the actual listing unless it is. | `sales-hero-desktop.jpg`, `sales-hero-mobile.jpg` |
| Exterior viewer scene | 3840 × 2160 (16:9) per aircraft | 1800 × 2400 (3:4) per aircraft | Identical studio, camera height, contrast, and floor across every model. Entire aircraft within a 10% safe margin. | `{aircraft}-exterior-desktop-01.jpg`, `{aircraft}-exterior-mobile-01.jpg` |
| Cabin overview | 3840 × 2160 (16:9) | 1800 × 2400 (3:4) | Realistic aisle perspective; no stretched cabin or impossible window/seat count. | `{aircraft}-cabin-desktop-01.jpg`, `{aircraft}-cabin-mobile-01.jpg` |
| Seat/detail view | 2400 × 3000 (4:5) | same file | Close detail of one genuine-looking seat position, table, finish, or galley feature. | `{aircraft}-detail-01.jpg` |
| True cabin panorama | 8192 × 4096 (2:1 equirectangular) | same file | Seamless 360° panorama with level horizon and no broken seam. | `{aircraft}-cabin-360.jpg` |
| 360° exterior sequence | 36 frames, each 2400 × 1800 (4:3) | same sequence | One frame every 10°. Aircraft, livery, lighting, camera, and shadows must remain identical. | `{aircraft}-360-000.jpg` through `{aircraft}-360-350.jpg` |
| Cargo aircraft card | 3200 × 2000 (8:5) per type | 1800 × 2400 (3:4) optional | Consistent three-quarter exterior, no baked-in labels. | `cargo-{aircraft}-desktop.jpg` |

For a true interactive aircraft viewer, a licensed `.glb`/`.gltf` 3D model is better than AI-generated turntable frames. GPT can create strong individual views, but exact aircraft geometry and paint consistency across 36 separate generations may drift. Cabin 360° scenes should be generated as equirectangular panoramas, not ordinary wide photographs.

## Master prompt — home hero, desktop

> Create an ultra-photorealistic editorial aviation photograph at exactly 3840 × 2400 pixels, landscape 8:5. Feature a mechanically accurate Cessna Citation X private jet in a bright, minimal, high-architecture hangar with a polished pale concrete floor and subtle angular white/very-light-gray wall planes. Camera at low standing height, clean three-quarter front-side view, aircraft nose pointing right. Place the complete aircraft primarily in the right 55% of the frame; leave the left 42% quiet, bright, low-detail negative space for website headline and a booking form. Show the entire nose, tail, wing tips, engines, landing gear, and natural floor reflection. Premium monochrome palette, restrained silver and graphite accents, soft directional daylight, crisp micro-detail, realistic glass and metal, no cinematic haze. Add EXJET livery only if the exact supplied EXJET logo can be reproduced perfectly; otherwise leave the aircraft unbranded. No text, captions, badges, border, watermark, people, vehicles, or extra aircraft. The result must look like a real high-budget aircraft campaign, not AI art.

## Master prompt — home hero, mobile

> Create a matching ultra-photorealistic mobile companion image at exactly 1800 × 2400 pixels, portrait 3:4, showing the same mechanically accurate Cessna Citation X, same paint, same bright architectural hangar, same lighting, and same pale polished floor as the desktop image. Position the complete aircraft across the lower 45% of the frame with its nose pointing right. Preserve the upper 40% and upper-left area as bright, quiet, low-detail negative space for a website headline and mobile booking controls. Keep the full wings, nose, tail, engines, and landing gear visible with realistic proportions and reflection. Add EXJET livery only if the exact supplied EXJET logo can be reproduced perfectly; otherwise leave the aircraft unbranded. No text, captions, badges, border, watermark, people, vehicles, or extra aircraft. Crisp original detail, no blur, no haze, no artificial bokeh.

## Master prompt — standardized aircraft exterior

Replace `[AIRCRAFT MODEL]` for Citation X, Challenger 350, G650, Citation Latitude, Falcon 900, Falcon 2000LX, or Challenger 300.

> Create an ultra-photorealistic, mechanically accurate `[AIRCRAFT MODEL]` exterior reference image at exactly 3840 × 2160 pixels, landscape 16:9. Use a fixed premium studio-hangar environment: seamless pale-gray architectural wall, polished light concrete floor, soft daylight from upper left, restrained graphite shadows. Camera 1.5 meters high, three-quarter front view, nose pointing right, approximately 35 mm full-frame lens, no lens distortion. The entire aircraft must fit within a 10% safe margin on every edge, including both wing tips, nose, tail, engines, and landing gear. Keep this exact background, camera height, crop logic, lighting, contrast, and floor reflection for every aircraft in the EXJET series. If branding is used, apply only the exact supplied EXJET logo and identical black/silver livery; never redraw, misspell, or reinterpret the wordmark. No baked-in typography, aircraft name, watermark, people, stairs, cones, tow bars, or other aircraft.

## Master prompt — cabin overview

> Create an ultra-photorealistic `[AIRCRAFT MODEL]` cabin interior at exactly 3840 × 2160 pixels, landscape 16:9. Camera at seated eye height in the forward third of the cabin, looking aft on a subtle three-quarter angle. Reproduce a credible cabin cross-section, window spacing, aisle width, seat scale, ceiling height, side ledges, tables, belts, and materials for this aircraft category. Contemporary EXJET visual language: warm off-white leather, charcoal and satin-metal details, subtle dark wood, natural daylight through windows, practical evening accent lighting, no excessive gold. Keep the complete seating zone readable with clear central navigation space for an interactive viewer. No people, text, logos, drinks floating without support, distorted furniture, impossible windows, duplicated seats, or fisheye distortion.

## Master prompt — group charter

> Create an ultra-photorealistic premium group-air-travel campaign image at exactly 3840 × 2160 pixels, landscape 16:9. Show a coordinated group of 12–18 adult travelers in a clean private terminal environment preparing to depart: a credible mix of corporate leaders, production crew, or professional team staff, diverse and understated, with realistic carry-on luggage and one group coordinator in conversation. The image should communicate calm organization, privacy, and readiness—not a party or generic stock-photo celebration. Place the people and subtle aircraft view mainly in the right 58% and leave the left 38% quiet for web copy. Cool neutral palette, natural daylight, architectural depth, candid body language, accurate hands and luggage. No visible third-party brands, uniforms, readable documents, signage, text, watermark, red carpet, champagne, paparazzi, or celebrity likenesses.

## Master prompt — cargo hero

> Create an ultra-photorealistic global air-cargo charter campaign image at exactly 3840 × 2160 pixels, landscape 16:9. Feature a mechanically accurate Boeing 747-8F freighter on a clean international cargo apron at blue-hour dawn, viewed from a low three-quarter angle with the nose pointing right. Include restrained, credible pallet and main-deck loading activity in the far right/lower portion without visual clutter. Leave the left 42% dark, clean, and low-detail for website copy and an RFQ control. Convey scale, speed, and operational precision with graphite, silver, and cool-white lighting. No airline branding, EXJET ownership implication, baked-in text, watermark, military cargo, hazardous imagery, fantasy equipment, extra engines, warped landing gear, or cropped aircraft.

## Negative prompt to append to every generation

> Avoid: low resolution, blur, compression artifacts, oversharpening, AI painterly texture, cinematic fog, fake depth of field, blue-and-gold luxury cliché, fantasy aircraft, wrong engine count, asymmetric windows, broken wings, warped landing gear, duplicate wheels, cropped nose, cropped tail, cropped wing tips, inconsistent livery, misspelled EXJET, invented logos, watermarks, captions, interface elements, distorted people, extra fingers, unreadable signage.

## Sales listing rule

Use real, listing-specific photography for any aircraft actively offered for sale. AI imagery may be used only as a clearly labeled editorial/representative background. It must never depict a fictional configuration as though it were the actual listed aircraft. For the sold Citation M2, transaction photography can be used only if EXJET has permission to publish it; otherwise the current typographic treatment is safer.
