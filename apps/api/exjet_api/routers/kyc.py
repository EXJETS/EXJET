from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas as S
from ..deps import get_session, require_member
from ..entitlements import Viewer, member_identity_status
from ..errors import conflict, unprocessable
from ..filetypes import KYC_TYPES, sniff  # noqa: F401  (sniff re-exported for callers/tests)
from ..models import Account, KycStatus, KycSubmission
from ..ratelimit import hit
from ..services import kyc_service as K

router = APIRouter(prefix="/kyc", tags=["kyc"])


@router.post("/submissions", response_model=S.KycSubmissionOut, status_code=201)
def submit(
    kind: str = Form(...),
    holder_name: str = Form(..., min_length=1, max_length=200),
    business_name: str | None = Form(None, max_length=200),
    business_tax_id: str | None = Form(None, max_length=64),
    files: list[UploadFile] = File(...),
    doc_types: list[str] = Form(...),
    viewer: Viewer = Depends(require_member),
    db: Session = Depends(get_session),
):
    """The OWNER submits the account's check (individual or business). An invited member submits only their own
    individual identity (their personal entitlement depends on it); they cannot touch the account's check."""
    hit("kyc_upload_user", str(viewer.user.id))
    acct: Account = viewer.account
    member = viewer.member
    own_scope = viewer.is_owner
    current = acct.kyc_status if own_scope else member.identity_status
    if current not in (KycStatus.not_started.value, KycStatus.rejected.value):
        raise conflict("kyc_not_resubmittable", "An identity check is already in progress or approved.")
    if kind not in ("individual", "business"):
        raise unprocessable("invalid_kind", "kind must be individual or business.")
    if not own_scope and (kind != "individual" or business_name or business_tax_id):
        raise unprocessable("member_individual_only", "Invited members submit their own individual identity check only.")
    if len(files) != len(doc_types) or not (1 <= len(files) <= 6):
        raise unprocessable("invalid_documents", "Provide 1 to 6 files, each with a matching doc_type.")
    allowed = {"passport", "drivers_license"} if kind == "individual" else {"business_doc", "passport", "drivers_license"}
    if any(t not in allowed for t in doc_types):
        raise unprocessable("invalid_doc_type", "A doc_type is not allowed for this kind of submission.")
    if kind == "business":
        if not business_name or not business_tax_id:
            raise unprocessable("business_details_required", "business_name and business_tax_id are required for business checks.")
        if "business_doc" not in doc_types:
            raise unprocessable("business_doc_required", "Include a business document.")
    elif not ({"passport", "drivers_license"} & set(doc_types)):
        raise unprocessable("identity_document_required", "Include a passport or driver's license.")
    prepared = []
    for f, t in zip(files, doc_types, strict=True):
        data = f.file.read(K.MAX_FILE_BYTES + 1)
        if len(data) > K.MAX_FILE_BYTES:
            raise unprocessable("file_too_large", "Each file must be 10 MB or smaller.")
        ctype = sniff(data)
        if ctype is None or ctype not in KYC_TYPES:
            raise unprocessable("unsupported_file_type", "Files must be PDF, JPEG or PNG.")
        prepared.append((f.filename or "document", ctype, data, t))
    sub = KycSubmission(account_id=acct.id, submitted_by=viewer.user.id, kind=kind, holder_name=holder_name.strip(),
                        status=KycStatus.submitted.value, subject_user_id=None if own_scope else viewer.user.id)
    db.add(sub)
    db.flush()
    K.store_kyc_documents(db, sub, prepared)
    if own_scope:
        if kind == "business":
            acct.business_name, acct.business_tax_id = business_name, business_tax_id
        acct.kyc_status = KycStatus.submitted.value
    else:
        member.identity_status = KycStatus.submitted.value
    K.queue_vendor_check(db, sub)
    db.commit()
    return S.KycSubmissionOut(id=sub.id, status=sub.status)


@router.get("/status", response_model=S.KycStatusOut)
def status(viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    q = select(KycSubmission).where(KycSubmission.account_id == viewer.account.id)
    q = q.where(KycSubmission.subject_user_id.is_(None)) if viewer.is_owner else q.where(KycSubmission.subject_user_id == viewer.user.id)
    sub = db.execute(q.order_by(KycSubmission.created_at.desc()).limit(1)).scalar_one_or_none()
    latest = None
    if sub:
        latest = S.KycLatest(id=sub.id, status=sub.status, created_at=sub.created_at, decision_note=sub.decision_note)
    return S.KycStatusOut(kyc_status=member_identity_status(viewer.account, viewer.member), latest_submission=latest,
                          scope="account" if viewer.is_owner else "member")
