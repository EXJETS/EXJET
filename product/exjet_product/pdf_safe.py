"""Bounded PDF extraction for attacker-supplied files (M5).

The PDF is parsed ONCE, in a child process with CPU and address-space rlimits and a wall-clock timeout. Size, page
count and extracted text length are capped. Any breach raises PdfLimitError(reason); callers quarantine the message
and do not retry. A corrupt or encrypted file is not a breach: it yields no pages.
"""
from __future__ import annotations

import json
import subprocess
import sys
from dataclasses import dataclass, field

DEFAULT_MAX_BYTES = 10 * 1024 * 1024
DEFAULT_MAX_PAGES = 50
DEFAULT_MAX_CHARS = 400_000
DEFAULT_TIMEOUT = 20
DEFAULT_CPU_SECONDS = 15
DEFAULT_MEMORY_MB = 768
_MAX_STDOUT = 8 * 1024 * 1024


class PdfLimitError(Exception):
    """The document broke a parsing bound. `reason` is a stable snake_case code."""

    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


@dataclass
class PdfExtract:
    pages: list[str] = field(default_factory=list)
    links: list[str] = field(default_factory=list)


def _limits(cpu_seconds: int, memory_mb: int):
    def apply() -> None:  # runs in the child between fork and exec
        import resource

        resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds + 1))
        resource.setrlimit(resource.RLIMIT_AS, (memory_mb * 1024 * 1024, memory_mb * 1024 * 1024))
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))  # the parser writes nothing

    return apply


def extract_bounded(
    data: bytes,
    *,
    max_bytes: int = DEFAULT_MAX_BYTES,
    max_pages: int = DEFAULT_MAX_PAGES,
    max_chars: int = DEFAULT_MAX_CHARS,
    timeout: int = DEFAULT_TIMEOUT,
    cpu_seconds: int = DEFAULT_CPU_SECONDS,
    memory_mb: int = DEFAULT_MEMORY_MB,
) -> PdfExtract:
    if len(data) > max_bytes:
        raise PdfLimitError("too_large")
    try:
        proc = subprocess.run(
            [sys.executable, "-I", "-m", "exjet_product.pdf_worker", str(max_pages), str(max_chars)],
            input=data, capture_output=True, timeout=timeout, preexec_fn=_limits(cpu_seconds, memory_mb),  # noqa: PLW1509
            env={"PATH": "/usr/bin:/bin"},
        )
    except subprocess.TimeoutExpired:
        raise PdfLimitError("timeout") from None
    if proc.returncode != 0 or len(proc.stdout) > _MAX_STDOUT:
        raise PdfLimitError("resource_limit")  # killed by an rlimit signal, out of memory, or crashed
    try:
        out = json.loads(proc.stdout)
    except ValueError:
        raise PdfLimitError("resource_limit") from None
    if not out.get("ok"):
        raise PdfLimitError(str(out.get("reason") or "resource_limit"))
    return PdfExtract(pages=list(out.get("pages") or []), links=list(out.get("links") or []))
