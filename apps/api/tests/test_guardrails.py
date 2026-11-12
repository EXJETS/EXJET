"""Hard guardrails. Each test proves a rule from ARCHITECTURE.md holds at the API/db level."""
import uuid
from datetime import UTC, datetime

import pytest
from helpers import (
    assert_no_member_data,
    b64,
    future_trip_body,
    inbound,
    login,
    make_entitled,
    make_operator,
    run_jobs,
    seed_all,
    signup,
    to_quote_stage,
)
from sqlalchemy import select

from exjet_api import mailer
from exjet_api.guardrails import GuardrailViolation
from exjet_api.models import (
    Account,
    AgentAction,
    Approval,
    AuditLog,
    Document,
    EmailMessage,
    Quote,
    Rfq,
    Subscription,
    Suppression,
    Trip,
)
from exjet_api.providers import get_mail


# --------------------------------------------------------------------------- 1. member-only fields
def test_visitor_and_non_entitled_never_see_operator_tail_or_contacts(db, client, make_client):
    admin, _ = seed_all(db)
    visitor = make_client()
    plain = make_client()
    signup(plain, "plain@example.com")
    for c in (visitor, plain):
        for path in ("/v1/listings", "/v1/empty-legs", "/v1/listings?type_slug=cessna-citation-xls-plus", "/v1/aircraft-types"):
            r = c.get(path)
            assert r.status_code == 200
            assert_no_member_data(r.text)
        rows = c.get("/v1/listings").json()
        assert rows and all(x["tail_number"] is None and x["operator"] is None for x in rows)
        assert all(x["home_city"] for x in rows) and all("listing_id" in x for x in rows)
        legs = c.get("/v1/empty-legs").json()
        assert legs and all(x["listing"]["tail_number"] is None and x["listing"]["operator"] is None for x in legs)
    # the same listings are fully visible to an entitled member
    ent = make_client()
    make_entitled(db, ent, admin, "ent@example.com")
    assert any(x["operator"] and x["tail_number"] for x in ent.get("/v1/listings").json())


def test_non_entitled_member_trip_routes_strip_member_fields(db, client):
    admin, _ = seed_all(db)
    signup(client, "nonent@example.com")
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    r = client.get(f"/v1/trips/{tid}/listings")
    assert r.status_code == 200 and r.json()
    assert_no_member_data(r.text)
    assert all(x["tail_number"] is None and x["operator"] is None for x in r.json())
    for path in (f"/v1/trips/{tid}", "/v1/trips", f"/v1/trips/{tid}/match"):
        assert_no_member_data(client.get(path).text)
    # sending RFQs and reading quotes requires entitlement
    lid = r.json()[0]["listing_id"]
    assert client.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]}).json()["error"]["code"] == "not_entitled"
    assert client.get(f"/v1/trips/{tid}/quotes").status_code == 403


def test_lapsed_membership_strips_rfq_quote_and_trip_fields(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm)
    tid = s["trip_id"]
    full = client.get(f"/v1/trips/{tid}").json()
    assert full["rfqs"][0]["listing"]["tail_number"] == "N00TST1" and full["quotes"][0]["operator"]
    sub = db.execute(select(Subscription)).scalar_one()
    sub.status = "canceled"
    db.commit()
    for path in (f"/v1/trips/{tid}", "/v1/trips"):
        r = client.get(path)
        assert r.status_code == 200
        assert_no_member_data(r.text)
    t = client.get(f"/v1/trips/{tid}").json()
    assert t["quotes"] == [] and t["rfqs"][0]["listing"]["operator"] is None and t["rfqs"][0]["listing"]["tail_number"] is None
    qid = full["quotes"][0]["id"]
    assert client.get(f"/v1/trips/{tid}/quotes").status_code == 403
    assert client.post(f"/v1/quotes/{qid}/accept").status_code == 403
    assert client.get(full["quotes"][0]["quote_pdf_url"], follow_redirects=False).status_code == 403


def test_no_price_fields_or_estimators_anywhere(app, db, client):
    seed_all(db)
    paths = set(app.openapi()["paths"])
    assert not [p for p in paths if any(w in p.lower() for w in ("estimate", "pricing", "quote-calc", "price"))]
    for r in (client.get("/v1/listings").json(), client.get("/v1/empty-legs").json(), client.get("/v1/aircraft-types").json()):
        assert "price" not in str(r).lower() and "cost" not in str(r).lower()


