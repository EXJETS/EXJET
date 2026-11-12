"""Rules-based parser: plain-language trip request -> TripDraft with explicit unresolved fields.

Nothing is guessed. Anything the parser cannot read with confidence is listed in `unresolved`
and left null. Interpretations of relative dates ("next Friday") are recorded in `notes` so the
member can confirm them before the trip is saved.
"""
from __future__ import annotations

import re
from collections.abc import Sequence
from dataclasses import dataclass, field
from datetime import UTC, date, datetime, time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .types import AirportRef

NUMBER_WORDS = {
    "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
    "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
}
_NUM = r"(\d{1,3}|" + "|".join(k for k in NUMBER_WORDS if k not in ("a", "an")) + r")"
_NUM_A = r"(\d{1,3}|" + "|".join(NUMBER_WORDS) + r")"

WEEKDAYS = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6}
WEEKDAY_ABBR = {"mon": 0, "tue": 1, "tues": 1, "wed": 2, "thu": 3, "thur": 3, "thurs": 3, "fri": 4, "sat": 5, "sun": 6}
MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12, "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "jun": 6, "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12,
}
IATA_STOPWORDS = {
    "THE", "AND", "FOR", "PAX", "ONE", "TWO", "SIX", "TEN", "ALL", "NOT", "ARE", "CAN", "YOU", "OUT", "DAY",
    "NEW", "NOW", "WAY", "SKI", "BAG", "BAGS", "CAR", "AIR", "FLY", "JET", "ETC", "USA", "ASAP", "VIP",
}
NAME_SUFFIXES = {
    "airport", "international", "intl", "regional", "municipal", "executive", "field", "county", "airfield",
    "metropolitan", "metro", "memorial", "national", "airpark", "air", "terminal", "jetport", "airstrip",
}
RETURN_RE = re.compile(r"\b(?:return(?:ing|s)?|come back|coming back|back on|round[- ]?trip|and back)\b", re.IGNORECASE)
FROM_WORDS = {"from", "leaving", "departing", "ex"}
TO_WORDS = {"to", "into", "towards", "toward"}
TOKEN_RE = re.compile(r"[A-Za-z0-9']+")


@dataclass
class LegDraft:
    origin_icao: str | None = None
    destination_icao: str | None = None
    depart_at: datetime | None = None
    depart_date: date | None = None


@dataclass
class TripDraft:
    trip_type: str = "one_way"
    legs: list[LegDraft] = field(default_factory=list)
    passengers: int | None = None
    checked_bags: int = 0
    carry_on_bags: int = 0
    golf_bags: int = 0
    ski_bags: int = 0
    unresolved: list[str] = field(default_factory=list)
    confidence: float = 0.0
    notes: list[str] = field(default_factory=list)
    candidates: dict[str, list[str]] = field(default_factory=dict)


# ----------------------------------------------------------------------------- airports
@dataclass(frozen=True)
class _Mention:
    start: int  # token index
    end: int  # exclusive
    icaos: tuple[str, ...]
    char_start: int
    char_end: int


def _norm_tokens(s: str) -> list[str]:
    return [t.lower() for t in TOKEN_RE.findall(s)]


def _alias_index(airports: Sequence[AirportRef]) -> tuple[dict[str, set[str]], dict[str, str], dict[str, str]]:
    names: dict[str, set[str]] = {}
    iata: dict[str, str] = {}
    icao: dict[str, str] = {}

    def add(alias: str, code: str) -> None:
        toks = _norm_tokens(alias)
        if toks:
            names.setdefault(" ".join(toks), set()).add(code)

    for ap in airports:
        icao[ap.icao.lower()] = ap.icao
        if ap.iata:
            iata[ap.iata.upper()] = ap.icao
        if ap.name:
            add(ap.name, ap.icao)
            stripped = [t for t in _norm_tokens(ap.name) if t not in NAME_SUFFIXES]
            if stripped:
                names.setdefault(" ".join(stripped), set()).add(ap.icao)
        if ap.city:
            add(ap.city, ap.icao)
    return names, iata, icao


