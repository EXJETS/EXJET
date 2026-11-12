"""Gaps found by the app's real-API e2e: reversible migrations, manifest sent_to_operator_at, sender_not_contact quarantine,
stable changed_since_first, admin operator/user/trip reads, dev outbox, uniform token errors, seeded FBOs, null-category types."""
import re
import uuid
from pathlib import Path

from helpers import (
    PASSWORD,
    b64,
    contract_pdf,
    inbound,
    login,
    make_entitled,
    manifest_pax,
    quote_pdf,
    run_jobs,
    seed_all,
    signup,
    to_manifest_due,
    to_quote_stage,
)
from sqlalchemy import select, text

from exjet_api import ratelimit
from exjet_api.models import (
    AgentAction,
    Aircraft,
    AircraftType,
    Approval,
    AuditLog,
    EmailMessage,
    Operator,
    OperatorContact,
    Quote,
    Rfq,
)
from exjet_api.providers import get_mail

API_DIR = Path(__file__).resolve().parents[1]
ATT = lambda **kw: [{"filename": "quote.pdf", "content_base64": b64(quote_pdf(**kw))},  # noqa: E731
                    {"filename": "agreement.pdf", "content_base64": b64(contract_pdf())}]


# --------------------------------------------------------------------------- 1. migrations are reversible with data
def test_downgrade_to_base_and_back_with_realistic_data(db, client, make_client):
    from alembic.config import Config
    from sqlalchemy import create_engine

    from alembic import command
    from exjet_api.config import get_settings

    adm = make_client()
    s = to_manifest_due(db, client, adm)
    tid = s["trip_id"]
    client.put(f"/v1/trips/{tid}/manifest", json={"passengers": [manifest_pax(i) for i in range(1, 5)]})
    client.post(f"/v1/trips/{tid}/manifest/submit")
    run_jobs()  # operator manifest link + email rows
    signup(make_client(), "ent@example.com")  # verification token, user, account
    ent = make_client()
    signup(ent, "ent2@example.com")
    ent.post("/v1/billing/enterprise-inquiry", json={"company": "Acme", "seats": 3, "contact_name": "D", "contact_email": "d@example.com"})
    # an unknown sender is quarantined: agent_actions.status = 'awaiting_approval' (17 characters, longer than the 0001 column)
    inbound(adm, "stranger@other.test", f"Re: [{s['ref']}] quote", "hi", ATT())
    # a type with no category and a tail on it
    op = db.execute(select(Operator).where(Operator.dba_name == "SYNTHETIC Test Operator A")).scalar_one()
    t = AircraftType(slug="no-category-type", manufacturer="Synth", model="NC-1", category=None)
    db.add(t)
    db.flush()
    db.add(Aircraft(tail_number="N99NOCT", operator_id=op.id, type_id=t.id, passenger_seats=6, amenities=[], photos=[], is_active=True))
    db.commit()
    longest = db.execute(text("select max(length(status)) from agent_actions")).scalar_one()
    assert longest > 16
    db.close()

    cfg = Config(str(API_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(API_DIR / "alembic"))
    eng = create_engine(get_settings().database_url)
    try:
        command.downgrade(cfg, "0004")
        with eng.connect() as c:
            assert c.execute(text("select category from aircraft_types where slug = 'no-category-type'")).scalar_one() == "unclassified"
        command.downgrade(cfg, "0001")
        with eng.connect() as c:
            assert c.execute(text("select max(length(status)) from agent_actions")).scalar_one() <= 16
            assert "pending_approval" in c.execute(text("select array_agg(distinct status) from agent_actions")).scalar_one()
        command.downgrade(cfg, "base")
        command.upgrade(cfg, "head")
    finally:
        eng.dispose()


# --------------------------------------------------------------------------- 2. sent_to_operator_at
def test_manifest_responses_carry_sent_to_operator_at(db, client, make_client, app):
    comps = app.openapi()["components"]["schemas"]
    assert "sent_to_operator_at" in comps["ManifestOut"]["properties"] and "sent_to_operator_at" in comps["ManifestBrief"]["properties"]
    s = to_manifest_due(db, client, make_client())
    tid = s["trip_id"]
    assert client.get(f"/v1/trips/{tid}/manifest").json()["sent_to_operator_at"] is None
    client.put(f"/v1/trips/{tid}/manifest", json={"passengers": [manifest_pax(i) for i in range(1, 5)]})
    sub = client.post(f"/v1/trips/{tid}/manifest/submit").json()
    assert sub["submitted_at"] and sub["sent_to_operator_at"] is None
    run_jobs()
    assert client.get(f"/v1/trips/{tid}/manifest").json()["sent_to_operator_at"]
    assert client.get(f"/v1/trips/{tid}").json()["manifest"]["sent_to_operator_at"]


# --------------------------------------------------------------------------- 3. sender_not_contact
def _stage(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    login(adm, "admin@example.com")
    return adm, s


def test_unknown_sender_is_quarantined_for_review_and_approval_does_not_trust_them(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "stranger@other.test", f"Re: [{s['ref']}] quote", "pay here", ATT())
    db.expire_all()
    msg = db.execute(select(EmailMessage).where(EmailMessage.from_address == "stranger@other.test")).scalar_one()
    assert msg.status == "quarantined" and msg.quarantine_reason == "sender_not_contact"
    listed = adm.get("/v1/admin/inbound/quarantined").json()
    assert len(listed) == 1 and listed[0]["reason"] == "sender_not_contact" and listed[0]["approval_id"]
    ap = db.execute(select(Approval).where(Approval.kind == "inbound_review")).scalar_one()
    assert ap.status == "pending" and "sender_not_contact" in ap.summary
    assert db.execute(select(Quote)).scalars().all() == [] and client.get(f"/v1/trips/{s['trip_id']}/quotes").json() == []
    # approving the review does not create trust: the exact-contact rule is re-checked and the message is rejected
    assert adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "approved"}).status_code == 200
    run_jobs()
    db.expire_all()
    assert db.execute(select(Quote)).scalars().all() == []
    assert db.get(EmailMessage, msg.id).status == "rejected"
    reasons = [a.output.get("reason") for a in db.execute(select(AgentAction).where(AgentAction.event == "quote.rejected_sender")).scalars()]
    assert reasons == ["sender_not_a_recipient_contact"]


