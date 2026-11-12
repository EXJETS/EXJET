import os
import subprocess
import sys
from pathlib import Path

import httpx
import pytest
from helpers import PASSWORD, seed_all, signup
from sqlalchemy import select

import exjet_api
from exjet_api import seed_data as D
from exjet_api.models import AgentAction, Aircraft, AircraftType, Airport, Approval, Operator
from exjet_api.providers import adsb, billing, kyc, mail, storage
from exjet_api.providers.errors import NotImplementedProvider, ProviderError
from exjet_api.providers.llm import AnthropicLlm, LlmUnavailable, NoneLlm
from exjet_api.providers.weather import AviationWeather, FakeWeather


def test_real_providers_that_are_not_built_fail_loudly():
    for obj, call in [
        (billing.StripeBilling(), lambda o: o.create_checkout()),
        (billing.StripeBilling(), lambda o: o.parse_webhook(b"", None)),
        (kyc.StripeIdentityKyc(), lambda o: o.check()),
        (mail.GmailMail(), lambda o: o.send(None)),
        (mail.GmailMail(), lambda o: o.fetch_inbound()),
        (adsb.FlightAwareAdsb(), lambda o: o.lookup("N1", None)),
        (storage.S3Storage(), lambda o: o.put("k", b"", "x")),
        (storage.S3Storage(), lambda o: o.signed_url("k")),
    ]:
        with pytest.raises(NotImplementedProvider):
            call(obj)
    assert issubclass(NotImplementedProvider, NotImplementedError)


def test_provider_selection_follows_settings(monkeypatch):
    from exjet_api.config import get_settings
    from exjet_api.providers import get_billing, get_storage, reset_providers

    monkeypatch.setenv("EXJET_BILLING_PROVIDER", "stripe")
    monkeypatch.setenv("EXJET_STORAGE_PROVIDER", "s3")
    get_settings.cache_clear()
    reset_providers()
    assert get_billing().name == "stripe" and get_storage().name == "s3"
    monkeypatch.setenv("EXJET_BILLING_PROVIDER", "nope")
    get_settings.cache_clear()
    reset_providers()
    with pytest.raises(RuntimeError):
        get_billing()


def test_weather_client_parses_and_handles_failures():
    seen = []

    def handler(req: httpx.Request):
        seen.append(req.url)
        if "metar" in req.url.path:
            return httpx.Response(200, text="KTEB 121951Z 27010KT 10SM FEW050 12/04 A3002\n")
        if "taf" in req.url.path:
            return httpx.Response(204)
        return httpx.Response(500)

    w = AviationWeather(client=httpx.Client(transport=httpx.MockTransport(handler)))
    assert w.metar("kteb").startswith("KTEB") and w.taf("KTEB") is None
    assert seen[0].params["ids"] == "KTEB" and seen[0].host == "aviationweather.gov"
    with pytest.raises(ProviderError):
        w.metar("../x")
    bad = AviationWeather(client=httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(503))))
    with pytest.raises(ProviderError):
        bad.metar("KTEB")
    boom = AviationWeather(client=httpx.Client(transport=httpx.MockTransport(lambda r: (_ for _ in ()).throw(httpx.ConnectError("x")))))
    with pytest.raises(ProviderError):
        boom.taf("KTEB")


def test_weather_route_survives_provider_outage(db, client, monkeypatch):
    from helpers import future_trip_body

    from exjet_api.routers import flight

    class Down(FakeWeather):
        def metar(self, icao):
            raise ProviderError("down")

    seed_all(db)
    signup(client, "w@example.com")
    tid = client.post("/v1/trips", json=future_trip_body()).json()["id"]
    monkeypatch.setattr(flight, "get_weather", lambda: Down())
    leg = client.get(f"/v1/trips/{tid}/weather").json()["legs"][0]
    assert leg["origin"]["metar"] is None and "no observation" in leg["summary"]


def test_local_storage_blocks_path_traversal(tmp_path):
    s = storage.LocalStorage(str(tmp_path))
    s.put("a/b.txt", b"hi", "text/plain")
    assert s.get("a/b.txt") == b"hi"
    with pytest.raises(ValueError):
        s.get("../outside")
    assert storage.safe_filename("../../etc/passwd") == "passwd" and storage.safe_filename("a b$.pdf") == "a_b_.pdf"
    assert s.signed_url("a/b.txt").startswith("/v1/files/")


