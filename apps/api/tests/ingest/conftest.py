"""Fixtures for the ingest tests. Uses ONLY the local database `exjet_data_test`. No network."""

from __future__ import annotations

import os
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

TEST_DB_URL = os.environ.get(
    "EXJET_DATA_TEST_DATABASE_URL", "postgresql+psycopg://exjet:exjet@localhost:5432/exjet_data_test"
)
assert TEST_DB_URL.rsplit("/", 1)[-1] == "exjet_data_test", "ingest tests must only touch exjet_data_test"

os.environ.setdefault("EXJET_ENV", "test")

from exjet_api import models  # noqa: F401  (registers every table on Base)
from exjet_api.db import Base
from exjet_api.ingest import load_config, run_ingest

REPO = Path(__file__).resolve().parents[4]
FIXTURES = REPO / "data" / "fixtures"
MAPPINGS = REPO / "data" / "mappings"


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(TEST_DB_URL)
    Base.metadata.drop_all(eng)
    Base.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def session(engine):
    names = ", ".join(f'"{t.name}"' for t in Base.metadata.sorted_tables)
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {names} RESTART IDENTITY CASCADE"))
    with Session(engine, expire_on_commit=False) as s:
        yield s
        s.rollback()


@pytest.fixture()
def cfg():
    return load_config(MAPPINGS, excluded=["NetJets", "Flexjet", "Nicholas Air"])


@pytest.fixture(scope="session")
def test_db_url():
    return TEST_DB_URL


@pytest.fixture()
def fixtures_dir():
    return FIXTURES


@pytest.fixture()
def ingest(session, cfg, tmp_path):
    """ingest(dataset, fixture_name, **kw) -> IngestRun; never writes the real DATA_REPORT.md."""

    def _go(dataset, name, **kw):
        kw.setdefault("write_report", False)
        kw.setdefault("config", cfg)
        path = name if isinstance(name, Path) else FIXTURES / name
        return run_ingest(session, dataset, path, path.name, "test", **kw)

    return _go


@pytest.fixture()
def load_all(ingest):
    def _go():
        return {
            "airports_fbos": ingest("airports_fbos", "airports_fbos_synthetic.csv"),
            "operators": ingest("operators", "operators_synthetic.csv"),
            "aircraft": ingest("aircraft", "aircraft_synthetic.csv"),
            "outreach_lists": ingest("outreach_lists", "outreach_lists_synthetic.csv"),
        }

    return _go
