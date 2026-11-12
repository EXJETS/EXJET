"""EXJET core schema. Single source of truth for tables; Alembic migrations are generated from this.

Conventions
- UUID primary keys, timezone-aware timestamps.
- Enumerations are stored as strings (see enums below) so migrations stay simple and reversible.
- PII uses EncryptedStr (encrypted at rest). Never log these fields.
- MEMBER-ONLY data (operator identity, tail numbers, operator contacts) lives on Operator,
  OperatorContact and Aircraft.tail_number. API serializers must strip it unless the caller's
  account is KYC approved with an active subscription. See exjet_api/entitlements.py.
- No price is ever stored except Quote.total_amount_cents, which is copied from an operator document.
"""
from __future__ import annotations

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    event,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from .crypto import EncryptedStr
from .db import Base
from .emailnorm import normalize_email
from .opname import normalize_operator_name


# --------------------------------------------------------------------------- enums
class UserRole(str, enum.Enum):
    member = "member"
    admin = "admin"  # CEO / Company OS


class AccountType(str, enum.Enum):
    individual = "individual"
    family_office = "family_office"
    enterprise = "enterprise"


class KycStatus(str, enum.Enum):
    not_started = "not_started"
    submitted = "submitted"  # documents uploaded, vendor check queued or running
    in_review = "in_review"  # vendor done, waiting for human final approval
    approved = "approved"
    rejected = "rejected"


class SubscriptionStatus(str, enum.Enum):
    incomplete = "incomplete"
    active = "active"
    past_due = "past_due"
    canceled = "canceled"


class SafetyRating(str, enum.Enum):
    not_rated = "Not rated"
    gold = "Gold"
    gold_plus = "Gold+"
    platinum = "Platinum"
    platinum_plus = "Platinum+"


class CertificateType(str, enum.Enum):
    part_135 = "135"
    part_121 = "121"
    foreign = "foreign"


class GoLiveStatus(str, enum.Enum):
    draft = "draft"
    pending_ceo = "pending_ceo"
    live = "live"
    suspended = "suspended"


class AircraftCategory(str, enum.Enum):
    turboprop = "turboprop"
    very_light = "very_light"
    light = "light"
    midsize = "midsize"
    super_midsize = "super_midsize"
    heavy = "heavy"
    ultra_long_range = "ultra_long_range"
    airliner = "airliner"


class TripType(str, enum.Enum):
    one_way = "one_way"
    round_trip = "round_trip"
    multi_leg = "multi_leg"


class TripStatus(str, enum.Enum):
    draft = "draft"
    rfq_sent = "rfq_sent"
    quoted = "quoted"
    contracted = "contracted"  # member accepted a quote, contract on file
    paid = "paid"  # member marked operator payment link as paid
    manifest_due = "manifest_due"
    scheduled = "scheduled"  # manifest submitted
    in_flight = "in_flight"
    completed = "completed"
    cancelled = "cancelled"


class RfqKind(str, enum.Enum):
    charter = "charter"
    empty_leg = "empty_leg"
    rental_car = "rental_car"
    chauffeur = "chauffeur"


class RfqStatus(str, enum.Enum):
    queued = "queued"
    sent = "sent"
    replied = "replied"
    declined = "declined"
    expired = "expired"
    failed = "failed"


class QuoteStatus(str, enum.Enum):
    received = "received"
    needs_review = "needs_review"  # parser confidence below threshold
    ready = "ready"  # visible to member
    accepted = "accepted"
    declined = "declined"
    expired = "expired"


class DocumentKind(str, enum.Enum):
    quote_pdf = "quote_pdf"
    contract = "contract"
    kyc = "kyc"
    other = "other"


class PaymentLinkStatus(str, enum.Enum):
    pending = "pending"
    member_marked_paid = "member_marked_paid"
    operator_confirmed = "operator_confirmed"


