from datetime import datetime, timezone

import pytest

from exjet_product.types import AircraftTypeRef, AirportRef

NY, LA, DEN, CHI, DAL, UT = "America/New_York", "America/Los_Angeles", "America/Denver", "America/Chicago", "America/Chicago", "America/Denver"


def _ap(icao, iata, name, city, state, lat, lon, elev, rwy, tz):
    return AirportRef(icao=icao, iata=iata, name=name, city=city, state=state, latitude=lat, longitude=lon,
                      elevation_ft=elev, longest_runway_ft=rwy, timezone=tz)


AIRPORTS = [
    _ap("KTEB", "TEB", "Teterboro Airport", "Teterboro", "NJ", 40.8501, -74.0608, 9, 6013, NY),
    _ap("KVNY", "VNY", "Van Nuys Airport", "Van Nuys", "CA", 34.2098, -118.4900, 802, 8001, LA),
    _ap("KLAX", "LAX", "Los Angeles International Airport", "Los Angeles", "CA", 33.9425, -118.4081, 128, 12091, LA),
    _ap("KJFK", "JFK", "John F. Kennedy International Airport", "New York", "NY", 40.6398, -73.7789, 13, 14511, NY),
    _ap("KLGA", "LGA", "LaGuardia Airport", "New York", "NY", 40.7772, -73.8726, 21, 7003, NY),
    _ap("KDEN", "DEN", "Denver International Airport", "Denver", "CO", 39.8617, -104.6731, 5434, 16000, DEN),
    _ap("KSLC", "SLC", "Salt Lake City International Airport", "Salt Lake City", "UT", 40.7884, -111.9778, 4227, 12003, UT),
    _ap("KMDW", "MDW", "Chicago Midway International Airport", "Chicago", "IL", 41.7868, -87.7522, 620, 6522, CHI),
    _ap("KDAL", "DAL", "Dallas Love Field", "Dallas", "TX", 32.8471, -96.8518, 487, 8800, DAL),
    _ap("KSMO", "SMO", "Santa Monica Airport", "Santa Monica", "CA", 34.0158, -118.4513, 177, 3500, LA),
    _ap("KASE", "ASE", "Aspen-Pitkin County Airport", "Aspen", "CO", 39.2232, -106.8688, 7820, 8006, DEN),
]
AIRPORT_MAP = {a.icao: a for a in AIRPORTS}

TYPES = [
    AircraftTypeRef("cj3", "Citation CJ3+", "light", 9, 2040, 416, 3180, 65.0),
    AircraftTypeRef("xls", "Citation XLS+", "midsize", 9, 1858, 441, 3560, 80.0),
    AircraftTypeRef("ch350", "Challenger 350", "super_midsize", 10, 3200, 470, 4835, 106.0),
    AircraftTypeRef("g550", "G550", "ultra_long_range", 19, 6750, 488, 5910, 226.0),
    AircraftTypeRef("nodata", "Unknown", "light", 8, None, 400, 3000, 60.0),
]


@pytest.fixture
def airports():
    return AIRPORTS


@pytest.fixture
def airport_map():
    return AIRPORT_MAP


@pytest.fixture
def types():
    return TYPES


@pytest.fixture
def now():
    """Thursday 2026-11-12 10:00 in New York."""
    return datetime(2026, 11, 12, 15, 0, tzinfo=timezone.utc)
