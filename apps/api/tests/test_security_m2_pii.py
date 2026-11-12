"""M2: PII is encrypted at rest. Raw SQL reads (what a database dump would expose) must show ciphertext."""
import os
from datetime import date
from pathlib import Path

from helpers import PNG, future_trip_body, make_entitled, run_jobs, seed_all, signup
from sqlalchemy import select, text

from exjet_api.models import Airport, Fbo, Job, Passenger, Trip
from exjet_api.providers import get_storage

FERNET = "gAAAA"


def raw(db, sql: str, **p):
    return db.execute(text(sql), p).scalars().all()


def test_account_display_name_is_encrypted(db, client):
    signup(client, "p@example.com", "Distinctive Personname")
    assert client.get("/v1/me").json()["account"]["display_name"] == "Distinctive Personname"  # the API still decrypts
    (v,) = raw(db, "select display_name from accounts")
    assert v.startswith(FERNET) and "Distinctive" not in v


def test_trip_text_is_encrypted(db, client):
    seed_all(db)
    signup(client, "p@example.com")
    body = {**future_trip_body(), "raw_request": "Fly Mr Whitmore to the ranch, keep it quiet", "notes": "gate code 4471 for the hangar"}
    tid = client.post("/v1/trips", json=body).json()["id"]
    (rr,) = raw(db, "select raw_request from trips")
    (nt,) = raw(db, "select notes from trips")
    assert rr.startswith(FERNET) and nt.startswith(FERNET) and "Whitmore" not in rr and "4471" not in nt
    assert client.get(f"/v1/trips/{tid}").json()["notes"] == "gate code 4471 for the hangar"


def test_email_bodies_are_encrypted_inbound_and_outbound(db, client, make_client):
    from helpers import inbound, to_quote_stage

    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] x", "confidential-inbound-marker")
    bodies = raw(db, "select body_text from email_messages where body_text is not null")
    assert bodies and all(b.startswith(FERNET) for b in bodies)
    assert not any("confidential-inbound-marker" in b or "Charter" in b for b in bodies)


def test_passenger_id_issuer_is_encrypted(db, client):
    seed_all(db)
    signup(client, "p@example.com")
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    db.add(Passenger(trip_id=db.get(Trip, tid).id, full_name="A B", date_of_birth="1980-01-01", id_type="passport", id_number="X123",
                     id_expiry=date(2099, 1, 1), id_issuer="United Kingdom"))
    db.commit()
    (v,) = raw(db, "select id_issuer from passengers")
    assert v.startswith(FERNET) and "Kingdom" not in v
    assert db.execute(select(Passenger.id_issuer)).scalar_one() == "United Kingdom"


def test_jobs_payload_carries_ids_only_and_ground_details_live_in_an_encrypted_column(db, client, make_client):
    admin, _ = seed_all(db)
    make_entitled(db, client, admin, "m@example.com")
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    ap = db.execute(select(Airport).where(Airport.icao == "KMDW")).scalar_one()
    fbo = Fbo(airport_id=ap.id, name="SYNTHETIC FBO", email="fbo@example.com")
    db.add(fbo)
    db.commit()
    secret = "Mrs Ashcroft needs the wheelchair van, door code 9921"
    r = client.post(f"/v1/trips/{tid}/ground-rfqs", json={"kind": "chauffeur", "leg_sequence": 0, "fbo_id": str(fbo.id), "details": secret})
    assert r.status_code == 201
    (job,) = db.execute(select(Job).where(Job.kind == "rfq.dispatch")).scalars().all()
    assert set(job.payload) == {"rfq_id"} and "Ashcroft" not in str(job.payload)
    (d,) = raw(db, "select details from rfqs")
    assert d.startswith(FERNET) and "Ashcroft" not in d
    run_jobs()
    from exjet_api.providers import get_mail

    (msg, _), = get_mail().outbox
    assert "Ashcroft" in msg.body_text  # the dispatcher loaded the details from the encrypted column at run time


def test_audit_log_never_holds_free_text(db, client):
    seed_all(db)
    signup(client, "p@example.com")
    client.post("/v1/billing/enterprise-inquiry", json={"company": "Acme Secret Corp", "seats": 5, "notes": "merger rumor", "contact_name": "Zed Zeta", "contact_email": "zed@example.com", "contact_phone": "+1 555 010 9999"})
    for (detail,) in db.execute(text("select detail from audit_log")).all():
        assert "Acme" not in str(detail) and "merger" not in str(detail)


def test_local_storage_encrypts_file_bytes_with_random_keys(db, client):
    seed_all(db)
    signup(client, "p@example.com")
    client.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "P", "doc_types": ["passport"]},
                files=[("files", ("my-passport-scan.png", PNG, "image/png"))])
    (key,) = raw(db, "select storage_key from documents")
    on_disk = Path(get_storage().root, key).read_bytes()
    assert on_disk != PNG and PNG[8:] not in on_disk and on_disk.startswith(FERNET.encode())
    assert get_storage().get(key) == PNG  # transparent round trip
    assert "passport" not in key and "png" not in key.lower()
    files = [f for _, _, fs in os.walk(get_storage().root) for f in fs]
    assert all("passport" not in f for f in files)