class PaxIdType(str, enum.Enum):
    real_id = "real_id"  # domestic
    passport = "passport"  # international


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class JobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    done = "done"
    failed = "failed"


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# --------------------------------------------------------------------------- identity
class User(TimestampMixin, Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16), default=UserRole.member.value)
    full_name: Mapped[str | None] = mapped_column(EncryptedStr)
    phone: Mapped[str | None] = mapped_column(EncryptedStr)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Bumped on logout, password change/reset and deactivation. The session JWT carries it and every request
    # checks it, so bumping revokes every outstanding session for this user.
    session_version: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    signup_source: Mapped[str | None] = mapped_column(String(64))  # organic, outreach:<campaign>, referral
    memberships: Mapped[list[AccountMember]] = relationship(back_populates="user")

    @validates("email")
    def _norm_email(self, _key, value):
        n = normalize_email(value)
        if not n:
            raise ValueError("invalid email address")
        return n


class Account(TimestampMixin, Base):
    """The paying entity. Individual = 1 seat, Family Office = 2 seats, Enterprise = custom."""

    __tablename__ = "accounts"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    type: Mapped[str] = mapped_column(String(24), default=AccountType.individual.value)
    display_name: Mapped[str] = mapped_column(EncryptedStr)  # holds the member's full name: encrypted
    seats: Mapped[int] = mapped_column(Integer, default=1)
    kyc_status: Mapped[str] = mapped_column(String(16), default=KycStatus.not_started.value, index=True)
    business_name: Mapped[str | None] = mapped_column(EncryptedStr)
    business_tax_id: Mapped[str | None] = mapped_column(EncryptedStr)  # EIN or equivalent
    members: Mapped[list[AccountMember]] = relationship(back_populates="account")
    subscription: Mapped[Subscription | None] = relationship(back_populates="account", uselist=False)


class AccountMember(TimestampMixin, Base):
    __tablename__ = "account_members"
    __table_args__ = (UniqueConstraint("account_id", "user_id"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    is_owner: Mapped[bool] = mapped_column(Boolean, default=False)
    # Per-person identity. The owner inherits the account KYC result (see entitlements.member_identity_approved);
    # an invited member must pass their own individual check before they are personally entitled.
    identity_status: Mapped[str] = mapped_column(String(16), default=KycStatus.not_started.value,
                                                 server_default=KycStatus.not_started.value)
    # Set when the plan has fewer seats than members (downgrade): the extra members are not entitled until an
    # admin resolves the `seat_overage` approval.
    is_suspended: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))
    account: Mapped[Account] = relationship(back_populates="members")
    user: Mapped[User] = relationship(back_populates="memberships")


class KycSubmission(TimestampMixin, Base):
    __tablename__ = "kyc_submissions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    submitted_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    # NULL: the account's own check (owner, individual or business). Set: an invited member's personal identity check.
    subject_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(16))  # individual | business
    holder_name: Mapped[str] = mapped_column(EncryptedStr)
    status: Mapped[str] = mapped_column(String(16), default=KycStatus.submitted.value, index=True)
    vendor: Mapped[str | None] = mapped_column(String(32))
    vendor_ref: Mapped[str | None] = mapped_column(String(128))
    vendor_result: Mapped[dict | None] = mapped_column(JSON)  # pass/fail signals only, no document data
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    decision_note: Mapped[str | None] = mapped_column(Text)
    documents: Mapped[list[Document]] = relationship(
        primaryjoin="and_(Document.owner_type=='kyc_submission', foreign(Document.owner_id)==KycSubmission.id)",
        viewonly=True,
    )


class Subscription(TimestampMixin, Base):
    """Membership billing. The only revenue EXJET earns. Prices live in the billing provider and
    config/plans.yaml; changes require a CEO approval record."""

    __tablename__ = "subscriptions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), unique=True)
    plan: Mapped[str] = mapped_column(String(24))  # AccountType value
    status: Mapped[str] = mapped_column(String(16), default=SubscriptionStatus.incomplete.value, index=True)
    provider: Mapped[str] = mapped_column(String(24))
    provider_customer_id: Mapped[str | None] = mapped_column(String(128))
    provider_subscription_id: Mapped[str | None] = mapped_column(String(128), index=True)
    unit_amount_cents: Mapped[int] = mapped_column(Integer)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    canceled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Provider time of the newest billing event applied. Older events never overwrite newer state.
    last_event_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    account: Mapped[Account] = relationship(back_populates="subscription")


