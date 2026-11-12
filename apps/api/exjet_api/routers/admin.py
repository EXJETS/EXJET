from __future__ import annotations

import importlib
import statistics
import uuid

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import clock, schemas as S
from ..audit import audit
from ..deps import get_session, require_admin
from ..entitlements import Viewer
from ..errors import ApiError, conflict, not_found
from ..models import (
    AgentAction,
    Aircraft,
    Approval,
    ApprovalStatus,
    Document,
    GoLiveStatus,
    IngestRun,
    Job,
    KycStatus,
    KycSubmission,
    Operator,
    OperatorContact,
    Quote,
    QuoteStatus,
    Rfq,
    Subscription,
    SubscriptionStatus,
)
from ..providers import get_storage
from ..services import kyc_service, quote_service
from ..supply import is_excluded_operator

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


# --------------------------------------------------------------------------- approvals
@router.get("/approvals", response_model=list[S.ApprovalOut])
def approvals(status: str | None = None, kind: str | None = None, limit: int = Query(100, ge=1, le=500),
              db: Session = Depends(get_session)):
    stmt = select(Approval).order_by(Approval.created_at.desc()).limit(limit)
    if status:
        stmt = stmt.where(Approval.status == status)
    if kind:
        stmt = stmt.where(Approval.kind == kind)
    return db.execute(stmt).scalars().all()


@router.post("/approvals/{approval_id}/decide", response_model=S.ApprovalOut)
def decide(approval_id: uuid.UUID, body: S.DecideIn, viewer: Viewer = Depends(require_admin), db: Session = Depends(get_session)):
    ap = db.get(Approval, approval_id)
    if ap is None:
        raise not_found("Approval not found.")
    if ap.status != ApprovalStatus.pending.value:
        raise conflict("already_decided", "This approval has already been decided.")
    # pre-flight checks that must refuse before anything is persisted
    if ap.kind == "kyc_final":
        sub = db.get(KycSubmission, uuid.UUID(ap.subject_id))
        if sub is None or sub.status != KycStatus.in_review.value:
            raise conflict("invalid_state", "The identity check is not awaiting a decision.")
    if ap.kind == "operator_go_live" and body.decision == "approved":
        op = db.get(Operator, uuid.UUID(ap.subject_id))
        if op is None:
            raise not_found("Operator not found.")
        if is_excluded_operator(op):
            raise conflict("operator_excluded", "This operator is on the exclusion list and can never go live.")
    ap.status = body.decision
    ap.decided_by = viewer.user.id
    ap.decided_at = clock.now()
    ap.decision_note = body.note
    db.flush()  # the guards read the persisted decision
    if ap.kind == "kyc_final":
        kyc_service.apply_final_decision(db, ap, body.decision, viewer.user.id, body.note)
    elif ap.kind == "operator_go_live":
        op = db.get(Operator, uuid.UUID(ap.subject_id))
        if body.decision == "approved":
            op.go_live_status = GoLiveStatus.live.value
            db.add(Approval(
                kind="rfq_dispatch_policy", subject_type="operator", subject_id=str(op.id), required_role="ceo",
                status=ApprovalStatus.approved.value, requested_by="system", decided_by=viewer.user.id, decided_at=clock.now(),
                summary="Standing authorization to send member-initiated RFQs to this operator", payload={"from_approval": str(ap.id)}))
        else:
            op.go_live_status = GoLiveStatus.draft.value
    audit(db, actor=f"user:{viewer.user.id}", action="approval.decided", subject_type="approval", subject_id=ap.id,
          detail={"kind": ap.kind, "decision": body.decision})
    db.commit()
    return ap


# --------------------------------------------------------------------------- kyc
def _holder(sub: KycSubmission, with_docs: bool, db: Session, admin_id: uuid.UUID) -> S.AdminKycSubmission:
    docs: list[S.AdminDocument] = []
    if with_docs:
        for d in db.execute(select(Document).where(Document.owner_type == "kyc_submission", Document.owner_id == sub.id)).scalars():
            audit(db, actor=f"user:{admin_id}", action="kyc_document_access", subject_type="document", subject_id=d.id,
                  detail={"submission_id": str(sub.id)})
            docs.append(S.AdminDocument(id=d.id, doc_type=d.doc_type, filename=d.filename, content_type=d.content_type,
                                        size_bytes=d.size_bytes, url=get_storage().signed_url(d.storage_key, 120)))
    return S.AdminKycSubmission(id=sub.id, account_id=sub.account_id, kind=sub.kind, holder_name=sub.holder_name, status=sub.status,
                                vendor=sub.vendor, vendor_result=sub.vendor_result, decision_note=sub.decision_note,
                                created_at=sub.created_at, documents=docs)


