"""Member-app integration changes: origin-local departure times, manifest upsert, go-live shape, admin quote pdf_url,
fake checkout URLs, typed enums, FBO lookup, enterprise inquiry contact fields."""
import re
import uuid
from datetime import UTC, datetime

import pytest
from helpers import (
    b64,
    contract_pdf,
    future_trip_body,
    inbound,
    login,
    make_entitled,
    quote_pdf,
    seed_all,
    signup,
    to_manifest_due,
    to_quote_stage,
)
from helpers import (
    manifest_pax as pax,
)
from sqlalchemy import select

from exjet_api import clock
from exjet_api.models import Airport, AuditLog, EnterpriseInquiry, Fbo, Passenger


def _trip(client, depart_at, origin="KTEB", dest="KMDW"):
    return client.post("/v1/trips", json={"legs": [{"origin_icao": origin, "destination_icao": dest, "depart_at": depart_at}],
                                          "passengers": 2})


# --------------------------------------------------------------------------- 1. departure times
def test_naive_departure_is_read_in_the_origin_airports_zone_and_stored_as_utc(db, client):
    seed_all(db)
    signup(client, "t1@example.com")
    r = _trip(client, "2099-01-15T14:00")  # Teterboro, January: UTC-5
    assert r.status_code == 201, r.text
    leg = r.json()["legs"][0]
    assert leg["depart_at"].startswith("2099-01-15T19:00:00") and leg["depart_local"] == "2099-01-15T14:00:00"
    assert leg["origin_timezone"] == "America/New_York"
    assert leg["origin"] == {"icao": "KTEB", "name": "Teterboro Airport", "city": "Teterboro", "state": "NJ", "latitude": 40.8501,
                             "longitude": -74.0608, "timezone": "America/New_York"}
    assert leg["destination"]["icao"] == "KMDW" and leg["destination"]["timezone"] == "America/Chicago"
    assert leg["origin_icao"] == "KTEB" and leg["destination_icao"] == "KMDW"  # the flat fields stay
    got = client.get(f"/v1/trips/{r.json()['id']}").json()["legs"][0]
    assert got["depart_local"] == "2099-01-15T14:00:00" and got["origin_timezone"] == "America/New_York"


def test_seconds_form_and_summer_time_and_no_dst_zone(db, client):
    seed_all(db)
    signup(client, "t2@example.com")
    assert _trip(client, "2099-07-15T14:00:30").json()["legs"][0]["depart_at"].startswith("2099-07-15T18:00:30")  # EDT
    phx = _trip(client, "2099-07-15T14:00", origin="KPHX", dest="KLAX").json()["legs"][0]
    assert phx["depart_at"].startswith("2099-07-15T21:00:00") and phx["origin_timezone"] == "America/Phoenix"  # MST all year


def test_an_offset_is_an_instant_and_still_reports_the_origin_wall_time(db, client):
    seed_all(db)
    signup(client, "t3@example.com")
    for given in ("2099-07-15T14:00:00-04:00", "2099-07-15T18:00:00Z", "2099-07-15T20:00:00+02:00"):
        leg = _trip(client, given).json()["legs"][0]
        assert leg["depart_at"].startswith("2099-07-15T18:00:00") and leg["depart_local"] == "2099-07-15T14:00:00", given


@pytest.mark.parametrize("bad", ["2099-01-01", "2099-01-01 10:00", "tomorrow", "2099-W01", "2099-01-01T10", "20990101T1000"])
def test_only_the_documented_formats_are_accepted(db, client, bad):
    seed_all(db)
    signup(client, "t4@example.com")
    r = _trip(client, bad)
    assert r.status_code == 422 and r.json()["error"]["code"] == "validation_error"


