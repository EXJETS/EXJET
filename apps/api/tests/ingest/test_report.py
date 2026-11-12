import json
import re

from sqlalchemy import select

from exjet_api.ingest import run_ingest
from exjet_api.ingest.report import render_no_files, render_report
from exjet_api.models import IngestRun, Operator

EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


def full_report(load_all, cfg):
    runs = load_all()
    return runs, render_report(list(runs.values()), cfg)


def test_report_has_every_required_section_per_dataset(load_all, cfg):
    runs, md = full_report(load_all, cfg)
    for ds, run in runs.items():
        assert f"## {ds}" in md
        assert run.file_sha256 in md and run.filename in md
    for heading in (
        "### Rejected (",
        "### Duplicates merged (",
        "### Missing fields by column",
        "### Unmapped columns",
        "### Flags",
        "### Operators with no RFQ contact email (2)",
        "### Aircraft types created that need specs (2)",
    ):
        assert heading in md, heading
    assert "| 13 | 6 | 0 | 0 | 5 | 2 |" in md  # operators: read, loaded, updated, unchanged, rejected, merged
    assert "`excluded_operator`" in md and "`unknown_rating`" in md and "`non_us_tail`" in md
    assert "`missing_required:dba_name`" in md and "`duplicate_tail_conflicting_operator`" in md


def test_missing_fields_counts_and_percentages(load_all):
    rep = load_all()["operators"].report["missing_fields"]
    assert rep["dba_name"] == {"count": 1, "pct": 7.7, "column_present": True}  # 1 of 13 rows
    assert rep["receives_rfq"]["column_present"] is False and rep["receives_rfq"]["count"] == 13
    assert rep["contact_email"]["count"] == 6


def test_report_never_contains_rating_source_or_full_emails_or_identities(load_all, cfg, session):
    runs, md = full_report(load_all, cfg)
    blob = (md + json.dumps([r.report for r in runs.values()])).lower()
    for banned in ("argus", "wyvern", "wingman", "isbao", "is-bao"):
        assert banned not in blob, banned
    assert not EMAIL.search(md), EMAIL.search(md)
    for ident in (
        "alice.synthetic",
        "rfq.a@",
        "synthetic alice",
        "synthetic test operator",
        "0tst001a",
        "n10ts",
    ):
        assert ident not in blob, ident


def test_report_does_not_leak_the_rating_source_into_the_database_either(load_all, session):
    load_all()
    for op in session.scalars(select(Operator)):
        assert op.safety_rating in {"Not rated", "Gold", "Gold+", "Platinum", "Platinum+"}
        assert not any(w in str(vars(op)).lower() for w in ("argus", "wyvern"))
    for run in session.scalars(select(IngestRun)):
        assert not any(w in json.dumps(run.report).lower() for w in ("argus", "wyvern"))


def test_unmapped_header_naming_a_rating_vendor_is_masked(load_all):
    rep = load_all()["operators"].report
    assert "ARGUS Account Id" not in rep["unmapped_columns"]
    assert any("omitted" in c for c in rep["unmapped_columns"])


def test_ingest_run_row_matches_report(load_all, session):
    load_all()
    run = session.scalar(select(IngestRun).where(IngestRun.dataset == "operators"))
    assert (run.rows_read, run.rows_loaded, run.rows_updated, run.rows_rejected, run.duplicates_merged) == (
        13,
        6,
        0,
        5,
        2,
    )
    assert run.report["rejects"][0] == {
        "row": 6,
        "reason": "excluded_operator",
        "detail": "operator matches the exclusion list; its contact rejected too",
    }
    assert len(run.file_sha256) == 64 and run.started_by == "test"


def test_report_file_written_after_load_and_regenerated(session, cfg, fixtures_dir, tmp_path):
    path = tmp_path / "DATA_REPORT.md"
    run_ingest(
        session,
        "operators",
        fixtures_dir / "operators_synthetic.csv",
        None,
        "t",
        report_path=path,
        config=cfg,
    )
    first = path.read_text()
    assert "## operators" in first and "## aircraft" not in first
    assert "| aircraft | no file loaded yet" in first
    run_ingest(
        session,
        "outreach_lists",
        fixtures_dir / "outreach_lists_synthetic.csv",
        None,
        "t",
        report_path=path,
        config=cfg,
    )
    second = path.read_text()
    assert "## operators" in second and "## outreach_lists" in second  # latest run per dataset is kept


def test_second_run_report_shows_zero_new_rows(session, cfg, fixtures_dir, tmp_path):
    path = tmp_path / "DATA_REPORT.md"
    for _ in range(2):
        run_ingest(
            session,
            "operators",
            fixtures_dir / "operators_synthetic.csv",
            None,
            "t",
            report_path=path,
            config=cfg,
        )
    assert "| 13 | 0 | 0 | 6 | 5 | 2 |" in path.read_text()


def test_no_files_report_states_expectations(cfg, tmp_path):
    md = render_no_files(cfg, tmp_path / "raw")
    assert "No files found" in md and "Nothing was loaded" in md
    for ds in ("operators", "aircraft", "airports_fbos", "outreach_lists"):
        assert f"| {ds} | `{ds}` |" in md
    assert "CSV, XLSX, JSON" in md and "NetJets, Flexjet, Nicholas Air" in md
    assert "dba_name" in md and "tail_number" in md and "email" in md
