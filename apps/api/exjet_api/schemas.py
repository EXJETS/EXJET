"""Pydantic request/response models for /v1. Member-only fields are Optional and nulled by serializers.py."""
from __future__ import annotations

import re
import uuid
from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

_EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]+\.[^@\s]{2,}$")


def _email(v: str) -> str:
    v = v.strip().lower()
    if len(v) > 320 or not _EMAIL_RE.match(v):
        raise ValueError("invalid email address")
    return v


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------- auth
class SignupIn(BaseModel):
    email: str
    password: str = Field(min_length=10, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    account_type: Literal["individual", "family_office"]
    signup_source: str | None = Field(default=None, pattern=r"^[a-z0-9:_\-]{1,64}$")

    _v = field_validator("email")(_email)


class LoginIn(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=128)

    _v = field_validator("email")(_email)


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str | None
    role: str


class AccountOut(BaseModel):
    id: uuid.UUID
    type: str
    display_name: str
    seats: int
    kyc_status: str


class SubscriptionOut(BaseModel):
    plan: str
    status: str
    current_period_end: datetime | None


class Me(BaseModel):
    user: UserOut
    account: AccountOut | None
    subscription: SubscriptionOut | None
    entitled: bool
    next_step: Literal["kyc", "kyc_pending", "billing", "ready"]


class SeatIn(BaseModel):
    email: str
    _v = field_validator("email")(_email)


class SeatOut(BaseModel):
    account_id: uuid.UUID
    seats_used: int
    seats: int


# --------------------------------------------------------------------------- kyc
class KycSubmissionOut(BaseModel):
    id: uuid.UUID
    status: str


class KycLatest(BaseModel):
    id: uuid.UUID
    status: str
    created_at: datetime
    decision_note: str | None


class KycStatusOut(BaseModel):
    kyc_status: str
    latest_submission: KycLatest | None


# --------------------------------------------------------------------------- billing
class PlanOut(BaseModel):
    plan: str
    name: str
    unit_amount_cents: int | None
    interval: Literal["month"] | None
    seats: int | None
    inquiry_only: bool = False


class CheckoutIn(BaseModel):
    plan: Literal["individual", "family_office"]


class CheckoutOut(BaseModel):
    checkout_url: str


class PortalOut(BaseModel):
    url: str


class EnterpriseInquiryIn(BaseModel):
    company: str = Field(min_length=1, max_length=200)
    seats: int = Field(ge=1, le=10000)
    notes: str | None = Field(default=None, max_length=2000)


# --------------------------------------------------------------------------- catalog
class AirportOut(ORM):
    icao: str
    iata: str | None
    name: str
    city: str | None
    state: str | None
    elevation_ft: int | None
    longest_runway_ft: int | None


class CategoryOut(BaseModel):
    category: str
    name: str
    type_count: int


class AircraftTypeOut(ORM):
    slug: str
    manufacturer: str
    model: str
    category: str
    max_passengers: int | None
    range_nm: int | None
    cruise_speed_kts: int | None
    min_runway_ft: int | None
    baggage_cuft: float | None
    cabin_length_ft: float | None
    cabin_width_ft: float | None
    cabin_height_ft: float | None
    icao_type_code: str | None


class ListingType(BaseModel):
    slug: str
    manufacturer: str
    model: str
    category: str


class ContactOut(BaseModel):
    name: str | None
    title: str | None
    email: str
    phone: str | None


class ListingOperator(BaseModel):
    id: uuid.UUID
    dba_name: str
    certificate_type: str
    contacts: list[ContactOut]


class Listing(BaseModel):
    listing_id: uuid.UUID
    type: ListingType
    year_of_manufacture: int | None
    year_refurbished: int | None
    passenger_seats: int | None
    home_city: str | None
    amenities: list[str]
    photos: list[str]
    safety_rating: str | None
    tail_number: str | None  # member-only
    operator: ListingOperator | None  # member-only


class EmptyLegOut(BaseModel):
    id: uuid.UUID
    origin: str
    destination: str
    available_from: datetime
    available_to: datetime
    listing: Listing


# --------------------------------------------------------------------------- trips
class LegDraftIO(BaseModel):
    origin_icao: str | None = None
    destination_icao: str | None = None
    depart_at: datetime | None = None
    depart_date: date | None = None


class IntakeIn(BaseModel):
    text: str = Field(min_length=3, max_length=2000)


class TripDraftOut(BaseModel):
    trip_type: str
    legs: list[LegDraftIO]
    passengers: int | None
    checked_bags: int
    carry_on_bags: int
    golf_bags: int
    ski_bags: int
    unresolved: list[str]
    confidence: float
    notes: list[str] = []
    candidates: dict[str, list[str]] = {}


class LegIn(BaseModel):
    origin_icao: str = Field(min_length=4, max_length=4)
    destination_icao: str = Field(min_length=4, max_length=4)
    depart_at: datetime


class TripCreate(BaseModel):
    trip_type: Literal["one_way", "round_trip", "multi_leg"] | None = None
    legs: list[LegIn] = Field(min_length=1, max_length=8)
    passengers: int = Field(ge=1, le=100)
    checked_bags: int = Field(default=0, ge=0, le=50)
    carry_on_bags: int = Field(default=0, ge=0, le=50)
    golf_bags: int = Field(default=0, ge=0, le=50)
    ski_bags: int = Field(default=0, ge=0, le=50)
    raw_request: str | None = Field(default=None, max_length=2000)
    notes: str | None = Field(default=None, max_length=2000)


class TripPatch(BaseModel):
    legs: list[LegIn] | None = Field(default=None, min_length=1, max_length=8)
    passengers: int | None = Field(default=None, ge=1, le=100)
    checked_bags: int | None = Field(default=None, ge=0, le=50)
    carry_on_bags: int | None = Field(default=None, ge=0, le=50)
    golf_bags: int | None = Field(default=None, ge=0, le=50)
    ski_bags: int | None = Field(default=None, ge=0, le=50)
    notes: str | None = Field(default=None, max_length=2000)


class LegOut(BaseModel):
    sequence: int
    origin_icao: str
    destination_icao: str
    depart_at: datetime
    distance_nm: int | None
    is_international: bool


class RfqOut(BaseModel):
    id: uuid.UUID
    reference: str
    kind: str
    status: str
    sent_at: datetime | None
    replied_at: datetime | None
    listing: Listing | None


class QuoteOperator(BaseModel):
    dba_name: str


class LineItemOut(BaseModel):
    description: str
    amount_cents: int
    page: int | None = None


class ContractOut(BaseModel):
    id: uuid.UUID
    pdf_url: str
    acknowledged_at: datetime | None


class PaymentLinkOut(BaseModel):
    url: str
    host: str
    status: str


class QuoteOut(BaseModel):
    id: uuid.UUID
    rfq_id: uuid.UUID
    trip_id: uuid.UUID
    status: str
    operator: QuoteOperator | None  # member-only
    listing: Listing | None
    total_amount_cents: int | None  # copied from the operator PDF, never estimated
    currency: str
    valid_until: datetime | None
    operator_quote_number: str | None
    line_items: list[LineItemOut]
    quote_pdf_url: str | None
    contract: ContractOut | None
    payment_link: PaymentLinkOut | None


class ManifestBrief(BaseModel):
    due_at: datetime
    submitted_at: datetime | None


class TripOut(BaseModel):
    id: uuid.UUID
    status: str
    trip_type: str
    passengers: int
    checked_bags: int
    carry_on_bags: int
    golf_bags: int
    ski_bags: int
    notes: str | None
    accepted_quote_id: uuid.UUID | None
    legs: list[LegOut]
    rfqs: list[RfqOut]
    quotes: list[QuoteOut]
    manifest: ManifestBrief | None
    weather_available: bool
    created_at: datetime


class MatchLegOut(BaseModel):
    sequence: int
    origin_icao: str
    destination_icao: str
    distance_nm: int | None


class MatchTypeLeg(BaseModel):
    sequence: int
    stops: int
    fuel_stop_icao: str | None
    flight_time_minutes: int | None


class MatchTypeOut(BaseModel):
    slug: str
    model: str
    stops: Literal[0, 1]
    fuel_stop_icao: str | None
    flight_time_minutes: int | None
    listing_count: int
    legs: list[MatchTypeLeg]


class MatchCategoryOut(BaseModel):
    category: str
    types: list[MatchTypeOut]


class RejectedOut(BaseModel):
    slug: str
    reasons: list[str]


class MatchOut(BaseModel):
    legs: list[MatchLegOut]
    categories: list[MatchCategoryOut]
    rejected: list[RejectedOut]


class RfqCreateIn(BaseModel):
    listing_ids: list[uuid.UUID] = Field(min_length=1, max_length=10)
    empty_leg_id: uuid.UUID | None = None


class GroundRfqIn(BaseModel):
    kind: Literal["rental_car", "chauffeur"]
    leg_sequence: int = Field(ge=0, le=20)
    fbo_id: uuid.UUID
    details: str | None = Field(default=None, max_length=1000)


# --------------------------------------------------------------------------- manifest / flight / weather
class PassengerIn(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    date_of_birth: date
    id_type: Literal["real_id", "passport"]
    id_number: str = Field(min_length=1, max_length=64)
    id_expiry: date
    id_issuer: str = Field(min_length=1, max_length=64)
    weight_lbs: int | None = Field(default=None, ge=1, le=700)


class ManifestPut(BaseModel):
    passengers: list[PassengerIn] = Field(max_length=100)


class PassengerOut(BaseModel):
    full_name: str
    date_of_birth: str
    id_type: str
    id_number_last4: str
    id_expiry: date | None
    id_issuer: str | None
    weight_lbs: int | None


class ManifestOut(BaseModel):
    due_at: datetime
    submitted_at: datetime | None
    required_id_type: str
    expected_passengers: int
    passengers: list[PassengerOut]


class StationWeather(BaseModel):
    icao: str
    metar: str | None
    taf: str | None


class LegWeather(BaseModel):
    sequence: int
    origin: StationWeather
    destination: StationWeather
    summary: str


class WeatherOut(BaseModel):
    legs: list[LegWeather]


class Position(BaseModel):
    lat: float
    lon: float
    altitude_ft: int | None
    groundspeed_kts: int | None
    heading: int | None
    at: datetime | None


class LegTrack(BaseModel):
    sequence: int
    status: str
    position: Position | None


class TrackOut(BaseModel):
    legs: list[LegTrack]


# --------------------------------------------------------------------------- admin
class ApprovalOut(ORM):
    id: uuid.UUID
    kind: str
    subject_type: str
    subject_id: str
    required_role: str
    status: str
    requested_by: str
    decided_by: uuid.UUID | None
    decided_at: datetime | None
    summary: str
    payload: dict | None
    decision_note: str | None
    created_at: datetime


class DecideIn(BaseModel):
    decision: Literal["approved", "rejected"]
    note: str | None = Field(default=None, max_length=2000)


class AdminDocument(BaseModel):
    id: uuid.UUID
    doc_type: str | None
    filename: str
    content_type: str
    size_bytes: int
    url: str  # short-lived signed URL


class AdminKycSubmission(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    kind: str
    holder_name: str
    status: str
    vendor: str | None
    vendor_result: dict | None
    decision_note: str | None
    created_at: datetime
    documents: list[AdminDocument] = []


class AdminOperatorOut(BaseModel):
    id: uuid.UUID
    dba_name: str
    certificate_type: str
    safety_rating: str
    is_excluded: bool
    go_live_status: str
    aircraft_count: int
    contact_count: int


class IngestRunOut(ORM):
    id: uuid.UUID
    dataset: str
    filename: str
    rows_read: int
    rows_loaded: int
    rows_updated: int
    rows_rejected: int
    duplicates_merged: int
    report: dict | None
    created_at: datetime


class MetricsOut(BaseModel):
    mrr_cents: int
    arr_cents: int
    members_by_plan: dict[str, int]
    kyc_queue: int
    rfq_to_quote_rate: float | None
    median_operator_response_minutes: float | None


class AgentActionOut(ORM):
    id: uuid.UUID
    agent: str
    event: str
    status: str
    permission_level: str
    model: str | None
    input_tokens: int
    output_tokens: int
    cost_usd_micros: int
    account_id: uuid.UUID | None
    error: str | None
    created_at: datetime


class JobOut(ORM):
    id: uuid.UUID
    kind: str
    status: str
    attempts: int
    max_attempts: int
    run_at: datetime
    last_error: str | None
    created_at: datetime


class AdminQuoteReview(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    rfq_id: uuid.UUID
    status: str
    flags: list[str]
    parse_confidence: float | None
    pdf_url: str | None


class ResolveQuoteIn(BaseModel):
    total_amount_cents: int = Field(gt=0)
    valid_until: datetime | None = None
    reject: bool = False


# --------------------------------------------------------------------------- dev
class DevAttachment(BaseModel):
    filename: str
    content_type: str = "application/pdf"
    content_base64: str


class DevInboundEmail(BaseModel):
    from_address: str
    to: list[str] = ["quotes@exjet.com"]
    subject: str
    body: str = ""
    thread_id: str | None = None
    attachments: list[DevAttachment] = []


class DevCompleteCheckout(BaseModel):
    account_id: uuid.UUID
    plan: Literal["individual", "family_office"]


class Empty(BaseModel):
    pass


JsonDict = dict[str, Any]
