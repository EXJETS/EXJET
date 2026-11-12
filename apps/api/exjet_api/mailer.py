"""The only way EXJET sends email (ARCHITECTURE guardrail 4).

send() always: (a) checks suppressions for every recipient (normalized, case-insensitive), (b) requires
authorization per purpose, (c) writes an email_messages row. A send without valid authorization is recorded as
`blocked` and raises GuardrailViolation. Nothing is sent in that case.

Transactions (L8): send() NEVER commits the caller's transaction. A blocked or failed message is recorded in its own
short transaction (separate session) so the evidence survives even when the caller rolls back; a sent message is
added to the caller's session and commits with it.

Purposes
- rfq, rfq_chase, manifest   to an operator contact (or FBO for ground requests). Authorized by the member's own
                             action (actor_user_id belongs to the trip's account) plus a standing approved
                             `rfq_dispatch_policy` approval for the operator (created when CEO approves go-live).
                             Recipients must be the contacts stored on the RFQ. Ground RFQs go to the FBO email
                             stored on the RFQ and need only the member's action.
- quote_to_member, lifecycle to members of the trip's/own account only.
- seat_invite                to the email of a pending, unexpired SeatInvitation, sent on behalf of the account owner.
- password_reset, account_notice   to the address of an existing active user (transactional).
- email_verification         to the address of an existing active user whose email is not yet verified (transactional).
- outreach                   requires an approved `outreach_campaign` approval id.
"""
from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import clock
from .audit import audit
from .config import get_settings
from .db import session_factory
from .emailnorm import normalize_email
from .guardrails import GuardrailViolation, approved_approval, operator_has_go_live_approval
from .models import (
    AccountMember,
    Approval,
    ApprovalStatus,
    EmailMessage,
    Operator,
    Rfq,
    RfqKind,
    SeatInvitation,
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
SELF_SERVICE = {"seat_invite", "password_reset", "account_notice", "email_verification"}
PURPOSES = OPERATOR_FACING | MEMBER_FACING | SELF_SERVICE | {"outreach"}
GROUND_KINDS = {RfqKind.rental_car.value, RfqKind.chauffeur.value}


def _norm(addr: str) -> str:
    return normalize_email(addr)


def is_suppressed(db: Session, address: str) -> bool:
    n = _norm(address)
    return bool(n) and db.execute(select(Suppression.id).where(func.lower(Suppression.email) == n).limit(1)).first() is not None


def _account_emails(db: Session, account_id: uuid.UUID) -> set[str]:
    rows = db.execute(
        select(User.email).join(AccountMember, AccountMember.user_id == User.id).where(AccountMember.account_id == account_id)
    ).scalars()
    return {_norm(e) for e in rows}


def _authorize(db: Session, purpose, recipients, rfq, actor_user_id, approval_id, account_id, invitation_id) -> str | None:
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
    if purpose in ("password_reset", "account_notice"):
        if len(recipients) != 1:
            return "single_recipient_required"
        u = db.execute(select(User).where(func.lower(User.email) == recipients[0])).scalar_one_or_none()
        return None if u is not None and u.is_active else "recipient_not_user"
    if purpose == "email_verification":
        if len(recipients) != 1:
            return "single_recipient_required"
        u = db.execute(select(User).where(func.lower(User.email) == recipients[0])).scalar_one_or_none()
        return None if u is not None and u.is_active and u.email_verified_at is None else "recipient_not_unverified_user"
    if purpose == "seat_invite":
        inv = db.get(SeatInvitation, invitation_id) if invitation_id else None
        if inv is None or inv.accepted_at or inv.revoked_at or inv.expires_at < clock.now():
            return "invitation_not_pending"
        if recipients != [inv.email]:
            return "recipient_not_invitee"
        owner = db.execute(select(AccountMember.id).where(
            AccountMember.account_id == inv.account_id, AccountMember.user_id == inv.invited_by,
            AccountMember.is_owner.is_(True))).first()
        return None if owner is not None else "inviter_not_owner"
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
    if not operator_sellable(op) or not operator_has_go_live_approval(db, op.id):
        return "operator_not_live_or_excluded"
    if approved_approval(db, "rfq_dispatch_policy", "operator", str(op.id)) is None:
        return "operator_missing_dispatch_policy"
    return None


def _record_independently(msg: EmailMessage, *, status: str, reason: str | None, actor: str, purpose: str) -> None:
    """Persist a blocked/failed message (and its audit row) in a separate transaction."""
    for attempt in (0, 1):
        with session_factory()() as s:
            row = EmailMessage(
                direction=msg.direction, mailbox=msg.mailbox, from_address=msg.from_address, to_addresses=list(msg.to_addresses),
                subject=msg.subject, body_text=msg.body_text, purpose=msg.purpose, status=status, thread_id=msg.thread_id,
                rfq_id=msg.rfq_id if attempt == 0 else None, approval_id=msg.approval_id if attempt == 0 else None,
            )
            s.add(row)
            try:
                s.flush()
            except IntegrityError:  # the referenced rfq/approval is still uncommitted in the caller: record without the link
                s.rollback()
                continue
            audit(s, actor=actor, action="mail.blocked" if status == "blocked" else "mail.failed", subject_type="email_message",
                  subject_id=row.id, detail={"purpose": purpose, "reason": reason or status})
            s.commit()
            return


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
    invitation_id: uuid.UUID | None = None,
    stored_body: str | None = None,
) -> EmailMessage:
    """`stored_body`, when given, is what is persisted instead of `body` (use it to keep one-time tokens out of the DB)."""
    settings = get_settings()
    recipients = list(dict.fromkeys(n for n in (_norm(a) for a in to if a and a.strip()) if n))
    msg = EmailMessage(
        direction="outbound", mailbox=settings.rfq_from_address, from_address=settings.rfq_from_address,
        to_addresses=recipients, subject=subject[:998], body_text=stored_body if stored_body is not None else body,
        purpose=purpose, rfq_id=rfq.id if rfq is not None else None, approval_id=approval_id, status="queued",
        thread_id=rfq.thread_id if rfq is not None else None,
    )
    actor = f"user:{actor_user_id}" if actor_user_id else "system"
    violation: str | None = None
    if recipients and any(is_suppressed(db, r) for r in recipients):
        violation = "recipient_suppressed"
    if violation is None:
        violation = _authorize(db, purpose, recipients, rfq, actor_user_id, approval_id, account_id, invitation_id)
    if violation is not None:
        _record_independently(msg, status="blocked", reason=violation, actor=actor, purpose=purpose)
        raise GuardrailViolation(violation)

    try:
        res = get_mail().send(OutboundMessage(settings.rfq_from_address, recipients, msg.subject, body, msg.thread_id))
    except ProviderError:
        _record_independently(msg, status="failed", reason="provider_error", actor=actor, purpose=purpose)
        raise
    msg.status = "sent"
    msg.sent_at = datetime.now(UTC)
    msg.provider_message_id = res.provider_message_id
    msg.thread_id = res.thread_id
    db.add(msg)
    db.flush()
    return msg
