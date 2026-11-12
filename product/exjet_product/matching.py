"""Mission matching: which aircraft types can fly a request, nonstop or with one fuel stop.

Rules (ARCHITECTURE.md, "Mission matching"; DECISIONS #20). Everything here is deterministic.
Missing type or airport data means "not offered"; nothing is guessed.
"""
from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field

from .types import AircraftTypeRef, AirportRef

EARTH_RADIUS_NM = 3440.065
ROUTING_FACTOR = 1.07
MAX_PAYLOAD_RANGE_REDUCTION = 0.15  # range lost when every seat is filled, vs the typical-pax figure
RUNWAY_ELEVATION_ADJ_PER_1000FT = 0.03
FUEL_STOP_MAX_DETOUR = 1.25  # fuel stop path may be at most 25% longer than the direct routed path
TAXI_CLIMB_ALLOWANCE_MIN = 12
CUFT_PER_BAG = {"checked": 5.0, "carry_on": 2.0, "golf": 6.0, "ski": 4.0}

# Reject reason codes
R_MISSING_TYPE_DATA = "missing_type_data"
R_TOO_MANY_PAX = "too_many_passengers"
R_OUT_OF_RANGE = "out_of_range"
R_NO_FUEL_STOP = "no_fuel_stop_available"
R_RUNWAY_ORIGIN = "runway_too_short_origin"
R_RUNWAY_DEST = "runway_too_short_destination"
R_BAGGAGE = "baggage_exceeds_capacity"
R_AIRPORT_UNKNOWN = "airport_unknown"
R_AIRPORT_DATA_MISSING = "airport_data_missing"


@dataclass(frozen=True)
class LegRequest:
    origin_icao: str
    destination_icao: str


@dataclass(frozen=True)
class MissionRequest:
    legs: Sequence[LegRequest]
    passengers: int
    checked_bags: int = 0
    carry_on_bags: int = 0
    golf_bags: int = 0
    ski_bags: int = 0


@dataclass(frozen=True)
class LegDistance:
    sequence: int
    origin_icao: str
    destination_icao: str
    distance_nm: int | None


@dataclass(frozen=True)
class LegPlan:
    sequence: int
    stops: int
    fuel_stop_icao: str | None
    flight_time_minutes: int | None


@dataclass(frozen=True)
class TypeMatch:
    slug: str
    model: str
    category: str
    stops: int
    fuel_stop_icao: str | None
    flight_time_minutes: int | None
    legs: tuple[LegPlan, ...]


@dataclass(frozen=True)
class Rejection:
    slug: str
    reasons: tuple[str, ...]


@dataclass
class MatchResult:
    legs: list[LegDistance] = field(default_factory=list)
    feasible: list[TypeMatch] = field(default_factory=list)
    rejected: list[Rejection] = field(default_factory=list)

    def by_category(self) -> dict[str, list[TypeMatch]]:
        out: dict[str, list[TypeMatch]] = {}
        for m in self.feasible:
            out.setdefault(m.category, []).append(m)
        return out


def great_circle_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = p2 - p1
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * EARTH_RADIUS_NM * math.asin(min(1.0, math.sqrt(a)))


def airport_distance_nm(a: AirportRef, b: AirportRef) -> float:
    return great_circle_nm(a.latitude, a.longitude, b.latitude, b.longitude)


def payload_factor(passengers: int, max_passengers: int) -> float:
    """Fraction of the type's published range available with this many passengers.

    The published range assumes a typical load of half the seats. Above that the range is reduced
    linearly down to (1 - MAX_PAYLOAD_RANGE_REDUCTION) at a full cabin.
    """
    typical = max(1, math.ceil(max_passengers / 2))
    if passengers <= typical or max_passengers <= typical:
        return 1.0
    frac = min(1.0, (passengers - typical) / (max_passengers - typical))
    return 1.0 - MAX_PAYLOAD_RANGE_REDUCTION * frac


def baggage_volume_cuft(req: MissionRequest) -> float:
    return (
        req.checked_bags * CUFT_PER_BAG["checked"]
        + req.carry_on_bags * CUFT_PER_BAG["carry_on"]
        + req.golf_bags * CUFT_PER_BAG["golf"]
        + req.ski_bags * CUFT_PER_BAG["ski"]
    )


def required_runway_ft(min_runway_ft: int, elevation_ft: int | None) -> float:
    elev = max(0, elevation_ft or 0)
    return min_runway_ft * (1 + RUNWAY_ELEVATION_ADJ_PER_1000FT * elev / 1000.0)


def runway_ok(t: AircraftTypeRef, airport: AirportRef) -> bool | None:
    """True/False, or None when airport runway data is missing."""
    if airport.longest_runway_ft is None or t.min_runway_ft is None:
        return None
    return airport.longest_runway_ft >= required_runway_ft(t.min_runway_ft, airport.elevation_ft)


def flight_minutes(distance_nm_routed: float, cruise_kts: int | None) -> int | None:
    if not cruise_kts:
        return None
    return int(round(distance_nm_routed / cruise_kts * 60 + TAXI_CLIMB_ALLOWANCE_MIN))


