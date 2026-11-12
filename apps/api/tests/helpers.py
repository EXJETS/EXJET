"""Shared test helpers. Everything here is synthetic."""
from __future__ import annotations

import base64
import io
import uuid
from datetime import datetime, timedelta, timezone

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy import select

from exjet_api import jobs
from exjet_api.models import (
    Account,
    AccountMember,
    Aircraft,
    Approval,
    KycSubmission,
    Operator,
    OperatorContact,
    Subscription,
    User,
)
from exjet_api.security import hash_password
from exjet_api.seed_dev import ensure_admin, make_operator_live, seed_reference, seed_synthetic

PASSWORD = "correct-horse-battery-1"
PNG = b"\x89PNG\r\n\x1a\n" + b"synthetic-test-image" * 4


def pdf_bytes(lines: list[str], links: list[tuple[str, str]] | None = None) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    y = 740
    for line in lines:
        c.drawString(60, y, line)
        y -= 18
    for text, url in links or []:
        c.drawString(60, y, text)
        c.linkURL(url, (60, y - 2, 60 + 6 * len(text), y + 12))
        y -= 18
    c.showPage()
    c.save()
    return buf.getvalue()


def quote_pdf(total: str = "$45,200.00", extra: list[str] | None = None) -> bytes:
    return pdf_bytes([
        "SYNTHETIC Test Operator Quote", "Charter Quotation", "Quote No: Q-TEST-0001", "Valid until: December 31, 2099",
        "Aircraft charter ........ $41,000.00", "Fuel and handling ........ $4,200.00", "Subtotal: $45,200.00",
        f"Total Charter Cost: {total}", *(extra or []),
    ], links=[("Pay online", "https://pay.example.com/checkout/synthetic-123")])


def contract_pdf(name: str = "Pat Member") -> bytes:
    return pdf_bytes(["AIRCRAFT CHARTER AGREEMENT", "This agreement is made between the parties below.",
                      "Terms and Conditions apply. Governing law: Texas.", f"Charterer: {name}", "Signature: ____"])


def b64(data: bytes) -> str:
    return base64.b64encode(data).decode()


def seed_all(db, admin_email: str = "admin@example.com") -> tuple[User, dict[str, Operator]]:
    seed_reference(db)
    admin = ensure_admin(db, admin_email, PASSWORD)
    ops = seed_synthetic(db, admin)
    db.commit()
    return admin, ops


def signup(client, email: str, name: str = "Pat Member", account_type: str = "individual"):
    return client.post("/v1/auth/signup", json={"email": email, "password": PASSWORD, "full_name": name, "account_type": account_type})


def login(client, email: str):
    return client.post("/v1/auth/login", json={"email": email, "password": PASSWORD})


def make_entitled(db, client, admin: User, email: str = "member@example.com", name: str = "Pat Member") -> Account:
    """Signs up through the API, then grants KYC approval the legitimate way (approval row, then status)
    and an active subscription."""
    r = signup(client, email, name)
    assert r.status_code == 201, r.text
    acct = db.get(Account, uuid.UUID(r.json()["account"]["id"]))
    user = db.execute(select(User).where(User.email == email)).scalar_one()
    sub = KycSubmission(account_id=acct.id, submitted_by=user.id, kind="individual", holder_name=name, status="approved")
    db.add(sub)
    db.flush()
    db.add(Approval(kind="kyc_final", subject_type="kyc_submission", subject_id=str(sub.id), requested_by="system",
                    status="approved", decided_by=admin.id, decided_at=datetime.now(timezone.utc), summary="test"))
    db.flush()
    acct.kyc_status = "approved"
    db.add(Subscription(account_id=acct.id, plan="individual", status="active", provider="fake", unit_amount_cents=75000,
                        current_period_end=datetime.now(timezone.utc) + timedelta(days=30)))
    db.commit()
    return acct


def make_operator(db, admin: User, name: str, *, live: bool = True, excluded: bool = False, email: str | None = None,
                  tail: str | None = None, type_slug: str = "cessna-citation-xls-plus", seats: int = 8, home: str = "KTEB") -> Operator:
    from exjet_api.models import AircraftType

    op = Operator(dba_name=name, legal_name=f"{name} LLC", certificate_number=f"T-{uuid.uuid4().hex[:8]}", is_excluded=excluded)
    db.add(op)
    db.flush()
    db.add(OperatorContact(operator_id=op.id, name="Test Contact", email=email or f"{uuid.uuid4().hex[:8]}@example.com", receives_rfq=True))
    t = db.execute(select(AircraftType).where(AircraftType.slug == type_slug)).scalar_one()
    db.add(Aircraft(tail_number=tail or f"N{uuid.uuid4().hex[:5].upper()}", operator_id=op.id, type_id=t.id, passenger_seats=seats,
                    home_airport_icao=home, amenities=[], photos=[], is_active=True))
    db.flush()
    if live:
        make_operator_live(db, op, admin)
    db.commit()
    return op


def run_jobs() -> int:
    return jobs.run_pending()


def future_trip_body(origin="KTEB", dest="KMDW", pax=4, days=10, hour=14) -> dict:
    dep = (datetime.now(timezone.utc) + timedelta(days=days)).replace(hour=hour, minute=0, second=0, microsecond=0)
    return {"legs": [{"origin_icao": origin, "destination_icao": dest, "depart_at": dep.isoformat()}], "passengers": pax,
            "checked_bags": 2}


def to_quote_stage(db, member, adm, *, email="pat@example.com", name="Pat Member", op_key="A", tail="N00TST1",
                   attachments=None, days: int = 10, pax: int = 4):
    """Entitled member + trip + RFQ to one tail + operator reply processed. Returns a dict of ids."""
    from exjet_api.providers import get_mail  # noqa: F401

    admin, ops = seed_all(db)
    from exjet_api.models import Operator  # noqa: F401

    acct = make_entitled(db, member, admin, email, name)
    login(adm, "admin@example.com")
    trip = member.post("/v1/trips", json=future_trip_body(days=days, pax=pax)).json()
    tid = trip["id"]
    listings = member.get(f"/v1/trips/{tid}/listings").json()
    lid = next(item["listing_id"] for item in listings if item["tail_number"] == tail)
    rfq = member.post(f"/v1/trips/{tid}/rfqs", json={"listing_ids": [lid]}).json()[0]
    run_jobs()
    ref = rfq["reference"]
    contact = {"A": "ops-a@example.com", "C": "ops-c@example.com"}[op_key]
    atts = attachments if attachments is not None else [
        {"filename": "quote.pdf", "content_base64": b64(quote_pdf())},
        {"filename": "agreement.pdf", "content_base64": b64(contract_pdf(name))}]
    inbound(adm, contact, f"Re: [{ref}] Charter request", "Attached.", atts)
    return {"admin": admin, "account": acct, "trip_id": tid, "listing_id": lid, "rfq": rfq, "ref": ref, "ops": ops}


def inbound(adm, sender: str, subject: str, body: str, attachments: list[dict] | None = None):
    r = adm.post("/v1/dev/inbound-email", json={"from_address": sender, "subject": subject, "body": body,
                                                "attachments": attachments or []})
    assert r.status_code == 202, r.text
    run_jobs()


FORBIDDEN_MEMBER_DATA = ("Test Operator", "N00TST", "ops-a@", "ops-b@", "ops-c@", "ops-x@", "Charter Desk", "SYNTH-")


def assert_no_member_data(text: str) -> None:
    for needle in FORBIDDEN_MEMBER_DATA:
        assert needle not in text, f"member-only data leaked: {needle!r}"
