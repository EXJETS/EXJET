"""EXJET data ingest pipeline.

Public API (used by the admin upload endpoint, `POST /v1/admin/ingest`):

    run_ingest(
        session: sqlalchemy.orm.Session,
        dataset: str,                                   # operators | aircraft | airports_fbos | outreach_lists
        fileobj_or_path: str | pathlib.Path | bytes | BinaryIO,
        filename: str | None,                           # decides csv / xlsx / json; defaults to the path's name
        started_by: str,                                # e.g. "user:<uuid>" or "cli"
        *,
        dry_run: bool = False,                          # validate and report, write nothing (rolled back)
        write_report: bool = True,                      # regenerate DATA_REPORT.md after a real load
        report_path: str | Path | None = None,
        config: IngestConfig | None = None,             # tests; default reads data/mappings
        extra_excluded_certs: set[str] | None = None,
        keep_pending: bool = False,                     # CLI dry run only
    ) -> IngestRun

It commits on success (not for dry runs), persists an IngestRun row whose `report` JSON holds the counts,
rejects, flags and missing fields, and raises IngestError when the file cannot be processed at all
(unknown dataset, unreadable or unsupported file). Row-level problems are never exceptions: they are
rejected with a reason and listed in the report. The caller should call this inside a request-scoped session
and treat IngestError as a 422.

Stages (pure except the loader): readers -> mapping -> validate (normalise) -> dedupe -> loaders -> report.
CLI: `uv run python -m exjet_api.ingest run [--dataset X] [--file PATH] [--dry-run]`.
"""

from .config import DATASETS, IngestConfig, load_config
from .pipeline import IngestError, run_ingest

__all__ = ["DATASETS", "IngestConfig", "IngestError", "load_config", "run_ingest"]
