"""H3: quotes@ as a phishing relay. Members get dedupe, daily caps, defanged and capped free text, and the KYC-verified
name in outbound RFQs."""
import pytest
from exjet_product import rfq as R
from helpers import future_trip_body, make_entitled, run_jobs, seed_all
from sqlalchemy import select

from exjet_api.config import get_settings
from exjet_api.models import Airport, Fbo, Job, Rfq
from exjet_api.providers import get_mail

PHISH = "Please wire payment via https://evil-pay.test/invoice or mail billing@evil-pay.test, also www.evil-pay.test/x"


def _member(db, client, make_client, name="Pat Member"):
    admin, _ = seed_all(db)
    make_entitled(db, client, admin, "m@example.com", name)
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    ap = db.execute(select(Airport).where(Airport.icao == "KMDW")).scalar_one()
    fbos = []
    for i in range(3):
        f = Fbo(airport_id=ap.id, name=f"SYNTHETIC FBO {i}", email=f"fbo{i}@example.com")
        db.add(f)
        fbos.append(f)
    db.commit()
    return tid, fbos


def _ground(client, tid, fbo, kind="chauffeur", leg=0, details="3 pax"):
    return client.post(f"/v1/trips/{tid}/ground-rfqs", json={"kind": kind, "leg_sequence": leg, "fbo_id": str(fbo.id), "details": details})


def test_one_ground_rfq_per_trip_fbo_kind_and_leg(db, client, make_client):
    tid, fbos = _member(db, client, make_client)
    assert _ground(client, tid, fbos[0]).status_code == 201
    dup = _ground(client, tid, fbos[0])
    assert dup.status_code == 409 and dup.json()["error"]["code"] == "duplicate_ground_rfq"
    assert _ground(client, tid, fbos[0], kind="rental_car").status_code == 201  # different kind is a different request
    assert _ground(client, tid, fbos[1]).status_code == 201  # different FBO
    assert len(db.execute(select(Rfq).where(Rfq.fbo_id == fbos[0].id)).scalars().all()) == 2


def test_database_enforces_the_ground_rfq_uniqueness_too(db, client, make_client):
    from sqlalchemy.exc import IntegrityError

    tid, fbos = _member(db, client, make_client)
    _ground(client, tid, fbos[0])
    first = db.execute(select(Rfq).where(Rfq.fbo_id == fbos[0].id)).scalar_one()
    db.add(Rfq(trip_id=first.trip_id, kind=first.kind, fbo_id=first.fbo_id, leg_sequence=first.leg_sequence,
               reference="EXJ-ABCDEF", recipients=["x@example.com"]))
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_daily_cap_on_ground_rfqs_returns_429(db, client, make_client, monkeypatch):
    monkeypatch.setenv("EXJET_GROUND_RFQ_DAILY_CAP", "2")
    get_settings.cache_clear()
    tid, fbos = _member(db, client, make_client)
    assert [_ground(client, tid, f).status_code for f in fbos[:2]] == [201, 201]
    r = _ground(client, tid, fbos[2])
    assert r.status_code == 429 and r.json()["error"]["code"] == "ground_rfq_daily_cap_reached"


def test_daily_cap_on_charter_rfqs_returns_429(db, client, make_client, monkeypatch):
    monkeypatch.setenv("EXJET_RFQ_DAILY_CAP", "1")
    get_settings.cache_clear()
    tid, _ = _member(db, client, make_client)
    listings = client.get(f"/v1/trips/{tid}/listings").json()
    assert len(listings) >= 2
    assert client.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [listings[0]["listing_id"]]}).status_code == 201
    r = client.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [listings[1]["listing_id"]]})
    assert r.status_code == 429 and r.json()["error"]["code"] == "rfq_daily_cap_reached"


def test_default_caps_are_set_and_sensible():
    s = get_settings()
    assert 1 <= s.rfq_daily_cap <= 100 and 1 <= s.ground_rfq_daily_cap <= 50