def test_rejecting_the_review_rejects_the_message(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "stranger@other.test", f"Re: [{s['ref']}] quote", "x", ATT())
    ap = db.execute(select(Approval).where(Approval.kind == "inbound_review")).scalar_one()
    adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "rejected"})
    db.expire_all()
    assert db.execute(select(EmailMessage).where(EmailMessage.from_address == "stranger@other.test")).scalar_one().status == "rejected"


def test_an_unconfirmed_contact_is_accepted_only_after_the_admin_confirms_them(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    op = s["ops"]["A"]
    db.add(OperatorContact(operator_id=op.id, name="New Desk", email="newdesk@example.com", receives_rfq=False))
    db.commit()
    inbound(adm, "newdesk@example.com", f"Re: [{s['ref']}] quote", "first", ATT())
    ap1 = db.execute(select(Approval).where(Approval.kind == "inbound_review", Approval.status == "pending")).scalar_one()
    adm.post(f"/v1/admin/approvals/{ap1.id}/decide", json={"decision": "approved"})  # approving alone: still no quote
    run_jobs()
    db.expire_all()
    assert db.execute(select(Quote)).scalars().all() == []
    # the same sender again; this time the admin first confirms the contact through the existing path, then approves
    inbound(adm, "newdesk@example.com", f"Re: [{s['ref']}] quote 2", "second", ATT())
    ap2 = db.execute(select(Approval).where(Approval.kind == "inbound_review", Approval.status == "pending")).scalar_one()
    detail = adm.get(f"/v1/admin/operators/{op.id}").json()
    cid = next(c["id"] for c in detail["contacts"] if c["email"] == "newdesk@example.com")
    assert adm.post(f"/v1/admin/operators/{op.id}/contacts/{cid}/confirm-rfq").status_code == 204
    adm.post(f"/v1/admin/approvals/{ap2.id}/decide", json={"decision": "approved"})
    run_jobs()
    db.expire_all()
    (q,) = db.execute(select(Quote)).scalars().all()
    assert q.status == "ready"  # payment host and total checks still applied


def test_dmarc_release_does_not_widen_sender_trust(db, client, make_client):
    """Only a sender_not_contact quarantine can use the confirmed-contact path; a DMARC release of a stranger stays rejected."""
    adm, s = _stage(db, client, make_client)
    op = s["ops"]["A"]
    db.add(OperatorContact(operator_id=op.id, name="Conf", email="conf@example.com", receives_rfq=True))
    db.commit()
    inbound(adm, "conf@example.com", f"Re: [{s['ref']}] quote", "x", ATT(), dmarc_pass=False)
    # confirmed contact but not a recipient of this RFQ -> sender_not_contact comes first, then is accepted after approval
    ap = db.execute(select(Approval).where(Approval.kind == "inbound_review")).scalar_one()
    assert "sender_not_contact" in ap.summary


# --------------------------------------------------------------------------- 4. changed_since_first is stable
def test_changed_since_first_is_relative_to_the_first_host_and_stable_after_accept(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "first", ATT())
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote 2", "pay here instead", ATT(pay_url="https://pay.attacker.test/x"))
    rfq = db.execute(select(Rfq)).scalar_one()
    assert rfq.first_payment_host == "pay.example.com"
    ap = db.execute(select(Approval).where(Approval.kind == "payment_host")).scalar_one()
    adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "approved"})
    q2 = db.execute(select(Quote).where(Quote.status == "needs_review")).scalar_one()
    assert adm.post(f"/v1/admin/quotes/{q2.id}/resolve", json={"total_amount_cents": 4_520_000}).status_code == 200
    before = {q["id"]: q for q in client.get(f"/v1/trips/{s['trip_id']}/quotes").json()}
    assert len(before) == 2
    flags = {q["payment_link"]["host"]: (q["payment_link"]["changed_since_first"], q["payment_link"]["first_host"]) for q in before.values()}
    assert flags == {"pay.example.com": (False, "pay.example.com"), "pay.attacker.test": (True, "pay.example.com")}
    assert client.post(f"/v1/quotes/{q2.id}/accept").status_code == 200  # accepting the changed quote declines the original
    after = {q["payment_link"]["host"]: (q["payment_link"]["changed_since_first"], q["payment_link"]["first_host"], q["status"])
             for q in client.get(f"/v1/trips/{s['trip_id']}/quotes").json()}
    assert after["pay.attacker.test"][:2] == (True, "pay.example.com")  # did not move to the original
    assert after["pay.example.com"] == (False, "pay.example.com", "declined")
    db.expire_all()
    assert db.execute(select(Rfq)).scalar_one().first_payment_host == "pay.example.com"  # written once


