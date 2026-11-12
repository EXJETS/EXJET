"""The whole product loop through the HTTP API with fake providers:
signup -> KYC -> vendor check -> admin approval -> checkout -> intake -> match -> listings -> RFQ ->
operator reply with PDFs -> quote ingest -> accept -> contract -> mark paid -> manifest -> flight watch + weather."""
from datetime import UTC, datetime, timedelta

from exjet_product.flight_watch import FlightSnapshot
from helpers import (
    PASSWORD,  # noqa: F401
    PNG,
    b64,
    contract_pdf,
    login,
    quote_pdf,
    run_jobs,
    seed_all,
    signup,
)
from sqlalchemy import select

from exjet_api import clock
from exjet_api.models import AgentAction, EmailMessage, Job
from exjet_api.providers import get_adsb, get_mail, get_weather
from exjet_api.providers.billing import FakeBilling


def test_full_product_loop(db, client, make_client):
    clock.set_now(datetime(2026, 11, 12, 15, 0, tzinfo=UTC))  # Thursday
    admin, ops = seed_all(db)
    member = client
    adm = make_client()

    # ---- signup + KYC submit
    me = signup(member, "pat@example.com", "Pat Member").json()
    assert me["next_step"] == "kyc"
    r = member.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "Pat Member", "doc_types": ["passport"]},
                    files=[("files", ("passport.png", PNG, "image/png"))])
    assert r.status_code == 201 and r.json()["status"] == "submitted"
    assert member.get("/v1/me").json()["next_step"] == "kyc_pending"
    assert member.post("/v1/billing/checkout", json={"plan": "individual"}).json()["error"]["code"] == "kyc_required"
    assert member.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "x", "doc_types": ["passport"]},
                       files=[("files", ("p.png", PNG, "image/png"))]).status_code == 409

    # ---- vendor check queues a final approval; member cannot decide it
    assert run_jobs() >= 1
    assert member.get("/v1/kyc/status").json()["kyc_status"] == "in_review"
    assert member.get("/v1/admin/approvals").status_code == 403
    assert login(adm, "admin@example.com").status_code == 200
    pend = adm.get("/v1/admin/approvals", params={"status": "pending", "kind": "kyc_final"}).json()
    assert len(pend) == 1
    detail = adm.get(f"/v1/admin/kyc/submissions/{pend[0]['subject_id']}").json()
    assert detail["holder_name"] == "Pat Member" and detail["vendor_result"]["document_authentic"] is True
    assert len(detail["documents"]) == 1 and detail["documents"][0]["url"].startswith("/v1/files/")
    signed = adm.get(detail["documents"][0]["url"])
    assert signed.status_code == 200 and signed.content == PNG
    dec = adm.post(f"/v1/admin/approvals/{pend[0]['id']}/decide", json={"decision": "approved", "note": "docs ok"})
    assert dec.status_code == 200 and dec.json()["status"] == "approved"
    assert adm.post(f"/v1/admin/approvals/{pend[0]['id']}/decide", json={"decision": "approved"}).json()["error"]["code"] == "already_decided"

    # ---- billing (fake): checkout then signed webhook
    me = member.get("/v1/me").json()
    assert me["account"]["kyc_status"] == "approved" and me["next_step"] == "billing" and me["entitled"] is False
    plans = member.get("/v1/billing/plans").json()
    assert [(p["plan"], p["unit_amount_cents"]) for p in plans] == [("individual", 75000), ("family_office", 100000), ("enterprise", None)]
    assert member.post("/v1/billing/checkout", json={"plan": "individual"}).json()["checkout_url"].startswith("http")
    billing = FakeBilling()
    body, sig = billing.make_event("checkout.completed", __import__("uuid").UUID(me["account"]["id"]), "individual",
                                   int(clock.now().timestamp()) + 30 * 86400)
    assert member.post("/v1/billing/webhook", content=body, headers={"X-Webhook-Signature": "bad"}).status_code == 400
    assert member.post("/v1/billing/webhook", content=body, headers={"X-Webhook-Signature": sig}).status_code == 200
    me = member.get("/v1/me").json()
    assert me["entitled"] is True and me["next_step"] == "ready" and me["subscription"]["status"] == "active"

    # ---- plain-language intake -> trip
    draft = member.post("/v1/trips/intake", json={"text": "Teterboro to Chicago Midway on 2026-11-20 9am, 4 passengers, 2 checked bags"}).json()
    assert draft["unresolved"] == [] and draft["passengers"] == 4 and draft["checked_bags"] == 2
    assert draft["legs"][0]["origin_icao"] == "KTEB" and draft["legs"][0]["destination_icao"] == "KMDW"
    assert member.get("/v1/trips").json() == []  # intake does not save
    trip = member.post("/v1/trips", json=draft)
    assert trip.status_code == 201
    trip = trip.json()
    tid = trip["id"]
    assert trip["status"] == "draft" and trip["legs"][0]["distance_nm"] and trip["manifest"] is None
    first_dep = datetime.fromisoformat(trip["legs"][0]["depart_at"])
    assert first_dep == datetime(2026, 11, 20, 14, 0, tzinfo=UTC)

    # ---- match + listings
    m = member.get(f"/v1/trips/{tid}/match").json()
    assert m["legs"][0]["distance_nm"] == trip["legs"][0]["distance_nm"]
    cats = {c["category"]: c for c in m["categories"]}
    assert "midsize" in cats and "ultra_long_range" in cats
    xls = next(t for t in cats["midsize"]["types"] if t["slug"] == "cessna-citation-xls-plus")
    assert xls["stops"] == 0 and xls["fuel_stop_icao"] is None and xls["flight_time_minutes"] > 0
    assert xls["listing_count"] == 1  # N00TST1 only: operator B is not live, X is excluded (N00TST7)
    listings = member.get(f"/v1/trips/{tid}/listings", params={"type_slug": "cessna-citation-xls-plus"}).json()
    assert [(l["tail_number"], l["operator"]["dba_name"]) for l in listings] == [("N00TST1", "SYNTHETIC Test Operator A")]
    listing_id = listings[0]["listing_id"]

    # ---- RFQ dispatch through mailer.send
    rfqs = member.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [listing_id]})
    assert rfqs.status_code == 201 and rfqs.json()[0]["status"] == "queued"
    ref = rfqs.json()[0]["reference"]
    assert ref.startswith("EXJ-")
    run_jobs()
    outbox = get_mail().outbox
    assert len(outbox) == 1
    msg, _ = outbox[0]
    assert msg.to == ["ops-a@example.com"] and msg.from_address == "quotes@exjet.com" and ref in msg.subject
    for needle in ("KTEB", "KMDW", "Passengers: 4", "2 checked bags", "PDF", "Pat Member", "payment link"):
        assert needle in msg.body_text
    assert "$" not in msg.body_text
    t = member.get(f"/v1/trips/{tid}").json()
    assert t["status"] == "rfq_sent" and t["rfqs"][0]["status"] == "sent" and t["rfqs"][0]["listing"]["tail_number"] == "N00TST1"
    row = db.execute(select(EmailMessage).where(EmailMessage.purpose == "rfq")).scalar_one()
    assert row.status == "sent" and row.direction == "outbound"
    assert db.execute(select(AgentAction).where(AgentAction.event == "rfq.dispatch", AgentAction.status == "done")).first()

    # ---- operator replies with a quote PDF and a contract PDF
    r = adm.post("/v1/dev/inbound-email", json={
        "from_address": "ops-a@example.com", "subject": f"Re: [{ref}] Charter request: KTEB to KMDW",
        "body": "Please find our quote and agreement attached.",
        "attachments": [{"filename": "quote.pdf", "content_base64": b64(quote_pdf())},
                        {"filename": "agreement.pdf", "content_base64": b64(contract_pdf("Pat Member"))}]})
    assert r.status_code == 202
    assert adm.post("/v1/dev/run-jobs").json()["ran"] >= 2
    quotes = member.get(f"/v1/trips/{tid}/quotes").json()
    assert len(quotes) == 1
    q = quotes[0]
    assert q["status"] == "ready" and q["total_amount_cents"] == 4_520_000 and q["currency"] == "USD"
    assert q["operator_quote_number"] == "Q-TEST-0001" and q["operator"]["dba_name"] == "SYNTHETIC Test Operator A"
    assert [i["amount_cents"] for i in q["line_items"]] == [4_100_000, 420_000]
    assert q["contract"]["acknowledged_at"] is None
    assert q["payment_link"] == {"url": "https://pay.example.com/checkout/synthetic-123", "host": "pay.example.com", "status": "pending"}
    assert member.get(f"/v1/trips/{tid}").json()["status"] == "quoted"
    notes = get_mail().sent_to("pat@example.com")
    assert len(notes) == 1 and "SYNTHETIC" not in notes[0].body_text and "$" not in notes[0].body_text  # no operator, no amount
    pdf = member.get(q["quote_pdf_url"], follow_redirects=False)
    assert pdf.status_code == 302 and pdf.headers["location"].startswith("/v1/files/")
    assert member.get(pdf.headers["location"]).content.startswith(b"%PDF")

    # ---- accept, acknowledge contract, mark paid
    assert member.post(f"/v1/contracts/{q['contract']['id']}/acknowledge").json()["error"]["code"] == "invalid_state"
    assert member.post(f"/v1/quotes/{q['id']}/payment/mark-paid").status_code == 409
    acc = member.post(f"/v1/quotes/{q['id']}/accept")
    assert acc.status_code == 200 and acc.json()["status"] == "contracted" and acc.json()["accepted_quote_id"] == q["id"]
    ack = member.post(f"/v1/contracts/{q['contract']['id']}/acknowledge")
    assert ack.status_code == 200 and ack.json()["acknowledged_at"]
    paid = member.post(f"/v1/quotes/{q['id']}/payment/mark-paid")
    assert paid.status_code == 200
    p = paid.json()
    assert p["status"] == "manifest_due"
    assert datetime.fromisoformat(p["manifest"]["due_at"]) == first_dep - timedelta(hours=24)
    jobs = {j.kind: j for j in db.execute(select(Job).where(Job.kind == "manifest.remind")).scalars()}
    assert jobs and len(db.execute(select(Job).where(Job.kind == "manifest.remind")).scalars().all()) == 2

    # ---- manifest
    man = member.get(f"/v1/trips/{tid}/manifest").json()
    assert man["required_id_type"] == "real_id" and man["expected_passengers"] == 4 and man["passengers"] == []

    def pax(i, **kw):
        d = {"full_name": f"Passenger {i}", "date_of_birth": "1980-05-05", "id_type": "real_id", "id_number": f"D123456{i}",
             "id_expiry": "2030-01-01", "id_issuer": "NJ"}
        d.update(kw)
        return d

    bad = member.put(f"/v1/trips/{tid}/manifest", json={"passengers": [pax(1, id_type="passport")]})
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "manifest_invalid"
    assert member.post(f"/v1/trips/{tid}/manifest/submit").status_code == 422  # zero passengers saved
    saved = member.put(f"/v1/trips/{tid}/manifest", json={"passengers": [pax(i) for i in range(1, 4)]})
    assert saved.status_code == 200 and saved.json()["passengers"][0]["id_number_last4"] == "4561"
    assert member.post(f"/v1/trips/{tid}/manifest/submit").status_code == 422  # 3 of 4
    member.put(f"/v1/trips/{tid}/manifest", json={"passengers": [pax(i) for i in range(1, 5)]})
    done = member.post(f"/v1/trips/{tid}/manifest/submit")
    assert done.status_code == 200 and done.json()["submitted_at"]
    assert member.get(f"/v1/trips/{tid}").json()["status"] == "scheduled"
    assert member.put(f"/v1/trips/{tid}/manifest", json={"passengers": []}).status_code == 409

    # ---- reminders fire only while the manifest is outstanding (submitted: nothing sent)
    clock.set_now(first_dep - timedelta(hours=25))
    before = len(get_mail().outbox)
    run_jobs()
    assert len(get_mail().outbox) == before

    # ---- flight watch
    assert member.get(f"/v1/trips/{tid}/track").json()["legs"] == [{"sequence": 0, "status": "scheduled", "position": None}]
    clock.set_now(first_dep - timedelta(hours=1, minutes=59))
    adsb = get_adsb()
    adsb.set_snapshot("N00TST1", FlightSnapshot("airborne", 40.1, -80.2, 31000, 440, 285, clock.now()))
    clock.set_now(first_dep - timedelta(hours=1))
    run_jobs()
    tr = member.get(f"/v1/trips/{tid}/track").json()["legs"][0]
    assert tr["status"] == "airborne" and tr["position"]["altitude_ft"] == 31000 and tr["position"]["lat"] == 40.1
    assert member.get(f"/v1/trips/{tid}").json()["status"] == "in_flight"
    adsb.set_snapshot("N00TST1", FlightSnapshot("landed", 41.78, -87.75, 0, 0, 0, clock.now()))
    clock.set_now(first_dep + timedelta(hours=2))
    run_jobs()
    assert member.get(f"/v1/trips/{tid}").json()["status"] == "completed"

    # ---- weather
    w = get_weather()
    w.set_report("KMDW", "KMDW 201551Z 18005KT 2SM BR OVC008 05/04 A2990", "TAF KMDW 201130Z 2012/2118 18005KT 2SM BR OVC008")
    clock.set_now(first_dep - timedelta(hours=3))
    wx = member.get(f"/v1/trips/{tid}/weather").json()["legs"][0]
    assert wx["origin"]["icao"] == "KTEB" and wx["destination"]["metar"].startswith("KMDW") and wx["destination"]["taf"].startswith("TAF")
    assert "KMDW: IFR" in wx["summary"] and "KTEB: VFR" in wx["summary"]

    # ---- metrics come from real rows
    mt = adm.get("/v1/admin/metrics").json()
    assert mt["mrr_cents"] == 75000 and mt["arr_cents"] == 900000 and mt["members_by_plan"] == {"individual": 1}
    assert mt["kyc_queue"] == 0 and mt["rfq_to_quote_rate"] == 1.0 and mt["median_operator_response_minutes"] is not None
    assert adm.get("/v1/admin/agent-actions").json() and adm.get("/v1/admin/jobs").status_code == 200
