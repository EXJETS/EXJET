"""Stage 7: build the per-run report (stored in IngestRun.report) and render DATA_REPORT.md.

The report never contains the rating source, an operator or contact identity, or a full email address.
Rows are identified by source row number so the founder can look them up in the file they supplied.
"""

from __future__ import annotations

import logging
import os
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import IngestRun
from .config import DATASETS, DatasetMapping, IngestConfig, default_report_path
from .mapping import MappingResult
from .types import Duplicate, Flag, LoadStats, Reject

log = logging.getLogger("exjet.ingest")

MAX_JSON_REJECTS = 1000
MAX_MD_REJECTS = 200
MAX_ROWS_LISTED = 50
OMITTED_HEADER = "(column omitted: may identify a rating source)"


def _rows_summary(rows: list[int]) -> list[int]:
    return sorted(set(rows))[:MAX_ROWS_LISTED]


def build_run_report(
    *,
    cfg: IngestConfig,
    dataset: str,
    filename: str,
    sha256: str,
    rows_read: int,
    mapped_rows: list[dict[str, Any]],
    mapping: MappingResult,
    mapping_spec: DatasetMapping,
    stats: LoadStats,
    rejects: list[Reject],
    flags: list[Flag],
    duplicates: list[Duplicate],
    dry_run: bool,
    excluded_certificates: list[str],
) -> dict[str, Any]:
    missing: dict[str, dict[str, Any]] = {}
    for f in mapping_spec.fields:
        cnt = sum(1 for r in mapped_rows if r.get(f) is None)
        missing[f] = {
            "count": cnt,
            "pct": round(100.0 * cnt / rows_read, 1) if rows_read else 0.0,
            "column_present": f in mapping.colmap,
        }

    by_code: dict[str, set[int]] = {}
    for fl in flags:
        by_code.setdefault(fl.code, set()).add(fl.row)
    flag_summary = {
        c: {"count": len(rs), "rows": _rows_summary(list(rs))} for c, rs in sorted(by_code.items())
    }

    reasons = Counter(r.reason for r in sorted(rejects, key=lambda r: r.row))
    unmapped = [OMITTED_HEADER if cfg.is_source_token_header(h) else h for h in mapping.unmapped]

    no_rfq = stats.extras.get("operators_no_rfq_rows", [])
    return {
        "dataset": dataset,
        "file": filename,
        "sha256": sha256,
        "dry_run": dry_run,
        "rows_read": rows_read,
        "loaded": stats.loaded,
        "updated": stats.updated,
        "unchanged": stats.unchanged,
        "rejected": len(rejects),
        "duplicates_merged": sum(len(d.rows) - 1 for d in duplicates),
        "rejects_by_reason": dict(reasons),
        "rejects": [
            {"row": r.row, "reason": r.reason, "detail": r.detail}
            for r in sorted(rejects, key=lambda r: r.row)[:MAX_JSON_REJECTS]
        ],
        "duplicates": [{"key": d.key_type, "rows": d.rows[:MAX_ROWS_LISTED]} for d in duplicates],
        "missing_fields": missing,
        "unmapped_columns": unmapped,
        "ignored_columns": mapping.ignored_count,
        "missing_required_columns": mapping.missing_required,
        "flags": flag_summary,
        "types_needing_specs": stats.extras.get("types_needing_specs", []),
        "operators_without_rfq_contact": {"count": len(set(no_rfq)), "rows": _rows_summary(no_rfq)}
        if dataset == "operators"
        else None,
        "contacts": {
            "loaded": stats.extras.get("contacts_loaded", 0),
            "updated": stats.extras.get("contacts_updated", 0),
            "pending_admin_confirmation": {
                "count": len(set(stats.extras.get("contacts_pending_confirmation_rows", []))),
                "rows": _rows_summary(stats.extras.get("contacts_pending_confirmation_rows", [])),
            },
        }
        if dataset == "operators"
        else None,
        "fbos": stats.extras.get("fbos") if dataset == "airports_fbos" else None,
        "excluded_certificates": excluded_certificates,
    }


# ----------------------------------------------------------------------------- markdown
def _expected_table(cfg: IngestConfig) -> list[str]:
    out = ["| Dataset | File name starts with | Required fields | Optional fields |", "|---|---|---|---|"]
    for ds in DATASETS:
        spec = cfg.mappings[ds]
        req = [f.name for f in spec.fields.values() if f.required]
        for grp in spec.required_any:
            req.append(" or ".join(grp))
        opt = [f.name for f in spec.fields.values() if not f.required]
        out.append(f"| {ds} | `{ds}` | {', '.join(req)} | {', '.join(opt)} |")
    return out