class BillingEventRecord(Base):
    """Idempotency ledger: a provider event id is applied at most once."""

    __tablename__ = "billing_events"
    event_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    event_type: Mapped[str] = mapped_column(String(48))
    account_id: Mapped[uuid.UUID | None] = mapped_column()
    event_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    outcome: Mapped[str] = mapped_column(String(24), default="applied")  # applied | ignored_stale | ignored_state
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# --------------------------------------------------------------------------- supply (ingested, never invented)
class Operator(TimestampMixin, Base):
    """MEMBER-ONLY: dba_name, legal_name, certificate_number, contacts."""

    __tablename__ = "operators"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    dba_name: Mapped[str] = mapped_column(String(200), index=True)
    legal_name: Mapped[str | None] = mapped_column(String(200))
    certificate_number: Mapped[str | None] = mapped_column(String(32), unique=True)
    certificate_type: Mapped[str] = mapped_column(String(8), default=CertificateType.part_135.value)
    safety_rating: Mapped[str] = mapped_column(String(16), default=SafetyRating.not_rated.value)
    base_airport_icao: Mapped[str | None] = mapped_column(String(4))
    country: Mapped[str] = mapped_column(String(2), default="US")
    is_excluded: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    go_live_status: Mapped[str] = mapped_column(String(16), default=GoLiveStatus.draft.value, index=True)
    source_file: Mapped[str | None] = mapped_column(String(255))
    # Hosts the operator's payment links may use. Set by an admin at onboarding or on first review of a quote
    # (Approval kind `payment_host`). A quote whose link host is not listed never reaches a member.
    payment_hosts: Mapped[list | None] = mapped_column(JSON, default=list, server_default=text("'[]'::json"))
    # normalize_operator_name() of dba_name / legal_name, maintained by the listener below. The SQL exclusion
    # filter reads these so it agrees exactly with the Python matcher (guardrail 3).
    name_norm: Mapped[str | None] = mapped_column(Text)
    legal_name_norm: Mapped[str | None] = mapped_column(Text)
    contacts: Mapped[list[OperatorContact]] = relationship(back_populates="operator", cascade="all, delete-orphan")
    aircraft: Mapped[list[Aircraft]] = relationship(back_populates="operator")


@event.listens_for(Operator, "before_insert")
@event.listens_for(Operator, "before_update")
def _operator_norm_names(_mapper, _conn, op: Operator) -> None:
    op.name_norm = normalize_operator_name(op.dba_name)
    op.legal_name_norm = normalize_operator_name(op.legal_name)


class OperatorContact(TimestampMixin, Base):
    """MEMBER-ONLY. Powers RFQ dispatch."""

    __tablename__ = "operator_contacts"
    __table_args__ = (UniqueConstraint("operator_id", "email"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    operator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("operators.id", ondelete="CASCADE"), index=True)
    name: Mapped[str | None] = mapped_column(String(200))
    title: Mapped[str | None] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(40))
    receives_rfq: Mapped[bool] = mapped_column(Boolean, default=True)
    operator: Mapped[Operator] = relationship(back_populates="contacts")

    @validates("email")
    def _norm_email(self, _key, value):
        n = normalize_email(value)
        if not n:
            raise ValueError("invalid email address")
        return n