def test_dst_gap_is_rejected_and_overlap_takes_the_first_occurrence(db, client):
    seed_all(db)
    signup(client, "t5@example.com")
    gap = _trip(client, "2030-03-10T02:30")  # clocks jump 02:00 -> 03:00 in New York
    assert gap.status_code == 422 and gap.json()["error"]["code"] == "nonexistent_local_time"
    ok = _trip(client, "2030-03-10T03:30").json()["legs"][0]
    assert ok["depart_at"].startswith("2030-03-10T07:30:00")  # already EDT
    lap = _trip(client, "2030-11-03T01:30").json()["legs"][0]  # 01:30 happens twice; the first one is EDT (UTC-4)
    assert lap["depart_at"].startswith("2030-11-03T05:30:00") and lap["depart_local"] == "2030-11-03T01:30:00"
    second = _trip(client, "2030-11-03T01:30:00-05:00").json()["legs"][0]  # a member who means the second passes an offset
    assert second["depart_at"].startswith("2030-11-03T06:30:00") and second["depart_local"] == "2030-11-03T01:30:00"


def test_unknown_airport_timezone_is_refused_not_guessed(db, client):
    seed_all(db)
    signup(client, "t6@example.com")
    ap = db.execute(select(Airport).where(Airport.icao == "KTEB")).scalar_one()
    ap.timezone = None
    db.commit()
    for given in ("2099-01-15T14:00", "2099-01-15T14:00:00-05:00"):
        r = _trip(client, given)
        assert r.status_code == 422 and r.json()["error"]["code"] == "airport_timezone_unknown", given
    ap.timezone = "Mars/Olympus_Mons"  # a name zoneinfo does not know is the same refusal
    db.commit()
    assert _trip(client, "2099-01-15T14:00").json()["error"]["code"] == "airport_timezone_unknown"
    # the destination's zone is not needed: only the origin's
    assert _trip(client, "2099-01-15T14:00", origin="KMDW", dest="KTEB").status_code == 201


def test_patch_accepts_naive_local_time_too(db, client):
    seed_all(db)
    signup(client, "t7@example.com")
    tid = _trip(client, "2099-01-15T14:00").json()["id"]
    r = client.patch(f"/v1/trips/{tid}", json={"legs": [{"origin_icao": "KVNY", "destination_icao": "KTEB", "depart_at": "2099-01-16T09:15"}]})
    assert r.status_code == 200
    leg = r.json()["legs"][0]
    assert leg["depart_at"].startswith("2099-01-16T17:15:00") and leg["origin_timezone"] == "America/Los_Angeles"


def test_legs_keep_the_zone_they_were_saved_with_even_if_the_airport_changes_later(db, client):
    seed_all(db)
    signup(client, "t8@example.com")
    tid = _trip(client, "2099-01-15T14:00").json()["id"]
    ap = db.execute(select(Airport).where(Airport.icao == "KTEB")).scalar_one()
    ap.timezone = None
    db.commit()
    leg = client.get(f"/v1/trips/{tid}").json()["legs"][0]
    assert leg["origin_timezone"] == "America/New_York" and leg["depart_local"] == "2099-01-15T14:00:00"


def test_intake_draft_legs_carry_wall_time_and_zone(db, client):
    seed_all(db)
    signup(client, "t9@example.com")
    clock.set_now(datetime(2026, 11, 12, 15, 0, tzinfo=UTC))
    d = client.post("/v1/trips/intake", json={"text": "Teterboro to Chicago Midway on 2026-11-20 9am, 4 passengers"}).json()
    leg = d["legs"][0]
    assert leg["depart_local"] == "2026-11-20T09:00:00" and leg["origin_timezone"] == "America/New_York"
    assert leg["depart_at"].startswith("2026-11-20T09:00:00-05:00")
    # the draft can be saved as is, or by posting the naive wall time
    assert client.post("/v1/trips", json=d).status_code == 201
    body = {**d, "legs": [{"origin_icao": "KTEB", "destination_icao": "KMDW", "depart_at": leg["depart_local"]}]}
    assert client.post("/v1/trips", json=body).json()["legs"][0]["depart_at"].startswith("2026-11-20T14:00:00")


def test_intake_does_not_return_a_utc_guess_when_the_airport_has_no_zone(db, client):
    seed_all(db)
    signup(client, "t10@example.com")
    clock.set_now(datetime(2026, 11, 12, 15, 0, tzinfo=UTC))
    db.execute(select(Airport).where(Airport.icao == "KTEB")).scalar_one().timezone = None
    db.commit()
    d = client.post("/v1/trips/intake", json={"text": "Teterboro to Chicago Midway on 2026-11-20 9am, 4 passengers"}).json()
    leg = d["legs"][0]
    assert leg["depart_at"] is None and leg["depart_local"] is None and leg["origin_timezone"] is None
    assert "legs[0].depart_at" in d["unresolved"]


