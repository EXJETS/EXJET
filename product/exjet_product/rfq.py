"""RFQ references and email bodies. Plain, professional, no emojis, no prices."""
from __future__ import annotations

import re
import secrets
from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no 0/O/1/I/L
REFERENCE_RE = re.compile(r"\bEXJ-([A-HJKMNP-Z2-9]{6})\b")
MAX_FREE_TEXT = 500
LINK_REMOVED = "[link removed]"
EMAIL_REMOVED = "[email removed]"


def generate_reference() -> str:
    return "EXJ-" + "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(6))


def extract_reference(text: str | None) -> str | None:
    if not text:
        return None
    m = REFERENCE_RE.search(text.upper())
    return f"EXJ-{m.group(1)}" if m else None


_OBFUSCATED_DOT = re.compile(r"\s*[\[\(\{]\s*(?:\.|dot)\s*[\]\)\}]\s*", re.IGNORECASE)
_OBFUSCATED_AT = re.compile(r"\s*[\[\(\{]\s*(?:@|at)\s*[\]\)\}]\s*", re.IGNORECASE)
_URL = re.compile(
    r"(?:\b(?:https?|ftp|hxxps?)://|\bwww\.)[^\s<>\"']+"  # scheme or www
    r"|\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}\b(?::\d+)?(?:/[^\s<>\"']*)?",  # bare domain, optional path
    re.IGNORECASE,
)
_EMAIL = re.compile(r"[\w.+'\-]+@[\w\-]+(?:\.[\w\-]+)*", re.IGNORECASE)


def defang(s: str) -> str:
    """Remove URLs, bare domains and email addresses from member-supplied text (also in obfuscated forms such as
    `example[.]com` or `hxxp://`). The recipient never receives a clickable destination chosen by the member."""
    s = _OBFUSCATED_AT.sub("@", _OBFUSCATED_DOT.sub(".", s))
    s = _EMAIL.sub(EMAIL_REMOVED, s)
    return _URL.sub(LINK_REMOVED, s)


def clean_free_text(s: str | None, limit: int = MAX_FREE_TEXT) -> str:
    """Member-supplied text goes into an email to a third party: drop control characters, remove URLs and email
    addresses, collapse whitespace and cap the length (500)."""
    if not s:
        return ""
    s = "".join(ch for ch in s if ch == "\n" or (ch.isprintable() and ord(ch) < 0x10000))
    return " ".join(defang(s).split())[:limit]


MEMBER_TEXT_NOTICE = "(written by the member, not by EXJET; unverified, links and addresses removed)"


@dataclass(frozen=True)
class RfqLeg:
    origin_icao: str
    origin_name: str
    destination_icao: str
    destination_name: str
    depart_at: datetime
    timezone: str | None = None


@dataclass(frozen=True)
class RfqContext:
    reference: str
    legs: tuple[RfqLeg, ...]
    passengers: int
    checked_bags: int
    carry_on_bags: int
    golf_bags: int
    ski_bags: int
    member_name: str
    aircraft_type: str | None = None
    empty_leg_window: tuple[datetime, datetime] | None = None
    notes: str | None = None


def _fmt_dt(dt: datetime, tz: str | None) -> str:
    try:
        local = dt.astimezone(ZoneInfo(tz)) if tz else dt
    except ZoneInfoNotFoundError:
        local = dt
    label = local.tzname() or "UTC"
    return f"{local:%A, %B} {local.day}, {local:%Y} at {local:%H:%M} {label}"


def _bags_line(c: RfqContext) -> str:
    parts = []
    for n, label in ((c.checked_bags, "checked bag"), (c.carry_on_bags, "carry-on bag"),
                     (c.golf_bags, "golf bag"), (c.ski_bags, "ski bag")):
        if n:
            parts.append(f"{n} {label}{'s' if n != 1 else ''}")
    return ", ".join(parts) if parts else "No baggage declared"


def build_rfq_email(c: RfqContext) -> tuple[str, str]:
    first, last = c.legs[0], c.legs[-1]
    subject = f"[{c.reference}] Charter request: {first.origin_icao} to {last.destination_icao}"
    lines = [
        "Hello,",
        "",
        "EXJET is a private jet charter marketplace. On behalf of one of our verified members, "
        "we would like to request availability and a quote for the following trip.",
        "",
        f"Reference: {c.reference}",
    ]
    if c.aircraft_type:
        lines.append(f"Aircraft: {c.aircraft_type}")
    lines.append("")
    for i, leg in enumerate(c.legs, start=1):
        lines.append(
            f"Leg {i}: {leg.origin_name} ({leg.origin_icao}) to {leg.destination_name} ({leg.destination_icao}), "
            f"departing {_fmt_dt(leg.depart_at, leg.timezone)}"
        )
    lines += [
        "",
        f"Passengers: {c.passengers}",
        f"Baggage: {_bags_line(c)}",
    ]
    if c.empty_leg_window:
        a, b = c.empty_leg_window
        lines.append(f"Empty leg window you listed: {a:%Y-%m-%d %H:%M} to {b:%Y-%m-%d %H:%M} UTC")
    if c.notes:
        lines += ["", f"Member-provided note {MEMBER_TEXT_NOTICE}: {clean_free_text(c.notes)}"]
    lines += [
        "",
        "If you can operate this trip, please reply to this email and keep the reference "
        f"{c.reference} in the subject line. Your reply should include:",
        "",
        "1. A quote as a PDF, stating the total amount and what it includes.",
        f"2. Your charter agreement as a PDF, issued in the member's name: {clean_free_text(c.member_name)}.",
        "3. Your own payment link. The member pays you directly; EXJET does not collect or process flight payments.",
        "",
        "If you are unable to operate this trip, a short reply saying so is appreciated.",
        "",
        "Thank you,",
        "EXJET Charter Desk",
        "quotes@exjet.com",
    ]
    return subject, "\n".join(lines)


@dataclass(frozen=True)
class GroundRfqContext:
    reference: str
    kind: str  # rental_car | chauffeur
    airport_icao: str
    airport_name: str
    when: datetime
    timezone: str | None
    fbo_name: str
    member_name: str
    details: str | None = None


def build_ground_rfq_email(c: GroundRfqContext) -> tuple[str, str]:
    label = "Rental car" if c.kind == "rental_car" else "Chauffeur"
    subject = f"[{c.reference}] {label} request at {c.airport_icao}"
    lines = [
        f"Hello {clean_free_text(c.fbo_name)},",
        "",
        f"EXJET is arranging ground transportation for a verified member. We would like a quote for a "
        f"{label.lower()} at {c.airport_name} ({c.airport_icao}) on {_fmt_dt(c.when, c.timezone)}.",
        "",
        f"Reference: {c.reference}",
    ]
    if c.details:
        lines += [f"Member-provided details {MEMBER_TEXT_NOTICE}: {clean_free_text(c.details)}"]
    lines += [
        "",
        f"Please reply with a quote as a PDF, any agreement issued in the member's name "
        f"({clean_free_text(c.member_name)}), and your own payment link, keeping {c.reference} in the subject.",
        "",
        "Thank you,",
        "EXJET Charter Desk",
        "quotes@exjet.com",
    ]
    return subject, "\n".join(lines)
