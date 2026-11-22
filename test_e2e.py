"""End to end test. Run: python test_e2e.py  (uses a throwaway copy of exjet.db)"""
import os, io, re, shutil, sqlite3, tempfile, sys
tmp = tempfile.mkdtemp(); shutil.copy("exjet.db", tmp + "/t.db")
os.environ.update(EXJET_DB=tmp + "/t.db", EXJET_UPLOADS=tmp + "/up", EXJET_DEMO="1")
import app as A
A.app.config["TESTING"] = True; A.SALE_DIR = tmp + "/sale"
con = sqlite3.connect(tmp + "/t.db"); con.row_factory = sqlite3.Row
def one(s, a=()): return con.execute(s, a).fetchone()
def tok(c, path="/"):
    with c.session_transaction() as s: s["csrf"] = "t"
    return "t"
def post(c, url, data=None, **k):
    d = dict(data or {}); d["csrf"] = tok(c)
    return c.post(url, data=d, follow_redirects=True, **k)
n = 0
def ok(cond, label):
    global n; n += 1
    print(("PASS " if cond else "FAIL ") + label)
    if not cond: sys.exit(1)
PDF = lambda: (io.BytesIO(b"%PDF-1.4 test"), "a.pdf")

pub = A.app.test_client()
for u in ["/", "/search", "/search?category=Heavy&from=DAL&to=TEB", "/aircraft/citation-x-charter", "/guides", "/operators", "/legal", "/legal/terms",
          "/private-jet-charter/dallas", "/routes/dallas-to-aspen", "/sitemap.xml", "/robots.txt", "/login", "/signup", "/api/airports?q=dal"]:
    r = pub.get(u); ok(r.status_code == 200, f"GET {u}")
tail = one("select registration, aircraft_type, certificate_designator from aircraft where approved=1 and aircraft_type='Citation X' limit 1")
ok(pub.get(f"/aircraft/citation-x/{tail['registration'].lower()}").status_code == 200, "tail page")
ok(pub.get("/trips").status_code == 302, "trips needs login")
ok(pub.post("/logout", data={}).status_code == 400, "POST without csrf rejected")
ok(pub.get("/aircraft/citation-x/n00000").status_code == 404, "unknown tail 404")

c = A.app.test_client()
r = post(c, "/signup", dict(full_name="Jane Client", email="jane@example.com", phone="+12145550100", password="longpassword1", age=1, terms=1, release=1, arbitration=1, esign=1))
ok(b"Verify your email" in r.data, "signup -> verify")
r = post(c, "/signup", dict(full_name="X Y", email="x@example.com", phone="+12145550101", password="longpassword1", age=1, terms=1))
ok(b"Tick every required box" in r.data, "signup blocked without release")
uid = one("select id from users where email='jane@example.com'")["id"]
ok(one("select count(*) n from acceptances where user_id=?", (uid,))["n"] == 5, "5 acceptances recorded")
post(c, "/request/new", {"from": "DAL", "to": "TEB", "date": "2026-12-12T09:00", "pax": 4})
post(c, "/request/operators", {"scope": "type", "types": "Citation X"}); post(c, "/request/extras", {"bags": "4"})
r = post(c, "/request/review", dict(terms=1, release=1)); ok(b"Verify your email" in r.data, "unverified user cannot send a request")
r = post(c, "/verify", dict(kind="email", code="000000")); ok(b"not right" in r.data, "wrong code rejected")
for k in ("email", "phone"):
    post(c, "/verify", dict(kind=k, code=one("select code from codes where user_id=? and kind=?", (uid, k))["code"]))
r = c.get("/verify", follow_redirects=True); ok(b"Verify your identity" in r.data, "codes -> identity step")
r = post(c, "/kyc", {"license": (io.BytesIO(b"x"), "id.exe")}, content_type="multipart/form-data"); ok(b"File must be" in r.data, "bad upload type rejected")
r = post(c, "/kyc", {"license": (io.BytesIO(b"\xff\xd8"), "id.jpg")}, content_type="multipart/form-data"); ok(b"In review" in r.data, "ID uploaded, pending")
kf = one("select kyc_file from users where id=?", (uid,))["kyc_file"]
ok(pub.get("/files/" + kf).status_code == 403, "ID file private to others")

