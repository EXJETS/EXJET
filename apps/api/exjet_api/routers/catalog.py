from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .. import clock
from .. import schemas as S
from ..deps import get_session, optional_viewer
from ..entitlements import Viewer
from ..errors import not_found
from ..models import AircraftCategory, AircraftType, Airport, EmptyLeg
from ..serializers import Builder
from ..supply import sellable_aircraft

router = APIRouter(tags=["catalog"])

CATEGORY_NAMES = {
    "turboprop": "Turboprop", "very_light": "Very light jet", "light": "Light jet", "midsize": "Midsize jet",
    "super_midsize": "Super midsize jet", "heavy": "Heavy jet", "ultra_long_range": "Ultra long range", "airliner": "Airliner",
}


def _like(q: str) -> str:
    return "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"


@router.get("/airports", response_model=list[S.AirportOut])
def airports(q: str = Query("", max_length=80), limit: int = Query(25, ge=1, le=100), db: Session = Depends(get_session)):
    stmt = select(Airport)
    q = q.strip()
    if q:
        p = _like(q)
        stmt = stmt.where(or_(Airport.icao.ilike(p, escape="\\"), Airport.iata.ilike(p, escape="\\"),
                              Airport.name.ilike(p, escape="\\"), Airport.city.ilike(p, escape="\\")))
        stmt = stmt.order_by((func.upper(Airport.icao) == q.upper()).desc(), (func.upper(Airport.iata) == q.upper()).desc(), Airport.icao)
    else:
        stmt = stmt.order_by(Airport.icao)
    return db.execute(stmt.limit(limit)).scalars().all()


@router.get("/categories", response_model=list[S.CategoryOut])
def categories(db: Session = Depends(get_session)):
    counts = dict(db.execute(select(AircraftType.category, func.count()).group_by(AircraftType.category)).all())
    return [S.CategoryOut(category=c.value, name=CATEGORY_NAMES[c.value], type_count=counts.get(c.value, 0)) for c in AircraftCategory]


@router.get("/aircraft-types", response_model=list[S.AircraftTypeOut])
def aircraft_types(category: str | None = None, db: Session = Depends(get_session)):
    stmt = select(AircraftType).order_by(AircraftType.category, AircraftType.model)
    if category:
        stmt = stmt.where(AircraftType.category == category)
    return db.execute(stmt).scalars().all()


@router.get("/aircraft-types/{slug}", response_model=S.AircraftTypeOut)
def aircraft_type(slug: str, db: Session = Depends(get_session)):
    t = db.execute(select(AircraftType).where(AircraftType.slug == slug)).scalar_one_or_none()
    if t is None:
        raise not_found("Aircraft type not found.")
    return t


@router.get("/listings", response_model=list[S.Listing])
def listings(type_slug: str | None = None, category: str | None = None, home: str | None = None,
             viewer: Viewer = Depends(optional_viewer), db: Session = Depends(get_session)):
    b = Builder(db, viewer)
    rows = sellable_aircraft(db, type_slug=type_slug, category=category)
    if home:
        h = home.strip().lower()
        rows = [a for a in rows if (a.home_airport_icao or "").lower() == h or h in (b.city(a.home_airport_icao) or "").lower()]
    return [b.listing(a) for a in rows]


@router.get("/empty-legs", response_model=list[S.EmptyLegOut])
def empty_legs(viewer: Viewer = Depends(optional_viewer), db: Session = Depends(get_session)):
    """Operator-supplied repositioning flights. Never carries a price."""
    ids = {a.id for a in sellable_aircraft(db)}
    if not ids:
        return []
    now = clock.now()
    legs = db.execute(select(EmptyLeg).where(EmptyLeg.aircraft_id.in_(ids), EmptyLeg.available_to >= now - timedelta(minutes=0))
                      .order_by(EmptyLeg.available_from)).scalars().all()
    b = Builder(db, viewer)
    return [b.empty_leg(el) for el in legs]
