"""Flight watch decisions. Pure logic; providers and persistence live in the API."""
from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta

STATUS_SCHEDULED = "scheduled"
STATUS_AIRBORNE = "airborne"
STATUS_LANDED = "landed"
STATUS_UNKNOWN = "unknown"

LEAD_TIME = timedelta(hours=2)  # start polling this long before departure
ACTIVE_INTERVAL = timedelta(minutes=5)
GIVE_UP_AFTER = timedelta(hours=18)  # after last departure, stop watching


@dataclass(frozen=True)
class FlightSnapshot:
    status: str
    latitude: float | None = None
    longitude: float | None = None
    altitude_ft: int | None = None
    groundspeed_kts: int | None = None
    heading: int | None = None
    at: datetime | None = None


def derive_trip_status(current: str, leg_statuses: Sequence[str]) -> str:
    """scheduled -> in_flight when any leg is airborne; -> completed when every leg has landed."""
    if current in ("cancelled", "completed"):
        return current
    if leg_statuses and all(s == STATUS_LANDED for s in leg_statuses):
        return "completed"
    if any(s == STATUS_AIRBORNE for s in leg_statuses):
        return "in_flight"
    if any(s == STATUS_LANDED for s in leg_statuses) and current in ("scheduled", "in_flight"):
        return "in_flight"  # between legs of a multi-leg trip
    return current


def next_watch_at(now: datetime, first_departure: datetime, last_departure: datetime, trip_status: str) -> datetime | None:
    """When to poll next, or None to stop watching."""
    if trip_status in ("completed", "cancelled"):
        return None
    if now > last_departure + GIVE_UP_AFTER:
        return None
    start = first_departure - LEAD_TIME
    if now < start:
        return start
    return now + ACTIVE_INTERVAL