def _find_mentions(text: str, airports: Sequence[AirportRef]) -> list[_Mention]:
    names, iata, icao = _alias_index(airports)
    toks = [(m.group(0), m.start(), m.end()) for m in TOKEN_RE.finditer(text)]
    low = [t[0].lower() for t in toks]
    used = [False] * len(toks)
    found: list[_Mention] = []

    def take(i: int, j: int, codes: tuple[str, ...]) -> None:
        for k in range(i, j):
            used[k] = True
        found.append(_Mention(i, j, codes, toks[i][1], toks[j - 1][2]))

    for n in range(5, 0, -1):
        for i in range(len(toks) - n + 1):
            if any(used[i : i + n]):
                continue
            key = " ".join(low[i : i + n])
            if n == 1:
                raw = toks[i][0]
                if len(raw) == 4 and key in icao:
                    take(i, i + 1, (icao[key],))
                    continue
                if len(raw) == 3 and raw.isupper() and raw in iata and raw not in IATA_STOPWORDS:
                    take(i, i + 1, (iata[raw],))
                    continue
            if key in names:
                if n == 1 and (len(key) < 4 or key in NUMBER_WORDS or key in MONTHS or key in WEEKDAYS):
                    continue
                take(i, i + n, tuple(sorted(names[key])))
    found.sort(key=lambda m: m.start)
    return found


def _role(text: str, m: _Mention) -> str | None:
    before = _norm_tokens(text[: m.char_start])[-2:]
    if before and before[-1] in FROM_WORDS:
        return "from"
    if before and before[-1] in TO_WORDS:
        return "to"
    if len(before) == 2 and " ".join(before) in ("out of",):
        return "from"
    return None


# ----------------------------------------------------------------------------- dates
def _next_weekday(base: date, wd: int, strictly_after: bool) -> date:
    delta = (wd - base.weekday()) % 7
    if delta == 0 and strictly_after:
        delta = 7
    return base + timedelta(days=delta)


def _safe_date(y: int, m: int, d: int) -> date | None:
    try:
        return date(y, m, d)
    except ValueError:
        return None


def _roll_year(m: int, d: int, base: date) -> date | None:
    cand = _safe_date(base.year, m, d)
    if cand is None:
        return None
    if cand < base:
        cand = _safe_date(base.year + 1, m, d)
    return cand


def parse_date(seg: str, base: date, notes: list[str], *, relative_to_outbound: bool = False) -> date | None:
    s = seg.lower()
    if m := re.search(r"\b(\d{4})-(\d{2})-(\d{2})\b", s):
        return _safe_date(int(m[1]), int(m[2]), int(m[3]))
    if m := re.search(r"\b(" + "|".join(MONTHS) + r")\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b", s):
        mo, d = MONTHS[m[1]], int(m[2])
        if m[3]:
            return _safe_date(int(m[3]), mo, d)
        return _roll_year(mo, d, base)
    if m := re.search(r"\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(" + "|".join(MONTHS) + r")\b(?:,?\s+(\d{4}))?", s):
        mo, d = MONTHS[m[2]], int(m[1])
        if m[3]:
            return _safe_date(int(m[3]), mo, d)
        return _roll_year(mo, d, base)
    if m := re.search(r"\b(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?\b", s):
        mo, d = int(m[1]), int(m[2])
        if m[3]:
            y = int(m[3]) + (2000 if int(m[3]) < 100 else 0)
            return _safe_date(y, mo, d)
        return _roll_year(mo, d, base)
    if re.search(r"\bday after tomorrow\b", s):
        return base + timedelta(days=2)
    if re.search(r"\btomorrow\b", s):
        return base + timedelta(days=1)
    if re.search(r"\b(today|tonight)\b", s):
        return base
    if re.search(r"\bsame day\b", s) and relative_to_outbound:
        return base
    if m := re.search(r"\bin\s+" + _NUM + r"\s+days?\b", s):
        n = NUMBER_WORDS.get(m[1]) or int(m[1])
        return base + timedelta(days=n)
    wd_pat = "|".join(WEEKDAYS)
    if m := re.search(r"\b(?:(next|this|following|on)\s+)?(" + wd_pat + r")\b", s):
        qual, wd = m[1], WEEKDAYS[m[2]]
        strictly = relative_to_outbound or qual in ("next", "following")
        out = _next_weekday(base, wd, strictly)
        if qual == "next" and not relative_to_outbound:
            notes.append(f"Interpreted 'next {m[2]}' as {out.isoformat()}; confirm the date.")
        return out
    abbr = "|".join(sorted(WEEKDAY_ABBR, key=len, reverse=True))
    if m := re.search(r"\b(next|this|on)\s+(" + abbr + r")\b\.?", s):
        strictly = relative_to_outbound or m[1] == "next"
        return _next_weekday(base, WEEKDAY_ABBR[m[2]], strictly)
    return None


