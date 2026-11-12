"""Flight watch: poll the ADS-B provider, update FlightTrack rows, drive trip status."""
from __future__ import annotations

import uuid

from exjet_product.flight_watch import (
    STATUS_LANDED,
    STATUS_SCHEDULED,
    STATUS_UNKNOWN,
    derive_trip_status,
    next_watch_at,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import clock
from ..audit import record_agent_action
from ..jobs import enqueue
from ..models import FlightTrack, Quote, Rfq, Trip, TripStatus
from ..providers import get_adsb
from ..providers.errors import ProviderError


def accepted_tail(db: Session, trip: Trip) -> str | None:
    if trip.accepted_quote_id is None:
        return None
    q = db.get(Quote, trip.accepted_quote_id)
    rfq = db.get(Rfq, q.rfq_id) if q else None
    return rfq.aircraft.tail_number if rfq is not None and rfq.aircraft is not None else None


def watch_trip(db: Session, trip_id: uuid.UUID) -> None:
    trip = db.get(Trip, trip_id)
    if trip is None or trip.status not in (TripStatus.scheduled.value, TripStatus.in_flight.value):
        return
    tail = accepted_tail(db, trip)
    now = clock.now()
    if tail is None:
        record_agent_action(db, agent="flight_watch", event="flight.watch", input={"trip_id": str(trip.id)},
                            output={"reason": "no_tail"}, status="failed", permission_level="READ", account_id=trip.account_id)
        return
    tracks = {t.trip_leg_id: t for t in db.execute(select(FlightTrack).where(FlightTrack.trip_leg_id.in_([l.id for l in trip.legs]))).scalars()}
    for leg in trip.legs:
        if leg.id not in tracks:
            tr = FlightTrack(trip_leg_id=leg.id, tail_number=tail, status=STATUS_SCHEDULED if leg.depart_at > now else STATUS_UNKNOWN,
                             provider=get_adsb().name)
            db.add(tr)
            tracks[leg.id] = tr
    active = next((l for l in trip.legs if tracks[l.id].status != STATUS_LANDED), None)
    if active is not None:
        try:
            snap = get_adsb().lookup(tail, active.depart_at)
        except ProviderError:
            raise
        if snap is not None:
            tr = tracks[active.id]
            tr.status = snap.status
            tr.latitude, tr.longitude, tr.altitude_ft = snap.latitude, snap.longitude, snap.altitude_ft
            tr.groundspeed_kts, tr.heading, tr.position_at = snap.groundspeed_kts, snap.heading, snap.at or now
    trip.status = derive_trip_status(trip.status, [tracks[l.id].status for l in trip.legs])
    db.flush()
    nxt = next_watch_at(now, trip.legs[0].depart_at, trip.legs[-1].depart_at, trip.status)
    if nxt:
        enqueue(db, "flight.watch", {"trip_id": str(trip.id)}, run_at=nxt, dedupe_key=f"flight.watch:{trip.id}:{int(nxt.timestamp())}")
    record_agent_action(db, agent="flight_watch", event="flight.watch", input={"trip_id": str(trip.id)},
                        output={"trip_status": trip.status}, permission_level="READ", account_id=trip.account_id)
