"""Subprocess entry point: parse ONE untrusted PDF with hard limits, print one JSON object to stdout.

Run as `python -I -m exjet_product.pdf_worker MAX_PAGES MAX_CHARS < pdf`. The parent (pdf_safe) applies CPU and memory
rlimits and a wall-clock timeout. This module never raises to its caller: every outcome is a JSON object
{"ok": true, "pages": [...], "links": [...]} or {"ok": false, "reason": "..."}.
"""
from __future__ import annotations

import io
import json
import sys


def run(data: bytes, max_pages: int, max_chars: int) -> dict:
    from pypdf import PdfReader

    try:
        reader = PdfReader(io.BytesIO(data))
        n = len(reader.pages)
    except Exception:  # noqa: BLE001 - corrupt or encrypted: unreadable, not a limit breach
        return {"ok": True, "pages": [], "links": [], "unreadable": True}
    if n > max_pages:
        return {"ok": False, "reason": "too_many_pages"}
    pages: list[str] = []
    links: list[str] = []
    total = 0
    for page in reader.pages:  # one pass: text and link annotations together
        try:
            text = page.extract_text() or ""
        except Exception:  # noqa: BLE001
            text = ""
        total += len(text)
        if total > max_chars:
            return {"ok": False, "reason": "text_too_long"}
        pages.append(text)
        try:
            for annot in page.get("/Annots") or []:
                action = annot.get_object().get("/A")
                if action is not None:
                    uri = action.get_object().get("/URI")
                    if uri and len(links) < 200:
                        links.append(str(uri)[:2048])
        except Exception:  # noqa: BLE001
            pass
    return {"ok": True, "pages": pages, "links": links}


def main() -> int:
    max_pages, max_chars = int(sys.argv[1]), int(sys.argv[2])
    data = sys.stdin.buffer.read()
    try:
        out = run(data, max_pages, max_chars)
    except MemoryError:
        out = {"ok": False, "reason": "memory"}
    sys.stdout.write(json.dumps(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