def parse_time(seg: str) -> tuple[time | None, bool]:
    """Returns (time, ambiguous). ambiguous=True when a bare hour was given without am/pm."""
    s = seg.lower()
    if m := re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?![a-z])", s):
        h, mi = int(m[1]), int(m[2] or 0)
        if not (1 <= h <= 12) or mi > 59:
            return None, False
        pm = m[3].startswith("p")
        h = (h % 12) + (12 if pm else 0)
        return time(h, mi), False
    if re.search(r"\bnoon\b", s):
        return time(12, 0), False
    if m := re.search(r"\b([01]?\d|2[0-3]):([0-5]\d)\b", s):
        return time(int(m[1]), int(m[2])), False
    if m := re.search(r"\b([01]\d|2[0-3])([0-5]\d)\s*(?:hrs|hours|local|z)\b", s):
        return time(int(m[1]), int(m[2])), False
    if re.search(r"\bat\s+\d{1,2}\b(?!\s*(?:pax|passengers?|people|bags?))", s):
        return None, True
    return None, False


def _localize(d: date, t: time, airport: AirportRef | None, notes: list[str]) -> datetime:
    tzname = airport.timezone if airport else None
    if tzname:
        try:
            return datetime.combine(d, t, tzinfo=ZoneInfo(tzname))
        except ZoneInfoNotFoundError:
            pass
    notes.append("Airport time zone unknown; departure time treated as UTC.")
    return datetime.combine(d, t, tzinfo=UTC)


# ----------------------------------------------------------------------------- counts
def _to_int(tok: str) -> int | None:
    tok = tok.lower()
    if tok.isdigit():
        return int(tok)
    return NUMBER_WORDS.get(tok)


def _consume(pattern: str, text: str) -> tuple[int | None, str]:
    """Sum numeric captures for pattern and blank the matched spans so later patterns skip them."""
    total, hit = 0, False

    def repl(m: re.Match) -> str:
        nonlocal total, hit
        n = _to_int(m[1])
        if n is not None and n <= 50:
            total += n
            hit = True
        return " " * (m.end() - m.start())

    out = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    return (total if hit else None), out


def parse_passengers(text: str, notes: list[str]) -> int | None:
    pats = [
        r"\b" + _NUM_A + r"\s*(?:pax|passengers?|people|persons|guests|adults|travell?ers|of us)\b",
        r"\bparty of " + _NUM + r"\b",
        r"\b(?:for|with)\s+" + _NUM + r"\s+(?:of us|in total|total)\b",
    ]
    for p in pats:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            n = _to_int(m[1])
            if n is not None and 1 <= n <= 100:
                return n
    if re.search(r"\b(just me|by myself|solo|alone)\b", text, re.IGNORECASE):
        notes.append("Read 'just me' as 1 passenger.")
        return 1
    return None


def parse_bags(text: str) -> dict[str, int]:
    t = text
    golf, t = _consume(_NUM_A + r"\s*(?:sets? of\s+)?golf(?:\s*(?:bags?|clubs?|sets?))?\b", t)
    ski, t = _consume(_NUM_A + r"\s*(?:sets? of\s+)?ski(?:s|\s*bags?|\s*sets?)?\b", t)
    carry, t = _consume(_NUM_A + r"\s*carry[- ]?ons?(?:\s+bags?)?\b", t)
    checked, t = _consume(_NUM_A + r"\s*checked(?:\s+(?:bags?|suitcases?|pieces|items))?\b", t)
    generic, t = _consume(_NUM + r"\s*(?:bags?|suitcases?|pieces of (?:luggage|baggage)|luggage)\b", t)
    return {
        "checked_bags": (checked or 0) + (generic or 0),
        "carry_on_bags": carry or 0,
        "golf_bags": golf or 0,
        "ski_bags": ski or 0,
    }


