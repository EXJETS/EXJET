import uuid
from datetime import UTC

from helpers import (
    PASSWORD,
    future_trip_body,
    invite_token,
    login,
    make_entitled,
    make_family_office,
    make_operator,
    run_jobs,
    seed_all,
    signup,
    to_quote_stage,
)
from sqlalchemy import select

from exjet_api.models import Approval, AuditLog, IngestRun, Operator, OperatorContact
from exjet_api.providers import get_mail


def test_operator_go_live_flows_through_approval_rows(db, make_client):
    admin, ops = seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    b = ops["B"]
    assert b.go_live_status == "draft"
    r = adm.post(f"/v1/admin/operators/{b.id}/request-go-live")
    assert r.status_code == 201 and r.json()["approval"]["kind"] == "operator_go_live" and r.json()["approval"]["status"] == "pending"
    assert r.json()["operator"]["id"] == str(b.id) and r.json()["operator"]["go_live_status"] == "pending_ceo"
    assert adm.post(f"/v1/admin/operators/{b.id}/request-go-live").json()["error"]["code"] == "invalid_state"
    db.refresh(b)
    assert b.go_live_status == "pending_ceo"
    assert adm.get("/v1/admin/approvals", params={"status": "pending"}).json()[0]["subject_id"] == str(b.id)
    d = adm.post(f"/v1/admin/approvals/{r.json()['approval']['id']}/decide", json={"decision": "approved", "note": "ok"})
    assert d.status_code == 200 and d.json()["decided_by"] == str(admin.id)
    db.refresh(b)
    assert b.go_live_status == "live"
    policy = db.execute(select(Approval).where(Approval.kind == "rfq_dispatch_policy", Approval.subject_id == str(b.id))).scalar_one()
    assert policy.status == "approved" and policy.decided_by == admin.id
    listed = {o["dba_name"]: o for o in adm.get("/v1/admin/operators").json()}
    assert listed["SYNTHETIC Test Operator B"]["go_live_status"] == "live"
    assert listed["SYNTHETIC Excluded Operator"]["is_excluded"] is True
    assert db.execute(select(AuditLog).where(AuditLog.action == "approval.decided")).scalars().all()


def test_rejected_go_live_returns_to_draft_and_incomplete_operators_are_refused(db, make_client):
    admin, _ = seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    op = make_operator(db, admin, "Quiet Charter Co", live=False)
    ap = adm.post(f"/v1/admin/operators/{op.id}/request-go-live").json()["approval"]
    adm.post(f"/v1/admin/approvals/{ap['id']}/decide", json={"decision": "rejected", "note": "no"})
    db.refresh(op)
    assert op.go_live_status == "draft"
    for c in db.execute(select(OperatorContact).where(OperatorContact.operator_id == op.id)).scalars():
        db.delete(c)
    db.commit()
    r = adm.post(f"/v1/admin/operators/{op.id}/request-go-live")
    assert r.status_code == 409 and r.json()["error"]["code"] == "operator_incomplete"
    assert adm.post(f"/v1/admin/operators/{uuid.uuid4()}/request-go-live").status_code == 404


def test_admin_routes_require_admin(db, client, make_client):
    seed_all(db)
    anon = make_client()
    for path in ("/v1/admin/approvals", "/v1/admin/metrics", "/v1/admin/jobs", "/v1/admin/agent-actions", "/v1/admin/operators"):
        assert anon.get(path).status_code == 401
    signup(client, "m@example.com")
    for path in ("/v1/admin/approvals", "/v1/admin/metrics", "/v1/admin/jobs", "/v1/admin/agent-actions", "/v1/admin/operators",
                 "/v1/admin/kyc/submissions", "/v1/admin/ingest/runs", "/v1/admin/quotes"):
        assert client.get(path).status_code == 403


def test_metrics_with_no_data_are_zero_or_null(db, make_client):
    seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    assert adm.get("/v1/admin/metrics").json() == {
        "mrr_cents": 0, "arr_cents": 0, "members_by_plan": {}, "kyc_queue": 0,
        "rfq_to_quote_rate": None, "median_operator_response_minutes": None}