# --------------------------------------------------------------------------- 2. manifest upsert
def test_manifest_put_is_an_upsert_by_passenger_id(db, client, make_client):
    s = to_manifest_due(db, client, make_client())
    url = f"/v1/trips/{s['trip_id']}/manifest"
    first = client.put(url, json={"passengers": [pax(1), pax(2), pax(3)]})
    assert first.status_code == 200, first.text
    a, b, c = first.json()["passengers"]
    assert all(p["id"] for p in (a, b, c)) and a["id_number_last4"] == "4561"
    assert "D1234561" not in first.text  # full numbers are never returned

    # existing ids without id_number keep the stored number; a new item needs one; omitted passengers are deleted
    edited = {k: v for k, v in pax(1, full_name="Passenger One Edited").items() if k != "id_number"}
    new = pax(4)
    r = client.put(url, json={"passengers": [{**edited, "id": a["id"]}, {**{k: v for k, v in pax(2).items() if k != "id_number"}, "id": b["id"]}, new]})
    assert r.status_code == 200, r.text
    out = r.json()["passengers"]
    assert [p["full_name"] for p in out] == ["Passenger One Edited", "Passenger 2", "Passenger 4"]
    assert [p["id"] for p in out][:2] == [a["id"], b["id"]]  # same rows, not recreated
    assert out[0]["id_number_last4"] == "4561" and out[2]["id_number_last4"] == "4564"
    db.expire_all()
    stored = {p.full_name: p.id_number for p in db.execute(select(Passenger)).scalars()}
    assert stored == {"Passenger One Edited": "D1234561", "Passenger 2": "D1234562", "Passenger 4": "D1234564"}  # c was deleted
    assert all(v == "D123456" + v[-1] for v in stored.values())

    # a new id_number on an existing id replaces it
    r = client.put(url, json={"passengers": [{**pax(1, id_number="Z9999999"), "id": a["id"]}]})
    assert r.json()["passengers"][0]["id_number_last4"] == "9999"


def test_manifest_upsert_errors(db, client, make_client):
    s = to_manifest_due(db, client, make_client())
    url = f"/v1/trips/{s['trip_id']}/manifest"
    ps = client.put(url, json={"passengers": [pax(1)]}).json()["passengers"]
    no_number = {k: v for k, v in pax(2).items() if k != "id_number"}
    r = client.put(url, json={"passengers": [no_number]})  # a NEW passenger needs a full number
    assert r.status_code == 422 and r.json()["error"]["code"] == "manifest_invalid" and "id_number_missing" in r.json()["error"]["message"]
    r = client.put(url, json={"passengers": [{**no_number, "id": str(uuid.uuid4())}]})
    assert r.status_code == 422 and r.json()["error"]["code"] == "unknown_passenger"
    r = client.put(url, json={"passengers": [{**no_number, "id": ps[0]["id"]}, {**no_number, "id": ps[0]["id"]}]})
    assert r.status_code == 422 and r.json()["error"]["code"] == "duplicate_passenger_id"
    assert [p["id"] for p in client.get(url).json()["passengers"]] == [ps[0]["id"]]  # failed puts changed nothing


def test_a_passenger_id_from_another_trip_is_refused_and_left_untouched(db, client, make_client):
    s = to_manifest_due(db, client, make_client())
    other_trip = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    foreign = Passenger(trip_id=uuid.UUID(other_trip), full_name="Foreign Pax", date_of_birth="1970-01-01", id_type="real_id",
                        id_number="F0000001", id_expiry=None, id_issuer="NJ")
    db.add(foreign)
    db.commit()
    no_number = {k: v for k, v in pax(1, full_name="Hijack").items() if k != "id_number"}
    r = client.put(f"/v1/trips/{s['trip_id']}/manifest", json={"passengers": [{**no_number, "id": str(foreign.id)}]})
    assert r.status_code == 422 and r.json()["error"]["code"] == "unknown_passenger"
    db.expire_all()
    assert db.get(Passenger, foreign.id).full_name == "Foreign Pax"


