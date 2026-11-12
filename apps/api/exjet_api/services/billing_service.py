"""Membership plans and subscription state."""
from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from .. import clock
from .. import schemas as S
from ..audit import record_agent_action
from ..config import get_settings
from ..errors import ApiError
from ..models import (
    Account,
    AccountMember,
    Approval,
    ApprovalStatus,
    BillingEventRecord,
    Subscription,
    SubscriptionStatus,
)
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


def plan_seats(account: Account, sub: Subscription | None) -> int:
    """Seats the account's CURRENT paid plan provides. No paid plan = 1 (the owner)."""
    if sub is None or sub.status not in (SubscriptionStatus.active.value, SubscriptionStatus.past_due.value):
        return 1
    if sub.plan in PLANS:
        return PLANS[sub.plan]["seats"]
    return max(1, account.seats)  # enterprise: seats are set by an admin


def enforce_seat_limit(db: Session, acct: Account, sub: Subscription | None) -> list[AccountMember]:
    """members <= plan seats. Members beyond the limit (owner first, then oldest first keep their seat) are suspended
    (not entitled) and an admin `seat_overage` approval is opened. Nobody is silently entitled beyond the plan.
    Returns the members that are over the limit."""
    members = db.execute(select(AccountMember).where(AccountMember.account_id == acct.id)
                         .order_by(AccountMember.is_owner.desc(), AccountMember.created_at, AccountMember.id)).scalars().all()
    limit = plan_seats(acct, sub)
    over = members[limit:]
    for m in members[:limit]:
        if m.is_suspended:
            m.is_suspended = False
    for m in over:
        m.is_suspended = True
    if over and db.execute(select(Approval.id).where(
            Approval.kind == "seat_overage", Approval.subject_type == "account", Approval.subject_id == str(acct.id),
            Approval.status == ApprovalStatus.pending.value)).first() is None:
        db.add(Approval(
            kind="seat_overage", subject_type="account", subject_id=str(acct.id), required_role="ceo", requested_by="system",
            summary=f"Account has {len(members)} members but its plan provides {limit} seat(s); extra members suspended",
            payload={"members": len(members), "seats": limit, "suspended_user_ids": [str(m.user_id) for m in over]}))
    return over


TIMESTAMP_FUTURE_SKEW_SECONDS = 300
EVENT_MAX_AGE_SECONDS = 3 * 24 * 3600


def check_event_time(ev: BillingEvent, now: datetime | None = None) -> datetime:
    """Provider event time, within tolerance (not from the future, not older than the provider's retry window)."""
    now = now or clock.now()
    if ev.created_ts is None:
        return now
    at = datetime.fromtimestamp(ev.created_ts, UTC)
    if at > now + timedelta(seconds=TIMESTAMP_FUTURE_SKEW_SECONDS) or at < now - timedelta(seconds=EVENT_MAX_AGE_SECONDS):
        raise ApiError(400, "event_timestamp_out_of_tolerance", "Webhook event time is outside the accepted window.")
    return at


def apply_event(db: Session, ev: BillingEvent) -> str:
    """Apply one provider event. Returns the outcome: applied | duplicate | ignored_stale | ignored_state | ignored.

    - Idempotent by event id (billing_events ledger): a replayed event changes nothing.
    - Monotonic: an event older than the newest one applied to this subscription is ignored, so a late or replayed
      `subscription.renewed` can never undo a later cancellation.
    - State machine: renewed/payment.failed apply only to a live subscription; a canceled one is reopened only by a
      fresh `checkout.completed`.
    """
    at = check_event_time(ev)
    inserted = db.execute(pg_insert(BillingEventRecord).values(
        event_id=ev.id, event_type=ev.type, account_id=ev.account_id, event_at=at, outcome="applied",
    ).on_conflict_do_nothing(index_elements=[BillingEventRecord.event_id]).returning(BillingEventRecord.event_id)).first()
    if inserted is None:
        return "duplicate"
    rec = db.get(BillingEventRecord, ev.id)

    def done(outcome: str) -> str:
        rec.outcome = outcome
        db.flush()
        return outcome

    acct = db.get(Account, ev.account_id)
    if acct is None:
        return done("ignored")
    sub = get_subscription(db, acct.id)
    if sub is not None and sub.last_event_at is not None and at < sub.last_event_at:
        return done("ignored_stale")
    if ev.type == "checkout.completed":
        plan = ev.plan if ev.plan in PLANS else (sub.plan if sub else None)
        if plan is None:
            return done("ignored")
        if sub is None:
            sub = Subscription(account_id=acct.id, plan=plan, status=SubscriptionStatus.incomplete.value,
                               provider="fake", unit_amount_cents=PLANS[plan]["unit_amount_cents"])
            db.add(sub)
        sub.plan, sub.unit_amount_cents = plan, PLANS[plan]["unit_amount_cents"]
        sub.status = SubscriptionStatus.active.value
        sub.provider_customer_id = ev.customer_id or sub.provider_customer_id
        sub.provider_subscription_id = ev.subscription_id or sub.provider_subscription_id
        sub.current_period_end = datetime.fromtimestamp(ev.current_period_end_ts, UTC) if ev.current_period_end_ts else None
        sub.canceled_at = None
        acct.seats = PLANS[plan]["seats"]
        acct.type = plan
    elif sub is not None and ev.type == "subscription.renewed":
        if sub.status == SubscriptionStatus.canceled.value or sub.status == SubscriptionStatus.incomplete.value:
            return done("ignored_state")
        sub.status = SubscriptionStatus.active.value
        if ev.current_period_end_ts:
            sub.current_period_end = datetime.fromtimestamp(ev.current_period_end_ts, UTC)
    elif sub is not None and ev.type == "payment.failed":
        if sub.status != SubscriptionStatus.active.value:
            return done("ignored_state")
        sub.status = SubscriptionStatus.past_due.value
    elif sub is not None and ev.type == "subscription.canceled":
        if sub.status == SubscriptionStatus.canceled.value:
            return done("ignored_state")
        sub.status = SubscriptionStatus.canceled.value
        sub.canceled_at = at
    else:
        return done("ignored")
    sub.last_event_at = at
    db.flush()
    if ev.type == "checkout.completed":  # plan (and so seat count) may have changed
        enforce_seat_limit(db, acct, sub)
    record_agent_action(db, agent="billing", event=f"billing.{ev.type}", input={"event_id": ev.id},
                        permission_level="EXECUTE", account_id=acct.id)
    return done("applied")
