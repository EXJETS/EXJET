"""The name EXJET may put in front of third parties for a member: the KYC-verified holder name, never the
self-chosen `full_name` (H3)."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import AccountMember, Approval, ApprovalStatus, KycStatus, KycSubmission


def verified_holder_name(db: Session, account_id: uuid.UUID, user_id: uuid.UUID) -> str | None:
    """holder_name of the approved (admin-decided) KYC submission that covers this person: their own check when they
    are an invited member, the account's check when they are the owner. None when there is none."""
    m = db.execute(select(AccountMember).where(AccountMember.account_id == account_id, AccountMember.user_id == user_id)
                   ).scalar_one_or_none()
    if m is None:
        return None
    q = select(KycSubmission).where(KycSubmission.account_id == account_id, KycSubmission.status == KycStatus.approved.value)
    q = q.where(KycSubmission.subject_user_id.is_(None)) if m.is_owner else q.where(KycSubmission.subject_user_id == user_id)
    for sub in db.execute(q.order_by(KycSubmission.reviewed_at.desc().nulls_last(), KycSubmission.created_at.desc())).scalars():
        ok = db.execute(select(Approval.id).where(
            Approval.kind == "kyc_final", Approval.subject_type == "kyc_submission", Approval.subject_id == str(sub.id),
            Approval.status == ApprovalStatus.approved.value, Approval.decided_by.is_not(None)).limit(1)).first()
        if ok is not None and sub.holder_name.strip():
            return sub.holder_name.strip()
    return None
