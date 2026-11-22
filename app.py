"""EXJET marketplace. Flask + SQLite, one file.
Run:  python init_db.py catalog.sqlite && python app.py
Env:  EXJET_SECRET, EXJET_DB, EXJET_DEMO=1 (show codes on screen), SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM"""
import os, re, json, math, sqlite3, secrets, smtplib, datetime as dt
from email.message import EmailMessage
from functools import wraps
from flask import (Flask, g, request, session, redirect, url_for, render_template, abort,
                   flash, send_from_directory, jsonify, Response)
from werkzeug.security import generate_password_hash, check_password_hash

HERE = os.path.dirname(os.path.abspath(__file__))
ON_VERCEL = bool(os.environ.get("VERCEL"))   # Vercel's disk is read only except /tmp, and /tmp is wiped on restart
DATA = "/tmp/exjet" if ON_VERCEL else HERE
DB = os.environ.get("EXJET_DB", os.path.join(DATA, "exjet.db"))
UPLOADS = os.environ.get("EXJET_UPLOADS", os.path.join(DATA, "uploads"))
DEMO = os.environ.get("EXJET_DEMO", "1") == "1"
PAYMENTS_LIVE = False          # stays off until a payment processor is connected
TERMS_VERSION = "draft-2026-11-20"
FET_RATE = 0.075               # federal excise tax, US domestic
SEG_FEE_CENTS = int(os.environ.get("EXJET_SEG_FEE_CENTS", "520"))   # per passenger per leg. CONFIRM the current IRS amount
CHARTER_EMAIL = os.environ.get("CHARTER_EMAIL", "charter@exjet.com")   # charter and empty leg requests
SALES_EMAIL = os.environ.get("SALES_EMAIL", "sales@exjet.com")       # jet sales, acquisition, lease, fractional
SALE_INTERESTS = ["Purchase", "Acquisition search", "Lease", "Fractional"]
HOLD_DOM, HOLD_INTL, BALANCE_MIN = 399800, 799800, 1000000
PLAN_MONTHLY, SEAT_MONTHLY = 149900, 15000
TERMS = {"quarterly": 3, "6mo": 6, "annual": 12}
TERM_LABEL = {"quarterly": "Quarterly", "6mo": "6 months", "annual": "Annual"}
BALANCE_TIERS = [10000000, 15000000, 25000000]
RELEASE = ("RELEASE. I RELEASE EXJET, ITS OWNERS, OFFICERS, EMPLOYEES AND AGENTS FROM EVERY CLAIM ARISING FROM ANY FLIGHT OR "
           "AIRCRAFT, INCLUDING INJURY, DEATH, PROPERTY LOSS, DELAY AND CANCELLATION, EVEN IF THE CLAIM ARISES IN WHOLE OR IN "
           "PART FROM THE NEGLIGENCE OF EXJET. I WILL NOT SUE EXJET ON ANY SUCH CLAIM.")

CATEGORIES = {
 "Light": ["Phenom 300", "Citation CJ3", "Citation CJ4"],
 "Midsize": ["Citation Excel", "Citation XLS / XLS+", "Citation Latitude", "Legacy 450 / Praetor 500"],
 "Super Midsize": ["Citation X", "Citation Sovereign", "Citation Longitude", "Challenger 300 / 350 / 3500", "Gulfstream G280", "Legacy 500 / Praetor 600"],
 "Heavy": ["Falcon 2000", "Falcon 900", "Challenger 604", "Challenger 605", "Challenger 650",
           "Challenger 604 / 605 / 650 (unspecified)", "Challenger 800 / 850 (CRJ airframe)", "Legacy 600 / 650",
           "Gulfstream GIV / GIV-SP / G300", "Gulfstream G350 / G450"],
 "ULR": ["Gulfstream GV", "Gulfstream G500 (GVII)", "Gulfstream G500 / G550 (GV-SP)", "Gulfstream G650", "Gulfstream G650ER",
         "Gulfstream G700", "Gulfstream G800", "Falcon 6X", "Falcon 7X / 8X", "Global 5000 / 5500", "Global 7500",
         "Global Express / XRS / 6000 / 6500"],
 "VIP": ["Airbus ACJ319"],
}
CAT_BLURB = {"Light": "6 to 7 seats, best under 3 hours", "Midsize": "7 to 8 seats, stand up cabin on most",
             "Super Midsize": "8 to 10 seats, coast to coast nonstop", "Heavy": "12 to 16 seats, cabin attendant, long range",
             "ULR": "13 to 19 seats, intercontinental", "VIP": "Airliner cabins: ACJ, BBJ, Lineage"}
TYPE_CAT = {t: c for c, ts in CATEGORIES.items() for t in ts}
SPEED = {"Light": 400, "Midsize": 430, "Super Midsize": 460, "Heavy": 470, "ULR": 480, "VIP": 460}
EXTRAS = ["Catering", "Cabin attendant", "Special occasion setup", "Pets on board", "Something else"]
HUBS = ["Dallas", "Houston", "Austin", "Teterboro", "Van Nuys", "Las Vegas", "Miami", "West Palm Beach", "Chicago", "Atlanta",
        "Washington", "Boston", "Nashville", "Denver", "Aspen", "Scottsdale", "Seattle", "San Francisco", "Naples", "Orlando"]

app = Flask(__name__, static_folder=os.path.join(HERE, "public", "static"), static_url_path="/static")
if os.environ.get("EXJET_PROXY", "1" if ON_VERCEL else "0") == "1":   # behind one reverse proxy: take the real client address and scheme from it
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
app.secret_key = os.environ.get("EXJET_SECRET") or secrets.token_hex(32)
app.config.update(MAX_CONTENT_LENGTH=12 * 1024 * 1024, SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax",
                  SESSION_COOKIE_SECURE=os.environ.get("EXJET_HTTPS", "1" if ON_VERCEL else "0") == "1",
                  PERMANENT_SESSION_LIFETIME=dt.timedelta(days=14))

# ---------------------------------------------------------------- helpers
def ensure_db():
    """First start on a fresh disk: build the database from the bundled catalog."""
    if os.path.exists(DB): return
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    import init_db
    init_db.DB = DB; init_db.CATALOG = os.path.join(HERE, "catalog.sqlite"); init_db.main()

def db():
    if "db" not in g:
        ensure_db()
        g.db = sqlite3.connect(DB, timeout=15); g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys=ON"); g.db.execute("PRAGMA journal_mode=WAL")
    return g.db

@app.teardown_appcontext
def _close(_e):
    d = g.pop("db", None)
    if d: d.close()

def q(sql, args=(), one=False):
    cur = db().execute(sql, args); rows = cur.fetchall()
    return (rows[0] if rows else None) if one else rows

def ex(sql, args=()):
    cur = db().execute(sql, args); db().commit(); return cur.lastrowid

def num(v, default=0, lo=None, hi=None):
    """Whole number from user input. Never raises."""
    try: n = int(float(str(v).replace(",", "").strip()))
    except (TypeError, ValueError): n = default
    if lo is not None: n = max(lo, n)
    if hi is not None: n = min(hi, n)
    return n

def cents(v):
    """Dollar text to cents, or None."""
    try: c = int(round(float(re.sub(r"[^0-9.]", "", str(v or "")) or 0) * 100))
    except ValueError: return None
    return c or None

EMAIL_RX = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+$")
MAGIC = {"pdf": (b"%PDF",), "png": (b"\x89PNG",), "jpg": (b"\xff\xd8",), "jpeg": (b"\xff\xd8",)}

def now(): return dt.datetime.now(dt.timezone.utc).replace(microsecond=0, tzinfo=None)
def iso(d=None): return (d or now()).isoformat()
def slug(s): return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")
def tname(t): return re.sub(r" \((unspecified|CRJ airframe|GVII|GV-SP)\)", "", t or "")
TYPE_SLUG = {slug(tname(t)): t for t in TYPE_CAT}

@app.template_filter("money")
def money(c):
    if c is None: return ""
    return "${:,.2f}".format(c / 100).replace(".00", "")
@app.template_filter("tname")
def _tn(t): return tname(t)
@app.template_filter("tslug")
def _ts(t): return slug(tname(t))
@app.template_filter("nice")
def nice(s):
    try: return dt.datetime.fromisoformat(s).strftime("%a, %b %d, %Y %I:%M %p").replace(" 0", " ")
    except Exception: return s or ""
@app.template_filter("day")
def day(s):
    try: return dt.datetime.fromisoformat(s).strftime("%b %d, %Y")
    except Exception: return s or ""

def user():
    if "u" not in g:
        g.u = q("select * from users where id=?", (session.get("uid"),), one=True) if session.get("uid") else None
    return g.u

def membership(uid):
    u = q("select * from users where id=?", (uid,), one=True)
    owner = u["parent_id"] or uid if u else uid
    return q("select * from memberships where user_id=? order by id desc limit 1", (owner,), one=True)

def is_member(uid):
    m = membership(uid)
    return bool(m and m["status"] in ("active", "ending") and (m["renews"] or "") > iso())

def csrf():
    if "csrf" not in session: session["csrf"] = secrets.token_hex(16)
    return session["csrf"]

@app.before_request
def _guard():
    if request.method == "POST":
        if request.form.get("csrf") != session.get("csrf"): abort(400, "Session expired. Go back and try again.")

@app.after_request
def _headers(r):
    if DEMO: r.headers.setdefault("X-Robots-Tag", "noindex, nofollow")
    r.headers.setdefault("X-Content-Type-Options", "nosniff"); r.headers.setdefault("X-Frame-Options", "DENY")
    r.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    r.headers.setdefault("Content-Security-Policy", "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'")
    return r

def qs(**changes):
    """Current query string with some keys replaced. None removes a key."""
    from urllib.parse import urlencode
    args = [(k, v) for k in request.args for v in request.args.getlist(k) if k not in changes]
    args += [(k, v) for k, v in changes.items() if v is not None]
    return "?" + urlencode(args)

@app.context_processor
def _ctx():
    u = user()
    return dict(qs=qs, CHARTER_EMAIL=CHARTER_EMAIL, SALES_EMAIL=SALES_EMAIL, SALE_INTERESTS=SALE_INTERESTS, me=u, csrf=csrf(), CATEGORIES=CATEGORIES, CAT_BLURB=CAT_BLURB, DEMO=DEMO, RELEASE=RELEASE, PAYMENTS_LIVE=PAYMENTS_LIVE,
                member=is_member(u["id"]) if u else False, TERM_LABEL=TERM_LABEL, year=now().year)

