# EXJET data

Founder-supplied data enters the platform through one pipeline: `apps/api/exjet_api/ingest`.
Nothing is invented, estimated or scraped. Missing fields are flagged in `DATA_REPORT.md`, never filled.

```
data/raw/        Drop founder files here (CSV, XLSX or JSON). Never committed with real data.
data/mappings/   Editable YAML: column aliases, operator DBA overrides, aircraft type aliases, rating map.
data/fixtures/   SYNTHETIC test files. Used only by tests. Never loaded outside tests.
```

## Datasets

Files are picked up by the **start of the file name** (case-insensitive) and loaded in this order, because
later datasets depend on earlier ones:

| Order | Prefix | Contents |
|---|---|---|
| 1 | `airports_fbos` | Airports (and, optionally, one FBO per row) |
| 2 | `operators` | Operators and their RFQ contacts |
| 3 | `aircraft` | Tails, each tied to an operator and an aircraft type |
| 4 | `outreach_lists` | Prospect contacts for outreach (never scraped) |

Accepted formats: `.csv` (comma, semicolon, tab or pipe separated; UTF-8, UTF-16 or Windows-1252),
`.xlsx` (first sheet that has data), `.json` (a list of objects, `{"rows": [...]}`, or JSON lines).
The header row is the first non-empty row.

Examples: `operators_2026-11.csv`, `aircraft_fleet.xlsx`, `airports_fbos.json`, `outreach_lists_family_offices.csv`.

## Target fields

Header names do not have to match: each field has aliases in `data/mappings/<dataset>.yaml`
(matching ignores case, spaces and punctuation). "Required" means the column must exist and each row must
have a value, or the row is rejected.

### airports_fbos
Required: `icao` (4 letters), `name`, `latitude`, `longitude`.
Optional: `iata`, `faa_lid`, `city`, `state` (2 letters), `country` (2 letters, default US), `elevation_ft`,
`longest_runway_ft`, `timezone`, `fbo_name`, `fbo_phone`, `fbo_email`.
Repeat the airport columns on one row per FBO. Airports dedupe on ICAO, FBOs on airport + name.

### operators
Required: `dba_name` (or `legal_name`, which then needs an entry in `dba_overrides.yaml`).
Optional: `legal_name`, `certificate_number`, `certificate_type` (135, 121 or foreign), `safety_rating`,
`base_airport_icao`, `country`, `contact_name`, `contact_title`, `contact_email`, `contact_phone`, `receives_rfq`.
Repeat an operator on several rows to give it several contacts. Dedupe: certificate number first, then
normalised DBA name (case, punctuation and LLC/Inc suffixes ignored). Without a `contact_email` the operator
loads but is flagged "no RFQ contact email": RFQs cannot reach it.

### aircraft
Required: `tail_number`, `manufacturer`, `model`, and at least one of `operator_certificate_number` or `operator_name`.
Optional: `category`, `icao_type_code`, `year_of_manufacture`, `year_refurbished`, `passenger_seats`,
`home_airport_icao`, `amenities` (separated by `;`, `,` or `|`).
Upsert key: tail number. The operator must already be loaded (certificate number first, then DBA name).
Non-US-format tails load but are flagged for review (foreign-equivalent operators are allowed).
The make/model is matched to `aircraft_types` on normalised manufacturer + model. A type that does not exist is
created from the file with only the fields given and listed in the report as **needing specs**. A new type with
no `category` still loads, flagged `type_needs_category`; it stays out of matching and all public listings until a
category is supplied. Categories are never guessed.

### outreach_lists
Required: `email`.
Optional: `full_name` (or `first_name` + `last_name`), `company`, `title`, `segment`, `state`.
Dedupe on lowercased email. Names are encrypted at rest.

## Rules applied to every file

- **Exclusions:** any operator whose legal or DBA name matches NetJets, Flexjet or Nicholas Air (case, spacing and
  punctuation ignored: "Net Jets", "Flexjet LLC", "Nicholas-Air Inc") is rejected with `excluded_operator`,
  and so are its aircraft and contacts. The list is `EXJET_EXCLUDED_OPERATORS`.
- **Safety rating** is stored as exactly one of `Not rated`, `Gold`, `Gold+`, `Platinum`, `Platinum+`. Vendor
  wording ("ARGUS Platinum") is reduced to the value; the source is never stored, shown or reported. Anything
  unrecognised becomes `Not rated` and is flagged. Rules and extra aliases: `data/mappings/safety_rating_map.yaml`.
- New operators are created with `go_live_status = draft`. Going live needs a CEO approval record elsewhere.
- Tails are uppercased and validated as US N-numbers; emails are lowercased and syntax checked; phones become E.164
  only when unambiguous (otherwise kept as supplied and flagged); certificate numbers are trimmed and uppercased.
- A reload never blanks or downgrades a stored value, and never changes `go_live_status`.

## Adjusting the mappings (no code changes)

1. Run once (`--dry-run` is safe). `DATA_REPORT.md` / the console lists **Unmapped columns** and any **missing required columns**.
2. Add the header text under the field's `aliases:` in `data/mappings/<dataset>.yaml`.
3. Operator names: add `"Legal or source name": "DBA"` under `overrides:` in `dba_overrides.yaml`.
4. Aircraft spelled differently from the existing type: add an entry to `aircraft_type_aliases.yaml`.
5. Run again. Reruns are idempotent: identical data reports zero new rows.

## Running

From `apps/api` (set `EXJET_DATABASE_URL`; Postgres must have the schema from the Alembic migrations):

```
uv run python -m exjet_api.ingest run                      # every file in data/raw, in dependency order
uv run python -m exjet_api.ingest run --dataset operators  # one dataset
uv run python -m exjet_api.ingest run --file /path/operators_x.xlsx
uv run python -m exjet_api.ingest run --dry-run            # validate and report, write nothing
```

`--raw-dir` and `--report-path` override the locations. `EXJET_DATA_DIR` moves the whole `data` directory.
The admin upload endpoint calls `exjet_api.ingest.run_ingest(...)`, the same pipeline.

Every real run writes an `ingest_runs` row and regenerates `/DATA_REPORT.md` (latest run per dataset): rows read,
loaded, updated, unchanged, rejected (row number and reason), duplicates merged, missing fields by column,
unmapped columns and flags. The report holds counts and row numbers only: no operator or contact identities, no
full email addresses, no rating sources. Row numbers are spreadsheet rows (header = row 1); for JSON, the 1-based
record index.

## Tests

```
cd apps/api && uv run pytest tests/ingest
```
Uses only the `exjet_data_test` database and the SYNTHETIC files in `data/fixtures/`.
`data/fixtures/make_fixtures.py` regenerates the xlsx/json variants from the csv files.
