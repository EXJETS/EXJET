"""Runtime configuration. Every secret comes from the environment; nothing is hardcoded.

`env` has NO default: a missing or unknown EXJET_ENV stops the process at startup. Fakes, dev secrets,
the dev router, /docs and /openapi.json exist only when env is dev or test (see `Settings.is_dev_like`).
"""
from functools import lru_cache
from typing import Literal

from pydantic import ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ENVIRONMENTS = ("dev", "test", "staging", "prod")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="EXJET_", env_file=".env", extra="ignore")

    env: Literal["dev", "test", "staging", "prod"]  # required; no default (fail closed)
    database_url: str = "postgresql+psycopg://exjet:exjet@localhost:5432/exjet"
    # Fernet key for field-level PII encryption. Required outside dev/test.
    pii_key: str = ""
    jwt_secret: str = ""
    session_minutes: int = 60 * 12
    app_base_url: str = "http://localhost:3001"
    web_base_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3001,http://localhost:3000"
    # How many reverse proxies sit in front of the API. 0 = trust only the socket peer. N > 0 = take the
    # client address N entries from the right of X-Forwarded-For (never the left-most: it is client supplied).
    trusted_proxy_hops: int = 0

    # Provider selection. "fake" providers are deterministic in-process doubles
    # used in dev and tests so nothing is purchased or sent.
    billing_provider: str = "fake"  # fake | stripe
    kyc_provider: str = "fake"  # fake | stripe_identity
    mail_provider: str = "fake"  # fake | gmail
    adsb_provider: str = "fake"  # fake | flightaware
    weather_provider: str = "aviationweather"  # aviationweather | fake
    llm_provider: str = "none"  # none | anthropic
    storage_provider: str = "local"  # local | s3
    storage_dir: str = "./var/storage"

    rfq_from_address: str = "quotes@exjet.com"
    # Exclusion list. Names are matched with exjet_api.opname (shared by ingest and supply). The alias list is
    # for the founder to fill with known trade names / affiliates; it ships EMPTY on purpose (nothing invented).
    excluded_operators: str = "NetJets,Flexjet,Nicholas Air"
    excluded_operator_aliases: str = ""  # comma separated
    excluded_certificates: str = ""  # comma separated air carrier certificate numbers
    max_fuel_stops: int = 1
    manifest_due_hours: int = 24

    # Abuse limits (per account, rolling 24 hours) and token lifetimes
    rfq_daily_cap: int = 40  # charter / empty-leg RFQs
    ground_rfq_daily_cap: int = 10  # rental car / chauffeur requests
    seat_invite_ttl_hours: int = 72
    password_reset_ttl_minutes: int = 30
    # Attachment parsing bounds (M5)
    pdf_max_bytes: int = 10 * 1024 * 1024
    pdf_max_pages: int = 50
    pdf_max_chars: int = 400_000
    pdf_timeout_seconds: int = 20

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_individual: str = ""
    stripe_price_family_office: str = ""
    anthropic_api_key: str = ""
    flightaware_api_key: str = ""
    gmail_service_account_json: str = ""

    @field_validator("cors_origins")
    @classmethod
    def _no_wildcard_origin(cls, v: str) -> str:
        if any("*" in o for o in v.split(",")):
            raise ValueError("cors_origins must list explicit origins; '*' is not allowed")
        return v

    @property
    def is_dev_like(self) -> bool:
        return self.env in ("dev", "test")


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as e:
        fields = sorted({str(err["loc"][0]) for err in e.errors() if err.get("loc")})
        if "env" in fields:
            raise RuntimeError(
                f"EXJET_ENV must be set to one of: {', '.join(ENVIRONMENTS)}. "
                "There is no default; an unset or unknown environment is refused."
            ) from None
        raise RuntimeError(f"Invalid EXJET_* configuration (fields: {', '.join(fields)})") from None