def login_required(role=None):
    def deco(f):
        @wraps(f)
        def w(*a, **k):
            u = user()
            if not u: return redirect(url_for("login", next=request.full_path))
            if role and u["role"] != role and u["role"] != "admin": abort(403)
            return f(*a, **k)
        return w
    return deco

def mail(to, name, subject, body, kind, ref=""):
    status, sent = "queued", None
    host = os.environ.get("SMTP_HOST")
    if host and to and "@" in to:
        try:
            m = EmailMessage(); m["From"] = SALES_EMAIL if kind == "sale" else os.environ.get("MAIL_FROM", CHARTER_EMAIL); m["Reply-To"] = m["From"]; m["To"] = to; m["Subject"] = subject
            m.set_content(body)
            with smtplib.SMTP(host, int(os.environ.get("SMTP_PORT", "587")), timeout=15) as s:
                s.starttls(); s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"]); s.send_message(m)
            status, sent = "sent", iso()
        except Exception as e:
            status = "error: " + str(e)[:120]
    ex("insert into outbox(to_addr,to_name,subject,body,kind,ref,status,created,sent_at) values(?,?,?,?,?,?,?,?,?)",
       (to or "", name or "", subject, body, kind, ref, status, iso(), sent))

_hits = {}
def throttled(key, limit, minutes):
    """True once a key has been used more than `limit` times in the window. In memory: use one worker, or move to the database."""
    t = now(); xs = [x for x in _hits.get(key, []) if t - x < dt.timedelta(minutes=minutes)]; xs.append(t); _hits[key] = xs
    return len(xs) > limit

def accept(uid, subject, doc):
    ex("insert into acceptances(user_id,subject,doc,version,ts,ip,ua) values(?,?,?,?,?,?,?)",
       (uid, subject, doc, TERMS_VERSION, iso(), request.remote_addr, (request.user_agent.string or "")[:200]))

def save_upload(field, kinds=("pdf", "png", "jpg", "jpeg")):
    f = request.files.get(field)
    if not f or not f.filename: return None
    ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""
    if ext not in kinds: flash("File must be one of: " + ", ".join(kinds)); return None
    head = f.stream.read(8); f.stream.seek(0)
    if not head.startswith(MAGIC[ext]): flash("That file is not a valid " + ext.upper() + "."); return None
    name = secrets.token_hex(16) + "." + ext
    os.makedirs(UPLOADS, exist_ok=True); f.save(os.path.join(UPLOADS, name)); return name

def airport(code):
    code = (code or "").strip().upper()
    if not code: return None
    return q("""select * from airports where upper(local_code)=? or upper(iata)=? or upper(icao)=? or upper(ident)=?
                order by (country_code='US') desc, longest_paved_runway_ft desc limit 1""", (code, code, code, code), one=True)

def acode(a): return (a["local_code"] or a["iata"] or a["ident"]) if a else ""

def dist_nm(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a["latitude"], a["longitude"], b["latitude"], b["longitude"]))
    return 3440.065 * math.acos(max(-1, min(1, math.sin(la1) * math.sin(la2) + math.cos(la1) * math.cos(la2) * math.cos(lo1 - lo2))))

def ftime(nm, cat):
    h = nm / SPEED.get(cat, 450) + 0.25; m = int(round(h * 60 / 5) * 5)
    return (f"{m // 60} h {m % 60:02d} min" if m >= 60 else f"{m} min")

def ops_for(types):
    if not types: return []
    return q("select a.certificate_designator cd, o.operator_name name, count(*) n from aircraft a join operators o on o.certificate_designator=a.certificate_designator "
             "where a.approved=1 and a.aircraft_type in (%s) group by 1 order by n desc" % ",".join("?" * len(types)), types)

def type_counts():
    rows = q("select aircraft_type t, count(*) n, count(distinct certificate_designator) o from aircraft where approved=1 group by 1")
    return {r["t"]: r for r in rows}

def photo(reg):
    return q("select * from aircraft_photos where registration=? order by (kind='exterior') desc limit 1", (reg,), one=True)

def sweep():
    """Close stale requests and release holds, with no one asking."""
    for r in q("select * from requests where status in ('open','quoted')"):
        created = dt.datetime.fromisoformat(r["created"])
        if r["status"] == "open" and now() - created > dt.timedelta(hours=24):
            ex("update requests set status='closed', hold_status='released' where id=?", (r["id"],))
            u = q("select * from users where id=?", (r["user_id"],), one=True)
            mail(u["email"], u["full_name"], f"No quotes for {r['code']}. Your hold is released",
                 f"No operator quoted {r['from_apt']} to {r['to_apt']} within 24 hours. Your request is closed and the hold of {money(r['hold_cents'])} is released. Allow 3 business days.", "client", r["code"])
        elif r["status"] == "quoted" and r["first_quote_at"] and now() - dt.datetime.fromisoformat(r["first_quote_at"]) > dt.timedelta(hours=48):
            ex("update requests set status='closed', hold_status='released' where id=?", (r["id"],))
    for m in q("select * from memberships where status in ('active','ending') and renews < ?", (iso(),)):
        ex("update memberships set status=? where id=?", ("ended" if m["status"] == "ending" else "lapsed", m["id"]))

# ---------------------------------------------------------------- public
@app.route("/")
def home():
    feat = q("select a.*, o.operator_name from aircraft a join operators o using(certificate_designator) where a.featured=1 and a.approved=1 order by (a.registration in (select registration from aircraft_photos)) desc, a.aircraft_type, a.registration limit 12")
    tc = type_counts()
    cats = [(c, sum(tc[t]["n"] for t in ts if t in tc)) for c, ts in CATEGORIES.items()]
    near = q("select * from aircraft where approved=1 and aircraft_type in ('Citation X','Challenger 300 / 350 / 3500') and registration in (select registration from aircraft_photos) limit 8")
    sale = q("select * from sale_listings where status='live' order by (id in (select listing_id from sale_photos)) desc, year desc limit 4")
    n_sale = q("select count(*) n from sale_listings where status='live'", one=True)["n"]
    return render_template("home.html", sale=sale, n_sale=n_sale, sale_photos=sale_photos, feat=feat, cats=cats, near=near, photo=photo, total=sum(n for _, n in cats), hubs=HUBS)

@app.route("/api/airports")
def api_airports():
    s = (request.args.get("q") or "").strip()
    if len(s) < 2: return jsonify([])
    like = s + "%"
    rows = q("""select name, city, region, country_code, local_code, iata, ident, longest_paved_runway_ft r, max_aircraft_tier tier from airports
                where city like ? or name like ? or upper(local_code)=upper(?) or upper(iata)=upper(?) or upper(icao)=upper(?)
                order by (upper(local_code)=upper(?) or upper(iata)=upper(?)) desc, (country_code='US') desc, longest_paved_runway_ft desc limit 8""",
             (like, "%" + s + "%", s, s, s, s, s))
    return jsonify([dict(code=r["local_code"] or r["iata"] or r["ident"], name=r["name"], city=r["city"], region=r["region"],
                         country=r["country_code"], runway=r["r"], tier=r["tier"]) for r in rows])

@app.route("/search")
def search():
    a, b = airport(request.args.get("from")), airport(request.args.get("to"))
    cat = request.args.get("category") or ""
    types = [t for t in request.args.getlist("type") if t in TYPE_CAT]
    pool = types or (CATEGORIES.get(cat) or list(TYPE_CAT))
    sort = request.args.get("sort", "featured")
    order = {"featured": "a.featured desc, a.registration", "year": "a.model_year desc nulls last, a.registration",
             "seats": "a.seats desc nulls last, a.registration", "tail": "a.registration"}.get(sort, "a.featured desc, a.registration")
    page = num(request.args.get("page"), 1, 1, 500)
    where = "a.approved=1 and a.aircraft_type in (%s)" % ",".join("?" * len(pool)); args = list(pool)
    if request.args.get("rated"): where += " and a.safety_rating is not null"
    total = q(f"select count(*) n, count(distinct certificate_designator) o from aircraft a where {where}", args, one=True)
    rows = q(f"select a.* from aircraft a where {where} order by {order} limit 24 offset ?", args + [(page - 1) * 24])
    nm = dist_nm(a, b) if a and b else None
    tc = type_counts()
    return render_template("search.html", a=a, b=b, cat=cat, types=types, rows=rows, total=total, nm=nm, ftime=ftime, tc=tc,
                           photo=photo, acode=acode, sort=sort, page=page, TYPE_CAT=TYPE_CAT, args=request.args)

@app.route("/aircraft/<tslug>-charter")
def type_page(tslug):
    t = TYPE_SLUG.get(tslug) or abort(404)
    tc = type_counts().get(t) or abort(404)
    tails = q("select * from aircraft where approved=1 and aircraft_type=? order by featured desc, registration limit 60", (t,))
    return render_template("type.html", t=t, tc=tc, tails=tails, cat=TYPE_CAT[t], photo=photo, sibs=[x for x in CATEGORIES[TYPE_CAT[t]] if x != t])

@app.route("/aircraft/<tslug>/<tail>")
def aircraft(tslug, tail):
    a = q("select a.*, o.operator_name from aircraft a join operators o using(certificate_designator) where upper(a.registration)=upper(?) and a.approved=1", (tail,), one=True) or abort(404)
    if tslug != slug(tname(a["aircraft_type"])) or tail != a["registration"].lower():
        return redirect(url_for("aircraft", tslug=slug(tname(a["aircraft_type"])), tail=a["registration"].lower()), 301)
    tc = type_counts()[a["aircraft_type"]]
    photos = q("select * from aircraft_photos where registration=?", (a["registration"],))
    fav = bool(user() and q("select 1 from favorites where user_id=? and aircraft_id=?", (user()["id"], a["aircraft_id"]), one=True))
    return render_template("aircraft.html", a=a, tc=tc, photos=photos, cat=TYPE_CAT[a["aircraft_type"]], fav=fav)

@app.route("/favorite/<int:aid>", methods=["POST"])
@login_required()
def favorite(aid):
    if q("select 1 from favorites where user_id=? and aircraft_id=?", (user()["id"], aid), one=True):
        ex("delete from favorites where user_id=? and aircraft_id=?", (user()["id"], aid))
    else:
        ex("insert into favorites values(?,?)", (user()["id"], aid))
    return redirect(request.referrer or url_for("favorites"))

