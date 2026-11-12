"""Stage 1: read a CSV, XLSX or JSON file into (headers, rows). Encoding and delimiter tolerant."""

from __future__ import annotations

import csv
import hashlib
import io
import json
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO

from .normalize import clean


class ReadError(ValueError):
    pass


@dataclass
class SourceRow:
    number: int  # spreadsheet row number (header = 1) for csv/xlsx, 1-based record index for json
    values: dict[str, str | None]


@dataclass
class SourceFile:
    filename: str
    sha256: str
    headers: list[str]
    rows: list[SourceRow]


def _decode(data: bytes) -> str:
    if data.startswith(b"\xef\xbb\xbf"):
        return data[3:].decode("utf-8")
    if data.startswith((b"\xff\xfe", b"\xfe\xff")):
        return data.decode("utf-16")
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("cp1252", errors="replace")


def _read_csv(data: bytes) -> tuple[list[str], list[SourceRow]]:
    text = _decode(data)
    sample = text[:8192]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
        delimiter = dialect.delimiter
    except csv.Error:
        delimiter = ","
    reader = csv.reader(io.StringIO(text, newline=""), delimiter=delimiter)
    headers: list[str] | None = None
    rows: list[SourceRow] = []
    for line_no, rec in enumerate(reader, start=1):
        if headers is None:
            if not any((c or "").strip() for c in rec):
                continue
            headers = [(c or "").strip() for c in rec]
            continue
        vals = {h: clean(rec[i]) if i < len(rec) else None for i, h in enumerate(headers) if h}
        if any(v is not None for v in vals.values()):
            rows.append(SourceRow(line_no, vals))
    if headers is None:
        raise ReadError("file has no header row")
    return headers, rows


def _read_xlsx(data: bytes) -> tuple[list[str], list[SourceRow]]:
    from openpyxl import load_workbook

    try:
        wb = load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    except Exception as exc:  # corrupt or not an xlsx
        raise ReadError(f"cannot open workbook ({exc.__class__.__name__})") from exc
    try:
        for ws in wb.worksheets:
            headers: list[str] | None = None
            rows: list[SourceRow] = []
            for idx, rec in enumerate(ws.iter_rows(values_only=True), start=1):
                if headers is None:
                    if not any(clean(c) for c in rec):
                        continue
                    headers = [clean(c) or "" for c in rec]
                    continue
                vals = {h: clean(rec[i]) if i < len(rec) else None for i, h in enumerate(headers) if h}
                if any(v is not None for v in vals.values()):
                    rows.append(SourceRow(idx, vals))
            if headers is not None:
                return headers, rows
    finally:
        wb.close()
    raise ReadError("workbook has no data")


def _records_from_json(data: bytes) -> list[dict]:
    text = _decode(data).strip()
    if not text:
        raise ReadError("file is empty")
    try:
        obj = json.loads(text)
    except json.JSONDecodeError:
        try:  # JSON lines
            obj = [json.loads(line) for line in text.splitlines() if line.strip()]
        except json.JSONDecodeError as exc:
            raise ReadError("invalid JSON") from exc
    if isinstance(obj, dict):
        lists = [v for v in obj.values() if isinstance(v, list)]
        if len(lists) == 1:
            obj = lists[0]
        else:
            raise ReadError("JSON object must contain exactly one list of records")
    if not isinstance(obj, list) or not all(isinstance(r, dict) for r in obj):
        raise ReadError("JSON must be a list of objects")
    return obj


def _read_json(data: bytes) -> tuple[list[str], list[SourceRow]]:
    records = _records_from_json(data)
    headers: list[str] = []
    for rec in records:
        for k in rec:
            if k not in headers:
                headers.append(k)
    rows = []
    for i, rec in enumerate(records, start=1):
        vals = {
            h: clean(rec.get(h)) if not isinstance(rec.get(h), (list, dict)) else _join(rec.get(h))
            for h in headers
        }
        if any(v is not None for v in vals.values()):
            rows.append(SourceRow(i, vals))
    return headers, rows


def _join(value) -> str | None:
    if isinstance(value, list):
        return clean("; ".join(str(x) for x in value))
    return None


def read_source(source: str | Path | bytes | BinaryIO, filename: str | None = None) -> SourceFile:
    if isinstance(source, (str, Path)):
        path = Path(source)
        data = path.read_bytes()
        filename = filename or path.name
    elif isinstance(source, bytes):
        data = source
    else:
        data = source.read()
        filename = filename or getattr(source, "name", None)
    if not filename:
        raise ReadError("a filename is required to detect the file format")
    name = Path(filename).name
    ext = Path(name).suffix.lower()
    if ext in (".csv", ".tsv", ".txt"):
        headers, rows = _read_csv(data)
    elif ext in (".xlsx", ".xlsm"):
        headers, rows = _read_xlsx(data)
    elif ext in (".json", ".jsonl", ".ndjson"):
        headers, rows = _read_json(data)
    else:
        raise ReadError(f"unsupported file type {ext or '(none)'}; use csv, xlsx or json")
    return SourceFile(name, hashlib.sha256(data).hexdigest(), headers, rows)
