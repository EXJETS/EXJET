"""Provider factories. Selection comes from settings; fakes are process singletons so tests can inspect them."""
from __future__ import annotations

from functools import lru_cache

from ..config import get_settings
from .adsb import AdsbProvider, FakeAdsb, FlightAwareAdsb
from .billing import BillingProvider, FakeBilling, StripeBilling
from .kyc import FakeKyc, KycProvider, StripeIdentityKyc
from .llm import AnthropicLlm, LlmProvider, NoneLlm
from .mail import FakeMail, GmailMail, MailProvider
from .storage import LocalStorage, S3Storage, StorageProvider
from .weather import AviationWeather, FakeWeather, WeatherProvider

_PICKS = {
    "billing_provider": {"fake": FakeBilling, "stripe": StripeBilling},
    "kyc_provider": {"fake": FakeKyc, "stripe_identity": StripeIdentityKyc},
    "mail_provider": {"fake": FakeMail, "gmail": GmailMail},
    "adsb_provider": {"fake": FakeAdsb, "flightaware": FlightAwareAdsb},
    "weather_provider": {"fake": FakeWeather, "aviationweather": AviationWeather},
    "llm_provider": {"none": NoneLlm, "anthropic": AnthropicLlm},
}


def _pick(attr: str):
    value = getattr(get_settings(), attr)
    try:
        return _PICKS[attr][value]()
    except KeyError as e:
        raise RuntimeError(f"unknown {attr}={value!r}") from e


@lru_cache
def get_billing() -> BillingProvider:
    return _pick("billing_provider")


@lru_cache
def get_kyc() -> KycProvider:
    return _pick("kyc_provider")


@lru_cache
def get_mail() -> MailProvider:
    return _pick("mail_provider")


@lru_cache
def get_adsb() -> AdsbProvider:
    return _pick("adsb_provider")


@lru_cache
def get_weather() -> WeatherProvider:
    return _pick("weather_provider")


@lru_cache
def get_llm() -> LlmProvider:
    return _pick("llm_provider")


@lru_cache
def get_storage() -> StorageProvider:
    s = get_settings()
    if s.storage_provider == "local":
        return LocalStorage(s.storage_dir)
    if s.storage_provider == "s3":
        return S3Storage()
    raise RuntimeError(f"unknown storage_provider={s.storage_provider!r}")


def reset_providers() -> None:
    for fn in (get_billing, get_kyc, get_mail, get_adsb, get_weather, get_llm, get_storage):
        fn.cache_clear()


def assert_safe_for_env() -> None:
    """Refuse to boot staging/prod on fakes or without secrets."""
    s = get_settings()
    if s.env in ("staging", "prod"):
        fakes = [a for a in ("billing_provider", "kyc_provider", "mail_provider", "adsb_provider") if getattr(s, a) == "fake"]
        if fakes or not s.jwt_secret or not s.pii_key:
            raise RuntimeError("staging/prod require real providers, EXJET_JWT_SECRET and EXJET_PII_KEY")
