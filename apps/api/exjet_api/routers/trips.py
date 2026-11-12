from __future__ import annotations

import uuid
from collections import Counter

from exjet_product.intake import parse_trip_request
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import clock
from .. import schemas as S
from ..audit import record_agent_action
from ..deps import get_owned_trip, get_session, require_entitled, require_member
from ..entitlements import Viewer
from ..errors import conflict
from ..models import Rfq, RfqStatus, Trip, TripStatus
from ..providers import get_llm
from ..ratelimit import hit
from ..serializers import Builder
from ..services import intake_llm, rfq_service
from ..services import trips as T
from ..timeutil import to_local_str

router = APIRouter(prefix="/trips", tags=["trips"])
PRE_FLIGHT = {TripStatus.draft.value, TripStatus.rfq_sent.value, TripStatus.quoted.value, TripStatus.contracted.value,
              TripStatus.paid.value, TripStatus.manifest_due.value, TripStatus.scheduled.value}


@router.post("/intake", response_model=S.TripDraftOut)
def intake(body: S.IntakeIn, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    """Parse plain language into a TripDraft. Nothing is saved."""
    hit("intake_user", str(viewer.user.id))
    refs = T.load_airports(db)
    now = clock.now()
    draft = parse_trip_request(body.text, list(refs.values()), now)
    llm = get_llm()
    usage = intake_llm.refine(draft, body.text, refs, llm, now)
    record_agent_action(
        db, agent="intake", event="trip.intake", input={"chars": len(body.text), "llm_used": usage is not None},
        output={"unresolved": draft.unresolved, "confidence": draft.confidence}, permission_level="READ",
        account_id=viewer.account.id, model=llm.model if usage is not None else None,
        input_tokens=(usage or {}).get("input_tokens", 0), output_tokens=(usage or {}).get("output_tokens", 0),
    )
    db.commit()
    unresolved = list(draft.unresolved)

    def draft_leg(i: int, leg) -> S.LegDraftIO:
        origin = refs.get(leg.origin_icao or "")
        tz = origin.timezone if origin else None
        local = to_local_str(leg.depart_at, tz) if leg.depart_at else None
        depart_at = leg.depart_at
        if depart_at is not None and local is None:
            # The parser treated the time as UTC because the airport has no zone on file. That is a guess: do not return it.
            depart_at = None
            if f"legs[{i}].depart_at" not in unresolved:
                unresolved.append(f"legs[{i}].depart_at")
        return S.LegDraftIO(origin_icao=leg.origin_icao, destination_icao=leg.destination_icao, depart_at=depart_at,
                            depart_date=leg.depart_date, depart_local=local, origin_timezone=tz if local else None)

    legs_out = [draft_leg(i, l) for i, l in enumerate(draft.legs)]
    return S.TripDraftOut(
        trip_type=draft.trip_type, legs=legs_out,
        passengers=draft.passengers, checked_bags=draft.checked_bags, carry_on_bags=draft.carry_on_bags,
        golf_bags=draft.golf_bags, ski_bags=draft.ski_bags, unresolved=unresolved, confidence=draft.confidence,
        interpretation_notes=draft.notes, candidates=draft.candidates,
    )


@router.post("", response_model=S.TripOut, status_code=201)
def create_trip(body: S.TripCreate, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trip = T.create_trip(db, viewer.user.id, viewer.account.id, body)
    db.commit()
    return Builder(db, viewer).trip(trip)


@router.get("", response_model=list[S.TripOut])
def list_trips(viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trips = db.execute(select(Trip).where(Trip.account_id == viewer.account.id).order_by(Trip.created_at.desc())).scalars().all()
    b = Builder(db, viewer)
    return [b.trip(t) for t in trips]


@router.get("/{trip_id}", response_model=S.TripOut)
def get_trip(trip_id: uuid.UUID, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    return Builder(db, viewer).trip(get_owned_trip(db, viewer, trip_id))


@router.patch("/{trip_id}", response_model=S.TripOut)
def patch_trip(trip_id: uuid.UUID, body: S.TripPatch, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    if trip.status != TripStatus.draft.value:
        raise conflict("invalid_state", "Only draft trips can be edited.")
    data = body.model_dump(exclude_unset=True)
    if body.legs is not None:
        T.replace_legs(db, trip, body.legs)
    for k in ("passengers", "checked_bags", "carry_on_bags", "golf_bags", "ski_bags", "notes"):
        if k in data and data[k] is not None:
            setattr(trip, k, data[k])
    db.commit()
    return Builder(db, viewer).trip(trip)


@router.post("/{trip_id}/cancel", response_model=S.TripOut)
def cancel_trip(trip_id: uuid.UUID, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    if trip.status not in PRE_FLIGHT:
        raise conflict("invalid_state", "This trip can no longer be cancelled.")
    trip.status = TripStatus.cancelled.value
    for r in db.execute(select(Rfq).where(Rfq.trip_id == trip.id, Rfq.status == RfqStatus.queued.value)).scalars():
        r.status = RfqStatus.expired.value
    db.commit()
    return Builder(db, viewer).trip(trip)


@router.get("/{trip_id}/match", response_model=S.MatchOut)
def match(trip_id: uuid.UUID, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    result = T.run_match(db, trip)
    counts = Counter(a.type.slug for a in T.feasible_tails(db, trip))
    cats = [
        S.MatchCategoryOut(category=cat, types=[
            S.MatchTypeOut(
                slug=m.slug, model=m.model, stops=m.stops, fuel_stop_icao=m.fuel_stop_icao,
                flight_time_minutes=m.flight_time_minutes, listing_count=counts.get(m.slug, 0),
                legs=[S.MatchTypeLeg(sequence=p.sequence, stops=p.stops, fuel_stop_icao=p.fuel_stop_icao,
                                     flight_time_minutes=p.flight_time_minutes) for p in m.legs])
            for m in ms])
        for cat, ms in result.by_category().items()
    ]
    return S.MatchOut(
        legs=[S.MatchLegOut(sequence=l.sequence, origin_icao=l.origin_icao, destination_icao=l.destination_icao,
                            distance_nm=l.distance_nm) for l in result.legs],
        categories=cats, rejected=[S.RejectedOut(slug=r.slug, reasons=list(r.reasons)) for r in result.rejected],
    )


@router.get("/{trip_id}/listings", response_model=list[S.Listing])
def trip_listings(trip_id: uuid.UUID, type_slug: str | None = None, viewer: Viewer = Depends(require_member),
                  db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    b = Builder(db, viewer)
    return [b.listing(a) for a in T.feasible_tails(db, trip, type_slug)]


@router.post("/{trip_id}/rfqs", response_model=list[S.RfqOut], status_code=201)
def create_rfqs(trip_id: uuid.UUID, body: S.RfqCreateIn, viewer: Viewer = Depends(require_entitled), db: Session = Depends(get_session)):
    hit("rfq_create_user", str(viewer.user.id))
    trip = get_owned_trip(db, viewer, trip_id)
    rfqs = rfq_service.create_charter_rfqs(db, trip, body.listing_ids, body.empty_leg_id)
    db.commit()
    b = Builder(db, viewer)
    return [b.rfq(r) for r in rfqs]


@router.post("/{trip_id}/ground-rfqs", response_model=S.RfqOut, status_code=201)
def create_ground_rfq(trip_id: uuid.UUID, body: S.GroundRfqIn, viewer: Viewer = Depends(require_entitled),
                      db: Session = Depends(get_session)):
    hit("ground_rfq_create_user", str(viewer.user.id))
    trip = get_owned_trip(db, viewer, trip_id)
    rfq = rfq_service.create_ground_rfq(db, trip, body.kind, body.leg_sequence, body.fbo_id, body.details)
    db.commit()
    return Builder(db, viewer).rfq(rfq)
