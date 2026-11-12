"""Single place where entitlement is computed.

Entitled member = account.kyc_status == approved
                  AND subscription.status == active
                  AND this member's own identity is approved (the owner inherits the account KYC result;
                      an invited member needs their own approved individual check)
                  AND this member is not suspended (seat overage after a downgrade).
Everything that can carry member-only fields (operator name, tail number, operator contacts)
is built through serializers.py, which calls `can_see_member_fields`.
"""
from __future__ import annotations

from dataclasses import dataclass

from .models import Account, AccountMember, KycStatus, Subscription, SubscriptionStatus, User


def member_identity_approved(account: Account | None, member: AccountMember | None) -> bool:
    if account is None or member is None:
        return False
    if member.is_owner:
        return account.kyc_status == KycStatus.approved.value
    return member.identity_status == KycStatus.approved.value


def member_identity_status(account: Account | None, member: AccountMember | None) -> str:
    if account is None or member is None:
        return KycStatus.not_started.value
    return account.kyc_status if member.is_owner else member.identity_status


def is_entitled(account: Account | None, subscription: Subscription | None, member: AccountMember | None) -> bool:
    if account is None or subscription is None or member is None or member.is_suspended:
        return False
    if account.kyc_status != KycStatus.approved.value or subscription.status != SubscriptionStatus.active.value:
        return False
    return member_identity_approved(account, member)


@dataclass(frozen=True)
class Viewer:
    """Who is looking. Anonymous visitors have user=None."""

    user: User | None = None
    account: Account | None = None
    subscription: Subscription | None = None
    member: AccountMember | None = None

    @property
    def entitled(self) -> bool:
        return is_entitled(self.account, self.subscription, self.member)

    @property
    def is_owner(self) -> bool:
        return self.member is not None and self.member.is_owner

    @property
    def is_admin(self) -> bool:
        return self.user is not None and self.user.role == "admin"


ANONYMOUS = Viewer()


def can_see_member_fields(viewer: Viewer | None) -> bool:
    return bool(viewer and viewer.entitled)


def next_step(account: Account | None, subscription: Subscription | None, member: AccountMember | None = None) -> str:
    if account is None:
        return "ready"
    if is_entitled(account, subscription, member):
        return "ready"
    if member is not None and not member.is_owner:
        # an invited member: the account is already verified and paid for; they need their own identity check
        ident = member.identity_status
        if ident in (KycStatus.not_started.value, KycStatus.rejected.value):
            return "kyc"
        if ident in (KycStatus.submitted.value, KycStatus.in_review.value):
            return "kyc_pending"
        return "billing"  # approved but the account has no active subscription (or the seat is suspended)
    if account.kyc_status in (KycStatus.not_started.value, KycStatus.rejected.value):
        return "kyc"
    if account.kyc_status in (KycStatus.submitted.value, KycStatus.in_review.value):
        return "kyc_pending"
    return "billing"  # kyc approved, no active subscription
