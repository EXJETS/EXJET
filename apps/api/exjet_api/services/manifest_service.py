"""Manifest storage, validation and submission."""
from __future__ import annotations

import uuid
from datetime import date, timedelta

from exjet_product.flight_watch import next_watch_at
from exjet_product.manifest import PassengerInput, validate_manifest
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import clock
from .. import schemas as S
from ..audit import audit
from ..errors import ApiError, conflict
from ..jobs import enqueue
from ..models import Passenger, Trip, TripStatus
from .trips import required_pax_id_type

EDITABLE = {TripStatus.manifest_due.value, TripStatus.scheduled.value}


def manifest_out(db: Session, trip: Trip) -> S.ManifestOut:
    m = trip.manifest
    if m is None:
        raise conflict("manifest_not_available", "A manifest is available once payment is marked.")
    pax = db.execute(select(Passenger).where(Passenger.trip_id == trip.id).order_by(Passenger.created_at)).scalars().all()
    return S.ManifestOut(
        due_at=m.due_at, submitted_at=m.submitted_at, sent_to_operator_at=m.sent_to_operator_at, required_id_type=required_pax_id_type(trip),
        expected_passengers=trip.passengers,
        passengers=[S.PassengerOut(id=p.id, full_name=p.full_name, date_of_birth=p.date_of_birth, id_type=p.id_type,
                                   id_number_last4=p.id_number[-4:], id_expiry=p.id_expiry, id_issuer=p.id_issuer,
                                   weight_lbs=p.weight_lbs) for p in pax],
    )


def _inputs(rows: list[S.PassengerIn]) -> list[PassengerInput]:
    return [PassengerInput(p.full_name, p.date_of_birth.isoformat(), p.id_type, p.id_number or "", p.id_expiry, p.id_issuer, p.weight_lbs)
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


def put_manifest(db: Session, trip: Trip, body: S.ManifestPut, actor: str = "system") -> None:
    """Upsert by passenger id. An item with an existing `id` updates that passenger and, when `id_number` is omitted, keeps
    the stored number (full numbers are never returned, so the client cannot resend them). An item without `id` is created
    (`id_number` required). Passengers missing from the list are deleted.

    Editing a manifest that was already submitted (trip `scheduled`, before the first departure) reopens it: the trip returns
    to `manifest_due`, `submitted_at` clears, and every operator link issued for the earlier submission is revoked. The member
    submits again, which issues new links."""
    if trip.status not in EDITABLE or trip.manifest is None:
        raise conflict("invalid_state", "The manifest can only be edited while it is due or before departure once submitted.")
    reopening = trip.status == TripStatus.scheduled.value
    if reopening and trip.legs[0].depart_at <= clock.now():
        raise conflict("invalid_state", "This trip has already departed.")
    stored = {p.id: p for p in db.execute(select(Passenger).where(Passenger.trip_id == trip.id)).scalars()}
    seen: set[uuid.UUID] = set()
    effective: list[S.PassengerIn] = []
    for item in body.passengers:
        if item.id is not None:
            if item.id not in stored:
                raise ApiError(422, "unknown_passenger", "A passenger id in the list does not belong to this trip.")
            if item.id in seen:
                raise ApiError(422, "duplicate_passenger_id", "A passenger id appears more than once.")
            seen.add(item.id)
        number = item.id_number if item.id_number is not None else (stored[item.id].id_number if item.id is not None else None)
        effective.append(S.PassengerIn.model_construct(**{**item.model_dump(), "id_number": number}))
    errors = _check(trip, effective, require_count=False)
    if errors:
        _raise(errors)
    base = clock.now()
    for i, (item, eff) in enumerate(zip(body.passengers, effective, strict=True)):
        fields = dict(full_name=eff.full_name, date_of_birth=eff.date_of_birth.isoformat(), id_type=eff.id_type,
                      id_number=eff.id_number, id_expiry=eff.id_expiry, id_issuer=eff.id_issuer, weight_lbs=eff.weight_lbs)
        created = base + timedelta(microseconds=i)  # the response lists passengers in the order they were sent
        if item.id is not None:
            row = stored[item.id]
            for k, v in fields.items():
                setattr(row, k, v)
            row.created_at = created
        else:
            db.add(Passenger(created_at=created, trip_id=trip.id, **fields))
    for pid, row in stored.items():
        if pid not in seen:
            db.delete(row)
    if reopening:
        from .manifest_links import revoke_links

        n = revoke_links(db, trip.manifest, actor=actor, reason="manifest_changed")
        trip.status = TripStatus.manifest_due.value
        trip.manifest.submitted_at = None
        trip.manifest.sent_to_operator_at = None
        audit(db, actor=actor, action="manifest.reopened", subject_type="trip", subject_id=trip.id, detail={"links_revoked": n})
    db.flush()


def submit_manifest(db: Session, trip: Trip, actor_user_id: uuid.UUID | None = None) -> None:
    if trip.status != TripStatus.manifest_due.value or trip.manifest is None:
        raise conflict("invalid_state", "The manifest is not due for this trip.")
    pax = db.execute(select(Passenger).where(Passenger.trip_id == trip.id)).scalars().all()
    rows = [S.PassengerIn.model_construct(full_name=p.full_name, date_of_birth=date.fromisoformat(p.date_of_birth),
                                          id_type=p.id_type, id_number=p.id_number, id_expiry=p.id_expiry, id_issuer=p.id_issuer or "",
                                          weight_lbs=p.weight_lbs) for p in pax]
    errors = _check(trip, rows, require_count=True)
    if errors:
        _raise(errors)
    from .manifest_links import revoke_links

    now = clock.now()
    revoke_links(db, trip.manifest, actor=f"user:{actor_user_id}" if actor_user_id else "system", reason="resubmitted")
    trip.manifest.submitted_at = now
    trip.manifest.sent_to_operator_at = None
    trip.status = TripStatus.scheduled.value
    first, last = trip.legs[0].depart_at, trip.legs[-1].depart_at
    nxt = next_watch_at(now, first, last, trip.status)
    if nxt:
        enqueue(db, "flight.watch", {"trip_id": str(trip.id)}, run_at=nxt, dedupe_key=f"flight.watch:{trip.id}:{int(nxt.timestamp())}")
    # The operator gets a secure link, never the passengers' details by email. Ids only in the payload.
    enqueue(db, "manifest.deliver", {"trip_id": str(trip.id), "actor_user_id": str(actor_user_id) if actor_user_id else None},
            dedupe_key=f"manifest.deliver:{trip.id}:{int(now.timestamp() * 1_000_000)}")
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
