# REPO CLEANUP (step 0)

Inventory date: 2026-11-12. Status: **proposal only. Nothing has been archived, deleted, merged or disconnected.** Waiting for `APPROVED`.

## Headline findings

1. **There are no duplicate EXJET repositories.** The GitHub account `EXJETS` (a user account, not an org) has five repos. Only `EXJETS/EXJET` is an EXJET repo. The other four are different ventures.
2. **The duplication is inside the KEEP repo and across branches**, which the repo-level plan does not cover:
   - `EXJETS/EXJET` has 52 branches. Three of them contain other ventures (black car, dropshipping, BTC trading) on top of the EXJET code.
   - Two other-venture repos each carry one stray EXJET landing-page branch.
   - Six Vercel projects build from `EXJETS/EXJET` on every push.
3. **`main` is not the current site.** `main` was last updated 2026-04-16 (the small prototype audited in STATUS.md). A separate line of work, last updated 2026-10-23 on branch `fix/production-seo-2026-10-19` (PRs 49 to 52 merged into it, 280 files, Next.js 16, Supabase, tests, brand and SEO documents), was never merged to `main`. STATUS.md must be redone against whichever branch is really in production before step 2.
4. **Vercel inventory is incomplete.** My Vercel connection has no access to the team that owns the projects, and this session's network blocks `exjet.com`, so I could not confirm which project serves `exjet.com` or which branch it deploys. See "Blocked" below.

## Repository inventory

Sizes are GitHub-reported. Vercel project and domains are from the GitHub repo homepage field and the Vercel bot comment on PR 53; custom domains are unverified until Vercel access is granted.

| Repo | Class | Visibility | Last push | Size | Branches | Vercel project | Domains | Proposed action |
|---|---|---|---|---|---|---|---|---|
| `EXJETS/EXJET` | **KEEP** | public | 2026-11-12 | 20.6 MB | 52 | `exjet`, `exjet-3xcr`, `exjet-oeoh`, `exjet-landing`, `exjet-brand-review`, `.claude` (six projects) | `exjet.vercel.app`; `exjet.com` presumed, unverified | Keep. Branch and Vercel cleanup proposed below. History untouched. |
| `EXJETS/trading-` | OTHER_VENTURE | private | 2026-11-12 | 27 KB | 2 | none seen | none | Do not touch |
| `EXJETS/E-com` | OTHER_VENTURE | public | 2026-09-11 | 732 KB | 6 | `e-com` (presumed) | `e-com-bice.vercel.app` | Do not touch. Contains one stray EXJET branch (see below) |
| `EXJETS/Teutaet` | OTHER_VENTURE | public | 2026-08-04 | 401 KB | 3 | `teutaet` (presumed) | `teutaet.vercel.app` | Do not touch. Contains one stray EXJET branch (see below) |
| `EXJETS/nextjs` | UNKNOWN | private | 2026-06-07 | 70 KB | 4 | `nextjs` (presumed) | `nextjs-one-mu-tq731f0vxo.vercel.app` | **Ask.** See note |

Classification evidence (default branch plus every other branch was inspected):

- `trading-`: Python trading desk (risk engine, Pine strategies). No EXJET content.
- `E-com`: "GlowCart" dropshipping store. No EXJET content on `main`.
- `Teutaet`: "Flex/Lane" chauffeur service (repo description "Black car service"). No EXJET content on `main`. Possibly relevant later to the chauffeur RFQ feature, but it is a separate product.
- `nextjs`: `main` is an untouched create-next-app. Branches: a WTI crude signal bot, a "vertex risk" client portal, and `claude/delta-website-1-1-zrnsZ`, an airline-style site ("BOOK & MANAGE", "TRAVEL INFO") with no EXJET wording. That last branch may be an EXJET design experiment. Is this repo EXJET_DUPLICATE or OTHER_VENTURE?

Result: **zero repos classified EXJET_DUPLICATE**, so steps 4 to 7 (mirror, archive, delete, merge) have nothing to act on at repo level unless you reclassify `nextjs`.

## Stray EXJET branches in other-venture repos

Rule 8 says never touch OTHER_VENTURE repos, so I propose no action without your explicit say-so.

| Repo | Branch | Last commit | Content | Proposed action |
|---|---|---|---|---|
| `EXJETS/Teutaet` | `claude/exjet-landing-page-kfze9w` | 2026-08-04 | Vite EXJET business aviation landing page, 9 files | Ask: back up and delete the branch, or leave |
| `EXJETS/E-com` | `claude/avinodes-sandbox-landing-tn5jd5` | 2026-09-11 | Next.js "Avinode sandbox" EXJET landing page, 61 files | Ask: back up and delete the branch, or leave |

## Branches inside `EXJETS/EXJET` (52)

