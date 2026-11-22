"""Create exjet.db from the FAA catalog and add the application tables.
Usage: python init_db.py [catalog.sqlite]   (safe to run again: app tables are kept)"""
import sqlite3, sys, os, secrets, datetime
from werkzeug.security import generate_password_hash

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.environ.get("EXJET_DB", os.path.join(HERE, "exjet.db"))
CATALOG = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "catalog.sqlite")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, pw_hash TEXT NOT NULL, full_name TEXT, phone TEXT,
  role TEXT NOT NULL DEFAULT 'client', operator_cd TEXT, account_type TEXT DEFAULT 'individual', parent_id INTEGER,
  email_verified INTEGER DEFAULT 0, phone_verified INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'none', kyc_file TEXT, kyc_note TEXT, kyc_attempts INTEGER DEFAULT 0,
  balance_cents INTEGER DEFAULT 0, marketing_ok INTEGER DEFAULT 0, created TEXT);
CREATE TABLE IF NOT EXISTS codes(id INTEGER PRIMARY KEY, user_id INTEGER, kind TEXT, code TEXT, expires TEXT);
CREATE TABLE IF NOT EXISTS acceptances(id INTEGER PRIMARY KEY, user_id INTEGER, subject TEXT, doc TEXT, version TEXT, ts TEXT, ip TEXT, ua TEXT);
CREATE TABLE IF NOT EXISTS memberships(
  id INTEGER PRIMARY KEY, user_id INTEGER, plan TEXT, term TEXT, seats INTEGER DEFAULT 1, amount_cents INTEGER,
  status TEXT, started TEXT, renews TEXT, pay_method TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS requests(
  id INTEGER PRIMARY KEY, code TEXT UNIQUE, user_id INTEGER, from_apt TEXT, to_apt TEXT, trip_type TEXT,
  depart_at TEXT, return_at TEXT, pax INTEGER, bags TEXT, notes TEXT, extras TEXT,
  scope TEXT, category TEXT, types TEXT, tail TEXT, domestic INTEGER,
  hold_cents INTEGER, hold_status TEXT, status TEXT, created TEXT, first_quote_at TEXT);
CREATE TABLE IF NOT EXISTS request_ops(
  id INTEGER PRIMARY KEY, request_id INTEGER, operator_cd TEXT, token TEXT UNIQUE, status TEXT, viewed_at TEXT);
CREATE TABLE IF NOT EXISTS quotes(
  id INTEGER PRIMARY KEY, request_id INTEGER, operator_cd TEXT, aircraft_id INTEGER, price_cents INTEGER,
  valid_until TEXT, cancel_terms TEXT, notes TEXT, quote_file TEXT, agreement_file TEXT, status TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS bookings(
  id INTEGER PRIMARY KEY, request_id INTEGER, quote_id INTEGER, user_id INTEGER, signed_name TEXT, signed_at TEXT, ip TEXT,
  price_cents INTEGER, fet_cents INTEGER, seg_cents INTEGER, total_cents INTEGER, pay_method TEXT, wire_saving_cents INTEGER DEFAULT 0,
  pay_status TEXT, manifest_status TEXT DEFAULT 'open', status TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS passengers(
  id INTEGER PRIMARY KEY, booking_id INTEGER, full_name TEXT, dob TEXT, weight TEXT, contact TEXT, is_minor INTEGER DEFAULT 0,
  id_file TEXT, token TEXT UNIQUE, released_at TEXT, release_ip TEXT);
CREATE TABLE IF NOT EXISTS outbox(
  id INTEGER PRIMARY KEY, to_addr TEXT, to_name TEXT, subject TEXT, body TEXT, kind TEXT, ref TEXT, status TEXT, created TEXT, sent_at TEXT);
CREATE TABLE IF NOT EXISTS operator_contacts(
  certificate_designator TEXT PRIMARY KEY, email TEXT, phone TEXT, contact_name TEXT, status TEXT DEFAULT 'not_invited', updated TEXT);
CREATE TABLE IF NOT EXISTS favorites(user_id INTEGER, aircraft_id INTEGER, PRIMARY KEY(user_id, aircraft_id));
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, request_id INTEGER, sender TEXT, body TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS sale_listings(
  id INTEGER PRIMARY KEY, title TEXT, manufacturer TEXT, category TEXT, year INTEGER, registration TEXT, serial TEXT,
  price_cents INTEGER, hours INTEGER, location TEXT, description TEXT, seller_name TEXT, seller_contact TEXT,
  source TEXT, source_photos INTEGER DEFAULT 0, owner_id INTEGER, status TEXT DEFAULT 'live', created TEXT);
CREATE TABLE IF NOT EXISTS sale_docs(id INTEGER PRIMARY KEY, listing_id INTEGER, kind TEXT, file TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS sale_items(id INTEGER PRIMARY KEY, listing_id INTEGER, item TEXT, last_done TEXT, next_due TEXT, status TEXT);
CREATE TABLE IF NOT EXISTS sale_photos(id INTEGER PRIMARY KEY, listing_id INTEGER, file TEXT, credit TEXT);
CREATE TABLE IF NOT EXISTS sale_inquiries(id INTEGER PRIMARY KEY, listing_id INTEGER, user_id INTEGER, message TEXT, created TEXT);
CREATE INDEX IF NOT EXISTS ix_req_user ON requests(user_id);
CREATE INDEX IF NOT EXISTS ix_ro_req ON request_ops(request_id);
CREATE INDEX IF NOT EXISTS ix_q_req ON quotes(request_id);
CREATE INDEX IF NOT EXISTS ix_pax_booking ON passengers(booking_id);
CREATE INDEX IF NOT EXISTS ix_acc_user ON acceptances(user_id);
CREATE INDEX IF NOT EXISTS ix_sale_status ON sale_listings(status, category);
CREATE INDEX IF NOT EXISTS ix_sale_ph ON sale_photos(listing_id);
CREATE INDEX IF NOT EXISTS ix_ac_type ON aircraft(aircraft_type, approved);
CREATE INDEX IF NOT EXISTS ix_ac_reg ON aircraft(registration);
CREATE INDEX IF NOT EXISTS ix_apt_city ON airports(city);
"""

def main():
    con = sqlite3.connect(DB)
    have = {r[0] for r in con.execute("select name from sqlite_master where type='table'")}
    if "aircraft" not in have:
        if not os.path.exists(CATALOG):
            sys.exit(f"Catalog not found: {CATALOG}")
        con.execute("ATTACH DATABASE ? AS cat", (CATALOG,))
        for t in ("aircraft", "operators", "airports", "aircraft_photos"):
            con.execute(f"CREATE TABLE {t} AS SELECT * FROM cat.{t}")
        con.commit(); con.execute("DETACH DATABASE cat")
        print("catalog loaded")
    con.executescript(SCHEMA)
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat(timespec="seconds")
    if not con.execute("select 1 from users where role='admin'").fetchone():
        pw = os.environ.get("EXJET_ADMIN_PASSWORD") or secrets.token_urlsafe(12)
        con.execute("insert into users(email,pw_hash,full_name,role,email_verified,phone_verified,kyc_status,created) values(?,?,?,?,1,1,'verified',?)",
                    (os.environ.get("EXJET_ADMIN_EMAIL", "admin@exjet.com"), generate_password_hash(pw), "EXJET Admin", "admin", now))
        print("admin created:", os.environ.get("EXJET_ADMIN_EMAIL", "admin@exjet.com"), "password:", pw)
    have_cols = {r[1] for r in con.execute("pragma table_info(sale_listings)")}
    for col, ddl in [("seller_role", "TEXT"), ("landings", "INTEGER"), ("engines", "TEXT"), ("engine_program", "TEXT"), ("apu", "TEXT"), ("tracking", "TEXT"),
                     ("own_ok", "INTEGER DEFAULT 0"), ("mandate_ok", "INTEGER DEFAULT 0"), ("records_ok", "INTEGER DEFAULT 0"), ("records_date", "TEXT")]:
        if col not in have_cols: con.execute(f"ALTER TABLE sale_listings ADD COLUMN {col} {ddl}")
    seed = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sale_seed.csv")
    if os.path.exists(seed) and not con.execute("select 1 from sale_listings limit 1").fetchone():
        import csv
        n = 0
        for r in csv.DictReader(open(seed, encoding="utf-8")):
            con.execute("insert into sale_listings(title,manufacturer,category,year,registration,serial,source,source_photos,status,created) values(?,?,?,?,?,?,?,?,?,?)",
                        (r["title"], r["manufacturer"], r["category"], int(r["year"]), r["registration"], r["serial"], "JETNET 2026-10-29", int(r["source_photos"] or 0), "live", now)); n += 1
        print("sale listings loaded:", n)
    con.commit(); con.close()
    print("ready:", DB)

if __name__ == "__main__":
    main()
