"""Hard guardrails that must hold regardless of which route or job calls them."""
from __future__ import annotations

from sqlalchemy import event, select
from sqlalchemy.orm import Session, attributes

from .models import Account, Approval, ApprovalStatus, KycStatus, KycSubmission


class GuardrailViolation(Exception):
    """An action was refused by a guardrail. `code` is stable and safe to show."""

    def __init__(self, code: str, message: str | None = None):
        super().__init__(message or code)
        self.code = code


# --------------------------------------------------------------------------- approval lookups
def approved_approval(db: Session, kind: str, subject_type: str, subject_id: str) -> Approval | None:
    return db.execute(
        select(Approval).where(
            Approval.kind == kind, Approval.subject_type == subject_type, Approval.subject_id == str(subject_id),
            Approval.status == ApprovalStatus.approved.value, Approval.decided_by.is_not(None),
        ).limit(1)
    ).scalar_one_or_none()


def kyc_has_admin_approval(db: Session, account_id) -> bool:
    ids = [str(i) for i in db.execute(select(KycSubmission.id).where(KycSubmission.account_id == account_id)).scalars()]
    if not ids:
        return False
    return db.execute(
        select(Approval.id).where(
            Approval.kind == "kyc_final", Approval.subject_type == "kyc_submission", Approval.subject_id.in_(ids),
            Approval.status == ApprovalStatus.approved.value, Approval.decided_by.is_not(None),
        ).limit(1)
    ).first() is not None


def operator_has_go_live_approval(db: Session, operator_id) -> bool:
    return approved_approval(db, "operator_go_live", "operator", str(operator_id)) is not None


# --------------------------------------------------------------------------- ORM-level enforcement
def _became(obj, attr: str, value: str) -> bool:
    hist = attributes.get_history(obj, attr, passive=attributes.PASSIVE_NO_INITIALIZE)
    return value in (hist.added or [])


@event.listens_for(Session, "before_flush")
def _enforce_state_guards(session: Session, flush_context, instances) -> None:
    """KYC `approved` needs an approved kyc_final approval decided by a person (guardrail 6).

    Operator go-live is enforced differently: only the admin approval route sets `live`, and
    mailer.send() independently requires an approved rfq_dispatch_policy row for the operator, so an
    operator flipped to live by other means still cannot be sent an RFQ."""
    with session.no_autoflush:
        for obj in list(session.new) + list(session.dirty):
            if isinstance(obj, Account) and _became(obj, "kyc_status", KycStatus.approved.value):
                if not kyc_has_admin_approval(session, obj.id):
                    raise GuardrailViolation("kyc_requires_admin_decision")
