"""Orchestration: read -> map -> validate/normalise -> dedupe -> load -> report. See __init__ for the public API."""

from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
from typing import BinaryIO

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import IngestRun
from .config import DATASETS, IngestConfig, load_config
from .dedupe import dedupe_aircraft, dedupe_airports, dedupe_operators, dedupe_outreach
from .loaders import load_aircraft, load_airports, load_operators, load_outreach
from .mapping import map_columns, map_row
from .readers import ReadError, read_source
from .report import build_run_report
from .types import Duplicate, Flag, LoadStats, Reject, Row, ValidationContext
from .validate import VALIDATORS


class IngestError(ValueError):
    """The file could not be processed at all (unknown dataset, unreadable file)."""


def previously_excluded_certs(session: Session) -> set[str]:
    certs: set[str] = set()
    for rep in session.scalars(select(IngestRun.report).where(IngestRun.dataset == "operators")):
        certs.update((rep or {}).get("excluded_certificates", []))
    return certs


def run_ingest(
    session: Session,
    dataset: str,
    fileobj_or_path: str | Path | bytes | BinaryIO,
    filename: str | None,
    started_by: str,
    *,
    dry_run: bool = False,
    write_report: bool = True,
    report_path: str | Path | None = None,
    config: IngestConfig | None = None,
    extra_excluded_certs: set[str] | None = None,
    keep_pending: bool = False,
) -> IngestRun:
    if dataset not in DATASETS:
        raise IngestError(f"unknown dataset {dataset!r}; expected one of {', '.join(DATASETS)}")
    cfg = config or load_config()
    try:
        src = read_source(fileobj_or_path, filename)
    except ReadError as exc:
        raise IngestError(f"{filename or fileobj_or_path}: {exc}") from exc

    mapping = cfg.mappings[dataset]
    mres = map_columns(src.headers, mapping)
    rows_read = len(src.rows)
    mapped = [(r.number, map_row(r.values, mres.colmap)) for r in src.rows]

    rejects: list[Reject] = []
    flags: list[Flag] = []
    duplicates: list[Duplicate] = []
    ctx = ValidationContext(
        excluded_certs=previously_excluded_certs(session) | (extra_excluded_certs or set())
    )

    valid: list[Row] = []
    if mres.missing_required:
        for n, _ in mapped:
            rejects.append(Reject(n, "missing_required_column", ", ".join(mres.missing_required)))
    else:
        validator = VALIDATORS[dataset]
        for n, raw in mapped:
            out = validator(n, raw, cfg, ctx)
            if isinstance(out, Reject):
                rejects.append(out)
            else:
                valid.append(out)

    airports_merged: dict[str, Row] = {}
    if dataset == "operators":
        valid, duplicates = dedupe_operators(valid)
    elif dataset == "aircraft":
        valid, duplicates, dup_rejects = dedupe_aircraft(valid)
        rejects += dup_rejects
    elif dataset == "outreach_lists":
        valid, duplicates = dedupe_outreach(valid)
    else:
        valid, duplicates, airports_merged = dedupe_airports(valid)
    for r in valid:
        flags.extend(r.flags)

    if dry_run:
        savepoint = session.begin_nested()
    stats = LoadStats()
    try:
        with session.begin_nested() if not dry_run else _null():
            if dataset == "operators":
                stats = load_operators(session, valid, cfg, src.filename)
            elif dataset == "aircraft":
                stats = load_aircraft(session, valid, cfg, src.filename, ctx.excluded_certs)
            elif dataset == "airports_fbos":
                stats = load_airports(session, valid, airports_merged)
            else:
                stats = load_outreach(session, valid, cfg, src.filename)
            rejects += stats.rejects
            load_rejected = {r.row for r in stats.rejects}
            flags = [f for f in flags if f.row not in load_rejected] + stats.flags
            report = build_run_report(
                cfg=cfg,
                dataset=dataset,
                filename=src.filename,
                sha256=src.sha256,
                rows_read=rows_read,
                mapped_rows=[m for _, m in mapped],
                mapping=mres,
                mapping_spec=mapping,
                stats=stats,
                rejects=rejects,
                flags=flags,
                duplicates=duplicates,
                dry_run=dry_run,
                excluded_certificates=sorted(ctx.excluded_certs) if dataset == "operators" else [],
            )
            run = IngestRun(
                dataset=dataset,
                filename=src.filename[:255],
                file_sha256=src.sha256,
                started_by=started_by[:64],
                rows_read=rows_read,
                rows_loaded=stats.loaded,
                rows_updated=stats.updated,
                rows_rejected=len(rejects),
                duplicates_merged=sum(len(d.rows) - 1 for d in duplicates),
                report=report,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            if not dry_run:
                session.add(run)
                session.flush()
    except Exception:
        if dry_run:
            savepoint.rollback()
        raise
    if dry_run:
        if keep_pending:  # caller (CLI dry run) owns an outer transaction it will roll back
            savepoint.commit()
        else:
            savepoint.rollback()
        return run  # transient: never persisted
    session.commit()
    if write_report:
        from .report import write_report_file

        write_report_file(session, report_path)
    return run


class _null:
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False
