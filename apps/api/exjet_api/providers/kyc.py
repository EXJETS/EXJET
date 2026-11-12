"""Identity verification provider. Vendors give signals only; a human admin makes the final decision."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Protocol

from .errors import NotImplementedProvider


@dataclass(frozen=True)
class KycDocumentRef:
    doc_type: str
    content_type: str
    size_bytes: int
    sha256: str


@dataclass
class KycCheckResult:
    vendor: str
    vendor_ref: str
    signals: dict = field(default_factory=dict)  # pass/fail style signals only; no document data

    @property
    def all_clear(self) -> bool:
        return all(v is True for v in self.signals.values())


class KycProvider(Protocol):
    name: str

    def check(self, *, submission_id: uuid.UUID, kind: str, holder_name: str,
              documents: list[KycDocumentRef]) -> KycCheckResult: ...


class FakeKyc:
    """Deterministic. Passes unless the holder name starts with 'REJECT-TEST' (used to exercise failure paths)."""

    name = "fake"

    def check(self, *, submission_id, kind, holder_name, documents):
        ok = not holder_name.upper().startswith("REJECT-TEST")
        types = {d.doc_type for d in documents}
        signals = {
            "document_authentic": ok,
            "selfie_match": ok if kind == "individual" else True,
            "document_not_expired": ok,
            "has_identity_document": bool(types & {"passport", "drivers_license", "business_doc"}),
        }
        return KycCheckResult(vendor="fake", vendor_ref=f"fakekyc_{submission_id.hex[:12]}", signals=signals)


class StripeIdentityKyc:
    """TODO(not implemented): Stripe Identity verification sessions. Raises on use."""

    name = "stripe_identity"

    def check(self, **kw):
        raise NotImplementedProvider("Stripe Identity is not implemented yet")
