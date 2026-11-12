"""Command line: `python -m exjet_api.ingest run [--dataset X] [--file PATH] [--dry-run]`."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from sqlalchemy.orm import Session

from .config import DATASETS, FILE_EXTENSIONS, ConfigError, default_data_dir, default_report_path, load_config
from .pipeline import IngestError, run_ingest
from .report import render_no_files, render_report, write_report_file, write_text_atomic


def infer_dataset(filename: str) -> str | None:
    low = filename.lower()
    return next((ds for ds in DATASETS if low.startswith(ds)), None)


def scan_raw(raw_dir: Path, only: str | None = None) -> list[tuple[str, Path]]:
    """(dataset, path) for every data file in raw_dir, in dependency order then file name."""
    if not raw_dir.is_dir():
        return []
    found: list[tuple[str, Path]] = []
    for p in sorted(raw_dir.iterdir()):
        if not p.is_file() or p.name.startswith((".", "~$")) or p.suffix.lower() not in FILE_EXTENSIONS:
            continue
        ds = infer_dataset(p.name)
        if ds and (only is None or ds == only):
            found.append((ds, p))
    found.sort(key=lambda t: (DATASETS.index(t[0]), t[1].name))
    return found


def _print_run(run) -> None:
    r = run.report
    print(
        f"{r['dataset']:<15} {r['file']}: read {r['rows_read']}, loaded {r['loaded']}, updated {r['updated']}, "
        f"unchanged {r['unchanged']}, rejected {r['rejected']}, merged {r['duplicates_merged']}"
    )


def cmd_run(args: argparse.Namespace) -> int:
    try:
        cfg = load_config()
    except ConfigError as exc:
        print(f"config error: {exc}", file=sys.stderr)
        return 2
    raw_dir = Path(args.raw_dir) if args.raw_dir else default_data_dir() / "raw"
    report_path = Path(args.report_path) if args.report_path else default_report_path()

    if args.file:
        path = Path(args.file)
        ds = args.dataset or infer_dataset(path.name)
        if ds is None:
            print("cannot infer the dataset from the file name; pass --dataset", file=sys.stderr)
            return 2
        jobs = [(ds, path)]
    else:
        jobs = scan_raw(raw_dir, args.dataset)

    if not jobs:
        text = render_no_files(cfg, raw_dir)
        print(f"No data files found in {raw_dir}.")
        if args.dry_run:
            print(text)
        else:
            write_text_atomic(text, report_path)
            print(f"Wrote {report_path}")
        return 0

    from ..db import get_engine

    engine = get_engine()
    failures = 0
    runs = []
    if args.dry_run:
        conn = engine.connect()
        outer = conn.begin()
        session = Session(bind=conn, join_transaction_mode="create_savepoint")
    else:
        session = Session(engine)
    try:
        for ds, path in jobs:
            try:
                run = run_ingest(
                    session,
                    ds,
                    path,
                    path.name,
                    "cli",
                    dry_run=args.dry_run,
                    keep_pending=args.dry_run,
                    write_report=False,
                    config=cfg,
                )
            except IngestError as exc:
                failures += 1
                print(f"{ds}: FAILED {exc}", file=sys.stderr)
                continue
            runs.append(run)
            _print_run(run)
        if args.dry_run:
            print("\nDRY RUN: nothing was written.\n")
            print(render_report(runs, cfg))
        else:
            target = write_report_file(session, report_path, cfg)
            print(f"Wrote {target}" if target else "Could not write the report file")
    finally:
        session.close()
        if args.dry_run:
            outer.rollback()
            conn.close()
    return 1 if failures else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m exjet_api.ingest")
    sub = parser.add_subparsers(dest="command", required=True)
    run = sub.add_parser("run", help="ingest files from data/raw (or one --file)")
    run.add_argument(
        "--dataset",
        choices=DATASETS,
        help="only this dataset (required with --file unless the name starts with it)",
    )
    run.add_argument("--file", help="ingest this one file instead of scanning data/raw")
    run.add_argument("--dry-run", action="store_true", help="validate and report without writing anything")
    run.add_argument("--raw-dir", help="override data/raw (default: <repo>/data/raw or $EXJET_DATA_DIR/raw)")
    run.add_argument("--report-path", help="override DATA_REPORT.md location")
    run.set_defaults(func=cmd_run)
    args = parser.parse_args(argv)
    return args.func(args)