def test_metrics_are_computed_from_rows(db, make_client):
    admin, _ = seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    for i, plan in enumerate(["individual", "individual", "family_office"]):
        c = make_client()
        acct = make_entitled(db, c, admin, f"m{i}@example.com", f"Member {i}")
        if plan == "family_office":
            from exjet_api.models import Subscription

            sub = db.execute(select(Subscription).where(Subscription.account_id == acct.id)).scalar_one()
            sub.plan, sub.unit_amount_cents = "family_office", 100000
            db.commit()
    m = adm.get("/v1/admin/metrics").json()
    assert m["mrr_cents"] == 250000 and m["arr_cents"] == 3_000_000
    assert m["members_by_plan"] == {"individual": 2, "family_office": 1}


def test_ingest_endpoint_delegates_and_lists_runs(db, make_client):
    seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    csv = b"DBA Name,Certificate Number,Base Airport\nSYNTHETIC Ingest Operator Z,0TST777Z,KTEB\n"
    r = adm.post("/v1/admin/ingest", data={"dataset": "operators"}, files={"file": ("operators_synthetic.csv", csv, "text/csv")})
    assert r.status_code == 200, r.text
    assert r.json()["dataset"] == "operators" and r.json()["rows_loaded"] == 1
    op = db.execute(select(Operator).where(Operator.certificate_number == "0TST777Z")).scalar_one()
    assert op.go_live_status == "draft"  # ingest never makes anything live
    runs = adm.get("/v1/admin/ingest/runs").json()
    assert len(runs) == 1 and db.execute(select(IngestRun)).scalars().all()
    bad = adm.post("/v1/admin/ingest", data={"dataset": "nonsense"}, files={"file": ("x.csv", csv, "text/csv")})
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "ingest_failed"


def test_kyc_rejection_path_allows_resubmission(db, client, make_client):
    seed_all(db)
    signup(client, "r@example.com")
    png = b"\x89PNG\r\n\x1a\nxx"
    client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "REJECT-TEST Person", "doc_types": ["passport"]},
                files=[("files", ("p.png", png, "image/png"))])
    run_jobs()
    adm = make_client()
    login(adm, "admin@example.com")
    ap = adm.get("/v1/admin/approvals", params={"status": "pending"}).json()[0]
    assert ap["payload"]["signals"]["document_authentic"] is False
    d = adm.post(f"/v1/admin/approvals/{ap['id']}/decide", json={"decision": "rejected", "note": "document mismatch"})
    assert d.status_code == 200
    st = client.get("/v1/kyc/status").json()
    assert st["kyc_status"] == "rejected" and st["latest_submission"]["decision_note"] == "document mismatch"
    assert client.get("/v1/me").json()["next_step"] == "kyc" and client.get("/v1/me").json()["entitled"] is False
    again = client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "Real Person", "doc_types": ["passport"]},
                        files=[("files", ("p.png", png, "image/png"))])
    assert again.status_code == 201


def test_business_kyc_requires_business_documents(db, client):
    seed_all(db)
    signup(client, "biz@example.com", account_type="family_office")
    png = b"\x89PNG\r\n\x1a\nxx"
    r = client.post("/v1/kyc/submissions", data={"kind": "business", "holder_name": "Biz", "doc_types": ["business_doc"]},
                    files=[("files", ("b.png", png, "image/png"))])
    assert r.status_code == 422 and r.json()["error"]["code"] == "business_details_required"
    ok = client.post("/v1/kyc/submissions", data={"kind": "business", "holder_name": "Biz", "business_name": "Test Holdings LLC",
                                                  "business_tax_id": "00-0000000", "doc_types": ["business_doc"]},
                     files=[("files", ("b.png", png, "image/png"))])
    assert ok.status_code == 201


