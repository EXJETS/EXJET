"""The single email normalizer. Used on every write and every comparison of an email address
(suppressions, operator contacts, invitations, users, inbound sender checks). Pure; no I/O."""
from __future__ import annotations

import re
import unicodedata
from email.utils import getaddresses

_SIMPLE = re.compile(r"^[^@\s<>,;:\"()\[\]\\]{1,64}@[^@\s<>,;:\"()\[\]\\]+$")


def normalize_email(addr: str | None) -> str:
    """strip, NFKC, lowercase, IDNA-encode the domain. Returns "" when the input is empty or not an address
    shaped like local@domain (callers treat "" as invalid)."""
    if not addr:
        return ""
    s = unicodedata.normalize("NFKC", addr).strip().lower()
    if s.count("@") != 1:
        return ""
    local, domain = s.split("@")
    domain = domain.rstrip(".")
    if not local or not domain:
        return ""
    try:
        domain = domain.encode("idna").decode("ascii")
    except UnicodeError:
        return ""
    out = f"{local}@{domain}"
    return out if _SIMPLE.match(out) else ""


def parse_single_address(header: str | None) -> str | None:
    """Strictly parse a From-style header into exactly one normalized address, else None.

    Rejects: empty values, several addresses, unbalanced angle brackets (`x@a.test <b@c.test`), group syntax,
    anything the stdlib strict parser refuses, and any address that normalize_email() does not accept."""
    if not header or len(header) > 998:
        return None
    if header.count("<") != header.count(">") or header.count("<") > 1:
        return None
    try:
        found = getaddresses([header], strict=True)
    except Exception:  # noqa: BLE001 - the stdlib raises several types on garbage input
        return None
    if len(found) != 1:
        return None
    _, addr = found[0]
    norm = normalize_email(addr)
    if not norm:
        return None
    # a display name that itself contains an address ("ops@a.test" <x@b.test>) is a classic spoof
    display = found[0][0]
    if "@" in display:
        return None
    return norm
