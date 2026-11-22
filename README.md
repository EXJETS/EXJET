# EXJET marketplace

One Flask app, one SQLite file. No build step.

## Run it on your computer
    pip install -r requirements.txt
    EXJET_ADMIN_PASSWORD=pick-one python init_db.py catalog.sqlite
    python app.py            # http://localhost:8000
    python test_e2e.py       # 109 checks, uses a throwaway copy of the database

## Put it online (simplest: Render, Railway or Fly, any host that runs a Dockerfile)
1. Create a new web service from this folder. It finds the Dockerfile.
2. Add a persistent disk mounted at /data (1 GB is plenty). The database and uploads live there.
3. Set the variables in .env.example. EXJET_SECRET and EXJET_ADMIN_PASSWORD are required. EXJET_DEMO must be 0.
4. Point exjet.com at the service and turn on HTTPS.
Keep one worker (the Dockerfile does). SQLite and the login limiter assume a single process.

## Vercel (test version only)
Vercel's disk is read only and /tmp is wiped on restart, so there the app rebuilds its database from catalog.sqlite on each cold start and anything saved is lost. Good for clicking through, not for real customers.
1. Push this folder to a private GitHub repo and import it in Vercel (framework: Flask).
2. Set EXJET_SECRET and EXJET_ADMIN_PASSWORD. Leave EXJET_DEMO unset so test mode stays on and the site is hidden from search engines.
For a real launch on Vercel the data must move to a hosted Postgres database and file storage first.

## What is switched off, and where to switch it on
| Item | State now | Where |
|---|---|---|
| Card payments and card holds | Off. Wire and balance only, admin marks funds received | PAYMENTS_LIVE in app.py, pay() and req_review() |
| Email and text sending | Queued in Admin > Outbox. Email sends if SMTP_* is set. Texts never send | mail() in app.py |
| ID checks | Client uploads a license, admin approves by eye | kyc() and Admin > ID reviews |
| Operator email addresses | Empty. FAA data has none | Admin > Operators (one by one or paste a list) |
| Legal text | Drafts with a banner | legal/*.md, banner in templates/legal.html |
| Escrow bank details | Placeholder [ESCROW BANK AND ACCOUNT DETAILS] | search app.py |
| Segment fee | $5.20 per passenger per leg, confirm the current IRS figure | EXJET_SEG_FEE_CENTS |
| Wire saving | Fixed 3% of operator price | pay() and admin "paid" |

## Jets for sale
- 543 listings seeded from sale_seed.csv (JETNET capture of 2026-10-29, approved types only). No prices, hours or sellers were in that file: add them in Admin > Jets for sale.
- Photos: none loaded. Extract the photo ZIPs on the server and run `python import_sale_photos.py <folder>`, or upload per listing in admin. Confirm your JETNET licence allows republishing before you do.
- Sellers (owner or broker) submit at /for-sale/sell with proof of ownership, the mandate if a broker, and a maintenance status report, then fill in the due list. A seller listing cannot go live until an admin ticks ownership, mandate and records as verified.
- Inspection lists per type (INSPECTIONS in app.py) are DRAFT templates. Have a director of maintenance correct them before launch.
- The 543 seeded listings carry no documents. They show as "not verified".

## Map
- app.py: every route. init_db.py: schema and admin user. catalog.sqlite: 2,448 approved aircraft, 341 operators, 10,918 airports.
- templates/, static/style.css: pages and the dark theme.
- Roles: client, operator, admin. Operators can quote from the emailed link with no login.