# --------------------------------------------------------------------------- 3. exclusions
@pytest.mark.parametrize("name", ["NetJets", "Net Jets Aviation", "FLEXJET LLC", "Flex-Jet Charter", "Nicholas Air"])
def test_excluded_operator_never_listed_or_sent_an_rfq(db, client, make_client, name):
    admin, _ = seed_all(db)
    # excluded by name only (is_excluded false): defense in depth must still hide and block it
    op = make_operator(db, admin, name, tail="N77EXC1", email="excluded@example.com")
    flagged = make_operator(db, admin, "Harmless Name", excluded=True, tail="N77EXC2", email="flagged@example.com")
    ent = make_client()
    make_entitled(db, ent, admin, "ent@example.com")
    listed = ent.get("/v1/listings").json()
    assert all(x["tail_number"] not in ("N77EXC1", "N77EXC2", "N00TST7") for x in listed)
    assert not any(x["operator"] and x["operator"]["dba_name"] in (name, "Harmless Name", "SYNTHETIC Excluded Operator") for x in listed)
    tid = ent.post("/v1/trips", json=future_trip_body()).json()["id"]
    tails = [x["tail_number"] for x in ent.get(f"/v1/trips/{tid}/listings").json()]
    assert "N77EXC1" not in tails and "N77EXC2" not in tails and "N00TST7" not in tails
    # asking for the excluded aircraft directly is a 404
    from exjet_api.models import Aircraft

    for tail in ("N77EXC1", "N77EXC2", "N00TST7"):
        ac = db.execute(select(Aircraft).where(Aircraft.tail_number == tail)).scalar_one()
        r = ent.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [str(ac.id)]})
        assert r.status_code == 404
    # even a forged RFQ row for an excluded operator is blocked at dispatch
    ac = db.execute(select(Aircraft).where(Aircraft.tail_number == "N77EXC1")).scalar_one()
    rfq = Rfq(trip_id=uuid.UUID(tid), aircraft_id=ac.id, operator_id=op.id, reference="EXJ-FORGED", recipients=["excluded@example.com"])
    db.add(rfq)
    db.commit()
    from exjet_api.jobs import enqueue

    enqueue(db, "rfq.dispatch", {"rfq_id": str(rfq.id)})
    db.commit()
    run_jobs()
    assert get_mail().outbox == []
    db.refresh(rfq)
    assert rfq.status == "failed"
    assert db.execute(select(EmailMessage).where(EmailMessage.status == "blocked")).scalars().all()
    assert flagged.is_excluded


def test_excluded_operator_cannot_go_live(db, make_client):
    admin, ops = seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    nj = make_operator(db, admin, "NetJets", live=False, tail="N77EXC9")
    r = adm.post(f"/v1/admin/operators/{nj.id}/request-go-live")
    assert r.status_code == 409 and r.json()["error"]["code"] == "operator_excluded"
    x = ops["X"]
    assert adm.post(f"/v1/admin/operators/{x.id}/request-go-live").status_code == 409


# --------------------------------------------------------------------------- 5. go-live
def test_non_live_operator_never_receives_an_rfq(db, client, make_client):
    admin, ops = seed_all(db)
    ent = make_client()
    make_entitled(db, ent, admin, "ent@example.com")
    tid = ent.post("/v1/trips", json=future_trip_body()).json()["id"]
    from exjet_api.models import Aircraft

    b_tail = db.execute(select(Aircraft).where(Aircraft.tail_number == "N00TST4")).scalar_one()  # operator B: draft
    assert ops["B"].go_live_status == "draft"
    assert ent.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [str(b_tail.id)]}).status_code == 404
    assert "N00TST4" not in [x["tail_number"] for x in ent.get(f"/v1/trips/{tid}/listings").json()]
    # forged RFQ for the draft operator: dispatch must refuse
    rfq = Rfq(trip_id=uuid.UUID(tid), aircraft_id=b_tail.id, operator_id=ops["B"].id, reference="EXJ-DRAFT2", recipients=["ops-b@example.com"])
    db.add(rfq)
    db.commit()
    from exjet_api.jobs import enqueue

    enqueue(db, "rfq.dispatch", {"rfq_id": str(rfq.id)})
    db.commit()
    run_jobs()
    assert get_mail().outbox == []
    db.refresh(rfq)
    assert rfq.status == "failed"
    msgs = db.execute(select(AgentAction).where(AgentAction.event == "rfq.dispatch")).scalars().all()
    assert msgs and msgs[0].status == "blocked" and msgs[0].output["reason"] == "operator_not_live_or_excluded"


