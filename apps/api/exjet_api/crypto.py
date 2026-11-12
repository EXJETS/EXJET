"""Field-level encryption for PII at rest (Fernet, AES-128-CBC + HMAC)."""
import base64
import hashlib

from cryptography.fernet import Fernet
from sqlalchemy import Text
from sqlalchemy.types import TypeDecorator

from .config import get_settings

_DEV_SEED = b"exjet-dev-only-not-for-production"


def _fernet() -> Fernet:
    s = get_settings()
    if s.pii_key:
        return Fernet(s.pii_key.encode())
    if s.env in ("dev", "test"):
        return Fernet(base64.urlsafe_b64encode(hashlib.sha256(_DEV_SEED).digest()))
    raise RuntimeError("EXJET_PII_KEY must be set outside dev/test")


def encrypt(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()


class EncryptedStr(TypeDecorator):
    """String column stored encrypted. Not searchable; add a separate hash column if lookup is needed."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return None if value is None else encrypt(value)

    def process_result_value(self, value, dialect):
        return None if value is None else decrypt(value)