# --------------------------------------------------------------------------- 5. operator detail
def test_admin_operator_detail_lists_contacts_with_pending_confirmation(db, make_client):
    admin, ops = seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    a = ops["A"]
    db.add(OperatorContact(operator_id=a.id, name="Late Add", email="late@example.com", receives_rfq=False))
    db.commit()
    r = adm.get(f"/v1/admin/operators/{a.id}")
    assert r.status_code == 200
    body = r.json()
    assert body["dba_name"] == "SYNTHETIC Test Operator A" and body["go_live_status"] == "live" and body["contact_count"] == 2
    by = {c["email"]: c for c in body["contacts"]}
    assert by["ops-a@example.com"]["receives_rfq"] is True and by["ops-a@example.com"]["pending_confirmation"] is False
    late = by["late@example.com"]
    assert late["receives_rfq"] is False and late["pending_confirmation"] is True and late["id"]
    assert set(late) == {"id", "name", "title", "email", "phone", "receives_rfq", "pending_confirmation"}
    cid = late["id"]
    assert adm.post(f"/v1/admin/operators/{a.id}/contacts/{cid}/confirm-rfq").status_code == 204
    assert {c["email"]: c["pending_confirmation"] for c in adm.get(f"/v1/admin/operators/{a.id}").json()["contacts"]}["late@example.com"] is False
    # a draft operator's unconfirmed contacts are not "pending": confirmation only matters once live
    b = adm.get(f"/v1/admin/operators/{ops['B'].id}").json()
    assert all(c["pending_confirmation"] is False for c in b["contacts"])
    assert adm.get(f"/v1/admin/operators/{uuid.uuid4()}").status_code == 404
    assert make_client().get(f"/v1/admin/operators/{a.id}").status_code == 401


