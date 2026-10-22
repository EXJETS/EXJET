# Shipping EXJET on iOS

The iOS app is a native shell (Capacitor 8, Swift Package Manager) that loads the static web build from inside the app bundle. It runs offline, needs no server to boot, and gets App Store distribution.

## Prerequisites

- macOS with Xcode 16+
- Node 20+
- An Apple Developer account (for devices / TestFlight)

## Build & run

```bash
npm install
npm run ios:sync    # next build → out/, then cap sync ios (copies out/ into the app)
npm run ios:open    # opens ios/App/App.xcodeproj in Xcode
```

In Xcode, select the **App** target → *Signing & Capabilities* → choose your team, then run on a simulator or device. Run `npm run ios:sync` again after every web change.

## What's already set up

- Bundle id `com.exjet.app`, display name **EXJET** (`capacitor.config.ts`).
- App icon (1024²) and an ivory launch screen with the EXJET mark (`ios/App/App/Assets.xcassets`).
- Edge-to-edge layout: `viewport-fit=cover` with `env(safe-area-inset-*)` padding on the header, bottom tab bar and docked reserve bar, so nothing sits under the notch or home indicator.
- Native-feeling UI: bottom tab bar on phones, 16px form inputs (no zoom on focus), no tap highlight, no rubber-band overscroll on the page, native share sheet on empty-leg pages.
- All routes are static files (`trailingSlash: true`, `?id=` detail pages), which the Capacitor web server serves directly.

## Next steps for App Store readiness

1. **Backend + auth.** Point the store actions in `src/store/app-store.ts` at your API. Use Sign in with Apple (required if you offer other social logins).
2. **Push notifications** for route alerts and trip status: `npm i @capacitor/push-notifications`, enable the Push capability in Xcode, register the token with your backend.
3. **Status bar / haptics:** `@capacitor/status-bar` (light text over the dark home hero) and `@capacitor/haptics` on booking confirmation.
4. **Payments:** charter is a physical service, so Stripe (not in-app purchase) is allowed.
5. **App Review:** Guideline 4.2 rejects apps that are "just a website". The native tab bar, offline bundle, push alerts and share sheet help; add push before you submit.
