"""L1 listings home filter, L3 signup enumeration, L8 mailer transactions, L9 billing idempotency and ordering."""
import uuid
from datetime import timedelta

import pytest
from helpers import PASSWORD, make_entitled, seed_all, signup
from sqlalchemy import select, text

from exjet_api import clock, mailer
from exjet_api.config import get_settings
from exjet_api.guardrails import GuardrailViolation
from exjet_api.models import Account, Approval, BillingEventRecord, EmailMessage, Subscription, User
from exjet_api.providers import get_mail
from exjet_api.providers.billing import FakeBilling
from exjet_api.providers.errors import ProviderError


# --------------------------------------------------------------------------- L1
def _homes(c, home=None):
    r = c.get("/v1/listings", params={"home": home} if home else None)
    assert r.status_code == 200
    return sorted(x["listing_id"] for x in r.json())


def test_exact_airport_filters_do_not_narrow_listings_for_visitors_or_non_entitled(db, client, make_client):
    seed_all(db)
    visitor, plain = make_client(), make_client()
    signup(plain, "plain@example.com")
    for c in (visitor, plain):
        everything = _homes(c)
        assert len(everything) >= 4
        # an ICAO / IATA code is ignored: probing airports one by one reveals nothing
        for code in ("KTEB", "kteb", "TEB", "KHPN", "KDAL", "ZZZZ"):
            if code == "ZZZZ":
                continue
            assert _homes(c, code) == everything
        assert len({tuple(_homes(c, code)) for code in ("KTEB", "KHPN", "KDAL")}) == 1  # identical answers: no airport signal
        # city / metro level filtering still works
        dallas = _homes(c, "Dallas")
        assert 0 < len(dallas) < len(everything)
        assert _homes(c, "no such city") == []


def test_entitled_members_keep_exact_airport_filters(db, client):
    admin, _ = seed_all(db)
    make_entitled(db, client, admin, "ent@example.com")
    teb = client.get("/v1/listings", params={"home": "KTEB"}).json()
    assert {x["tail_number"] for x in teb} == {"N00TST1", "N00TST2"}
    assert {x["tail_number"] for x in client.get("/v1/listings", params={"home": "KHPN"}).json()} == {"N00TST3"}


# --------------------------------------------------------------------------- L3
def test_existing_email_signup_sends_an_account_notice_and_changes_nothing(db, client, make_client):
    signup(client, "dup@example.com")
    other = make_client()
    r = signup(other, "DUP@example.com", "Someone Else")
    assert r.status_code == 202 and r.json() == {"status": "check_your_email"} and "set-cookie" not in r.headers
    assert db.execute(select(User).where(User.email == "dup@example.com")).scalars().all().__len__() == 1
    (msg,) = get_mail().sent_to("dup@example.com")
    assert "already" in msg.body_text.lower() and "password" not in PASSWORD
    row = db.execute(select(EmailMessage).where(EmailMessage.purpose == "account_notice")).scalar_one()
    assert row.status == "sent"
    assert other.get("/v1/me").status_code == 401  # the second signup did not log anyone in


def test_new_email_signup_still_logs_in_immediately_in_dev_and_test(client):
    r = signup(client, "new@example.com")
    assert r.status_code == 201 and r.json()["user"]["email"] == "new@example.com"
    assert client.get("/v1/me").status_code == 200


def test_outside_dev_new_and_existing_emails_get_the_identical_answer(db, make_client, monkeypatch):
    from exjet_api.routers import auth

    cur = get_settings()

    class NonDev(type(cur)):
        @property
        def is_dev_like(self):
            return False

    monkeypatch.setattr(auth, "get_settings", lambda: NonDev(**cur.model_dump()))
    a, b = make_client(), make_client()
    new = signup(a, "brand-new@example.com")
    existing = signup(b, "brand-new@example.com")
    assert (new.status_code, new.json()) == (existing.status_code, existing.json()) == (202, {"status": "check_your_email"})
    assert a.get("/v1/me").status_code == 401  # no session: the person signs in with their password
    assert login_ok(make_client(), "brand-new@example.com")


