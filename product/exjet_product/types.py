"""Plain data types shared by the product services."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AirportRef:
    icao: str
    latitude: float
    longitude: float
    name: str = ""
    iata: str | None = None
    faa_lid: str | None = None
    city: str | None = None
    state: str | None = None
    country: str = "US"
    elevation_ft: int | None = None
    longest_runway_ft: int | None = None
    timezone: str | None = None


@dataclass(frozen=True)
class AircraftTypeRef:
    slug: str
    model: str
    category: str
    max_passengers: int | None
    range_nm: int | None
    cruise_speed_kts: int | None
    min_runway_ft: int | None
    baggage_cuft: float | None