# --------------------------------------------------------------------------- free text
def test_member_text_is_defanged_capped_and_labelled_in_outbound_mail(db, client, make_client):
    tid, fbos = _member(db, client, make_client)
    assert _ground(client, tid, fbos[0], details=PHISH + " " + "x" * 300).status_code == 201
    run_jobs()
    (msg, _), = get_mail().outbox
    body = msg.body_text
    assert "evil-pay" not in body and "http" not in body.split("Member-provided")[1] and "billing@" not in body
    assert "[link removed]" in body and "[email removed]" in body
    assert "written by the member, not by EXJET" in body
    line = next(x for x in body.splitlines() if x.startswith("Member-provided details"))
    assert len(line.split("): ", 1)[1]) <= 500


def test_charter_notes_are_defanged_too(db, client, make_client):
    tid, _ = _member(db, client, make_client)
    client.patch(f"/v1/trips/{tid}", json={"notes": PHISH + " " + "y" * 1500})
    lid = client.get(f"/v1/trips/{tid}/listings").json()[0]["listing_id"]
    client.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]})
    run_jobs()
    (msg, _), = get_mail().outbox
    assert "evil-pay" not in msg.body_text and "Member-provided note" in msg.body_text
    line = next(x for x in msg.body_text.splitlines() if x.startswith("Member-provided note"))
    assert len(line.split("): ", 1)[1]) <= 500  # capped at 500 however long the stored note is


@pytest.mark.parametrize("raw,expected_absent", [
    ("see https://a.test/x?y=1", "a.test"), ("go to WWW.Evil.COM/pay", "evil.com"), ("mail me@evil.test", "evil.test"),
    ("evil[.]com/pay", "evil"), ("hxxps://evil.test", "evil"), ("click evil.test/a", "evil.test"),
])
def test_defang_removes_links_and_addresses(raw, expected_absent):
    assert expected_absent.lower() not in R.clean_free_text(raw).lower()


def test_free_text_cap_is_500():
    assert R.MAX_FREE_TEXT == 500 and len(R.clean_free_text("word " * 400)) == 500


def test_ground_details_longer_than_500_are_refused_at_the_api(db, client, make_client):
    tid, fbos = _member(db, client, make_client)
    assert _ground(client, tid, fbos[0], details="x" * 501).status_code == 422


# --------------------------------------------------------------------------- verified name
def test_outbound_rfq_uses_the_kyc_verified_name_not_the_self_chosen_one(db, client, make_client):
    from exjet_api.models import User

    admin, _ = seed_all(db)
    make_entitled(db, client, admin, "m@example.com", "Verified Person")  # the approved KYC holder name
    u = db.execute(select(User).where(User.email == "m@example.com")).scalar_one()
    u.full_name = "CEO urgent wire https://evil.test"  # the member rewrites their own display name afterwards
    db.commit()
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    lid = client.get(f"/v1/trips/{tid}/listings").json()[0]["listing_id"]
    client.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]})
    run_jobs()
    (msg, _), = get_mail().outbox
    assert "Verified Person" in msg.body_text and "evil" not in msg.body_text and "urgent" not in msg.body_text


def test_dispatch_is_refused_when_no_verified_identity_exists(db, client, make_client):
    from exjet_api.models import AgentAction, KycSubmission

    admin, _ = seed_all(db)
    make_entitled(db, client, admin, "m@example.com", "Verified Person")
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    lid = client.get(f"/v1/trips/{tid}/listings").json()[0]["listing_id"]
    client.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]})
    for k in db.execute(select(KycSubmission)).scalars():
        k.holder_name = " "
    db.commit()
    run_jobs()
    assert get_mail().outbox == []
    assert db.execute(select(AgentAction).where(AgentAction.event == "rfq.dispatch")).scalar_one().output["reason"] == "no_verified_identity"
    assert db.execute(select(Job).where(Job.kind == "rfq.dispatch")).scalar_one().status == "done"