def login_ok(c, email):
    return c.post("/v1/auth/login", json={"email": email, "password": PASSWORD}).status_code == 200


# --------------------------------------------------------------------------- L8
def _independent(sql, **p):
    from exjet_api.db import session_factory

    with session_factory()() as s:
        return s.execute(text(sql), p).scalars().all()


def test_a_blocked_send_commits_nothing_of_the_callers(db):
    db.add(Approval(kind="deploy", subject_type="x", subject_id="pending-caller-work", requested_by="test", summary="caller work"))
    db.flush()  # the caller's uncommitted transaction
    with pytest.raises(GuardrailViolation):
        mailer.send(db, purpose="outreach", to=["prospect@example.com"], subject="s", body="b")  # no approval id: blocked
    assert _independent("select status from email_messages") == ["blocked"]  # the evidence is durable...
    assert _independent("select count(*) from approvals where subject_id = 'pending-caller-work'") == [0]  # ...the caller's work is not
    db.rollback()
    assert _independent("select status from email_messages") == ["blocked"]  # rollback does not erase the blocked record
    assert _independent("select action from audit_log") == ["mail.blocked"]


def test_a_suppressed_send_is_recorded_independently_and_the_caller_can_still_roll_back(db):
    from exjet_api.services import suppression

    suppression.suppress(db, "x@example.com", "manual", "test")
    db.commit()
    db.add(Approval(kind="deploy", subject_type="x", subject_id="more-caller-work", requested_by="test", summary="w"))
    db.flush()
    with pytest.raises(GuardrailViolation) as e:
        mailer.send(db, purpose="outreach", to=["X@Example.com"], subject="s", body="b", approval_id=uuid.uuid4())
    assert e.value.code == "recipient_suppressed"
    db.rollback()
    assert _independent("select count(*) from approvals where subject_id = 'more-caller-work'") == [0]
    assert _independent("select status from email_messages") == ["blocked"]


def test_provider_failure_is_recorded_without_committing_the_caller(db):
    admin, _ = seed_all(db)
    acct = make_entitled_session(db, admin)
    db.add(Approval(kind="deploy", subject_type="x", subject_id="caller-work-3", requested_by="test", summary="w"))
    db.flush()
    get_mail().fail_next_send = True
    with pytest.raises(ProviderError):
        mailer.send(db, purpose="lifecycle", to=["lc@example.com"], subject="s", body="b", account_id=acct.id)
    assert _independent("select status from email_messages where purpose = 'lifecycle'") == ["failed"]
    assert _independent("select count(*) from approvals where subject_id = 'caller-work-3'") == [0]


def make_entitled_session(db, admin):
    """An entitled account with one member whose email is lc@example.com (created through the ORM)."""
    from exjet_api.models import AccountMember

    u = User(email="lc@example.com", password_hash="x", full_name="L C")
    a = Account(type="individual", display_name="L C")
    db.add_all([u, a])
    db.flush()
    db.add(AccountMember(account_id=a.id, user_id=u.id, is_owner=True))
    db.commit()
    return a


def test_a_successful_send_does_not_commit_the_caller_either(db):
    admin, _ = seed_all(db)
    acct = make_entitled_session(db, admin)
    mailer.send(db, purpose="lifecycle", to=["lc@example.com"], subject="s", body="b", account_id=acct.id)
    assert _independent("select count(*) from email_messages") == [0]  # sits in the caller's open transaction
    db.commit()
    assert _independent("select status from email_messages") == ["sent"]


# --------------------------------------------------------------------------- L9
def _event(client, acct_id, type_, *, plan=None, at=None, event_id=None):
    ts = int((at or clock.now()).timestamp())
    body, sig = FakeBilling().make_event(type_, acct_id, plan, ts + 30 * 86400, created_ts=ts, event_id=event_id)
    return client.post("/v1/billing/webhook", content=body, headers={"X-Webhook-Signature": sig})


