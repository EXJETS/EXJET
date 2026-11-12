"""Manifest delivery to the operator by secure link: no passenger PII in the email, per-recipient hashed expiring
revocable tokens, audit per access, revocation on change, admin revoke."""
import re
import uuid
from datetime import timedelta

from helpers import login, run_jobs, to_manifest_due
from helpers import manifest_pax as pax
from sqlalchemy import select

from exjet_api import clock, ratelimit
from exjet_api.config import get_settings
from exjet_api.models import AuditLog, EmailMessage, Job, Manifest, ManifestAccessLink, Rfq, Trip
from exjet_api.providers import get_mail
from exjet_api.services import manifest_links

PII = ("Passenger 1", "Passenger 2", "D123456", "1980", "Pat Member", "NJ driver")


def _submit(member, tid, n=4):
    url = f"/v1/trips/{tid}/manifest"
    assert member.put(url, json={"passengers": [pax(i) for i in range(1, n + 1)]}).status_code == 200
    r = member.post(f"{url}/submit")
    assert r.status_code == 200, r.text
    return r


def _manifest_mails(addr="ops-a@example.com"):
    return [m for m in get_mail().sent_to(addr) if "manifest" in m.subject.lower()]


def _token(msg) -> str:
    return re.search(r"/operator/manifest\?token=([\w-]+)", msg.body_text).group(1)


def _stage(db, client, make_client):
    adm = make_client()
    s = to_manifest_due(db, client, adm)
    return adm, s