ad = A.app.test_client(); post(ad, "/login", dict(email="admin@exjet.com", password="admin-test-pw-1"))
ok(c.get("/admin").status_code == 403, "client cannot open admin")
post(ad, "/admin?view=kyc", dict(act="kyc", uid=uid, result="verified")); con.commit()
ok(one("select kyc_status s from users where id=?", (uid,))["s"] == "verified", "admin verifies ID")
r = post(c, "/request/review", dict(terms=1, release=1)); ok(b"Choose your membership" in r.data, "no membership -> cannot send")
r = post(c, "/membership", dict(plan="business", term="annual", seats=3, agree=1, pay="wire"))
m = one("select * from memberships where user_id=?", (uid,)); ok(m["amount_cents"] == (149900 + 2 * 15000) * 12, "business annual 3 seats = $21,588")
ok(A.price("individual", "quarterly", 1) == 449700 and A.price("individual", "6mo", 1) == 899400 and A.price("individual", "annual", 1) == 1798800, "individual term prices")
post(ad, "/admin?view=members", dict(act="member", mid=m["id"]))
r = post(c, "/team", dict(full_name="Bob Two", email="bob@example.com", authorized=1)); ok(b"Invite sent" in r.data, "team user added")

r = c.get("/request/review"); n_ops = one("select count(distinct certificate_designator) n from aircraft where approved=1 and aircraft_type='Citation X'")["n"]
ok(f"Send to {n_ops} operators".encode() in r.data, f"review shows {n_ops} Citation X operators")
r = post(c, "/request/review", dict(terms=1)); ok(b"Tick the terms and the release" in r.data, "release required to send")
r = post(c, "/request/review", dict(terms=1, release=1)); req = one("select * from requests order by id desc limit 1")
ok(req and req["status"] == "open" and req["hold_cents"] == 399800 and req["domestic"] == 1, "request created, domestic hold $3,998")
ok(one("select count(*) n from request_ops where request_id=?", (req["id"],))["n"] == n_ops, "one link per operator")
ok(one("select count(*) n from outbox where kind='rfq' and ref=?", (req["code"],))["n"] == n_ops, f"{n_ops} operator emails in outbox")
ok(one("select count(*) n from outbox where kind='rfq' and status='sent'")["n"] == 0, "nothing actually sent")

c2 = A.app.test_client(); post(c2, "/signup", dict(full_name="Other Person", email="o@example.com", phone="+12145550102", password="longpassword1", age=1, terms=1, release=1, arbitration=1, esign=1))
ok(c2.get("/trips/" + req["code"]).status_code == 403, "other client cannot see the trip")