@router.get("/kyc/submissions", response_model=list[S.AdminKycSubmission])
def kyc_list(status: str | None = None, viewer: Viewer = Depends(require_admin), db: Session = Depends(get_session)):
    stmt = select(KycSubmission).order_by(KycSubmission.created_at.desc()).limit(200)
    if status:
        stmt = stmt.where(KycSubmission.status == status)
    return [_holder(s, False, db, viewer.user.id) for s in db.execute(stmt).scalars()]


@router.get("/kyc/submissions/{submission_id}", response_model=S.AdminKycSubmission)
def kyc_detail(submission_id: uuid.UUID, viewer: Viewer = Depends(require_admin), db: Session = Depends(get_session)):
    sub = db.get(KycSubmission, submission_id)
    if sub is None:
        raise not_found("Submission not found.")
    out = _holder(sub, True, db, viewer.user.id)
    db.commit()  # persists the audit rows
    return out


# --------------------------------------------------------------------------- operators
@router.get("/operators", response_model=list[S.AdminOperatorOut])
def operators(db: Session = Depends(get_session)):
    ac = dict(db.execute(select(Aircraft.operator_id, func.count()).group_by(Aircraft.operator_id)).all())
    ct = dict(db.execute(select(OperatorContact.operator_id, func.count()).group_by(OperatorContact.operator_id)).all())
    return [
        S.AdminOperatorOut(id=o.id, dba_name=o.dba_name, certificate_type=o.certificate_type, safety_rating=o.safety_rating,
                           is_excluded=is_excluded_operator(o), go_live_status=o.go_live_status,
                           aircraft_count=ac.get(o.id, 0), contact_count=ct.get(o.id, 0))
        for o in db.execute(select(Operator).order_by(Operator.dba_name)).scalars()
    ]


@router.post("/operators/{operator_id}/request-go-live", response_model=S.ApprovalOut, status_code=201)
def request_go_live(operator_id: uuid.UUID, viewer: Viewer = Depends(require_admin), db: Session = Depends(get_session)):
    op = db.get(Operator, operator_id)
    if op is None:
        raise not_found("Operator not found.")
    if is_excluded_operator(op):
        raise conflict("operator_excluded", "This operator is on the exclusion list.")
    if op.go_live_status not in (GoLiveStatus.draft.value, GoLiveStatus.suspended.value):
        raise conflict("invalid_state", "This operator is already live or awaiting approval.")
    has_contact = db.execute(select(OperatorContact.id).where(OperatorContact.operator_id == op.id, OperatorContact.receives_rfq.is_(True)).limit(1)).first()
    has_aircraft = db.execute(select(Aircraft.id).where(Aircraft.operator_id == op.id, Aircraft.is_active.is_(True)).limit(1)).first()
    if not has_contact or not has_aircraft:
        raise conflict("operator_incomplete", "An operator needs at least one RFQ contact and one active aircraft before go-live.")
    ap = Approval(kind="operator_go_live", subject_type="operator", subject_id=str(op.id), required_role="ceo",
                  requested_by=f"user:{viewer.user.id}", summary=f"Operator go-live: {op.dba_name}")
    db.add(ap)
    op.go_live_status = GoLiveStatus.pending_ceo.value
    db.commit()
    return ap


# --------------------------------------------------------------------------- ingest (owned by the data agent)
@router.post("/ingest", response_model=S.IngestRunOut)
def ingest(dataset: str = Form(...), file: UploadFile = File(...), viewer: Viewer = Depends(require_admin),
           db: Session = Depends(get_session)):
    """Delegates to exjet_api.ingest.run_dataset(db, dataset=, filename=, content=, started_by=) -> IngestRun.
    That package is owned by the data agent; until it exists this returns 501."""
    try:
        mod = importlib.import_module("exjet_api.ingest")
        run = getattr(mod, "run_dataset")
    except (ImportError, AttributeError):
        raise ApiError(501, "ingest_unavailable", "The ingest pipeline is not installed in this build.") from None
    data = file.file.read(50 * 1024 * 1024 + 1)
    if len(data) > 50 * 1024 * 1024:
        raise ApiError(422, "file_too_large", "File exceeds 50 MB.")
    result = run(db, dataset=dataset, filename=file.filename or "upload", content=data, started_by=f"user:{viewer.user.id}")
    db.commit()
    return result