class AircraftType(TimestampMixin, Base):
    """Public. Drives marketing aircraft pages and mission matching."""

    __tablename__ = "aircraft_types"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    manufacturer: Mapped[str] = mapped_column(String(80))
    model: Mapped[str] = mapped_column(String(80))
    category: Mapped[str] = mapped_column(String(24), index=True)
    max_passengers: Mapped[int | None] = mapped_column(Integer)
    range_nm: Mapped[int | None] = mapped_column(Integer)  # with typical pax, NBAA IFR reserves
    cruise_speed_kts: Mapped[int | None] = mapped_column(Integer)
    min_runway_ft: Mapped[int | None] = mapped_column(Integer)  # balanced field length, ISA sea level
    baggage_cuft: Mapped[float | None] = mapped_column(Float)
    cabin_length_ft: Mapped[float | None] = mapped_column(Float)
    cabin_width_ft: Mapped[float | None] = mapped_column(Float)
    cabin_height_ft: Mapped[float | None] = mapped_column(Float)
    icao_type_code: Mapped[str | None] = mapped_column(String(4), index=True)
    aircraft: Mapped[list[Aircraft]] = relationship(back_populates="type")


class Aircraft(TimestampMixin, Base):
    """A specific tail. Each marketplace listing is one of these. MEMBER-ONLY: tail_number, operator."""

    __tablename__ = "aircraft"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    tail_number: Mapped[str] = mapped_column(String(12), unique=True)
    operator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("operators.id", ondelete="CASCADE"), index=True)
    type_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("aircraft_types.id"), index=True)
    year_of_manufacture: Mapped[int | None] = mapped_column(Integer)
    year_refurbished: Mapped[int | None] = mapped_column(Integer)
    passenger_seats: Mapped[int | None] = mapped_column(Integer)
    home_airport_icao: Mapped[str | None] = mapped_column(String(4), index=True)
    amenities: Mapped[list | None] = mapped_column(JSON)
    photos: Mapped[list | None] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    faa_registry_status: Mapped[str | None] = mapped_column(String(32))
    faa_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_file: Mapped[str | None] = mapped_column(String(255))
    operator: Mapped[Operator] = relationship(back_populates="aircraft")
    type: Mapped[AircraftType] = relationship(back_populates="aircraft")


class Airport(TimestampMixin, Base):
    __tablename__ = "airports"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    icao: Mapped[str] = mapped_column(String(4), unique=True)
    iata: Mapped[str | None] = mapped_column(String(3), index=True)
    faa_lid: Mapped[str | None] = mapped_column(String(4))
    name: Mapped[str] = mapped_column(String(200))
    city: Mapped[str | None] = mapped_column(String(120), index=True)
    state: Mapped[str | None] = mapped_column(String(2))
    country: Mapped[str] = mapped_column(String(2), default="US")
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    elevation_ft: Mapped[int | None] = mapped_column(Integer)
    longest_runway_ft: Mapped[int | None] = mapped_column(Integer)
    timezone: Mapped[str | None] = mapped_column(String(64))
    fbos: Mapped[list[Fbo]] = relationship(back_populates="airport", cascade="all, delete-orphan")