def test_submit_still_needs_every_passenger_with_a_number_on_file(db, client, make_client):
    s = to_manifest_due(db, client, make_client(), pax=2)
    url = f"/v1/trips/{s['trip_id']}/manifest"
    ps = client.put(url, json={"passengers": [pax(1), pax(2)]}).json()["passengers"]
    # round trip through the "no id_number" form: nothing re-entered, submit succeeds
    redo = [{**{k: v for k, v in pax(i + 1).items() if k != "id_number"}, "id": p["id"]} for i, p in enumerate(ps)]
    assert client.put(url, json={"passengers": redo}).status_code == 200
    assert client.post(f"{url}/submit").status_code == 200


# --------------------------------------------------------------------------- 3 and 4. admin
def test_request_go_live_returns_operator_and_approval(db, make_client):
    admin, ops = seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    r = adm.post(f"/v1/admin/operators/{ops['B'].id}/request-go-live")
    assert r.status_code == 201
    body = r.json()
    assert set(body) == {"operator", "approval"}
    assert body["operator"]["go_live_status"] == "pending_ceo" and body["operator"]["id"] == str(ops["B"].id)
    assert body["approval"]["kind"] == "operator_go_live" and body["approval"]["subject_id"] == str(ops["B"].id)


def test_admin_quote_review_pdf_url_is_set_in_list_detail_and_resolve(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm)  # a ready quote at the approved host
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote 2", "revised",  # a different total waits for an admin
            [{"filename": "quote.pdf", "content_base64": b64(quote_pdf(total="$1,000.00"))},
             {"filename": "agreement.pdf", "content_base64": b64(contract_pdf())}])
    listed = adm.get("/v1/admin/quotes").json()
    assert len(listed) == 1 and listed[0]["pdf_url"]
    qid = listed[0]["id"]
    detail = adm.get(f"/v1/admin/quotes/{qid}")
    assert detail.status_code == 200 and detail.json()["pdf_url"] and detail.json()["id"] == qid
    assert adm.get("/v1/admin/quotes/00000000-0000-0000-0000-000000000000").status_code == 404
    # the signed URL is viewer-bound: it works for this admin, not for anyone else
    assert adm.get(detail.json()["pdf_url"]).content.startswith(b"%PDF")
    assert client.get(detail.json()["pdf_url"], follow_redirects=False).status_code in (401, 403, 404)
    r = adm.post(f"/v1/admin/quotes/{qid}/resolve", json={"total_amount_cents": 100_000})
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "ready" and r.json()["pdf_url"] and adm.get(r.json()["pdf_url"]).content.startswith(b"%PDF")


# --------------------------------------------------------------------------- 5. fake billing urls
def test_fake_checkout_and_portal_urls_point_at_the_dev_pages(db, client, make_client):
    from exjet_api.config import get_settings

    admin, _ = seed_all(db)
    acct = make_entitled(db, client, admin, "b@example.com")
    sub = acct.subscription
    sub.status = "incomplete"
    db.commit()
    base = get_settings().app_base_url.rstrip("/")
    url = client.post("/v1/billing/checkout", json={"plan": "individual"}).json()["checkout_url"]
    assert re.fullmatch(re.escape(base) + r"/dev/checkout\?session=fakecs_[0-9a-f]{16}&plan=individual", url)
    sub.status = "active"
    db.commit()
    portal = client.post("/v1/billing/portal").json()["url"]
    assert portal.startswith(f"{base}/dev/billing-portal?customer=fakecus_")
    assert "fake-checkout" not in url and "fake-portal" not in portal


