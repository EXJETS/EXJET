"""Postgres-backed fixed-window rate limiter shared by every API worker.

`hit()` upserts one counter row per (key, window) in its OWN transaction, so a rejected or failed request still
counts and a rolled back request does not erase the evidence. `cleanup()` (job `ratelimit.cleanup`, scheduled by
the worker) deletes expired windows, so the table stays bounded by (active keys x live windows).

Client address: `client_ip()` uses the socket peer unless EXJET_TRUSTED_PROXY_HOPS > 0, in which case it takes the
entry that many positions from the RIGHT of X-Forwarded-For (the left-most entries are client controlled).
"""
from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import Request
from sqlalchemy.dialects.postgresql import insert as pg_insert

from . import clock
from .config import get_settings
from .db import session_factory
from .errors import ApiError
from .models import RateLimit

# name -> (limit, window seconds). Per client IP unless the call site adds another subject (email, account).
LIMITS: dict[str, tuple[int, int]] = {
    "login_ip": (20, 300),
    "login_email": (10, 900),
    "signup_ip": (10, 600),
    "password_reset_ip": (10, 900),
    "password_reset_email": (3, 900),
    "password_change_user": (10, 900),
    "seat_invite_user": (10, 3600),
    "seat_accept_user": (10, 900),
    "kyc_upload_user": (6, 3600),
    "enterprise_inquiry_user": (5, 3600),
    "intake_user": (30, 600),
    "rfq_create_user": (20, 600),
    "ground_rfq_create_user": (10, 600),
}
MAX_KEY = 190


def client_ip(request: Request) -> str:
    hops = get_settings().trusted_proxy_hops
    if hops > 0:
        parts = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
        if len(parts) >= hops:
            return parts[-hops][:64]
        # a proxy configuration mismatch: fall through to the socket peer rather than trusting nothing
    return request.client.host if request.client else "unknown"


def _window_start(now: datetime, window_seconds: int) -> datetime:
    ts = int(now.timestamp())
    return datetime.fromtimestamp(ts - ts % window_seconds, tz=now.tzinfo)


def hit(name: str, subject: str, *, limit: int | None = None, window_seconds: int | None = None) -> int:
    """Count one attempt. Raises ApiError 429 `rate_limited` once the window's limit is exceeded."""
    lim, win = LIMITS[name]
    lim = limit if limit is not None else lim
    win = window_seconds if window_seconds is not None else win
    key = f"{name}:{subject}"[:MAX_KEY]
    ws = _window_start(clock.now(), win)
    stmt = pg_insert(RateLimit).values(key=key, window_start=ws, count=1)
    stmt = stmt.on_conflict_do_update(index_elements=[RateLimit.key, RateLimit.window_start],
                                      set_={"count": RateLimit.count + 1}).returning(RateLimit.count)
    with session_factory()() as db:
        n = db.execute(stmt).scalar_one()
        db.commit()
    if n > lim:
        retry = max(1, int((ws + timedelta(seconds=win) - clock.now()).total_seconds()))
        raise ApiError(429, "rate_limited", f"Too many attempts. Try again in {max(1, retry // 60)} minute(s).")
    return n


def cleanup(older_than: timedelta = timedelta(hours=2)) -> int:
    """Delete windows that ended before now - older_than. Returns rows deleted."""
    from sqlalchemy import delete

    cutoff = clock.now() - older_than
    with session_factory()() as db:
        res = db.execute(delete(RateLimit).where(RateLimit.window_start < cutoff))
        db.commit()
        return res.rowcount or 0