@app.route("/favorites")
@login_required()
def favorites():
    rows = q("select a.* from favorites f join aircraft a on a.aircraft_id=f.aircraft_id where f.user_id=? and a.approved=1", (user()["id"],))
    return render_template("search.html", a=None, b=None, cat="", types=[], rows=rows, total={"n": len(rows), "o": 0}, nm=None, ftime=ftime,
                           tc=type_counts(), photo=photo, acode=acode, sort="tail", page=1, TYPE_CAT=TYPE_CAT, args={}, title="Saved aircraft")

@app.route("/guides")
def guides():
    tc = type_counts()
    return render_template("guides.html", tc=tc, hubs=HUBS, TYPE_CAT=TYPE_CAT)

@app.route("/private-jet-charter/<cslug>")
def city_page(cslug):
    city = next((h for h in HUBS if slug(h) == cslug), None) or abort(404)
    aps = q("select * from airports where country_code='US' and city=? and longest_paved_runway_ft>=5000 order by longest_paved_runway_ft desc limit 6", (city,))
    if not aps: abort(404)
    routes = [h for h in HUBS if h != city][:6]
    return render_template("city.html", city=city, aps=aps, routes=routes, acode=acode)

def hub_airport(city):
    return q("select * from airports where country_code='US' and city=? order by longest_paved_runway_ft desc limit 1", (city,), one=True)

@app.route("/routes/<a>-to-<b>")
def route_page(a, b):
    ca = next((h for h in HUBS if slug(h) == a), None); cb = next((h for h in HUBS if slug(h) == b), None)
    if not ca or not cb or ca == cb: abort(404)
    A, B = hub_airport(ca), hub_airport(cb)
    nm = dist_nm(A, B)
    return render_template("route.html", ca=ca, cb=cb, A=A, B=B, nm=nm, times=[(c, ftime(nm, c)) for c in CATEGORIES if c != "VIP"], acode=acode)

@app.route("/operators")
def operators_landing():
    return render_template("operators.html", tc=type_counts(), n_ops=q("select count(distinct certificate_designator) n from aircraft where approved=1", one=True)["n"])

# ---------------------------------------------------------------- jets for sale
SALE_DIR = os.environ.get("EXJET_SALE_PHOTOS", os.path.join(DATA, "sale_photos"))
# Documents a seller must supply. (key, label, who must supply it)
SALE_DOCS = [("ownership", "Proof of ownership: FAA registration, bill of sale or title report", "all"),
             ("mandate", "Signed listing mandate or representative agreement from the owner", "broker"),
             ("status", "Maintenance status report: CAMP, Traxxall, Flightdocs or CESCOM due list", "all"),
             ("logs", "Logbook summary pages (optional)", "none")]
ITEM_STATUS = ["Not due", "Due within 6 months", "Due now", "Overdue", "On program", "Not stated"]
# DRAFT inspection templates by family. Confirm each against the maintenance planning document before relying on them.
_COMMON = ["Engine 1: time since new, since overhaul, next event", "Engine 2: time since new, since overhaul, next event", "APU: hours and next event", "Landing gear overhaul",
           "Altimeter, static and transponder checks (24 month)", "ELT inspection and battery", "Airworthiness directives and service bulletins", "Damage history"]
INSPECTIONS = [
 (r"Citation", ["Phase 1 to 4 inspections", "Phase 5 inspection", "Doc 10", "Doc 11", "Other inspection documents on the due list"]),
 (r"Gulfstream", ["12 month inspection", "24 month inspection", "36 month inspection", "72 month inspection", "96 month inspection", "144 or 192 month inspection"]),
 (r"Global", ["15 month inspection", "30 month inspection", "60 month inspection", "120 month inspection", "180 month inspection"]),
 (r"Challenger", ["12 month inspection", "24 month inspection", "48 month inspection", "96 month inspection", "192 month inspection"]),
 (r"Falcon", ["A check", "2A check", "B check", "C check", "2C check"]),
 (r"Phenom", ["12 month inspection", "24 month inspection", "60 month inspection", "120 month inspection"]),
 (r"Legacy|Praetor", ["12 month inspection", "24 month inspection", "48 month inspection", "96 month inspection"]),
 (r"ACJ|BBJ|Lineage", ["A check", "C check", "6 year check", "12 year check"]),
]
def inspection_template(title):
    for rx, items in INSPECTIONS:
        if re.search(rx, title or ""):
            eng3 = ["Engine 3: time since new, since overhaul, next event"] if re.search(r"Falcon (900|7X|8X|6X)", title) and "6X" not in title else []
            return items + _COMMON[:2] + eng3 + _COMMON[2:]
    return ["Scheduled inspections per the maintenance planning document"] + _COMMON

def can_edit_sale(l):
    u = user()
    return bool(u and (u["role"] == "admin" or u["id"] == l["owner_id"]))


def sale_photos(lid, limit=None):
    return q("select * from sale_photos where listing_id=? order by id" + (" limit %d" % limit if limit else ""), (lid,))

@app.route("/sale-photo/<name>")
def sale_photo(name):
    if not re.fullmatch(r"[0-9a-f]{32}\.(png|jpg|jpeg)", name): abort(404)
    return send_from_directory(SALE_DIR, name, max_age=86400)

@app.route("/for-sale")
def for_sale():
    f = request.args; where = "status='live'"; args = []
    if f.get("category") in CATEGORIES: where += " and category=?"; args.append(f["category"])
    if f.get("mfr"): where += " and manufacturer=?"; args.append(f["mfr"])
    if f.get("s"): where += " and (title like ? or registration like ? or serial like ?)"; args += ["%" + f["s"].strip() + "%"] * 3
    if (f.get("y1") or "").isdigit(): where += " and year>=?"; args.append(int(f["y1"]))
    if (f.get("y2") or "").isdigit(): where += " and year<=?"; args.append(int(f["y2"]))
    sort = f.get("sort", "new")
    order = {"new": "year desc, title", "old": "year, title", "model": "title, year desc", "price": "price_cents is null, price_cents"}.get(sort, "year desc, title")
    page = num(f.get("page"), 1, 1, 500)
    total = q(f"select count(*) n from sale_listings where {where}", args, one=True)["n"]
    rows = q(f"select * from sale_listings where {where} order by records_ok desc, (id in (select listing_id from sale_photos)) desc, {order} limit 24 offset ?", args + [(page - 1) * 24])
    mfrs = q("select manufacturer m, count(*) n from sale_listings where status='live' group by 1 order by n desc")
    cats = {r["category"]: r["n"] for r in q("select category, count(*) n from sale_listings where status='live' group by 1")}
    return render_template("sale_list.html", rows=rows, total=total, page=page, sort=sort, mfrs=mfrs, cats=cats, f=f, sale_photos=sale_photos)