ros = con.execute("select * from request_ops where request_id=? limit 2", (req["id"],)).fetchall()
op = A.app.test_client(); r = op.get("/o/" + ros[0]["token"]); ok(r.status_code == 200 and b"Jane Client" not in r.data, "operator page opens, client name hidden")
ac = one("select aircraft_id from aircraft where approved=1 and certificate_designator=? and aircraft_type='Citation X'", (ros[0]["operator_cd"],))
base = dict(aircraft_id=ac["aircraft_id"], price="28,500", valid_hours=48, cancel_terms="100% within 72 hours", confirm=1, email="desk@op1.example")
r = post(op, "/o/" + ros[0]["token"], dict(base), content_type="multipart/form-data"); ok(b"Attach your charter agreement" in r.data, "quote needs the agreement PDF")
r = post(op, "/o/" + ros[0]["token"], dict(base, agreement=PDF()), content_type="multipart/form-data"); ok(b"Quote sent" in r.data, "operator 1 quotes $28,500")
ac2 = one("select aircraft_id from aircraft where approved=1 and certificate_designator=? and aircraft_type='Citation X'", (ros[1]["operator_cd"],))
post(op, "/o/" + ros[1]["token"], dict(base, aircraft_id=ac2["aircraft_id"], price="31000", agreement=PDF()), content_type="multipart/form-data")
other = one("select aircraft_id from aircraft where approved=1 and certificate_designator<>? limit 1", (ros[0]["operator_cd"],))
r = post(op, "/o/" + ros[0]["token"], dict(base, aircraft_id=other["aircraft_id"], agreement=PDF()), content_type="multipart/form-data"); ok(b"Choose which of your aircraft" in r.data, "operator cannot quote another operator's tail")
con.commit(); qs = con.execute("select * from quotes where request_id=? order by price_cents", (req["id"],)).fetchall()
ok(len(qs) == 2 and qs[0]["price_cents"] == 2850000, "2 quotes stored, price unchanged")
r = c.get("/trips/" + req["code"]); opname = one("select operator_name n from operators where certificate_designator=?", (ros[0]["operator_cd"],))["n"]
ok(b"$28,500" in r.data and opname.encode() not in r.data.replace(b"&amp;", b"&"), "client compares quotes, operator name hidden before signing")
fet, seg, total = 213750, 520 * 4, 2850000 + 213750 + 2080
ok(A.money(total).encode() in r.data, f"total with FET and segment fees {A.money(total)}")
ok(c2.get("/files/" + qs[0]["agreement_file"]).status_code == 403 and c.get("/files/" + qs[0]["agreement_file"]).status_code == 200, "agreement visible to the client only")
r = c.get(f"/quote/{qs[0]['id']}/sign"); ok(opname.encode() in r.data.replace(b"&amp;", b"&"), "operator legal name shown at contract")
r = post(c, f"/quote/{qs[0]['id']}/sign", dict(agreement=1, cancel=1, release=1, signed_name="Wrong Name")); ok(b"exactly as on your account" in r.data, "signature must match legal name")
r = post(c, f"/quote/{qs[0]['id']}/sign", dict(agreement=1, cancel=1, signed_name="Jane Client")); ok(b"Tick all three" in r.data, "release required to sign")
r = post(c, f"/quote/{qs[0]['id']}/sign", dict(agreement=1, cancel=1, release=1, signed_name="Jane Client")); b = one("select * from bookings order by id desc limit 1")
ok(b and b["total_cents"] == total and b["pay_status"] == "awaiting", "booking created, payment awaiting")
ok(one("select status s from quotes where id=?", (qs[1]["id"],))["s"] == "not_selected", "other quote closed")
r = post(c, f"/booking/{b['id']}/manifest", dict(add=1, full_name="Jane Client")); ok(b"opens once payment is received" in r.data, "manifest locked before payment")
r = post(c, f"/booking/{b['id']}/pay", dict(method="card")); ok(b"not switched on" in r.data, "card payment is off")
post(c, f"/booking/{b['id']}/pay", dict(method="wire")); post(ad, "/admin?view=payments", dict(act="paid", bid=b["id"])); con.commit()
b = one("select * from bookings where id=?", (b["id"],)); ok(b["pay_status"] == "paid" and b["wire_saving_cents"] == 85500, "admin marks wire received, 3% saving")
post(c, f"/booking/{b['id']}/manifest", dict(add=1, full_name="Jane Client", dob="1980-01-01", weight="150", contact="jane@example.com"), content_type="multipart/form-data")
post(c, f"/booking/{b['id']}/manifest", dict(add=1, full_name="Kid Client", dob="2015-01-01", weight="80", minor=1), content_type="multipart/form-data")
r = post(c, f"/booking/{b['id']}/manifest", dict(submit=1)); ok(b"Still waiting on the release from: Jane Client" in r.data, "manifest blocked until adult releases")
con.commit(); p = one("select * from passengers where booking_id=? and is_minor=0", (b["id"],)); px = A.app.test_client()
r = post(px, "/r/" + p["token"], dict(release=1, policy=1, full_name="Someone Else")); ok(b"exactly as the booker" in r.data, "passenger name must match")
r = post(px, "/r/" + p["token"], dict(release=1, policy=1, full_name="jane client")); ok(b"Accepted" in r.data, "passenger accepts release by link, no login")
r = post(c, f"/booking/{b['id']}/manifest", dict(submit=1)); tailno = one("select a.registration r from quotes x join aircraft a on a.aircraft_id=x.aircraft_id where x.id=?", (qs[0]["id"],))["r"]
ok(b"Trip confirmed" in r.data and tailno.encode() in r.data, "manifest sent, tail number revealed")
ok(c.get(f"/booking/{b['id']}/receipt").status_code == 200, "receipt")
for v in ["overview", "kyc", "members", "requests", "payments", "outbox", "operators"]: ok(ad.get("/admin?view=" + v).status_code == 200, "admin " + v)
post(ad, "/admin?view=operators", dict(act="opuser", cd=ros[0]["operator_cd"], name="Desk", email="desk@op1.example")); con.commit()
ok(one("select count(*) n from users where role='operator'")["n"] == 1, "operator login created")

