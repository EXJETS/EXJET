"""Manifest rules: due date, required ID type, passenger validation."""
from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import date, datetime, timedelta

REAL_ID = "real_id"
PASSPORT = "passport"

E_COUNT = "passenger_count_mismatch"
E_NAME = "name_missing"
E_DOB = "date_of_birth_invalid"
E_ID_TYPE = "id_type_not_allowed"
E_ID_NUMBER = "id_number_missing"
E_ID_EXPIRY_MISSING = "id_expiry_missing"
E_ID_EXPIRED = "id_expired_before_departure"
E_ID_ISSUER = "id_issuer_missing"


def required_id_type(legs_international: Iterable[bool]) -> str:
    """REAL ID for domestic-only trips; passport if any leg is international."""
    return PASSPORT if any(legs_international) else REAL_ID


def compute_due_at(first_departure: datetime, hours_before: int = 24) -> datetime:
    return first_departure - timedelta(hours=hours_before)


def reminder_times(first_departure: datetime) -> list[datetime]:
    """Reminders at T-48h and T-26h before first departure (manifest due at T-24h)."""
    return [first_departure - timedelta(hours=48), first_departure - timedelta(hours=26)]


@dataclass(frozen=True)
class PassengerInput:
    full_name: str
    date_of_birth: str  # ISO date
    id_type: str
    id_number: str
    id_expiry: date | None
    id_issuer: str | None = None
    weight_lbs: int | None = None


def validate_passenger(p: PassengerInput, required_type: str, last_departure: date, today: date) -> list[str]:
    errs: list[str] = []
    if not p.full_name.strip():
        errs.append(E_NAME)
    try:
        dob = date.fromisoformat(p.date_of_birth)
        if dob >= today:
            errs.append(E_DOB)
    except ValueError:
        errs.append(E_DOB)
    if p.id_type != required_type:
        errs.append(E_ID_TYPE)
    if not p.id_number.strip():
        errs.append(E_ID_NUMBER)
    if not (p.id_issuer or "").strip():
        errs.append(E_ID_ISSUER)
    if p.id_expiry is None:
        errs.append(E_ID_EXPIRY_MISSING)
    elif p.id_expiry < last_departure:
        errs.append(E_ID_EXPIRED)
    return errs


def validate_manifest(
    passengers: Sequence[PassengerInput], expected_count: int, required_type: str, last_departure: date, today: date
) -> dict[int, list[str]]:
    """Returns {index: [codes]}; index -1 holds manifest-level problems."""
    out: dict[int, list[str]] = {}
    if len(passengers) != expected_count:
        out[-1] = [E_COUNT]
    for i, p in enumerate(passengers):
        errs = validate_passenger(p, required_type, last_departure, today)
        if errs:
            out[i] = errs
    return out
