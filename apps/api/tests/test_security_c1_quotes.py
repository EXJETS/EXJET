"""C1: inbound quote / payment-link injection. Each test fails against the pre-fix code (domain trust, no
authentication result, no payment host pinning, auto-supersede)."""
import uuid

from helpers import b64, contract_pdf, inbound, login, quote_pdf, run_jobs, to_quote_stage
from sqlalchemy import select

from exjet_api.emailnorm import parse_single_address
from exjet_api.models import AgentAction, Approval, EmailMessage, Operator, PaymentLink, Quote

ATT = lambda **kw: [{"filename": "quote.pdf", "content_base64": b64(quote_pdf(**kw))},  # noqa: E731
                    {"filename": "agreement.pdf", "content_base64": b64(contract_pdf())}]


def _stage(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    return adm, s


def _last_inbound(db):
    db.expire_all()
    return db.execute(select(EmailMessage).where(EmailMessage.direction == "inbound")
                      .order_by(EmailMessage.created_at.desc())).scalars().first()


def _quotes(db):
    db.expire_all()
    return db.execute(select(Quote).order_by(Quote.created_at)).scalars().all()


# --------------------------------------------------------------------------- sender trust
def test_malformed_from_header_does_not_pass_as_a_stored_contact(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    # the reported probe: stdlib parseaddr() would have yielded ops-a@example.com for part of this value
    inbound(adm, "x@other.test <ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT())
    assert _quotes(db) == []
    assert _last_inbound(db).status == "rejected"


def test_multiple_from_addresses_and_spoofed_display_names_are_rejected(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    for hdr in ("ops-a@example.com, evil@evil.test", '"ops-a@example.com" <evil@evil.test>', "evil@evil.test (ops-a@example.com)"):
        inbound(adm, hdr, f"Re: [{s['ref']}] quote", "pay", ATT())
    assert _quotes(db) == []
    assert parse_single_address("Ops <OPS-A@Example.com>") == "ops-a@example.com"


def test_same_domain_colleague_mailbox_is_not_trusted(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "anyone@example.com", f"Re: [{s['ref']}] quote", "pay", ATT())
    assert _quotes(db) == []
    reasons = [a.output.get("reason") for a in db.execute(select(AgentAction).where(AgentAction.event == "quote.rejected_sender")).scalars()]
    assert reasons == ["sender_not_a_recipient_contact"]


def test_contact_of_another_operator_cannot_answer_this_rfq(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "ops-c@example.com", f"Re: [{s['ref']}] quote", "pay", ATT())  # a real stored contact, but operator C's
    assert _quotes(db) == []


# --------------------------------------------------------------------------- authentication result
def test_unauthenticated_mail_is_quarantined_with_an_admin_review_item(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT(), dmarc_pass=False, spf="fail", dkim="none")
    assert _quotes(db) == []  # no quote of any status: nothing a member (or the review queue) could mistake for a quote
    msg = _last_inbound(db)
    assert msg.status == "quarantined" and msg.quarantine_reason == "dmarc_not_passed"
    assert msg.auth_result == {"dmarc_pass": False, "spf": "fail", "dkim": "none"}
    item = db.execute(select(Approval).where(Approval.kind == "inbound_review")).scalar_one()
    assert item.status == "pending" and item.subject_id == str(msg.id)
    assert client.get(f"/v1/trips/{s['trip_id']}/quotes").json() == []
    q = adm.get("/v1/admin/inbound/quarantined").json()
    assert len(q) == 1 and q[0]["dmarc_pass"] is False and q[0]["approval_id"] == str(item.id)


def test_missing_authentication_verdict_fails_closed(db, client, make_client):
    """A provider that supplies no verdict is not authenticated (InboundAuth defaults to dmarc_pass=False)."""
    from exjet_api.providers import get_mail
    from exjet_api.providers.mail import Attachment, InboundEmail
    from exjet_api.services import quote_service

    adm, s = _stage(db, client, make_client)
    get_mail().inject_inbound(InboundEmail(
        provider_message_id="m-noauth", thread_id=None, from_address="ops-a@example.com", to=["quotes@exjet.com"],
        subject=f"Re: [{s['ref']}] quote", body_text="x", attachments=[Attachment("q.pdf", "application/pdf", quote_pdf())]))
    quote_service.poll_inbox(db)
    db.commit()
    run_jobs()
    assert _quotes(db) == []
    assert db.execute(select(EmailMessage).where(EmailMessage.provider_message_id == "m-noauth")).scalar_one().status == "quarantined"


def test_admin_can_release_a_quarantined_message_and_pinning_still_applies(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT(), dmarc_pass=False)
    item = db.execute(select(Approval).where(Approval.kind == "inbound_review")).scalar_one()
    assert adm.post(f"/v1/admin/approvals/{item.id}/decide", json={"decision": "approved", "note": "verified by phone"}).status_code == 200
    run_jobs()
    qs = _quotes(db)
    assert len(qs) == 1 and qs[0].status == "ready"  # host is on the approved list
    # rejecting keeps it out for good
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote 2", "pay", ATT(total="$10.00"), dmarc_pass=False)
    item2 = db.execute(select(Approval).where(Approval.kind == "inbound_review", Approval.status == "pending")).scalar_one()
    adm.post(f"/v1/admin/approvals/{item2.id}/decide", json={"decision": "rejected"})
    run_jobs()
    assert len(_quotes(db)) == 1


# --------------------------------------------------------------------------- payment host pinning
def test_unapproved_payment_host_goes_to_review_and_is_hidden_from_the_member(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT(pay_url="https://pay.evil-payments.test/x"))
    (q,) = _quotes(db)
    assert q.status == "needs_review" and "payment_host_not_approved" in (q.parsed or {}).get("flags", [])
    assert client.get(f"/v1/trips/{s['trip_id']}/quotes").json() == []
    review = adm.get("/v1/admin/quotes").json()[0]
    assert review["payment_host"] == "pay.evil-payments.test" and review["payment_host_approved"] is False
    ap = db.execute(select(Approval).where(Approval.kind == "payment_host")).scalar_one()
    assert str(ap.id) == review["payment_host_approval_id"] and ap.payload["host"] == "pay.evil-payments.test"
    # an admin cannot push it live with /resolve while the host is unapproved
    r = adm.post(f"/v1/admin/quotes/{q.id}/resolve", json={"total_amount_cents": 4_520_000})
    assert r.status_code == 409 and r.json()["error"]["code"] == "payment_host_not_approved"


def test_approving_the_host_adds_it_to_the_operator_and_releases_the_quote(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT(pay_url="https://pay.newhost.test/x"))
    ap = db.execute(select(Approval).where(Approval.kind == "payment_host")).scalar_one()
    assert adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "approved"}).status_code == 200
    db.expire_all()
    op = db.get(Operator, uuid.UUID(ap.payload["operator_id"]))
    assert "pay.newhost.test" in op.payment_hosts and "pay.example.com" in op.payment_hosts
    (q,) = _quotes(db)
    assert q.status == "ready"
    shown = client.get(f"/v1/trips/{s['trip_id']}/quotes").json()
    assert len(shown) == 1 and shown[0]["payment_link"]["host"] == "pay.newhost.test" and shown[0]["payment_link"]["host_approved"] is True


def test_rejecting_the_host_declines_the_quote_and_pins_nothing(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT(pay_url="https://pay.badhost.test/x"))
    ap = db.execute(select(Approval).where(Approval.kind == "payment_host")).scalar_one()
    adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "rejected"})
    db.expire_all()
    (q,) = _quotes(db)
    assert q.status == "declined"
    assert "pay.badhost.test" not in (db.get(Operator, q.operator_id).payment_hosts or [])
    assert client.get(f"/v1/trips/{s['trip_id']}/quotes").json()[0]["status"] == "declined"


