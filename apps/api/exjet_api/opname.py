"""The one operator-name normalizer and exclusion matcher (guardrail 3).

Used by BOTH the ingest layer (ingest/normalize.excluded_match) and the supply layer (supply.py, including the
SQL filter), so the two can never disagree about what an excluded name looks like.

normalize_operator_name(): NFKD, strip accents and format characters (zero-width joiners etc.), casefold, fold
common Cyrillic / Greek lookalikes and fullwidth forms to ASCII, turn punctuation into single spaces and drop
corporate suffixes ("inc", "llc"...). The result is a space separated token string.

Matching: a target such as "Nicholas Air" matches when its letters, ignoring spaces, equal a run of whole tokens
of the name ("Nicholas Air Charter", "NicholasAir", "N.i.c.h.o.l.a.s A i r"), or, for targets of 7+ characters,
when a token starts with it ("NetJetsAviation"). "Nicholas Aircraft Services" and "Net Zero Air" do not match.
"""
from __future__ import annotations

import re
import unicodedata
from collections.abc import Iterable

CORP_SUFFIXES = frozenset({
    "inc", "incorporated", "llc", "ltd", "limited", "corp", "corporation", "co", "company", "lp", "llp", "lc", "plc",
    "gmbh", "sa", "sarl", "pllc",
})

# Lowercase lookalikes -> ASCII. Applied after casefold, so capitals are covered.
_CONFUSABLES = {
    # Cyrillic
    "а": "a", "в": "b", "е": "e", "ё": "e", "з": "3", "к": "k", "м": "m", "н": "h", "о": "o", "р": "p", "с": "c",
    "т": "t", "у": "y", "х": "x", "і": "i", "ї": "i", "ј": "j", "ѕ": "s", "ԁ": "d", "һ": "h", "ԛ": "q", "ԝ": "w",
    "ь": "b", "ѵ": "v", "ӏ": "l", "ο": "o",
    # Greek
    "α": "a", "β": "b", "γ": "y", "ε": "e", "ζ": "z", "η": "n", "ι": "i", "κ": "k", "μ": "u", "ν": "v", "ρ": "p",
    "τ": "t", "υ": "u", "χ": "x", "ω": "w",
    # Latin lookalikes that survive NFKD
    "ı": "i", "ɡ": "g", "ɑ": "a", "ƒ": "f", "ʟ": "l", "ᴀ": "a", "ʙ": "b", "ᴄ": "c", "ᴅ": "d", "ᴇ": "e", "ɢ": "g",
    "ʜ": "h", "ɪ": "i", "ᴊ": "j", "ᴋ": "k", "ᴍ": "m", "ɴ": "n", "ᴏ": "o", "ᴘ": "p", "ʀ": "r", "ꜱ": "s", "ᴛ": "t",
    "ᴜ": "u", "ᴠ": "v", "ᴡ": "w", "ʏ": "y", "ᴢ": "z", "ø": "o", "đ": "d", "ł": "l", "ħ": "h",
}
_CONF_TABLE = str.maketrans(_CONFUSABLES)
_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def normalize_operator_name(value: str | None) -> str:
    """Space separated lowercase ASCII tokens, corporate suffixes removed. "" for empty input."""
    if not value:
        return ""
    s = unicodedata.normalize("NFKD", value)
    s = "".join(c for c in s if not unicodedata.combining(c) and unicodedata.category(c) not in ("Cf", "Cc"))
    s = s.casefold().translate(_CONF_TABLE)
    s = unicodedata.normalize("NFKD", s)  # confusable targets such as "ø" may leave marks
    s = "".join(c for c in s if not unicodedata.combining(c))
    tokens = _NON_ALNUM.sub(" ", s).split()
    while len(tokens) > 1 and tokens[-1] in CORP_SUFFIXES:
        tokens.pop()
    return " ".join(tokens)


def compact_target(target: str | None) -> str:
    return normalize_operator_name(target).replace(" ", "")


def _matches_target(tokens: list[str], target: str) -> bool:
    for i in range(len(tokens)):
        acc = ""
        for j in range(i, len(tokens)):
            acc += tokens[j]
            if acc == target:
                return True
            if len(acc) > len(target):
                break
    return len(target) >= 7 and any(t.startswith(target) for t in tokens)


def match_excluded_name(name: str | None, targets: Iterable[str]) -> str | None:
    """The target (as supplied) that `name` matches, else None."""
    tokens = normalize_operator_name(name).split()
    if not tokens:
        return None
    for raw in targets:
        t = compact_target(raw)
        if t and _matches_target(tokens, t):
            return raw
    return None


def excluded_sql_regex(target: str) -> str | None:
    """POSIX regex equivalent of _matches_target, to run against a column holding normalize_operator_name()
    output. Lets the database filter agree exactly with the Python matcher."""
    t = compact_target(target)
    if not t:
        return None
    spaced = " ?".join(re.escape(ch) for ch in t)  # tokens may split the target anywhere...
    whole = f"(^| ){spaced}( |$)"  # ...but the run must start and end on token boundaries
    return f"{whole}|(^| ){re.escape(t)}" if len(t) >= 7 else whole  # 7+: a token may merely start with it


def normalize_certificate(value: str | None) -> str:
    return re.sub(r"[^A-Z0-9]", "", (value or "").upper())


def excluded_certificate_set(csv: str) -> set[str]:
    return {c for c in (normalize_certificate(p) for p in csv.split(",")) if c}


def split_csv(csv: str) -> list[str]:
    return [p.strip() for p in csv.split(",") if p.strip()]
