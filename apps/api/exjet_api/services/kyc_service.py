"""KYC: submission, vendor check (signals only), final decision (admin, via Approval rows)."""
from __future__ import annotations

import hashlib
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..audit import record_agent_action
from ..jobs import enqueue
from ..models import Account, AccountMember, Approval, Document, KycStatus, KycSubmission
from ..providers import get_kyc, get_storage
from ..providers.kyc import KycDocumentRef
from ..providers.storage import new_key, safe_filename

ALLOWED_TYPES = {"application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png"}
MAX_FILE_BYTES = 10 * 1024 * 1024
DOC_TYPES = {"passport", "drivers_license", "business_doc"}


def store_kyc_documents(db: Session, submission: KycSubmission, files: list[tuple[str, str, bytes, str]]) -> None:
    """files: (filename, content_type, data, doc_type)."""
    storage = get_storage()
    for filename, ctype, data, doc_type in files:
        key = new_key("kyc", submission.id)  # random: the uploader's filename never reaches the storage layer
        storage.put(key, data, ctype)
        db.add(Document(
            kind="kyc", owner_type="kyc_submission", owner_id=submission.id, doc_type=doc_type, storage_key=key,
            filename=safe_filename(filename), content_type=ctype, size_bytes=len(data),
            sha256=hashlib.sha256(data).hexdigest(),
        ))


def queue_vendor_check(db: Session, submission: KycSubmission) -> None:
    enqueue(db, "kyc.vendor_check", {"submission_id": str(submission.id)}, dedupe_key=f"kyc.vendor_check:{submission.id}")


def run_vendor_check(db: Session, submission_id: uuid.UUID) -> None:
    sub = db.get(KycSubmission, submission_id)
    if sub is None or sub.status != KycStatus.submitted.value:
        return
    docs = db.execute(select(Document).where(Document.owner_type == "kyc_submission", Document.owner_id == sub.id)).scalars().all()
    result = get_kyc().check(
        submission_id=sub.id, kind=sub.kind, holder_name=sub.holder_name,
        documents=[KycDocumentRef(d.doc_type or "", d.content_type, d.size_bytes, d.sha256) for d in docs],
    )
    sub.vendor, sub.vendor_ref, sub.vendor_result = result.vendor, result.vendor_ref, result.signals
    sub.status = KycStatus.in_review.value  # waiting for a human; the vendor can never approve
    _set_status(db, sub, KycStatus.in_review.value)
    ap = Approval(
        kind="kyc_final", subject_type="kyc_submission", subject_id=str(sub.id), required_role="ceo",
        requested_by="system", summary=f"KYC final decision for {sub.kind} submission (vendor clear: {result.all_clear})",
        payload={"vendor": result.vendor, "signals": result.signals, "account_id": str(sub.account_id)},
    )
    db.add(ap)
    db.flush()
    record_agent_action(db, agent="kyc_vendor", event="kyc.vendor_check", input={"submission_id": str(sub.id)},
                        output={"all_clear": result.all_clear}, permission_level="READ", account_id=sub.account_id,
                        approval_id=ap.id)


def apply_final_decision(db: Session, approval: Approval, decision: str, admin_id: uuid.UUID, note: str | None) -> None:
    """Called from the approvals decide route after the Approval row is persisted as decided."""
    sub = db.get(KycSubmission, uuid.UUID(approval.subject_id))
    if sub is None:
        return
    sub.reviewed_by, sub.reviewed_at, sub.decision_note = admin_id, datetime.now(UTC), note
    if decision == "approved":
        sub.status = KycStatus.approved.value
        db.flush()  # approval row is already flushed; the guard checks it when the status flips
        _set_status(db, sub, KycStatus.approved.value)
    else:
        sub.status = KycStatus.rejected.value
        _set_status(db, sub, KycStatus.rejected.value)
    db.flush()


def _set_status(db: Session, sub: KycSubmission, status: str) -> None:
    """The account's check moves the account; a member's own check moves only that member's identity_status."""
    if sub.subject_user_id is None:
        db.get(Account, sub.account_id).kyc_status = status
        return
    m = db.execute(select(AccountMember).where(AccountMember.account_id == sub.account_id,
                                               AccountMember.user_id == sub.subject_user_id)).scalar_one_or_none()
    if m is not None:
        m.identity_status = status
