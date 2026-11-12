"""M3: sessions can be revoked (logout, password change/reset, deactivation); password reset flow."""
import re
import uuid
from datetime import timedelta

import jwt
from helpers import PASSWORD, login, seed_all, signup
from sqlalchemy import select

from exjet_api import clock
from exjet_api.models import EmailMessage, PasswordResetToken, User
from exjet_api.providers import get_mail
from exjet_api.security import _DEV_JWT_SECRET, create_session_token

NEW_PW = "an-entirely-new-passphrase-9"


def _two_sessions(make_client, email="u@example.com"):
    a, b = make_client(), make_client()
    signup(a, email)
    assert login(b, email).status_code == 200
    assert a.get("/v1/me").status_code == 200 and b.get("/v1/me").status_code == 200
    return a, b


def test_logout_revokes_every_session_of_the_user(db, make_client):
    a, b = _two_sessions(make_client)
    stolen = a.cookies.get("exjet_session")
    assert a.post("/v1/auth/logout").status_code == 204
    assert b.get("/v1/me").status_code == 401  # the other browser is logged out too
    replay = make_client()
    replay.cookies.set("exjet_session", stolen)
    assert replay.get("/v1/me").status_code == 401  # a copied cookie is dead
    assert db.execute(select(User.session_version)).scalar_one() == 1


def test_tokens_without_a_session_version_are_rejected(db, make_client):
    c = make_client()
    signup(c, "u@example.com")
    uid = db.execute(select(User.id)).scalar_one()
    old_shape = jwt.encode({"sub": str(uid), "exp": clock.now() + timedelta(hours=1)}, _DEV_JWT_SECRET, algorithm="HS256")
    other = make_client()
    other.cookies.set("exjet_session", old_shape)
    assert other.get("/v1/me").status_code == 401
    wrong_version = make_client()
    wrong_version.cookies.set("exjet_session", create_session_token(uid, 7))
    assert wrong_version.get("/v1/me").status_code == 401


def test_password_change_requires_the_current_password_and_revokes_other_sessions(db, make_client):
    a, b = _two_sessions(make_client)
    assert a.post("/v1/auth/password", json={"current_password": "wrong-password-1", "new_password": NEW_PW}).status_code == 403
    assert b.get("/v1/me").status_code == 200
    assert a.post("/v1/auth/password", json={"current_password": PASSWORD, "new_password": NEW_PW}).status_code == 204
    assert b.get("/v1/me").status_code == 401  # revoked
    assert a.get("/v1/me").status_code == 200  # the changing session keeps working (fresh cookie)
    fresh = make_client()
    assert fresh.post("/v1/auth/login", json={"email": "u@example.com", "password": PASSWORD}).status_code == 401
    assert fresh.post("/v1/auth/login", json={"email": "u@example.com", "password": NEW_PW}).status_code == 200
    assert a.post("/v1/auth/password", json={"current_password": NEW_PW, "new_password": "short"}).status_code == 422


def test_password_change_needs_a_session(make_client):
    assert make_client().post("/v1/auth/password", json={"current_password": PASSWORD, "new_password": NEW_PW}).status_code == 401


# --------------------------------------------------------------------------- reset flow
def _request_reset(client, email):
    return client.post("/v1/auth/password/reset-request", json={"email": email})


def _token_from_mail(email):
    msgs = get_mail().sent_to(email)
    assert msgs
    return re.search(r"token=([\w-]+)", msgs[-1].body_text).group(1)


def test_reset_request_answer_is_uniform_and_only_known_emails_get_mail(db, make_client):
    c = make_client()
    signup(c, "known@example.com")
    known, unknown = _request_reset(make_client(), "known@example.com"), _request_reset(make_client(), "nobody@example.com")
    assert (known.status_code, known.json()) == (unknown.status_code, unknown.json()) == (202, {"status": "check_your_email"})
    assert len(get_mail().outbox) == 1 and get_mail().sent_to("nobody@example.com") == []
    assert len(db.execute(select(PasswordResetToken)).scalars().all()) == 1


def test_reset_token_is_single_use_expiring_and_stored_hashed(db, make_client):
    a, b = _two_sessions(make_client)
    _request_reset(make_client(), "u@example.com")
    token = _token_from_mail("u@example.com")
    row = db.execute(select(PasswordResetToken)).scalar_one()
    assert row.token_hash != token and token not in row.token_hash
    stored = db.execute(select(EmailMessage).where(EmailMessage.purpose == "password_reset")).scalar_one()
    assert token not in (stored.body_text or "")
    fresh = make_client()
    assert fresh.post("/v1/auth/password/reset", json={"token": "z" * 43, "new_password": NEW_PW}).status_code == 409
    assert fresh.post("/v1/auth/password/reset", json={"token": token, "new_password": NEW_PW}).status_code == 204
    assert fresh.post("/v1/auth/password/reset", json={"token": token, "new_password": NEW_PW + "x"}).status_code == 409  # used
    assert a.get("/v1/me").status_code == 401 and b.get("/v1/me").status_code == 401  # all sessions revoked
    assert login(fresh, "u@example.com").status_code == 401  # login() uses the old password
    assert fresh.post("/v1/auth/login", json={"email": "u@example.com", "password": NEW_PW}).status_code == 200


def test_expired_reset_token_is_refused(db, make_client):
    signup(make_client(), "u@example.com")
    _request_reset(make_client(), "u@example.com")
    token = _token_from_mail("u@example.com")
    clock.set_now(clock.now() + timedelta(minutes=31))
    assert make_client().post("/v1/auth/password/reset", json={"token": token, "new_password": NEW_PW}).json()["error"]["code"] == "invalid_token"


def test_a_new_request_does_not_leave_older_tokens_usable_after_a_reset(db, make_client):
    signup(make_client(), "u@example.com")
    _request_reset(make_client(), "u@example.com")
    t1 = _token_from_mail("u@example.com")
    _request_reset(make_client(), "u@example.com")
    t2 = _token_from_mail("u@example.com")
    assert t1 != t2
    c = make_client()
    assert c.post("/v1/auth/password/reset", json={"token": t2, "new_password": NEW_PW}).status_code == 204
    assert c.post("/v1/auth/password/reset", json={"token": t1, "new_password": NEW_PW + "y"}).status_code == 409


def test_deactivation_revokes_sessions_and_blocks_login(db, make_client):
    seed_all(db)
    victim = make_client()
    signup(victim, "u@example.com")
    adm = make_client()
    login(adm, "admin@example.com")
    uid = db.execute(select(User.id).where(User.email == "u@example.com")).scalar_one()
    assert adm.post(f"/v1/admin/users/{uid}/deactivate").status_code == 204
    assert victim.get("/v1/me").status_code == 401
    assert login(make_client(), "u@example.com").status_code == 401
    assert adm.post(f"/v1/admin/users/{uuid.uuid4()}/deactivate").status_code == 404
    me = adm.get("/v1/me").json()["user"]["id"]
    assert adm.post(f"/v1/admin/users/{me}/deactivate").status_code == 409  # not yourself
    assert victim.post(f"/v1/admin/users/{uid}/deactivate").status_code == 401