def find_fuel_stop(
    t: AircraftTypeRef,
    origin: AirportRef,
    dest: AirportRef,
    airports: Mapping[str, AirportRef],
    effective_range_nm: float,
    routing_factor: float = ROUTING_FACTOR,
) -> AirportRef | None:
    """Best US airport near the route with a long enough runway and both halves within range.

    Ranked by total routed path length, then distance from the midpoint, then ICAO (stable).
    """
    direct = airport_distance_nm(origin, dest) * routing_factor
    best: tuple[float, float, str, AirportRef] | None = None
    mid_lat = (origin.latitude + dest.latitude) / 2
    mid_lon = (origin.longitude + dest.longitude) / 2
    for ap in airports.values():
        if ap.icao in (origin.icao, dest.icao) or ap.country != "US":
            continue
        if runway_ok(t, ap) is not True:
            continue
        d1 = airport_distance_nm(origin, ap) * routing_factor
        d2 = airport_distance_nm(ap, dest) * routing_factor
        if d1 > effective_range_nm or d2 > effective_range_nm:
            continue
        total = d1 + d2
        if total > direct * FUEL_STOP_MAX_DETOUR:
            continue
        off_mid = great_circle_nm(ap.latitude, ap.longitude, mid_lat, mid_lon)
        key = (total, off_mid, ap.icao)
        if best is None or key < best[:3]:
            best = (total, off_mid, ap.icao, ap)
    return best[3] if best else None


def _plan_leg(
    t: AircraftTypeRef,
    seq: int,
    origin: AirportRef,
    dest: AirportRef,
    airports: Mapping[str, AirportRef],
    effective_range_nm: float,
    max_fuel_stops: int,
    routing_factor: float,
) -> tuple[LegPlan | None, list[str]]:
    reasons: list[str] = []
    ro = runway_ok(t, origin)
    rd = runway_ok(t, dest)
    if ro is None or rd is None:
        reasons.append(R_AIRPORT_DATA_MISSING)
    if ro is False:
        reasons.append(R_RUNWAY_ORIGIN)
    if rd is False:
        reasons.append(R_RUNWAY_DEST)
    if reasons:
        return None, reasons
    routed = airport_distance_nm(origin, dest) * routing_factor
    if routed <= effective_range_nm:
        return LegPlan(seq, 0, None, flight_minutes(routed, t.cruise_speed_kts)), []
    if max_fuel_stops < 1:
        return None, [R_OUT_OF_RANGE]
    stop = find_fuel_stop(t, origin, dest, airports, effective_range_nm, routing_factor)
    if stop is None:
        return None, [R_OUT_OF_RANGE, R_NO_FUEL_STOP]
    total = (airport_distance_nm(origin, stop) + airport_distance_nm(stop, dest)) * routing_factor
    return LegPlan(seq, 1, stop.icao, flight_minutes(total, t.cruise_speed_kts)), []


def match_mission(
    req: MissionRequest,
    types: Sequence[AircraftTypeRef],
    airports: Mapping[str, AirportRef],
    *,
    max_fuel_stops: int = 1,
    routing_factor: float = ROUTING_FACTOR,
) -> MatchResult:
    result = MatchResult()
    for i, leg in enumerate(req.legs):
        o, d = airports.get(leg.origin_icao), airports.get(leg.destination_icao)
        dist = round(airport_distance_nm(o, d)) if o and d else None
        result.legs.append(LegDistance(i, leg.origin_icao, leg.destination_icao, dist))
    bag_cuft = baggage_volume_cuft(req)
    for t in sorted(types, key=lambda x: x.slug):
        reasons: list[str] = []
        if t.max_passengers is None or t.range_nm is None or t.min_runway_ft is None:
            result.rejected.append(Rejection(t.slug, (R_MISSING_TYPE_DATA,)))
            continue
        if req.passengers > t.max_passengers:
            reasons.append(R_TOO_MANY_PAX)
        if bag_cuft > 0:
            if t.baggage_cuft is None:
                reasons.append(R_MISSING_TYPE_DATA)
            elif bag_cuft > t.baggage_cuft:
                reasons.append(R_BAGGAGE)
        plans: list[LegPlan] = []
        if not reasons:
            eff = t.range_nm * payload_factor(req.passengers, t.max_passengers)
            for i, leg in enumerate(req.legs):
                o, d = airports.get(leg.origin_icao), airports.get(leg.destination_icao)
                if o is None or d is None:
                    reasons.append(R_AIRPORT_UNKNOWN)
                    break
                plan, why = _plan_leg(t, i, o, d, airports, eff, max_fuel_stops, routing_factor)
                if plan is None:
                    reasons.extend(w for w in why if w not in reasons)
                else:
                    plans.append(plan)
        if reasons or not plans:
            result.rejected.append(Rejection(t.slug, tuple(dict.fromkeys(reasons or [R_MISSING_TYPE_DATA]))))
            continue
        stops = max(p.stops for p in plans)
        fuel = next((p.fuel_stop_icao for p in plans if p.fuel_stop_icao), None)
        times = [p.flight_time_minutes for p in plans]
        total_time = None if any(x is None for x in times) else sum(x for x in times if x is not None)
        result.feasible.append(TypeMatch(t.slug, t.model, t.category, stops, fuel, total_time, tuple(plans)))
    return result