def test_admin_sets_payment_hosts_at_onboarding(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    op = db.execute(select(Operator).where(Operator.certificate_number == "SYNTH-A")).scalar_one()
    r = adm.put(f"/v1/admin/operators/{op.id}/payment-hosts", json={"hosts": ["Pay.Onboarded.test", "pay.onboarded.test"]})
    assert r.status_code == 200 and r.json()["payment_hosts"] == ["pay.onboarded.test"]
    assert adm.put(f"/v1/admin/operators/{op.id}/payment-hosts", json={"hosts": ["https://x.test/y"]}).status_code == 422
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT(pay_url="https://pay.example.com/old"))
    assert _quotes(db)[0].status == "needs_review"  # the old host is no longer approved


def test_accept_and_mark_paid_refuse_an_unapproved_host_even_if_status_was_forced(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "pay", ATT())
    (q,) = _quotes(db)
    link = db.execute(select(PaymentLink).where(PaymentLink.quote_id == q.id)).scalar_one()
    link.host = "pay.swapped.test"
    db.commit()
    r = client.post(f"/v1/quotes/{q.id}/accept")
    assert r.status_code == 409 and r.json()["error"]["code"] == "payment_host_not_approved"


# --------------------------------------------------------------------------- no auto-supersede
def test_a_second_quote_never_expires_or_hides_the_first(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "first", ATT())
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote again", "same again", ATT())  # identical host and total
    a, b = _quotes(db)
    assert a.status == "ready" and b.status == "ready"  # the first was NOT expired
    assert [x["status"] for x in client.get(f"/v1/trips/{s['trip_id']}/quotes").json()] == ["ready", "ready"]


def test_a_second_quote_with_a_different_host_or_total_waits_for_an_admin_and_both_remain(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "first", ATT())
    # same approved host, different total
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote 2", "revised", ATT(total="$1,000.00"))
    a, b = _quotes(db)
    assert a.status == "ready"  # untouched
    assert b.status == "needs_review" and "differs_from_earlier_quote" in b.parsed["flags"]
    shown = client.get(f"/v1/trips/{s['trip_id']}/quotes").json()
    assert [x["status"] for x in shown] == ["ready"]  # the member keeps the original; the revision is not shown yet
    # an admin who verifies the amount in the PDF releases it: both quotes, and the UI is told it changed
    r = adm.post(f"/v1/admin/quotes/{b.id}/resolve", json={"total_amount_cents": 100_000})
    assert r.status_code == 200
    shown = client.get(f"/v1/trips/{s['trip_id']}/quotes").json()
    assert [x["status"] for x in shown] == ["ready", "ready"]
    assert [x["payment_link"]["changed_since_first"] for x in shown] == [False, True]


def test_a_second_quote_with_a_new_host_is_flagged_twice_and_changed_since_first(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "first", ATT())
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote 2", "pay here instead", ATT(pay_url="https://pay.attacker.test/x"))
    a, b = _quotes(db)
    assert a.status == "ready" and b.status == "needs_review"
    assert {"payment_host_not_approved", "differs_from_earlier_quote"} <= set(b.parsed["flags"])
    ap = db.execute(select(Approval).where(Approval.kind == "payment_host")).scalar_one()
    adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "approved"})
    db.expire_all()
    assert _quotes(db)[1].status == "needs_review"  # still differs from the first: needs the explicit resolve
