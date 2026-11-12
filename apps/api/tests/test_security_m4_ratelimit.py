"""M4: Postgres-backed fixed-window rate limiting, shared across workers, with trusted-proxy aware client addresses."""
import os
import subprocess
import sys
from datetime import timedelta

import pytest
from helpers import PASSWORD, PNG, future_trip_body, make_entitled, make_family_office, seed_all, signup
from sqlalchemy import select, text

from exjet_api import clock, jobs, ratelimit
from exjet_api.config import get_settings
from exjet_api.errors import ApiError
from exjet_api.models import RateLimit


def _limit(monkeypatch, name, n, window=600):
    monkeypatch.setitem(ratelimit.LIMITS, name, (n, window))


def test_the_in_process_limiter_is_gone():
    import exjet_api.security as sec

    assert not hasattr(sec, "auth_limiter") and not hasattr(sec, "RateLimiter")


def test_counters_live_in_postgres_and_are_shared_with_other_processes(db):
    for _ in range(3):
        ratelimit.hit("login_ip", "10.0.0.1")
    assert db.execute(text("select count from rate_limits where key = 'login_ip:10.0.0.1'")).scalar_one() == 3
    code = "from exjet_api import ratelimit; ratelimit.hit('login_ip', '10.0.0.1', limit=4)"
    env = {**os.environ, "EXJET_ENV": "test"}
    subprocess.run([sys.executable, "-c", code], env=env, check=True, capture_output=True)  # another worker process: hit #4
    with pytest.raises(ApiError) as e:
        ratelimit.hit("login_ip", "10.0.0.1", limit=4)  # hit #5, over the limit of 4, counted by the other process too
    assert e.value.status == 429 and e.value.code == "rate_limited"


def test_hits_persist_even_when_the_request_fails(db, client):
    for _ in range(3):
        assert client.post("/v1/auth/login", json={"email": "no@example.com", "password": PASSWORD}).status_code == 401
    db.expire_all()
    assert db.execute(select(RateLimit.count).where(RateLimit.key.like("login_email:%"))).scalar_one() == 3


def test_window_resets_and_cleanup_bounds_the_table(db):
    ratelimit.hit("login_ip", "1.1.1.1", limit=1, window_seconds=60)
    with pytest.raises(ApiError):
        ratelimit.hit("login_ip", "1.1.1.1", limit=1, window_seconds=60)
    clock.set_now(clock.now() + timedelta(seconds=61))
    ratelimit.hit("login_ip", "1.1.1.1", limit=1, window_seconds=60)  # new window
    assert db.execute(select(RateLimit)).scalars().all().__len__() == 2
    clock.set_now(clock.now() + timedelta(hours=3))
    assert ratelimit.cleanup() == 2
    assert db.execute(select(RateLimit)).scalars().all() == []


def test_cleanup_runs_as_a_periodic_job(db):
    from exjet_api import worker

    ratelimit.hit("login_ip", "2.2.2.2")
    clock.set_now(clock.now() + timedelta(hours=5))
    worker.schedule_periodic()
    jobs.run_pending()
    assert db.execute(select(RateLimit)).scalars().all() == []


# --------------------------------------------------------------------------- client address
class _Req:
    def __init__(self, xff=None, host="9.9.9.9"):
        from types import SimpleNamespace

        self.headers = {"x-forwarded-for": xff} if xff else {}
        self.client = SimpleNamespace(host=host)


def test_x_forwarded_for_is_ignored_unless_proxies_are_configured(monkeypatch):
    assert ratelimit.client_ip(_Req("1.2.3.4, 5.6.7.8")) == "9.9.9.9"  # spoofing the header gains nothing
    monkeypatch.setenv("EXJET_TRUSTED_PROXY_HOPS", "1")
    get_settings.cache_clear()
    assert ratelimit.client_ip(_Req("6.6.6.6, 1.2.3.4")) == "1.2.3.4"  # the entry our own proxy appended, not the client's
    monkeypatch.setenv("EXJET_TRUSTED_PROXY_HOPS", "2")
    get_settings.cache_clear()
    assert ratelimit.client_ip(_Req("6.6.6.6, 1.2.3.4, 10.0.0.2")) == "1.2.3.4"
    assert ratelimit.client_ip(_Req("10.0.0.2")) == "9.9.9.9"  # header shorter than the proxy chain: fall back to the peer
    assert ratelimit.client_ip(_Req(None)) == "9.9.9.9"


