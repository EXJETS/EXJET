"""Password hashing (argon2id), signed session JWT with a revocable session version, signed download tokens."""
from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from .config import get_settings

SESSION_COOKIE = "exjet_session"
CSRF_HEADER = "x-requested-with"
CSRF_VALUE = "exjet"
_DEV_JWT_SECRET = "exjet-dev-only-jwt-secret-not-for-production-use"
_hasher = PasswordHasher()  # argon2id by default
_DUMMY_HASH = _hasher.hash("exjet-dummy-password-for-timing")


def jwt_secret() -> str:
    s = get_settings()
    if s.jwt_secret:
        return s.jwt_secret
    if s.env in ("dev", "test"):
        return _DEV_JWT_SECRET
    raise RuntimeError("EXJET_JWT_SECRET must be set outside dev/test")


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    """Constant-ish time: verifies against a dummy hash when the user does not exist."""
    try:
        return _hasher.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(password_hash: str) -> bool:
    return _hasher.check_needs_rehash(password_hash)


def create_session_token(user_id: uuid.UUID, session_version: int = 0) -> str:
    now = datetime.now(UTC)
    exp = now + timedelta(minutes=get_settings().session_minutes)
    return jwt.encode({"typ": "session", "sub": str(user_id), "sv": session_version, "iat": now, "exp": exp, "jti": uuid.uuid4().hex},
                      jwt_secret(), algorithm="HS256")


def decode_session_token(token: str) -> tuple[uuid.UUID, int] | None:
    """(user id, session version the token was issued with). The caller compares the version to the user row."""
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=["HS256"], options={"require": ["exp", "sub", "sv"]})
        sv = payload["sv"]
        if payload.get("typ") != "session" or not isinstance(sv, int):
            return None
        return uuid.UUID(payload["sub"]), sv
    except (jwt.PyJWTError, ValueError, KeyError):
        return None


def new_token() -> tuple[str, str]:
    """(token to email, sha256 hex to store). The raw token is never stored."""
    t = secrets.token_urlsafe(32)
    return t, token_hash(t)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def sign_blob(payload: dict, ttl_seconds: int) -> str:
    """Short-lived signed token (local-storage download URLs: bound to document id + viewer id)."""
    exp = datetime.now(UTC) + timedelta(seconds=ttl_seconds)
    return jwt.encode({**payload, "typ": "blob", "exp": exp}, jwt_secret(), algorithm="HS256")


def verify_blob(token: str) -> dict | None:
    try:
        data = jwt.decode(token, jwt_secret(), algorithms=["HS256"], options={"require": ["exp"]})
    except jwt.PyJWTError:
        return None
    return data if data.get("typ") == "blob" else None


def cookie_secure() -> bool:
    return get_settings().env not in ("dev", "test")
