# EXJET

Private jet charter and empty-leg booking. One codebase ships as a website and as an iOS app.

- **Web:** Next.js 15 (App Router) static export, deployed on Vercel.
- **iOS:** the same static build, packaged into a native app with [Capacitor](https://capacitorjs.com) (`ios/`). See [docs/IOS.md](docs/IOS.md).

## What's in the app

| Area | Routes | What it does |
| --- | --- | --- |
| Charter | `/charter/`, `/charter/book/` | One-way, round-trip and multi-city search; instant all-in quotes for every aircraft that can fly the trip (flight time, fuel stops, fees, US FET, crew overnights); two-step booking request |
| Empty legs | `/empty-legs/`, `/empty-legs/view/?id=` | Live repositioning flights with route, date, guests, price, aircraft-size and region filters; detail page with savings vs. charter rate; reserve flow |
| Alerts | `/alerts/` | Saved routes, with matching empty legs shown as they appear |
| Trips | `/trips/`, `/trips/view/?id=` | Upcoming / past trips, status, manifest, cancellation |
| Account | `/account/` | Sign in, sign up, profile, demo accounts for every role |
| Operator console | `/operator/` | Accept charter requests that match your fleet, confirm or decline empty-leg bookings, post / withdraw empty legs, manage fleet |
| Admin console | `/admin/` | Marketplace stats, all bookings (change status), pull listings, verify operators, users |

Detail pages use query strings (`?id=`) instead of dynamic segments so that every screen is a plain static file, which is what the iOS bundle needs.

## Architecture

```
src/
  app/                 screens (one folder per route; client logic in *-screen.tsx)
  components/          shared UI (ui.tsx primitives, airport picker, route line, cards, shell)
  lib/
    data/              airports, aircraft types, demo seed data
    flight.ts          distance, block time, fuel stops, charter pricing
    legs.ts            empty-leg resolution, savings, filtering & sorting
    itinerary.ts       URL encoding/validation of search itineraries
  store/app-store.ts   all app state + actions (zustand, persisted on device)
```

There's no backend yet. `store/app-store.ts` stands in for one: every mutation (`createBooking`, `acceptBooking`, `addEmptyLeg`…) is a named action, so moving to a real API means replacing those actions without touching the screens. Data is persisted in `localStorage` (inside the iOS app, the WebView's storage). Demo data is seeded relative to today on first launch; **Account → Reset demo data** reseeds it.

Sign-in is a demo with no passwords. Use the **Client / Operator / Admin** buttons on `/account/`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # pricing / itinerary unit tests (vitest)
npm run typecheck
npm run build      # static site in out/
```

## Before production

- Replace the demo store with an API + real auth (e.g. Sign in with Apple, email OTP).
- Payments (Stripe), and taking a deposit when the operator confirms.
- Push notifications for alerts and trip updates (`@capacitor/push-notifications` + APNs).
- Live operator inventory and pricing feeds in place of `lib/data/seed.ts`.
