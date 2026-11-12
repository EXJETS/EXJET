"""Mail provider (quotes@exjet.com). Fake has an outbox and an injectable inbox; Gmail is NOT IMPLEMENTED."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Protocol

from .errors import NotImplementedProvider


@dataclass
class OutboundMessage:
    from_address: str
    to: list[str]
    subject: str
    body_text: str
    thread_id: str | None = None


@dataclass
class SentResult:
    provider_message_id: str
    thread_id: str | None


@dataclass
class Attachment:
    filename: str
    content_type: str
    data: bytes


@dataclass
class InboundEmail:
    provider_message_id: str
    thread_id: str | None
    from_address: str
    to: list[str]
    subject: str
    body_text: str
    attachments: list[Attachment] = field(default_factory=list)
    received_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class MailProvider(Protocol):
    name: str

    def send(self, msg: OutboundMessage) -> SentResult: ...

    def fetch_inbound(self) -> list[InboundEmail]: ...


class FakeMail:
    name = "fake"

    def __init__(self) -> None:
        self.outbox: list[tuple[OutboundMessage, SentResult]] = []
        self._inbox: list[InboundEmail] = []
        self.fail_next_send = False

    def send(self, msg: OutboundMessage) -> SentResult:
        if self.fail_next_send:
            self.fail_next_send = False
            from .errors import ProviderError
            raise ProviderError("simulated send failure")
        res = SentResult(provider_message_id=f"fakemsg_{uuid.uuid4().hex[:16]}", thread_id=msg.thread_id or f"fakethr_{uuid.uuid4().hex[:12]}")
        self.outbox.append((msg, res))
        return res

    def inject_inbound(self, email: InboundEmail) -> None:
        self._inbox.append(email)

    def fetch_inbound(self) -> list[InboundEmail]:
        out, self._inbox = self._inbox, []
        return out

    def sent_to(self, address: str) -> list[OutboundMessage]:
        return [m for m, _ in self.outbox if address.lower() in [a.lower() for a in m.to]]


class GmailMail:
    """TODO(not implemented): Gmail API send + inbox polling for quotes@exjet.com (service account with
    domain-wide delegation, EXJET_GMAIL_SERVICE_ACCOUNT_JSON). Raises on use."""

    name = "gmail"

    def send(self, msg):
        raise NotImplementedProvider("Gmail send is not implemented yet")

    def fetch_inbound(self):
        raise NotImplementedProvider("Gmail inbox polling is not implemented yet")