def test_rotating_a_spoofed_forwarded_header_does_not_evade_the_login_limit(db, client, monkeypatch):
    _limit(monkeypatch, "login_ip", 3)
    codes = [client.post("/v1/auth/login", json={"email": f"u{i}@example.com", "password": PASSWORD},
                         headers={"X-Forwarded-For": f"1.1.1.{i}"}).status_code for i in range(5)]
    assert codes == [401, 401, 401, 429, 429]


# --------------------------------------------------------------------------- routes
def test_login_and_signup_limits(db, client, monkeypatch):
    _limit(monkeypatch, "login_email", 2)
    codes = [client.post("/v1/auth/login", json={"email": "v@example.com", "password": PASSWORD}).status_code for _ in range(4)]
    assert codes == [401, 401, 429, 429]
    _limit(monkeypatch, "signup_ip", 2)
    codes = [client.post("/v1/auth/signup", json={"email": f"s{i}@example.com", "password": PASSWORD, "full_name": "S",
                         "account_type": "individual"}).status_code for i in range(4)]
    assert codes[2:] == [429, 429]


def test_password_reset_limits(db, client, monkeypatch):
    _limit(monkeypatch, "password_reset_email", 2)
    codes = [client.post("/v1/auth/password/reset-request", json={"email": "r@example.com"}).status_code for _ in range(3)]
    assert codes == [202, 202, 429]
    _limit(monkeypatch, "password_reset_ip", 5)  # the three requests above already counted against this address
    codes = [client.post("/v1/auth/password/reset", json={"token": "x" * 43, "new_password": PASSWORD}).status_code for _ in range(3)]
    assert codes == [409, 409, 429]


def test_seat_invite_limit(db, client, monkeypatch):
    admin, _ = seed_all(db)
    make_family_office(db, client, admin)
    _limit(monkeypatch, "seat_invite_user", 2)
    codes = [client.post("/v1/account/seats", json={"email": "a@example.com"}).status_code for _ in range(3)]
    assert codes == [202, 202, 429]


def test_kyc_upload_limit(db, client, monkeypatch):
    seed_all(db)
    signup(client, "k@example.com")
    _limit(monkeypatch, "kyc_upload_user", 2)
    codes = [client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "K", "doc_types": ["passport"]},
                         files=[("files", ("p.png", PNG, "image/png"))]).status_code for _ in range(3)]
    assert codes == [201, 409, 429]  # 409: already in review; the attempt still counts


def test_enterprise_inquiry_limit(db, client, monkeypatch):
    seed_all(db)
    signup(client, "e@example.com")
    _limit(monkeypatch, "enterprise_inquiry_user", 2)
    codes = [client.post("/v1/billing/enterprise-inquiry", json={"company": "C", "seats": 3, "contact_name": "C", "contact_email": "c@example.com"}).status_code for _ in range(3)]
    assert codes == [202, 202, 429]


def test_trip_intake_limit(db, client, monkeypatch):
    seed_all(db)
    signup(client, "t@example.com")
    _limit(monkeypatch, "intake_user", 2)
    codes = [client.post("/v1/trips/intake", json={"text": "Teterboro to Chicago Midway next Friday, 4 people"}).status_code for _ in range(3)]
    assert codes == [200, 200, 429]


def test_rfq_creation_limits(db, client, monkeypatch):
    admin, _ = seed_all(db)
    make_entitled(db, client, admin, "m@example.com")
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    lid = client.get(f"/v1/trips/{tid}/listings").json()[0]["listing_id"]
    _limit(monkeypatch, "rfq_create_user", 2)
    codes = [client.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]}).status_code for _ in range(3)]
    assert codes == [201, 201, 429]
    _limit(monkeypatch, "ground_rfq_create_user", 1)
    from exjet_api.models import Airport, Fbo

    ap = db.execute(select(Airport).where(Airport.icao == "KMDW")).scalar_one()
    f = Fbo(airport_id=ap.id, name="F", email="f@example.com")
    db.add(f)
    db.commit()
    body = {"kind": "chauffeur", "leg_sequence": 0, "fbo_id": str(f.id)}
    assert client.post(f"/v1/trips/{tid}/ground-rfqs", json=body).status_code == 201
    assert client.post(f"/v1/trips/{tid}/ground-rfqs", json=body).status_code == 429
