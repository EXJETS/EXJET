"""Checks around an operator's payment link (C1): host pinning and "did a later quote change the payment destination".

Kept separate from quote_service so serializers can use them without importing the ingest machinery."""
from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..guardrails import approved_approval
from ..models import Operator, PaymentLink, Quote, QuoteStatus

_HOST_RE = re.compile(r"^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$")


def normalize_host(host: str | None) -> str:
    """Lowercase, IDNA (punycode) form, no trailing dot. "" when it is not a plausible DNS host name."""
    h = (host or "").strip().lower().rstrip(".")
    if not h:
        return ""
    try:
        h = h.encode("idna").decode("ascii")
    except UnicodeError:
        return ""
    return h if _HOST_RE.match(h) else ""


def operator_hosts(op: Operator | None) -> set[str]:
    return {h for h in (normalize_host(x) for x in (op.payment_hosts or [])) if h} if op is not None else set()


def payment_host_approved(db: Session, quote: Quote) -> bool:
    """True when there is no payment link, or its host is on the operator's approved list. A quote with no operator
    (ground services) is approved only by an explicit admin `payment_host` approval for that quote."""
    link = quote.payment_link
    if link is None:
        return True
    host = normalize_host(link.host)
    if not host:
        return False
    if quote.operator_id is not None:
        return host in operator_hosts(db.get(Operator, quote.operator_id))
    return approved_approval(db, "payment_host", "quote", str(quote.id)) is not None


def first_quote(db: Session, rfq_id, exclude_id=None) -> Quote | None:
    """The earliest quote on the RFQ that has not been declined (optionally ignoring one quote, e.g. the new one)."""
    q = select(Quote).where(Quote.rfq_id == rfq_id, Quote.status != QuoteStatus.declined.value)
    if exclude_id is not None:
        q = q.where(Quote.id != exclude_id)
    return db.execute(q.order_by(Quote.created_at, Quote.id).limit(1)).scalar_one_or_none()


def differs_from(db: Session, first: Quote, host: str | None, total: int | None) -> bool:
    link = db.execute(select(PaymentLink).where(PaymentLink.quote_id == first.id)).scalar_one_or_none()
    first_host = normalize_host(link.host) if link else ""
    return first_host != normalize_host(host) or first.total_amount_cents != total


def changed_since_first(db: Session, quote: Quote) -> bool:
    """A later quote on the same RFQ whose payment host or total differs from the first one."""
    first = first_quote(db, quote.rfq_id)
    if first is None or first.id == quote.id:
        return False
    link = quote.payment_link
    return differs_from(db, first, link.host if link else None, quote.total_amount_cents)