@app.route("/for-sale/sell", methods=["GET", "POST"])
@login_required()
def sale_sell():
    u = user()
    if request.method == "POST":
        f = request.form; cat = f.get("category") if f.get("category") in CATEGORIES else None
        yr = int(f["year"]) if (f.get("year") or "").isdigit() else 0
        role = f.get("seller_role") if f.get("seller_role") in ("owner", "broker") else None
        need = [k for k, _, who in SALE_DOCS if who == "all" or who == role]
        missing = [k for k in need if not (request.files.get("doc_" + k) and request.files.get("doc_" + k).filename)]
        if not (f.get("authorized") and f.get("terms")): flash("Tick both boxes to submit.")
        elif not role: flash("Say whether you are the owner or a broker.")
        elif not (f.get("hours") or "").isdigit(): flash("Enter airframe total time in hours.")
        elif missing: flash("Required documents are missing: " + ", ".join(dict((k, l.split(":")[0]) for k, l, _ in SALE_DOCS)[k] for k in missing))
        elif not cat or not f.get("title", "").strip() or not 1960 <= yr <= now().year + 1 or not f.get("registration", "").strip(): flash("Fill in model, category, year and registration.")
        else:
            pc = cents(f.get("price"))
            lid = ex("""insert into sale_listings(title,manufacturer,category,year,registration,serial,price_cents,hours,location,description,seller_name,seller_contact,source,owner_id,status,created)
                        values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (f["title"].strip()[:80], f.get("manufacturer", "").strip()[:40], cat, yr, f["registration"].strip().upper()[:12], f.get("serial", "").strip()[:20], pc,
                        int(f["hours"]) if (f.get("hours") or "").isdigit() else None, f.get("location", "")[:80], f.get("description", "")[:3000], u["full_name"], u["email"], "seller", u["id"], "pending", iso()))
            ex("update sale_listings set seller_role=?, landings=?, engines=?, engine_program=?, apu=?, tracking=? where id=?",
               (role, int(f["landings"]) if (f.get("landings") or "").isdigit() else None, f.get("engines", "")[:200], f.get("engine_program", "")[:80], f.get("apu", "")[:120], f.get("tracking", "")[:60], lid))
            for k, _, _ in SALE_DOCS:
                name = save_upload("doc_" + k, ("pdf", "jpg", "jpeg", "png"))
                if name: ex("insert into sale_docs(listing_id,kind,file,created) values(?,?,?,?)", (lid, k, name, iso()))
            for it in inspection_template(f["title"]):
                ex("insert into sale_items(listing_id,item,status) values(?,?,?)", (lid, it, "Not stated"))
            accept(u["id"], f"sale:{lid}", "sales")
            mail(SALES_EMAIL, "EXJET Sales", "Sale listing to review", f"{u['email']} submitted {f['title']} {f['registration']}.", "sale")
            flash("Documents received. Now fill in the maintenance status. The listing goes live after EXJET verifies your documents."); return redirect(url_for("sale_records", lid=lid))
    return render_template("sale_sell.html", SALE_DOCS=SALE_DOCS)

@app.route("/for-sale/<int:lid>/records", methods=["GET", "POST"])
@login_required()
def sale_records(lid):
    l = q("select * from sale_listings where id=?", (lid,), one=True) or abort(404)
    if not can_edit_sale(l): abort(403)
    if request.method == "POST":
        f = request.form
        ex("update sale_listings set hours=?, landings=?, engines=?, engine_program=?, apu=?, tracking=?, records_date=?, records_ok=case when ?='admin' then records_ok else 0 end where id=?",
           (int(f["hours"]) if (f.get("hours") or "").isdigit() else l["hours"], int(f["landings"]) if (f.get("landings") or "").isdigit() else None, f.get("engines", "")[:200], f.get("engine_program", "")[:80],
            f.get("apu", "")[:120], f.get("tracking", "")[:60], f.get("records_date", "")[:10], user()["role"], lid))
        for it in q("select * from sale_items where listing_id=?", (lid,)):
            if f.get(f"del_{it['id']}"): ex("delete from sale_items where id=?", (it["id"],)); continue
            st = f.get(f"st_{it['id']}"); st = st if st in ITEM_STATUS else "Not stated"
            ex("update sale_items set last_done=?, next_due=?, status=? where id=?", (f.get(f"ld_{it['id']}", "")[:40], f.get(f"nd_{it['id']}", "")[:40], st, it["id"]))
        if f.get("new_item", "").strip(): ex("insert into sale_items(listing_id,item,status) values(?,?,?)", (lid, f["new_item"].strip()[:120], "Not stated"))
        flash("Maintenance status saved." + ("" if user()["role"] == "admin" else " EXJET will check it against your status report.")); return redirect(url_for("sale_records", lid=lid))
    return render_template("sale_records.html", l=l, items=q("select * from sale_items where listing_id=? order by id", (lid,)), ITEM_STATUS=ITEM_STATUS,
                           docs=q("select * from sale_docs where listing_id=?", (lid,)), SALE_DOCS=SALE_DOCS)

@app.route("/for-sale/<int:lid>", methods=["GET", "POST"])
@app.route("/for-sale/<int:lid>/<sl>", methods=["GET", "POST"])
def sale_detail(lid, sl=None):
    l = q("select * from sale_listings where id=?", (lid,), one=True) or abort(404)
    u = user()
    if l["status"] != "live" and not (u and (u["role"] == "admin" or u["id"] == l["owner_id"])): abort(404)
    if request.method == "POST":
        if not u: return redirect(url_for("login", next=request.path))
        if not request.form.get("terms"): flash("Tick the box to send your inquiry.")
        elif throttled("inq:%s" % u["id"], 10, 60): flash("Too many inquiries. Try again in an hour.")
        else:
            interest = request.form.get("interest") if request.form.get("interest") in SALE_INTERESTS else "Purchase"
            msg = "[" + interest + "] " + request.form.get("message", "")[:1500]
            ex("insert into sale_inquiries(listing_id,user_id,message,created) values(?,?,?,?)", (lid, u["id"], msg, iso())); accept(u["id"], f"sale:{lid}", "sales")
            mail(SALES_EMAIL, "EXJET Sales", f"{interest} inquiry: {l['year']} {l['title']} {l['registration']}", f"From {u['full_name']}, {u['email']}, {u['phone']}\n\n{msg}", "sale", str(lid))
            if l["seller_contact"]: mail(l["seller_contact"], l["seller_name"], f"Inquiry on your {l['year']} {l['title']}", f"A verified EXJET account holder asked about {l['registration']}. EXJET will connect you.\n\n{msg}", "sale", str(lid))
            mail(u["email"], u["full_name"], f"We got your inquiry: {l['year']} {l['title']}", f"EXJET will reply from {SALES_EMAIL} with what the seller provides. EXJET is not the seller.", "client", str(lid))
            flash("Inquiry sent. We will email you.")
        return redirect(url_for("sale_detail", lid=lid, sl=slug(l["title"])))
    charter = q("select * from aircraft where approved=1 and upper(registration)=upper(?)", (l["registration"],), one=True)
    more = q("select * from sale_listings where status='live' and title=? and id<>? order by year desc limit 4", (l["title"], lid))
    return render_template("sale_detail.html", l=l, photos=sale_photos(lid), charter=charter, more=more, sale_photos=sale_photos, can_edit=can_edit_sale(l),
                           items=q("select * from sale_items where listing_id=? and status<>'Not stated' order by id", (lid,)))

LEGAL = [("terms", "Terms of Service"), ("release", "Release and waiver"), ("membership", "Membership terms"),
         ("booking", "Booking and payment policy"), ("passenger", "Passenger policy"), ("use", "Acceptable use"),
         ("operator", "Operator terms"), ("sales", "Aircraft sales terms"), ("privacy", "Privacy policy"), ("accessibility", "Accessibility")]

@app.route("/legal")
@app.route("/legal/<doc>")
def legal(doc=None):
    body = None
    if doc:
        if doc not in dict(LEGAL): abort(404)
        p = os.path.join(HERE, "legal", doc + ".md")
        body = open(p, encoding="utf-8").read() if os.path.exists(p) else ""
    return render_template("legal.html", docs=LEGAL, doc=doc, title=dict(LEGAL).get(doc), body=body, version=TERMS_VERSION)

@app.route("/robots.txt")
def robots():
    if DEMO: return Response("User-agent: *\nDisallow: /\n", mimetype="text/plain")
    return Response("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /trips\nDisallow: /o/\nDisallow: /r/\nDisallow: /files/\nDisallow: /request/\nDisallow: /booking/\nDisallow: /reset/\nSitemap: " + request.url_root + "sitemap.xml\n", mimetype="text/plain")

@app.route("/sitemap.xml")
def sitemap():
    root = request.url_root.rstrip("/"); urls = ["/", "/guides", "/operators", "/legal"]
    urls += [f"/aircraft/{s}-charter" for s in TYPE_SLUG]
    urls += [f"/private-jet-charter/{slug(h)}" for h in HUBS]
    urls += ["/for-sale"] + [f"/for-sale/{r['id']}/{slug(r['title'])}" for r in q("select id,title from sale_listings where status='live'")]
    urls += [f"/routes/{slug(a)}-to-{slug(b)}" for a in HUBS for b in HUBS if a != b]
    urls += [f"/aircraft/{slug(tname(r['aircraft_type']))}/{r['registration'].lower()}" for r in q("select registration, aircraft_type from aircraft where approved=1")]
    xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(f"<url><loc>{root}{u}</loc></url>" for u in urls) + "</urlset>"
    return Response(xml, mimetype="application/xml")

# ---------------------------------------------------------------- auth, verification
def send_code(u, kind):
    code = f"{secrets.randbelow(1000000):06d}"
    ex("delete from codes where user_id=? and kind=?", (u["id"], kind))
    ex("insert into codes(user_id,kind,code,expires) values(?,?,?,?)", (u["id"], kind, code, iso(now() + dt.timedelta(minutes=15))))
    if kind == "email":
        mail(u["email"], u["full_name"], "Your EXJET code", f"Your EXJET verification code is {code}. It expires in 15 minutes.", "code")
    else:
        mail(u["phone"], u["full_name"], "TEXT MESSAGE", f"EXJET code {code}. Expires in 15 minutes. Reply STOP to opt out.", "sms")
    return code

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        f = request.form; email = f.get("email", "").strip().lower()
        need = ["age", "terms", "release", "arbitration", "esign"]
        if not all(f.get(k) for k in need): flash("Tick every required box to continue.")
        elif len(f.get("password", "")) < 10: flash("Password must be at least 10 characters.")
        elif not EMAIL_RX.match(email): flash("Enter a valid email address.")
        elif len(re.sub(r"\D", "", f.get("phone", ""))) < 10: flash("Enter a mobile number with area code.")
        elif len(f.get("full_name", "").split()) < 2: flash("Enter your full legal name as it appears on your ID.")
        elif q("select 1 from users where email=?", (email,), one=True): flash("That email already has an account. Log in instead.")
        else:
            uid = ex("insert into users(email,pw_hash,full_name,phone,account_type,marketing_ok,created) values(?,?,?,?,?,?,?)",
                     (email, generate_password_hash(f["password"]), f["full_name"].strip(), f.get("phone", "").strip(),
                      f.get("account_type", "individual"), 1 if f.get("marketing") else 0, iso()))
            for d in ("terms", "release", "arbitration", "esign", "privacy"): accept(uid, "user", d)
            session.clear(); session["uid"] = uid; session.permanent = True
            u = q("select * from users where id=?", (uid,), one=True)
            send_code(u, "email"); send_code(u, "phone")
            return redirect(url_for("verify"))
    return render_template("signup.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if throttled("login:%s" % request.remote_addr, 10, 15): flash("Too many tries. Wait 15 minutes."); return render_template("login.html")
        u = q("select * from users where email=?", (request.form.get("email", "").strip().lower(),), one=True)
        if u and check_password_hash(u["pw_hash"], request.form.get("password", "")):
            session.clear(); session["uid"] = u["id"]; session.permanent = True
            nxt = request.args.get("next") or ""
            return redirect(nxt if nxt.startswith("/") and not nxt.startswith("//") else url_for("admin" if u["role"] == "admin" else "operator_dash" if u["role"] == "operator" else "trips"))
        flash("Email or password is not right.")
    return render_template("login.html")

@app.route("/forgot", methods=["GET", "POST"])
def forgot():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        if throttled("forgot:%s" % request.remote_addr, 5, 60): flash("Too many tries. Wait an hour."); return redirect(url_for("forgot"))
        u = q("select * from users where email=?", (email,), one=True)
        if u:
            code = secrets.token_urlsafe(24); ex("delete from codes where user_id=? and kind='reset'", (u["id"],))
            ex("insert into codes(user_id,kind,code,expires) values(?,?,?,?)", (u["id"], "reset", code, iso(now() + dt.timedelta(minutes=30))))
            mail(u["email"], u["full_name"], "Reset your EXJET password", f"Open this link within 30 minutes to choose a new password:\n{request.url_root}reset/{code}\nIf you did not ask for this, ignore this email.", "code")
        flash("If that email has an account, a reset link is on its way."); return redirect(url_for("login"))
    return render_template("forgot.html")

@app.route("/reset/<code>", methods=["GET", "POST"])
def reset(code):
    c = q("select * from codes where kind='reset' and code=? and expires>?", (code, iso()), one=True)
    if not c: flash("That reset link is not valid or has expired."); return redirect(url_for("forgot"))
    if request.method == "POST":
        pw = request.form.get("password", "")
        if len(pw) < 10: flash("Password must be at least 10 characters.")
        else:
            ex("update users set pw_hash=? where id=?", (generate_password_hash(pw), c["user_id"])); ex("delete from codes where id=?", (c["id"],))
            flash("Password changed. Log in."); return redirect(url_for("login"))
    return render_template("reset.html")

@app.route("/logout", methods=["POST"])
def logout():
    session.clear(); return redirect(url_for("home"))

@app.route("/verify", methods=["GET", "POST"])
@login_required()
def verify():
    u = user()
    if request.method == "POST":
        kind = request.form.get("kind")
        if kind not in ("email", "phone"): abort(400)
        if throttled("code:%s" % u["id"], 8, 15): flash("Too many tries. Wait 15 minutes."); return redirect(url_for("verify"))
        if request.form.get("resend"):
            send_code(u, kind); flash("New code sent.")
        else:
            c = q("select * from codes where user_id=? and kind=? and expires>?", (u["id"], kind, iso()), one=True)
            if c and secrets.compare_digest(c["code"], request.form.get("code", "").strip()):
                ex(f"update users set {kind}_verified=1 where id=?", (u["id"],)); ex("delete from codes where id=?", (c["id"],))
            else: flash("That code is not right or has expired.")
        return redirect(url_for("verify"))
    if u["email_verified"] and u["phone_verified"]: return redirect(url_for("kyc"))
    codes = {c["kind"]: c["code"] for c in q("select * from codes where user_id=?", (u["id"],))} if DEMO else {}
    return render_template("verify.html", codes=codes)

@app.route("/kyc", methods=["GET", "POST"])
@login_required()
def kyc():
    u = user()
    if request.method == "POST":
        name = save_upload("license")
        if name:
            ex("update users set kyc_file=?, kyc_status='pending', kyc_attempts=kyc_attempts+1 where id=?", (name, u["id"]))
            mail("admin@exjet.com", "EXJET Admin", "Identity review needed", f"{u['full_name']} ({u['email']}) uploaded an ID.", "admin")
            return redirect(url_for("kyc"))
    return render_template("kyc.html")

# ---------------------------------------------------------------- account, membership
@app.route("/account")
@login_required()
def account():
    u = user(); sweep()
    team = q("select * from users where parent_id=?", (u["id"],))
    return render_template("account.html", m=membership(u["id"]), team=team, tiers=BALANCE_TIERS,
                           acc=q("select * from acceptances where user_id=? order by id desc limit 12", (u["id"],)))

def price(plan, term, seats):
    months = TERMS[term]
    return (PLAN_MONTHLY + (SEAT_MONTHLY * max(0, seats - 1) if plan == "business" else 0)) * months

@app.route("/membership", methods=["GET", "POST"])
@login_required()
def membership_page():
    u = user()
    if request.method == "POST":
        f = request.form
        cur = membership(u["id"])
        if not f.get("cancel") and cur and cur["status"] in ("active", "pending_payment") and u["parent_id"] is None:
            flash("You already have a membership. Cancel it in Account before starting another."); return redirect(url_for("account"))
        if u["parent_id"]: flash("Your membership is managed by your business account owner."); return redirect(url_for("account"))
        if f.get("cancel"):
            ex("update memberships set status='ending' where user_id=? and status='active'", (u["id"],))
            ex("update memberships set status='cancelled' where user_id=? and status='pending_payment'", (u["id"],))
            flash("Membership cancelled. Access continues to the end of the paid term."); return redirect(url_for("account"))
        if not f.get("agree"): flash("Agree to the membership terms and automatic renewal to continue."); return redirect(url_for("membership_page"))
        plan = f.get("plan") if f.get("plan") in ("individual", "business") else "individual"
        term = f.get("term") if f.get("term") in TERMS else "quarterly"
        seats = num(f.get("seats"), 1, 1, 50) if plan == "business" else 1
        amt = price(plan, term, seats)
        ex("insert into memberships(user_id,plan,term,seats,amount_cents,status,started,renews,pay_method,created) values(?,?,?,?,?,?,?,?,?,?)",
           (u["id"], plan, term, seats, amt, "pending_payment", iso(), iso(now() + dt.timedelta(days=30 * TERMS[term])), f.get("pay", "wire"), iso()))
        ex("update users set account_type=? where id=?", (plan, u["id"])); accept(u["id"], "user", "membership")
        mail(u["email"], u["full_name"], "Your EXJET membership", f"{plan.title()} plan, {TERM_LABEL[term]}, {money(amt)}. It renews automatically for the same term until you cancel in Account. Payment instructions follow.", "client")
        mail("admin@exjet.com", "EXJET Admin", "Membership awaiting payment", f"{u['email']} chose {plan} {term} {money(amt)}.", "admin")
        flash("Membership created. It becomes active when payment is received."); return redirect(url_for("account"))
    return render_template("membership.html", m=membership(u["id"]), PLAN=PLAN_MONTHLY, SEAT=SEAT_MONTHLY, TERMS=TERMS)

@app.route("/team", methods=["POST"])
@login_required()
def team():
    u = user(); m = membership(u["id"])
    if not m or m["plan"] != "business": abort(403)
    f = request.form
    if f.get("remove"):
        ex("update users set parent_id=NULL, account_type='individual' where id=? and parent_id=?", (num(f["remove"]), u["id"]))
    else:
        email = f.get("email", "").strip().lower()
        used = q("select count(*) n from users where parent_id=?", (u["id"],), one=True)["n"] + 1
        if not f.get("authorized"): flash("Confirm this person is authorized to act for the business.")
        elif used >= (m["seats"] or 1): flash("All seats are in use. Add a seat to your plan first.")
        elif not EMAIL_RX.match(email): flash("Enter a valid email address.")
        elif q("select 1 from users where email=?", (email,), one=True): flash("That email already has an account.")
        else:
            pw = secrets.token_urlsafe(10)
            ex("insert into users(email,pw_hash,full_name,account_type,parent_id,created) values(?,?,?,?,?,?)", (email, generate_password_hash(pw), f.get("full_name", ""), "business", u["id"], iso()))
            mail(email, f.get("full_name", ""), "You were added to an EXJET business account", f"{u['full_name']} added you. Log in with this email and temporary password {pw}, then verify your identity.", "client")
            flash("Invite sent.")
    return redirect(url_for("account"))

@app.route("/balance", methods=["POST"])
@login_required()
def balance():
    u = user(); amt = num(request.form.get("tier"))
    if amt not in BALANCE_TIERS: abort(400)
    mail(u["email"], u["full_name"], "Wire instructions for your EXJET balance", f"Send {money(amt)} by wire using reference BAL-{u['id']}. [ESCROW BANK AND ACCOUNT DETAILS]. Your balance is credited when the wire arrives.", "client")
    mail("admin@exjet.com", "EXJET Admin", "Balance wire expected", f"{u['email']} requested wire instructions for {money(amt)}.", "admin")
    flash("Wire instructions sent to your email. Your balance is credited when the wire arrives."); return redirect(url_for("account"))

# ---------------------------------------------------------------- request flow
def draft(): return session.get("draft") or {}

def when(s):
    try: return dt.datetime.fromisoformat(s)
    except (TypeError, ValueError): return None

def ready_to_request(u):
    if not (u["email_verified"] and u["phone_verified"]): return "verify"
    if u["kyc_status"] != "verified": return "kyc"
    if not is_member(u["id"]): return "membership_page"
    return None

@app.route("/request/new", methods=["GET", "POST"])
@login_required()
def req_trip():
    d = draft()
    for k in ("tail", "type", "category", "from", "to", "date", "pax"):
        if request.args.get(k): d[k] = request.args.get(k)
    if request.method == "POST":
        f = request.form
        a, b = airport(f.get("from")), airport(f.get("to"))
        if not a or not b: flash("Pick both airports from the list.")
        elif acode(a) == acode(b): flash("From and To must be different airports.")
        elif not when(f.get("date")) or when(f.get("date")) < now() - dt.timedelta(hours=12): flash("Choose a departure date and time in the future.")
        elif f.get("ret") and (not when(f.get("ret")) or when(f.get("ret")) < when(f.get("date"))): flash("The return must be after the departure.")
        else:
            d.update({"from": acode(a), "to": acode(b), "date": f["date"], "ret": f.get("ret") or "", "trip": "Round trip" if f.get("ret") else "One way", "pax": num(f.get("pax"), 1, 1, 19)})
            session["draft"] = d; return redirect(url_for("req_ops"))
    session["draft"] = d
    return render_template("req_trip.html", d=d)

@app.route("/request/operators", methods=["GET", "POST"])
@login_required()
def req_ops():
    d = draft()
    if not d.get("from"): return redirect(url_for("req_trip"))
    ac = q("select * from aircraft where upper(registration)=upper(?) and approved=1", (d.get("tail") or "",), one=True)
    base_type = ac["aircraft_type"] if ac else (d.get("type") if d.get("type") in TYPE_CAT else None)
    cat = TYPE_CAT.get(base_type) or (d.get("category") if d.get("category") in CATEGORIES else "Super Midsize")
    tc = type_counts()
    if request.method == "POST":
        f = request.form; scope = f.get("scope", "type")
        if scope == "tail" and ac: types = [ac["aircraft_type"]]
        elif scope in ("category", "board"): types = list(CATEGORIES[cat])
        else:
            types = [t for t in f.getlist("types") if t in TYPE_CAT]
            if base_type and base_type not in types: types.insert(0, base_type)
        if not types: flash("Choose at least one aircraft type.")
        else:
            d.update({"scope": scope, "types": types, "category": cat}); session["draft"] = d
            return redirect(url_for("req_extras"))
    sel = d.get("types") or ([base_type] if base_type else [])
    return render_template("req_ops.html", d=d, ac=ac, base_type=base_type, cat=cat, tc=tc, sel=sel,
                           n_sel=len(ops_for(sel)), n_cat=len(ops_for(CATEGORIES[cat])), n_cat_ac=sum(tc[t]["n"] for t in CATEGORIES[cat] if t in tc))

@app.route("/api/opcount")
def api_opcount():
    types = [t for t in request.args.getlist("t") if t in TYPE_CAT]
    return jsonify(n=len(ops_for(types)))

@app.route("/request/extras", methods=["GET", "POST"])
@login_required()
def req_extras():
    d = draft()
    if not d.get("types"): return redirect(url_for("req_ops"))
    if request.method == "POST":
        f = request.form
        d.update({"bags": f.get("bags", ""), "notes": f.get("notes", "")[:1000], "extras": [e for e in f.getlist("extras") if e in EXTRAS]})
        session["draft"] = d; return redirect(url_for("req_review"))
    return render_template("req_extras.html", d=d, EXTRAS=EXTRAS)

@app.route("/request/review", methods=["GET", "POST"])
@login_required()
def req_review():
    u = user(); d = draft()
    if not d.get("types"): return redirect(url_for("req_trip"))
    a, b = airport(d["from"]), airport(d["to"])
    domestic = int(a["country_code"] == "US" and b["country_code"] == "US")
    hold = HOLD_DOM if domestic else HOLD_INTL
    use_balance = u["balance_cents"] >= BALANCE_MIN
    if d.get("scope") == "tail":
        ac = q("select * from aircraft where upper(registration)=upper(?)", (d["tail"],), one=True)
        ops = q("select certificate_designator cd, operator_name name, 1 n from operators where certificate_designator=?", (ac["certificate_designator"],))
    else: ops = ops_for(d["types"])
    block = ready_to_request(u)
    if request.method == "POST":
        if block: return redirect(url_for(block))
        if not (request.form.get("terms") and request.form.get("release")):
            flash("Tick the terms and the release to send your request."); return redirect(url_for("req_review"))
        if not ops: flash("No operator has an approved aircraft of that type. Choose another type."); return redirect(url_for("req_ops"))
        if q("select count(*) n from requests where user_id=? and created>?", (u["id"], iso(now() - dt.timedelta(hours=24))), one=True)["n"] >= 10:
            flash("You have sent 10 requests in 24 hours. Contact " + CHARTER_EMAIL + " to send more."); return redirect(url_for("trips"))
        code = "EX-" + str(20000 + (q("select coalesce(max(id),0) n from requests", one=True)["n"] + 1) * 7)
        rid = ex("""insert into requests(code,user_id,from_apt,to_apt,trip_type,depart_at,return_at,pax,bags,notes,extras,scope,category,types,tail,domestic,hold_cents,hold_status,status,created)
                    values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                 (code, u["id"], d["from"], d["to"], d.get("trip", "One way"), d["date"], d.get("ret", ""), d.get("pax", 1), d.get("bags", ""), d.get("notes", ""),
                  json.dumps(d.get("extras", [])), d.get("scope", "type"), d.get("category", ""), json.dumps(d["types"]), d.get("tail", ""), domestic,
                  0 if use_balance else hold, "covered_by_balance" if use_balance else "pending_processor", "open", iso()))
        accept(u["id"], code, "terms"); accept(u["id"], code, "release")
        tlist = ", ".join(tname(t) for t in d["types"])
        for o in ops:
            tok = secrets.token_urlsafe(18)
            ex("insert into request_ops(request_id,operator_cd,token,status) values(?,?,?,'sent')", (rid, o["cd"], tok))
            c = q("select * from operator_contacts where certificate_designator=?", (o["cd"],), one=True)
            body = (f"New charter request {code}\n\nRoute: {d['from']} to {d['to']} ({d.get('trip', 'One way')})\nDeparture: {nice(d['date'])}\n"
                    + (f"Return: {nice(d['ret'])}\n" if d.get("ret") else "")
                    + f"Passengers: {d.get('pax', 1)}\nBags: {d.get('bags') or 'not stated'}\nAircraft types asked for: {tlist}\n"
                    + (f"Add ons: {', '.join(d.get('extras', []))}\n" if d.get("extras") else "") + (f"Notes: {d['notes']}\n" if d.get("notes") else "")
                    + f"\nQuote here, no login needed:\n{request.url_root}o/{tok}\n\nYour price reaches the client unchanged. Attach your own charter agreement, naming the client as charterer. "
                      "EXJET is the marketplace and is not a party.\n\nQuestions: " + CHARTER_EMAIL + "\nEXJET, [POSTAL ADDRESS]. To stop receiving requests, reply STOP.")
            mail(c["email"] if c else "", o["name"], f"Charter request {code}: {d['from']} to {d['to']}, {day(d['date'])}", body, "rfq", code)
        mail(u["email"], u["full_name"], f"Request {code} sent to {len(ops)} operators",
             f"{d['from']} to {d['to']} on {nice(d['date'])}. Sent to {len(ops)} operators with: {tlist}. You get an email and text for each quote. "
             + ("Your account balance covers the request hold." if use_balance else f"A hold of {money(hold)} applies. It goes toward your booking, or is released if you do not book within 48 hours of the first quote."), "client", code)
        mail(CHARTER_EMAIL, "EXJET Charter", f"RFQ {code}: {d['from']} to {d['to']}, {day(d['date'])}", f"Client {u['full_name']} ({u['email']}). Sent to {len(ops)} operators with: {tlist}. Passengers {d.get('pax', 1)}.", "admin", code)
        session.pop("draft", None); return redirect(url_for("trip", code=code))
    return render_template("req_review.html", d=d, a=a, b=b, ops=ops, hold=hold, domestic=domestic, use_balance=use_balance, block=block,
                           nm=dist_nm(a, b), ft=ftime(dist_nm(a, b), d.get("category") or "Super Midsize"))

