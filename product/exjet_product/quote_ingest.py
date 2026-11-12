"""Quote document analysis: PDF text, classification, rules extraction, verification.

Hard rule (ARCHITECTURE guardrail 2): the parser never invents a number. A total is accepted only
if it is read from the document text; if it cannot be read unambiguously, `total_cents` is None and
the quote needs human review. Any figure from another source (an LLM) must pass `amount_in_text`.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation
from urllib.parse import urlsplit

from .pdf_safe import PdfExtract, PdfLimitError, extract_bounded  # noqa: F401  (PdfLimitError is re-exported)

READY_THRESHOLD = 0.8

DOC_QUOTE = "quote"
DOC_CONTRACT = "contract"
DOC_OTHER = "other"

MONEY_RE = re.compile(r"(?:(\$)\s*|\bUSD\s*)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?(?!\d)|(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})(?!\d)")
SUBTOTAL_RE = re.compile(r"sub[\s-]*total", re.IGNORECASE)
TOTAL_LABELS: list[tuple[int, re.Pattern]] = [
    (3, re.compile(r"\b(?:grand\s+total|total\s+due|amount\s+due|total\s+amount\s+due)\b", re.IGNORECASE)),
    (2, re.compile(r"\b(?:total\s+(?:charter\s+)?(?:price|amount|cost|quote|fare|charter)|quote\s+total|total\s+charter\s+cost)\b", re.IGNORECASE)),
    (1, re.compile(r"\btotal\b(?!\s+(?:tax|taxes|fees?|flight|time|passengers?|pax|distance|miles|hours))", re.IGNORECASE)),
]
NON_USD = [("EUR", re.compile(r"€|\bEUR\b")), ("GBP", re.compile(r"£|\bGBP\b")), ("CAD", re.compile(r"\bCAD\b|\bC\$")),
           ("MXN", re.compile(r"\bMXN\b"))]


@dataclass
class LineItem:
    description: str
    amount_cents: int
    page: int


@dataclass
class QuoteExtraction:
    total_cents: int | None = None
    currency: str = "USD"
    valid_until: datetime | None = None
    quote_number: str | None = None
    line_items: list[LineItem] = field(default_factory=list)
    confidence: float = 0.0
    flags: list[str] = field(default_factory=list)
    parser: str = "rules"
    total_page: int | None = None

    @property
    def ready(self) -> bool:
        return self.total_cents is not None and self.confidence >= READY_THRESHOLD and not self.flags_blocking

    @property
    def flags_blocking(self) -> bool:
        return any(f in ("non_usd_currency", "ambiguous_total", "total_not_found") for f in self.flags)

    def to_json(self) -> dict:
        return {
            "line_items": [{"description": i.description, "amount_cents": i.amount_cents, "page": i.page} for i in self.line_items],
            "total_page": self.total_page,
            "flags": list(self.flags),
        }


@dataclass
class PaymentLinkFound:
    url: str
    host: str


@dataclass
class DocumentAnalysis:
    doc_type: str
    pages: list[str]
    extraction: QuoteExtraction | None
    links: list[str]
    contracting_party: str | None = None


# ----------------------------------------------------------------------------- PDF
def extract_pdf(data: bytes, **limits) -> PdfExtract:
    """Pages and link annotations from ONE bounded parse in a resource-limited subprocess (see pdf_safe).
    Raises PdfLimitError on a size/page/text/time/memory breach; a corrupt PDF yields empty pages."""
    return extract_bounded(data, **limits)


def extract_pdf_pages(data: bytes, **limits) -> list[str]:
    return extract_pdf(data, **limits).pages


# ----------------------------------------------------------------------------- money
def parse_money_match(m: re.Match) -> int | None:
    try:
        if m.group(4) is not None:
            whole, cents = m.group(4), m.group(5)
        else:
            whole, cents = m.group(2), m.group(3) or "0"
        cents = (cents + "0")[:2]
        return int((Decimal(whole.replace(",", "")) * 100).to_integral_value()) + int(cents)
    except (InvalidOperation, ValueError):
        return None


def amount_renderings(cents: int) -> list[str]:
    dollars, c = divmod(cents, 100)
    out = [f"{dollars:,}.{c:02d}", f"{dollars}.{c:02d}"]
    if c == 0:
        out += [f"{dollars:,}", f"{dollars}"]
    return out


def amount_in_text(cents: int, text: str) -> bool:
    """True if the amount appears verbatim (any common rendering) in the document text."""
    for r in amount_renderings(cents):
        if re.search(r"(?<![\d,.])" + re.escape(r) + r"(?![\d,]|\.\d)", text):
            return True
    return False


# ----------------------------------------------------------------------------- classification
_CONTRACT_WORDS = [
    (3, r"charter agreement|aircraft charter agreement|charter contract"), (2, r"terms and conditions"),
    (2, r"\bcharterer\b"), (2, r"governing law"), (2, r"indemnif"), (1, r"\bhereby\b"), (1, r"\bparties\b"),
    (1, r"signature"), (1, r"\bagreement\b"),
]
_QUOTE_WORDS = [
    (3, r"\bquotation\b"), (2, r"\bquote\b"), (2, r"\bproposal\b"), (1, r"\btotal\b"), (1, r"\bestimate\b"),
    (2, r"valid (?:until|through)"), (1, r"\bitinerary\b"),
]


def classify_document(pages: list[str], filename: str = "") -> str:
    text = "\n".join(pages).lower()
    fn = filename.lower()
    c = sum(w for w, p in _CONTRACT_WORDS if re.search(p, text))
    q = sum(w for w, p in _QUOTE_WORDS if re.search(p, text))
    if re.search(r"contract|agreement|terms", fn):
        c += 2
    if re.search(r"quote|quotation|proposal", fn):
        q += 2
    if c >= 3 and c > q:
        return DOC_CONTRACT
    if q >= 2:
        return DOC_QUOTE
    if c >= 3:
        return DOC_CONTRACT
    return DOC_OTHER


# ----------------------------------------------------------------------------- extraction
_DATE_PATTERNS = [
    (re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b"), "iso"),
    (re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b"), "us"),
    (re.compile(r"\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b"), "long"),
]
_MONTHS = {m: i for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], 1)}


def _parse_date(s: str) -> datetime | None:
    for rx, kind in _DATE_PATTERNS:
        m = rx.search(s)
        if not m:
            continue
        try:
            if kind == "iso":
                y, mo, d = int(m[1]), int(m[2]), int(m[3])
            elif kind == "us":
                mo, d, y = int(m[1]), int(m[2]), int(m[3])
            else:
                name = m[1].lower()
                mo = next((v for k, v in _MONTHS.items() if k.startswith(name[:3]) and len(name) >= 3), None)
                if mo is None:
                    continue
                d, y = int(m[2]), int(m[3])
            return datetime(y, mo, d, 23, 59, 59, tzinfo=UTC)
        except ValueError:
            continue
    return None


def extract_quote(pages: list[str]) -> QuoteExtraction:
    ex = QuoteExtraction()
    full = "\n".join(pages)
    if len(full.strip()) < 20:
        ex.flags += ["no_text_layer", "total_not_found"]
        return ex

    # currency
    for code, rx in NON_USD:
        if rx.search(full):
            ex.currency = code
            ex.flags.append("non_usd_currency")
            break

    # totals
    cands: list[tuple[int, int, int, int]] = []  # (priority, cents, page, line_no)
    for pi, page in enumerate(pages, start=1):
        for li, line in enumerate(page.splitlines()):
            if SUBTOTAL_RE.search(line):
                continue
            prio = next((p for p, rx in TOTAL_LABELS if rx.search(line)), 0)
            if not prio:
                continue
            label_end = max((rx.search(line).end() for p, rx in TOTAL_LABELS if rx.search(line)), default=0)
            m = MONEY_RE.search(line, label_end)
            if m:
                cents = parse_money_match(m)
                if cents is not None and cents > 0:
                    cands.append((prio, cents, pi, li))
    if not cands:
        ex.flags.append("total_not_found")
    else:
        top = max(c[0] for c in cands)
        top_vals = {c[1] for c in cands if c[0] == top}
        if len(top_vals) > 1:
            ex.flags.append("ambiguous_total")
        else:
            best = next(c for c in cands if c[0] == top)
            ex.total_cents, ex.total_page = best[1], best[2]
            if any(c[1] != best[1] for c in cands):
                ex.flags.append("multiple_distinct_totals")

    # line items
    for pi, page in enumerate(pages, start=1):
        for line in page.splitlines():
            if SUBTOTAL_RE.search(line) or any(rx.search(line) for _, rx in TOTAL_LABELS):
                continue
            m = MONEY_RE.search(line)
            if not m:
                continue
            desc = re.sub(r"[\s.:\-_]+$", "", line[: m.start()]).strip()
            cents = parse_money_match(m)
            if cents is None or len(re.findall(r"[A-Za-z]", desc)) < 3:
                continue
            if re.search(r"\b(valid|expires?|deposit due|invoice)\b", desc, re.IGNORECASE):
                continue
            if amount_in_text(cents, full) and len(ex.line_items) < 40:
                ex.line_items.append(LineItem(desc[:160], cents, pi))

    # verification: nothing may be reported that is not in the text
    if ex.total_cents is not None and not amount_in_text(ex.total_cents, full):
        ex.total_cents = None
        ex.flags.append("total_not_verified")

    # metadata
    if m := re.search(r"(?:valid\s+(?:until|through)|expires?(?:\s+on)?|expiration(?:\s+date)?|offer\s+valid\s+(?:until|through))\s*[:\-]?\s*(.{0,40})", full, re.IGNORECASE):
        ex.valid_until = _parse_date(m[1])
    if m := re.search(r"(?:quote|quotation|proposal|estimate)\s*(?:no\.?|number|#|id)\s*[:#]?\s*([A-Z0-9][A-Z0-9\-]{2,30})", full, re.IGNORECASE):
        ex.quote_number = m[1].upper()

    # confidence
    if ex.total_cents is None:
        ex.confidence = 0.0
    else:
        conf = 0.95
        if "multiple_distinct_totals" in ex.flags:
            conf = 0.7
        if "non_usd_currency" in ex.flags:
            conf = min(conf, 0.5)
        if ex.line_items:
            s = sum(i.amount_cents for i in ex.line_items)
            if s != ex.total_cents:
                ex.flags.append("line_items_do_not_sum_to_total")
                conf -= 0.2
        ex.confidence = round(max(conf, 0.0), 2)
    return ex


def verify_llm_extraction(data: dict, pages: list[str], model: str) -> QuoteExtraction | None:
    """Accept LLM output only if every amount appears verbatim in the PDF text. Else None."""
    full = "\n".join(pages)
    try:
        total = int(data["total_amount_cents"])
    except (KeyError, TypeError, ValueError):
        return None
    if total <= 0 or not amount_in_text(total, full):
        return None
    ex = QuoteExtraction(total_cents=total, parser=f"llm:{model}"[:32], confidence=0.85)
    cur = str(data.get("currency") or "USD").upper()
    ex.currency = cur if re.fullmatch(r"[A-Z]{3}", cur) else "USD"
    if ex.currency != "USD":
        ex.flags.append("non_usd_currency")
        ex.confidence = 0.5
    qn = data.get("operator_quote_number")
    if isinstance(qn, str) and qn and qn.upper() in full.upper():
        ex.quote_number = qn.upper()[:64]
    for item in data.get("line_items") or []:
        try:
            amt = int(item["amount_cents"])
            if amount_in_text(amt, full):
                ex.line_items.append(LineItem(str(item.get("description", ""))[:160], amt, int(item.get("page", 1))))
        except (KeyError, TypeError, ValueError):
            continue
    vu = data.get("valid_until")
    if isinstance(vu, str) and vu in full:
        ex.valid_until = _parse_date(vu)
    return ex


# ----------------------------------------------------------------------------- links
_URL_RE = re.compile(r"https?://[^\s<>\"'\)\]]+", re.IGNORECASE)
PAYMENT_HOST_HINTS = ("paynode", "stripe.com", "square.link", "squareup.com", "paypal.", "authorize.net", "checkout.", "pay.", "payments.", "invoice")
PAYMENT_PATH_HINTS = ("pay", "checkout", "invoice", "bill")


def find_payment_link(texts: list[str], extra_urls: list[str] | None = None) -> PaymentLinkFound | None:
    """Pick the URL that looks like the operator's payment link. Only https; no embedded credentials."""
    best: tuple[int, int, str] | None = None
    order = 0
    candidates: list[tuple[str, str]] = []  # (url, context)
    for t in texts:
        lines = t.splitlines()
        for i, line in enumerate(lines):
            ctx = line + " " + (lines[i - 1] if i else "")
            for m in _URL_RE.finditer(line):
                candidates.append((m.group(0), ctx))
    for u in extra_urls or []:
        candidates.append((u, ""))
    for raw, ctx in candidates:
        url = raw.rstrip(".,;:!?")
        try:
            parts = urlsplit(url)
        except ValueError:
            continue
        host = (parts.hostname or "").lower()
        if parts.scheme != "https" or not host or parts.username or parts.password:
            continue
        score = 0
        if any(h in host for h in PAYMENT_HOST_HINTS):
            score += 3
        if any(h in parts.path.lower() for h in PAYMENT_PATH_HINTS):
            score += 2
        if re.search(r"\bpay(?:ment)?\b|\bpay online\b|secure payment", ctx, re.IGNORECASE):
            score += 2
        order += 1
        if score >= 2 and (best is None or score > best[0]):
            best = (score, order, url)
    if not best:
        return None
    return PaymentLinkFound(best[2], urlsplit(best[2]).hostname.lower())


def find_contracting_party(pages: list[str]) -> str | None:
    full = "\n".join(pages)
    m = re.search(r"(?:charterer|customer|client|lessee|member)\s*[:\-]\s*([A-Z][A-Za-z.'\- ]{2,80}?)(?:\n|,|\(|$)", full, re.IGNORECASE)
    return m[1].strip() if m else None


def analyze_pdf(data: bytes, filename: str = "", **limits) -> DocumentAnalysis:
    """Parse once (bounded), classify, extract. Raises PdfLimitError when the document breaks a bound."""
    parsed = extract_pdf(data, **limits)
    pages = parsed.pages
    doc_type = classify_document(pages, filename) if any(p.strip() for p in pages) else DOC_OTHER
    ex = extract_quote(pages) if doc_type == DOC_QUOTE else None
    return DocumentAnalysis(
        doc_type=doc_type,
        pages=pages,
        extraction=ex,
        links=parsed.links,
        contracting_party=find_contracting_party(pages) if doc_type == DOC_CONTRACT else None,
    )