# --------------------------------------------------------------------------- 6. admin users and trips
def test_admin_users_search_paging_and_no_extra_pii(db, client, make_client):
    admin, _ = seed_all(db)
    for i in range(5):
        signup(make_client(), f"person{i}@example.com", f"Person Number{i}")
    adm = make_client()
    login(adm, "admin@example.com")
    page1 = adm.get("/v1/admin/users", params={"limit": 3}).json()
    assert len(page1["items"]) == 3 and page1["next_cursor"]
    page2 = adm.get("/v1/admin/users", params={"limit": 3, "cursor": page1["next_cursor"]}).json()
    assert len(page2["items"]) == 3 and page2["next_cursor"] is None  # 5 members + the admin
    ids = [u["id"] for u in page1["items"] + page2["items"]]
    assert len(set(ids)) == 6
    u = next(x for x in page1["items"] + page2["items"] if x["email"].startswith("person"))
    assert set(u) == {"id", "email", "role", "is_active", "email_verified", "account", "created_at"}
    assert set(u["account"]) == {"id", "type", "kyc_status"} and u["role"] == "member" and u["email_verified"] is False
    assert "Number" not in str(page1) + str(page2)  # names are not part of it
    hit = adm.get("/v1/admin/users", params={"q": "PERSON3"}).json()["items"]
    assert [x["email"] for x in hit] == ["person3@example.com"]
    assert adm.get("/v1/admin/users", params={"q": "100%_"}).json()["items"] == []  # wildcards are escaped
    assert adm.get("/v1/admin/users", params={"cursor": "garbage"}).json()["error"]["code"] == "invalid_cursor"
    row = db.execute(select(AuditLog).where(AuditLog.action == "admin.users_listed").order_by(AuditLog.at)).scalars().all()
    assert row and all("person" not in str(r.detail) for r in row)  # the search text is not stored
    assert make_client().get("/v1/admin/users").status_code == 401
    member = make_client()
    signup(member, "plain@example.com")
    assert member.get("/v1/admin/users").status_code == 403
    # deactivate is reachable from the list
    victim = next(x for x in page1["items"] + page2["items"] if x["email"] == "person1@example.com")
    assert adm.post(f"/v1/admin/users/{victim['id']}/deactivate").status_code == 204
    assert adm.get("/v1/admin/users", params={"q": "person1"}).json()["items"][0]["is_active"] is False


def test_admin_trips_list_detail_and_manifest_link_summary_without_passenger_pii(db, client, make_client):
    adm = make_client()
    s = to_manifest_due(db, client, adm)
    tid = s["trip_id"]
    client.put(f"/v1/trips/{tid}/manifest", json={"passengers": [manifest_pax(i) for i in range(1, 5)]})
    client.post(f"/v1/trips/{tid}/manifest/submit")
    run_jobs()
    tok = re.search(r"token=([\w-]+)", get_mail().sent_to("ops-a@example.com")[-1].body_text).group(1)
    assert make_client().get("/v1/operator/manifest", params={"token": tok}).status_code == 200
    make_client().get("/v1/operator/manifest", params={"token": "z" * 43})
    login(adm, "admin@example.com")
    lst = adm.get("/v1/admin/trips", params={"status": "scheduled"}).json()
    assert [t["id"] for t in lst["items"]] == [tid] and lst["next_cursor"] is None
    assert adm.get("/v1/admin/trips", params={"status": "draft"}).json()["items"] == []
    d = adm.get(f"/v1/admin/trips/{tid}")
    assert d.status_code == 200
    body = d.json()
    assert body["status"] == "scheduled" and body["legs"][0]["origin_icao"] == "KTEB" and body["legs"][0]["origin_timezone"]
    assert body["rfqs"][0]["reference"] == s["ref"] and body["rfqs"][0]["operator_name"] == "SYNTHETIC Test Operator A"
    assert body["quotes"][0]["payment_host"] == "pay.example.com" and body["quotes"][0]["first_payment_host"] == "pay.example.com"
    m = body["manifest"]
    assert m["passengers_on_file"] == 4 and m["sent_to_operator_at"] and len(m["links"]) == 1
    link = m["links"][0]
    assert link["recipient"] == "ops-a@example.com" and link["view_count"] == 1 and link["revoked_at"] is None
    assert [e["action"] for e in m["recent_access"]] == ["manifest.link_accessed"]  # an unknown token is not tied to a link
    assert m["recent_access"][0]["token_id"] == link["id"]
    text_ = d.text
    for needle in ("Passenger 1", "D123456", "1980-05-05", "Pat Member", "pat@example.com"):
        assert needle not in text_
    assert adm.post(f"/v1/admin/trips/{tid}/manifest/revoke-links").json() == {"revoked": 1}
    assert adm.get(f"/v1/admin/trips/{tid}").json()["manifest"]["links"][0]["revoked_at"]
    acts = {a.action for a in db.execute(select(AuditLog)).scalars()}
    assert {"admin.trips_listed", "admin.trip_viewed"} <= acts
    assert adm.get(f"/v1/admin/trips/{uuid.uuid4()}").status_code == 404
    assert client.get("/v1/admin/trips").status_code == 403 and make_client().get(f"/v1/admin/trips/{tid}").status_code == 401


