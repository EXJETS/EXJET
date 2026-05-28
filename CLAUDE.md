# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

EXJET is an on-demand private jet charter booking platform — a Next.js 15 frontend-only app deployed on Vercel. There is no backend or database; all data is static JSON served from `src/data/`.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
npx tsc --noEmit # Type-check without building
```

There are no tests. Lint errors do not block Vercel builds (`eslint.ignoreDuringBuilds: true` in `next.config.ts`), but type errors do (`ignoreBuildErrors: false`).

## Architecture

### Data layer

All business data lives in `src/data/*.json`:
- `jets.json` — fleet catalogue (typed as `Jet[]`)
- `airports.json` — airport lookup (typed as `Airport[]`)
- `empty-legs.json`, `popular-routes.json`, `sports-events.json`, `news.json`, `faq.json`

Pages import JSON directly with `import data from "@/data/jets.json"` and cast to the types in `src/types/index.ts`. There is no API layer; adding one requires replacing these imports.

### State management

Two Zustand stores handle the entire interactive state:

- **`useSearchStore`** (`src/stores/search-store.ts`) — trip type (one-way / round-trip / multi-leg), origin/destination airport codes, date/time, passengers/bags/pets, filter state (categories, price range, passenger count, sort order). This store is the source of truth for the `SearchBar` component and the `/search` page filter sidebar.

- **`useBookingStore`** (`src/stores/booking-store.ts`) — the selected jet, airports, dates, passenger info, total price, and the current step (1–4) of the booking wizard. Pages in `src/app/booking/` read and mutate this store to advance through the flow.

Both stores are client-only (`"use client"` at the top). State is ephemeral — a page refresh resets everything.

### Booking flow (4 steps)

```
/booking?jet=<id>  →  /booking/passengers  →  /booking/review  →  /booking/confirmation
     step 1                 step 2                  step 3                step 4
```

The `BookingStepper` component (`src/components/booking/booking-stepper.tsx`) reflects `useBookingStore.step`. Navigation between steps is driven by `router.push()` plus `setStep()`. Confirmation generates a fake booking reference client-side (`EXJ-…`).

### Search flow (2 steps)

`/search` shows a two-step UI: first a `CategoryGrid` (pick jet category), then a filtered `JetGrid`. The transition is driven by the `category` URL query param and the `categories` filter in `useSearchStore`. Distance and estimated flight time are computed on the fly using the haversine formula in `src/lib/utils.ts`.

### Three-role dashboard system

A single `Sidebar` component (`src/components/dashboard/sidebar.tsx`) renders different nav items depending on the `role` prop (`"client" | "operator" | "admin"`). Three separate layouts wire it up:

| Route prefix | Layout file | Role passed |
|---|---|---|
| `/dashboard` | `src/app/dashboard/layout.tsx` | `"client"` |
| `/operator` | `src/app/operator/layout.tsx` | `"operator"` |
| `/admin` | `src/app/admin/layout.tsx` | `"admin"` |

Auth is currently UI-only (no real authentication). User name and initials are hardcoded in each layout.

### Design system

The palette is defined as CSS custom properties in `src/app/globals.css` under the `@theme` block (Tailwind v4 syntax):

- `--color-ivory` / `--color-ink` — background and foreground
- `--color-champagne` (`#b89b6e`) — primary accent (buttons on hover, section eyebrows)
- `--color-hairline` / `--color-hairline-strong` — borders
- `--color-bordeaux`, `--color-forest` — editorial accents

Three font families are loaded:
- **GeistSans** / **GeistMono** — sans and mono (via `geist` package)
- **Cormorant Garamond** — serif display (`--font-serif`), used for hero headlines and section titles

Editorial typographic utilities (`.display-serif`, `.display-serif-md`, `.display-serif-italic`, `.chapter-rule`, `.mesh-hero`, `.mesh-ink`) are defined as plain CSS classes in `globals.css` and used extensively in page components.

Use `cn()` from `src/lib/utils.ts` for all conditional class merging — it wraps `clsx` + `tailwind-merge`.

### Path alias

`@/` maps to `src/`. Use it everywhere — no relative `../../` imports.

### Server vs Client components

- Route-level pages that use `useSearchParams`, `useRouter`, or Zustand stores must be `"use client"`. Wrap them in a `<Suspense>` boundary (required by Next.js when `useSearchParams` is present — see `/search/page.tsx` and `/booking/page.tsx` for the pattern).
- Static pages like `/jets/[id]/page.tsx` are async server components and import data directly.

### Formatting utilities (`src/lib/utils.ts`)

- `formatCurrency(n)` — USD, no decimals
- `formatDate(iso)` / `formatTime(iso)`
- `calculateDistance(lat1, lon1, lat2, lon2)` — haversine, returns nautical miles
- `calculateFlightTime(distanceNm, speedKnots)` — returns `"Xh Ym"` string
- `getCategoryLabel(category)` / `getCategoryColor(category)` — display name and Tailwind badge classes for jet categories

## Deployment

Deployed on Vercel. `vercel.json` sets `cleanUrls: true` and `trailingSlash: false`. Images from `images.unsplash.com` are whitelisted in `next.config.ts`.
