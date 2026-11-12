from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from exjet_api import clock, jobs
from exjet_api.db import session_factory
from exjet_api.models import Job


def _job(db, jid):
    db.expire_all()
    return db.get(Job, jid)


def test_enqueue_dedupes_on_key(db):
    a = jobs.enqueue(db, "noop", {"x": 1}, dedupe_key="k1")
    b = jobs.enqueue(db, "noop", {"x": 2}, dedupe_key="k1")
    c = jobs.enqueue(db, "noop", {"x": 3})
    db.commit()
    assert a is not None and b is None and c is not None
    assert len(db.execute(select(Job)).scalars().all()) == 2


def test_success_failure_backoff_and_max_attempts(db):
    calls = []

    @jobs.handler("test.ok")
    def _ok(s, p):
        calls.append(p["n"])

    @jobs.handler("test.boom")
    def _boom(s, p):
        raise RuntimeError("secret detail that must stay short")

    ok = jobs.enqueue(db, "test.ok", {"n": 1})
    bad = jobs.enqueue(db, "test.boom", {}, max_attempts=3)
    db.commit()
    t0 = clock.now()
    assert jobs.run_pending() == 2
    assert calls == [1] and _job(db, ok).status == "done"
    j = _job(db, bad)
    assert j.status == "queued" and j.attempts == 1 and j.last_error == "RuntimeError"
    assert j.run_at >= t0 + timedelta(seconds=jobs.BACKOFF_BASE_SECONDS - 1)
    assert jobs.run_pending() == 0  # not due yet
    clock.set_now(t0 + timedelta(minutes=2))
    assert jobs.run_pending() == 1
    j = _job(db, bad)
    assert j.attempts == 2 and j.run_at - clock.now() >= timedelta(seconds=2 * jobs.BACKOFF_BASE_SECONDS - 1)
    clock.set_now(t0 + timedelta(hours=1))
    jobs.run_pending()
    j = _job(db, bad)
    assert j.status == "failed" and j.attempts == 3
    assert jobs.backoff_seconds(1) == 30 and jobs.backoff_seconds(2) == 60 and jobs.backoff_seconds(30) == jobs.BACKOFF_MAX_SECONDS


def test_unknown_kind_fails_visibly(db):
    jid = jobs.enqueue(db, "no.such.kind", {}, max_attempts=1)
    db.commit()
    jobs.run_pending()
    j = _job(db, jid)
    assert j.status == "failed" and "no handler" in j.last_error


def test_future_jobs_wait_for_their_time(db):
    hits = []
    jobs.HANDLERS["test.later"] = lambda s, p: hits.append(1)
    now = datetime(2026, 11, 12, 15, 0, tzinfo=UTC)
    clock.set_now(now)
    jobs.enqueue(db, "test.later", {}, run_at=now + timedelta(hours=1))
    db.commit()
    assert jobs.run_pending() == 0
    clock.set_now(now + timedelta(hours=1, seconds=1))
    assert jobs.run_pending() == 1 and hits == [1]


def test_claim_uses_skip_locked_so_workers_never_share_a_job(db):
    a = jobs.enqueue(db, "test.ok", {"n": 1})
    b = jobs.enqueue(db, "test.ok", {"n": 2})
    db.commit()
    with session_factory()() as s1, session_factory()() as s2:
        first = s1.execute(select(Job).where(Job.status == "queued").order_by(Job.run_at, Job.created_at).limit(1).with_for_update(skip_locked=True)).scalar_one()
        claimed = jobs.claim_next(s2)  # s1 still holds the row lock
        assert claimed is not None and claimed.id != first.id
        assert {first.id, claimed.id} == {a, b}
        assert jobs.claim_next(s2) is None  # the only other row is locked by s1
        s1.rollback()
    assert _job(db, claimed.id).status == "running" and _job(db, claimed.id).attempts == 1


def test_stale_running_jobs_are_reclaimed(db):
    jid = jobs.enqueue(db, "test.ok", {"n": 9})
    db.commit()
    with session_factory()() as s:
        j = jobs.claim_next(s)
        assert j.id == jid
    clock.set_now(clock.now() + jobs.STALE_LOCK + timedelta(minutes=1))
    with session_factory()() as s:
        again = jobs.claim_next(s)
    assert again is not None and again.id == jid and again.attempts == 2


def test_worker_schedules_periodic_jobs_once_per_bucket(db):
    from exjet_api import worker

    now = datetime(2026, 11, 12, 15, 0, 5, tzinfo=UTC)
    worker.schedule_periodic(now)
    worker.schedule_periodic(now + timedelta(seconds=10))
    kinds = [j.kind for j in db.execute(select(Job)).scalars()]
    assert sorted(kinds) == ["mail.poll_inbox", "ratelimit.cleanup", "rfq.expire"]


def test_rfq_expire_job(db, client, make_client):
    from helpers import to_quote_stage

    from exjet_api.models import Rfq

    adm = make_client()
    s = to_quote_stage(db, client, adm, attachments=[])
    clock.set_now(clock.now() + timedelta(days=4))
    jobs.enqueue(db, "rfq.expire", {})
    db.commit()
    jobs.run_pending()
    db.expire_all()
    rfq = db.execute(select(Rfq)).scalar_one()
    assert rfq.status == "replied"  # a replied RFQ is never expired by silence
    rfq.status = "sent"  # an RFQ nobody answered
    db.commit()
    jobs.enqueue(db, "rfq.expire", {})
    db.commit()
    jobs.run_pending()
    db.expire_all()
    assert db.execute(select(Rfq)).scalar_one().status == "expired" and s
