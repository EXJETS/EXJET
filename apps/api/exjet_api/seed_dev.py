"""Dev seed: `uv run python -m exjet_api.seed_dev`.

Loads public reference data (airports, aircraft types) plus CLEARLY SYNTHETIC operators, tails, contacts
and empty legs, and creates an admin user from EXJET_SEED_ADMIN_EMAIL / EXJET_SEED_ADMIN_PASSWORD.
Refuses to run outside env dev/test. Idempotent.
"""
from __future__ import annotations

import os
import sys
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import clock, seed_data as D
from .config import get_settings
from .db import session_factory
from .models import (
    Aircraft,
    AircraftType,
    Airport,
    Approval,
    EmptyLeg,
    GoLiveStatus,
    Operator,
    OperatorContact,
    User,
)
from .security import hash_password


def seed_reference(db: Session) -> None:
    have = {a.icao for a in db.execute(select(Airport)).scalars()}
    for icao, iata, name, city, state, lat, lon, elev, rwy, tz in D.AIRPORTS:
        if icao not in have:
            db.add(Airport(icao=icao, iata=iata, faa_lid=iata, name=name, city=city, state=state, country="US", latitude=lat,
                           longitude=lon, elevation_ft=elev, longest_runway_ft=rwy, timezone=tz))
    have_t = {t.slug for t in db.execute(select(AircraftType)).scalars()}
    for slug, mfr, model, cat, pax, rng, spd, rwy, bag, cabin, code in D.AIRCRAFT_TYPES:
        if slug not in have_t:
            L, W, H = cabin if cabin else (None, None, None)
            db.add(AircraftType(slug=slug, manufacturer=mfr, model=model, category=cat, max_passengers=pax, range_nm=rng,
                                cruise_speed_kts=spd, min_runway_ft=rwy, baggage_cuft=bag, cabin_length_ft=L, cabin_width_ft=W,
                                cabin_height_ft=H, icao_type_code=code))
    db.flush()


def ensure_admin(db: Session, email: str, password: str) -> User:
    u = db.execute(select(User).where(User.email == email.lower())).scalar_one_or_none()
    if u is None:
        u = User(email=email.lower(), password_hash=hash_password(password), role="admin", full_name="Dev Admin")
        db.add(u)
        db.flush()
    return u


def make_operator_live(db: Session, op: Operator, admin: User) -> None:
    """Go-live always flows through approval rows, even in the seed."""
    db.add(Approval(kind="operator_go_live", subject_type="operator", subject_id=str(op.id), requested_by="system",
                    status="approved", decided_by=admin.id, decided_at=clock.now(), summary=f"Synthetic go-live: {op.dba_name}"))
    db.flush()
    op.go_live_status = GoLiveStatus.live.value
    db.add(Approval(kind="rfq_dispatch_policy", subject_type="operator", subject_id=str(op.id), requested_by="system",
                    status="approved", decided_by=admin.id, decided_at=clock.now(),
                    summary="Standing RFQ dispatch authorization (synthetic)"))
    db.flush()


def seed_synthetic(db: Session, admin: User) -> dict[str, Operator]:
    types = {t.slug: t for t in db.execute(select(AircraftType)).scalars()}
    ops: dict[str, Operator] = {}
    for key, name, cert, rating, status, excluded, base in D.OPERATORS:
        op = db.execute(select(Operator).where(Operator.certificate_number == cert)).scalar_one_or_none()
        if op is None:
            op = Operator(dba_name=name, legal_name=f"{name} LLC", certificate_number=cert, certificate_type="135",
                          safety_rating=rating, base_airport_icao=base, is_excluded=excluded,
                          go_live_status=GoLiveStatus.draft.value, source_file="synthetic")
            db.add(op)
            db.flush()
            for cname, title, email, phone in D.CONTACTS[key]:
                db.add(OperatorContact(operator_id=op.id, name=cname, title=title, email=email, phone=phone))
            if status == "live":
                make_operator_live(db, op, admin)
        ops[key] = op
    tails: dict[str, Aircraft] = {}
    for tail, opkey, slug, year, refurb, seats, home, amenities in D.AIRCRAFT:
        ac = db.execute(select(Aircraft).where(Aircraft.tail_number == tail)).scalar_one_or_none()
        if ac is None:
            ac = Aircraft(tail_number=tail, operator_id=ops[opkey].id, type_id=types[slug].id, year_of_manufacture=year,
                          year_refurbished=refurb, passenger_seats=seats, home_airport_icao=home, amenities=amenities,
                          photos=[], is_active=True, source_file="synthetic")
            db.add(ac)
            db.flush()
        tails[tail] = ac
    if not db.execute(select(EmptyLeg.id).limit(1)).first():
        now = clock.now()
        for tail, o, d, start, window in D.EMPTY_LEGS:
            db.add(EmptyLeg(aircraft_id=tails[tail].id, origin_icao=o, destination_icao=d, available_from=now + timedelta(days=start),
                            available_to=now + timedelta(days=start + window), source="synthetic"))
    db.flush()
    return ops


def main() -> int:
    s = get_settings()
    if s.env not in ("dev", "test"):
        print(f"Refusing to seed: EXJET_ENV={s.env!r}. Synthetic data is for dev/test only.", file=sys.stderr)
        return 1
    email, password = os.environ.get("EXJET_SEED_ADMIN_EMAIL"), os.environ.get("EXJET_SEED_ADMIN_PASSWORD")
    if not email or not password:
        print("Set EXJET_SEED_ADMIN_EMAIL and EXJET_SEED_ADMIN_PASSWORD (the seed creates the admin and approves synthetic go-lives).", file=sys.stderr)
        return 2
    if len(password) < 10:
        print("EXJET_SEED_ADMIN_PASSWORD must be at least 10 characters.", file=sys.stderr)
        return 2
    with session_factory()() as db:
        seed_reference(db)
        admin = ensure_admin(db, email, password)
        seed_synthetic(db, admin)
        db.commit()
    print("Seeded: airports, aircraft types, SYNTHETIC operators/tails/contacts/empty legs, admin user.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
