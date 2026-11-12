"""Optional LLM step for plain-language intake. Rules run first; the LLM may only fill fields the rules
left unresolved, and every value it returns is validated against the airports table and sane ranges."""
from __future__ import annotations

import re
from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from exjet_product.intake import TripDraft
from exjet_product.types import AirportRef

from ..providers.errors import ProviderError
from ..providers.llm import LlmProvider

SYSTEM = (
    "You extract private jet trip details from a request. Reply with one JSON object only, keys: "
    "legs (list of {origin_icao, destination_icao, depart_local}) with depart_local as 'YYYY-MM-DD HH:MM' local time "
    "at the origin, and passengers (integer). Use null for anything not stated. Never guess."
)


def refine(draft: TripDraft, text: str, airports: dict[str, AirportRef], llm: LlmProvider, now: datetime) -> dict | None:
    """Returns usage info if the LLM was called, else None. Mutates `draft` for validated fields only."""
    if not llm.available or not draft.unresolved:
        return None
    try:
        data = llm.complete_json(system=SYSTEM, prompt=f"Today is {now:%Y-%m-%d}. Request: {text}")
    except ProviderError:
        return None
    changed = False
    legs = data.get("legs") if isinstance(data.get("legs"), list) else []
    for i, leg in enumerate(draft.legs):
        src = legs[i] if i < len(legs) and isinstance(legs[i], dict) else {}
        for fld in ("origin_icao", "destination_icao"):
            val = src.get(fld)
            if getattr(leg, fld) is None and isinstance(val, str) and val.upper() in airports:
                setattr(leg, fld, val.upper())
                changed = True
        dl = src.get("depart_local")
        if leg.depart_at is None and isinstance(dl, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}", dl):
            try:
                naive = datetime.strptime(dl, "%Y-%m-%d %H:%M")
            except ValueError:
                continue
            ap = airports.get(leg.origin_icao or "")
            try:
                tz = ZoneInfo(ap.timezone) if ap and ap.timezone else None
            except ZoneInfoNotFoundError:
                tz = None
            if tz is not None and naive.replace(tzinfo=tz) > now:
                leg.depart_at = naive.replace(tzinfo=tz)
                leg.depart_date = naive.date()
                changed = True
    pax = data.get("passengers")
    if draft.passengers is None and isinstance(pax, int) and 1 <= pax <= 100:
        draft.passengers = pax
        changed = True
    if changed:
        required = []
        for i, leg in enumerate(draft.legs):
            required += [(f"legs[{i}].origin_icao", leg.origin_icao), (f"legs[{i}].destination_icao", leg.destination_icao),
                         (f"legs[{i}].depart_at", leg.depart_at)]
        required.append(("passengers", draft.passengers))
        draft.unresolved = [n for n, v in required if v is None]
        draft.confidence = round(sum(1 for _, v in required if v is not None) / len(required), 2)
        draft.notes.append("Some details were filled by an AI assistant; please confirm them.")
    return data.get("_usage") or {}
