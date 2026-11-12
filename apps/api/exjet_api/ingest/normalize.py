"""Pure normalisation helpers. No I/O, no database. Every function is deterministic."""

from __future__ import annotations

import re
import unicodedata
from collections.abc import Iterable
from datetime import date, datetime
from typing import Any

RATING_VALUES = ("Not rated", "Gold", "Gold+", "Platinum", "Platinum+")
CERT_TYPES = ("135", "121", "foreign")

_WS = re.compile(r"\s+")
_NON_ALNUM = re.compile(r"[^a-z0-9]+")
_CORP_SUFFIXES = {
    "inc",
    "incorporated",
    "llc",
    "ltd",
    "limited",
    "corp",
    "corporation",
    "co",
    "company",
    "lp",
    "llp",
    "lc",
    "plc",
}


def clean(value: Any) -> str | None:
    """Trim, collapse whitespace, None for blank. Numbers and dates become strings."""
    if value is None:
        return None
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, float):
        value = str(int(value)) if value.is_integer() else repr(value)
    elif isinstance(value, datetime):
        value = value.date().isoformat() if value.time() == datetime.min.time() else value.isoformat()
    elif isinstance(value, date):
        value = value.isoformat()
    s = _WS.sub(" ", str(value).replace(" ", " ")).strip()
    return s or None


def fold(value: str | None) -> str:
    """Lowercase, accent-stripped, punctuation to single spaces."""
    if not value:
        return ""
    s = unicodedata.normalize("NFKD", value)
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    return _NON_ALNUM.sub(" ", s).strip()


def compact(value: str | None) -> str:
    return fold(value).replace(" ", "")


def name_key(value: str | None) -> str:
    """Dedupe key for an operator name: folded, trailing corporate suffixes dropped."""
    tokens = fold((value or "").replace(".", "")).split()
    while len(tokens) > 1 and tokens[-1] in _CORP_SUFFIXES:
        tokens.pop()
    return " ".join(tokens)


# ----------------------------------------------------------------------------- exclusions
def excluded_match(name: str | None, excluded: Iterable[str]) -> str | None:
    """Return the excluded operator a name matches, else None.

    Case, spacing and punctuation are ignored. "Net Jets", "NetJets Aviation Inc", "FLEXJET, LLC" and
    "Nicholas-Air Inc" all match; "Nicholas Aircraft Services" does not (token boundary respected).
    """
    tokens = fold(name).split()
    if not tokens:
        return None
    for ex in excluded:
        target = compact(ex)
        if not target:
            continue
        for i in range(len(tokens)):
            acc = ""
            for j in range(i, len(tokens)):
                acc += tokens[j]
                if acc == target:
                    return ex
                if len(acc) > len(target):
                    break
        if len(target) >= 7 and any(t.startswith(target) for t in tokens):
            return ex
    return None


# ----------------------------------------------------------------------------- identifiers
_US_TAIL = re.compile(r"^N(?:[1-9]\d{0,4}|[1-9]\d{0,3}[A-HJ-NP-Z]|[1-9]\d{0,2}[A-HJ-NP-Z]{2})$")
_TAIL_CHARS = re.compile(r"^[A-Z0-9-]{2,12}$")


def normalize_tail(value: str | None) -> str | None:
    s = clean(value)
    if not s:
        return None
    s = s.upper().replace(" ", "")
    if s.startswith("N-"):
        s = "N" + s[2:]
    return s


def is_valid_tail_chars(tail: str) -> bool:
    return bool(_TAIL_CHARS.match(tail))


def is_us_tail(tail: str) -> bool:
    """FAA N-number format: N + 1-5 digits (first non-zero), optionally ending in up to two letters (no I or O)."""
    return bool(_US_TAIL.match(tail))


def normalize_certificate(value: str | None) -> str | None:
    s = clean(value)
    return s.upper() if s else None


_ICAO = re.compile(r"^[A-Z]{4}$")


def normalize_icao(value: str | None) -> str | None:
    s = clean(value)
    return s.upper() if s else None


def is_valid_icao(value: str) -> bool:
    return bool(_ICAO.match(value))


# ----------------------------------------------------------------------------- email / phone
_EMAIL = re.compile(
    r"^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*"
    r"@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$"
)
_ANGLE = re.compile(r"<([^<>]+)>")


def normalize_email(value: str | None) -> tuple[str | None, bool]:
    """Return (lowercased email or None, valid). Blank input returns (None, True): blank is not invalid."""
    s = clean(value)
    if not s:
        return None, True
    m = _ANGLE.search(s)
    if m:
        s = m.group(1)
    s = s.strip().lower()
    s = s.removeprefix("mailto:")
    if len(s) <= 320 and _EMAIL.match(s):
        return s, True
    return None, False


