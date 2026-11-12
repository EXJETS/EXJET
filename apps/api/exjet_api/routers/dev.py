"""Dev/test only (env in dev,test): simulate an operator reply and drive jobs. Not even mounted in staging/prod.

The simulated reply must come from a stored operator contact address to be accepted by quote ingest; it carries the mail
provider's authentication verdict (`dmarc_pass`, `spf`, `dkim`), default pass, so tests can also simulate failure."""
from __future__ import annotations

import base64
import binascii
import time
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import jobs
from .. import schemas as S
from ..deps import get_session, require_dev_env
from ..errors import ApiError, conflict
from ..jobs import enqueue
from ..providers import get_billing, get_mail
from ..providers.billing import FakeBilling
from ..providers.mail import Attachment, FakeMail, InboundAuth, InboundEmail
from ..services import billing_service

router = APIRouter(prefix="/dev", tags=["dev"], dependencies=[Depends(require_dev_env)])


@router.post("/inbound-email", status_code=202)
def inbound_email(body: S.DevInboundEmail, db: Session = Depends(get_session)):
    mail = get_mail()
    if not isinstance(mail, FakeMail):
        raise conflict("not_fake_mail", "Inbound simulation needs the fake mail provider.")
    atts = []
    for a in body.attachments:
        try:
            data = base64.b64decode(a.content_base64, validate=True)
        except (binascii.Error, ValueError) as e:
            raise ApiError(422, "invalid_attachment", "Attachment is not valid base64.") from e
        atts.append(Attachment(a.filename, a.content_type, data))
    mail.inject_inbound(InboundEmail(
        provider_message_id=f"fakein_{uuid.uuid4().hex[:16]}", thread_id=body.thread_id, from_address=body.from_address,
        to=body.to, subject=body.subject, body_text=body.body, attachments=atts,
        auth=InboundAuth(dmarc_pass=body.dmarc_pass, spf=body.spf, dkim=body.dkim)))
    enqueue(db, "mail.poll_inbox", {}, dedupe_key=f"mail.poll_inbox:dev:{time.time_ns()}")
    db.commit()
    return {"queued": True}


@router.get("/outbox", response_model=list[S.DevOutboxMessage])
def outbox(to: str | None = None, purpose: str | None = None, limit: int = Query(50, ge=1, le=200)):
    """Recent messages the FAKE mail provider "sent", newest first, with the real body (verification, invitation, reset and
    manifest links) so an end-to-end run can follow them without a shim. Dev/test only: this router is not mounted otherwise.
    The outbox lives in this process's memory, so it shows mail sent by requests and by jobs run through POST /dev/run-jobs;
    a separate worker process has its own outbox."""
    from datetime import UTC, datetime

    from ..emailnorm import normalize_email

    mail = get_mail()
    if not isinstance(mail, FakeMail):
        raise conflict("not_fake_mail", "The outbox needs the fake mail provider.")
    want = normalize_email(to) if to else None
    out = []
    for msg, _ in reversed(mail.outbox):
        if want and want not in [normalize_email(a) for a in msg.to]:
            continue
        if purpose and msg.purpose != purpose:
            continue
        out.append(S.DevOutboxMessage(to=list(msg.to), subject=msg.subject, purpose=msg.purpose, body_text=msg.body_text,
                                      created_at=msg.created_at or datetime.now(UTC)))
        if len(out) >= limit:
            break
    return out


@router.post("/run-jobs")
def run_jobs():
    return {"ran": jobs.run_pending()}


@router.post("/complete-checkout")
def complete_checkout(body: S.DevCompleteCheckout, db: Session = Depends(get_session)):
    """Completes a fake checkout (stands in for the provider's webhook)."""
    billing = get_billing()
    if not isinstance(billing, FakeBilling):
        raise conflict("not_fake_billing", "Needs the fake billing provider.")
    payload, sig = billing.make_event("checkout.completed", body.account_id, body.plan,
                                      period_end_ts=int(time.time()) + 30 * 86400)
    billing_service.apply_event(db, billing.parse_webhook(payload, sig))
    db.commit()
    return {"completed": True}
