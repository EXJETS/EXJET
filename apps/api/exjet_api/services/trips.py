"""Trip creation and mission matching against the database."""
from __future__ import annotations

import uuid
from datetime import datetime

from exjet_product.manifest import required_id_type
from exjet_product.matching import LegRequest, MatchResult, MissionRequest, great_circle_nm, match_mission
from exjet_product.types import AircraftTypeRef, AirportRef
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas as S
from ..config import get_settings
from ..errors import unprocessable
from ..models import Aircraft, AircraftType, Airport, Trip, TripLeg
from ..supply import sellable_aircraft


def airport_ref(a: Airport) -> AirportRef:
    return AirportRef(
        icao=a.icao, latitude=a.latitude, longitude=a.longitude, name=a.name, iata=a.iata, faa_lid=a.faa_lid,
        city=a.city, state=a.state, country=a.country, elevation_ft=a.elevation_ft,
        longest_runway_ft=a.longest_runway_ft, timezone=a.timezone,
    )


def load_airports(db: Session) -> dict[str, AirportRef]:
    return {a.icao: airport_ref(a) for a in db.execute(select(Airport)).scalars()}


def type_ref(t: AircraftType) -> AircraftTypeRef:
    return AircraftTypeRef(t.slug, t.model, t.category, t.max_passengers, t.range_nm, t.cruise_speed_kts,
                           t.min_runway_ft, t.baggage_cuft)


def build_legs(db: Session, legs: list[S.LegIn]) -> list[TripLeg]:
    codes = {c.upper() for leg in legs for c in (leg.origin_icao, leg.destination_icao)}
    found = {a.icao: a for a in db.execute(select(Airport).where(Airport.icao.in_(codes))).scalars()}
    out: list[TripLeg] = []
    for i, leg in enumerate(legs):
        o, d = found.get(leg.origin_icao.upper()), found.get(leg.destination_icao.upper())
        if o is None or d is None:
            raise unprocessable("unknown_airport", f"Leg {i + 1} uses an airport that is not in the airport list.")
        if o.icao == d.icao:
            raise unprocessable("invalid_leg", f"Leg {i + 1} starts and ends at the same airport.")
        if leg.depart_at.tzinfo is None:
            raise unprocessable("invalid_departure", "Departure times must include a time zone offset.")
        out.append(TripLeg(
            sequence=i, origin_icao=o.icao, destination_icao=d.icao, depart_at=leg.depart_at,
            distance_nm=round(great_circle_nm(o.latitude, o.longitude, d.latitude, d.longitude)),
            is_international=(o.country != "US" or d.country != "US"),
        ))
    return out


def infer_trip_type(n_legs: int, explicit: str | None) -> str:
    if n_legs == 1:
        return "one_way"
    return explicit if explicit in ("round_trip", "multi_leg") else ("round_trip" if n_legs == 2 else "multi_leg")


def create_trip(db: Session, user_id: uuid.UUID, account_id: uuid.UUID, body: S.TripCreate) -> Trip:
    legs = build_legs(db, body.legs)
    trip = Trip(
        account_id=account_id, created_by=user_id, trip_type=infer_trip_type(len(legs), body.trip_type),
        passengers=body.passengers, checked_bags=body.checked_bags, carry_on_bags=body.carry_on_bags,
        golf_bags=body.golf_bags, ski_bags=body.ski_bags, raw_request=body.raw_request, notes=body.notes,
    )
    trip.legs = legs
    db.add(trip)
    db.flush()
    return trip


def replace_legs(db: Session, trip: Trip, legs: list[S.LegIn]) -> None:
    new = build_legs(db, legs)
    trip.legs.clear()
    db.flush()
    trip.legs.extend(new)
    trip.trip_type = infer_trip_type(len(new), trip.trip_type)


def required_pax_id_type(trip: Trip) -> str:
    return required_id_type(leg.is_international for leg in trip.legs)


def mission_for(trip: Trip) -> MissionRequest:
    return MissionRequest(
        legs=[LegRequest(leg.origin_icao, leg.destination_icao) for leg in trip.legs], passengers=trip.passengers,
        checked_bags=trip.checked_bags, carry_on_bags=trip.carry_on_bags, golf_bags=trip.golf_bags, ski_bags=trip.ski_bags,
    )


def run_match(db: Session, trip: Trip) -> MatchResult:
    types = [type_ref(t) for t in db.execute(select(AircraftType)).scalars()]
    return match_mission(mission_for(trip), types, load_airports(db), max_fuel_stops=get_settings().max_fuel_stops)


def feasible_tails(db: Session, trip: Trip, type_slug: str | None = None) -> list[Aircraft]:
    """Live, non-excluded tails of feasible types with enough seats."""
    result = run_match(db, trip)
    slugs = {m.slug for m in result.feasible}
    if type_slug:
        slugs &= {type_slug}
    if not slugs:
        return []
    out = []
    for ac in sellable_aircraft(db):
        if ac.type.slug in slugs and ac.passenger_seats is not None and ac.passenger_seats >= trip.passengers:
            out.append(ac)
    return out


def depart_window(trip: Trip) -> tuple[datetime, datetime]:
    return trip.legs[0].depart_at, trip.legs[-1].depart_at
