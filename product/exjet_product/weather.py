"""Weather summary from raw METAR/TAF text. No forecast is invented: unreadable parts are omitted."""
from __future__ import annotations

import re
from dataclasses import dataclass

CATEGORY_ORDER = ["LIFR", "IFR", "MVFR", "VFR"]


@dataclass(frozen=True)
class MetarSummary:
    station: str | None
    wind_dir: int | None
    wind_kts: int | None
    gust_kts: int | None
    variable_wind: bool
    visibility_sm: float | None
    ceiling_ft: int | None
    flight_category: str | None


def _parse_vis(raw: str) -> float | None:
    m = re.search(r"\b(?:(\d+)\s)?(?:(\d+)/(\d+)|(\d+))SM\b", raw)
    if not m:
        m2 = re.search(r"\bM?(\d+)/(\d+)SM\b", raw)
        if m2:
            return int(m2[1]) / int(m2[2])
        return None
    if m[4]:
        return float(m[4])
    whole = int(m[1]) if m[1] else 0
    return whole + int(m[2]) / int(m[3])


def flight_category(visibility_sm: float | None, ceiling_ft: int | None) -> str | None:
    if visibility_sm is None and ceiling_ft is None:
        return None
    v = visibility_sm if visibility_sm is not None else 99.0
    c = ceiling_ft if ceiling_ft is not None else 99999
    if c < 500 or v < 1:
        return "LIFR"
    if c < 1000 or v < 3:
        return "IFR"
    if c <= 3000 or v <= 5:
        return "MVFR"
    return "VFR"


def parse_metar(raw: str) -> MetarSummary:
    body = raw.split(" RMK ")[0]
    station = None
    if m := re.match(r"^(?:METAR\s+|SPECI\s+)?([A-Z][A-Z0-9]{3})\b", body.strip()):
        station = m[1]
    wd = wk = gust = None
    var = False
    if m := re.search(r"\b(VRB|\d{3})(\d{2,3})(?:G(\d{2,3}))?KT\b", body):
        var = m[1] == "VRB"
        wd = None if var else int(m[1])
        wk = int(m[2])
        gust = int(m[3]) if m[3] else None
    vis = _parse_vis(body)
    ceiling = None
    for lm in re.finditer(r"\b(BKN|OVC|VV)(\d{3})\b", body):
        h = int(lm[2]) * 100
        ceiling = h if ceiling is None else min(ceiling, h)
    return MetarSummary(station, wd, wk, gust, var, vis, ceiling, flight_category(vis, ceiling))


def describe_metar(raw: str | None, label: str) -> str:
    if not raw:
        return f"{label}: no observation available."
    s = parse_metar(raw)
    parts = [label + ":"]
    parts.append(s.flight_category or "category unknown")
    if s.wind_kts is not None:
        if s.variable_wind:
            wind = f"variable at {s.wind_kts} kt"
        else:
            wind = f"{s.wind_dir:03d} at {s.wind_kts} kt"
        if s.gust_kts:
            wind += f" gusting {s.gust_kts} kt"
        parts.append(f"wind {wind}")
    if s.visibility_sm is not None:
        parts.append(f"visibility {s.visibility_sm:g} SM")
    if s.ceiling_ft is not None:
        parts.append(f"ceiling {s.ceiling_ft} ft")
    return " ".join(parts[:2]) + (", " + ", ".join(parts[2:]) if len(parts) > 2 else "") + "."


def summarize_leg(origin_icao: str, origin_metar: str | None, dest_icao: str, dest_metar: str | None) -> str:
    a = describe_metar(origin_metar, origin_icao)
    b = describe_metar(dest_metar, dest_icao)
    cats = []
    for raw in (origin_metar, dest_metar):
        if raw:
            c = parse_metar(raw).flight_category
            if c:
                cats.append(c)
    note = ""
    if cats:
        worst = min(cats, key=CATEGORY_ORDER.index)
        if worst in ("IFR", "LIFR"):
            note = f" Instrument conditions at one or both airports ({worst}); your operator will advise on timing."
    return f"{a} {b}{note}"
