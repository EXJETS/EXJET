"""Runtime configuration. Every secret comes from the environment; nothing is hardcoded."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="EXJET_", env_file=".env", extra="ignore")

    env: str = "dev"  # dev | test | staging | prod
    database_url: str = "postgresql+psycopg://exjet:exjet@localhost:5432/exjet"
    # Fernet key for field-level PII encryption. Required outside dev/test.
    pii_key: str = ""
    jwt_secret: str = ""
    session_minutes: int = 60 * 12
    app_base_url: str = "http://localhost:3001"
    web_base_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3001,http://localhost:3000"

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
    excluded_operators: str = "NetJets,Flexjet,Nicholas Air"
    max_fuel_stops: int = 1
    manifest_due_hours: int = 24

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_individual: str = ""
    stripe_price_family_office: str = ""
    anthropic_api_key: str = ""
    flightaware_api_key: str = ""
    gmail_service_account_json: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
