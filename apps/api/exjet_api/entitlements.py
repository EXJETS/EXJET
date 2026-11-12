"""Single place where entitlement is computed.

Entitled member = account.kyc_status == approved AND subscription.status == active.
Everything that can carry member-only fields (operator name, tail number, operator contacts)
is built through serializers.py, which calls `can_see_member_fields`.
"""
from __future__ import annotations

from dataclasses import dataclass

from .models import Account, KycStatus, Subscription, SubscriptionStatus, User


def is_entitled(account: Account | None, subscription: Subscription | None) -> bool:
    if account is None or subscription is None:
        return False
    return account.kyc_status == KycStatus.approved.value and subscription.status == SubscriptionStatus.active.value


@dataclass(frozen=True)
class Viewer:
    """Who is looking. Anonymous visitors have user=None."""

    user: User | None = None
    account: Account | None = None
    subscription: Subscription | None = None

    @property
    def entitled(self) -> bool:
        return is_entitled(self.account, self.subscription)

    @property
    def is_admin(self) -> bool:
        return self.user is not None and self.user.role == "admin"


ANONYMOUS = Viewer()


def can_see_member_fields(viewer: Viewer | None) -> bool:
    return bool(viewer and viewer.entitled)


def next_step(account: Account | None, subscription: Subscription | None) -> str:
    if account is None:
        return "ready"
    if is_entitled(account, subscription):
        return "ready"
    if account.kyc_status in (KycStatus.not_started.value, KycStatus.rejected.value):
        return "kyc"
    if account.kyc_status in (KycStatus.submitted.value, KycStatus.in_review.value):
        return "kyc_pending"
    return "billing"  # kyc approved, no active subscription