def test_live_operator_without_dispatch_policy_is_blocked(db, make_client):
    admin, ops = seed_all(db)
    pol = db.execute(select(Approval).where(Approval.kind == "rfq_dispatch_policy", Approval.subject_id == str(ops["A"].id))).scalar_one()
    db.delete(pol)
    db.commit()
    c = make_client()
    make_entitled(db, c, admin, "ent@example.com")
    tid = c.post("/v1/trips", json=future_trip_body()).json()["id"]
    lid = next(x["listing_id"] for x in c.get(f"/v1/trips/{tid}/listings").json() if x["tail_number"] == "N00TST1")
    c.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]})
    run_jobs()
    assert get_mail().outbox == []
    r = db.execute(select(Rfq)).scalar_one()
    assert r.status == "failed"


# --------------------------------------------------------------------------- 4. mailer
def _rfq_for(db, member, admin):
    tid = member.post("/v1/trips", json=future_trip_body()).json()["id"]
    lid = next(x["listing_id"] for x in member.get(f"/v1/trips/{tid}/listings").json() if x["tail_number"] == "N00TST1")
    rid = member.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]}).json()[0]["id"]
    return db.get(Rfq, uuid.UUID(rid)), db.get(Trip, uuid.UUID(tid))


def test_mailer_blocks_suppressed_recipients(db, make_client):
    admin, _ = seed_all(db)
    c = make_client()
    make_entitled(db, c, admin, "ent@example.com")
    rfq, trip = _rfq_for(db, c, admin)
    db.add(Suppression(email="ops-a@example.com", reason="unsubscribe"))
    db.commit()
    with pytest.raises(GuardrailViolation) as e:
        mailer.send(db, purpose="rfq", to=["OPS-A@example.com"], subject="s", body="b", rfq=rfq, actor_user_id=trip.created_by)
    assert e.value.code == "recipient_suppressed"
    assert get_mail().outbox == []
    row = db.execute(select(EmailMessage).where(EmailMessage.status == "blocked")).scalar_one()
    assert row.to_addresses == ["ops-a@example.com"] and row.purpose == "rfq"
    assert db.execute(select(AuditLog).where(AuditLog.action == "mail.blocked")).scalar_one().detail["reason"] == "recipient_suppressed"
    # suppression applies to every purpose, including a member-facing one
    db.add(Suppression(email="ent@example.com", reason="manual"))
    db.commit()
    with pytest.raises(GuardrailViolation):
        mailer.send(db, purpose="lifecycle", to=["ent@example.com"], subject="s", body="b", account_id=trip.account_id)
    # dispatch of the RFQ itself fails closed
    run_jobs()
    db.refresh(rfq)
    assert get_mail().outbox == [] and rfq.status == "failed"


def test_mailer_blocks_unapproved_outreach(db):
    admin, _ = seed_all(db)
    with pytest.raises(GuardrailViolation) as e:
        mailer.send(db, purpose="outreach", to=["prospect@example.com"], subject="hi", body="b")
    assert e.value.code == "outreach_requires_approval"
    pending = Approval(kind="outreach_campaign", subject_type="campaign", subject_id="c1", requested_by="agent:x", summary="s")
    wrong = Approval(kind="content_publish", subject_type="campaign", subject_id="c1", requested_by="agent:x", summary="s",
                     status="approved", decided_by=admin.id)
    db.add_all([pending, wrong])
    db.commit()
    for ap in (pending, wrong):
        with pytest.raises(GuardrailViolation):
            mailer.send(db, purpose="outreach", to=["prospect@example.com"], subject="hi", body="b", approval_id=ap.id)
    assert get_mail().outbox == []
    ok = Approval(kind="outreach_campaign", subject_type="campaign", subject_id="c2", requested_by="agent:x", summary="s",
                  status="approved", decided_by=admin.id, decided_at=datetime.now(UTC))
    db.add(ok)
    db.commit()
    m = mailer.send(db, purpose="outreach", to=["prospect@example.com"], subject="hi", body="b", approval_id=ok.id)
    assert m.status == "sent" and m.approval_id == ok.id and len(get_mail().outbox) == 1
    blocked = db.execute(select(EmailMessage).where(EmailMessage.status == "blocked")).scalars().all()
    assert len(blocked) == 3