def _header(generated: datetime) -> list[str]:
    return [
        "# EXJET data report",
        "",
        f"Generated {generated.strftime('%Y-%m-%d %H:%M UTC')} by the ingest pipeline. Regenerated after every load.",
        "",
        "Rows are identified by source row number (spreadsheet row, header = row 1; for JSON the 1-based record index).",
        (
            "This report contains counts and row numbers only: no operator or contact identities, no full email "
            "addresses and no rating sources."
        ),
        "",
    ]


def render_no_files(cfg: IngestConfig, raw_dir: Path, generated: datetime | None = None) -> str:
    generated = generated or datetime.now(UTC)
    lines = _header(generated)
    lines += [
        "## No files found",
        "",
        f"No data files were found in `{raw_dir}`. Nothing was loaded and the database was not touched.",
        "",
        (
            "Place founder-supplied files in `data/raw/`. Accepted formats: CSV, XLSX, JSON. "
            "Files are picked up by the start of their file name, and loaded in this order:"
        ),
        "",
        *_expected_table(cfg),
        "",
        (
            "Column headers are matched to these fields through `data/mappings/*.yaml` (case and punctuation "
            "insensitive). Unmapped columns and missing required columns are reported here after the first load, "
            "and the mapping files can be adjusted without code changes. See `data/README.md`."
        ),
        "",
        (
            f"Operators whose legal or DBA name matches the exclusion list ({', '.join(cfg.excluded)}) are rejected at "
            "ingest, along with their aircraft and contacts."
        ),
        "",
    ]
    return "\n".join(lines)


def _pct(v: float) -> str:
    return f"{v:g}%"


def render_run(rep: dict[str, Any], started_by: str, at: datetime | None) -> list[str]:
    ds = rep["dataset"]
    out = [f"## {ds}", ""]
    out += [
        f"- File: `{rep['file']}`",
        f"- SHA-256: `{rep['sha256']}`",
        f"- Run: {at.strftime('%Y-%m-%d %H:%M UTC') if at else 'n/a'} by `{started_by}`"
        + (" (DRY RUN, nothing written)" if rep.get("dry_run") else ""),
        "",
        "| Rows read | Loaded (new) | Updated | Unchanged | Rejected | Duplicates merged |",
        "|---:|---:|---:|---:|---:|---:|",
        (
            f"| {rep['rows_read']} | {rep['loaded']} | {rep['updated']} | {rep['unchanged']} | {rep['rejected']} "
            f"| {rep['duplicates_merged']} |"
        ),
        "",
    ]
    if rep.get("fbos"):
        f = rep["fbos"]
        out += [f"FBO records: {f['loaded']} new, {f['updated']} updated, {f['unchanged']} unchanged.", ""]
    if rep.get("contacts"):
        c = rep["contacts"]
        out += [f"Operator contacts: {c['loaded']} new, {c['updated']} updated.", ""]

    if rep["missing_required_columns"]:
        out += [
            "**Required columns missing from the file (every row rejected):** "
            + ", ".join(f"`{m}`" for m in rep["missing_required_columns"]),
            "",
        ]

    out += [f"### Rejected ({rep['rejected']})", ""]
    if rep["rejected"]:
        out += [
            "By reason: " + ", ".join(f"`{k}` {v}" for k, v in sorted(rep["rejects_by_reason"].items())),
            "",
            "| Row | Reason | Detail |",
            "|---:|---|---|",
        ]
        for r in rep["rejects"][:MAX_MD_REJECTS]:
            out.append(f"| {r['row']} | `{r['reason']}` | {r['detail']} |")
        if rep["rejected"] > MAX_MD_REJECTS:
            out.append(
                f"| | | {rep['rejected'] - MAX_MD_REJECTS} more not listed (full list in the ingest run record) |"
            )
    else:
        out.append("None.")
    out.append("")

    out += [f"### Duplicates merged ({rep['duplicates_merged']})", ""]
    if rep["duplicates"]:
        out += ["| Matched on | Source rows |", "|---|---|"]
        out += [f"| {d['key']} | {', '.join(map(str, d['rows']))} |" for d in rep["duplicates"]]
    else:
        out.append("None.")
    out.append("")

    out += [
        "### Missing fields by column",
        "",
        "| Column | Missing | % of rows | In file |",
        "|---|---:|---:|---|",
    ]
    for col, m in rep["missing_fields"].items():
        out.append(
            f"| {col} | {m['count']} | {_pct(m['pct'])} | {'yes' if m['column_present'] else 'no column'} |"
        )
    out.append("")

    out += ["### Unmapped columns", ""]
    if rep["unmapped_columns"]:
        out.append(
            "Not recognised by `data/mappings/"
            + ds
            + ".yaml`; ignored: "
            + ", ".join(f"`{c}`" for c in rep["unmapped_columns"])
        )
    else:
        out.append("None.")
    if rep.get("ignored_columns"):
        out.append(f"{rep['ignored_columns']} column(s) deliberately dropped by the mapping (never stored).")
    out.append("")

    out += ["### Flags", ""]
    if rep["flags"]:
        out += ["| Flag | Rows | Source rows |", "|---|---:|---|"]
        for code, f in rep["flags"].items():
            more = " ..." if f["count"] > len(f["rows"]) else ""
            out.append(f"| `{code}` | {f['count']} | {', '.join(map(str, f['rows']))}{more} |")
    else:
        out.append("None.")
    out.append("")

    if rep.get("operators_without_rfq_contact") is not None:
        o = rep["operators_without_rfq_contact"]
        out += [
            f"### Operators with no RFQ contact email ({o['count']})",
            "",
            "RFQs must reach a real contact. These operators cannot receive an RFQ until one is supplied. "
            + ("Source rows: " + ", ".join(map(str, o["rows"])) if o["rows"] else "None."),
            "",
        ]
    pend = (rep.get("contacts") or {}).get("pending_admin_confirmation")
    if pend and pend["count"]:
        out += [
            f"### Contacts awaiting admin confirmation ({pend['count']})",
            "",
            "These contacts were added to operators that are already live. They do not receive RFQs until an admin "
            "confirms them in Company OS. Source rows: " + ", ".join(map(str, pend["rows"])),
            "",
        ]
    if ds == "aircraft":
        types = rep.get("types_needing_specs", [])
        out += [f"### Aircraft types created that need specs ({len(types)})", ""]
        if types:
            out += [
                (
                    "Created from the file with only the fields it provided; every spec below is empty and must be "
                    "supplied before mission matching will offer the type."
                ),
                "",
                "| Type | Source rows | Missing |",
                "|---|---|---|",
            ]
            for t in types:
                out.append(
                    f"| {t['type']} | {', '.join(map(str, t['rows'][:10]))} | {', '.join(t['missing'])} |"
                )
        else:
            out.append("None.")
        out.append("")
    return out


