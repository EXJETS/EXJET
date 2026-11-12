"""RFQ creation and dispatch."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from exjet_product.rfq import GroundRfqContext, RfqContext, RfqLeg, build_ground_rfq_email, build_rfq_email, generate_reference
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import mailer
from ..audit import record_agent_action
from ..entitlements import is_entitled
from ..errors import conflict, not_found, unprocessable
from ..guardrails import GuardrailViolation
from ..jobs import enqueue
from ..models import Account, Aircraft, Airport, EmptyLeg, Fbo, Rfq, RfqKind, RfqStatus, Trip, TripStatus, User
from ..supply import operator_sellable, sellable_aircraft
from .trips import feasible_tails

OPEN_FOR_RFQ = {TripStatus.draft.value, TripStatus.rfq_sent.value, TripStatus.quoted.value}


def _new_reference(db: Session) -> str:
    for _ in range(10):
        ref = generate_reference()
        if db.execute(select(Rfq.id).where(Rfq.reference == ref)).first() is None:
            return ref
    raise RuntimeError("could not allocate an RFQ reference")


def create_charter_rfqs(db: Session, trip: Trip, listing_ids: list[uuid.UUID], empty_leg_id: uuid.UUID | None) -> list[Rfq]:
    if trip.status not in OPEN_FOR_RFQ:
        raise conflict("invalid_state", "RFQs can only be sent before a quote is accepted.")
    feasible = {a.id: a for a in feasible_tails(db, trip)}
    live = {a.id for a in sellable_aircraft(db, ids=listing_ids)}
    leg = None
    if empty_leg_id:
        leg = db.get(EmptyLeg, empty_leg_id)
        if leg is None or leg.aircraft_id not in listing_ids:
            raise not_found("Empty leg not found.")
    out: list[Rfq] = []
    for lid in dict.fromkeys(listing_ids):
        ac: Aircraft | None = feasible.get(lid)
        if ac is None:
            if lid in live:
                raise unprocessable("listing_not_feasible", "A selected aircraft cannot fly this trip.")
            raise not_found("Listing not found.")
        if not operator_sellable(ac.operator):  # defense in depth
            raise not_found("Listing not found.")
        kind = RfqKind.empty_leg.value if leg is not None and leg.aircraft_id == lid else RfqKind.charter.value
        existing = db.execute(select(Rfq).where(Rfq.trip_id == trip.id, Rfq.aircraft_id == ac.id, Rfq.kind == kind)).scalar_one_or_none()
        if existing is not None:
            out.append(existing)
            continue
        recipients = [c.email for c in ac.operator.contacts if c.receives_rfq]
        rfq = Rfq(trip_id=trip.id, kind=kind, aircraft_id=ac.id, operator_id=ac.operator_id, reference=_new_reference(db),
                  empty_leg_id=leg.id if kind == RfqKind.empty_leg.value else None, recipients=recipients,
                  status=RfqStatus.queued.value)
        db.add(rfq)
        db.flush()
        enqueue(db, "rfq.dispatch", {"rfq_id": str(rfq.id)}, dedupe_key=f"rfq.dispatch:{rfq.id}")
        out.append(rfq)
    return out


def create_ground_rfq(db: Session, trip: Trip, kind: str, leg_sequence: int, fbo_id: uuid.UUID, details: str | None) -> Rfq:
    if trip.status not in OPEN_FOR_RFQ | {TripStatus.contracted.value, TripStatus.paid.value, TripStatus.manifest_due.value, TripStatus.scheduled.value}:
        raise conflict("invalid_state", "This trip can no longer take ground requests.")
    if not any(leg.sequence == leg_sequence for leg in trip.legs):
        raise unprocessable("invalid_leg", "Unknown leg.")
    fbo = db.get(Fbo, fbo_id)
    if fbo is None:
        raise not_found("FBO not found.")
    if not fbo.email:
        raise conflict("fbo_no_email", "This FBO has no email on file, so a request cannot be sent.")
    rfq = Rfq(trip_id=trip.id, kind=kind, fbo_id=fbo.id, reference=_new_reference(db), recipients=[fbo.email],
              status=RfqStatus.queued.value)
    db.add(rfq)
    db.flush()
    enqueue(db, "rfq.dispatch", {"rfq_id": str(rfq.id), "leg_sequence": leg_sequence, "details": details or ""},
            dedupe_key=f"rfq.dispatch:{rfq.id}")
    return rfq


def _airports(db: Session, codes: set[str]) -> dict[str, Airport]:
    return {a.icao: a for a in db.execute(select(Airport).where(Airport.icao.in_(codes))).scalars()}


def _fail(db: Session, rfq: Rfq, trip: Trip, reason: str, status: str = "blocked") -> None:
    rfq.status = RfqStatus.failed.value
    record_agent_action(db, agent="rfq_dispatcher", event="rfq.dispatch", input={"rfq_id": str(rfq.id)},
                        output={"reason": reason}, status=status, permission_level="EXECUTE", account_id=trip.account_id)
    db.commit()


def dispatch_rfq(db: Session, rfq_id: uuid.UUID, leg_sequence: int | None = None, details: str | None = None) -> None:
    """Send one RFQ through mailer.send(). Re-checks every guardrail at send time."""
    rfq = db.get(Rfq, rfq_id)
    if rfq is None or rfq.status != RfqStatus.queued.value:
        return
    trip = db.get(Trip, rfq.trip_id)
    if trip.status == TripStatus.cancelled.value:
        rfq.status = RfqStatus.expired.value
        db.commit()
        return
    account = db.get(Account, trip.account_id)
    if not is_entitled(account, account.subscription):
        return _fail(db, rfq, trip, "member_not_entitled")
    if not rfq.recipients:
        return _fail(db, rfq, trip, "no_recipients", status="failed")
    member = db.get(User, trip.created_by)
    airports = _airports(db, {c for leg in trip.legs for c in (leg.origin_icao, leg.destination_icao)})
    name = member.full_name or account.display_name

    if rfq.kind in (RfqKind.rental_car.value, RfqKind.chauffeur.value):
        leg = next((x for x in trip.legs if x.sequence == (leg_sequence or 0)), trip.legs[0])
        fbo = db.get(Fbo, rfq.fbo_id)
        ap = airports[leg.destination_icao]
        subject, body = build_ground_rfq_email(GroundRfqContext(
            reference=rfq.reference, kind=rfq.kind, airport_icao=ap.icao, airport_name=ap.name, when=leg.depart_at,
            timezone=ap.timezone, fbo_name=fbo.name, member_name=name, details=details))
    else:
        ac = db.get(Aircraft, rfq.aircraft_id)
        legs = tuple(RfqLeg(l.origin_icao, airports[l.origin_icao].name, l.destination_icao, airports[l.destination_icao].name,
                            l.depart_at, airports[l.origin_icao].timezone) for l in trip.legs)
        window = None
        if rfq.empty_leg_id:
            el = db.get(EmptyLeg, rfq.empty_leg_id)
            window = (el.available_from, el.available_to) if el else None
        subject, body = build_rfq_email(RfqContext(
            reference=rfq.reference, legs=legs, passengers=trip.passengers, checked_bags=trip.checked_bags,
            carry_on_bags=trip.carry_on_bags, golf_bags=trip.golf_bags, ski_bags=trip.ski_bags, member_name=name,
            aircraft_type=f"{ac.type.manufacturer} {ac.type.model}", empty_leg_window=window, notes=trip.notes))
    try:
        msg = mailer.send(db, purpose="rfq", to=list(rfq.recipients), subject=subject, body=body, rfq=rfq,
                          actor_user_id=trip.created_by)
    except GuardrailViolation as v:
        db.rollback()
        rfq = db.get(Rfq, rfq_id)
        trip = db.get(Trip, rfq.trip_id)
        return _fail(db, rfq, trip, v.code)
    rfq.status = RfqStatus.sent.value
    rfq.sent_at = datetime.now(timezone.utc)
    rfq.thread_id = msg.thread_id
    if trip.status == TripStatus.draft.value:
        trip.status = TripStatus.rfq_sent.value
    record_agent_action(db, agent="rfq_dispatcher", event="rfq.dispatch", input={"rfq_id": str(rfq.id)},
                        output={"email_message_id": str(msg.id)}, permission_level="EXECUTE", account_id=trip.account_id)
    db.commit()


def expire_stale(db: Session, now: datetime, rfq_ttl_hours: int = 72) -> int:
    """Expire sent RFQs with no reply after the TTL, and quotes past valid_until."""
    from datetime import timedelta

    from ..models import Quote, QuoteStatus

    n = 0
    for r in db.execute(select(Rfq).where(Rfq.status == RfqStatus.sent.value, Rfq.sent_at < now - timedelta(hours=rfq_ttl_hours))).scalars():
        r.status = RfqStatus.expired.value
        n += 1
    for q in db.execute(select(Quote).where(Quote.status == QuoteStatus.ready.value, Quote.valid_until.is_not(None), Quote.valid_until < now)).scalars():
        q.status = QuoteStatus.expired.value
        n += 1
    return n


__all__ = ["create_charter_rfqs", "create_ground_rfq", "dispatch_rfq", "expire_stale", "IntegrityError"]
