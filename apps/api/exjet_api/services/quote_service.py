"""Inbound mail -> stored documents -> Quote / Contract / PaymentLink; accept, acknowledge, mark paid."""
from __future__ import annotations

import hashlib
import re
import uuid
from datetime import datetime

from exjet_product.manifest import compute_due_at, reminder_times
from exjet_product.quote_ingest import (
    DOC_CONTRACT,
    DOC_QUOTE,
    QuoteExtraction,
    amount_in_text,
    analyze_pdf,
    extract_pdf_pages,
    find_payment_link,
    verify_llm_extraction,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import clock, mailer
from ..audit import record_agent_action
from ..config import get_settings
from ..errors import conflict, not_found
from ..guardrails import GuardrailViolation
from ..jobs import enqueue
from ..models import (
    AccountMember,
    Contract,
    Document,
    EmailMessage,
    Manifest,
    PaymentLink,
    PaymentLinkStatus,
    Quote,
    QuoteStatus,
    Rfq,
    RfqStatus,
    Trip,
    TripStatus,
    User,
)
from ..providers import get_llm, get_mail, get_storage
from ..providers.errors import ProviderError
from ..providers.storage import safe_filename
from ..supply import operator_sellable

MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024
DECLINE_RE = re.compile(r"\b(unable to|not available|unavailable|cannot (?:accommodate|operate|support)|can't (?:accommodate|operate)|pass on this|no availability|regret)\b", re.I)


# --------------------------------------------------------------------------- inbox polling
def poll_inbox(db: Session) -> int:
    """Pull new mail from the provider, store it, and queue quote.ingest for each message."""
    n = 0
    storage = get_storage()
    for em in get_mail().fetch_inbound():
        if em.provider_message_id and db.execute(
            select(EmailMessage.id).where(EmailMessage.provider_message_id == em.provider_message_id)
        ).first():
            continue
        msg = EmailMessage(
            direction="inbound", mailbox=get_settings().rfq_from_address, provider_message_id=em.provider_message_id,
            thread_id=em.thread_id, from_address=em.from_address.strip().lower(), to_addresses=em.to, subject=em.subject[:998],
            body_text=em.body_text, purpose="inbound_reply", status="received", sent_at=em.received_at,
        )
        db.add(msg)
        db.flush()
        for att in em.attachments:
            if len(att.data) > MAX_ATTACHMENT_BYTES:
                continue
            key = f"email/{msg.id}/{uuid.uuid4().hex}-{safe_filename(att.filename)}"
            storage.put(key, att.data, att.content_type)
            db.add(Document(kind="other", owner_type="email_message", owner_id=msg.id, storage_key=key,
                            filename=safe_filename(att.filename), content_type=att.content_type,
                            size_bytes=len(att.data), sha256=hashlib.sha256(att.data).hexdigest()))
        enqueue(db, "quote.ingest", {"message_id": str(msg.id)}, dedupe_key=f"quote.ingest:{msg.id}")
        n += 1
    return n


def _domain(addr: str) -> str:
    return addr.rsplit("@", 1)[-1].lower()


def _sender_ok(rfq: Rfq, sender: str) -> bool:
    recips = [a.lower() for a in (rfq.recipients or [])]
    return sender.lower() in recips or _domain(sender) in {_domain(a) for a in recips}


def _match_rfq(db: Session, msg: EmailMessage) -> Rfq | None:
    from exjet_product.rfq import extract_reference

    ref = extract_reference(msg.subject)
    if ref:
        r = db.execute(select(Rfq).where(Rfq.reference == ref)).scalar_one_or_none()
        if r:
            return r
    if msg.thread_id:
        return db.execute(select(Rfq).where(Rfq.thread_id == msg.thread_id).limit(1)).scalar_one_or_none()
    return None


def _llm_extract(pages: list[str]) -> QuoteExtraction | None:
    """Optional LLM fallback. Output is accepted only if every amount appears verbatim in the PDF text."""
    llm = get_llm()
    if not llm.available:
        return None
    text = "\n".join(pages)[:20000]
    try:
        data = llm.complete_json(
            system="Extract fields from a private jet charter quote. Reply with one JSON object only. "
                   "Keys: total_amount_cents (integer), currency, valid_until, operator_quote_number, "
                   "line_items (list of {description, amount_cents, page}). Use only values printed in the text. "
                   "If the total is not clearly printed, omit total_amount_cents.",
            prompt=text)
    except ProviderError:
        return None
    return verify_llm_extraction(data, pages, llm.model or "unknown")


def ingest_message(db: Session, message_id: uuid.UUID) -> None:
    msg = db.get(EmailMessage, message_id)
    if msg is None or msg.direction != "inbound":
        return
    rfq = _match_rfq(db, msg)
    if rfq is None:
        record_agent_action(db, agent="quote_ingest", event="quote.unmatched", input={"message_id": str(msg.id)},
                            output={"reason": "no_rfq_match"}, status="blocked", permission_level="READ")
        return
    trip = db.get(Trip, rfq.trip_id)
    if not _sender_ok(rfq, msg.from_address):
        record_agent_action(db, agent="quote_ingest", event="quote.rejected_sender", input={"message_id": str(msg.id), "rfq_id": str(rfq.id)},
                            output={"reason": "sender_not_on_rfq"}, status="blocked", permission_level="READ", account_id=trip.account_id)
        return
    if rfq.operator is not None and not operator_sellable(rfq.operator):
        record_agent_action(db, agent="quote_ingest", event="quote.rejected_operator", input={"rfq_id": str(rfq.id)},
                            output={"reason": "operator_not_live_or_excluded"}, status="blocked", permission_level="READ",
                            account_id=trip.account_id)
        return
    msg.rfq_id = rfq.id
    rfq.replied_at = clock.now()
    if rfq.status in (RfqStatus.sent.value, RfqStatus.queued.value):
        rfq.status = RfqStatus.replied.value

    storage = get_storage()
    docs = db.execute(select(Document).where(Document.owner_type == "email_message", Document.owner_id == msg.id)).scalars().all()
    analyses = []
    for d in docs:
        if d.content_type != "application/pdf" and not d.filename.lower().endswith(".pdf"):
            continue
        analyses.append((d, analyze_pdf(storage.get(d.storage_key), d.filename)))
    quote_docs = [(d, a) for d, a in analyses if a.doc_type == DOC_QUOTE]
    contract_docs = [(d, a) for d, a in analyses if a.doc_type == DOC_CONTRACT]

    if not quote_docs and not contract_docs:
        if DECLINE_RE.search(msg.body_text or ""):
            rfq.status = RfqStatus.declined.value
        record_agent_action(db, agent="quote_ingest", event="quote.reply_without_document",
                            input={"message_id": str(msg.id), "rfq_id": str(rfq.id)},
                            output={"declined": rfq.status == RfqStatus.declined.value}, permission_level="READ",
                            account_id=trip.account_id)
        return

    quote = Quote(rfq_id=rfq.id, trip_id=trip.id, operator_id=rfq.operator_id, source_message_id=msg.id,
                  status=QuoteStatus.needs_review.value)
    flags: list[str] = []
    pages_for_links: list[str] = [msg.body_text or ""]
    extra_urls: list[str] = []
    if quote_docs:
        qdoc, qa = max(quote_docs, key=lambda x: x[1].extraction.confidence if x[1].extraction else 0)
        ex = qa.extraction
        if (ex.total_cents is None) and (llm_ex := _llm_extract(qa.pages)) is not None:
            llm_ex.flags = [f for f in ex.flags if f not in ("total_not_found", "ambiguous_total")] + llm_ex.flags
            ex = llm_ex
        quote.total_amount_cents = ex.total_cents
        quote.currency = ex.currency
        quote.valid_until, quote.operator_quote_number = ex.valid_until, ex.quote_number
        quote.parse_confidence, quote.parser = ex.confidence, ex.parser
        quote.source_document_id = qdoc.id
        flags = list(ex.flags)
        parsed = ex.to_json()
        quote.status = QuoteStatus.ready.value if ex.ready else QuoteStatus.needs_review.value
        pages_for_links += qa.pages
        extra_urls += qa.links
    else:
        flags.append("no_quote_document")
        parsed = {"line_items": [], "flags": flags}
        quote.parse_confidence, quote.parser = 0.0, "rules"
    db.add(quote)
    db.flush()
    if quote_docs:
        qdoc.kind, qdoc.owner_type, qdoc.owner_id = "quote_pdf", "quote", quote.id

    if contract_docs:
        cdoc, ca = contract_docs[0]
        contract = Contract(quote_id=quote.id, trip_id=trip.id, document_id=cdoc.id, contracting_party_name=ca.contracting_party)
        db.add(contract)
        db.flush()
        cdoc.kind, cdoc.owner_type, cdoc.owner_id = "contract", "contract", contract.id
        pages_for_links += ca.pages
        extra_urls += ca.links
        member = db.get(User, trip.created_by)
        last = (member.full_name or "").split()[-1].lower() if member and member.full_name else ""
        if ca.contracting_party and last and last not in ca.contracting_party.lower():
            flags.append("contract_party_mismatch")
    else:
        flags.append("no_contract_document")

    link = find_payment_link(pages_for_links, extra_urls)
    if link:
        db.add(PaymentLink(quote_id=quote.id, url=link.url, host=link.host, status=PaymentLinkStatus.pending.value))
    else:
        flags.append("no_payment_link")
    parsed["flags"] = flags
    quote.parsed = parsed

    if quote.status == QuoteStatus.ready.value:
        for old in db.execute(select(Quote).where(Quote.rfq_id == rfq.id, Quote.id != quote.id,
                                                  Quote.status.in_([QuoteStatus.ready.value, QuoteStatus.received.value]))).scalars():
            old.status = QuoteStatus.expired.value  # superseded by a newer quote on the same RFQ
        if trip.status in (TripStatus.draft.value, TripStatus.rfq_sent.value):
            trip.status = TripStatus.quoted.value
        _notify_member(db, trip, rfq)
    record_agent_action(
        db, agent="quote_ingest", event="quote.ingest", input={"message_id": str(msg.id), "rfq_id": str(rfq.id)},
        output={"quote_id": str(quote.id), "status": quote.status, "has_total": quote.total_amount_cents is not None,
                "flags": flags}, permission_level="DRAFT", account_id=trip.account_id,
        status="done" if quote.status == QuoteStatus.ready.value else "awaiting_approval",
    )


def _notify_member(db: Session, trip: Trip, rfq: Rfq) -> None:
    """Email members that a quote is ready. No operator name or amount in the email; they sign in to view."""
    emails = db.execute(select(User.email).join(AccountMember, AccountMember.user_id == User.id)
                        .where(AccountMember.account_id == trip.account_id)).scalars().all()
    app = get_settings().app_base_url
    try:
        mailer.send(db, purpose="quote_to_member", to=list(emails), rfq=rfq, account_id=trip.account_id,
                    subject=f"A quote is ready for your trip ({rfq.reference})",
                    body=f"A new quote has arrived for your EXJET trip. Sign in to review it: {app}/trips/{trip.id}\n\nEXJET")
    except (GuardrailViolation, ProviderError):
        pass  # the quote is still visible in the app; a failed notification must not fail ingest


# --------------------------------------------------------------------------- admin review
def quote_flags(q: Quote) -> list[str]:
    return list((q.parsed or {}).get("flags") or [])


def resolve_quote(db: Session, quote: Quote, *, total_cents: int, valid_until: datetime | None, reject: bool, admin_id: uuid.UUID) -> Quote:
    """Admin sets the total for a needs_review quote. The amount must appear verbatim in the stored PDF."""
    from ..errors import unprocessable

    if quote.status != QuoteStatus.needs_review.value:
        raise conflict("invalid_state", "Only quotes awaiting review can be resolved.")
    if reject:
        quote.status = QuoteStatus.declined.value
        return quote
    if quote.source_document_id is None:
        raise unprocessable("no_source_document", "This quote has no PDF to verify the amount against.")
    doc = db.get(Document, quote.source_document_id)
    pages = extract_pdf_pages(get_storage().get(doc.storage_key))
    if not amount_in_text(total_cents, "\n".join(pages)):
        raise unprocessable("amount_not_in_document", "That amount does not appear in the operator's PDF.")
    quote.total_amount_cents = total_cents
    if valid_until:
        quote.valid_until = valid_until
    quote.parser, quote.parse_confidence = f"manual:{admin_id}", 1.0
    quote.status = QuoteStatus.ready.value
    trip = db.get(Trip, quote.trip_id)
    if trip.status in (TripStatus.draft.value, TripStatus.rfq_sent.value):
        trip.status = TripStatus.quoted.value
    _notify_member(db, trip, db.get(Rfq, quote.rfq_id))
    return quote


# --------------------------------------------------------------------------- member actions
def owned_quote(db: Session, account_id: uuid.UUID, quote_id: uuid.UUID) -> Quote:
    q = db.get(Quote, quote_id)
    if q is None or q.status in (QuoteStatus.received.value, QuoteStatus.needs_review.value):
        raise not_found("Quote not found.")
    trip = db.get(Trip, q.trip_id)
    if trip.account_id != account_id:
        raise not_found("Quote not found.")
    return q


def accept_quote(db: Session, q: Quote) -> Trip:
    trip = db.get(Trip, q.trip_id)
    if q.status != QuoteStatus.ready.value:
        raise conflict("invalid_state", "Only a ready quote can be accepted.")
    if trip.status not in (TripStatus.rfq_sent.value, TripStatus.quoted.value):
        raise conflict("invalid_state", "This trip can no longer accept a quote.")
    if q.valid_until is not None and q.valid_until < clock.now():
        raise conflict("quote_expired", "This quote has expired.")
    if q.contract is None:
        raise conflict("contract_missing", "The operator has not provided a contract for this quote.")
    q.status = QuoteStatus.accepted.value
    for other in db.execute(select(Quote).where(Quote.trip_id == trip.id, Quote.id != q.id,
                            Quote.status.in_([QuoteStatus.ready.value, QuoteStatus.received.value, QuoteStatus.needs_review.value]))).scalars():
        other.status = QuoteStatus.declined.value
    trip.accepted_quote_id = q.id
    trip.status = TripStatus.contracted.value
    return trip


def decline_quote(db: Session, q: Quote) -> Quote:
    if q.status != QuoteStatus.ready.value:
        raise conflict("invalid_state", "Only a ready quote can be declined.")
    q.status = QuoteStatus.declined.value
    db.flush()
    trip = db.get(Trip, q.trip_id)
    if trip.status == TripStatus.quoted.value and not db.execute(
        select(Quote.id).where(Quote.trip_id == trip.id, Quote.status == QuoteStatus.ready.value)
    ).first():
        trip.status = TripStatus.rfq_sent.value
    return q


def acknowledge_contract(db: Session, account_id: uuid.UUID, contract_id: uuid.UUID) -> Contract:
    c = db.get(Contract, contract_id)
    trip = db.get(Trip, c.trip_id) if c else None
    if c is None or trip is None or trip.account_id != account_id:
        raise not_found("Contract not found.")
    q = db.get(Quote, c.quote_id)
    if q.status != QuoteStatus.accepted.value:
        raise conflict("invalid_state", "Accept the quote before acknowledging its contract.")
    if c.acknowledged_at is None:
        c.acknowledged_at = clock.now()
    return c


def mark_paid(db: Session, q: Quote) -> Trip:
    """The member says they paid the operator's link. EXJET does not verify or process the payment."""
    trip = db.get(Trip, q.trip_id)
    if q.status != QuoteStatus.accepted.value or trip.status != TripStatus.contracted.value:
        raise conflict("invalid_state", "Accept the quote and acknowledge the contract first.")
    if q.contract is None or q.contract.acknowledged_at is None:
        raise conflict("contract_not_acknowledged", "Acknowledge the contract before marking payment.")
    if q.payment_link is None:
        raise conflict("payment_link_missing", "The operator has not provided a payment link.")
    q.payment_link.status = PaymentLinkStatus.member_marked_paid.value
    q.payment_link.member_marked_paid_at = clock.now()
    trip.status = TripStatus.paid.value
    first = trip.legs[0].depart_at
    trip.status = TripStatus.manifest_due.value
    due = compute_due_at(first, get_settings().manifest_due_hours)
    if trip.manifest is None:
        db.add(Manifest(trip_id=trip.id, due_at=due))
    now = clock.now()
    future = [t for t in reminder_times(first) if t > now]
    if not future and first > now:
        future = [now]
    for i, t in enumerate(future):
        enqueue(db, "manifest.remind", {"trip_id": str(trip.id)}, run_at=t, dedupe_key=f"manifest.remind:{trip.id}:{int(t.timestamp())}")
    db.flush()
    return trip


__all__ = ["poll_inbox", "ingest_message", "resolve_quote", "accept_quote", "decline_quote", "acknowledge_contract",
           "mark_paid", "owned_quote", "quote_flags"]