def test_mailer_authorization_rules(db, make_client):
    admin, _ = seed_all(db)
    c = make_client()
    make_entitled(db, c, admin, "ent@example.com")
    other = make_client()
    make_entitled(db, other, admin, "other@example.com", "Other Person")
    rfq, trip = _rfq_for(db, c, admin)
    other_user = db.execute(select(Account)).scalars().all()
    assert other_user
    from exjet_api.models import User

    stranger = db.execute(select(User).where(User.email == "other@example.com")).scalar_one()

    def blocked(code, **kw):
        with pytest.raises(GuardrailViolation) as e:
            mailer.send(db, **kw)
        assert e.value.code == code

    base = dict(subject="s", body="b")
    blocked("unknown_purpose", purpose="newsletter", to=["x@example.com"], **base)
    blocked("no_recipients", purpose="rfq", to=[], rfq=rfq, actor_user_id=trip.created_by, **base)
    blocked("rfq_required", purpose="rfq", to=["ops-a@example.com"], actor_user_id=trip.created_by, **base)
    blocked("member_action_required", purpose="rfq", to=["ops-a@example.com"], rfq=rfq, **base)
    blocked("actor_not_account_member", purpose="rfq", to=["ops-a@example.com"], rfq=rfq, actor_user_id=stranger.id, **base)
    blocked("recipient_not_on_rfq", purpose="rfq", to=["someone-else@example.com"], rfq=rfq, actor_user_id=trip.created_by, **base)
    blocked("recipient_not_account_member", purpose="quote_to_member", to=["stranger@example.com"], rfq=rfq, **base)
    blocked("account_required", purpose="lifecycle", to=["ent@example.com"], **base)
    assert get_mail().outbox == []
    ok = mailer.send(db, purpose="rfq", to=["ops-a@example.com"], rfq=rfq, actor_user_id=trip.created_by, **base)
    assert ok.status == "sent" and ok.from_address == "quotes@exjet.com"
    ok2 = mailer.send(db, purpose="quote_to_member", to=["ent@example.com"], rfq=rfq, **base)
    assert ok2.status == "sent"


# --------------------------------------------------------------------------- 6. KYC
def test_kyc_cannot_become_approved_without_admin_decision(db, client, make_client):
    admin, _ = seed_all(db)
    signup(client, "k@example.com")
    client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "K", "doc_types": ["passport"]},
                files=[("files", ("p.png", b"\x89PNG\r\n\x1a\nxx", "image/png"))])
    run_jobs()  # vendor check passes, but must not approve
    acct = db.execute(select(Account)).scalar_one()
    assert acct.kyc_status == "in_review"
    # direct tampering without an approval row is refused by the ORM guard
    acct.kyc_status = "approved"
    with pytest.raises(GuardrailViolation) as e:
        db.commit()
    assert e.value.code == "kyc_requires_admin_decision"
    db.rollback()
    # a pending approval is not enough
    acct = db.execute(select(Account)).scalar_one()
    acct.kyc_status = "approved"
    with pytest.raises(GuardrailViolation):
        db.commit()
    db.rollback()
    # a rejected approval is not enough
    ap = db.execute(select(Approval).where(Approval.kind == "kyc_final")).scalar_one()
    ap.status, ap.decided_by = "rejected", admin.id
    db.commit()
    acct = db.execute(select(Account)).scalar_one()
    acct.kyc_status = "approved"
    with pytest.raises(GuardrailViolation):
        db.commit()
    db.rollback()
    assert db.execute(select(Account)).scalar_one().kyc_status == "in_review"
    # an approved row with no human decider is not enough either
    ap = db.execute(select(Approval).where(Approval.kind == "kyc_final")).scalar_one()
    ap.status, ap.decided_by = "approved", None
    db.commit()
    acct = db.execute(select(Account)).scalar_one()
    acct.kyc_status = "approved"
    with pytest.raises(GuardrailViolation):
        db.commit()
    db.rollback()
    # members and the API cannot decide
    assert client.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "approved"}).status_code == 403
    assert client.get("/v1/me").json()["entitled"] is False


