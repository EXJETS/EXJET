"""Shared dataclasses passed between pipeline stages."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Reject:
    row: int
    reason: str  # snake_case code, e.g. excluded_operator, missing_required:dba_name
    detail: str = ""  # never contains PII or a rating source


@dataclass
class Flag:
    row: int
    code: str
    detail: str = ""


@dataclass
class Row:
    """A validated, normalised record. `rows` lists every source row merged into it."""

    n: int
    data: dict[str, Any]
    flags: list[Flag] = field(default_factory=list)
    rows: list[int] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.rows:
            self.rows = [self.n]


@dataclass
class Duplicate:
    key_type: str  # certificate_number | dba_name | tail_number | icao | icao+fbo | email
    rows: list[int]


@dataclass
class ValidationContext:
    """Cross-row facts validators may use. excluded_certs is filled by the operators validator and
    seeded from earlier operator runs so aircraft of an excluded operator are rejected as such."""

    excluded_certs: set[str] = field(default_factory=set)


@dataclass
class LoadStats:
    loaded: int = 0
    updated: int = 0
    unchanged: int = 0
    rejects: list[Reject] = field(default_factory=list)
    flags: list[Flag] = field(default_factory=list)
    extras: dict[str, Any] = field(default_factory=dict)