def test_llm_none_and_unconfigured_anthropic(monkeypatch):
    assert NoneLlm().available is False
    with pytest.raises(LlmUnavailable):
        NoneLlm().complete_json(system="s", prompt="p")
    monkeypatch.delenv("EXJET_LLM_MODEL_FAST", raising=False)
    a = AnthropicLlm()
    assert a.available is False
    with pytest.raises(LlmUnavailable):
        a.complete_json(system="s", prompt="p")


class ScriptedLlm:
    name, available, model = "scripted", True, "scripted-1"

    def __init__(self, data):
        self.data = data

    def complete_json(self, *, system, prompt, max_tokens=800):
        return dict(self.data)


def test_llm_intake_fills_only_unresolved_validated_fields(db, client, monkeypatch):
    from exjet_api.routers import trips

    seed_all(db)
    signup(client, "i@example.com")
    llm = ScriptedLlm({"legs": [{"origin_icao": "KTEB", "destination_icao": "KXXX", "depart_local": "2099-01-05 08:00"}], "passengers": 5,
                       "_usage": {"input_tokens": 10, "output_tokens": 5}})
    monkeypatch.setattr(trips, "get_llm", lambda: llm)
    d = client.post("/v1/trips/intake", json={"text": "Meetings around Teterboro, 5 of us"}).json()
    # rules read the passengers; the LLM fills the origin it can validate, but not an airport that is not in the table
    assert d["passengers"] == 5
    assert d["legs"][0]["origin_icao"] == "KTEB" and d["legs"][0]["depart_at"].startswith("2099-01-05T08:00:00-05:00")
    assert d["legs"][0]["destination_icao"] is None and "legs[0].destination_icao" in d["unresolved"]
    assert any("AI assistant" in n for n in d["interpretation_notes"])
    acts = db.execute(select(AgentAction).where(AgentAction.event == "trip.intake").order_by(AgentAction.created_at)).scalars().all()
    assert acts[0].input["llm_used"] is True and acts[0].model == "scripted-1" and "text" not in acts[0].input
    # a fully resolved request never reaches the LLM, and rules-resolved fields are never overridden
    d2 = client.post("/v1/trips/intake", json={"text": "Van Nuys to Teterboro on 2099-02-03 9am, 3 pax"}).json()
    assert d2["unresolved"] == [] and d2["legs"][0]["origin_icao"] == "KVNY"
    acts = db.execute(select(AgentAction).where(AgentAction.event == "trip.intake").order_by(AgentAction.created_at)).scalars().all()
    assert [a.input["llm_used"] for a in acts] == [True, False]


def test_llm_quote_extraction_is_verified_against_pdf(db, client, make_client, monkeypatch):
    import io

    from helpers import b64, contract_pdf, to_quote_stage
    from reportlab.pdfgen import canvas

    import exjet_api.services.quote_service as qs
    from exjet_api.models import Quote

    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(60, 700, "Charter Quotation")
    c.drawString(60, 680, "All in price for your trip: thirty eight thousand dollars, see $38,000.00 below")
    c.showPage()
    c.save()
    atts = [{"filename": "quote.pdf", "content_base64": b64(buf.getvalue())}, {"filename": "a.pdf", "content_base64": b64(contract_pdf())}]
    monkeypatch.setattr(qs, "get_llm", lambda: ScriptedLlm({"total_amount_cents": 3_800_000}))
    s = to_quote_stage(db, client, make_client(), attachments=atts)
    q = db.execute(select(Quote)).scalar_one()
    assert q.total_amount_cents == 3_800_000 and q.parser == "llm:scripted-1" and q.status == "ready" and s


def test_llm_quote_extraction_rejects_fabricated_amounts(db, client, make_client, monkeypatch):
    import io

    from helpers import b64, contract_pdf, to_quote_stage
    from reportlab.pdfgen import canvas

    import exjet_api.services.quote_service as qs
    from exjet_api.models import Quote

    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(60, 700, "Charter Quotation")
    c.drawString(60, 680, "Call for pricing")
    c.showPage()
    c.save()
    atts = [{"filename": "quote.pdf", "content_base64": b64(buf.getvalue())}, {"filename": "a.pdf", "content_base64": b64(contract_pdf())}]
    monkeypatch.setattr(qs, "get_llm", lambda: ScriptedLlm({"total_amount_cents": 4_200_000}))
    to_quote_stage(db, client, make_client(), attachments=atts)
    q = db.execute(select(Quote)).scalar_one()
    assert q.total_amount_cents is None and q.status == "needs_review" and q.parser == "rules"