def test_admin_trips_paginate(db, client, make_client):
    admin, _ = seed_all(db)
    from helpers import future_trip_body

    signup(client, "pg@example.com")
    for _ in range(3):
        client.post("/v1/trips", json=future_trip_body())
    adm = make_client()
    login(adm, "admin@example.com")
    p1 = adm.get("/v1/admin/trips", params={"limit": 2}).json()
    p2 = adm.get("/v1/admin/trips", params={"limit": 2, "cursor": p1["next_cursor"]}).json()
    assert len(p1["items"]) == 2 and len(p2["items"]) == 1 and p2["next_cursor"] is None
    assert len({t["id"] for t in p1["items"] + p2["items"]}) == 3


# --------------------------------------------------------------------------- 7. dev outbox
def test_dev_outbox_returns_real_bodies_filtered_by_recipient_and_purpose(db, client, make_client):
    client.post("/v1/auth/signup", json={"email": "ob@example.com", "password": PASSWORD, "full_name": "Ob", "account_type": "individual"})
    client.post("/v1/auth/password/reset-request", json={"email": "ob@example.com"})
    c = make_client()
    allm = c.get("/v1/dev/outbox").json()
    assert [m["purpose"] for m in allm][:2] == ["password_reset", "email_verification"]  # newest first
    ver = c.get("/v1/dev/outbox", params={"to": "OB@example.com", "purpose": "email_verification"}).json()
    assert len(ver) == 1 and re.search(r"/verify-email\?token=[\w-]{20,}", ver[0]["body_text"])
    assert ver[0]["to"] == ["ob@example.com"] and ver[0]["subject"] and ver[0]["created_at"]
    tok = re.search(r"token=([\w-]+)", ver[0]["body_text"]).group(1)
    assert c.post("/v1/auth/verify-email", json={"token": tok}).status_code == 200  # the link really works
    assert c.get("/v1/dev/outbox", params={"to": "nobody@example.com"}).json() == []
    assert len(c.get("/v1/dev/outbox", params={"limit": 1}).json()) == 1
    assert c.get("/v1/dev/outbox", params={"limit": 0}).status_code == 422


def test_manifest_and_invite_links_are_readable_through_the_dev_outbox(db, client, make_client):
    s = to_manifest_due(db, client, make_client())
    client.put(f"/v1/trips/{s['trip_id']}/manifest", json={"passengers": [manifest_pax(i) for i in range(1, 5)]})
    client.post(f"/v1/trips/{s['trip_id']}/manifest/submit")
    c = make_client()
    assert c.post("/v1/dev/run-jobs").status_code == 200
    (m,) = c.get("/v1/dev/outbox", params={"purpose": "manifest"}).json()
    assert "/operator/manifest?token=" in m["body_text"] and m["to"] == ["ops-a@example.com"]