# --------------------------------------------------------------------------- 6. typed enums
def test_status_and_enum_fields_are_declared_as_enums_in_openapi(app):
    spec = app.openapi()
    comps = spec["components"]["schemas"]

    def enum_of(schema, prop):
        p = comps[schema]["properties"][prop]
        for branch in [p, *p.get("anyOf", [])]:
            if "enum" in branch:
                return branch["enum"]
        return None

    expect = {
        ("Me", "next_step"): {"kyc", "kyc_pending", "billing", "ready"},
        ("AccountOut", "kyc_status"): {"not_started", "submitted", "in_review", "approved", "rejected"},
        ("AccountOut", "type"): {"individual", "family_office", "enterprise"},
        ("SubscriptionOut", "status"): {"incomplete", "active", "past_due", "canceled"},
        ("SubscriptionOut", "plan"): {"individual", "family_office", "enterprise"},
        ("MemberOut", "identity_status"): {"not_started", "submitted", "in_review", "approved", "rejected"},
        ("KycStatusOut", "kyc_status"): {"not_started", "submitted", "in_review", "approved", "rejected"},
        ("TripOut", "status"): {"draft", "rfq_sent", "quoted", "contracted", "paid", "manifest_due", "scheduled", "in_flight", "completed", "cancelled"},
        ("TripOut", "trip_type"): {"one_way", "round_trip", "multi_leg"},
        ("RfqOut", "status"): {"queued", "sent", "replied", "declined", "expired", "failed"},
        ("RfqOut", "kind"): {"charter", "empty_leg", "rental_car", "chauffeur"},
        ("QuoteOut", "status"): {"received", "needs_review", "ready", "accepted", "declined", "expired"},
        ("PaymentLinkOut", "status"): {"pending", "member_marked_paid", "operator_confirmed"},
        ("AdminOperatorOut", "go_live_status"): {"draft", "pending_ceo", "live", "suspended"},
        ("AdminOperatorOut", "safety_rating"): {"Not rated", "Gold", "Gold+", "Platinum", "Platinum+"},
        ("Listing", "safety_rating"): {"Not rated", "Gold", "Gold+", "Platinum", "Platinum+"},
        ("ListingType", "category"): {"turboprop", "very_light", "light", "midsize", "super_midsize", "heavy", "ultra_long_range", "airliner"},
        ("AircraftTypeOut", "category"): {"turboprop", "very_light", "light", "midsize", "super_midsize", "heavy", "ultra_long_range", "airliner"},
        ("ApprovalOut", "status"): {"pending", "approved", "rejected"},
        ("JobOut", "status"): {"queued", "running", "done", "failed"},
        ("PassengerOut", "id_type"): {"real_id", "passport"},
        ("AdminQuoteReview", "status"): {"received", "needs_review", "ready", "accepted", "declined", "expired"},
        ("SeatMemberOut", "identity_status"): {"not_started", "submitted", "in_review", "approved", "rejected"},
    }
    for (schema, prop), values in expect.items():
        got = enum_of(schema, prop)
        assert got is not None and set(got) == values, (schema, prop, got)
    kinds = enum_of("ApprovalOut", "kind")
    assert {"kyc_final", "operator_go_live", "rfq_dispatch_policy", "payment_host", "inbound_review", "seat_overage", "legal_notice"} <= set(kinds)


def test_every_status_like_string_in_a_response_model_is_an_enum(app):
    """No response property named status/kind/category/role/plan/type/... may be a free string."""
    spec = app.openapi()
    comps = spec["components"]["schemas"]
    request_only = {"SignupIn", "LoginIn", "CheckoutIn", "KycSubmissionIn", "DecideIn", "SuppressionIn", "GroundRfqIn", "TripCreate",
                    "DevCompleteCheckout", "DevInboundEmail", "Body_ingest_v1_admin_ingest_post", "PlanOut",
                    "Body_submit_v1_kyc_submissions_post", "JobOut"}  # JobOut.kind is the open registry of job names
    free = []
    for name, sch in comps.items():
        if name in request_only or name.endswith("In") or name.endswith("Put") or name.endswith("Patch"):
            continue
        for prop, p in sch.get("properties", {}).items():
            if prop in {"status", "kind", "category", "role", "next_step", "go_live_status", "safety_rating", "identity_status",
                        "kyc_status", "trip_type", "required_id_type", "permission_level"}:
                branches = [p, *p.get("anyOf", [])]
                if not any("enum" in b or "const" in b for b in branches):
                    free.append((name, prop))
    assert free == [], free


