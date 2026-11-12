import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from sqlalchemy import func, select

from exjet_api.ingest import cli
from exjet_api.models import IngestRun, Operator


@pytest.fixture()
def raw_dir(tmp_path, fixtures_dir):
    d = tmp_path / "raw"
    d.mkdir()
    shutil.copy(fixtures_dir / "airports_fbos_synthetic.csv", d / "airports_fbos_2026.csv")
    shutil.copy(fixtures_dir / "operators_synthetic.xlsx", d / "operators_2026.xlsx")
    shutil.copy(fixtures_dir / "aircraft_synthetic.json", d / "Aircraft_2026.json")
    shutil.copy(fixtures_dir / "outreach_lists_synthetic.csv", d / "outreach_lists_2026.csv")
    (d / "README.txt").write_text("ignored")
    (d / "notes.csv").write_text("ignored")
    (d / "~$operators.xlsx").write_text("lock file")
    return d


def test_scan_raw_prefix_order_and_ignores(raw_dir):
    found = cli.scan_raw(raw_dir)
    assert [ds for ds, _ in found] == ["airports_fbos", "operators", "aircraft", "outreach_lists"]
    assert [p.name for _, p in found][2] == "Aircraft_2026.json"
    assert [ds for ds, _ in cli.scan_raw(raw_dir, "operators")] == ["operators"]
    assert cli.scan_raw(raw_dir / "missing") == []


def test_infer_dataset():
    assert cli.infer_dataset("Operators_final.CSV") == "operators"
    assert cli.infer_dataset("random.csv") is None


@pytest.fixture()
def cli_env(engine, session, monkeypatch):
    from exjet_api import db

    monkeypatch.setattr(db, "get_engine", lambda: engine)
    return engine


def run_cli(*args):
    return cli.main(["run", *args])


def test_cli_no_files_writes_plain_report_without_touching_db(tmp_path, monkeypatch, capsys):
    from exjet_api import db

    def boom():
        raise AssertionError("database must not be touched when there are no files")

    monkeypatch.setattr(db, "get_engine", boom)
    raw = tmp_path / "raw"
    raw.mkdir()
    report = tmp_path / "DATA_REPORT.md"
    assert run_cli("--raw-dir", str(raw), "--report-path", str(report)) == 0
    md = report.read_text()
    assert "No files found" in md and "operators" in md
    assert "No data files found" in capsys.readouterr().out


def test_cli_run_loads_in_dependency_order_and_writes_report(cli_env, raw_dir, tmp_path, session, capsys):
    report = tmp_path / "DATA_REPORT.md"
    assert run_cli("--raw-dir", str(raw_dir), "--report-path", str(report)) == 0
    out = capsys.readouterr().out
    assert (
        out.index("airports_fbos")
        < out.index("operators")
        < out.index("aircraft")
        < out.index("outreach_lists")
    )
    session.expire_all()
    assert session.scalar(select(func.count()).select_from(Operator)) == 6
    md = report.read_text()
    for ds in ("airports_fbos", "operators", "aircraft", "outreach_lists"):
        assert f"## {ds}" in md
    assert "argus" not in md.lower()
    # rerun is a no-op
    assert run_cli("--raw-dir", str(raw_dir), "--report-path", str(report)) == 0
    assert "| 13 | 0 | 0 | 6 | 5 | 2 |" in report.read_text()


def test_cli_dry_run_writes_nothing_and_does_not_touch_report(cli_env, raw_dir, tmp_path, session, capsys):
    report = tmp_path / "DATA_REPORT.md"
    assert run_cli("--raw-dir", str(raw_dir), "--report-path", str(report), "--dry-run") == 0
    out = capsys.readouterr().out
    assert "DRY RUN" in out and "## aircraft" in out
    # operators loaded earlier in the same dry run are visible to the aircraft step: 4 aircraft load
    assert "aircraft        Aircraft_2026.json: read 11, loaded 5" in out
    session.expire_all()
    assert session.scalar(select(func.count()).select_from(Operator)) == 0
    assert session.scalar(select(func.count()).select_from(IngestRun)) == 0
    assert not report.exists()


def test_cli_single_file_with_dataset_filter(cli_env, raw_dir, tmp_path, session):
    report = tmp_path / "r.md"
    assert run_cli("--file", str(raw_dir / "outreach_lists_2026.csv"), "--report-path", str(report)) == 0
    assert run_cli("--dataset", "airports_fbos", "--raw-dir", str(raw_dir), "--report-path", str(report)) == 0
    session.expire_all()
    runs = {r.dataset for r in session.scalars(select(IngestRun))}
    assert runs == {"outreach_lists", "airports_fbos"}


def test_cli_file_needs_inferable_dataset(cli_env, tmp_path, capsys):
    f = tmp_path / "mystery.csv"
    f.write_text("a\n1\n")
    assert run_cli("--file", str(f)) == 2


def test_cli_bad_file_returns_nonzero(cli_env, tmp_path):
    f = tmp_path / "operators_bad.json"
    f.write_text("not json")
    assert run_cli("--file", str(f), "--report-path", str(tmp_path / "r.md")) == 1


def test_module_entrypoint_smoke_no_files(tmp_path, test_db_url):
    """`python -m exjet_api.ingest run` as a real subprocess; no files so no database needed."""
    raw = tmp_path / "raw"
    raw.mkdir()
    report = tmp_path / "DATA_REPORT.md"
    env = {**os.environ, "EXJET_DATABASE_URL": test_db_url, "EXJET_ENV": "test"}
    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "exjet_api.ingest",
            "run",
            "--raw-dir",
            str(raw),
            "--report-path",
            str(report),
        ],
        capture_output=True,
        check=False,
        text=True,
        env=env,
        cwd=Path(__file__).resolve().parents[2],
        timeout=60,
    )
    assert proc.returncode == 0, proc.stderr
    assert "No files found" in report.read_text()


def test_module_entrypoint_smoke_dry_run_against_test_db(
    tmp_path, engine, session, test_db_url, fixtures_dir
):
    env = {**os.environ, "EXJET_DATABASE_URL": test_db_url, "EXJET_ENV": "test"}
    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "exjet_api.ingest",
            "run",
            "--dry-run",
            "--file",
            str(fixtures_dir / "operators_synthetic.csv"),
            "--dataset",
            "operators",
        ],
        capture_output=True,
        check=False,
        text=True,
        env=env,
        cwd=Path(__file__).resolve().parents[2],
        timeout=60,
    )
    assert proc.returncode == 0, proc.stderr
    assert "read 13, loaded 6" in proc.stdout and "DRY RUN" in proc.stdout
    assert session.scalar(select(func.count()).select_from(Operator)) == 0