@app.route("/trips")
@login_required()
def trips():
    sweep(); u = user()
    rows = q("""select r.*, (select count(*) from request_ops o where o.request_id=r.id) n_ops,
                (select count(*) from quotes x where x.request_id=r.id) n_q, b.id bid, b.pay_status, b.manifest_status
                from requests r left join bookings b on b.request_id=r.id where r.user_id=? order by r.id desc""", (u["id"],))
    return render_template("trips.html", rows=rows)

def own_request(code):
    r = q("select * from requests where code=?", (code,), one=True) or abort(404)
    if r["user_id"] != user()["id"] and user()["role"] != "admin": abort(403)
    return r

@app.route("/trips/<code>", methods=["GET", "POST"])
@login_required()
def trip(code):
    sweep(); r = own_request(code)
    if request.method == "POST":
        if request.form.get("withdraw") and r["status"] in ("open", "quoted"):
            ex("update requests set status='withdrawn', hold_status='released' where id=?", (r["id"],)); flash("Request withdrawn. Your hold is released.")
        elif request.form.get("message"):
            ex("insert into messages(request_id,sender,body,created) values(?,?,?,?)", (r["id"], "client", request.form["message"][:1000], iso()))
        return redirect(url_for("trip", code=code))
    ops = q("select * from request_ops where request_id=?", (r["id"],))
    quotes = q("""select x.*, a.registration, a.aircraft_type, a.display_name, a.model_year, a.seats, a.safety_rating
                  from quotes x join aircraft a on a.aircraft_id=x.aircraft_id where x.request_id=? and x.status<>'replaced' order by x.price_cents""", (r["id"],))
    b = q("select * from bookings where request_id=?", (r["id"],), one=True)
    return render_template("trip.html", r=r, ops=ops, quotes=quotes, b=b, types=json.loads(r["types"]), extras=json.loads(r["extras"] or "[]"),
                           now_iso=iso(), viewed=sum(1 for o in ops if o["status"] in ("viewed", "quoted")), msgs=q("select * from messages where request_id=?", (r["id"],)), taxes=taxes, photo=photo)