# --------------------------------------------------------------------------- 7. fbos
def test_fbo_lookup_is_public_but_contacts_are_member_only(db, client, make_client):
    admin, _ = seed_all(db)
    ap = db.execute(select(Airport).where(Airport.icao == "KTEB")).scalar_one()
    db.add_all([Fbo(airport_id=ap.id, name="SYNTHETIC FBO One", phone="+1-555-0111", email="one@example.com"),
                Fbo(airport_id=ap.id, name="SYNTHETIC FBO Two")])
    db.commit()
    anon = make_client()
    r = anon.get("/v1/airports/kteb/fbos")
    assert r.status_code == 200
    assert [f["name"] for f in r.json()] == ["SYNTHETIC FBO One", "SYNTHETIC FBO Two"]
    assert all(f["phone"] is None and f["email"] is None and f["id"] for f in r.json())
    assert "555-0111" not in r.text and "one@example.com" not in r.text
    signup(client, "nm@example.com")  # a member who is not entitled
    assert client.get("/v1/airports/KTEB/fbos").json()[0]["email"] is None
    ent = make_client()
    make_entitled(db, ent, admin, "ent@example.com")
    got = ent.get("/v1/airports/KTEB/fbos").json()
    assert got[0]["phone"] == "+1-555-0111" and got[0]["email"] == "one@example.com" and got[1]["phone"] is None
    assert anon.get("/v1/airports/KZZZ/fbos").status_code == 404
    assert anon.get("/v1/airports/KMDW/fbos").json() == []


# --------------------------------------------------------------------------- 8. enterprise inquiry
def test_enterprise_inquiry_contact_fields_are_validated_encrypted_and_admin_visible(db, client, make_client):
    from sqlalchemy import text

    seed_all(db)
    signup(client, "ei@example.com")
    ok = {"company": "Acme Holdings", "seats": 8, "notes": "Need 8 seats", "contact_name": "Dana Doe",
          "contact_email": "Dana.Doe@Example.com", "contact_phone": "+1 (555) 010-2000"}
    for bad in ({**ok, "contact_email": "nope"}, {**ok, "contact_phone": "abc"}, {**ok, "contact_phone": "12"},
                {k: v for k, v in ok.items() if k != "contact_name"}, {k: v for k, v in ok.items() if k != "contact_email"},
                {**ok, "contact_name": "   "}):
        assert client.post("/v1/billing/enterprise-inquiry", json=bad).status_code == 422, bad
    assert client.post("/v1/billing/enterprise-inquiry", json=ok).status_code == 202
    assert client.post("/v1/billing/enterprise-inquiry", json={k: v for k, v in ok.items() if k != "contact_phone"}).status_code == 202
    raw = db.execute(text("select company, contact_name, contact_email, contact_phone from enterprise_inquiries order by created_at")).all()
    assert all(v and "Acme" not in v and "Dana" not in v and "example.com" not in v for v in raw[0] if v)  # encrypted at rest
    assert raw[1][3] is None
    row = db.execute(select(EnterpriseInquiry).order_by(EnterpriseInquiry.created_at)).scalars().first()
    assert row.contact_email == "dana.doe@example.com" and row.contact_name == "Dana Doe"
    for (detail,) in db.execute(text("select detail from audit_log")).all():
        assert "Dana" not in str(detail) and "example.com" not in str(detail)

    adm = make_client()
    login(adm, "admin@example.com")
    items = adm.get("/v1/admin/enterprise-inquiries").json()
    assert len(items) == 2
    newest_first = items[1]
    assert newest_first["company"] == "Acme Holdings" and newest_first["contact_email"] == "dana.doe@example.com"
    assert newest_first["contact_phone"] == "+1 (555) 010-2000" and newest_first["seats"] == 8
    assert items[0]["contact_phone"] is None
    assert client.get("/v1/admin/enterprise-inquiries").status_code == 403  # a member cannot read them
    assert make_client().get("/v1/admin/enterprise-inquiries").status_code == 401
    assert db.execute(select(AuditLog).where(AuditLog.action == "enterprise_inquiries.listed")).scalar_one()
