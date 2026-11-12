"""Job worker: `python -m exjet_api.worker`. Polls the jobs table; schedules periodic jobs."""
from __future__ import annotations

import logging
import signal
import time
from datetime import datetime

from . import clock
from .db import session_factory
from .jobs import _ensure_handlers, claim_next, enqueue, run_job
from .providers import assert_safe_for_env

log = logging.getLogger("exjet.worker")
POLL_SECONDS = 2.0
INBOX_EVERY_SECONDS = 60
EXPIRE_EVERY_SECONDS = 3600


def schedule_periodic(now: datetime | None = None) -> None:
    now = now or clock.now()
    ts = int(now.timestamp())
    with session_factory()() as db:
        enqueue(db, "mail.poll_inbox", {}, dedupe_key=f"mail.poll_inbox:{ts // INBOX_EVERY_SECONDS}")
        enqueue(db, "rfq.expire", {}, dedupe_key=f"rfq.expire:{ts // EXPIRE_EVERY_SECONDS}")
        db.commit()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    assert_safe_for_env()
    _ensure_handlers()
    stop = {"flag": False}

    def _stop(*_):
        stop["flag"] = True

    signal.signal(signal.SIGTERM, _stop)
    signal.signal(signal.SIGINT, _stop)
    log.info("worker started")
    last_sched = 0.0
    while not stop["flag"]:
        if time.monotonic() - last_sched > 30:
            schedule_periodic()
            last_sched = time.monotonic()
        with session_factory()() as db:
            job = claim_next(db)
        if job is None:
            time.sleep(POLL_SECONDS)
            continue
        run_job(job)
    log.info("worker stopped")


if __name__ == "__main__":
    main()
