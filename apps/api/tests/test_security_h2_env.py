"""H2: environment handling fails closed. Before the fix EXJET_ENV defaulted to dev and was a free string."""
import os
import subprocess
import sys

import pytest

from exjet_api.config import Settings, get_settings


def _settings(monkeypatch, **env):
    for k in [k for k in os.environ if k.startswith("EXJET_ENV")]:
        monkeypatch.delenv(k)
    for k, v in env.items():
        monkeypatch.setenv(f"EXJET_{k.upper()}", v)
    get_settings.cache_clear()


def test_env_has_no_default_and_is_a_closed_set():
    f = Settings.model_fields["env"]
    assert f.is_required()
    assert set(f.annotation.__args__) == {"dev", "test", "staging", "prod"}


def test_missing_env_stops_startup_with_a_clear_message(monkeypatch):
    monkeypatch.delenv("EXJET_ENV")
    get_settings.cache_clear()
    with pytest.raises(RuntimeError, match=r"EXJET_ENV must be set to one of: dev, test, staging, prod"):
        get_settings()


@pytest.mark.parametrize("value", ["production", "Prod", "PROD", "development", "", "stage", "dev "])
def test_unknown_env_values_are_refused(monkeypatch, value):
    monkeypatch.setenv("EXJET_ENV", value)
    get_settings.cache_clear()
    with pytest.raises(RuntimeError, match="EXJET_ENV must be set to one of"):
        get_settings()


def test_wildcard_cors_origin_is_rejected(monkeypatch):
    for bad in ("*", "http://a.test,*", "https://*.example.com"):
        monkeypatch.setenv("EXJET_CORS_ORIGINS", bad)
        get_settings.cache_clear()
        with pytest.raises(RuntimeError, match="Invalid EXJET_"):
            get_settings()


def _app_for(monkeypatch, env):
    import exjet_api.main as main  # import under the test environment first: importing main runs assert_safe_for_env()

    monkeypatch.setenv("EXJET_ENV", env)
    get_settings.cache_clear()
    return main.create_app()


@pytest.mark.parametrize("env", ["staging", "prod"])
def test_non_dev_apps_have_no_docs_openapi_or_dev_router(monkeypatch, env):
    from fastapi.testclient import TestClient

    app = _app_for(monkeypatch, env)
    c = TestClient(app, headers={"X-Requested-With": "exjet"})
    assert c.get("/openapi.json").status_code == 404 and c.get("/docs").status_code == 404
    assert "max-age" in c.get("/healthz").headers["strict-transport-security"]
    # prove the dev router is not MOUNTED (not merely guarded): flip the environment back to test; it must still be absent
    monkeypatch.setenv("EXJET_ENV", "test")
    get_settings.cache_clear()
    assert c.post("/v1/dev/run-jobs").status_code == 404 and c.post("/v1/dev/inbound-email", json={}).status_code == 404


@pytest.mark.parametrize("env", ["dev", "test"])
def test_dev_like_apps_keep_docs_and_the_dev_router(monkeypatch, env):
    from fastapi.testclient import TestClient

    app = _app_for(monkeypatch, env)
    c = TestClient(app, headers={"X-Requested-With": "exjet"})
    assert c.get("/openapi.json").status_code == 200 and c.get("/docs").status_code == 200
    assert c.post("/v1/dev/run-jobs").status_code == 200
    assert "strict-transport-security" not in c.get("/healthz").headers


@pytest.mark.parametrize("env", ["staging", "prod"])
def test_non_dev_refuses_fakes_dev_secrets_and_insecure_cookies(monkeypatch, env):
    from exjet_api import providers, security

    monkeypatch.setenv("EXJET_ENV", env)
    get_settings.cache_clear()
    providers.reset_providers()
    with pytest.raises(RuntimeError, match="requires real providers"):
        providers.assert_safe_for_env()
    with pytest.raises(RuntimeError, match="fake billing_provider is refused"):
        providers.get_billing()
    with pytest.raises(RuntimeError, match="EXJET_JWT_SECRET"):
        security.jwt_secret()  # the published dev secret is not used
    assert security.cookie_secure() is True
    from exjet_api.crypto import encrypt

    with pytest.raises(RuntimeError, match="EXJET_PII_KEY"):
        encrypt("x")


def test_dev_endpoints_check_the_environment_too(monkeypatch, client):
    monkeypatch.setenv("EXJET_ENV", "prod")
    get_settings.cache_clear()
    assert client.post("/v1/dev/run-jobs").status_code == 404  # defense in depth for a router mounted under dev/test


def test_fake_billing_webhook_secret_is_random_per_process():
    code = "from exjet_api.providers.billing import FAKE_WEBHOOK_SECRET as s; print(s)"
    env = {**os.environ, "EXJET_ENV": "test"}
    a, b = (subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, env=env, check=True).stdout.strip()
            for _ in range(2))
    assert a != b and len(a) >= 32 and "fake-billing-webhook-secret" not in (a, b)
