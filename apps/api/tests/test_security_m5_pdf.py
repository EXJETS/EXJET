"""M5 at the API level: a poisoned attachment quarantines the message, opens an admin item, and is never retried."""
from helpers import b64, inbound, login, pdf_bytes, quote_pdf, to_quote_stage
from sqlalchemy import select

from exjet_api import jobs
from exjet_api.config import get_settings
from exjet_api.models import AgentAction, Approval, Document, EmailMessage, Job, Quote


def _stage(db, client, make_client):
    adm = make_client()
    return adm, to_quote_stage(db, client, adm, attachments=[])


def _many_pages(n):
    import io

    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    for i in range(n):
        c.drawString(60, 700, f"Quotation page {i} total $1.00")
        c.showPage()
    c.save()
    return buf.getvalue()


def test_defaults_cap_size_pages_and_text():
    s = get_settings()
    assert s.pdf_max_bytes == 10 * 1024 * 1024 and s.pdf_max_pages == 50 and s.pdf_max_chars > 0


def test_a_poisoned_document_is_quarantined_not_retried(db, client, make_client):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "attached",
            [{"filename": "quote.pdf", "content_base64": b64(_many_pages(51))}])
    assert db.execute(select(Quote)).scalars().all() == []
    msg = db.execute(select(EmailMessage).where(EmailMessage.status == "quarantined")).scalar_one()
    assert msg.quarantine_reason == "pdf_too_many_pages"
    item = db.execute(select(Approval).where(Approval.kind == "inbound_review")).scalar_one()
    assert item.subject_id == str(msg.id) and "pdf_too_many_pages" in item.summary
    ev = db.execute(select(AgentAction).where(AgentAction.event == "quote.quarantined")).scalar_one()
    assert ev.status == "awaiting_approval"
    job = db.execute(select(Job).where(Job.kind == "quote.ingest").order_by(Job.created_at.desc())).scalars().first()
    assert job.status == "done" and job.attempts == 1  # finished once: not retried 5 times
    # a well-formed 50 page document is still accepted
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "attached",
            [{"filename": "quote.pdf", "content_base64": b64(_many_pages(50))}])
    assert db.execute(select(Quote)).scalars().all() != []


def test_oversized_attachments_are_not_stored(db, client, make_client, monkeypatch):
    monkeypatch.setenv("EXJET_PDF_MAX_BYTES", "1500")
    get_settings.cache_clear()
    adm, s = _stage(db, client, make_client)
    big = pdf_bytes(["Quotation"] + ["line"] * 40)
    assert len(big) > 1500
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "attached", [{"filename": "quote.pdf", "content_base64": b64(big)}])
    assert db.execute(select(Document).where(Document.owner_type == "email_message")).scalars().all() == []
    assert db.execute(select(AgentAction).where(AgentAction.event == "quote.attachment_rejected")).scalar_one()


def test_a_limit_breach_on_resolve_is_a_clean_error_not_a_crash(db, client, make_client, monkeypatch):
    adm, s = _stage(db, client, make_client)
    login(adm, "admin@example.com")
    inbound(adm, "ops-a@example.com", f"Re: [{s['ref']}] quote", "x",
            [{"filename": "quote.pdf", "content_base64": b64(quote_pdf(total="see attached"))}])
    q = db.execute(select(Quote)).scalar_one()
    assert q.status == "needs_review"
    monkeypatch.setenv("EXJET_PDF_MAX_PAGES", "0")
    get_settings.cache_clear()
    r = adm.post(f"/v1/admin/quotes/{q.id}/resolve", json={"total_amount_cents": 4_520_000})
    assert r.status_code == 422 and r.json()["error"]["code"] == "document_unreadable"


def test_non_retryable_jobs_fail_once(db):
    @jobs.handler("test.poison")
    def _poison(_db, _p):
        raise jobs.NonRetryable("poisoned input")

    try:
        jobs.enqueue(db, "test.poison", {})
        db.commit()
        jobs.run_pending()
        j = db.execute(select(Job).where(Job.kind == "test.poison")).scalar_one()
        assert j.status == "failed" and j.attempts == 1 and "NonRetryable" in j.last_error
    finally:
        jobs.HANDLERS.pop("test.poison", None)
