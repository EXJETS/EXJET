# Avinode integration

Passenger search uses Avinode's hosted Web App. REST credentials remain in server Route Handlers and are never sent to browser JavaScript.

## Hosted Web App

The private charter, contact, and group charter pages render `AvinodeWidget` through `QuoteForm`. The landing page links to the private charter page and does not embed the widget. Avinode owns airport selection, itinerary entry, results, contact entry, validation, and request confirmation. Cargo retains its separate request form.

`/api/avinode/widget/` supplies an isolated document for the vendor loader, keeping website styles and React navigation from interfering with the widget. The outer component accepts sizing and loading messages only from its own frame and origin. Each page mount creates a fresh widget; leaving a page can discard an unsent search.

The existing EXJET public embed is included in `widget-config.json`. It is the same Web App used by the working booking app. No REST API token or authentication token is included. An optional `AVINODE_WEB_APP_URL` server variable overrides this configuration; the route allows only the documented `https://apps.avinode.com/webapp/rest/bootstrap` endpoint with its `Avinode-WEB-APP` parameter.

The wrapper provides loading, retry, a standalone full-search link, and responsive height. It does not use the legacy `/api/airports` or `/api/requests` endpoints. A successful email result from the legacy intake route cannot show a successful passenger request in the widget. Tracking events are never treated as a confirmed request or booking.

Large groups and multi-aircraft requests can be sent directly to EXJET if the configured widget does not support the required passenger count.

## Retained REST workflows

### Charter and group requests

1. `/api/airports` proxies Avinode `GET /airports/search` for the airport autocomplete.
2. `/api/requests` validates the itinerary and contact information.
3. The server calls Avinode `POST /leads` with a unique `clientIdentifier`.
4. The request appears as a Client Lead in Avinode Marketplace.

If a traveler types a city or code without selecting an autocomplete result, the server resolves the airport through Avinode before creating the lead. Cargo inquiries remain outside the passenger-lead workflow.

### Empty-leg availability

1. `/api/empty-legs` resolves the submitted airports and calls Avinode `POST /emptylegs/search`.
2. The server normalizes only the itinerary, date, aircraft category/model, and passenger-capacity fields required by the public results board.
3. Operator names, tail numbers, seller identifiers, and operator images are not returned to the browser.
4. When a traveler requests a result, `/api/empty-legs/request` creates the required Avinode Client Lead with the `searchId` and `inquiryLift.emptyLegId` values.

Search results are not persisted or used to build a local inventory database.

## Required environment variables

- `AVINODE_MODE`: `sandbox` or `production`
- `AVINODE_BASE_URL`: the matching Avinode API origin
- `AVINODE_API_TOKEN`: server-only API token
- `AVINODE_AUTH_TOKEN`: server-only bearer token
- `AVINODE_PRODUCT`: calling product identifier
- `AVINODE_ACT_AS_ACCOUNT`: optional acting account header when required for the connection

These REST workflows are enabled when mode, base URL, API token, and authorization token are present. `/api/avinode/status` reports configuration presence, not a successful credential check. The separate empty-leg board still needs approved REST access. Passenger widget search does not depend on these values.

## Management data

Embedding the Web App does not populate the account preview or confirm a flight. Importing requests into the separate EXJET booking app requires the approved `ClientLeads` webhook/download connection for the same company and environment as the Web App. Later quotes, agreements, and payment records require their own supported connections.

- https://developer.avinodegroup.com/docs/end-client-trip-search-with-web-apps
- https://developer.avinodegroup.com/docs/download-end-client-leads

## Security boundaries

- The browser never talks directly to Avinode.
- Secrets are never named with `NEXT_PUBLIC_` and are never returned by an API route.
- No itinerary or customer contact data is written to application logs.
- Public empty-leg results exclude operator-identifying information.
- Cargo and aircraft-sales inquiries never enter Avinode's passenger-lead workflow.
