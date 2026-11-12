"""Membership billing provider. Fake for dev/tests; Stripe is NOT IMPLEMENTED (see TODO)."""
from __future__ import annotations

import hashlib
import hmac
import json
import uuid
from dataclasses import dataclass
from typing import Protocol

from .errors import NotImplementedProvider, ProviderError

FAKE_WEBHOOK_SECRET = "fake-billing-webhook-secret"  # test double only; not a credential


@dataclass(frozen=True)
class CheckoutSession:
    id: str
    url: str
    customer_id: str


@dataclass(frozen=True)
class BillingEvent:
    id: str
    type: str  # checkout.completed | subscription.canceled | payment.failed | subscription.renewed
    account_id: uuid.UUID
    plan: str | None = None
    customer_id: str | None = None
    subscription_id: str | None = None
    current_period_end_ts: int | None = None


class BillingProvider(Protocol):
    name: str

    def create_checkout(self, *, account_id: uuid.UUID, plan: str, unit_amount_cents: int, customer_email: str,
                        success_url: str, cancel_url: str) -> CheckoutSession: ...

    def create_portal(self, *, customer_id: str, return_url: str) -> str: ...

    def parse_webhook(self, body: bytes, signature: str | None) -> BillingEvent: ...


class FakeBilling:
    """Deterministic in-process billing. `make_event` builds a signed webhook payload for tests and dev."""

    name = "fake"

    def create_checkout(self, *, account_id, plan, unit_amount_cents, customer_email, success_url, cancel_url):
        sid = f"fakecs_{uuid.uuid4().hex[:16]}"
        return CheckoutSession(id=sid, url=f"{success_url.rstrip('/')}/fake-checkout?session={sid}",
                               customer_id=f"fakecus_{account_id.hex[:16]}")

    def create_portal(self, *, customer_id, return_url):
        return f"{return_url.rstrip('/')}/fake-portal?customer={customer_id}"

    @staticmethod
    def sign(body: bytes) -> str:
        return hmac.new(FAKE_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()

    def make_event(self, event_type: str, account_id: uuid.UUID, plan: str | None = None,
                   period_end_ts: int | None = None) -> tuple[bytes, str]:
        payload = {
            "id": f"fakeevt_{uuid.uuid4().hex[:12]}", "type": event_type, "account_id": str(account_id), "plan": plan,
            "customer_id": f"fakecus_{account_id.hex[:16]}", "subscription_id": f"fakesub_{account_id.hex[:16]}",
            "current_period_end_ts": period_end_ts,
        }
        body = json.dumps(payload).encode()
        return body, self.sign(body)

    def parse_webhook(self, body: bytes, signature: str | None) -> BillingEvent:
        if not signature or not hmac.compare_digest(signature, self.sign(body)):
            raise ProviderError("invalid_signature")
        d = json.loads(body)
        return BillingEvent(
            id=d["id"], type=d["type"], account_id=uuid.UUID(d["account_id"]), plan=d.get("plan"),
            customer_id=d.get("customer_id"), subscription_id=d.get("subscription_id"),
            current_period_end_ts=d.get("current_period_end_ts"),
        )


class StripeBilling:
    """TODO(not implemented): Stripe Checkout + Customer Portal + webhook signature verification.
    Selecting EXJET_BILLING_PROVIDER=stripe raises on first use. Nothing is purchased or faked."""

    name = "stripe"

    def _nope(self):
        raise NotImplementedProvider("Stripe billing is not implemented yet")

    def create_checkout(self, **kw):
        self._nope()

    def create_portal(self, **kw):
        self._nope()

    def parse_webhook(self, body, signature):
        self._nope()
