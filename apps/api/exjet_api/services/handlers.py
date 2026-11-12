"""Job handlers. Importing this module registers them in jobs.HANDLERS."""
from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from .. import clock, ratelimit
from ..jobs import handler
from . import flight_service, kyc_service, manifest_links, manifest_service, quote_service, rfq_service


@handler("rfq.dispatch")
def _rfq_dispatch(db: Session, p: dict) -> None:
    rfq_service.dispatch_rfq(db, uuid.UUID(p["rfq_id"]), p.get("leg_sequence"), p.get("details"))


@handler("mail.poll_inbox")
def _poll(db: Session, p: dict) -> None:
    quote_service.poll_inbox(db)


@handler("quote.ingest")
def _ingest(db: Session, p: dict) -> None:
    quote_service.ingest_message(db, uuid.UUID(p["message_id"]), released=bool(p.get("released")))


@handler("kyc.vendor_check")
def _kyc(db: Session, p: dict) -> None:
    kyc_service.run_vendor_check(db, uuid.UUID(p["submission_id"]))


@handler("manifest.remind")
def _remind(db: Session, p: dict) -> None:
    manifest_service.send_reminder(db, uuid.UUID(p["trip_id"]))


@handler("flight.watch")
def _watch(db: Session, p: dict) -> None:
    flight_service.watch_trip(db, uuid.UUID(p["trip_id"]))


@handler("rfq.expire")
def _expire(db: Session, p: dict) -> None:
    rfq_service.expire_stale(db, clock.now())


@handler("ratelimit.cleanup")
def _ratelimit_cleanup(db: Session, p: dict) -> None:
    ratelimit.cleanup()


@handler("manifest.deliver")
def _manifest_deliver(db: Session, p: dict) -> None:
    actor = p.get("actor_user_id")
    manifest_links.deliver_to_operator(db, uuid.UUID(p["trip_id"]), uuid.UUID(actor) if actor else None)
