from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from .. import schemas as S
from ..audit import audit
from ..deps import (
    get_owned_trip,
    get_session,
    load_viewer,
    require_entitled,
    require_viewer,
    user_from_cookie,
)
from ..entitlements import Viewer
from ..errors import forbidden, not_found
from ..filetypes import FILE_RESPONSE_HEADERS, KYC_TYPES, content_disposition
from ..models import Contract, Document, Quote, Trip
from ..providers import get_storage
from ..security import verify_blob
from ..serializers import Builder
from ..services import quote_service as Q
from ..services.documents import signed_document_url

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


def authorize_document(db: Session, viewer: Viewer, doc: Document) -> None:
    """Admins read any document; a member reads documents of their own account, while entitled."""
    if viewer.is_admin:
        return
    acct = _document_account_id(db, doc)
    if acct is None or viewer.account is None or acct != viewer.account.id:
        raise not_found("Document not found.")  # no existence leak across accounts
    if not viewer.entitled:
        raise forbidden("An active membership is required to view operator documents.")


@router.get("/documents/{document_id}")
def get_document(document_id: uuid.UUID, viewer: Viewer = Depends(require_viewer), db: Session = Depends(get_session)):
    doc = db.get(Document, document_id)
    if doc is None:
        raise not_found("Document not found.")
    authorize_document(db, viewer, doc)
    if doc.kind == "kyc" or doc.owner_type == "kyc_submission":
        audit(db, actor=f"user:{viewer.user.id}", action="kyc_document_access", subject_type="document", subject_id=doc.id,
              detail={"owner_id": str(doc.owner_id)})
    url = signed_document_url(doc, viewer.user.id)
    db.commit()
    return RedirectResponse(url, status_code=302, headers={"Cache-Control": "private, no-store"})


@router.get("/files/{token}", include_in_schema=False)
def serve_file(token: str, request: Request, db: Session = Depends(get_session)):
    """Serves a local-storage object. The signed token binds the storage key, the DOCUMENT id and the VIEWER's user id
    and expires; the caller must be signed in as that same user, and still be allowed to read the document (L7).
    Files are always a download, never rendered from this origin (H1)."""
    user = user_from_cookie(request, db)
    payload = verify_blob(token)
    if user is None or not payload or not {"k", "d", "u"} <= payload.keys() or payload["u"] != str(user.id):
        raise not_found()
    try:
        doc = db.get(Document, uuid.UUID(payload["d"]))
    except ValueError:
        raise not_found() from None
    if doc is None or doc.storage_key != payload["k"]:
        raise not_found()
    authorize_document(db, load_viewer(db, user), doc)
    try:
        data = get_storage().get(doc.storage_key)
    except FileNotFoundError:
        raise not_found() from None
    ctype = doc.content_type if doc.content_type in KYC_TYPES else "application/octet-stream"
    return Response(data, media_type=ctype, headers={**FILE_RESPONSE_HEADERS, "Content-Disposition": content_disposition(doc.filename)})
