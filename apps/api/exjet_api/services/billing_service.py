"""Membership plans and subscription state."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas as S
from ..audit import record_agent_action
from ..config import get_settings
from ..models import Account, Subscription, SubscriptionStatus
from ..providers.billing import BillingEvent

# Locked product pricing. Changing a price requires an approved `plan_change` approval (guardrail 7);
# there is deliberately no endpoint that edits these.
PLANS = {
    "individual": {"name": "Individual", "unit_amount_cents": 75000, "seats": 1},
    "family_office": {"name": "Family Office", "unit_amount_cents": 100000, "seats": 2},
}


def list_plans() -> list[S.PlanOut]:
    out = [S.PlanOut(plan=k, name=v["name"], unit_amount_cents=v["unit_amount_cents"], interval="month", seats=v["seats"])
           for k, v in PLANS.items()]
    out.append(S.PlanOut(plan="enterprise", name="Enterprise", unit_amount_cents=None, interval=None, seats=None, inquiry_only=True))
    return out


def get_subscription(db: Session, account_id: uuid.UUID) -> Subscription | None:
    return db.execute(select(Subscription).where(Subscription.account_id == account_id)).scalar_one_or_none()


def start_checkout(db: Session, account: Account, plan: str, customer_email: str) -> str:
    from ..providers import get_billing

    cfg = PLANS[plan]
    s = get_settings()
    sess = get_billing().create_checkout(
        account_id=account.id, plan=plan, unit_amount_cents=cfg["unit_amount_cents"], customer_email=customer_email,
        success_url=f"{s.app_base_url}/billing", cancel_url=f"{s.app_base_url}/billing",
    )
    sub = get_subscription(db, account.id)
    if sub is None:
        sub = Subscription(account_id=account.id, plan=plan, status=SubscriptionStatus.incomplete.value,
                           provider=get_billing().name, unit_amount_cents=cfg["unit_amount_cents"])
        db.add(sub)
    elif sub.status != SubscriptionStatus.active.value:
        sub.plan, sub.unit_amount_cents = plan, cfg["unit_amount_cents"]
    sub.provider_customer_id = sess.customer_id
    db.flush()
    return sess.url


def apply_event(db: Session, ev: BillingEvent) -> None:
    acct = db.get(Account, ev.account_id)
    if acct is None:
        return
    sub = get_subscription(db, acct.id)
    if ev.type == "checkout.completed":
        plan = ev.plan if ev.plan in PLANS else (sub.plan if sub else None)
        if plan is None:
            return
        if sub is None:
            sub = Subscription(account_id=acct.id, plan=plan, status=SubscriptionStatus.incomplete.value,
                               provider="fake", unit_amount_cents=PLANS[plan]["unit_amount_cents"])
            db.add(sub)
        sub.plan, sub.unit_amount_cents = plan, PLANS[plan]["unit_amount_cents"]
        sub.status = SubscriptionStatus.active.value
        sub.provider_customer_id = ev.customer_id or sub.provider_customer_id
        sub.provider_subscription_id = ev.subscription_id or sub.provider_subscription_id
        sub.current_period_end = datetime.fromtimestamp(ev.current_period_end_ts, timezone.utc) if ev.current_period_end_ts else None
        sub.canceled_at = None
        acct.seats = PLANS[plan]["seats"]
        acct.type = plan
    elif sub is not None and ev.type == "subscription.renewed":
        sub.status = SubscriptionStatus.active.value
        if ev.current_period_end_ts:
            sub.current_period_end = datetime.fromtimestamp(ev.current_period_end_ts, timezone.utc)
    elif sub is not None and ev.type == "payment.failed":
        sub.status = SubscriptionStatus.past_due.value
    elif sub is not None and ev.type == "subscription.canceled":
        sub.status = SubscriptionStatus.canceled.value
        sub.canceled_at = datetime.now(timezone.utc)
    else:
        return
    record_agent_action(db, agent="billing", event=f"billing.{ev.type}", input={"event_id": ev.id},
                        permission_level="EXECUTE", account_id=acct.id)
    db.flush()
