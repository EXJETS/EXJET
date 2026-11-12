"""Suppression list writes and the inbound keyword handler (M1).

Every address goes through emailnorm.normalize_email on write; the unique index is on lower(email). mailer.send() checks
the same normalized form for every recipient, so 'Ops@Example.com', ' ops@example.com' and the IDNA form of a domain are one
address.
"""
from __future__ import annotations

import re
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..audit import audit, record_agent_action
from ..emailnorm import normalize_email
from ..errors import unprocessable
from ..models import Approval, EmailMessage, Suppression

REASONS = ("unsubscribe", "bounce", "complaint", "legal", "manual")

# Rules-based classification, strongest first. Deliberately specific phrases: a false positive silences a real contact.
_LEGAL = re.compile(
    r"\b(cease and desist|cease-and-desist|attorney|lawyer|legal counsel|legal action|lawsuit|sue you|subpoena|"
    r"violation of (?:the )?(?:can-?spam|gdpr|ccpa|tcpa|law)|general counsel)\b", re.IGNORECASE)
_COMPLAINT = re.compile(
    r"\b(this is spam|reported? (?:this|you|it) (?:as|for) spam|mark(?:ed|ing)? (?:this )?as spam|harass(?:ing|ment)?|phishing|"
    r"scam(?:mer)?|fraudulent|file a complaint|report you)\b", re.IGNORECASE)
_UNSUBSCRIBE = re.compile(
    r"\b(unsubscribe|remove me|take me off|opt[- ]?out|stop (?:emailing|sending|contacting|messaging)|"
    r"do not (?:email|contact|send)|don'?t (?:email|contact) me)\b", re.IGNORECASE)


def classify_reply(subject: str | None, body: str | None) -> str | None:
    """'legal' | 'complaint' | 'unsubscribe' | None."""
    text = f"{subject or ''}\n{body or ''}"[:20000]
    for reason, rx in (("legal", _LEGAL), ("complaint", _COMPLAINT), ("unsubscribe", _UNSUBSCRIBE)):
        if rx.search(text):
            return reason
    return None


def suppress(db: Session, email: str, reason: str, source: str, *, actor: str = "system") -> Suppression:
    """Add an address to the do-not-email list (idempotent). Writes audit_log."""
    n = normalize_email(email)
    if not n:
        raise unprocessable("invalid_email", "Not a valid email address.")
    if reason not in REASONS:
        raise unprocessable("invalid_reason", f"reason must be one of {', '.join(REASONS)}.")
    row = db.execute(select(Suppression).where(func.lower(Suppression.email) == n)).scalar_one_or_none()
    created = row is None
    if row is None:
        row = Suppression(email=n, reason=reason, source=source[:64])
        db.add(row)
        db.flush()
    audit(db, actor=actor, action="suppression.added" if created else "suppression.exists", subject_type="suppression",
          subject_id=row.id, detail={"reason": reason, "source": source[:64]})
    return row


def unsuppress(db: Session, suppression_id: uuid.UUID, *, actor: str) -> bool:
    row = db.get(Suppression, suppression_id)
    if row is None:
        return False
    db.delete(row)
    audit(db, actor=actor, action="suppression.removed", subject_type="suppression", subject_id=suppression_id,
          detail={"reason": row.reason})
    return True


def handle_inbound_keywords(db: Session, msg: EmailMessage, sender: str | None) -> str | None:
    """Suppress the sender of an inbound reply that asks to stop, complains, or threatens legal action. Only an
    authenticated sender (provider-reported DMARC pass) can suppress an address, so a forged From cannot silence someone.
    legal / complaint also open an admin review item. Returns the reason when the message was handled here."""
    if sender is None or (msg.auth_result or {}).get("dmarc_pass") is not True:
        return None
    reason = classify_reply(msg.subject, msg.body_text)
    if reason is None:
        return None
    suppress(db, sender, reason, source=f"inbound:{str(msg.id)[:8]}")
    if reason in ("legal", "complaint"):
        db.add(Approval(kind="legal_notice", subject_type="email_message", subject_id=str(msg.id), required_role="ceo",
                        requested_by="system", summary=f"Inbound {reason} notice: sender suppressed, review the message",
                        payload={"reason": reason}))
    msg.status = "handled"
    record_agent_action(db, agent="inbound_handler", event=f"inbound.{reason}", input={"message_id": str(msg.id)},
                        output={"suppressed": True}, permission_level="EXECUTE",
                        status="awaiting_approval" if reason in ("legal", "complaint") else "done")
    return reason
