"""Manifest delivery to the operator by SECURE LINK. The email carries no passenger details at all.

- On manifest submit a `manifest.deliver` job emails each address the accepted quote's RFQ went to (purpose `manifest`,
  authorized exactly like the RFQ: member action + live operator + standing dispatch policy). Each recipient gets their OWN
  token. Only the SHA-256 of a token is stored; the stored email body has the link removed.
- `GET /v1/operator/manifest?token=` returns the manifest as JSON. A link expires (72 h by default), is capped in views
  (a reload or a mail scanner's prefetch does not burn it), can be revoked by an admin, and is revoked automatically when
  the manifest changes or is submitted again. Every successful or refused use of a known token writes `audit_log`.
"""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import clock, mailer
from .. import schemas as S
from ..audit import audit, record_agent_action
from ..config import get_settings
from ..emailnorm import normalize_email
from ..errors import ApiError
from ..guardrails import GuardrailViolation
from ..jobs import NonRetryable
from ..models import Airport, Manifest, ManifestAccessLink, Passenger, Quote, Rfq, Trip, TripStatus
from ..security import new_token, token_hash
from ..timeutil import to_local_str

INVALID = ("invalid_link", "This link is invalid, has expired or was withdrawn.")


def revoke_links(db: Session, manifest: Manifest, *, actor: str, reason: str) -> int:
    now = clock.now()
    n = 0
    for link in db.execute(select(ManifestAccessLink).where(ManifestAccessLink.manifest_id == manifest.id,
                                                            ManifestAccessLink.revoked_at.is_(None))).scalars():
        link.revoked_at = now
        n += 1
    if n:
        audit(db, actor=actor, action="manifest.links_revoked", subject_type="manifest", subject_id=manifest.id,
              detail={"count": n, "reason": reason})
    return n


def _route_and_date(db: Session, trip: Trip) -> tuple[str, str]:
    route = " / ".join(f"{leg.origin_icao}-{leg.destination_icao}" for leg in trip.legs)
    first = trip.legs[0]
    tz = first.origin_timezone or db.execute(select(Airport.timezone).where(Airport.icao == first.origin_icao)).scalar_one_or_none()
    local = to_local_str(first.depart_at, tz)
    when = f"{local.replace('T', ' ')[:16]} local time at {first.origin_icao} ({tz})" if local else f"{first.depart_at:%Y-%m-%d %H:%M} UTC"
    return route, when


def deliver_to_operator(db: Session, trip_id: uuid.UUID, actor_user_id: uuid.UUID | None) -> None:
    """Job body. Idempotent per recipient: an address that already holds a sent, live link is skipped on retry."""
    s = get_settings()
    trip = db.get(Trip, trip_id)
    m = trip.manifest if trip is not None else None
    if trip is None or m is None or m.submitted_at is None or trip.status != TripStatus.scheduled.value:
        return  # cancelled, reopened or never submitted: nothing to deliver
    quote = db.get(Quote, trip.accepted_quote_id) if trip.accepted_quote_id else None
    rfq = db.get(Rfq, quote.rfq_id) if quote is not None else None
    if rfq is None or rfq.operator_id is None:
        record_agent_action(db, agent="manifest_delivery", event="manifest.deliver", input={"trip_id": str(trip.id)},
                            output={"reason": "no_accepted_operator_rfq"}, status="failed", permission_level="EXECUTE",
                            account_id=trip.account_id)
        db.commit()
        raise NonRetryable("no accepted quote with an operator RFQ")
    now = clock.now()
    route, when = _route_and_date(db, trip)
    sent = blocked = 0
    for addr in dict.fromkeys(normalize_email(a) for a in (rfq.recipients or [])):
        if not addr:
            continue
        mine = list(db.execute(select(ManifestAccessLink).where(
            ManifestAccessLink.manifest_id == m.id, ManifestAccessLink.recipient == addr,
            ManifestAccessLink.revoked_at.is_(None))).scalars())
        if any(link.sent_at is not None for link in mine):
            continue  # delivered earlier (a retry)
        for link in mine:  # an unsent link's raw token is gone: replace it
            link.revoked_at = now
        token, digest = new_token()
        link = ManifestAccessLink(manifest_id=m.id, rfq_id=rfq.id, recipient=addr, token_hash=digest,
                                  expires_at=now + _hours(s.manifest_link_ttl_hours))
        db.add(link)
        db.flush()
        url = f"{s.app_base_url}/operator/manifest?token={token}"
        try:
            mailer.send(
                db, purpose="manifest", to=[addr], rfq=rfq, actor_user_id=actor_user_id,
                subject=f"[{rfq.reference}] Passenger manifest ready: {route}",
                body=(f"The passenger manifest for charter {rfq.reference} has been submitted.\n\n"
                      f"Trip reference: {rfq.reference}\nRoute: {route}\nDeparture: {when}\n\n"
                      "For privacy, passenger details are not in this email. Open the secure link below to view them:\n\n"
                      f"{url}\n\n"
                      f"The link is personal to this address, expires in {s.manifest_link_ttl_hours} hours and every view is logged. "
                      "Please do not forward it. If the manifest changes you will receive a new link and this one stops working.\n\nEXJET"),
                stored_body=f"Manifest link sent for {rfq.reference} (token not stored; no passenger details in this email).")
        except GuardrailViolation:
            link.revoked_at = now  # nothing was sent: the link must not stay live
            blocked += 1
            db.commit()
            continue
        link.sent_at = now
        sent += 1
        db.commit()  # the email is out: keep its link even if a later recipient fails and the job retries
    if sent:
        m.sent_to_operator_at = now
    record_agent_action(
        db, agent="manifest_delivery", event="manifest.deliver", input={"trip_id": str(trip.id)},
        output={"links_sent": sent, "blocked": blocked}, status="done" if sent or not blocked else "blocked",
        permission_level="EXECUTE", account_id=trip.account_id)
    db.commit()
    if not sent and blocked:
        raise NonRetryable("every recipient was blocked (suppressed or not authorized)")