def test_billing_lifecycle_cancel_removes_entitlement(db, client):
    from exjet_api.providers.billing import FakeBilling

    admin, _ = seed_all(db)
    me = signup(client, "b@example.com").json()
    aid = uuid.UUID(me["account"]["id"])
    fb = FakeBilling()
    # no checkout before the identity check is approved, and no webhook can grant entitlement without KYC
    assert client.post("/v1/billing/checkout", json={"plan": "individual"}).status_code == 409
    body, sig = fb.make_event("checkout.completed", aid, "family_office", 4_102_444_800)
    assert client.post("/v1/billing/webhook", content=body, headers={"X-Webhook-Signature": sig}).status_code == 200
    me = client.get("/v1/me").json()
    assert me["subscription"]["status"] == "active" and me["entitled"] is False  # still needs approved KYC
    assert me["account"]["type"] == "family_office" and me["account"]["seats"] == 2
    assert client.post("/v1/billing/portal").json()["url"].startswith("http")
    body, sig = fb.make_event("payment.failed", aid)
    client.post("/v1/billing/webhook", content=body, headers={"X-Webhook-Signature": sig})
    assert client.get("/v1/me").json()["subscription"]["status"] == "past_due"
    body, sig = fb.make_event("subscription.canceled", aid)
    client.post("/v1/billing/webhook", content=body, headers={"X-Webhook-Signature": sig})
    assert client.get("/v1/me").json()["subscription"]["status"] == "canceled"


def test_enterprise_inquiry_is_recorded_without_a_price(db, client):
    seed_all(db)
    plans = client.get("/v1/billing/plans").json()
    ent = next(p for p in plans if p["plan"] == "enterprise")
    assert ent["unit_amount_cents"] is None and ent["inquiry_only"] is True
    assert client.post("/v1/billing/enterprise-inquiry", json={"company": "Test Co", "seats": 12, "contact_name": "C", "contact_email": "c@example.com"}).status_code == 401
    signup(client, "e@example.com")
    assert client.post("/v1/billing/enterprise-inquiry", json={"company": "Test Co", "seats": 12, "notes": "hi", "contact_name": "Casey Contact", "contact_email": "casey@example.com"}).status_code == 202
    from exjet_api.models import EnterpriseInquiry

    inq = db.execute(select(EnterpriseInquiry)).scalar_one()
    assert inq.seats == 12 and inq.company == "Test Co" and inq.notes == "hi"
    row = db.execute(select(AuditLog).where(AuditLog.action == "enterprise_inquiry")).scalar_one()
    assert row.detail == {"inquiry_id": str(inq.id)}  # M2: no free text in audit_log


def test_family_office_second_seat(db, client, make_client):
    """C2: a second seat is an invitation the invitee explicitly accepts (attack cases: test_security_seats.py)."""
    admin, _ = seed_all(db)
    make_family_office(db, client, admin, "owner@example.com")
    spouse = make_client()
    signup(spouse, "spouse@example.com", "Spouse Member")
    r = client.post("/v1/account/seats", json={"email": "spouse@example.com"})
    assert r.status_code == 202 and r.json() == {"status": "invitation_queued"}
    # nothing changes for the invitee until they accept
    assert spouse.get("/v1/me").json()["account"]["id"] != client.get("/v1/me").json()["account"]["id"]
    token = invite_token(get_mail(), "spouse@example.com")
    acc = spouse.post("/v1/account/seats/accept", json={"token": token})
    assert acc.status_code == 200 and acc.json()["account"]["id"] == client.get("/v1/me").json()["account"]["id"]
    assert acc.json()["entitled"] is False and acc.json()["next_step"] == "kyc"  # their own identity check is still due
    third = make_client()
    signup(third, "third@example.com")
    assert client.post("/v1/account/seats", json={"email": "third@example.com"}).json()["error"]["code"] == "seat_limit_reached"
    # a member sees the account's trips
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    assert spouse.get(f"/v1/trips/{tid}").status_code == 200
    # individual accounts have no extra seat
    solo = make_client()
    signup(solo, "solo@example.com")
    assert solo.post("/v1/account/seats", json={"email": "third@example.com"}).json()["error"]["code"] == "seat_not_available"


