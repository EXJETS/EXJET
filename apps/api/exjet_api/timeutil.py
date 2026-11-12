"""Departure times: wall-clock at the origin airport <-> UTC.

Rules (deterministic, documented in README and ARCHITECTURE):
- `depart_at` with an offset is an instant; it is stored as UTC as given. The origin airport must still have a known
  IANA zone so the response can carry `depart_local` / `origin_timezone`.
- A naive `depart_at` is a wall-clock time at the ORIGIN airport, interpreted in that airport's IANA zone.
- An airport with no zone (or one `zoneinfo` does not know) is refused with 422 `airport_timezone_unknown`. We never
  guess a zone, and never fall back to UTC.
- DST gap (the wall-clock time does not exist, e.g. 02:30 on spring-forward day): refused with 422
  `nonexistent_local_time`; the member picks a real time.
- DST overlap (the wall-clock time happens twice, e.g. 01:30 on fall-back day): the FIRST occurrence is used (the
  daylight-time offset, `fold=0`). A member who means the second passes an explicit offset instead.
"""
from __future__ import annotations

from datetime import UTC, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .errors import unprocessable


def zone_for(icao: str, tzname: str | None) -> ZoneInfo:
    if not tzname:
        raise unprocessable("airport_timezone_unknown", f"The time zone of {icao} is not on file, so a departure time there cannot be set yet.")
    try:
        return ZoneInfo(tzname)
    except (ZoneInfoNotFoundError, ValueError, OSError):
        raise unprocessable("airport_timezone_unknown", f"The time zone recorded for {icao} is not valid.") from None


def local_to_utc(naive: datetime, zone: ZoneInfo, *, leg_no: int) -> datetime:
    """Interpret a naive wall-clock time in `zone`. Gap -> 422; overlap -> first occurrence."""
    base = naive.replace(tzinfo=zone, fold=0)
    utc = base.astimezone(UTC)
    if utc.astimezone(zone).replace(tzinfo=None) != naive:  # the wall time does not exist
        raise unprocessable("nonexistent_local_time",
                            f"Leg {leg_no}: {naive:%Y-%m-%d %H:%M} does not exist at the origin airport (clocks move forward that day). Pick another time.")
    return utc


def resolve_departure(depart_at: datetime, icao: str, tzname: str | None, *, leg_no: int) -> tuple[datetime, str]:
    """(UTC instant, IANA zone name) for a request value, following the rules above."""
    zone = zone_for(icao, tzname)
    if depart_at.tzinfo is None:
        return local_to_utc(depart_at, zone, leg_no=leg_no), zone.key
    return depart_at.astimezone(UTC), zone.key


def to_local_str(instant: datetime, tzname: str | None) -> str | None:
    """Naive wall-clock string for an instant at a zone, or None when the zone is unknown."""
    if not tzname or instant is None:
        return None
    try:
        return instant.astimezone(ZoneInfo(tzname)).replace(tzinfo=None, microsecond=0).isoformat()
    except (ZoneInfoNotFoundError, ValueError, OSError):
        return None