def _hours(h: int):
    from datetime import timedelta

    return timedelta(hours=h)


def read_via_link(db: Session, token: str, ip: str) -> S.OperatorManifestOut:
    digest = token_hash(token)
    link = db.execute(select(ManifestAccessLink).where(ManifestAccessLink.token_hash == digest).with_for_update()).scalar_one_or_none()
    if link is None:
        raise ApiError(404, *INVALID)
    now = clock.now()
    manifest = db.get(Manifest, link.manifest_id)
    trip = db.get(Trip, manifest.trip_id)
    reason = None
    if link.revoked_at is not None:
        reason = "revoked"
    elif link.expires_at < now:
        reason = "expired"
    elif link.view_count >= get_settings().manifest_link_max_views:
        reason = "view_limit"
    elif manifest.submitted_at is None or trip.status == TripStatus.cancelled.value:
        reason = "not_available"
    if reason:
        audit(db, actor=f"operator_link:{link.id}", action="manifest.link_denied", subject_type="manifest", subject_id=manifest.id,
              detail={"ip": ip, "token_id": str(link.id), "reason": reason})
        db.commit()
        raise ApiError(404, *INVALID)
    link.view_count += 1
    link.last_viewed_at = now
    audit(db, actor=f"operator_link:{link.id}", action="manifest.link_accessed", subject_type="manifest", subject_id=manifest.id,
          detail={"ip": ip, "token_id": str(link.id), "at": now.isoformat()})
    pax = db.execute(select(Passenger).where(Passenger.trip_id == trip.id).order_by(Passenger.created_at)).scalars().all()
    ref = db.get(Rfq, link.rfq_id).reference if link.rfq_id else ""
    legs = []
    for leg in trip.legs:
        tz = leg.origin_timezone
        local = to_local_str(leg.depart_at, tz)
        legs.append(S.OperatorManifestLeg(sequence=leg.sequence, origin_icao=leg.origin_icao, destination_icao=leg.destination_icao,
                                          depart_local=local, origin_timezone=tz if local else None))
    out = S.OperatorManifestOut(
        trip_reference=ref, legs=legs, submitted_at=manifest.submitted_at, expires_at=link.expires_at,
        expected_passengers=trip.passengers,
        passengers=[S.OperatorManifestPassenger(
            full_name=p.full_name, date_of_birth=p.date_of_birth, id_type=p.id_type, id_number=p.id_number,
            id_expiry=p.id_expiry, id_issuer=p.id_issuer, weight_lbs=p.weight_lbs) for p in pax])
    db.commit()
    return out
