"""Injectable clock so time-dependent jobs are testable. Production never sets an override."""
from __future__ import annotations

from datetime import UTC, datetime

_override: datetime | None = None


def now() -> datetime:
    return _override or datetime.now(UTC)


def set_now(dt: datetime | None) -> None:
    global _override
    _override = dt
