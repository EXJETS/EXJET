"""Flight tracking provider. Fake is scriptable; FlightAware AeroAPI is NOT IMPLEMENTED."""
from __future__ import annotations

from datetime import datetime
from typing import Protocol

from exjet_product.flight_watch import FlightSnapshot

from .errors import NotImplementedProvider


class AdsbProvider(Protocol):
    name: str

    def lookup(self, tail_number: str, around: datetime) -> FlightSnapshot | None: ...


class FakeAdsb:
    name = "fake"

    def __init__(self) -> None:
        self._snapshots: dict[str, FlightSnapshot] = {}
        self.calls: list[str] = []

    def set_snapshot(self, tail_number: str, snap: FlightSnapshot) -> None:
        self._snapshots[tail_number] = snap

    def lookup(self, tail_number: str, around: datetime) -> FlightSnapshot | None:
        self.calls.append(tail_number)
        return self._snapshots.get(tail_number)


class FlightAwareAdsb:
    """TODO(not implemented): FlightAware AeroAPI lookup by tail (EXJET_FLIGHTAWARE_API_KEY). Raises on use."""

    name = "flightaware"

    def lookup(self, tail_number, around):
        raise NotImplementedProvider("FlightAware AeroAPI is not implemented yet")