def taxes(r, price_cents):
    legs = 2 if (r["return_at"] or "").strip() else 1
    fet = round(price_cents * FET_RATE) if r["domestic"] else 0
    seg = SEG_FEE_CENTS * (r["pax"] or 1) * legs if r["domestic"] else 0
    return fet, seg, price_cents + fet + seg

@app.route("/quote/<int:qid>/sign", methods=["GET", "POST"])
@login_required()
def sign(qid):
    x = q("select x.*, a.registration, a.aircraft_type, a.display_name, o.operator_name from quotes x join aircraft a on a.aircraft_id=x.aircraft_id join operators o on o.certificate_designator=x.operator_cd where x.id=?", (qid,), one=True) or abort(404)
    r = q("select * from requests where id=?", (x["request_id"],), one=True); u = user()
    if r["user_id"] != u["id"]: abort(403)
    if r["status"] not in ("quoted",) or x["status"] != "offered" or (x["valid_until"] or "9") < iso(): flash("This quote is no longer open."); return redirect(url_for("trip", code=r["code"]))
    fet, seg, total = taxes(r, x["price_cents"])
    if request.method == "POST":
        f = request.form
        if not (f.get("agreement") and f.get("release") and f.get("cancel")): flash("Tick all three boxes to sign.")
        elif f.get("signed_name", "").strip().lower() != (u["full_name"] or "").strip().lower(): flash("Type your full legal name exactly as on your account to sign.")
        else:
            bid = ex("""insert into bookings(request_id,quote_id,user_id,signed_name,signed_at,ip,price_cents,fet_cents,seg_cents,total_cents,pay_status,status,created)
                        values(?,?,?,?,?,?,?,?,?,?,?,?,?)""", (r["id"], qid, u["id"], f["signed_name"].strip(), iso(), request.remote_addr, x["price_cents"], fet, seg, total, "awaiting", "signed", iso()))
            ex("update quotes set status='accepted' where id=?", (qid,)); ex("update quotes set status='not_selected' where request_id=? and id<>?", (r["id"], qid))
            ex("update requests set status='booked', hold_status=case when hold_status='pending_processor' then 'applied_to_booking' else hold_status end where id=?", (r["id"],))
            accept(u["id"], r["code"], "operator_agreement"); accept(u["id"], r["code"], "release")
            c = q("select * from operator_contacts where certificate_designator=?", (x["operator_cd"],), one=True)
            mail(c["email"] if c else "", x["operator_name"], f"{r['code']}: client signed your agreement", f"The client signed your charter agreement for {r['from_apt']} to {r['to_apt']} on {nice(r['depart_at'])}. Payment is due within 24 hours. You will be told when funds are received.", "operator", r["code"])
            mail(u["email"], u["full_name"], f"{r['code']}: agreement signed, payment due", f"You signed the charter agreement with {x['operator_name']}. Total {money(total)}. Pay within 24 hours to hold the aircraft.", "client", r["code"])
            return redirect(url_for("pay", bid=bid))
    return render_template("sign.html", x=x, r=r, fet=fet, seg=seg, total=total)

def own_booking(bid):
    b = q("select * from bookings where id=?", (bid,), one=True) or abort(404)
    if b["user_id"] != user()["id"] and user()["role"] != "admin": abort(403)
    r = q("select * from requests where id=?", (b["request_id"],), one=True)
    x = q("select x.*, a.registration, a.aircraft_type, a.display_name, o.operator_name from quotes x join aircraft a on a.aircraft_id=x.aircraft_id join operators o on o.certificate_designator=x.operator_cd where x.id=?", (b["quote_id"],), one=True)
    return b, r, x

@app.route("/booking/<int:bid>/pay", methods=["GET", "POST"])
@login_required()
def pay(bid):
    b, r, x = own_booking(bid); u = user()
    if request.method == "POST" and b["pay_status"] in ("awaiting", "wire_pending"):
        m = request.form.get("method")
        if m == "balance" and u["balance_cents"] >= b["total_cents"]:
            saving = round(b["price_cents"] * 0.03)
            ex("update users set balance_cents=balance_cents-? where id=?", (b["total_cents"] - saving, u["id"]))
            ex("update bookings set pay_method='balance', wire_saving_cents=?, pay_status='paid', status='paid' where id=?", (saving, bid))
            paid_notice(bid); return redirect(url_for("manifest", bid=bid))
        if m == "wire":
            ex("update bookings set pay_method='wire', pay_status='wire_pending' where id=?", (bid,))
            mail(u["email"], u["full_name"], f"{r['code']}: wire instructions", f"Send {money(b['total_cents'])} less your wire saving, reference {r['code']}. [ESCROW BANK AND ACCOUNT DETAILS].", "client", r["code"])
            mail("admin@exjet.com", "EXJET Admin", f"{r['code']}: wire expected", f"{money(b['total_cents'])} from {u['email']}.", "admin", r["code"])
            flash("Wire instructions sent. Your trip is confirmed when the wire arrives.")
        elif m == "card": flash("Card payments are not switched on yet. Choose wire or account balance.")
        return redirect(url_for("pay", bid=bid))
    return render_template("pay.html", b=b, r=r, x=x)