def mask_email(value: str | None) -> str:
    """For reports: first character of the local part and the domain. Never the full address."""
    if not value:
        return ""
    if "@" in value:
        local, _, domain = value.partition("@")
        return f"{local[:1]}***@{domain}"
    return f"{value[:1]}***"


_EXT = re.compile(r"(ext|x|#)", re.IGNORECASE)


def normalize_phone(value: str | None) -> tuple[str | None, bool]:
    """Return (value, parsed). E.164 when unambiguous (NANP 10/11 digits, or explicit +country code with
    8-15 digits). Otherwise the trimmed original is returned with parsed=False so nothing is lost or guessed."""
    s = clean(value)
    if not s:
        return None, True
    digits = re.sub(r"\D", "", s)
    if not _EXT.search(s):
        if s.startswith("+"):
            if 8 <= len(digits) <= 15 and not (digits.startswith("1") and len(digits) != 11):
                return "+" + digits, True
        elif len(digits) == 10 and digits[0] in "23456789" and digits[3] in "23456789":
            return "+1" + digits, True
        elif len(digits) == 11 and digits[0] == "1" and digits[1] in "23456789" and digits[4] in "23456789":
            return "+" + digits, True
    return (s if len(s) <= 40 else None), False


# ----------------------------------------------------------------------------- enumerations
def normalize_certificate_type(value: str | None) -> str | None:
    s = fold(value)
    if not s:
        return None
    if re.search(r"\b(foreign|non us|international|icao|129)\b", s):
        return "foreign"
    if re.search(r"\b135\b", s):
        return "135"
    if re.search(r"\b121\b", s):
        return "121"
    return None


_RATING_FILLER = {"rating", "rated", "level", "status", "tier", "safety", "operator", "certified"}
_NOT_RATED = {"", "not", "none", "na", "n a", "unrated", "no rating", "nr", "not rated"}


def normalize_rating(
    value: str | None, source_tokens: Iterable[str] = (), aliases: dict[str, str] | None = None
) -> tuple[str | None, bool]:
    """Map a raw rating string to exactly one of RATING_VALUES.

    Returns (value, known). Blank input returns (None, True) meaning "no information". Anything that
    cannot be mapped returns ("Not rated", False) so the caller flags it. The rating source (vendor
    words) is discarded here and never returned.
    """
    s = clean(value)
    if not s:
        return None, True
    text = s.lower().replace("+", " plus ")
    for tok in sorted(source_tokens, key=len, reverse=True):
        t = tok.lower().strip()
        if t:
            text = re.sub(rf"(?<![a-z0-9]){re.escape(t)}(?![a-z0-9])", " ", text)
    tokens = [t for t in fold(text).split() if t not in _RATING_FILLER]
    joined = " ".join(tokens)
    if joined in _NOT_RATED or joined == "not rated":
        return "Not rated", True
    if aliases and joined in aliases:
        return aliases[joined], True
    plus = "plus" in tokens
    base = [t for t in tokens if t != "plus"]
    if base == ["platinum"]:
        return ("Platinum+" if plus else "Platinum"), True
    if base == ["gold"]:
        return ("Gold+" if plus else "Gold"), True
    return "Not rated", False


_CATEGORY_ALIASES = {
    "turboprop": "turboprop",
    "turbo prop": "turboprop",
    "very light": "very_light",
    "very light jet": "very_light",
    "vlj": "very_light",
    "entry level": "very_light",
    "light": "light",
    "light jet": "light",
    "midsize": "midsize",
    "mid size": "midsize",
    "midsize jet": "midsize",
    "mid size jet": "midsize",
    "super midsize": "super_midsize",
    "super mid size": "super_midsize",
    "super midsize jet": "super_midsize",
    "heavy": "heavy",
    "heavy jet": "heavy",
    "large": "heavy",
    "ultra long range": "ultra_long_range",
    "ulr": "ultra_long_range",
    "airliner": "airliner",
    "vip airliner": "airliner",
}


def normalize_category(value: str | None) -> str | None:
    return _CATEGORY_ALIASES.get(fold(value))


def parse_bool(value: str | None) -> bool | None:
    s = fold(value)
    if s in {"y", "yes", "true", "1", "t"}:
        return True
    if s in {"n", "no", "false", "0", "f"}:
        return False
    return None


def parse_int(value: str | None) -> int | None:
    s = clean(value)
    if s is None:
        return None
    s = s.replace(",", "")
    try:
        f = float(s)
    except ValueError:
        return None
    return int(f) if f.is_integer() else None


def parse_float(value: str | None) -> float | None:
    s = clean(value)
    if s is None:
        return None
    try:
        return float(s.replace(",", ""))
    except ValueError:
        return None


def slugify(value: str) -> str:
    return fold(value).replace(" ", "-")


def type_key(manufacturer: str | None, model: str | None) -> str:
    return f"{compact(manufacturer)}|{compact(model)}"