def test_submit_queues_an_ids_only_job_and_emails_a_link_with_no_passenger_details(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    (job,) = db.execute(select(Job).where(Job.kind == "manifest.deliver")).scalars().all()
    assert set(job.payload) == {"trip_id", "actor_user_id"} and "Passenger" not in str(job.payload)
    before = len(get_mail().outbox)
    run_jobs()
    (msg,) = _manifest_mails()
    assert len(get_mail().outbox) == before + 1
    body = msg.body_text
    assert s["ref"] in msg.subject and s["ref"] in body and "KTEB-KMDW" in body and "KTEB" in body
    assert re.search(r"Departure: \d{4}-\d{2}-\d{2} \d{2}:00 local time at KTEB \(America/New_York\)", body)
    assert f"{get_settings().app_base_url}/operator/manifest?token=" in body
    for needle in PII:
        assert needle not in body and needle not in msg.subject
    row = db.execute(select(EmailMessage).where(EmailMessage.purpose == "manifest")).scalar_one()
    assert row.status == "sent" and _token(msg) not in row.body_text
    link = db.execute(select(ManifestAccessLink)).scalar_one()
    assert link.token_hash != _token(msg) and len(link.token_hash) == 64 and link.recipient == "ops-a@example.com"
    assert link.sent_at is not None and link.expires_at - link.sent_at == timedelta(hours=72)
    db.expire_all()
    assert db.execute(select(Manifest)).scalar_one().sent_to_operator_at is not None


def test_the_link_returns_the_manifest_and_every_access_is_audited(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    run_jobs()
    tok = _token(_manifest_mails()[0])
    anon = make_client()  # no session, no cookies
    r = anon.get("/v1/operator/manifest", params={"token": tok})
    assert r.status_code == 200, r.text
    out = r.json()
    assert out["trip_reference"] == s["ref"] and out["expected_passengers"] == 4 and len(out["passengers"]) == 4
    p1 = out["passengers"][0]
    assert p1 == {"full_name": "Passenger 1", "date_of_birth": "1980-05-05", "id_type": "real_id", "id_number": "D1234561",
                  "id_expiry": "2099-01-01", "id_issuer": "NJ", "weight_lbs": None}
    assert out["legs"][0]["origin_icao"] == "KTEB" and re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:00:00", out["legs"][0]["depart_local"])
    assert out["legs"][0]["origin_timezone"] == "America/New_York" and out["expires_at"] and out["submitted_at"]
    assert r.headers["cache-control"] == "no-store" and "noindex" in r.headers["x-robots-tag"]
    assert "Pat Member" not in r.text and "pat@example.com" not in r.text  # the member's own details are not part of it
    anon.get("/v1/operator/manifest", params={"token": tok})
    rows = db.execute(select(AuditLog).where(AuditLog.action == "manifest.link_accessed")).scalars().all()
    assert len(rows) == 2
    link = db.execute(select(ManifestAccessLink)).scalar_one()
    assert rows[0].detail["token_id"] == str(link.id) and rows[0].detail["ip"] and rows[0].detail["at"] and rows[0].at
    assert rows[0].subject_type == "manifest" and tok not in str(rows[0].detail)
    db.expire_all()
    assert db.get(ManifestAccessLink, link.id).view_count == 2


def test_bad_tokens_get_the_same_404_whatever_their_shape(db, client, make_client):
    anon = make_client()
    r = anon.get("/v1/operator/manifest", params={"token": "z" * 43})
    assert r.status_code == 404 and r.json()["error"]["code"] == "invalid_link"
    for bad in ({"token": "short"}, {"token": ""}, {}, {"token": "x" * 5000}):  # malformed or missing: same uniform answer
        r = anon.get("/v1/operator/manifest", params=bad)
        assert r.status_code == 404 and r.json()["error"]["code"] == "invalid_link", bad


def test_link_expires_after_the_ttl(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    run_jobs()
    tok = _token(_manifest_mails()[0])
    anon = make_client()
    clock.set_now(clock.now() + timedelta(hours=71))
    assert anon.get("/v1/operator/manifest", params={"token": tok}).status_code == 200
    clock.set_now(clock.now() + timedelta(hours=2))
    r = anon.get("/v1/operator/manifest", params={"token": tok})
    assert r.status_code == 404 and r.json()["error"]["code"] == "invalid_link"
    denied = db.execute(select(AuditLog).where(AuditLog.action == "manifest.link_denied")).scalar_one()
    assert denied.detail["reason"] == "expired" and denied.detail["ip"]


def test_view_cap_is_configurable(db, client, make_client, monkeypatch):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    run_jobs()
    tok = _token(_manifest_mails()[0])
    cur = get_settings()
    monkeypatch.setattr(manifest_links, "get_settings", lambda: cur.model_copy(update={"manifest_link_max_views": 1}))
    anon = make_client()
    assert anon.get("/v1/operator/manifest", params={"token": tok}).status_code == 200
    assert anon.get("/v1/operator/manifest", params={"token": tok}).status_code == 404


def test_each_recipient_gets_their_own_token(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    rfq = db.execute(select(Rfq)).scalars().first()
    rfq.recipients = ["ops-a@example.com", "second.desk@example.com"]
    db.commit()
    _submit(client, s["trip_id"])
    run_jobs()
    ta, tb = _token(_manifest_mails("ops-a@example.com")[0]), _token(_manifest_mails("second.desk@example.com")[0])
    assert ta != tb
    # both are addressed only to their own recipient
    assert all(m.to == ["ops-a@example.com"] for m in _manifest_mails("ops-a@example.com"))
    anon = make_client()
    assert anon.get("/v1/operator/manifest", params={"token": ta}).status_code == 200
    assert anon.get("/v1/operator/manifest", params={"token": tb}).status_code == 200
    a, b = db.execute(select(ManifestAccessLink).order_by(ManifestAccessLink.recipient)).scalars().all()
    assert (a.recipient, b.recipient) == ("ops-a@example.com", "second.desk@example.com") and a.view_count == b.view_count == 1


def test_admin_can_revoke_every_link_for_a_trip(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    run_jobs()
    tok = _token(_manifest_mails()[0])
    login(adm, "admin@example.com")
    url = f"/v1/admin/trips/{s['trip_id']}/manifest/revoke-links"
    assert client.post(url).status_code == 403  # a member cannot
    assert make_client().post(url).status_code == 401
    assert adm.post("/v1/admin/trips/00000000-0000-0000-0000-000000000000/manifest/revoke-links").status_code == 404
    r = adm.post(url)
    assert r.status_code == 200 and r.json() == {"revoked": 1}
    assert adm.post(url).json() == {"revoked": 0}
    anon = make_client()
    assert anon.get("/v1/operator/manifest", params={"token": tok}).status_code == 404
    assert db.execute(select(AuditLog).where(AuditLog.action == "manifest.links_revoked")).scalar_one().detail["reason"] == "admin"
    assert db.execute(select(AuditLog).where(AuditLog.action == "manifest.link_denied")).scalar_one().detail["reason"] == "revoked"


def test_editing_a_submitted_manifest_reopens_it_and_resubmission_issues_new_links(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    tid = s["trip_id"]
    _submit(client, tid)
    run_jobs()
    old = _token(_manifest_mails()[0])
    anon = make_client()
    assert anon.get("/v1/operator/manifest", params={"token": old}).status_code == 200

    ps = client.get(f"/v1/trips/{tid}/manifest").json()["passengers"]
    edit = [{**{k: v for k, v in pax(i + 1).items() if k != "id_number"}, "id": p["id"]} for i, p in enumerate(ps)]
    edit[0]["full_name"] = "Passenger One Corrected"
    r = client.put(f"/v1/trips/{tid}/manifest", json={"passengers": edit})
    assert r.status_code == 200 and r.json()["submitted_at"] is None
    trip = client.get(f"/v1/trips/{tid}").json()
    assert trip["status"] == "manifest_due" and trip["manifest"]["submitted_at"] is None
    assert anon.get("/v1/operator/manifest", params={"token": old}).status_code == 404  # revoked at once
    db.expire_all()
    assert db.execute(select(Manifest)).scalar_one().sent_to_operator_at is None

    assert client.post(f"/v1/trips/{tid}/manifest/submit").status_code == 200
    run_jobs()
    mails = _manifest_mails()
    assert len(mails) == 2
    new = _token(mails[1])
    assert new != old
    assert anon.get("/v1/operator/manifest", params={"token": old}).status_code == 404
    out = anon.get("/v1/operator/manifest", params={"token": new}).json()
    assert out["passengers"][0]["full_name"] == "Passenger One Corrected" and out["passengers"][0]["id_number"] == "D1234561"
    reasons = [a.detail["reason"] for a in db.execute(select(AuditLog).where(AuditLog.action == "manifest.links_revoked")).scalars()]
    assert reasons == ["manifest_changed"]


def test_a_manifest_cannot_be_reopened_after_departure_or_on_finished_trips(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    tid = s["trip_id"]
    _submit(client, tid)
    run_jobs()
    trip = db.get(Trip, uuid.UUID(tid))
    clock.set_now(trip.legs[0].depart_at + timedelta(minutes=5))
    assert client.put(f"/v1/trips/{tid}/manifest", json={"passengers": []}).status_code == 409
    clock.set_now(None)
    trip.status = "completed"
    db.commit()
    assert client.put(f"/v1/trips/{tid}/manifest", json={"passengers": []}).status_code == 409


def test_cancelled_trip_links_stop_working(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    run_jobs()
    tok = _token(_manifest_mails()[0])
    assert client.post(f"/v1/trips/{s['trip_id']}/cancel").status_code == 200
    assert make_client().get("/v1/operator/manifest", params={"token": tok}).status_code == 404


def test_a_suppressed_operator_contact_gets_nothing_and_the_job_fails_visibly(db, client, make_client):
    from exjet_api.services import suppression

    adm, s = _stage(db, client, make_client)
    suppression.suppress(db, "ops-a@example.com", "unsubscribe", "test")
    db.commit()
    _submit(client, s["trip_id"])
    run_jobs()
    assert _manifest_mails() == []
    assert db.execute(select(ManifestAccessLink).where(ManifestAccessLink.revoked_at.is_(None))).scalars().all() == []
    job = db.execute(select(Job).where(Job.kind == "manifest.deliver")).scalar_one()
    assert job.status == "failed" and "NonRetryable" in (job.last_error or "")
    assert db.execute(select(EmailMessage).where(EmailMessage.purpose == "manifest", EmailMessage.status == "blocked")).first()
    db.expire_all()
    assert db.execute(select(Manifest)).scalar_one().sent_to_operator_at is None


def test_a_provider_failure_retries_without_leaving_a_dead_link(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    get_mail().fail_next_send = True
    run_jobs()
    assert _manifest_mails() == []
    job = db.execute(select(Job).where(Job.kind == "manifest.deliver")).scalar_one()
    assert job.status == "queued" and job.attempts == 1
    clock.set_now(clock.now() + timedelta(minutes=10))
    run_jobs()
    (msg,) = _manifest_mails()
    assert make_client().get("/v1/operator/manifest", params={"token": _token(msg)}).status_code == 200
    db.expire_all()
    assert db.execute(select(Job).where(Job.kind == "manifest.deliver")).scalar_one().status == "done"


def test_delivery_is_idempotent_for_a_recipient_that_already_holds_a_sent_link(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    tid = s["trip_id"]
    _submit(client, tid)
    run_jobs()
    from exjet_api.db import session_factory

    with session_factory()() as d2:
        manifest_links.deliver_to_operator(d2, uuid.UUID(tid), None)  # a duplicate delivery of the same submission
        d2.commit()
    assert len(_manifest_mails()) == 1


def test_endpoint_is_rate_limited_per_address_and_per_token(db, client, make_client, monkeypatch):
    anon = make_client()
    monkeypatch.setitem(ratelimit.LIMITS, "operator_manifest_ip", (3, 600))
    codes = [anon.get("/v1/operator/manifest", params={"token": f"{i:02d}" + "q" * 41}).status_code for i in range(5)]
    assert codes == [404, 404, 404, 429, 429]
    monkeypatch.setitem(ratelimit.LIMITS, "operator_manifest_ip", (100, 600))
    monkeypatch.setitem(ratelimit.LIMITS, "operator_manifest_token", (2, 600))
    same = [anon.get("/v1/operator/manifest", params={"token": "w" * 43}).status_code for _ in range(3)]
    assert same == [404, 404, 429]


def test_delivery_without_an_accepted_quote_fails_without_retry(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    _submit(client, s["trip_id"])
    trip = db.get(Trip, uuid.UUID(s["trip_id"]))
    trip.accepted_quote_id = None
    db.commit()
    run_jobs()
    assert _manifest_mails() == []
    assert db.execute(select(Job).where(Job.kind == "manifest.deliver")).scalar_one().status == "failed"


def test_a_members_cookie_grants_nothing_here(db, client, make_client):
    """The token is the only credential."""
    adm, s = _stage(db, client, make_client)
    assert client.get("/v1/operator/manifest", params={"token": "n" * 43}).status_code == 404
