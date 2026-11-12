"""Test environment. Must set env vars before exjet_api is imported. Tests use ONLY the exjet_test database."""
import os
import shutil
import tempfile
from pathlib import Path

_TMP = tempfile.mkdtemp(prefix="exjet-test-storage-")
os.environ.update({
    "EXJET_ENV": "test",
    "EXJET_DATABASE_URL": "postgresql+psycopg://exjet:exjet@localhost:5432/exjet_test",
    "EXJET_STORAGE_DIR": _TMP,
    "EXJET_STORAGE_PROVIDER": "local",
    "EXJET_BILLING_PROVIDER": "fake",
    "EXJET_KYC_PROVIDER": "fake",
    "EXJET_MAIL_PROVIDER": "fake",
    "EXJET_ADSB_PROVIDER": "fake",
    "EXJET_WEATHER_PROVIDER": "fake",
    "EXJET_LLM_PROVIDER": "none",
    "EXJET_JWT_SECRET": "",
    "EXJET_PII_KEY": "",
})
for k in ("EXJET_LLM_MODEL_FAST", "EXJET_ANTHROPIC_API_KEY"):
    os.environ.pop(k, None)

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import text

from alembic import command
from exjet_api import clock
from exjet_api.config import get_settings
from exjet_api.db import Base, get_engine, session_factory
from exjet_api.providers import reset_providers

API_DIR = Path(__file__).resolve().parents[1]


def _alembic_cfg() -> Config:
    cfg = Config(str(API_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(API_DIR / "alembic"))
    return cfg


@pytest.fixture(scope="session", autouse=True)
def _schema():
    """Build the schema by running the real migrations (also proves they apply cleanly)."""
    assert get_settings().database_url.endswith("/exjet_test")
    cfg = _alembic_cfg()
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")
    yield
    shutil.rmtree(_TMP, ignore_errors=True)


@pytest.fixture(autouse=True)
def _clean():
    yield
    clock.set_now(None)
    reset_providers()
    get_settings.cache_clear()
    tables = ", ".join(f'"{t.name}"' for t in Base.metadata.sorted_tables)
    with get_engine().begin() as conn:
        conn.execute(text(f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE"))
    for child in Path(_TMP).iterdir():
        shutil.rmtree(child, ignore_errors=True)


@pytest.fixture
def db():
    with session_factory()() as s:
        yield s


@pytest.fixture
def app():
    from exjet_api.main import app as _app

    return _app


@pytest.fixture
def make_client(app):
    def _make() -> TestClient:
        return TestClient(app, headers={"X-Requested-With": "exjet"})

    return _make


@pytest.fixture
def client(make_client):
    return make_client()