class Fbo(TimestampMixin, Base):
    __tablename__ = "fbos"
    __table_args__ = (UniqueConstraint("airport_id", "name"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    airport_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("airports.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(40))
    email: Mapped[str | None] = mapped_column(String(320))
    airport: Mapped[Airport] = relationship(back_populates="fbos")


class EmptyLeg(TimestampMixin, Base):
    """Operator-supplied repositioning flight. RFQ only. No price is stored or shown."""

    __tablename__ = "empty_legs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    aircraft_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("aircraft.id", ondelete="CASCADE"), index=True)
    origin_icao: Mapped[str] = mapped_column(String(4), index=True)
    destination_icao: Mapped[str] = mapped_column(String(4), index=True)
    available_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    available_to: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    source: Mapped[str | None] = mapped_column(String(255))  # file or message it came from
    aircraft: Mapped[Aircraft] = relationship()


# --------------------------------------------------------------------------- trips and RFQ loop
class Trip(TimestampMixin, Base):
    __tablename__ = "trips"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(16), default=TripStatus.draft.value, index=True)
    trip_type: Mapped[str] = mapped_column(String(12), default=TripType.one_way.value)
    passengers: Mapped[int] = mapped_column(Integer, default=1)
    checked_bags: Mapped[int] = mapped_column(Integer, default=0)
    carry_on_bags: Mapped[int] = mapped_column(Integer, default=0)
    golf_bags: Mapped[int] = mapped_column(Integer, default=0)
    ski_bags: Mapped[int] = mapped_column(Integer, default=0)
    raw_request: Mapped[str | None] = mapped_column(EncryptedStr)  # the member's plain-language request
    notes: Mapped[str | None] = mapped_column(EncryptedStr)
    accepted_quote_id: Mapped[uuid.UUID | None] = mapped_column()
    legs: Mapped[list[TripLeg]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="TripLeg.sequence"
    )
    rfqs: Mapped[list[Rfq]] = relationship(back_populates="trip", cascade="all, delete-orphan")
    quotes: Mapped[list[Quote]] = relationship(back_populates="trip")
    passengers_list: Mapped[list[Passenger]] = relationship(back_populates="trip", cascade="all, delete-orphan")
    manifest: Mapped[Manifest | None] = relationship(back_populates="trip", uselist=False)


class TripLeg(TimestampMixin, Base):
    __tablename__ = "trip_legs"
    __table_args__ = (UniqueConstraint("trip_id", "sequence"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    sequence: Mapped[int] = mapped_column(Integer)
    origin_icao: Mapped[str] = mapped_column(String(4))
    destination_icao: Mapped[str] = mapped_column(String(4))
    depart_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))  # local time intent stored as UTC
    distance_nm: Mapped[int | None] = mapped_column(Integer)
    is_international: Mapped[bool] = mapped_column(Boolean, default=False)
    trip: Mapped[Trip] = relationship(back_populates="legs")


class Rfq(TimestampMixin, Base):
    """One request to one operator for one tail (or a ground service at an FBO). Sent from quotes@."""

    __tablename__ = "rfqs"
    __table_args__ = (
        UniqueConstraint("trip_id", "aircraft_id", "kind"),
        # one ground request per (trip, FBO, kind, leg): the member cannot repeat-send the same FBO
        Index("uq_rfqs_ground", "trip_id", "fbo_id", "kind", "leg_sequence", unique=True,
              postgresql_where=text("fbo_id IS NOT NULL")),
    )
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(16), default=RfqKind.charter.value)
    aircraft_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("aircraft.id"))
    operator_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("operators.id"), index=True)
    fbo_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("fbos.id"))  # rental car / chauffeur
    empty_leg_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("empty_legs.id"))
    status: Mapped[str] = mapped_column(String(12), default=RfqStatus.queued.value, index=True)
    reference: Mapped[str] = mapped_column(String(24), unique=True)  # e.g. EXJ-7F3K2A, in subject line
    recipients: Mapped[list | None] = mapped_column(JSON)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    replied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_chased_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    thread_id: Mapped[str | None] = mapped_column(String(128), index=True)
    leg_sequence: Mapped[int | None] = mapped_column(Integer)  # ground requests
    details: Mapped[str | None] = mapped_column(EncryptedStr)  # member free text for ground requests (never in jobs.payload)
    trip: Mapped[Trip] = relationship(back_populates="rfqs")
    aircraft: Mapped[Aircraft | None] = relationship()
    operator: Mapped[Operator | None] = relationship()


