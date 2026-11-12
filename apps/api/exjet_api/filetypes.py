"""Server-side file type decisions. The content type of a stored file is what WE sniff from its bytes, never what
the uploader or an email header claims, and only allowlisted types are stored (H1)."""
from __future__ import annotations

import re

_SIGNATURES = [(b"%PDF-", "application/pdf"), (b"\xff\xd8\xff", "image/jpeg"), (b"\x89PNG\r\n\x1a\n", "image/png")]

KYC_TYPES = frozenset({"application/pdf", "image/jpeg", "image/png"})
OPERATOR_DOC_TYPES = frozenset({"application/pdf"})  # quotes and contracts from operators


def sniff(data: bytes) -> str | None:
    """image/jpeg, image/png or application/pdf judged by magic bytes; None for anything else (HTML, SVG, scripts...)."""
    for sig, t in _SIGNATURES:
        if data.startswith(sig):  # PDF readers tolerate leading junk; we do not store such files as PDF
            return t
    return None


_ASCII_SAFE = re.compile(r"[^A-Za-z0-9._-]")


def content_disposition(filename: str) -> str:
    """RFC 6266 / 5987 attachment header. ASCII fallback plus UTF-8 percent-encoded filename*."""
    from urllib.parse import quote

    base = filename.replace("\\", "/").split("/")[-1]
    ascii_name = _ASCII_SAFE.sub("_", base)[:120] or "file"
    out = f'attachment; filename="{ascii_name}"'
    if ascii_name != base:
        out += f"; filename*=UTF-8''{quote(base[:120], safe='')}"
    return out


# Headers every served file carries. The CSP sandbox makes a stored active document inert even if a browser
# were to render it; Content-Disposition forces a download; nosniff stops type guessing.
FILE_RESPONSE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox; default-src 'none'",
    "Cache-Control": "private, no-store",
    "Cross-Origin-Resource-Policy": "same-origin",
}
