"""Weather provider. The aviationweather.gov client is real (no key); the fake is for tests."""
from __future__ import annotations

from typing import Protocol

import httpx

from .errors import ProviderError

AWC_BASE = "https://aviationweather.gov/api/data"


class WeatherProvider(Protocol):
    name: str

    def metar(self, icao: str) -> str | None: ...

    def taf(self, icao: str) -> str | None: ...


class AviationWeather:
    """aviationweather.gov Data API, raw text format. Not exercised against the live endpoint in
    this repo's tests (no network in CI); tests use FakeWeather and a mocked transport."""

    name = "aviationweather"

    def __init__(self, client: httpx.Client | None = None, timeout: float = 8.0) -> None:
        self._client = client or httpx.Client(timeout=timeout, headers={"User-Agent": "exjet-api/0.1"})

    def _get(self, path: str, icao: str) -> str | None:
        icao = icao.upper()
        if not (len(icao) == 4 and icao.isalnum()):
            raise ProviderError("invalid station id")
        try:
            r = self._client.get(f"{AWC_BASE}/{path}", params={"ids": icao, "format": "raw"})
        except httpx.HTTPError as e:
            raise ProviderError(f"weather request failed: {type(e).__name__}") from e
        if r.status_code == 204 or not r.text.strip():
            return None
        if r.status_code != 200:
            raise ProviderError(f"weather service returned {r.status_code}")
        return r.text.strip()

    def metar(self, icao: str) -> str | None:
        return self._get("metar", icao)

    def taf(self, icao: str) -> str | None:
        return self._get("taf", icao)


class FakeWeather:
    """Canned, clearly synthetic reports. Override per station with set_report()."""

    name = "fake"

    def __init__(self) -> None:
        self._m: dict[str, str] = {}
        self._t: dict[str, str] = {}
        self.calls: list[str] = []

    def set_report(self, icao: str, metar: str | None, taf: str | None = None) -> None:
        if metar is not None:
            self._m[icao] = metar
        if taf is not None:
            self._t[icao] = taf

    def metar(self, icao: str) -> str | None:
        self.calls.append(icao)
        return self._m.get(icao, f"{icao} 010000Z 27008KT 10SM FEW050 15/05 A3000 RMK SYNTHETIC")

    def taf(self, icao: str) -> str | None:
        return self._t.get(icao, f"TAF {icao} 010000Z 0100/0206 27008KT P6SM FEW050 RMK SYNTHETIC")
