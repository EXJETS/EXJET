# EXJET client account handoff

Status: interface prepared, authentication intentionally disabled in the static preview.

The public `/account` route demonstrates the planned client experience and is marked `noindex`. It must not store passwords or personal data in the browser.

## Production capabilities

- Passwordless email or enterprise identity sign-in with mandatory email verification
- Optional MFA for invoice and traveler-profile access
- Saved traveler profiles and preferences
- Saved billing contacts without storing raw payment card data
- New passenger, group, and cargo requests using the appropriate service workflow
- Trip history, itineraries, agreements, and invoices
- Role-based access for assistants, travelers, family members, and corporate administrators
- Audit log for authentication, document access, and profile changes

## Suggested data boundaries

- `accounts`: EXJET customer organization or household
- `users`: authenticated people and roles
- `traveler_profiles`: minimum required passenger and preference data
- `trip_requests`: customer-submitted mission details
- `trips`: confirmed trip records linked to the operating carrier and EXJET account
- `documents`: encrypted object references for invoices, agreements, and itineraries
- `audit_events`: access and security events without sensitive document content

## Security requirements

Use a managed identity provider, encrypted database, private object storage, short-lived signed document URLs, least-privilege service accounts, rate limits, MFA, and a documented retention schedule. Never put authentication secrets or document URLs in `NEXT_PUBLIC_` variables. Complete threat modeling, privacy review, and penetration testing before enabling the portal.