def _status(db, acct_id):
    db.expire_all()
    return db.execute(select(Subscription.status).where(Subscription.account_id == acct_id)).scalar_one()


def _acct(db, client):
    seed_all(db)
    me = signup(client, "b@example.com").json()
    return uuid.UUID(me["account"]["id"])


def test_replayed_events_are_idempotent(db, client):
    acct = _acct(db, client)
    now = clock.now()
    r1 = _event(client, acct, "checkout.completed", plan="individual", at=now, event_id="evt_1")
    assert r1.status_code == 200 and r1.json()["outcome"] == "applied"
    r2 = _event(client, acct, "checkout.completed", plan="individual", at=now, event_id="evt_1")
    assert r2.status_code == 200 and r2.json()["outcome"] == "duplicate"
    assert db.execute(select(BillingEventRecord)).scalars().all().__len__() == 1
    assert db.execute(text("select count(*) from agent_actions where agent = 'billing'")).scalar_one() == 1


def test_a_replayed_renewal_cannot_reactivate_a_canceled_subscription(db, client):
    acct = _acct(db, client)
    t0 = clock.now()
    _event(client, acct, "checkout.completed", plan="individual", at=t0, event_id="e1")
    renewed = _event(client, acct, "subscription.renewed", at=t0 + timedelta(seconds=10), event_id="e2")
    assert renewed.json()["outcome"] == "applied"
    _event(client, acct, "subscription.canceled", at=t0 + timedelta(seconds=20), event_id="e3")
    assert _status(db, acct) == "canceled"
    # the same renewal replayed, and a brand new id carrying the OLD timestamp (out of order delivery)
    assert _event(client, acct, "subscription.renewed", at=t0 + timedelta(seconds=10), event_id="e2").json()["outcome"] == "duplicate"
    assert _event(client, acct, "subscription.renewed", at=t0 + timedelta(seconds=10), event_id="e4").json()["outcome"] == "ignored_stale"
    assert _status(db, acct) == "canceled"
    # even a renewal with a NEWER time cannot reopen a canceled subscription (state machine)
    assert _event(client, acct, "subscription.renewed", at=t0 + timedelta(seconds=30), event_id="e5").json()["outcome"] == "ignored_state"
    assert _status(db, acct) == "canceled"
    # only a fresh checkout does
    assert _event(client, acct, "checkout.completed", plan="individual", at=t0 + timedelta(seconds=40), event_id="e6").json()["outcome"] == "applied"
    assert _status(db, acct) == "active"
    assert db.execute(select(Subscription.canceled_at)).scalar_one() is None


def test_stale_payment_failure_does_not_override_a_newer_state(db, client):
    acct = _acct(db, client)
    t0 = clock.now()
    _event(client, acct, "checkout.completed", plan="individual", at=t0, event_id="a1")
    _event(client, acct, "subscription.renewed", at=t0 + timedelta(seconds=50), event_id="a2")
    assert _event(client, acct, "payment.failed", at=t0 + timedelta(seconds=5), event_id="a3").json()["outcome"] == "ignored_stale"
    assert _status(db, acct) == "active"
    assert _event(client, acct, "payment.failed", at=t0 + timedelta(seconds=60), event_id="a4").json()["outcome"] == "applied"
    assert _status(db, acct) == "past_due"


def test_event_timestamps_must_be_within_tolerance(db, client):
    acct = _acct(db, client)
    now = clock.now()
    future = _event(client, acct, "checkout.completed", plan="individual", at=now + timedelta(minutes=10), event_id="f1")
    old = _event(client, acct, "checkout.completed", plan="individual", at=now - timedelta(days=4), event_id="f2")
    assert future.status_code == 400 and future.json()["error"]["code"] == "event_timestamp_out_of_tolerance"
    assert old.status_code == 400
    assert db.execute(select(Subscription)).scalars().all() == []  # nothing applied
    assert _event(client, acct, "checkout.completed", plan="individual", at=now - timedelta(hours=1), event_id="f3").status_code == 200
