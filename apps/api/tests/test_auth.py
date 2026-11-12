from helpers import PASSWORD, login, signup


def test_signup_login_me_logout_flow(client):
    r = signup(client, "a@example.com")
    assert r.status_code == 201
    me = r.json()
    assert me["entitled"] is False and me["next_step"] == "kyc" and me["subscription"] is None
    assert me["account"]["type"] == "individual" and me["account"]["seats"] == 1 and me["user"]["role"] == "member"
    cookie = client.cookies.get("exjet_session")
    assert cookie
    assert client.get("/v1/me").json()["user"]["email"] == "a@example.com"
    assert client.post("/v1/auth/logout").status_code == 204
    assert client.get("/v1/me").status_code == 401
    other = login(client, "a@example.com")
    assert other.status_code == 200 and other.json()["user"]["email"] == "a@example.com"


def test_session_cookie_flags(client):
    r = signup(client, "flags@example.com")
    sc = r.headers["set-cookie"].lower()
    assert "httponly" in sc and "samesite=lax" in sc and "path=/" in sc


def test_family_office_has_two_seats(client):
    assert signup(client, "fo@example.com", account_type="family_office").json()["account"]["seats"] == 2


def test_enterprise_cannot_self_signup(client):
    r = client.post("/v1/auth/signup", json={"email": "e@example.com", "password": PASSWORD, "full_name": "E", "account_type": "enterprise"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "validation_error"


def test_duplicate_email_and_bad_credentials(client):
    signup(client, "dup@example.com")
    r = signup(client, "DUP@example.com")
    # L3: no 409 email_taken (it enumerated accounts). The existing-email case is a uniform 202.
    assert r.status_code == 202 and r.json() == {"status": "check_your_email"}
    bad = client.post("/v1/auth/login", json={"email": "dup@example.com", "password": "wrong-password-1"})
    assert bad.status_code == 401 and bad.json()["error"]["code"] == "invalid_credentials"
    nouser = client.post("/v1/auth/login", json={"email": "nobody@example.com", "password": PASSWORD})
    assert nouser.status_code == 401 and nouser.json()["error"] == bad.json()["error"]  # no account enumeration


def test_password_hash_is_argon2id(client, db):
    from sqlalchemy import select

    from exjet_api.models import User

    signup(client, "h@example.com")
    assert db.execute(select(User.password_hash)).scalar_one().startswith("$argon2id$")


def test_pii_is_encrypted_at_rest(client, db):
    from sqlalchemy import text

    signup(client, "pii@example.com", name="Unique Secret Name")
    raw = db.execute(text("select full_name from users")).scalar_one()
    assert "Unique Secret Name" not in raw and raw.startswith("gAAAA")


def test_csrf_header_required_on_state_changes(app):
    from fastapi.testclient import TestClient

    c = TestClient(app)  # no X-Requested-With
    r = c.post("/v1/auth/login", json={"email": "a@example.com", "password": PASSWORD})
    assert r.status_code == 403 and r.json()["error"]["code"] == "csrf_failed"
    assert c.get("/v1/billing/plans").status_code == 200  # safe methods do not need it


def test_error_envelope_and_no_value_echo(client):
    r = client.post("/v1/auth/signup", json={"email": "x@example.com", "password": "short", "full_name": "N", "account_type": "individual"})
    assert r.status_code == 422
    body = r.json()
    assert set(body) == {"error"} and set(body["error"]) == {"code", "message"}
    assert "short" not in body["error"]["message"]
    assert client.get("/v1/nope").json()["error"]["code"] == "not_found"
    assert client.get("/v1/me").json()["error"]["code"] == "unauthenticated"


def test_login_rate_limited(client):
    for _ in range(10):
        client.post("/v1/auth/login", json={"email": "rl@example.com", "password": "wrong-password-1"})
    r = client.post("/v1/auth/login", json={"email": "rl@example.com", "password": "wrong-password-1"})
    assert r.status_code == 429 and r.json()["error"]["code"] == "rate_limited"


def test_deactivated_user_loses_access(client, db):
    from sqlalchemy import select

    from exjet_api.models import User

    signup(client, "gone@example.com")
    assert client.get("/v1/me").status_code == 200
    u = db.execute(select(User).where(User.email == "gone@example.com")).scalar_one()
    u.is_active = False
    db.commit()
    assert client.get("/v1/me").status_code == 401


def test_tampered_cookie_rejected(client):
    signup(client, "t@example.com")
    good = client.cookies.get("exjet_session")
    client.cookies.clear()
    client.cookies.set("exjet_session", good[:-6] + ("AAAAAA" if not good.endswith("AAAAAA") else "BBBBBB"))
    assert client.get("/v1/me").status_code == 401


def test_cors_from_settings(client):
    r = client.options("/v1/me", headers={"Origin": "http://localhost:3001", "Access-Control-Request-Method": "GET"})
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3001"
    assert r.headers.get("access-control-allow-credentials") == "true"
    bad = client.options("/v1/me", headers={"Origin": "http://evil.example", "Access-Control-Request-Method": "GET"})
    assert "access-control-allow-origin" not in bad.headers
