# EXJET data report

Generated 2026-11-12 21:14 UTC by the ingest pipeline. Regenerated after every load.

Rows are identified by source row number (spreadsheet row, header = row 1; for JSON the 1-based record index).
This report contains counts and row numbers only: no operator or contact identities, no full email addresses and no rating sources.

## No files found

No data files were found in `/home/user/EXJET/data/raw`. Nothing was loaded and the database was not touched.

Place founder-supplied files in `data/raw/`. Accepted formats: CSV, XLSX, JSON. Files are picked up by the start of their file name, and loaded in this order:

| Dataset | File name starts with | Required fields | Optional fields |
|---|---|---|---|
| airports_fbos | `airports_fbos` | icao, name, latitude, longitude | iata, faa_lid, city, state, country, elevation_ft, longest_runway_ft, timezone, fbo_name, fbo_phone, fbo_email |
| operators | `operators` | dba_name | legal_name, certificate_number, certificate_type, safety_rating, base_airport_icao, country, contact_name, contact_title, contact_email, contact_phone, receives_rfq |
| aircraft | `aircraft` | tail_number, manufacturer, model, operator_certificate_number or operator_name | operator_certificate_number, operator_name, category, icao_type_code, year_of_manufacture, year_refurbished, passenger_seats, home_airport_icao, amenities |
| outreach_lists | `outreach_lists` | email | full_name, first_name, last_name, company, title, segment, state |

Column headers are matched to these fields through `data/mappings/*.yaml` (case and punctuation insensitive). Unmapped columns and missing required columns are reported here after the first load, and the mapping files can be adjusted without code changes. See `data/README.md`.

Operators whose legal or DBA name matches the exclusion list (NetJets, Flexjet, Nicholas Air) are rejected at ingest, along with their aircraft and contacts.
