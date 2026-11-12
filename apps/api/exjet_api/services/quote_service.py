"""Inbound mail -> stored documents -> Quote / Contract / PaymentLink; accept, acknowledge, mark paid.

Trust chain for an inbound reply (C1). Every step must hold before a member can see a quote:
  1. the From header parses to exactly ONE address (strict parser);
  2. that address equals, after normalization, a stored OperatorContact of the RFQ's operator (or the FBO's address for
     ground requests) that was a recipient of THIS RFQ. No domain-level trust;
  3. the mail provider reports an aligned DMARC pass (InboundAuth.dmarc_pass). Otherwise the message is quarantined and an
     admin review item (`inbound_review`) is opened; it never yields a member-visible quote;
  4. attachments are sniffed (PDF only), size-capped, and parsed once in a resource-limited subprocess;
  5. the payment link host must be on the operator's admin-approved list (`Operator.payment_hosts`), else needs_review
     with an admin `payment_host` approval;
  6. a later quote never expires or hides an earlier one; if its payment host or total differs from the first quote it
     goes to needs_review and both remain.
"""
from __future__ import annotations

import hashlib
import re
import uuid
from datetime import datetime

from exjet_product.manifest import compute_due_at, reminder_times
from exjet_product.quote_ingest import (
    DOC_CONTRACT,
    DOC_QUOTE,
    PdfLimitError,
    QuoteExtraction,
    amount_in_text,
    analyze_pdf,
    extract_pdf_pages,
    find_payment_link,
    verify_llm_extraction,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import clock, mailer
from ..audit import record_agent_action
from ..config import get_settings
from ..emailnorm import normalize_email, parse_single_address
from ..errors import conflict, not_found
from ..filetypes import OPERATOR_DOC_TYPES, sniff
from ..guardrails import GuardrailViolation
from ..jobs import enqueue
from ..models import (
    AccountMember,
    Approval,
    Contract,
    Document,
    EmailMessage,
    Fbo,
    Manifest,
    Operator,
    OperatorContact,
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
from ..providers.storage import new_key, safe_filename
from ..supply import operator_sellable
from . import quote_checks as QC
from . import suppression
from .identity import verified_holder_name

DECLINE_RE = re.compile(r"\b(unable to|not available|unavailable|cannot (?:accommodate|operate|support)|can't (?:accommodate|operate)|pass on this|no availability|regret)\b", re.IGNORECASE)
# Flags that keep a quote out of member view until an admin resolves it.
BLOCKING_FLAGS = {"non_usd_currency", "ambiguous_total", "total_not_found", "total_not_verified", "no_quote_document",
                  "payment_host_not_approved", "payment_host_unverified", "differs_from_earlier_quote"}
HOST_FLAGS = {"payment_host_not_approved", "payment_host_unverified"}
READY_THRESHOLD = 0.8


# --------------------------------------------------------------------------- inbox polling
def poll_inbox(db: Session) -> int:
    """Pull new mail from the provider, store it, and queue quote.ingest for each message."""
    n = 0
    storage = get_storage()
    settings = get_settings()
    for em in get_mail().fetch_inbound():
        if em.provider_message_id and db.execute(
            select(EmailMessage.id).where(EmailMessage.provider_message_id == em.provider_message_id)
        ).first():
            continue
        sender = parse_single_address(em.from_address)  # exactly one well-formed address, or None
        msg = EmailMessage(
            direction="inbound", mailbox=settings.rfq_from_address, provider_message_id=em.provider_message_id,
            thread_id=em.thread_id, from_address=sender or (em.from_address or "").strip()[:320], to_addresses=em.to,
            subject=em.subject[:998], body_text=em.body_text, purpose="inbound_reply", status="received", sent_at=em.received_at,
            auth_result={"dmarc_pass": bool(em.auth.dmarc_pass), "spf": em.auth.spf, "dkim": em.auth.dkim},
        )
        db.add(msg)
        db.flush()
        rejected = 0
        for att in em.attachments:
            ctype = sniff(att.data) if len(att.data) <= settings.pdf_max_bytes else None
            if ctype not in OPERATOR_DOC_TYPES:  # only PDFs are stored; the claimed content type is ignored
                rejected += 1
                continue
            key = new_key("email", msg.id)
            storage.put(key, att.data, ctype)
            db.add(Document(kind="other", owner_type="email_message", owner_id=msg.id, storage_key=key,
                            filename=safe_filename(att.filename), content_type=ctype,
                            size_bytes=len(att.data), sha256=hashlib.sha256(att.data).hexdigest()))
        if rejected:
            record_agent_action(db, agent="quote_ingest", event="quote.attachment_rejected", input={"message_id": str(msg.id)},
                                output={"rejected": rejected, "reason": "not_pdf_or_too_large"}, status="blocked", permission_level="READ")
        enqueue(db, "quote.ingest", {"message_id": str(msg.id)}, dedupe_key=f"quote.ingest:{msg.id}")
        n += 1
    return n


def _sender_ok(db: Session, rfq: Rfq, sender: str | None) -> bool:
    """The sender must be, exactly (normalized), a stored contact of the RFQ's operator that was a recipient of this
    RFQ. For ground requests: the FBO address the request was sent to. No domain fallback."""
    if not sender:
        return False
    if sender not in {normalize_email(a) for a in (rfq.recipients or [])}:
        return False
    if rfq.operator_id is not None:
        return db.execute(select(OperatorContact.id).where(
            OperatorContact.operator_id == rfq.operator_id, func.lower(OperatorContact.email) == sender).limit(1)).first() is not None
    fbo = db.get(Fbo, rfq.fbo_id) if rfq.fbo_id else None
    return fbo is not None and normalize_email(fbo.email) == sender


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


def _quarantine(db: Session, msg: EmailMessage, rfq: Rfq, trip: Trip, reason: str) -> None:
    """Keep the message, show no quote to anyone, and open an admin review item."""
    msg.status, msg.quarantine_reason = "quarantined", reason[:64]
    msg.rfq_id = rfq.id
    auth = msg.auth_result or {}
    ap = Approval(
        kind="inbound_review", subject_type="email_message", subject_id=str(msg.id), required_role="ceo", requested_by="system",
        summary=f"Quarantined inbound reply on RFQ {rfq.reference}: {reason}",
        payload={"reason": reason, "rfq_id": str(rfq.id), "dmarc_pass": auth.get("dmarc_pass"), "spf": auth.get("spf"),
                 "dkim": auth.get("dkim")})
    db.add(ap)
    db.flush()
    record_agent_action(db, agent="quote_ingest", event="quote.quarantined", input={"message_id": str(msg.id), "rfq_id": str(rfq.id)},
                        output={"reason": reason}, status="awaiting_approval", permission_level="READ",
                        account_id=trip.account_id, approval_id=ap.id)


def release_quarantined(db: Session, msg_id: uuid.UUID) -> None:
    """An admin approved the review item: process the message once, treating the authentication verdict as vetted by a person.
    Sender pinning, attachment checks and payment host pinning still apply."""
    msg = db.get(EmailMessage, msg_id)
    if msg is None or msg.status != "quarantined":
        return
    msg.status = "received"
    enqueue(db, "quote.ingest", {"message_id": str(msg.id), "released": True}, dedupe_key=f"quote.ingest:{msg.id}:released")


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


def _reject(db: Session, msg: EmailMessage, rfq: Rfq, trip: Trip, reason: str) -> None:
    msg.status = "rejected"
    record_agent_action(db, agent="quote_ingest", event="quote.rejected_sender", input={"message_id": str(msg.id), "rfq_id": str(rfq.id)},
                        output={"reason": reason}, status="blocked", permission_level="READ", account_id=trip.account_id)


def ingest_message(db: Session, message_id: uuid.UUID, *, released: bool = False) -> None:
    msg = db.get(EmailMessage, message_id)
    if msg is None or msg.direction != "inbound" or msg.status != "received":
        return  # quarantined / rejected / already handled messages are not re-processed
    if not released and suppression.handle_inbound_keywords(db, msg, parse_single_address(msg.from_address)):
        return  # unsubscribe / complaint / legal notice: sender suppressed, not a quote
    rfq = _match_rfq(db, msg)
    if rfq is None:
        record_agent_action(db, agent="quote_ingest", event="quote.unmatched", input={"message_id": str(msg.id)},
                            output={"reason": "no_rfq_match"}, status="blocked", permission_level="READ")
        return
    trip = db.get(Trip, rfq.trip_id)
    sender = parse_single_address(msg.from_address)
    if sender is None:
        return _reject(db, msg, rfq, trip, "sender_malformed")
    if not _sender_ok(db, rfq, sender):
        return _reject(db, msg, rfq, trip, "sender_not_a_recipient_contact")
    if rfq.operator is not None and not operator_sellable(rfq.operator, db):
        record_agent_action(db, agent="quote_ingest", event="quote.rejected_operator", input={"rfq_id": str(rfq.id)},
                            output={"reason": "operator_not_live_or_excluded"}, status="blocked", permission_level="READ",
                            account_id=trip.account_id)
        return
    if not released and (msg.auth_result or {}).get("dmarc_pass") is not True:
        return _quarantine(db, msg, rfq, trip, "dmarc_not_passed")
    msg.rfq_id = rfq.id

    storage = get_storage()
    settings = get_settings()
    docs = db.execute(select(Document).where(Document.owner_type == "email_message", Document.owner_id == msg.id)).scalars().all()
    analyses = []
    for d in docs:
        if d.content_type not in OPERATOR_DOC_TYPES:
            continue
        try:
            analyses.append((d, analyze_pdf(storage.get(d.storage_key), d.filename, max_bytes=settings.pdf_max_bytes,
                                            max_pages=settings.pdf_max_pages, max_chars=settings.pdf_max_chars,
                                            timeout=settings.pdf_timeout_seconds)))
        except PdfLimitError as e:
            # A poisoned document: quarantine for a person and finish the job (it is never retried).
            if released:
                return _reject(db, msg, rfq, trip, f"pdf_{e.reason}")
            return _quarantine(db, msg, rfq, trip, f"pdf_{e.reason}")
    rfq.replied_at = clock.now()
    if rfq.status in (RfqStatus.sent.value, RfqStatus.queued.value):
        rfq.status = RfqStatus.replied.value
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
        holder = verified_holder_name(db, trip.account_id, trip.created_by)
        last = holder.split()[-1].lower() if holder else ""
        if ca.contracting_party and last and last not in ca.contracting_party.lower():
            flags.append("contract_party_mismatch")
    else:
        flags.append("no_contract_document")

    link = find_payment_link(pages_for_links, extra_urls)
    host = QC.normalize_host(link.host) if link else ""
    if link:
        db.add(PaymentLink(quote_id=quote.id, url=link.url, host=host or link.host, status=PaymentLinkStatus.pending.value))
    else:
        flags.append("no_payment_link")
    db.flush()
    db.refresh(quote)

    # --- payment host pinning: the link must go to a host an admin approved for this operator
    host_approval: Approval | None = None
    if link and not QC.payment_host_approved(db, quote):
        flags.append("payment_host_not_approved" if quote.operator_id is not None else "payment_host_unverified")
        op = db.get(Operator, quote.operator_id) if quote.operator_id else None
        host_approval = Approval(
            kind="payment_host", subject_type="quote", subject_id=str(quote.id), required_role="ceo", requested_by="system",
            summary=f"Approve payment host {host or '(invalid)'} for {op.dba_name if op else 'a ground service'}?",
            payload={"operator_id": str(op.id) if op else None, "host": host})
        db.add(host_approval)
        db.flush()
    # --- never auto-supersede: a quote that differs from the first one waits for an admin, and both remain
    first = QC.first_quote(db, rfq.id, exclude_id=quote.id)
    if first is not None and QC.differs_from(db, first, host, quote.total_amount_cents):
        flags.append("differs_from_earlier_quote")
    if BLOCKING_FLAGS & set(flags):
        quote.status = QuoteStatus.needs_review.value
    parsed["flags"] = flags
    quote.parsed = parsed

    if quote.status == QuoteStatus.ready.value:
        if trip.status in (TripStatus.draft.value, TripStatus.rfq_sent.value):
            trip.status = TripStatus.quoted.value
        _notify_member(db, trip, rfq)
    record_agent_action(
        db, agent="quote_ingest", event="quote.ingest", input={"message_id": str(msg.id), "rfq_id": str(rfq.id)},
        output={"quote_id": str(quote.id), "status": quote.status, "has_total": quote.total_amount_cents is not None,
                "flags": flags}, permission_level="DRAFT", account_id=trip.account_id,
        approval_id=host_approval.id if host_approval else None,
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
    if not QC.payment_host_approved(db, quote):
        raise conflict("payment_host_not_approved", "Approve the payment host (payment_host approval) before releasing this quote.")
    doc = db.get(Document, quote.source_document_id)
    s_ = get_settings()
    try:
        pages = extract_pdf_pages(get_storage().get(doc.storage_key), max_bytes=s_.pdf_max_bytes, max_pages=s_.pdf_max_pages,
                                  max_chars=s_.pdf_max_chars, timeout=s_.pdf_timeout_seconds)
    except PdfLimitError:
        raise unprocessable("document_unreadable", "The operator's PDF exceeds parsing limits and cannot be verified.") from None
    if not amount_in_text(total_cents, "\n".join(pages)):
        raise unprocessable("amount_not_in_document", "That amount does not appear in the operator's PDF.")
    quote.total_amount_cents = total_cents
    if valid_until:
        quote.valid_until = valid_until
    quote.parser, quote.parse_confidence = "manual:admin", 1.0  # who decided is in audit_log (quote.resolved)
    parsed = dict(quote.parsed or {})
    parsed["flags"] = [f for f in (parsed.get("flags") or []) if f not in BLOCKING_FLAGS]  # a person has resolved them
    quote.parsed = parsed
    quote.status = QuoteStatus.ready.value
    trip = db.get(Trip, quote.trip_id)
    if trip.status in (TripStatus.draft.value, TripStatus.rfq_sent.value):
        trip.status = TripStatus.quoted.value
    _notify_member(db, trip, db.get(Rfq, quote.rfq_id))
    return quote


def decide_payment_host(db: Session, approval: Approval, approved: bool) -> None:
    """Called when an admin decides a `payment_host` approval. Approve: the host joins the operator's approved list and the
    quote is released if nothing else blocks it. Reject: the quote is declined."""
    q = db.get(Quote, uuid.UUID(approval.subject_id))
    if q is None:
        return
    if not approved:
        if q.status in (QuoteStatus.needs_review.value, QuoteStatus.received.value):
            q.status = QuoteStatus.declined.value
        return
    host = QC.normalize_host((approval.payload or {}).get("host"))
    op = db.get(Operator, q.operator_id) if q.operator_id else None
    if op is not None and host:
        hosts = list(op.payment_hosts or [])
        if host not in hosts:
            hosts.append(host)
            op.payment_hosts = hosts
    db.flush()
    parsed = dict(q.parsed or {})
    parsed["flags"] = [f for f in (parsed.get("flags") or []) if f not in HOST_FLAGS]
    q.parsed = parsed
    remaining = BLOCKING_FLAGS & set(parsed["flags"])
    if (q.status == QuoteStatus.needs_review.value and not remaining and q.total_amount_cents is not None
            and (q.parse_confidence or 0) >= READY_THRESHOLD and QC.payment_host_approved(db, q)):
        q.status = QuoteStatus.ready.value
        trip = db.get(Trip, q.trip_id)
        if trip.status in (TripStatus.draft.value, TripStatus.rfq_sent.value):
            trip.status = TripStatus.quoted.value
        _notify_member(db, trip, db.get(Rfq, q.rfq_id))


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
    if not QC.payment_host_approved(db, q):
        raise conflict("payment_host_not_approved", "This quote's payment host has not been approved.")
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
    if not QC.payment_host_approved(db, q):
        raise conflict("payment_host_not_approved", "This quote's payment host has not been approved.")
    q.payment_link.status = PaymentLinkStatus.member_marked_paid.value
    q.payment_link.member_marked_paid_at = clock.now()
    trip.status = TripStatus.paid.value
    first = trip.legs[0].depart_at
    trip.status = TripStatus.manifest_due.value
    due = compute_due_at(first, get_settings().manifest_due_hours)
    if trip.manifest is None:
        m = Manifest(trip_id=trip.id, due_at=due)
        db.add(m)
        trip.manifest = m
    now = clock.now()
    future = [t for t in reminder_times(first) if t > now]
    if not future and first > now:
        future = [now]
    for t in future:
        enqueue(db, "manifest.remind", {"trip_id": str(trip.id)}, run_at=t, dedupe_key=f"manifest.remind:{trip.id}:{int(t.timestamp())}")
    db.flush()
    return trip


__all__ = [
    "accept_quote",
    "decide_payment_host",
    "release_quarantined",
    "acknowledge_contract",
    "decline_quote",
    "ingest_message",
    "mark_paid",
    "owned_quote",
    "poll_inbox",
    "quote_flags",
    "resolve_quote",
]