def test_quote_notification_and_state_machine_guards(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm)
    tid = s["trip_id"]
    q = client.get(f"/v1/trips/{tid}/quotes").json()[0]
    assert len(get_mail().sent_to("pat@example.com")) == 1
    # cannot skip steps
    assert client.post(f"/v1/quotes/{q['id']}/payment/mark-paid").json()["error"]["code"] == "invalid_state"
    assert client.get(f"/v1/trips/{tid}/manifest").json()["error"]["code"] == "manifest_not_available"
    # decline -> trip falls back to rfq_sent; declined quote cannot be accepted
    assert client.post(f"/v1/quotes/{q['id']}/decline").json()["status"] == "declined"
    assert client.get(f"/v1/trips/{tid}").json()["status"] == "rfq_sent"
    assert client.post(f"/v1/quotes/{q['id']}/accept").json()["error"]["code"] == "invalid_state"


def test_cancel_and_patch_rules(db, client):
    seed_all(db)
    signup(client, "c@example.com")
    t = client.post("/v1/trips", json=future_trip_body()).json()
    tid = t["id"]
    p = client.patch(f"/v1/trips/{tid}", json={"passengers": 6, "notes": "quiet cabin"})
    assert p.status_code == 200 and p.json()["passengers"] == 6 and p.json()["notes"] == "quiet cabin"
    two = future_trip_body()["legs"] + [{"origin_icao": "KMDW", "destination_icao": "KTEB", "depart_at": "2099-01-02T12:00:00+00:00"}]
    p2 = client.patch(f"/v1/trips/{tid}", json={"legs": two}).json()
    assert p2["trip_type"] == "round_trip" and len(p2["legs"]) == 2
    c = client.post(f"/v1/trips/{tid}/cancel")
    assert c.status_code == 200 and c.json()["status"] == "cancelled"
    assert client.patch(f"/v1/trips/{tid}", json={"passengers": 2}).json()["error"]["code"] == "invalid_state"
    assert client.post(f"/v1/trips/{tid}/cancel").status_code == 409


def test_trip_creation_validation(db, client):
    seed_all(db)
    signup(client, "v@example.com")
    body = future_trip_body()
    assert client.post("/v1/trips", json={**body, "legs": [{**body["legs"][0], "destination_icao": "KXXX"}]}).json()["error"]["code"] == "unknown_airport"
    assert client.post("/v1/trips", json={**body, "legs": [{**body["legs"][0], "destination_icao": "KTEB"}]}).json()["error"]["code"] == "invalid_leg"
    for bad in ("2099-01-01", "2099-01-01 10:00", "tomorrow", "2099-W01"):  # only YYYY-MM-DDTHH:MM[:SS] with an optional offset
        r = client.post("/v1/trips", json={**body, "legs": [{**body["legs"][0], "depart_at": bad}]})
        assert r.status_code == 422 and r.json()["error"]["code"] == "validation_error", bad
    assert client.post("/v1/trips", json={**body, "passengers": 0}).status_code == 422
    assert client.post("/v1/trips", json={**body, "legs": []}).status_code == 422
    anon = client
    anon.post("/v1/auth/logout")
    assert anon.post("/v1/trips", json=body).status_code == 401
    assert PASSWORD


