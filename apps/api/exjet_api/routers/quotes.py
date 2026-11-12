from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Response
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas as S
from ..audit import audit
from ..deps import get_owned_trip, get_session, require_entitled, require_viewer
from ..entitlements import Viewer
from ..errors import forbidden, not_found
from ..models import Contract, Document, Quote, Trip
from ..providers import get_storage
from ..security import verify_blob
from ..serializers import Builder
from ..services import quote_service as Q

router = APIRouter(tags=["quotes"])


@router.get("/trips/{trip_id}/quotes", response_model=list[S.QuoteOut])
def trip_quotes(trip_id: uuid.UUID, viewer: Viewer = Depends(require_entitled), db: Session = Depends(get_session)):
    trip = get_owned_trip(db, viewer, trip_id)
    return Builder(db, viewer).trip(trip).quotes


@router.post("/quotes/{quote_id}/accept", response_model=S.TripOut)
def accept(quote_id: uuid.UUID, viewer: Viewer = Depends(require_entitled), db: Session = Depends(get_session)):
    q = Q.owned_quote(db, viewer.account.id, quote_id)
    trip = Q.accept_quote(db, q)
    db.commit()
    return Builder(db, viewer).trip(trip)


@router.post("/quotes/{quote_id}/decline", response_model=S.QuoteOut)
def decline(quote_id: uuid.UUID, viewer: Viewer = Depends(require_entitled), db: Session = Depends(get_session)):
    q = Q.owned_quote(db, viewer.account.id, quote_id)
    Q.decline_quote(db, q)
    db.commit()
    return Builder(db, viewer).quote(q)


@router.post("/contracts/{contract_id}/acknowledge", response_model=S.ContractOut)
def acknowledge(contract_id: uuid.UUID, viewer: Viewer = Depends(require_entitled), db: Session = Depends(get_session)):
    c = Q.acknowledge_contract(db, viewer.account.id, contract_id)
    db.commit()
    return S.ContractOut(id=c.id, pdf_url=f"/v1/documents/{c.document_id}", acknowledged_at=c.acknowledged_at)


@router.post("/quotes/{quote_id}/payment/mark-paid", response_model=S.TripOut)
def mark_paid(quote_id: uuid.UUID, viewer: Viewer = Depends(require_entitled), db: Session = Depends(get_session)):
    q = Q.owned_quote(db, viewer.account.id, quote_id)
    trip = Q.mark_paid(db, q)
    db.commit()
    return Builder(db, viewer).trip(trip)


def _document_account_id(db: Session, doc: Document):
    """The account that may read this document, or None when only admins may."""
    if doc.owner_type == "quote":
        q = db.get(Quote, doc.owner_id)
        return db.get(Trip, q.trip_id).account_id if q else None
    if doc.owner_type == "contract":
        c = db.get(Contract, doc.owner_id)
        return db.get(Trip, c.trip_id).account_id if c else None
    return None  # kyc_submission and unlinked email attachments: admin only


@router.get("/documents/{document_id}")
def get_document(document_id: uuid.UUID, viewer: Viewer = Depends(require_viewer), db: Session = Depends(get_session)):
    doc = db.get(Document, document_id)
    if doc is None:
        raise not_found("Document not found.")
    if not viewer.is_admin:
        acct = _document_account_id(db, doc)
        if acct is None or viewer.account is None or acct != viewer.account.id:
            raise not_found("Document not found.")  # no existence leak across accounts
        if not viewer.entitled:
            raise forbidden("An active membership is required to view operator documents.")
    if doc.kind == "kyc" or doc.owner_type == "kyc_submission":
        audit(db, actor=f"user:{viewer.user.id}", action="kyc_document_access", subject_type="document", subject_id=doc.id,
              detail={"owner_id": str(doc.owner_id)})
    url = get_storage().signed_url(doc.storage_key, 120)
    db.commit()
    return RedirectResponse(url, status_code=302, headers={"Cache-Control": "no-store"})


@router.get("/files/{token}", include_in_schema=False)
def serve_file(token: str, db: Session = Depends(get_session)):
    """Serves a local-storage object for a short-lived signed token (dev/local storage only)."""
    payload = verify_blob(token)
    if not payload or "k" not in payload:
        raise not_found()
    doc = db.execute(select(Document).where(Document.storage_key == payload["k"]).limit(1)).scalar_one_or_none()
    if doc is None:
        raise not_found()
    try:
        data = get_storage().get(doc.storage_key)
    except FileNotFoundError:
        raise not_found() from None
    return Response(data, media_type=doc.content_type, headers={
        "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
        "Content-Disposition": f'inline; filename="{doc.filename}"'})
