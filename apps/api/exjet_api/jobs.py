"""Postgres job queue: enqueue (with dedupe_key), claim with FOR UPDATE SKIP LOCKED, exponential backoff.

Handlers are registered by kind in `HANDLERS`; each runs in its own session and transaction. Tests call
`run_pending()` to drain the queue synchronously. Payloads carry ids only, never PII.
"""
from __future__ import annotations

import logging
import uuid
from collections.abc import Callable
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from .db import session_factory
from .models import Job, JobStatus

log = logging.getLogger("exjet.jobs")

BACKOFF_BASE_SECONDS = 30
BACKOFF_MAX_SECONDS = 3600
STALE_LOCK = timedelta(minutes=10)

Handler = Callable[[Session, dict], None]
HANDLERS: dict[str, Handler] = {}


def handler(kind: str):
    def deco(fn: Handler) -> Handler:
        HANDLERS[kind] = fn
        return fn

    return deco


def enqueue(db: Session, kind: str, payload: dict | None = None, *, run_at: datetime | None = None,
            dedupe_key: str | None = None, max_attempts: int = 5) -> uuid.UUID | None:
    """Insert a job. If `dedupe_key` already exists the call is a no-op and returns None."""
    values = {"id": uuid.uuid4(), "kind": kind, "payload": payload or {}, "status": JobStatus.queued.value,
              "attempts": 0, "max_attempts": max_attempts, "dedupe_key": dedupe_key}
    if run_at is not None:
        values["run_at"] = run_at
    stmt = pg_insert(Job).values(**values)
    if dedupe_key:
        stmt = stmt.on_conflict_do_nothing(index_elements=[Job.dedupe_key])
    res = db.execute(stmt.returning(Job.id))
    row = res.first()
    return row[0] if row else None


def backoff_seconds(attempts: int) -> int:
    return min(BACKOFF_BASE_SECONDS * (2 ** max(attempts - 1, 0)), BACKOFF_MAX_SECONDS)


def claim_next(db: Session, now: datetime | None = None) -> Job | None:
    """Claim one due job (status -> running, attempts + 1). Commits the claim."""
    now = now or datetime.now(timezone.utc)
    db.execute(
        update(Job).where(Job.status == JobStatus.running.value, Job.locked_at < now - STALE_LOCK)
        .values(status=JobStatus.queued.value, locked_at=None)
    )
    job = db.execute(
        select(Job).where(Job.status == JobStatus.queued.value, Job.run_at <= now)
        .order_by(Job.run_at, Job.created_at).limit(1).with_for_update(skip_locked=True)
    ).scalar_one_or_none()
    if job is None:
        db.commit()
        return None
    job.status = JobStatus.running.value
    job.locked_at = now
    job.attempts += 1
    db.commit()
    return job


def _finish(job_id: uuid.UUID, *, ok: bool, error: str | None, now: datetime) -> None:
    with session_factory()() as db:
        job = db.get(Job, job_id)
        if job is None:
            return
        job.locked_at = None
        if ok:
            job.status = JobStatus.done.value
            job.last_error = None
        else:
            job.last_error = (error or "error")[:2000]
            if job.attempts >= job.max_attempts:
                job.status = JobStatus.failed.value
            else:
                job.status = JobStatus.queued.value
                job.run_at = now + timedelta(seconds=backoff_seconds(job.attempts))
        db.commit()


def run_job(job: Job, now: datetime | None = None) -> bool:
    now = now or datetime.now(timezone.utc)
    fn = HANDLERS.get(job.kind)
    if fn is None:
        _finish(job.id, ok=False, error=f"no handler for kind {job.kind}", now=now)
        return False
    try:
        with session_factory()() as db:
            fn(db, dict(job.payload or {}))
            db.commit()
    except Exception as e:  # noqa: BLE001 - any handler failure is retried with backoff
        log.warning("job %s (%s) failed: %s", job.id, job.kind, type(e).__name__)
        _finish(job.id, ok=False, error=f"{type(e).__name__}: {str(e)[:500]}", now=now)
        return False
    _finish(job.id, ok=True, error=None, now=now)
    return True


def run_pending(limit: int = 200, now: datetime | None = None) -> int:
    """Run every due job (including jobs enqueued by handlers) until none are due. Returns jobs executed."""
    _ensure_handlers()
    n = 0
    while n < limit:
        with session_factory()() as db:
            job = claim_next(db, now)
        if job is None:
            break
        run_job(job, now)
        n += 1
    return n


_loaded = False


def _ensure_handlers() -> None:
    global _loaded
    if not _loaded:
        from .services import handlers  # noqa: F401  (registers job handlers)

        _loaded = True