def test_kyc_documents_are_admin_only_and_audited(db, client, make_client):
    admin, _ = seed_all(db)
    signup(client, "k@example.com")
    client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "K", "doc_types": ["passport"]},
                files=[("files", ("p.png", b"\x89PNG\r\n\x1a\nxx", "image/png"))])
    doc = db.execute(select(Document).where(Document.kind == "kyc")).scalar_one()
    assert client.get(f"/v1/documents/{doc.id}", follow_redirects=False).status_code == 404  # even the owner
    adm = make_client()
    login(adm, "admin@example.com")
    r = adm.get(f"/v1/documents/{doc.id}", follow_redirects=False)
    assert r.status_code == 302
    assert db.execute(select(AuditLog).where(AuditLog.action == "kyc_document_access")).scalars().all()
    assert adm.get(r.headers["location"]).content.startswith(b"\x89PNG")
    # signed links expire / cannot be forged
    assert adm.get("/v1/files/not-a-token").status_code == 404


def test_kyc_upload_validation(db, client):
    seed_all(db)
    signup(client, "v@example.com")
    bad = client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "V", "doc_types": ["passport"]},
                      files=[("files", ("p.png", b"<html>not an image</html>", "image/png"))])
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "unsupported_file_type"
    wrong = client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "V", "doc_types": ["business_doc"]},
                        files=[("files", ("p.png", b"\x89PNG\r\n\x1a\nxx", "image/png"))])
    assert wrong.status_code == 422


# --------------------------------------------------------------------------- 7. tenancy
def test_member_cannot_read_another_accounts_trip_or_documents(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm)
    tid = s["trip_id"]
    q = client.get(f"/v1/trips/{tid}/quotes").json()[0]
    intruder = make_client()
    make_entitled(db, intruder, s["admin"], "intruder@example.com", "Intruder")
    for method, path in [
        ("get", f"/v1/trips/{tid}"), ("get", f"/v1/trips/{tid}/match"), ("get", f"/v1/trips/{tid}/listings"),
        ("get", f"/v1/trips/{tid}/quotes"), ("get", f"/v1/trips/{tid}/manifest"), ("get", f"/v1/trips/{tid}/weather"),
        ("get", f"/v1/trips/{tid}/track"), ("post", f"/v1/trips/{tid}/cancel"), ("post", f"/v1/trips/{tid}/manifest/submit"),
        ("post", f"/v1/quotes/{q['id']}/accept"), ("post", f"/v1/quotes/{q['id']}/decline"),
        ("post", f"/v1/quotes/{q['id']}/payment/mark-paid"), ("post", f"/v1/contracts/{q['contract']['id']}/acknowledge"),
    ]:
        r = getattr(intruder, method)(path)
        assert r.status_code == 404, (path, r.status_code)
        assert_no_member_data(r.text)
    assert intruder.put(f"/v1/trips/{tid}/manifest", json={"passengers": []}).status_code == 404
    assert intruder.patch(f"/v1/trips/{tid}", json={"passengers": 2}).status_code == 404
    assert intruder.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [s["listing_id"]]}).status_code == 404
    for url in (q["quote_pdf_url"], q["contract"]["pdf_url"]):
        assert intruder.get(url, follow_redirects=False).status_code == 404
    assert intruder.get("/v1/trips").json() == []
    # the owner (and an admin) can
    assert client.get(q["quote_pdf_url"], follow_redirects=False).status_code == 302
    assert adm.get(q["quote_pdf_url"], follow_redirects=False).status_code == 302
    # unauthenticated
    anon = make_client()
    assert anon.get(f"/v1/trips/{tid}").status_code == 401 and anon.get(q["quote_pdf_url"]).status_code == 401


# --------------------------------------------------------------------------- 2. quotes never invented
def test_unreadable_total_is_needs_review_with_null_amount(db, client, make_client):
    import io

    from helpers import contract_pdf
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(60, 700, "Charter Quotation")  # quote-ish document with no readable total
    c.drawString(60, 680, "Please call us to discuss pricing for your trip.")
    c.showPage()
    c.save()
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[
        {"filename": "quote.pdf", "content_base64": b64(buf.getvalue())},
        {"filename": "agreement.pdf", "content_base64": b64(contract_pdf())}])
    q = db.execute(select(Quote)).scalar_one()
    assert q.status == "needs_review" and q.total_amount_cents is None and q.parse_confidence == 0.0
    assert "total_not_found" in q.parsed["flags"]
    # hidden from the member and cannot be accepted
    assert client.get(f"/v1/trips/{s['trip_id']}/quotes").json() == []
    assert client.post(f"/v1/quotes/{q.id}/accept").status_code == 404
    assert client.get(f"/v1/trips/{s['trip_id']}").json()["status"] == "rfq_sent"
    assert get_mail().sent_to("pat@example.com") == []  # no notification for an unreviewed quote
    # admin queue shows it; an amount that is not in the PDF is refused
    queue = adm.get("/v1/admin/quotes").json()
    assert [x["id"] for x in queue] == [str(q.id)] and "total_not_found" in queue[0]["flags"]
    bad = adm.post(f"/v1/admin/quotes/{q.id}/resolve", json={"total_amount_cents": 4_000_000})
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "amount_not_in_document"
    db.refresh(q)
    assert q.total_amount_cents is None and q.status == "needs_review"


