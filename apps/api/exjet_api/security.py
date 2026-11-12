"""Password hashing (argon2id), signed session JWT, in-process rate limiting."""
from __future__ import annotations

import threading
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from .config import get_settings
from .errors import ApiError

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


def create_session_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=get_settings().session_minutes)
    return jwt.encode({"sub": str(user_id), "iat": now, "exp": exp, "jti": uuid.uuid4().hex}, jwt_secret(), algorithm="HS256")


def decode_session_token(token: str) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=["HS256"], options={"require": ["exp", "sub"]})
        return uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, ValueError, KeyError):
        return None


def sign_blob(payload: dict, ttl_seconds: int) -> str:
    """Short-lived signed token (used for local-storage download URLs)."""
    exp = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
    return jwt.encode({**payload, "exp": exp}, jwt_secret(), algorithm="HS256")


def verify_blob(token: str) -> dict | None:
    try:
        return jwt.decode(token, jwt_secret(), algorithms=["HS256"], options={"require": ["exp"]})
    except jwt.PyJWTError:
        return None


def cookie_secure() -> bool:
    return get_settings().env not in ("dev", "test")


class RateLimiter:
    """Sliding-window limiter, per process. Good enough for one API instance; use a shared store to scale out."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > window_seconds:
                q.popleft()
            if len(q) >= limit:
                raise ApiError(429, "rate_limited", "Too many attempts. Try again in a few minutes.")
            q.append(now)

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


auth_limiter = RateLimiter()
