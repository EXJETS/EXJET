from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from exjet_product.weather import summarize_leg

from .. import schemas as S
from ..deps import get_owned_trip, get_session, require_member
from ..entitlements import Viewer
from ..models import FlightTrack
from ..providers import get_weather
from ..providers.errors import ProviderError
from ..services import manifest_service as M

router = APIRouter(prefix="/trips", tags=["manifest-flight"])


@router.get("/{trip_id}/manifest", response_model=S.ManifestOut)
def get_manifest(trip_id: uuid.UUID, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    return M.manifest_out(db, get_owned_trip(db, viewer, trip_id))


@router.put("/{trip_id}/manifest", response_model=S.ManifestOut)
def put_manifest(trip_id: uuid.UUID, body: S.ManifestPut, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    M.put_manifest(db, trip, body)
    db.commit()
    return M.manifest_out(db, trip)


@router.post("/{trip_id}/manifest/submit", response_model=S.ManifestOut)
def submit_manifest(trip_id: uuid.UUID, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    M.submit_manifest(db, trip)
    db.commit()
    return M.manifest_out(db, trip)


def _station(icao: str) -> S.StationWeather:
    w = get_weather()
    try:
        return S.StationWeather(icao=icao, metar=w.metar(icao), taf=w.taf(icao))
    except ProviderError:
        return S.StationWeather(icao=icao, metar=None, taf=None)


@router.get("/{trip_id}/weather", response_model=S.WeatherOut)
def weather(trip_id: uuid.UUID, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    legs = []
    for leg in trip.legs:
        o, d = _station(leg.origin_icao), _station(leg.destination_icao)
        legs.append(S.LegWeather(sequence=leg.sequence, origin=o, destination=d,
                                 summary=summarize_leg(o.icao, o.metar, d.icao, d.metar)))
    return S.WeatherOut(legs=legs)


@router.get("/{trip_id}/track", response_model=S.TrackOut)
def track(trip_id: uuid.UUID, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    """Reads the last stored flight watch result; it never calls the tracking provider (cost and rate limits)."""
    trip = get_owned_trip(db, viewer, trip_id)
    rows = {t.trip_leg_id: t for t in db.execute(select(FlightTrack).where(FlightTrack.trip_leg_id.in_([l.id for l in trip.legs]))).scalars()}
    out = []
    for leg in trip.legs:
        t = rows.get(leg.id)
        pos = S.Position(lat=t.latitude, lon=t.longitude, altitude_ft=t.altitude_ft, groundspeed_kts=t.groundspeed_kts,
                         heading=t.heading, at=t.position_at) if t and t.latitude is not None and t.longitude is not None else None
        out.append(S.LegTrack(sequence=leg.sequence, status=t.status if t else "scheduled", position=pos))
    return S.TrackOut(legs=out)