@router.get("/ingest/runs", response_model=list[S.IngestRunOut])
def ingest_runs(limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_session)):
    return db.execute(select(IngestRun).order_by(IngestRun.created_at.desc()).limit(limit)).scalars().all()


# --------------------------------------------------------------------------- metrics, actions, jobs
@router.get("/metrics", response_model=S.MetricsOut)
def metrics(db: Session = Depends(get_session)):
    active = db.execute(select(Subscription).where(Subscription.status == SubscriptionStatus.active.value)).scalars().all()
    mrr = sum(s.unit_amount_cents for s in active)
    by_plan: dict[str, int] = {}
    for s in active:
        by_plan[s.plan] = by_plan.get(s.plan, 0) + 1
    kyc_queue = db.execute(select(func.count()).select_from(KycSubmission).where(
        KycSubmission.status.in_([KycStatus.submitted.value, KycStatus.in_review.value]))).scalar_one()
    sent = db.execute(select(Rfq.id, Rfq.sent_at, Rfq.replied_at).where(Rfq.sent_at.is_not(None))).all()
    rate = None
    if sent:
        quoted = set(db.execute(select(Quote.rfq_id).where(Quote.status.in_([
            QuoteStatus.ready.value, QuoteStatus.accepted.value, QuoteStatus.declined.value, QuoteStatus.expired.value]))).scalars())
        rate = round(sum(1 for r in sent if r.id in quoted) / len(sent), 4)
    mins = [(r.replied_at - r.sent_at).total_seconds() / 60 for r in sent if r.replied_at and r.sent_at]
    return S.MetricsOut(mrr_cents=mrr, arr_cents=mrr * 12, members_by_plan=by_plan, kyc_queue=kyc_queue, rfq_to_quote_rate=rate,
                        median_operator_response_minutes=round(statistics.median(mins), 2) if mins else None)


@router.get("/agent-actions", response_model=list[S.AgentActionOut])
def agent_actions(agent: str | None = None, status: str | None = None, limit: int = Query(100, ge=1, le=500),
                  db: Session = Depends(get_session)):
    stmt = select(AgentAction).order_by(AgentAction.created_at.desc()).limit(limit)
    if agent:
        stmt = stmt.where(AgentAction.agent == agent)
    if status:
        stmt = stmt.where(AgentAction.status == status)
    return db.execute(stmt).scalars().all()


@router.get("/jobs", response_model=list[S.JobOut])
def jobs(status: str | None = None, limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_session)):
    stmt = select(Job).order_by(Job.created_at.desc()).limit(limit)
    if status:
        stmt = stmt.where(Job.status == status)
    return db.execute(stmt).scalars().all()


# --------------------------------------------------------------------------- quote review
@router.get("/quotes", response_model=list[S.AdminQuoteReview])
def review_quotes(status: str = QuoteStatus.needs_review.value, db: Session = Depends(get_session)):
    out = []
    for q in db.execute(select(Quote).where(Quote.status == status).order_by(Quote.created_at)).scalars():
        out.append(S.AdminQuoteReview(id=q.id, trip_id=q.trip_id, rfq_id=q.rfq_id, status=q.status, flags=quote_service.quote_flags(q),
                                      parse_confidence=q.parse_confidence,
                                      pdf_url=get_storage().signed_url(db.get(Document, q.source_document_id).storage_key, 120)
                                      if q.source_document_id else None))
    return out


@router.post("/quotes/{quote_id}/resolve", response_model=S.AdminQuoteReview)
def resolve_quote(quote_id: uuid.UUID, body: S.ResolveQuoteIn, viewer: Viewer = Depends(require_admin), db: Session = Depends(get_session)):
    """Set the total on a needs_review quote. The amount must appear verbatim in the operator's PDF."""
    q = db.get(Quote, quote_id)
    if q is None:
        raise not_found("Quote not found.")
    quote_service.resolve_quote(db, q, total_cents=body.total_amount_cents, valid_until=body.valid_until, reject=body.reject,
                                admin_id=viewer.user.id)
    audit(db, actor=f"user:{viewer.user.id}", action="quote.resolved", subject_type="quote", subject_id=q.id, detail={"reject": body.reject})
    db.commit()
    return S.AdminQuoteReview(id=q.id, trip_id=q.trip_id, rfq_id=q.rfq_id, status=q.status, flags=quote_service.quote_flags(q),
                              parse_confidence=q.parse_confidence, pdf_url=None)