def paid_notice(bid):
    b = q("select * from bookings where id=?", (bid,), one=True); r = q("select * from requests where id=?", (b["request_id"],), one=True)
    x = q("select * from quotes where id=?", (b["quote_id"],), one=True); u = q("select * from users where id=?", (b["user_id"],), one=True)
    c = q("select * from operator_contacts where certificate_designator=?", (x["operator_cd"],), one=True)
    mail(u["email"], u["full_name"], f"{r['code']}: payment received", f"We received {money(b['total_cents'] - b['wire_saving_cents'])}. Next: send your passenger manifest.", "client", r["code"])
    mail(c["email"] if c else "", "", f"{r['code']}: funds received", f"Client funds are held for {r['code']}. Payout follows the operator terms.", "operator", r["code"])

@app.route("/booking/<int:bid>/manifest", methods=["GET", "POST"])
@login_required()
def manifest(bid):
    b, r, x = own_booking(bid)
    if b["pay_status"] != "paid": flash("The manifest opens once payment is received."); return redirect(url_for("pay", bid=bid))
    if request.method == "POST":
        f = request.form
        if f.get("add"):
            if len(f.get("full_name", "").split()) < 2: flash("Enter the passenger's full legal name.")
            elif q("select count(*) n from passengers where booking_id=?", (bid,), one=True)["n"] >= (r["pax"] or 1): flash(f"This trip was quoted for {r['pax']} passengers. Ask the operator to requote before adding more.")
            elif not when(f.get("dob")): flash("Enter the passenger's date of birth.")
            else:
                tok = secrets.token_urlsafe(16); minor = 1 if f.get("minor") else 0
                ex("insert into passengers(booking_id,full_name,dob,weight,contact,is_minor,id_file,token,released_at) values(?,?,?,?,?,?,?,?,?)",
                   (bid, f["full_name"].strip(), f.get("dob", ""), f.get("weight", ""), f.get("contact", ""), minor, save_upload("id_file"), tok, None))
                if minor: accept(user()["id"], f"guardian:{r['code']}:{f['full_name'].strip()[:60]}", "release")
                if not minor:
                    mail(f.get("contact", ""), f["full_name"], "Before you fly: accept the release", f"{user()['full_name']} added you to a private flight, {r['from_apt']} to {r['to_apt']} on {nice(r['depart_at'])}.\nAccept here before you fly: {request.url_root}r/{tok}", "release", r["code"])
        elif f.get("remove"): ex("delete from passengers where id=? and booking_id=?", (f["remove"], bid))
        elif f.get("submit"):
            ps = q("select * from passengers where booking_id=?", (bid,))
            missing = [p["full_name"] for p in ps if not p["is_minor"] and not p["released_at"]]
            if not ps: flash("Add at least one passenger.")
            elif missing: flash("Still waiting on the release from: " + ", ".join(missing))
            else:
                ex("update bookings set manifest_status='submitted', status='confirmed' where id=?", (bid,))
                c = q("select * from operator_contacts where certificate_designator=?", (x["operator_cd"],), one=True)
                lines = "\n".join(f"- {p['full_name']}, born {p['dob']}, {p['weight']} lb" + (" (minor)" if p["is_minor"] else f", release accepted {p['released_at']}") for p in ps)
                mail(c["email"] if c else "", x["operator_name"], f"{r['code']}: passenger manifest", f"{r['from_apt']} to {r['to_apt']}, {nice(r['depart_at'])}, {x['registration']}.\n\n{lines}\n\nClient: {user()['full_name']}, {user()['email']}, {user()['phone']}", "operator", r["code"])
                mail(user()["email"], user()["full_name"], f"{r['code']}: trip confirmed", f"Operator: {x['operator_name']}. Tail number: {x['registration']}. Operator contact: {(c['email'] if c else '[on file with EXJET]')}.", "client", r["code"])
        return redirect(url_for("manifest", bid=bid))
    ps = q("select * from passengers where booking_id=?", (bid,))
    c = q("select * from operator_contacts where certificate_designator=?", (x["operator_cd"],), one=True)
    return render_template("manifest.html", b=b, r=r, x=x, ps=ps, contact=c)

@app.route("/booking/<int:bid>/receipt")
@login_required()
def receipt(bid):
    b, r, x = own_booking(bid)
    return render_template("receipt.html", b=b, r=r, x=x)

@app.route("/r/<token>", methods=["GET", "POST"])
def release(token):
    p = q("select * from passengers where token=?", (token,), one=True) or abort(404)
    b = q("select * from bookings where id=?", (p["booking_id"],), one=True); r = q("select * from requests where id=?", (b["request_id"],), one=True)
    x = q("select x.*, a.aircraft_type, o.operator_name from quotes x join aircraft a on a.aircraft_id=x.aircraft_id join operators o on o.certificate_designator=x.operator_cd where x.id=?", (b["quote_id"],), one=True)
    if request.method == "POST" and not p["released_at"]:
        f = request.form
        if not (f.get("release") and f.get("policy")): flash("Tick both boxes to accept.")
        elif f.get("full_name", "").strip().lower() != p["full_name"].strip().lower(): flash("Type your full legal name exactly as the booker entered it.")
        else:
            ex("update passengers set released_at=?, release_ip=? where id=?", (iso(), request.remote_addr, p["id"]))
            ex("insert into acceptances(user_id,subject,doc,version,ts,ip,ua) values(?,?,?,?,?,?,?)", (None, f"passenger:{p['id']}:{r['code']}", "release", TERMS_VERSION, iso(), request.remote_addr, (request.user_agent.string or "")[:200]))
        return redirect(url_for("release", token=token))
    return render_template("release.html", p=p, r=r, x=x)

# ---------------------------------------------------------------- operators
@app.route("/o/<token>", methods=["GET", "POST"])
def op_quote(token):
    ro = q("select * from request_ops where token=?", (token,), one=True) or abort(404)
    r = q("select * from requests where id=?", (ro["request_id"],), one=True); types = json.loads(r["types"])
    op = q("select * from operators where certificate_designator=?", (ro["operator_cd"],), one=True)
    if ro["status"] == "sent": ex("update request_ops set status='viewed', viewed_at=? where id=?", (iso(), ro["id"]))
    fleet = q("select * from aircraft where approved=1 and certificate_designator=? and aircraft_type in (%s) order by registration" % ",".join("?" * len(types)), [ro["operator_cd"]] + types)
    if r["tail"] and r["scope"] == "tail": fleet = [a for a in fleet if a["registration"].upper() == r["tail"].upper()] or fleet
    mine = q("select x.*, a.registration from quotes x join aircraft a on a.aircraft_id=x.aircraft_id where x.request_id=? and x.operator_cd=?", (r["id"], ro["operator_cd"]))
    if request.method == "POST" and r["status"] in ("open", "quoted"):
        f = request.form
        if f.get("decline"): ex("update request_ops set status='declined' where id=?", (ro["id"],)); return redirect(url_for("op_quote", token=token))
        price_c = cents(f.get("price")) or 0
        ac = next((a for a in fleet if str(a["aircraft_id"]) == f.get("aircraft_id")), None)
        if price_c < 100000: flash("Enter the full price the client pays, before tax.")
        elif not ac: flash("Choose which of your aircraft this quote is for.")
        elif not f.get("cancel_terms", "").strip(): flash("State your cancellation terms. The client sees them before signing.")
        elif not f.get("confirm"): flash("Confirm the agreement names the client and not EXJET.")
        else:
            agreement = save_upload("agreement", ("pdf",))
            if not agreement and not mine: flash("Attach your charter agreement as a PDF."); return redirect(url_for("op_quote", token=token))
            hrs = num(f.get("valid_hours"), 48, 24, 72)
            ex("update quotes set status='replaced' where request_id=? and operator_cd=? and aircraft_id=? and status='offered'", (r["id"], ro["operator_cd"], ac["aircraft_id"]))
            ex("insert into quotes(request_id,operator_cd,aircraft_id,price_cents,valid_until,cancel_terms,notes,quote_file,agreement_file,status,created) values(?,?,?,?,?,?,?,?,?,?,?)",
               (r["id"], ro["operator_cd"], ac["aircraft_id"], price_c, iso(now() + dt.timedelta(hours=hrs)), f["cancel_terms"][:2000], f.get("notes", "")[:1000], save_upload("quote_file", ("pdf",)), agreement or (mine[0]["agreement_file"] if mine else None), "offered", iso()))
            ex("update request_ops set status='quoted' where id=?", (ro["id"],))
            ex("update requests set status='quoted', first_quote_at=coalesce(first_quote_at,?) where id=?", (iso(), r["id"]))
            if EMAIL_RX.match(f.get("email", "").strip()):
                ex("insert into operator_contacts(certificate_designator,email,status,updated) values(?,?,?,?) on conflict(certificate_designator) do update set email=excluded.email, updated=excluded.updated", (ro["operator_cd"], f["email"].strip(), "active", iso()))
            u = q("select * from users where id=?", (r["user_id"],), one=True)
            mail(u["email"], u["full_name"], f"{r['code']}: new quote, {tname(ac['aircraft_type'])}", f"An operator quoted {money(price_c)} before tax for {r['from_apt']} to {r['to_apt']}. View it: {request.url_root}trips/{r['code']}", "client", r["code"])
            mail(u["phone"], u["full_name"], "TEXT MESSAGE", f"EXJET: new quote on {r['code']}. {request.url_root}trips/{r['code']}", "sms", r["code"])
            flash("Quote sent to the client.")
        return redirect(url_for("op_quote", token=token))
    return render_template("op_quote.html", ro=ro, r=r, op=op, fleet=fleet, mine=mine, types=types, extras=json.loads(r["extras"] or "[]"),
                           contact=q("select * from operator_contacts where certificate_designator=?", (ro["operator_cd"],), one=True))