No branch deletion is proposed yet. This needs your decision on which line is canonical first.

| Group | Count | Dates | What it is | Proposed action |
|---|---|---|---|---|
| `main` | 1 | 2026-04-16 | Small Next 15 prototype (75 files) | Keep. Decide whether the October line replaces it |
| October rebuild line: `fix/*`, `feat/*`, `design/*`, `content/*`, plus `claude/nextjs-extraction-vercel-deploy-0qmo44` | 30 | 2026-09-12 to 2026-10-23 | Next 16 + Supabase site, 62+ pages, tests, brand/SEO/legal review docs. Tip: `fix/production-seo-2026-10-19` at `c80fb5b` | Keep the tip. After confirming the rest are merged into it, delete the merged branches |
| Early prototype variants: `claude/*` landing, redesign and review branches | 16 | 2026-04-01 to 2026-06-08 | Redesigns of the `main` prototype (Tesla, Delta, editorial, Phosphor icons and others) | Back up, then delete unless you want a specific design kept |
| `claude/private-jet-charter-app-apz5zv` | 1 | 2026-10-22 | Separate from-scratch rebuild with Capacitor iOS shell | Ask |
| `claude/exjet-seo-strategy-10yq8v` | 1 | 2026-08-05 | Dallas/DFW-first SEO plan in `docs/` | Carry the doc into KEEP, then delete branch |
| `claude/argus-operator-scraping-6nj4bx` | 1 | 2026-08-22 | ARGUS operator registry scraper script | Ask. The spec says never scrape against site terms and never show the rating source; I recommend not carrying this over |
| Other ventures on EXJET branches: `claude/black-car-service-platform-IQ7C3`, `claude/ecommerce-dropshipping-store-j3FzA`, `claude/btc-algo-trading-system-Qdjp2` | 3 | 2026-05-09 to 2026-05-31 | Black car platform, dropshop, BTC trading system committed on top of EXJET code | Ask. Not EXJET; I would not delete other-venture work without your word |
| `claude/intelligent-mccarthy-9cbrj4` | 1 | 2026-11-12 | This session (PR 53) | Keep |

## Vercel projects linked to `EXJETS/EXJET`

All six deployed a preview for PR 53. Two Vercel scopes appear in the bot data (`zacks-projects-3a637c51` and `zacks-projects-10cd2c4d`), which suggests a second Vercel account or team also has a project named `exjet`.

| Vercel project | Domains | Proposed action |
|---|---|---|
| `exjet` | `exjet.vercel.app`; custom domains unverified | Keep (presumed production). Confirm production branch |
| `exjet-landing` | unverified | Pending Vercel access |
| `exjet-brand-review` | unverified | Pending Vercel access |
| `exjet-3xcr` | unverified | Likely accidental duplicate import. Pending Vercel access |
| `exjet-oeoh` | unverified | Likely accidental duplicate import. Pending Vercel access |
| `.claude` | unverified | Likely accidental import. Pending Vercel access |

No Vercel project will be removed or disconnected without your approval of each one.

## Carry-over candidates (step 7)

Nothing to merge from other repos. Within KEEP, the October line holds material the April `main` lacks: brand package, design rules, photo sources and placements, SEO playbook, legal review, 29 aircraft guides, 50 travel journal guides, Supabase schema, tests. All of it needs review against the locked PRODUCT spec before reuse.

## Blocked, and what I need

1. **Vercel access.** Approve team access for my connection (single-use link in chat, expires in 10 minutes; ask for a new one if it lapses). Then I can fill in domains, production branch and last deployment for every project.
2. **`exjet.com` is blocked by this session's network policy**, so I cannot check the live site directly. Vercel access makes this unnecessary.
3. **Tooling.** This session has no `gh` CLI for repo administration. I have not found a tool that can archive or delete a repository, and cannot verify the `delete_repo` scope. Per your note I will not work around it. With zero duplicates this currently blocks nothing. Branch deletion is possible with plain `git push --delete` on attached repos.
4. **Backups.** The container is ephemeral, so a local zip disappears when the session ends. If anything is to be deleted, tell me where the mirror zip should go (I can send it to you as a file in chat).

## Decisions needed

1. `EXJETS/nextjs`: EXJET_DUPLICATE or OTHER_VENTURE?
2. Which line is canonical for EXJET: April `main` or the October line at `fix/production-seo-2026-10-19`? Should the October line be merged to `main`?
3. May I delete the two stray EXJET branches in `Teutaet` and `E-com` after backup?
4. The three other-venture branches inside `EXJETS/EXJET`: leave, or back up and delete?
5. `claude/private-jet-charter-app-apz5zv` (iOS rebuild) and the ARGUS scraper branch: keep or drop?
6. Approve branch cleanup in `EXJETS/EXJET` for the 16 early prototype variants and the merged October branches?