def test_ambiguous_totals_go_to_review_and_admin_can_resolve_with_a_verbatim_amount(db, client, make_client):
    from helpers import contract_pdf, pdf_bytes

    pdf = pdf_bytes(["Charter Quotation", "Quote No: Q-AMB-1", "Grand Total: $45,200.00", "Grand Total: $47,500.00"])
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[
        {"filename": "quote.pdf", "content_base64": b64(pdf)}, {"filename": "agreement.pdf", "content_base64": b64(contract_pdf())}])
    q = db.execute(select(Quote)).scalar_one()
    assert q.status == "needs_review" and q.total_amount_cents is None
    r = adm.post(f"/v1/admin/quotes/{q.id}/resolve", json={"total_amount_cents": 4_750_000})
    assert r.status_code == 200 and r.json()["status"] == "ready"
    db.refresh(q)
    assert q.total_amount_cents == 4_750_000 and q.parser.startswith("manual:")
    visible = client.get(f"/v1/trips/{s['trip_id']}/quotes").json()
    assert visible[0]["total_amount_cents"] == 4_750_000
    assert len(get_mail().sent_to("pat@example.com")) == 1


def test_quote_from_unknown_sender_or_unmatched_reference_is_not_ingested(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    ref = s["ref"]
    from helpers import contract_pdf, quote_pdf

    atts = [{"filename": "quote.pdf", "content_base64": b64(quote_pdf())}, {"filename": "c.pdf", "content_base64": b64(contract_pdf())}]
    inbound(adm, "attacker@evil.example", f"Re: [{ref}] quote", "pay here", atts)
    inbound(adm, "ops-a@example.com", "Re: [EXJ-ZZZZZZ] quote", "wrong ref", atts)
    assert db.execute(select(Quote)).scalars().all() == []
    reasons = [a.output.get("reason") for a in db.execute(select(AgentAction).where(AgentAction.agent == "quote_ingest")).scalars()]
    assert "sender_not_on_rfq" in reasons and "no_rfq_match" in reasons
    # same domain as the contact is accepted (a colleague replying)
    inbound(adm, "dispatch@example.com", f"Re: [{ref}] quote", "attached", atts)
    assert len(db.execute(select(Quote)).scalars().all()) == 1


def test_operator_decline_marks_rfq_declined(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] Charter request", "Sorry, that aircraft is not available on those dates.")
    r = db.get(Rfq, uuid.UUID(s["rfq"]["id"]))
    assert r.status == "declined" and r.replied_at is not None
    assert db.execute(select(Quote)).scalars().all() == []


# --------------------------------------------------------------------------- dev endpoints
@pytest.mark.parametrize("env", ["prod", "staging"])
def test_dev_endpoints_404_outside_dev_and_test(client, monkeypatch, env):
    from exjet_api.config import get_settings

    monkeypatch.setenv("EXJET_ENV", env)
    get_settings.cache_clear()
    body = {"from_address": "a@example.com", "subject": "s"}
    assert client.post("/v1/dev/inbound-email", json=body).status_code == 404
    assert client.post("/v1/dev/run-jobs").status_code == 404
    assert client.post("/v1/dev/complete-checkout", json={"account_id": str(uuid.uuid4()), "plan": "individual"}).status_code == 404
    assert client.post("/v1/dev/run-jobs").json()["error"]["code"] == "not_found"


def test_dev_endpoints_available_in_test_env(client):
    assert client.post("/v1/dev/run-jobs").status_code == 200


def test_staging_prod_refuse_to_boot_on_fakes(monkeypatch):
    from exjet_api.config import get_settings
    from exjet_api.providers import assert_safe_for_env

    monkeypatch.setenv("EXJET_ENV", "prod")
    get_settings.cache_clear()
    with pytest.raises(RuntimeError):
        assert_safe_for_env()