@app.route("/operator")
@login_required("operator")
def operator_dash():
    u = user(); cd = u["operator_cd"] or (request.args.get("cd") if u["role"] == "admin" else None)
    op = q("select * from operators where certificate_designator=?", (cd,), one=True) or abort(404)
    reqs = q("select ro.*, r.code, r.from_apt, r.to_apt, r.depart_at, r.pax, r.status rstatus from request_ops ro join requests r on r.id=ro.request_id where ro.operator_cd=? order by ro.id desc limit 50", (cd,))
    fleet = q("select * from aircraft where approved=1 and certificate_designator=? order by aircraft_type, registration", (cd,))
    board = q("select r.* from requests r where r.status in ('open','quoted') and r.scope in ('category','board') order by r.id desc limit 30")
    wins = q("select b.*, r.code, r.from_apt, r.to_apt from bookings b join quotes x on x.id=b.quote_id join requests r on r.id=b.request_id where x.operator_cd=? order by b.id desc", (cd,))
    return render_template("op_dash.html", op=op, reqs=reqs, fleet=fleet, board=board, wins=wins)

# ---------------------------------------------------------------- files
@app.route("/files/<name>")
def files(name):
    if not re.fullmatch(r"[0-9a-f]{32}\.(pdf|png|jpg|jpeg)", name): abort(404)
    u = user(); ok = bool(u and u["role"] == "admin")
    if not ok and u:
        ok = bool(q("select 1 from quotes x join requests r on r.id=x.request_id where (x.quote_file=? or x.agreement_file=?) and r.user_id=?", (name, name, u["id"]), one=True)
                  or (u["kyc_file"] == name)
                  or q("select 1 from sale_docs d join sale_listings l on l.id=d.listing_id where d.file=? and l.owner_id=?", (name, u["id"]), one=True)
                  or q("select 1 from passengers p join bookings b on b.id=p.booking_id where p.id_file=? and b.user_id=?", (name, u["id"]), one=True))
    if not ok: abort(403)
    return send_from_directory(UPLOADS, name)

# ---------------------------------------------------------------- admin
@app.route("/admin", methods=["GET", "POST"])
@login_required("admin")
def admin():
    if user()["role"] != "admin": abort(403)
    sweep(); view = request.args.get("view", "overview")
    if request.method == "POST":
        f = request.form; act = f.get("act")
        if act == "kyc":
            ok = f.get("result") == "verified"
            ex("update users set kyc_status=?, kyc_note=? where id=?", ("verified" if ok else "failed", f.get("note", ""), f["uid"]))
            t = q("select * from users where id=?", (f["uid"],), one=True)
            mail(t["email"], t["full_name"], "Identity verified" if ok else "We could not verify your ID", "You are verified. Choose a membership to send your first request." if ok else "Your ID could not be verified: " + (f.get("note") or "please upload a clearer photo") + ". You can try again or ask for a manual review.", "client")
        elif act == "member":
            mm = q("select * from memberships where id=?", (f.get("mid"),), one=True)
            if mm and mm["status"] == "pending_payment":
                ex("update memberships set status='active', started=?, renews=? where id=?", (iso(), iso(now() + dt.timedelta(days=30 * TERMS.get(mm["term"], 3))), mm["id"]))
        elif act == "balance":
            amt = cents(f.get("amount"))
            if amt: ex("update users set balance_cents=balance_cents+? where id=? and role='client'", (amt, f.get("uid")))
            else: flash("Enter an amount.")
        elif act == "paid":
            b = q("select * from bookings where id=?", (f.get("bid"),), one=True)
            if b and b["pay_status"] != "paid":
                saving = round(b["price_cents"] * 0.03) if b["pay_method"] == "wire" else 0
                ex("update bookings set pay_status='paid', status='paid', pay_method=coalesce(pay_method,'wire'), wire_saving_cents=? where id=?", (saving, b["id"])); paid_notice(b["id"])
        elif act == "contact":
            ex("insert into operator_contacts(certificate_designator,email,phone,contact_name,status,updated) values(?,?,?,?,?,?) on conflict(certificate_designator) do update set email=excluded.email, phone=excluded.phone, contact_name=excluded.contact_name, updated=excluded.updated",
               (f["cd"], f.get("email", "").strip(), f.get("phone", ""), f.get("contact_name", ""), "active", iso()))
        elif act == "opuser":
            pw = secrets.token_urlsafe(10); em = f.get("email", "").strip().lower(); cd = f.get("cd", "").strip().upper()
            if not EMAIL_RX.match(em) or q("select 1 from users where email=?", (em,), one=True): flash("That email is not valid or already has an account."); return redirect(url_for("admin", view=view))
            if not q("select 1 from operators where certificate_designator=?", (cd,), one=True): flash("No operator has that certificate."); return redirect(url_for("admin", view=view))
            ex("insert into users(email,pw_hash,full_name,role,operator_cd,email_verified,phone_verified,kyc_status,created) values(?,?,?,?,?,1,1,'verified',?)", (em, generate_password_hash(pw), f.get("name", ""), "operator", f["cd"], iso()))
            flash(f"Operator login created. Temporary password: {pw}")
        elif act == "sale":
            pc = cents(f.get("price"))
            cur = q("select * from sale_listings where id=?", (f.get("lid"),), one=True)
            if not cur: abort(404)
            own, man, rec = int(bool(f.get("own_ok"))), int(bool(f.get("mandate_ok"))), int(bool(f.get("records_ok")))
            st = f.get("status") if f.get("status") in ("live", "pending", "sold", "hidden") else "hidden"
            if st == "live" and cur["source"] == "seller" and not (own and rec and (man or cur["seller_role"] != "broker")):
                st = "pending"; flash("Not set live. Verify ownership, the maintenance records" + (" and the broker mandate" if cur["seller_role"] == "broker" else "") + " first.")
            ex("update sale_listings set price_cents=?, hours=?, location=?, description=?, seller_name=?, seller_contact=?, status=?, own_ok=?, mandate_ok=?, records_ok=? where id=?",
               (pc, int(f["hours"]) if (f.get("hours") or "").isdigit() else None, f.get("location", ""), f.get("description", ""), f.get("seller_name", ""), f.get("seller_contact", ""), st, own, man, rec, f["lid"]))
            name = save_upload("photo", ("jpg", "jpeg", "png"))
            if name:
                os.makedirs(SALE_DIR, exist_ok=True); os.replace(os.path.join(UPLOADS, name), os.path.join(SALE_DIR, name))
                ex("insert into sale_photos(listing_id,file,credit) values(?,?,?)", (f["lid"], name, f.get("credit", "")))
        elif act == "sent":
            ex("update outbox set status='sent', sent_at=? where id=?", (iso(), f["oid"]))
        elif act == "import":
            n = 0
            for line in (f.get("csv") or "").splitlines():
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 2 and "@" in parts[1]:
                    ex("insert into operator_contacts(certificate_designator,email,status,updated) values(?,?,?,?) on conflict(certificate_designator) do update set email=excluded.email, updated=excluded.updated", (parts[0].upper(), parts[1], "active", iso())); n += 1
            flash(f"{n} operator emails saved.")
        return redirect(url_for("admin", view=view))
    d = dict(view=view)
    d["stats"] = {k: q(s, one=True)["n"] for k, s in {
        "Clients": "select count(*) n from users where role='client'", "ID reviews waiting": "select count(*) n from users where kyc_status='pending'",
        "Active members": "select count(*) n from memberships where status='active'", "Memberships awaiting payment": "select count(*) n from memberships where status='pending_payment'",
        "Open requests": "select count(*) n from requests where status in ('open','quoted')", "Bookings": "select count(*) n from bookings",
        "Payments awaiting": "select count(*) n from bookings where pay_status<>'paid'", "Emails queued": "select count(*) n from outbox where status='queued'",
        "Operators with an email": "select count(*) n from operator_contacts where email<>''", "Approved aircraft": "select count(*) n from aircraft where approved=1", "Jets for sale, live": "select count(*) n from sale_listings where status='live'", "Sale inquiries": "select count(*) n from sale_inquiries"}.items()}
    if view == "kyc": d["rows"] = q("select * from users where kyc_status='pending' order by id")
    elif view == "members": d["rows"] = q("select m.*, u.email, u.full_name, u.balance_cents from memberships m join users u on u.id=m.user_id order by m.id desc limit 100"); d["users"] = q("select id,email,balance_cents from users where role='client' order by id desc limit 100")
    elif view == "requests": d["rows"] = q("select r.*, u.email, (select count(*) from request_ops o where o.request_id=r.id) n_ops, (select count(*) from quotes x where x.request_id=r.id) n_q from requests r join users u on u.id=r.user_id order by r.id desc limit 100")
    elif view == "payments": d["rows"] = q("select b.*, r.code, u.email from bookings b join requests r on r.id=b.request_id join users u on u.id=b.user_id order by b.id desc limit 100")
    elif view == "outbox":
        kind = request.args.get("kind")
        d["rows"] = q("select * from outbox " + ("where kind=? " if kind else "") + "order by id desc limit 200", (kind,) if kind else ())
    elif view == "sales":
        st = "%" + (request.args.get("s") or "") + "%"
        d["rows"] = q("select l.*, (select count(*) from sale_photos p where p.listing_id=l.id) n_ph from sale_listings l where l.title like ? or l.registration like ? order by (l.status='pending') desc, l.id limit 60", (st, st))
        d["docs"] = {}
        for x in q("select * from sale_docs where listing_id in (%s)" % (",".join(str(r["id"]) for r in d["rows"]) or "0")): d["docs"].setdefault(x["listing_id"], []).append(x)
        d["inq"] = q("select i.*, u.email, u.full_name, u.phone, l.title, l.year, l.registration from sale_inquiries i join users u on u.id=i.user_id join sale_listings l on l.id=i.listing_id order by i.id desc limit 50")
    elif view == "operators":
        s = "%" + (request.args.get("s") or "") + "%"
        d["rows"] = q("""select o.certificate_designator cd, o.operator_name name, count(a.aircraft_id) n, c.email, c.phone, c.contact_name
                         from operators o join aircraft a on a.certificate_designator=o.certificate_designator and a.approved=1
                         left join operator_contacts c on c.certificate_designator=o.certificate_designator
                         where o.operator_name like ? or o.certificate_designator like ? group by 1 order by n desc limit 80""", (s, s))
    return render_template("admin.html", **d)

@app.errorhandler(403)
@app.errorhandler(404)
@app.errorhandler(400)
def _err(e):
    return render_template("message.html", title={403: "Not allowed", 404: "Page not found", 400: "Something was not right"}.get(e.code, "Error"),
                           body=getattr(e, "description", "")), e.code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), debug=False)