# balance covers hold, international hold, expiry sweep
post(ad, "/admin?view=members", dict(act="balance", uid=uid, amount="100000"))
post(c, "/request/new", {"from": "DAL", "to": "MMUN", "date": "2026-12-20T09:00", "pax": 2}); post(c, "/request/operators", {"scope": "category"}); post(c, "/request/extras", {})
post(c, "/request/review", dict(terms=1, release=1)); con.commit(); r2 = one("select * from requests order by id desc limit 1")
ok(r2["domestic"] == 0 and r2["hold_status"] == "covered_by_balance" and r2["hold_cents"] == 0, "international, balance replaces hold")
con.execute("update users set balance_cents=0 where id=?", (uid,)); con.commit()
post(c, "/request/new", {"from": "DAL", "to": "MMUN", "date": "2026-12-21T09:00", "pax": 2}); post(c, "/request/operators", {"scope": "category"}); post(c, "/request/extras", {}); post(c, "/request/review", dict(terms=1, release=1)); con.commit()
r3 = one("select * from requests order by id desc limit 1"); ok(r3["hold_cents"] == 799800, "international hold $7,998")
con.execute("update requests set created='2026-01-01T00:00:00' where id=?", (r3["id"],)); con.commit(); c.get("/trips"); con.commit()
ok(one("select status s, hold_status h from requests where id=?", (r3["id"],))["h"] == "released", "no quotes in 24 h -> closed, hold released")
# jets for sale
ok(pub.get("/for-sale").status_code == 200 and b"543 aircraft" in pub.get("/for-sale").data, "for sale list shows 543")
ok(one("select count(*) n from sale_listings where title like '%Learjet%' or title like '%G200%' or title like '%Mustang%' or title like '%Phenom 100%'")["n"] == 0, "no unapproved types for sale")
ok(b"G550" in pub.get("/for-sale?category=ULR&s=G550").data, "for sale filter")
L = one("select * from sale_listings limit 1"); ok(pub.get(f"/for-sale/{L['id']}").status_code == 200, "sale detail")
with pub.session_transaction() as s_: s_["csrf"] = "t"
ok(pub.post(f"/for-sale/{L['id']}", data=dict(csrf="t", terms=1)).status_code == 302, "inquiry needs login")
r = post(c, f"/for-sale/{L['id']}", dict(terms=1, message="Price?", interest="Lease")); con.commit(); ok(b"Inquiry sent" in r.data and one("select count(*) n from sale_inquiries")["n"] == 1, "inquiry stored")
SELL = dict(manufacturer="Gulfstream", title="Gulfstream G550", category="ULR", year=2010, registration="n1zz", price="15,500,000", hours="3240", seller_role="broker", authorized=1, terms=1)
r = post(c, "/for-sale/sell", dict(SELL, doc_ownership=PDF(), doc_status=PDF()), content_type="multipart/form-data"); ok(b"Required documents are missing: Signed listing mandate" in r.data, "broker cannot list without a mandate")
r = post(c, "/for-sale/sell", dict(SELL, doc_ownership=PDF(), doc_status=PDF(), doc_mandate=PDF()), content_type="multipart/form-data"); con.commit(); ok(b"Maintenance status" in r.data and b"96 month inspection" in r.data, "docs accepted, Gulfstream inspection template loaded")
S = one("select * from sale_listings order by id desc limit 1"); ok(S["status"] == "pending" and S["price_cents"] == 1550000000, "seller listing pending review")
ok(pub.get(f"/for-sale/{S['id']}").status_code == 404, "pending listing hidden from public")
r = post(ad, "/admin?view=sales", dict(act="sale", lid=S["id"], status="live", price="15500000"), content_type="multipart/form-data"); con.commit()
ok(b"Not set live" in r.data and pub.get(f"/for-sale/{S['id']}").status_code == 404, "cannot go live until ownership, mandate and records are verified")
D = one("select file from sale_docs where listing_id=? and kind='ownership'", (S["id"],))["file"]; ok(pub.get("/files/" + D).status_code == 403 and c2.get("/files/" + D).status_code == 403 and c.get("/files/" + D).status_code == 200, "seller documents are private")
it = one("select id from sale_items where listing_id=? and item='96 month inspection'", (S["id"],))["id"]
post(c, f"/for-sale/{S['id']}/records", {"hours": "3240", "landings": "1410", "engine_program": "CorporateCare", f"st_{it}": "Due now", f"ld_{it}": "Mar 2018", f"nd_{it}": "Mar 2026"}); con.commit()
ok(c2.get(f"/for-sale/{S['id']}/records").status_code == 403, "only the seller edits the maintenance status")
post(ad, "/admin?view=sales", dict(act="sale", lid=S["id"], status="live", price="15500000", own_ok=1, mandate_ok=1, records_ok=1, photo=(io.BytesIO(b"\xff\xd8"), "p.jpg")), content_type="multipart/form-data"); con.commit()
r = pub.get(f"/for-sale/{S['id']}"); ok(b"96 month inspection" in r.data and b"Due now" in r.data and b"CorporateCare" in r.data and b"Broker with mandate" in r.data, "public listing shows what is due and the verified status")
ok(b"$15,500,000" in pub.get(f"/for-sale/{S['id']}").data and one("select count(*) n from sale_photos where listing_id=?", (S["id"],))["n"] == 1, "admin approves, price and photo show")
ok(one("select count(*) n from outbox where to_addr='sales@exjet.com' and subject like 'Lease inquiry%'")["n"] == 1, "sale inquiry goes to sales@exjet.com with interest")
ok(one("select count(*) n from outbox where to_addr='charter@exjet.com' and subject like 'RFQ %'")["n"] == 3, "each RFQ copied to charter@exjet.com")
SP = one("select file from sale_photos limit 1")["file"]; ok(pub.get("/sale-photo/" + SP).status_code == 200 and pub.get("/static/style.css").status_code == 200, "sale photos and the stylesheet are served")
ok(ad.get("/admin?view=sales").status_code == 200 and b"/for-sale/" in pub.get("/sitemap.xml").data, "admin sales view, sitemap")
# review fixes
ok(pub.get("/search?page=abc").status_code == 200 and pub.get("/for-sale?page=x").status_code == 200, "bad page numbers do not crash")
ok(b"sort=seats" in pub.get("/search?sort=year&category=Heavy").data, "sort links rebuild the query")
r = post(A.app.test_client(), "/signup", dict(full_name="No Phone", email="np@example.com", phone="12", password="longpassword1", age=1, terms=1, release=1, arbitration=1, esign=1)); ok(b"mobile number" in r.data, "signup needs a real phone number")
r = post(c, "/kyc", {"license": (io.BytesIO(b"<html>"), "id.jpg")}, content_type="multipart/form-data"); ok(b"not a valid JPG" in r.data, "upload contents are checked, not just the name")
r = post(c, "/request/new", {"from": "DAL", "to": "DAL", "date": "2026-12-30T09:00", "pax": 2}); ok(b"must be different" in r.data, "same airport both ends rejected")
r = post(c, "/request/new", {"from": "DAL", "to": "TEB", "date": "2020-01-01T09:00", "pax": 2}); ok(b"in the future" in r.data, "past departure rejected")
r = post(c, "/request/new", {"from": "DAL", "to": "TEB", "date": "2026-12-30T09:00", "ret": "2026-12-29T09:00", "pax": "lots"}); ok(b"after the departure" in r.data, "return before departure rejected")
r = post(c, "/team", dict(full_name="C Three", email="c3@example.com", authorized=1)); r = post(c, "/team", dict(full_name="D Four", email="d4@example.com", authorized=1)); ok(b"All seats are in use" in r.data, "team cannot exceed paid seats")
r = post(c, "/membership", dict(plan="individual", term="quarterly", agree=1)); ok(b"already have a membership" in r.data, "no second membership on top of an active one")
post(c, "/membership", dict(cancel=1)); con.commit(); ok(one("select status s from memberships where user_id=?", (uid,))["s"] == "ending" and A.app.test_request_context() and b"Access continues until" in c.get("/account").data, "cancel keeps access to the end of the paid term")
with A.app.app_context(): ok(A.is_member(uid), "cancelled member can still request until the term ends")
post(pub, "/forgot", dict(email="jane@example.com")); con.commit(); code = one("select code from codes where user_id=? and kind='reset'", (uid,))["code"]
ok(pub.get("/reset/nope", follow_redirects=True).data.count(b"not valid") == 1, "bad reset link refused")
post(pub, f"/reset/{code}", dict(password="brandnewpass99")); nc = A.app.test_client(); r = post(nc, "/login", dict(email="jane@example.com", password="brandnewpass99")); ok(b"Trips" in r.data and nc.get("/trips").status_code == 200, "password reset works")
r = post(nc, "/login", dict(email="jane@example.com", password="longpassword1")); ok(b"not right" in r.data, "old password no longer works")
ok(pub.get("/aircraft/wrong-type/" + tail["registration"].lower()).status_code == 301, "tail pages redirect to one address")
r = post(ad, "/admin?view=operators", dict(act="opuser", cd="ZZZZ", email="a@b.co")); ok(b"No operator has that certificate" in r.data, "operator login needs a real certificate")
r = post(ad, "/admin?view=members", dict(act="balance", uid=uid, amount="abc")); ok(b"Enter an amount" in r.data, "bad admin amount does not crash")
print(f"\nALL {n} CHECKS PASSED")
