"""Email verification: signup issues a single-use hashed expiring token through the mailer; login is refused until it is
redeemed outside dev/test; resend is uniform and rate limited."""
import re
from datetime import timedelta

from helpers import PASSWORD, login, seed_all
from helpers import signup as _signup
from sqlalchemy import select, text

from exjet_api import clock, ratelimit
from exjet_api.config import get_settings
from exjet_api.models import EmailMessage, EmailVerificationToken, User
from exjet_api.providers import get_mail
from exjet_api.routers import auth


def signup(client, email, *a, **kw):
    return _signup(client, email, *a, keep_verification_mail=True, **kw)


def _token(email: str) -> str:
    msgs = get_mail().sent_to(email)
    assert msgs, f"no email to {email}"
    m = re.search(r"/verify-email\?token=([\w-]+)", msgs[-1].body_text)
    assert m, msgs[-1].body_text
    return m.group(1)


def _non_dev(monkeypatch):
    cur = get_settings()

    class NonDev(type(cur)):
        @property
        def is_dev_like(self):
            return False

    monkeypatch.setattr(auth, "get_settings", lambda: NonDev(**cur.model_dump()))


def test_dev_signup_still_logs_in_but_records_and_emails_a_verification_token(db, client):
    r = signup(client, "v1@example.com")
    assert r.status_code == 201 and r.json()["user"]["email_verified"] is False
    assert client.get("/v1/me").json()["user"]["email_verified"] is False
    tok = _token("v1@example.com")
    (row,) = db.execute(select(EmailVerificationToken)).scalars().all()
    assert row.token_hash != tok and tok not in row.token_hash and len(row.token_hash) == 64 and row.used_at is None
    assert row.expires_at - clock.now() <= timedelta(hours=get_settings().email_verification_ttl_hours)
    msg = db.execute(select(EmailMessage).where(EmailMessage.purpose == "email_verification")).scalar_one()
    assert msg.status == "sent" and tok not in msg.body_text  # the token is kept out of the stored body
    assert get_mail().sent_to("v1@example.com")[0].body_text.count(get_settings().app_base_url + "/verify-email?token=") == 1
    assert db.execute(text("select count(*) from email_verification_tokens where token_hash = :t"), {"t": tok}).scalar_one() == 0


def test_verify_marks_the_email_verified_signs_in_and_is_single_use(db, client, make_client):
    signup(client, "v2@example.com")
    tok = _token("v2@example.com")
    other = make_client()
    r = other.post("/v1/auth/verify-email", json={"token": tok})
    assert r.status_code == 200, r.text
    assert r.json()["user"]["email_verified"] is True and r.json()["user"]["email"] == "v2@example.com"
    assert other.get("/v1/me").status_code == 200  # a session came with it
    assert db.execute(select(User).where(User.email == "v2@example.com")).scalar_one().email_verified_at is not None
    again = make_client().post("/v1/auth/verify-email", json={"token": tok})
    assert again.status_code == 409 and again.json()["error"]["code"] == "invalid_token"
    assert make_client().post("/v1/auth/verify-email", json={"token": "x" * 43}).json()["error"]["code"] == "invalid_token"
    short = make_client().post("/v1/auth/verify-email", json={"token": "short"})  # malformed: the same uniform answer
    assert short.status_code == 409 and short.json()["error"]["code"] == "invalid_token"


def test_expired_token_is_refused(db, client, make_client):
    signup(client, "v3@example.com")
    tok = _token("v3@example.com")
    clock.set_now(clock.now() + timedelta(hours=get_settings().email_verification_ttl_hours + 1))
    r = make_client().post("/v1/auth/verify-email", json={"token": tok})
    assert r.status_code == 409 and r.json()["error"]["code"] == "invalid_token"
    assert db.execute(select(User).where(User.email == "v3@example.com")).scalar_one().email_verified_at is None


def test_deactivated_user_cannot_redeem(db, client, make_client):
    signup(client, "v4@example.com")
    tok = _token("v4@example.com")
    db.execute(select(User).where(User.email == "v4@example.com")).scalar_one().is_active = False
    db.commit()
    assert make_client().post("/v1/auth/verify-email", json={"token": tok}).status_code == 409