class Document(TimestampMixin, Base):
    """Stored file (private bucket). KYC documents are never exposed to agents."""

    __tablename__ = "documents"
    __table_args__ = (Index("ix_documents_owner", "owner_type", "owner_id"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    kind: Mapped[str] = mapped_column(String(16))
    owner_type: Mapped[str] = mapped_column(String(32))  # quote | contract | kyc_submission | email_message
    owner_id: Mapped[uuid.UUID] = mapped_column()
    doc_type: Mapped[str | None] = mapped_column(String(32))  # passport | drivers_license | business_doc
    storage_key: Mapped[str] = mapped_column(String(512))
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(Integer)
    sha256: Mapped[str] = mapped_column(String(64))


class Quote(TimestampMixin, Base):
    """Parsed from an operator's PDF. Every figure traces to source_document_id; nothing is estimated."""

    __tablename__ = "quotes"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    rfq_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rfqs.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    operator_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("operators.id"))
    status: Mapped[str] = mapped_column(String(16), default=QuoteStatus.received.value, index=True)
    total_amount_cents: Mapped[int | None] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    operator_quote_number: Mapped[str | None] = mapped_column(String(64))
    parsed: Mapped[dict | None] = mapped_column(JSON)  # line items etc, each with page reference
    parse_confidence: Mapped[float | None] = mapped_column(Float)
    parser: Mapped[str | None] = mapped_column(String(32))  # rules | llm:<model>
    source_document_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("documents.id"))
    source_message_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("email_messages.id"))
    trip: Mapped[Trip] = relationship(back_populates="quotes")
    rfq: Mapped[Rfq] = relationship()
    contract: Mapped[Contract | None] = relationship(back_populates="quote", uselist=False)
    payment_link: Mapped[PaymentLink | None] = relationship(back_populates="quote", uselist=False)


class Contract(TimestampMixin, Base):
    """Operator's contract, issued in the member's name. EXJET is not a party."""

    __tablename__ = "contracts"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), unique=True)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"))
    contracting_party_name: Mapped[str | None] = mapped_column(EncryptedStr)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    quote: Mapped[Quote] = relationship(back_populates="contract")


class PaymentLink(TimestampMixin, Base):
    """Operator's own payment link (e.g. Paynode). EXJET never processes flight payments."""

    __tablename__ = "payment_links"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    quote_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), unique=True)
    url: Mapped[str] = mapped_column(String(1024))
    host: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(24), default=PaymentLinkStatus.pending.value)
    member_marked_paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    quote: Mapped[Quote] = relationship(back_populates="payment_link")


class Passenger(TimestampMixin, Base):
    __tablename__ = "passengers"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    full_name: Mapped[str] = mapped_column(EncryptedStr)
    date_of_birth: Mapped[str] = mapped_column(EncryptedStr)  # ISO date, encrypted
    id_type: Mapped[str] = mapped_column(String(12))  # REAL ID domestic, passport international
    id_number: Mapped[str] = mapped_column(EncryptedStr)
    id_expiry: Mapped[date | None] = mapped_column(Date)
    id_issuer: Mapped[str | None] = mapped_column(EncryptedStr)  # state or country
    weight_lbs: Mapped[int | None] = mapped_column(Integer)
    trip: Mapped[Trip] = relationship(back_populates="passengers_list")


class Manifest(TimestampMixin, Base):
    __tablename__ = "manifests"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), unique=True)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))  # first departure minus 24h
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sent_to_operator_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reminder_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    trip: Mapped[Trip] = relationship(back_populates="manifest")


class FlightTrack(TimestampMixin, Base):
    __tablename__ = "flight_tracks"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    trip_leg_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trip_legs.id", ondelete="CASCADE"), unique=True)
    tail_number: Mapped[str] = mapped_column(String(12))
    status: Mapped[str] = mapped_column(String(16), default="scheduled")  # scheduled|airborne|landed|unknown
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    altitude_ft: Mapped[int | None] = mapped_column(Integer)
    groundspeed_kts: Mapped[int | None] = mapped_column(Integer)
    heading: Mapped[int | None] = mapped_column(Integer)
    position_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    provider: Mapped[str | None] = mapped_column(String(32))


