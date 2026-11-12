"""Tiny PDF builder for tests (reportlab)."""
from __future__ import annotations

import io

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def make_pdf(pages: list[list[str]], links: list[tuple[str, str]] | None = None) -> bytes:
    """pages: lines per page. links: (text, url) drawn as clickable annotations on page 1."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    for pi, lines in enumerate(pages):
        y = 740
        for line in lines:
            c.drawString(60, y, line)
            y -= 18
        if pi == 0:
            for text, url in links or []:
                c.drawString(60, y, text)
                c.linkURL(url, (60, y - 2, 60 + 6 * len(text), y + 12))
                y -= 18
        c.showPage()
    c.save()
    return buf.getvalue()


def blank_pdf() -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.rect(50, 50, 100, 100)  # no text at all (like a scan)
    c.showPage()
    c.save()
    return buf.getvalue()


QUOTE_LINES = [
    "SYNTHETIC Test Operator A",
    "Charter Quotation",
    "Quote No: Q-2026-0042",
    "Valid until: November 20, 2026",
    "Teterboro (KTEB) to Van Nuys (KVNY)",
    "Aircraft charter ........ $38,000.00",
    "Fuel surcharge ........ $4,200.00",
    "Landing and handling ........ $3,000.00",
    "Subtotal: $45,200.00",
    "Total Charter Cost: $45,200.00",
]