# --------------------------------------------------------------------------- 8. uniform token errors
def test_every_token_endpoint_answers_malformed_tokens_like_unknown_ones(db, client, make_client):
    admin, _ = seed_all(db)
    signup(client, "tk@example.com")
    for tok in ("", "x", "short", "a" * 19, "a" * 43, "a" * 5000, "../../etc"):
        c = make_client()
        v = c.post("/v1/auth/verify-email", json={"token": tok})
        assert (v.status_code, v.json()["error"]["code"]) == (409, "invalid_token"), tok
        r = c.post("/v1/auth/password/reset", json={"token": tok, "new_password": "a-long-enough-password-1"})
        assert (r.status_code, r.json()["error"]["code"]) == (409, "invalid_token"), tok
        a = client.post("/v1/account/seats/accept", json={"token": tok})
        assert (a.status_code, a.json()["error"]["code"]) == (409, "invitation_invalid"), tok
        o = c.get("/v1/operator/manifest", params={"token": tok})
        assert (o.status_code, o.json()["error"]["code"]) == (404, "invalid_link"), tok
    assert ratelimit.LIMITS["verify_email_ip"]


# --------------------------------------------------------------------------- 9. seeded FBOs
def test_seed_adds_synthetic_fbos_and_ground_requests_work(db, client, make_client):
    admin, _ = seed_all(db)
    seed_all(db)  # idempotent
    anon = make_client()
    names = [f["name"] for f in anon.get("/v1/airports/KTEB/fbos").json()]
    assert names == ["SYNTHETIC FBO A", "SYNTHETIC FBO B"]
    ent = make_client()
    make_entitled(db, ent, admin, "gr@example.com")
    from helpers import future_trip_body

    tid = ent.post("/v1/trips", json=future_trip_body()).json()["id"]
    fbos = ent.get("/v1/airports/KMDW/fbos").json()
    assert fbos[0]["email"] and fbos[0]["email"].endswith("@example.com") and fbos[0]["phone"]
    r = ent.post(f"/v1/trips/{tid}/ground-rfqs", json={"kind": "chauffeur", "leg_sequence": 0, "fbo_id": fbos[0]["id"], "details": "2 pax"})
    assert r.status_code == 201, r.text
    run_jobs()
    assert get_mail().sent_to(fbos[0]["email"])


# --------------------------------------------------------------------------- 11. categories nullable
def test_types_without_a_category_are_never_matched_or_listed(db, client, make_client):
    admin, ops = seed_all(db)
    ent = make_client()
    make_entitled(db, ent, admin, "nc@example.com")
    t = AircraftType(slug="synth-uncategorised", manufacturer="Synth", model="UC-1", category=None, max_passengers=9, range_nm=3000,
                     cruise_speed_kts=450, min_runway_ft=3000, baggage_cuft=100, icao_type_code="UC1")
    db.add(t)
    db.flush()
    db.add(Aircraft(tail_number="N00NCAT", operator_id=ops["A"].id, type_id=t.id, passenger_seats=9, home_airport_icao="KTEB",
                    amenities=[], photos=[], is_active=True))
    db.commit()
    anon = make_client()
    assert "synth-uncategorised" not in {x["slug"] for x in anon.get("/v1/aircraft-types").json()}
    assert anon.get("/v1/aircraft-types/synth-uncategorised").status_code == 404
    assert sum(c["type_count"] for c in anon.get("/v1/categories").json()) == db.execute(
        text("select count(*) from aircraft_types where category is not null")).scalar_one()
    assert "N00NCAT" not in str(ent.get("/v1/listings").json()) and "synth-uncategorised" not in str(anon.get("/v1/listings").json())
    assert "UC-1" not in str(anon.get("/v1/listings", params={"type_slug": "synth-uncategorised"}).json())
    assert anon.get("/v1/listings", params={"type_slug": "synth-uncategorised"}).json() == []
    from helpers import future_trip_body

    tid = ent.post("/v1/trips", json=future_trip_body()).json()["id"]
    match = ent.get(f"/v1/trips/{tid}/match").json()
    assert "synth-uncategorised" not in str(match)
    assert "synth-uncategorised" not in str(ent.get(f"/v1/trips/{tid}/listings").json())
    assert all(x["category"] for x in anon.get("/v1/aircraft-types").json())
    assert all(x["listing_id"] for x in ent.get("/v1/listings").json()) and "N00NCAT" not in ent.get("/v1/empty-legs").text
