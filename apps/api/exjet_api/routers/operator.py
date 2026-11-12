"""Operator-facing read-only access. No session: the secret is the single-recipient token in the emailed link."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.orm import Session

from .. import schemas as S
from ..deps import get_session
from ..ratelimit import client_ip, hit
from ..security import token_hash
from ..services import manifest_links

router = APIRouter(prefix="/operator", tags=["operator"])


@router.get("/manifest", response_model=S.OperatorManifestOut)
def operator_manifest(request: Request, response: Response, token: str = Query(default="", max_length=100000),
                      db: Session = Depends(get_session)):
    """The submitted manifest for one trip, for the operator contact the link was issued to. Rate limited per client
    address and per token; every use of a known token is written to audit_log (ip, time, token id)."""
    ip = client_ip(request)
    hit("operator_manifest_ip", ip)
    hit("operator_manifest_token", token_hash(token)[:32])  # a malformed or missing token is just another unknown token
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    response.headers["Cache-Control"] = "no-store"
    return manifest_links.read_via_link(db, token, ip)