# --------------------------------------------------------------------------- messaging and guardrails
class EmailMessage(TimestampMixin, Base):
    __tablename__ = "email_messages"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    direction: Mapped[str] = mapped_column(String(8))  # outbound | inbound
    mailbox: Mapped[str] = mapped_column(String(320))
    provider_message_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    thread_id: Mapped[str | None] = mapped_column(String(128), index=True)
    from_address: Mapped[str] = mapped_column(String(320))
    to_addresses: Mapped[list] = mapped_column(JSON)
    subject: Mapped[str] = mapped_column(String(998))
    body_text: Mapped[str | None] = mapped_column(EncryptedStr)
    # Inbound only: the mail provider's authentication verdict {dmarc_pass, spf, dkim}. Missing = not authenticated.
    auth_result: Mapped[dict | None] = mapped_column(JSON)
    quarantine_reason: Mapped[str | None] = mapped_column(String(64))
    purpose: Mapped[str] = mapped_column(String(32))  # rfq | rfq_chase | quote_to_member | manifest | lifecycle | outreach | seat_invite | password_reset | account_notice
    rfq_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("rfqs.id"), index=True)
    approval_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("approvals.id"))
    status: Mapped[str] = mapped_column(String(16), default="queued")  # queued|sent|failed|received|blocked|quarantined|rejected
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Approval(TimestampMixin, Base):
    """Approval record. No outbound send, plan change, KYC decision or operator go-live proceeds
    without the matching approved row. Enforced in code by exjet_api/guardrails.py."""

    __tablename__ = "approvals"
    __table_args__ = (Index("ix_approvals_subject", "subject_type", "subject_id"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    kind: Mapped[str] = mapped_column(String(32), index=True)  # kyc_final | operator_go_live | outreach_campaign | rfq_dispatch_policy | plan_change | refund | content_publish | merge | deploy | payment_host | inbound_review | seat_overage | legal_notice
    subject_type: Mapped[str] = mapped_column(String(32))
    subject_id: Mapped[str] = mapped_column(String(64))
    required_role: Mapped[str] = mapped_column(String(16), default="ceo")  # ceo | director
    status: Mapped[str] = mapped_column(String(12), default=ApprovalStatus.pending.value, index=True)
    requested_by: Mapped[str] = mapped_column(String(64))  # user:<id> | agent:<name> | system
    decided_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    summary: Mapped[str] = mapped_column(String(500))
    payload: Mapped[dict | None] = mapped_column(JSON)
    decision_note: Mapped[str | None] = mapped_column(Text)


class Suppression(TimestampMixin, Base):
    """Global do-not-email list. Checked before every send."""

    __tablename__ = "suppressions"
    __table_args__ = (Index("uq_suppressions_email_lower", text("lower(email)"), unique=True),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True)  # normalize_email() form
    reason: Mapped[str] = mapped_column(String(32))  # unsubscribe | bounce | complaint | legal | manual
    source: Mapped[str | None] = mapped_column(String(64))

    @validates("email")
    def _norm_email(self, _key, value):
        n = normalize_email(value)
        if not n:
            raise ValueError("invalid email address")
        return n


class Job(TimestampMixin, Base):
    """Postgres-backed queue. Workers claim with SELECT ... FOR UPDATE SKIP LOCKED."""

    __tablename__ = "jobs"
    __table_args__ = (Index("ix_jobs_claim", "status", "run_at"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    kind: Mapped[str] = mapped_column(String(64), index=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(12), default=JobStatus.queued.value)
    run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=5)
    locked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_error: Mapped[str | None] = mapped_column(Text)
    dedupe_key: Mapped[str | None] = mapped_column(String(128), unique=True)


class AgentAction(TimestampMixin, Base):
    """Every agent action. Company OS reads this for queues, logs and cost."""

    __tablename__ = "agent_actions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    agent: Mapped[str] = mapped_column(String(64), index=True)
    event: Mapped[str] = mapped_column(String(64))
    input: Mapped[dict | None] = mapped_column(JSON)
    output: Mapped[dict | None] = mapped_column(JSON)
    tool_calls: Mapped[list | None] = mapped_column(JSON)
    model: Mapped[str | None] = mapped_column(String(64))
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd_micros: Mapped[int] = mapped_column(Integer, default=0)
    permission_level: Mapped[str] = mapped_column(String(8), default="DRAFT")  # READ | DRAFT | EXECUTE
    approval_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("approvals.id"))
    status: Mapped[str] = mapped_column(String(24), default="done", index=True)  # queued|running|awaiting_approval|done|failed|blocked
    account_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("accounts.id"), index=True)
    error: Mapped[str | None] = mapped_column(Text)


class AuditLog(Base):
    """Append-only record of sensitive reads and writes (KYC document access, member-only data access)."""

    __tablename__ = "audit_log"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    actor: Mapped[str] = mapped_column(String(64))
    action: Mapped[str] = mapped_column(String(64), index=True)
    subject_type: Mapped[str | None] = mapped_column(String(32))
    subject_id: Mapped[str | None] = mapped_column(String(64))
    detail: Mapped[dict | None] = mapped_column(JSON)


class IngestRun(TimestampMixin, Base):
    __tablename__ = "ingest_runs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    dataset: Mapped[str] = mapped_column(String(32))  # operators | aircraft | airports_fbos | outreach_lists
    filename: Mapped[str] = mapped_column(String(255))
    file_sha256: Mapped[str] = mapped_column(String(64))
    started_by: Mapped[str] = mapped_column(String(64))
    rows_read: Mapped[int] = mapped_column(Integer, default=0)
    rows_loaded: Mapped[int] = mapped_column(Integer, default=0)
    rows_updated: Mapped[int] = mapped_column(Integer, default=0)
    rows_rejected: Mapped[int] = mapped_column(Integer, default=0)
    duplicates_merged: Mapped[int] = mapped_column(Integer, default=0)
    report: Mapped[dict | None] = mapped_column(JSON)  # rejects with reasons, missing fields by column


class OutreachContact(TimestampMixin, Base):
    """Prospects from founder-supplied lists only. Never scraped."""

    __tablename__ = "outreach_contacts"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    full_name: Mapped[str | None] = mapped_column(EncryptedStr)
    company: Mapped[str | None] = mapped_column(String(200))
    title: Mapped[str | None] = mapped_column(String(200))
    segment: Mapped[str | None] = mapped_column(String(48), index=True)
    state: Mapped[str | None] = mapped_column(String(2))
    verification_status: Mapped[str] = mapped_column(String(16), default="unverified")
    source_file: Mapped[str | None] = mapped_column(String(255))


# --------------------------------------------------------------------------- security tables
class SeatInvitation(TimestampMixin, Base):
    """An owner's invitation for one email to take a seat. Only the SHA-256 of the token is stored.
    Membership is created only when the invitee, logged in with the invited email, accepts."""

    __tablename__ = "seat_invitations"
    __table_args__ = (Index("ix_seat_invitations_email", "email"),)
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    email: Mapped[str] = mapped_column(String(320))  # normalize_email() form
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    accepted_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    invited_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    @validates("email")
    def _norm_email(self, _key, value):
        n = normalize_email(value)
        if not n:
            raise ValueError("invalid email address")
        return n


class PasswordResetToken(TimestampMixin, Base):
    """Single-use, expiring. Only the SHA-256 of the token is stored."""

    __tablename__ = "password_reset_tokens"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class RateLimit(Base):
    """Fixed-window counters shared by every API worker (see ratelimit.py)."""

    __tablename__ = "rate_limits"
    __table_args__ = (Index("ix_rate_limits_window", "window_start"),)
    key: Mapped[str] = mapped_column(String(200), primary_key=True)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    count: Mapped[int] = mapped_column(Integer, default=0)


class EnterpriseInquiry(TimestampMixin, Base):
    """Free text from an enterprise inquiry lives here (encrypted); audit_log carries only the id."""

    __tablename__ = "enterprise_inquiries"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=_uuid)
    account_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("accounts.id", ondelete="SET NULL"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    company: Mapped[str] = mapped_column(EncryptedStr)
    seats: Mapped[int] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(EncryptedStr)