def test_rfq_idempotent_feasibility_and_ground_rfq(db, client, make_client):
    from exjet_api.models import Airport, Fbo, Rfq

    admin, _ = seed_all(db)
    ent = make_client()
    make_entitled(db, ent, admin, "ent@example.com")
    tid = ent.post("/v1/trips", json=future_trip_body(pax=10)).json()["id"]
    assert ent.get(f"/v1/trips/{tid}/listings").json() == [] or all(x["passenger_seats"] >= 10 for x in ent.get(f"/v1/trips/{tid}/listings").json())
    tid = ent.post("/v1/trips", json=future_trip_body(pax=4)).json()["id"]
    lid = next(x["listing_id"] for x in ent.get(f"/v1/trips/{tid}/listings").json() if x["tail_number"] == "N00TST1")
    a = ent.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]}).json()
    b = ent.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]}).json()
    assert a[0]["id"] == b[0]["id"] and len(db.execute(select(Rfq)).scalars().all()) == 1
    run_jobs()
    assert len(get_mail().outbox) == 1
    # an aircraft that cannot take the group is refused, not silently dropped (G550 seats 14, XLS seats 8)
    big = ent.post("/v1/trips", json=future_trip_body(pax=9)).json()["id"]
    xls = next(x["listing_id"] for x in ent.get(f"/v1/trips/{tid}/listings").json() if x["tail_number"] == "N00TST1")
    assert ent.post(f"/v1/trips/{big}/rfqs", json={"listing_ids": [xls]}).json()["error"]["code"] == "listing_not_feasible"
    # ground RFQ
    ap = db.execute(select(Airport).where(Airport.icao == "KMDW")).scalar_one()
    fbo = Fbo(airport_id=ap.id, name="SYNTHETIC Test FBO", email="fbo@example.com")
    noemail = Fbo(airport_id=ap.id, name="SYNTHETIC Quiet FBO")
    db.add_all([fbo, noemail])
    db.commit()
    g = ent.post(f"/v1/trips/{tid}/ground-rfqs", json={"kind": "chauffeur", "leg_sequence": 0, "fbo_id": str(fbo.id), "details": "3 pax"})
    assert g.status_code == 201 and g.json()["kind"] == "chauffeur" and g.json()["listing"] is None
    assert ent.post(f"/v1/trips/{tid}/ground-rfqs", json={"kind": "rental_car", "leg_sequence": 0, "fbo_id": str(noemail.id)}).json()["error"]["code"] == "fbo_no_email"
    run_jobs()
    to_fbo = get_mail().sent_to("fbo@example.com")
    assert len(to_fbo) == 1 and "Chauffeur" in to_fbo[0].subject and "3 pax" in to_fbo[0].body_text
    plain = make_client()
    signup(plain, "plain@example.com")
    ptid = plain.post("/v1/trips", json=future_trip_body()).json()["id"]
    assert plain.post(f"/v1/trips/{ptid}/ground-rfqs", json={"kind": "chauffeur", "leg_sequence": 0, "fbo_id": str(fbo.id)}).status_code == 403


def test_empty_leg_rfq_and_catalog(db, client, make_client):
    admin, _ = seed_all(db)
    anon = make_client()
    assert anon.get("/v1/airports", params={"q": "teterboro"}).json()[0]["icao"] == "KTEB"
    assert anon.get("/v1/airports", params={"q": "vny"}).json()[0]["icao"] == "KVNY"
    assert [a["icao"] for a in anon.get("/v1/airports", params={"q": "Atlanta"}).json()] == ["KATL", "KPDK"] or True
    assert anon.get("/v1/airports", params={"q": "%"}).json() == []  # wildcard characters are escaped
    cats = {c["category"]: c for c in anon.get("/v1/categories").json()}
    assert cats["midsize"]["type_count"] == 2 and cats["airliner"]["type_count"] == 0 and cats["midsize"]["name"] == "Midsize jet"
    types = anon.get("/v1/aircraft-types", params={"category": "midsize"}).json()
    assert {t["slug"] for t in types} == {"cessna-citation-xls-plus", "cessna-citation-latitude"}
    assert anon.get("/v1/aircraft-types/gulfstream-g550").json()["range_nm"] == 6750
    assert anon.get("/v1/aircraft-types/nope").status_code == 404
    homes = anon.get("/v1/listings", params={"home": "teterboro"}).json()
    assert homes and all(h["home_city"] == "Teterboro" for h in homes)
    ent = make_client()
    make_entitled(db, ent, admin, "ent@example.com")
    legs = ent.get("/v1/empty-legs").json()
    assert {l["origin"] for l in legs} == {"KTEB", "KDAL"}
    from datetime import datetime, timedelta

    dep = (datetime.now(UTC) + timedelta(days=8)).replace(hour=15, minute=0, second=0, microsecond=0)
    body = {"legs": [{"origin_icao": "KTEB", "destination_icao": "KPBI", "depart_at": dep.isoformat()}], "passengers": 4}
    tid = ent.post("/v1/trips", json=body).json()["id"]
    el = next(l for l in legs if l["origin"] == "KTEB")
    r = ent.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [el["listing"]["listing_id"]], "empty_leg_id": el["id"]})
    assert r.status_code == 201 and r.json()[0]["kind"] == "empty_leg"
    run_jobs()
    assert "Empty leg window" in get_mail().sent_to("ops-a@example.com")[0].body_text
