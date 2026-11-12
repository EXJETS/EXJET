"""Response builders. Routes never return ORM objects. Every builder that can carry member-only
fields (operator, tail number, contacts) takes the viewer and nulls them unless the viewer is entitled."""
from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import clock
from . import schemas as S
from .entitlements import Viewer, can_see_member_fields
from .models import Aircraft, Airport, Contract, EmptyLeg, PaymentLink, Quote, Rfq, Trip
from .services import quote_checks as QC
from .supply import operator_sellable
from .timeutil import to_local_str

WEATHER_HORIZON = timedelta(hours=36)  # TAFs cover roughly 30 hours
MEMBER_VISIBLE_QUOTE_STATUSES = {"ready", "accepted", "declined", "expired"}


class Builder:
    def __init__(self, db: Session, viewer: Viewer):
        self.db = db
        self.viewer = viewer
        self._cities: dict[str, str | None] = {}
        self._airports: dict[str, Airport | None] = {}

    @property
    def entitled(self) -> bool:
        return can_see_member_fields(self.viewer)

    def city(self, icao: str | None) -> str | None:
        if not icao:
            return None
        if icao not in self._cities:
            self._cities[icao] = self.db.execute(select(Airport.city).where(Airport.icao == icao)).scalar_one_or_none()
        return self._cities[icao]

    def airport(self, icao: str) -> Airport | None:
        if icao not in self._airports:
            self._airports[icao] = self.db.execute(select(Airport).where(Airport.icao == icao)).scalar_one_or_none()
        return self._airports[icao]

    def airport_brief(self, icao: str) -> S.AirportBrief:
        a = self.airport(icao)
        if a is None:  # cannot happen through the API (legs reference airports); kept honest rather than invented
            raise LookupError(f"airport {icao} missing")
        return S.AirportBrief.model_validate(a)

    def leg(self, leg) -> S.LegOut:
        tz = leg.origin_timezone or (self.airport(leg.origin_icao).timezone if self.airport(leg.origin_icao) else None)
        return S.LegOut(
            sequence=leg.sequence, origin_icao=leg.origin_icao, destination_icao=leg.destination_icao, depart_at=leg.depart_at,
            depart_local=to_local_str(leg.depart_at, tz), origin_timezone=tz if to_local_str(leg.depart_at, tz) else None,
            origin=self.airport_brief(leg.origin_icao), destination=self.airport_brief(leg.destination_icao),
            distance_nm=leg.distance_nm, is_international=leg.is_international)

    # ------------------------------------------------------------------ listing
    def listing(self, ac: Aircraft) -> S.Listing:
        op = ac.operator
        operator = tail = None
        if self.entitled:
            tail = ac.tail_number
            operator = S.ListingOperator(
                id=op.id, dba_name=op.dba_name, certificate_type=op.certificate_type,
                contacts=[S.ContactOut(name=c.name, title=c.title, email=c.email, phone=c.phone) for c in op.contacts],
            )
        rating = op.safety_rating
        return S.Listing(
            listing_id=ac.id,
            type=S.ListingType(slug=ac.type.slug, manufacturer=ac.type.manufacturer, model=ac.type.model, category=ac.type.category),
            year_of_manufacture=ac.year_of_manufacture, year_refurbished=ac.year_refurbished,
            passenger_seats=ac.passenger_seats, home_city=self.city(ac.home_airport_icao),
            amenities=list(ac.amenities or []), photos=list(ac.photos or []),
            safety_rating=rating, tail_number=tail, operator=operator,
        )

    def empty_leg(self, el: EmptyLeg) -> S.EmptyLegOut:
        return S.EmptyLegOut(id=el.id, origin=el.origin_icao, destination=el.destination_icao,
                             available_from=el.available_from, available_to=el.available_to, listing=self.listing(el.aircraft))

    # ------------------------------------------------------------------ rfq / quote
    def rfq(self, r: Rfq) -> S.RfqOut:
        return S.RfqOut(
            id=r.id, reference=r.reference, kind=r.kind, status=r.status, sent_at=r.sent_at, replied_at=r.replied_at,
            listing=self.listing(r.aircraft) if r.aircraft is not None else None,
        )

    def quote(self, q: Quote) -> S.QuoteOut:
        ent = self.entitled
        rfq = q.rfq
        listing = self.listing(rfq.aircraft) if rfq.aircraft is not None else None
        operator = S.QuoteOperator(dba_name=rfq.operator.dba_name) if ent and rfq.operator is not None else None
        contract = q.contract if ent else None
        link = q.payment_link if ent else None
        return S.QuoteOut(
            id=q.id, rfq_id=q.rfq_id, trip_id=q.trip_id, status=q.status, operator=operator, listing=listing,
            total_amount_cents=q.total_amount_cents, currency=q.currency, valid_until=q.valid_until,
            operator_quote_number=q.operator_quote_number if ent else None,
            line_items=[S.LineItemOut(**i) for i in ((q.parsed or {}).get("line_items") or [])],
            quote_pdf_url=f"/v1/documents/{q.source_document_id}" if ent and q.source_document_id else None,
            contract=S.ContractOut(id=contract.id, pdf_url=f"/v1/documents/{contract.document_id}",
                                   acknowledged_at=contract.acknowledged_at) if contract else None,
            payment_link=S.PaymentLinkOut(
                url=link.url, host=link.host, status=link.status, host_approved=QC.payment_host_approved(self.db, q),
                changed_since_first=QC.changed_since_first(self.db, q)) if link else None,
        )

    # ------------------------------------------------------------------ trip
    def weather_available(self, t: Trip, now: datetime | None = None) -> bool:
        now = now or clock.now()
        return t.status != "cancelled" and any(
            now - timedelta(hours=6) <= leg.depart_at <= now + WEATHER_HORIZON for leg in t.legs
        )

    def trip(self, t: Trip) -> S.TripOut:
        quotes = []
        if self.entitled:
            quotes = [self.quote(q) for q in sorted(t.quotes, key=lambda x: x.created_at)
                      if q.status in MEMBER_VISIBLE_QUOTE_STATUSES]
        m = t.manifest
        return S.TripOut(
            id=t.id, status=t.status, trip_type=t.trip_type, passengers=t.passengers, checked_bags=t.checked_bags,
            carry_on_bags=t.carry_on_bags, golf_bags=t.golf_bags, ski_bags=t.ski_bags, notes=t.notes,
            accepted_quote_id=t.accepted_quote_id,
            legs=[self.leg(leg) for leg in t.legs],
            rfqs=[self.rfq(r) for r in sorted(t.rfqs, key=lambda x: x.created_at)],
            quotes=quotes,
            manifest=S.ManifestBrief(due_at=m.due_at, submitted_at=m.submitted_at) if m else None,
            weather_available=self.weather_available(t), created_at=t.created_at,
        )


def listing_visible(ac: Aircraft) -> bool:
    return ac.is_active and operator_sellable(ac.operator)  # session-bound: also needs the go-live approval row


def payment_link_for(db: Session, quote_id) -> PaymentLink | None:
    return db.execute(select(PaymentLink).where(PaymentLink.quote_id == quote_id)).scalar_one_or_none()


def contract_for(db: Session, quote_id) -> Contract | None:
    return db.execute(select(Contract).where(Contract.quote_id == quote_id)).scalar_one_or_none()