def test_seed_data_is_clearly_synthetic_and_refuses_prod(db):
    admin, ops = seed_all(db)
    seed_all(db)  # idempotent
    assert len(db.execute(select(Airport)).scalars().all()) == len(D.AIRPORTS)
    assert len(db.execute(select(AircraftType)).scalars().all()) == len(D.AIRCRAFT_TYPES)
    for o in db.execute(select(Operator)).scalars():
        assert o.dba_name.startswith("SYNTHETIC") and o.certificate_number.startswith("SYNTH-")
    for a in db.execute(select(Aircraft)).scalars():
        assert a.tail_number.startswith("N00TST")
    from exjet_api.models import OperatorContact

    assert all(c.email.endswith("@example.com") for c in db.execute(select(OperatorContact)).scalars())
    assert ops["X"].is_excluded and ops["B"].go_live_status == "draft" and ops["A"].go_live_status == "live"
    assert len(db.execute(select(Approval).where(Approval.kind == "operator_go_live")).scalars().all()) == 3
    root = Path(exjet_api.__file__).resolve().parents[1]
    env = {**os.environ, "EXJET_ENV": "prod", "EXJET_SEED_ADMIN_EMAIL": "a@example.com", "EXJET_SEED_ADMIN_PASSWORD": PASSWORD}
    for e in ("prod", "staging"):
        env["EXJET_ENV"] = e
        r = subprocess.run([sys.executable, "-m", "exjet_api.seed_dev"], cwd=root, env=env, capture_output=True, text=True)
        assert r.returncode == 1 and "Refusing" in r.stderr
    env["EXJET_ENV"] = "test"
    env.pop("EXJET_SEED_ADMIN_EMAIL")
    r = subprocess.run([sys.executable, "-m", "exjet_api.seed_dev"], cwd=root, env=env, capture_output=True, text=True)
    assert r.returncode == 2


def test_openapi_export_matches_app(app):
    import json

    from exjet_api import export_openapi

    export_openapi.main()
    spec = json.loads((Path(exjet_api.__file__).resolve().parents[1] / "openapi.json").read_text())
    paths = set(spec["paths"])
    for p in ["/v1/auth/signup", "/v1/auth/login", "/v1/auth/logout", "/v1/me", "/v1/account/seats", "/v1/kyc/submissions", "/v1/kyc/status",
              "/v1/billing/plans", "/v1/billing/checkout", "/v1/billing/portal", "/v1/billing/webhook", "/v1/billing/enterprise-inquiry",
              "/v1/airports", "/v1/categories", "/v1/aircraft-types", "/v1/aircraft-types/{slug}", "/v1/listings", "/v1/empty-legs",
              "/v1/trips/intake", "/v1/trips", "/v1/trips/{trip_id}", "/v1/trips/{trip_id}/cancel", "/v1/trips/{trip_id}/match",
              "/v1/trips/{trip_id}/listings", "/v1/trips/{trip_id}/rfqs", "/v1/trips/{trip_id}/ground-rfqs", "/v1/trips/{trip_id}/quotes",
              "/v1/quotes/{quote_id}/accept", "/v1/quotes/{quote_id}/decline", "/v1/contracts/{contract_id}/acknowledge",
              "/v1/quotes/{quote_id}/payment/mark-paid", "/v1/documents/{document_id}", "/v1/trips/{trip_id}/manifest",
              "/v1/trips/{trip_id}/manifest/submit", "/v1/trips/{trip_id}/weather", "/v1/trips/{trip_id}/track",
              "/v1/admin/approvals", "/v1/admin/approvals/{approval_id}/decide", "/v1/admin/kyc/submissions",
              "/v1/admin/kyc/submissions/{submission_id}", "/v1/admin/operators", "/v1/admin/operators/{operator_id}/request-go-live",
              "/v1/admin/ingest", "/v1/admin/ingest/runs", "/v1/admin/metrics", "/v1/admin/agent-actions", "/v1/admin/jobs",
              "/v1/dev/inbound-email", "/v1/dev/run-jobs"]:
        assert p in paths, p


def test_migrations_roundtrip_and_no_drift():
    from alembic.autogenerate import compare_metadata
    from alembic.config import Config
    from alembic.migration import MigrationContext

    from alembic import command
    from exjet_api.db import Base, get_engine

    api_dir = Path(exjet_api.__file__).resolve().parents[1]
    cfg = Config(str(api_dir / "alembic.ini"))
    cfg.set_main_option("script_location", str(api_dir / "alembic"))
    command.downgrade(cfg, "base")
    with get_engine().connect() as conn:
        from sqlalchemy import inspect

        assert inspect(conn).get_table_names() == ["alembic_version"]
    command.upgrade(cfg, "head")
    with get_engine().connect() as conn:
        assert compare_metadata(MigrationContext.configure(conn, opts={"compare_type": True}), Base.metadata) == []