# ----------------------------------------------------------------------------- main
def parse_trip_request(text: str, airports: Sequence[AirportRef], now: datetime) -> TripDraft:
    """Parse `text` into a TripDraft. `now` is timezone-aware; used for relative dates."""
    draft = TripDraft()
    by_icao = {a.icao: a for a in airports}
    text = " ".join(text.split())

    ret = RETURN_RE.search(text)
    out_text = text[: ret.start()] if ret else text
    ret_text = text[ret.start() :] if ret else ""

    mentions = _find_mentions(out_text, airports)
    ret_mentions = _find_mentions(ret_text, airports) if ret else []

    # ---- legs from airport mentions
    def pick(m: _Mention, field_name: str) -> str | None:
        if len(m.icaos) == 1:
            return m.icaos[0]
        draft.candidates[field_name] = list(m.icaos)
        return None

    legs: list[LegDraft] = []
    roles = [_role(out_text, m) for m in mentions]
    if len(mentions) >= 2:
        frm = [i for i, r in enumerate(roles) if r == "from"]
        to = [i for i, r in enumerate(roles) if r == "to"]
        if len(mentions) == 2 and frm and to and frm[0] > to[0]:
            mentions = [mentions[1], mentions[0]]
        for i in range(len(mentions) - 1):
            legs.append(
                LegDraft(pick(mentions[i], f"legs[{i}].origin_icao"), pick(mentions[i + 1], f"legs[{i}].destination_icao"))
            )
    elif len(mentions) == 1:
        r = roles[0]
        leg = LegDraft()
        if r == "to":
            leg.destination_icao = pick(mentions[0], "legs[0].destination_icao")
        elif r == "from":
            leg.origin_icao = pick(mentions[0], "legs[0].origin_icao")
        else:
            draft.notes.append("Only one airport was recognised; say whether it is the origin or the destination.")
            draft.candidates["legs[0].origin_icao"] = list(mentions[0].icaos)
        legs.append(leg)
    else:
        legs.append(LegDraft())
        draft.notes.append("No airport was recognised in the request.")

    draft.trip_type = "multi_leg" if len(legs) > 1 else "one_way"

    # ---- first departure
    base = now.astimezone(ZoneInfo(by_icao[legs[0].origin_icao].timezone)).date() if (
        legs[0].origin_icao in by_icao and by_icao[legs[0].origin_icao].timezone
    ) else now.date()
    # strip the non-date segments (route words) is unnecessary: date patterns are specific
    d0 = parse_date(out_text, base, draft.notes)
    t0, ambiguous0 = parse_time(out_text)
    legs[0].depart_date = d0
    if d0 and t0:
        legs[0].depart_at = _localize(d0, t0, by_icao.get(legs[0].origin_icao or ""), draft.notes)
    elif d0 and ambiguous0:
        draft.notes.append("Departure time is ambiguous (add am or pm).")

    # ---- return leg
    if ret:
        last = legs[-1]
        o = last.destination_icao
        d = legs[0].origin_icao
        if ret_mentions:
            m = ret_mentions[-1]
            if len(m.icaos) == 1:
                d = m.icaos[0]
            else:
                draft.candidates[f"legs[{len(legs)}].destination_icao"] = list(m.icaos)
                d = None
        ret_leg = LegDraft(o, d)
        anchor = last.depart_date or base
        rd = parse_date(ret_text, anchor, draft.notes, relative_to_outbound=True)
        rt, rambig = parse_time(ret_text)
        ret_leg.depart_date = rd
        if rd and rt:
            ret_leg.depart_at = _localize(rd, rt, by_icao.get(o or ""), draft.notes)
        elif rd and rambig:
            draft.notes.append("Return time is ambiguous (add am or pm).")
        legs.append(ret_leg)
        draft.trip_type = "round_trip" if len(legs) == 2 else "multi_leg"
    draft.legs = legs

    # ---- counts
    draft.passengers = parse_passengers(text, draft.notes)
    for k, v in parse_bags(text).items():
        setattr(draft, k, v)

    # ---- unresolved + confidence
    required: list[tuple[str, bool]] = []
    for i, leg in enumerate(legs):
        required.append((f"legs[{i}].origin_icao", leg.origin_icao is not None))
        required.append((f"legs[{i}].destination_icao", leg.destination_icao is not None))
        required.append((f"legs[{i}].depart_at", leg.depart_at is not None))
    required.append(("passengers", draft.passengers is not None))
    draft.unresolved = [name for name, ok in required if not ok]
    draft.confidence = round(sum(1 for _, ok in required if ok) / len(required), 2)
    return draft