def test_resend_is_uniform_replaces_the_old_token_and_only_mails_unverified_accounts(db, client, make_client):
    seed_all(db)
    signup(client, "v5@example.com")
    first = _token("v5@example.com")
    c = make_client()
    answers = [c.post("/v1/auth/verify-email/resend", json={"email": e}) for e in ("v5@example.com", "nobody@example.com", "admin@example.com")]
    assert [(a.status_code, a.json()) for a in answers] == [(202, {"status": "check_your_email"})] * 3
    assert len(get_mail().sent_to("v5@example.com")) == 2 and get_mail().sent_to("nobody@example.com") == []
    assert get_mail().sent_to("admin@example.com") == []  # the seeded admin is already verified
    second = _token("v5@example.com")
    assert second != first
    assert c.post("/v1/auth/verify-email", json={"token": first}).status_code == 409  # superseded
    assert c.post("/v1/auth/verify-email", json={"token": second}).status_code == 200
    assert c.post("/v1/auth/verify-email/resend", json={"email": "v5@example.com"}).status_code == 202
    assert len(get_mail().sent_to("v5@example.com")) == 2  # now verified: nothing more is sent


def test_resend_is_rate_limited_per_email_and_per_address(db, client, make_client):
    signup(client, "v6@example.com")
    codes = [make_client().post("/v1/auth/verify-email/resend", json={"email": "v6@example.com"}).status_code for _ in range(4)]
    assert codes == [202, 202, 202, 429]
    assert ratelimit.LIMITS["verify_email_resend_ip"][0] <= 10


def test_verify_endpoint_is_rate_limited(db, make_client, monkeypatch):
    monkeypatch.setitem(ratelimit.LIMITS, "verify_email_ip", (2, 600))
    c = make_client()
    codes = [c.post("/v1/auth/verify-email", json={"token": "y" * 43}).status_code for _ in range(3)]
    assert codes == [409, 409, 429]


def test_outside_dev_signup_issues_no_session_and_login_waits_for_verification(db, make_client, monkeypatch):
    seed_all(db)
    _non_dev(monkeypatch)
    a = make_client()
    r = signup(a, "v7@example.com")
    assert r.status_code == 202 and r.json() == {"status": "check_your_email"} and a.get("/v1/me").status_code == 401
    tok = _token("v7@example.com")  # the mail went out even though no session did
    b = make_client()
    refused = login(b, "v7@example.com")
    assert refused.status_code == 403 and refused.json()["error"]["code"] == "email_not_verified"
    assert b.get("/v1/me").status_code == 401
    # a wrong password is still the same 401 as ever: verification state is not revealed to someone without the password
    wrong = b.post("/v1/auth/login", json={"email": "v7@example.com", "password": "not-the-password-1"})
    assert wrong.status_code == 401 and wrong.json()["error"]["code"] == "invalid_credentials"
    ok = b.post("/v1/auth/verify-email", json={"token": tok})
    assert ok.status_code == 200 and ok.json()["user"]["email_verified"] is True and b.get("/v1/me").status_code == 200
    assert login(make_client(), "v7@example.com").status_code == 200
    # verified admins (seed) are unaffected
    assert login(make_client(), "admin@example.com").status_code == 200


def test_outside_dev_existing_email_still_gets_the_identical_answer(db, make_client, monkeypatch):
    _non_dev(monkeypatch)
    new = signup(make_client(), "v8@example.com")
    existing = signup(make_client(), "v8@example.com")
    assert (new.status_code, new.json()) == (existing.status_code, existing.json()) == (202, {"status": "check_your_email"})
    assert len(db.execute(select(EmailVerificationToken)).scalars().all()) == 1  # the existing email got an account notice instead


def test_a_suppressed_address_changes_nothing_in_the_answer(db, client, make_client):
    from exjet_api.services import suppression

    suppression.suppress(db, "v9@example.com", "manual", "test")
    db.commit()
    r = signup(client, "v9@example.com")
    assert r.status_code == 201  # the mail is blocked by the suppression list, the signup answer does not change
    assert get_mail().sent_to("v9@example.com") == []
    assert db.execute(select(EmailMessage).where(EmailMessage.purpose == "email_verification", EmailMessage.status == "blocked")).scalar_one()


def test_verification_mail_is_only_authorized_for_an_unverified_active_user(db, client):
    from exjet_api import mailer
    from exjet_api.guardrails import GuardrailViolation

    signup(client, "v10@example.com")
    u = db.execute(select(User).where(User.email == "v10@example.com")).scalar_one()
    u.email_verified_at = clock.now()
    db.commit()
    import pytest

    with pytest.raises(GuardrailViolation):
        mailer.send(db, purpose="email_verification", to=["v10@example.com"], subject="s", body="b")
    with pytest.raises(GuardrailViolation):
        mailer.send(db, purpose="email_verification", to=["stranger@example.com"], subject="s", body="b")
    assert PASSWORD
