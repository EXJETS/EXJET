"""The only way EXJET sends email (ARCHITECTURE guardrail 4).

send() always: (a) checks suppressions for every recipient, (b) requires authorization per purpose,
(c) writes an email_messages row. A send without valid authorization is recorded as `blocked` and raises
GuardrailViolation. Nothing is sent in that case.

Purposes
- rfq, rfq_chase, manifest   to an operator contact (or FBO for ground requests). Authorized by the member's own
                             action (actor_user_id belongs to the trip's account) plus a standing approved
                             `rfq_dispatch_policy` approval for the operator (created when CEO approves go-live).
                             Recipients must be the contacts stored on the RFQ. Ground RFQs go to the FBO email
                             stored on the RFQ and need only the member's action.
- quote_to_member, lifecycle to members of the trip's/own account only.
- outreach                   requires an approved `outreach_campaign` approval id.
"""
from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from .audit import audit
from .config import get_settings
from .guardrails import GuardrailViolation, approved_approval
from .models import (
    AccountMember,
    Approval,
    ApprovalStatus,
    EmailMessage,
    Operator,
    Rfq,
    RfqKind,
    Suppression,
    Trip,
    User,
)
from .providers import get_mail
from .providers.errors import ProviderError
from .providers.mail import OutboundMessage
from .supply import operator_sellable

OPERATOR_FACING = {"rfq", "rfq_chase", "manifest"}
MEMBER_FACING = {"quote_to_member", "lifecycle"}
PURPOSES = OPERATOR_FACING | MEMBER_FACING | {"outreach"}
GROUND_KINDS = {RfqKind.rental_car.value, RfqKind.chauffeur.value}


def _norm(addr: str) -> str:
    return addr.strip().lower()


def _account_emails(db: Session, account_id: uuid.UUID) -> set[str]:
    rows = db.execute(
        select(User.email).join(AccountMember, AccountMember.user_id == User.id).where(AccountMember.account_id == account_id)
    ).scalars()
    return {_norm(e) for e in rows}


def _authorize(db: Session, purpose, recipients, rfq, actor_user_id, approval_id, account_id) -> str | None:
    """Return a violation code, or None when authorized."""
    if purpose not in PURPOSES:
        return "unknown_purpose"
    if not recipients:
        return "no_recipients"
    if purpose == "outreach":
        if approval_id is None:
            return "outreach_requires_approval"
        ap = db.get(Approval, approval_id)
        if not ap or ap.kind != "outreach_campaign" or ap.status != ApprovalStatus.approved.value or ap.decided_by is None:
            return "outreach_approval_not_approved"
        return None
    if purpose in MEMBER_FACING:
        acct = account_id or (db.get(Trip, rfq.trip_id).account_id if rfq is not None else None)
        if acct is None:
            return "account_required"
        if not set(recipients) <= _account_emails(db, acct):
            return "recipient_not_account_member"
        return None
    # operator-facing
    if rfq is None:
        return "rfq_required"
    trip = db.get(Trip, rfq.trip_id)
    if actor_user_id is None or trip is None:
        return "member_action_required"
    member = db.execute(
        select(AccountMember.id).where(AccountMember.account_id == trip.account_id, AccountMember.user_id == actor_user_id)
    ).first()
    if member is None:
        return "actor_not_account_member"
    allowed = {_norm(a) for a in (rfq.recipients or [])}
    if not set(recipients) <= allowed:
        return "recipient_not_on_rfq"
    if rfq.kind in GROUND_KINDS:
        return None if rfq.fbo_id is not None and rfq.operator_id is None else "ground_rfq_malformed"
    op = db.get(Operator, rfq.operator_id) if rfq.operator_id else None
    if op is None:
        return "operator_required"
    if not operator_sellable(op):
        return "operator_not_live_or_excluded"
    if approved_approval(db, "rfq_dispatch_policy", "operator", str(op.id)) is None:
        return "operator_missing_dispatch_policy"
    return None


def send(
    db: Session,
    *,
    purpose: str,
    to: list[str],
    subject: str,
    body: str,
    rfq: Rfq | None = None,
    actor_user_id: uuid.UUID | None = None,
    approval_id: uuid.UUID | None = None,
    account_id: uuid.UUID | None = None,
) -> EmailMessage:
    settings = get_settings()
    recipients = list(dict.fromkeys(_norm(a) for a in to if a and a.strip()))
    msg = EmailMessage(
        direction="outbound", mailbox=settings.rfq_from_address, from_address=settings.rfq_from_address,
        to_addresses=recipients, subject=subject[:998], body_text=body, purpose=purpose,
        rfq_id=rfq.id if rfq is not None else None, approval_id=approval_id, status="queued",
        thread_id=rfq.thread_id if rfq is not None else None,
    )
    violation: str | None = None
    if recipients:
        suppressed = db.execute(select(Suppression.email).where(Suppression.email.in_(recipients))).scalars().first()
        if suppressed:
            violation = "recipient_suppressed"
    if violation is None:
        violation = _authorize(db, purpose, recipients, rfq, actor_user_id, approval_id, account_id)
    if violation is not None:
        msg.status = "blocked"
        db.add(msg)
        db.flush()
        audit(db, actor=f"user:{actor_user_id}" if actor_user_id else "system", action="mail.blocked",
              subject_type="email_message", subject_id=msg.id, detail={"purpose": purpose, "reason": violation})
        db.commit()
        raise GuardrailViolation(violation)

    db.add(msg)
    db.flush()
    try:
        res = get_mail().send(OutboundMessage(settings.rfq_from_address, recipients, msg.subject, body, msg.thread_id))
    except ProviderError:
        msg.status = "failed"
        db.commit()
        raise
    msg.status = "sent"
    msg.sent_at = datetime.now(UTC)
    msg.provider_message_id = res.provider_message_id
    msg.thread_id = res.thread_id
    db.flush()
    return msg
