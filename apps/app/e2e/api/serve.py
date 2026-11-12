"""E2E-only wrapper around the real API app. Adds ONE test route that exposes the fake mail provider's outbox, because
the API has no dev outbox endpoint and tokens (email verification, seat invitation, operator manifest link) exist only in
sent mail. Nothing in apps/api is modified. Run from apps/api:  uv run uvicorn --app-dir ../app/e2e/api serve:app
"""
from fastapi import Query

from exjet_api.config import get_settings
from exjet_api.main import app
from exjet_api.providers import get_mail

if get_settings().is_dev_like:

    @app.get("/v1/e2e/outbox", include_in_schema=False)
    def outbox(to: str | None = Query(None), subject: str | None = Query(None)):
        mail = get_mail()
        out = []
        for m, _ in mail.outbox:
            if to and to.lower() not in [a.lower() for a in m.to]:
                continue
            if subject and subject.lower() not in m.subject.lower():
                continue
            out.append({"to": m.to, "subject": m.subject, "body_text": m.body_text})
        return out
