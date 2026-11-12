"""M1: one email normalizer everywhere; suppressions match case/whitespace/IDNA variants and are actually written."""
import pytest
from helpers import b64, inbound, login, quote_pdf, seed_all, signup, to_quote_stage
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError

from exjet_api import mailer
from exjet_api.emailnorm import normalize_email
from exjet_api.guardrails import GuardrailViolation
from exjet_api.models import Approval, AuditLog, OperatorContact, Suppression, User
from exjet_api.services import suppression as sup


@pytest.mark.parametrize("raw,norm", [
    ("  Ops@Example.COM ", "ops@example.com"), ("ＯＰＳ@ｅｘａｍｐｌｅ.com", "ops@example.com"),
    ("a@Bücher.example", "a@xn--bcher-kva.example"), ("a@example.com.", "a@example.com"), ("A+tag@x.org", "a+tag@x.org"),
])
def test_normalize_email(raw, norm):
    assert normalize_email(raw) == norm


@pytest.mark.parametrize("bad", ["", None, "no-at", "a@@b.com", "a b@c.com", "<a@b.com>", "a@", "@b.com", "a@b c.com"])
def test_normalize_email_rejects_non_addresses(bad):
    assert normalize_email(bad) == ""


def test_suppression_matches_case_whitespace_and_idna_variants(db, client, make_client):
    adm = make_client()
    to_quote_stage(db, client, adm, attachments=[])
    sup.suppress(db, "Ops-A@Example.com ", "manual", "test")
    db.commit()
    assert db.execute(select(Suppression.email)).scalar_one() == "ops-a@example.com"  # stored normalized
    from exjet_api.models import Rfq

    rfq = db.query(Rfq).first()
    for variant in ("ops-a@example.com", "OPS-A@EXAMPLE.COM", " ops-a@example.com\t"):
        with pytest.raises(GuardrailViolation) as e:
            mailer.send(db, purpose="rfq", to=[variant], subject="s", body="b", rfq=rfq, actor_user_id=rfq.trip.created_by)
        assert e.value.code == "recipient_suppressed"


def test_a_legacy_mixed_case_row_still_blocks_sends(db, client, make_client):
    """Rows written before normalization (e.g. by SQL) are matched case-insensitively at check time."""
    adm = make_client()
    to_quote_stage(db, client, adm, attachments=[])
    db.execute(text("INSERT INTO suppressions (id, email, reason, created_at, updated_at) "
                    "VALUES (gen_random_uuid(), 'Legacy@Example.com', 'manual', now(), now())"))
    db.commit()
    assert mailer.is_suppressed(db, "legacy@example.com") and mailer.is_suppressed(db, " LEGACY@example.COM")


def test_unique_index_is_on_lower_email(db):
    db.execute(text("INSERT INTO suppressions (id, email, reason, created_at, updated_at) "
                    "VALUES (gen_random_uuid(), 'dup@example.com', 'manual', now(), now())"))
    db.commit()
    with pytest.raises(IntegrityError):
        db.execute(text("INSERT INTO suppressions (id, email, reason, created_at, updated_at) "
                        "VALUES (gen_random_uuid(), 'DUP@example.com', 'manual', now(), now())"))
        db.commit()
    db.rollback()


def test_suppress_is_idempotent_and_audited(db):
    a = sup.suppress(db, "x@example.com", "unsubscribe", "test")
    b = sup.suppress(db, "X@Example.com", "manual", "test")
    assert a.id == b.id and len(db.execute(select(Suppression)).scalars().all()) == 1
    assert [r.action for r in db.execute(select(AuditLog).order_by(AuditLog.at)).scalars()][-2:] == ["suppression.added", "suppression.exists"]
    with pytest.raises(Exception):  # noqa: B017 - ApiError 422
        sup.suppress(db, "not-an-email", "manual", "test")


def test_admin_endpoints_add_list_remove_with_audit(db, client, make_client):
    seed_all(db)
    adm = make_client()
    login(adm, "admin@example.com")
    r = adm.post("/v1/admin/suppressions", json={"email": " Block@Example.com", "reason": "legal"})
    assert r.status_code == 201 and r.json()["email"] == "block@example.com" and r.json()["reason"] == "legal"
    assert [x["email"] for x in adm.get("/v1/admin/suppressions").json()] == ["block@example.com"]
    assert adm.post("/v1/admin/suppressions", json={"email": "bad", "reason": "manual"}).status_code == 422
    assert adm.delete(f"/v1/admin/suppressions/{r.json()['id']}").status_code == 204
    assert adm.get("/v1/admin/suppressions").json() == []
    acts = [a.action for a in db.execute(select(AuditLog).order_by(AuditLog.at)).scalars()]
    assert "suppression.added" in acts and "suppression.removed" in acts
    # admin only
    member = make_client()
    signup(member, "m@example.com")
    assert member.get("/v1/admin/suppressions").status_code == 403 and member.post("/v1/admin/suppressions", json={"email": "a@b.com"}).status_code == 403


# --------------------------------------------------------------------------- inbound keyword handler
@pytest.mark.parametrize("body,reason,review", [
    ("Please unsubscribe us from your list", "unsubscribe", False),
    ("Stop emailing me.", "unsubscribe", False),
    ("This is spam and we will report you", "complaint", True),
    ("Our attorney will contact you; cease and desist.", "legal", True),
])
def test_replies_with_stop_complaint_or_legal_keywords_suppress_the_sender(db, client, make_client, body, reason, review):
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] Charter request", body,
            [{"filename": "quote.pdf", "content_base64": b64(quote_pdf())}])
    row = db.execute(select(Suppression)).scalar_one()
    assert row.email == "ops-a@example.com" and row.reason == reason and row.source.startswith("inbound:")
    from exjet_api.models import Quote

    assert db.execute(select(Quote)).scalars().all() == []  # a stop request is not treated as a quote
    notices = db.execute(select(Approval).where(Approval.kind == "legal_notice")).scalars().all()
    assert bool(notices) is review
    # and the contact can no longer be mailed
    assert mailer.is_suppressed(db, "OPS-A@example.com")


def test_a_forged_unauthenticated_sender_cannot_suppress_anyone(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] Charter request", "unsubscribe me", dmarc_pass=False)
    assert db.execute(select(Suppression)).scalars().all() == []


def test_ordinary_quote_replies_do_not_suppress(db, client, make_client):
    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] Charter request", "Attached is our quote. Thanks!",
            [{"filename": "quote.pdf", "content_base64": b64(quote_pdf())}])
    assert db.execute(select(Suppression)).scalars().all() == []


def test_one_normalizer_for_users_and_contacts(db, client):
    seed_all(db)
    signup(client, "  Mixed.Case@Example.COM ")
    assert db.execute(select(User.email).where(User.role == "member")).scalar_one() == "mixed.case@example.com"
    assert client.post("/v1/auth/login", json={"email": "MIXED.CASE@example.com", "password": "correct-horse-battery-1"}).status_code == 200
    from exjet_api.models import Operator

    op = db.execute(select(Operator)).scalars().first()
    db.add(OperatorContact(operator_id=op.id, name="n", email=" NEW.Contact@Example.COM "))
    db.commit()
    assert db.execute(select(OperatorContact.email).where(OperatorContact.name == "n")).scalar_one() == "new.contact@example.com"
