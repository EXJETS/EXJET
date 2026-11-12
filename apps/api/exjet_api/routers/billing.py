from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from .. import schemas as S
from ..audit import audit
from ..config import get_settings
from ..deps import get_session, require_owner, require_viewer
from ..entitlements import Viewer
from ..errors import ApiError, conflict
from ..models import EnterpriseInquiry, KycStatus, SubscriptionStatus
from ..providers import get_billing
from ..providers.errors import ProviderError
from ..ratelimit import hit
from ..services import billing_service as B

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/plans", response_model=list[S.PlanOut])
def plans():
    return B.list_plans()


@router.post("/checkout", response_model=S.CheckoutOut)
def checkout(body: S.CheckoutIn, viewer: Viewer = Depends(require_owner), db: Session = Depends(get_session)):
    if viewer.account.kyc_status != KycStatus.approved.value:
        raise conflict("kyc_required", "Complete the identity check before choosing a membership.")
    sub = B.get_subscription(db, viewer.account.id)
    if sub is not None and sub.status == SubscriptionStatus.active.value:
        raise conflict("already_subscribed", "This account already has an active membership.")
    url = B.start_checkout(db, viewer.account, body.plan, viewer.user.email)
    db.commit()
    return S.CheckoutOut(checkout_url=url)


@router.post("/portal", response_model=S.PortalOut)
def portal(viewer: Viewer = Depends(require_owner), db: Session = Depends(get_session)):
    sub = B.get_subscription(db, viewer.account.id)
    if sub is None or not sub.provider_customer_id:
        raise conflict("no_subscription", "There is no membership to manage yet.")
    return S.PortalOut(url=get_billing().create_portal(customer_id=sub.provider_customer_id, return_url=get_settings().app_base_url))


@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_session)):
    body = await request.body()
    sig = request.headers.get("x-webhook-signature") or request.headers.get("stripe-signature")
    try:
        ev = get_billing().parse_webhook(body, sig)
    except ProviderError as e:
        raise ApiError(400, "invalid_signature", "Webhook signature could not be verified.") from e
    outcome = B.apply_event(db, ev)
    db.commit()
    return {"received": True, "outcome": outcome}


@router.post("/enterprise-inquiry", status_code=202)
def enterprise_inquiry(body: S.EnterpriseInquiryIn, viewer: Viewer = Depends(require_viewer), db: Session = Depends(get_session)):
    """Enterprise has no price. The inquiry is recorded for the CEO to follow up; nothing is quoted.
    The free text is stored encrypted in enterprise_inquiries; audit_log carries only the inquiry id."""
    hit("enterprise_inquiry_user", str(viewer.user.id))
    inq = EnterpriseInquiry(account_id=viewer.account.id if viewer.account else None, user_id=viewer.user.id,
                            company=body.company, seats=body.seats, notes=body.notes, contact_name=body.contact_name,
                            contact_email=body.contact_email, contact_phone=body.contact_phone)
    db.add(inq)
    db.flush()
    audit(db, actor=f"user:{viewer.user.id}", action="enterprise_inquiry", subject_type="enterprise_inquiry",
          subject_id=inq.id, detail={"inquiry_id": str(inq.id)})
    db.commit()
    return {"status": "received"}