def render_report(runs: list[IngestRun], cfg: IngestConfig, generated: datetime | None = None) -> str:
    generated = generated or datetime.now(UTC)
    by_ds = {r.dataset: r for r in runs}
    lines = _header(generated)
    lines += [
        "## Summary (latest run per dataset)",
        "",
        "| Dataset | File | Read | Loaded | Updated | Unchanged | Rejected | Merged |",
        "|---|---|---:|---:|---:|---:|---:|---:|",
    ]
    for ds in DATASETS:
        r = by_ds.get(ds)
        if r is None or not r.report:
            lines.append(f"| {ds} | no file loaded yet | | | | | | |")
        else:
            rep = r.report
            lines.append(
                f"| {ds} | `{rep['file']}` | {rep['rows_read']} | {rep['loaded']} | {rep['updated']} | "
                f"{rep['unchanged']} | {rep['rejected']} | {rep['duplicates_merged']} |"
            )
    lines.append("")
    for ds in DATASETS:
        r = by_ds.get(ds)
        if r is not None and r.report:
            lines += render_run(r.report, r.started_by, r.created_at)
    return "\n".join(lines).rstrip() + "\n"


def latest_runs(session: Session) -> list[IngestRun]:
    runs = []
    for ds in DATASETS:
        r = session.scalars(
            select(IngestRun).where(IngestRun.dataset == ds).order_by(IngestRun.created_at.desc()).limit(1)
        ).first()
        if r is not None:
            runs.append(r)
    return runs


def write_text_atomic(text: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


def write_report_file(
    session: Session, path: str | Path | None = None, cfg: IngestConfig | None = None
) -> Path | None:
    from .config import load_config

    target = Path(path) if path else default_report_path()
    try:
        write_text_atomic(render_report(latest_runs(session), cfg or load_config()), target)
    except OSError as exc:  # a read-only deploy filesystem must not fail an ingest
        log.warning("could not write %s: %s", target, exc.__class__.__name__)
        return None
    return target
