"""agent_actions and audit_log writers. Never pass PII or document contents in `input`/`output`/`detail`."""
from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from .models import AgentAction, AuditLog


def record_agent_action(
    db: Session,
    *,
    agent: str,
    event: str,
    input: dict | None = None,
    output: dict | None = None,
    status: str = "done",
    permission_level: str = "DRAFT",
    account_id: uuid.UUID | None = None,
    approval_id: uuid.UUID | None = None,
    model: str | None = None,
    input_tokens: int = 0,
    output_tokens: int = 0,
    error: str | None = None,
) -> AgentAction:
    row = AgentAction(
        agent=agent, event=event, input=input, output=output, status=status, permission_level=permission_level,
        account_id=account_id, approval_id=approval_id, model=model, input_tokens=input_tokens,
        output_tokens=output_tokens, error=error[:2000] if error else None,
    )
    db.add(row)
    db.flush()
    return row


def audit(db: Session, *, actor: str, action: str, subject_type: str | None = None,
          subject_id: str | uuid.UUID | None = None, detail: dict | None = None) -> None:
    db.add(AuditLog(actor=actor, action=action, subject_type=subject_type,
                    subject_id=str(subject_id) if subject_id is not None else None, detail=detail))
    db.flush()
