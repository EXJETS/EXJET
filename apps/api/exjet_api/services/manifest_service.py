"""Manifest storage, validation and submission."""
from __future__ import annotations

import uuid
from datetime import date, timedelta

from exjet_product.flight_watch import next_watch_at
from exjet_product.manifest import PassengerInput, validate_manifest
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import clock, schemas as S
from ..errors import ApiError, conflict
from ..jobs import enqueue
from ..models import Manifest, Passenger, Trip, TripStatus
from .trips import required_pax_id_type

EDITABLE = {TripStatus.manifest_due.value}


def manifest_out(db: Session, trip: Trip) -> S.ManifestOut:
    m = trip.manifest
    if m is None:
        raise conflict("manifest_not_available", "A manifest is available once payment is marked.")
    pax = db.execute(select(Passenger).where(Passenger.trip_id == trip.id).order_by(Passenger.created_at)).scalars().all()
    return S.ManifestOut(
        due_at=m.due_at, submitted_at=m.submitted_at, required_id_type=required_pax_id_type(trip),
        expected_passengers=trip.passengers,
        passengers=[S.PassengerOut(full_name=p.full_name, date_of_birth=p.date_of_birth, id_type=p.id_type,
                                   id_number_last4=p.id_number[-4:], id_expiry=p.id_expiry, id_issuer=p.id_issuer,
                                   weight_lbs=p.weight_lbs) for p in pax],
    )


def _inputs(rows: list[S.PassengerIn]) -> list[PassengerInput]:
    return [PassengerInput(p.full_name, p.date_of_birth.isoformat(), p.id_type, p.id_number, p.id_expiry, p.id_issuer, p.weight_lbs)
            for p in rows]


def _check(trip: Trip, rows: list[S.PassengerIn], *, require_count: bool) -> dict[int, list[str]]:
    errors = validate_manifest(_inputs(rows), len(rows) if not require_count else trip.passengers,
                               required_pax_id_type(trip), trip.legs[-1].depart_at.date(), clock.now().date())
    if not require_count:
        errors.pop(-1, None)
        if len(rows) > trip.passengers:
            errors[-1] = ["too_many_passengers"]
    return errors


def _raise(errors: dict[int, list[str]]) -> None:
    detail = "; ".join(f"{'manifest' if i < 0 else f'passenger {i + 1}'}: {', '.join(c)}" for i, c in sorted(errors.items()))
    raise ApiError(422, "manifest_invalid", f"Manifest has problems: {detail}")


def put_manifest(db: Session, trip: Trip, body: S.ManifestPut) -> None:
    if trip.status not in EDITABLE or trip.manifest is None:
        raise conflict("invalid_state", "The manifest can only be edited while it is due.")
    errors = _check(trip, body.passengers, require_count=False)
    if errors:
        _raise(errors)
    for p in db.execute(select(Passenger).where(Passenger.trip_id == trip.id)).scalars():
        db.delete(p)
    db.flush()
    base = clock.now()
    for i, p in enumerate(body.passengers):
        db.add(Passenger(created_at=base + timedelta(microseconds=i), trip_id=trip.id, full_name=p.full_name, date_of_birth=p.date_of_birth.isoformat(), id_type=p.id_type,
                         id_number=p.id_number, id_expiry=p.id_expiry, id_issuer=p.id_issuer, weight_lbs=p.weight_lbs))
    db.flush()


def submit_manifest(db: Session, trip: Trip) -> None:
    if trip.status != TripStatus.manifest_due.value or trip.manifest is None:
        raise conflict("invalid_state", "The manifest is not due for this trip.")
    pax = db.execute(select(Passenger).where(Passenger.trip_id == trip.id)).scalars().all()
    rows = [S.PassengerIn.model_construct(full_name=p.full_name, date_of_birth=date.fromisoformat(p.date_of_birth),
                                          id_type=p.id_type, id_number=p.id_number, id_expiry=p.id_expiry, id_issuer=p.id_issuer or "",
                                          weight_lbs=p.weight_lbs) for p in pax]
    errors = _check(trip, rows, require_count=True)
    if errors:
        _raise(errors)
    trip.manifest.submitted_at = clock.now()
    trip.status = TripStatus.scheduled.value
    first, last = trip.legs[0].depart_at, trip.legs[-1].depart_at
    nxt = next_watch_at(clock.now(), first, last, trip.status)
    if nxt:
        enqueue(db, "flight.watch", {"trip_id": str(trip.id)}, run_at=nxt, dedupe_key=f"flight.watch:{trip.id}:{int(nxt.timestamp())}")
    db.flush()


def send_reminder(db: Session, trip_id: uuid.UUID) -> None:
    from sqlalchemy import select as sel

    from .. import mailer
    from ..audit import record_agent_action
    from ..config import get_settings
    from ..guardrails import GuardrailViolation
    from ..models import AccountMember, User

    trip = db.get(Trip, trip_id)
    if trip is None or trip.status != TripStatus.manifest_due.value or trip.manifest is None or trip.manifest.submitted_at:
        return
    emails = db.execute(sel(User.email).join(AccountMember, AccountMember.user_id == User.id)
                        .where(AccountMember.account_id == trip.account_id)).scalars().all()
    try:
        mailer.send(db, purpose="lifecycle", to=list(emails), account_id=trip.account_id,
                    subject="Your passenger manifest is due",
                    body=f"Your passenger manifest is due by {trip.manifest.due_at:%Y-%m-%d %H:%M} UTC, 24 hours before departure. "
                         f"Complete it here: {get_settings().app_base_url}/trips/{trip.id}\n\nEXJET")
    except GuardrailViolation:
        return
    trip.manifest.reminder_sent_at = clock.now()
    record_agent_action(db, agent="manifest_reminder", event="manifest.remind", input={"trip_id": str(trip.id)},
                        permission_level="EXECUTE", account_id=trip.account_id)
