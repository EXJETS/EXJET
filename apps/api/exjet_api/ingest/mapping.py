"""Stage 2: map source headers to target fields using the dataset's YAML aliases."""

from __future__ import annotations

from dataclasses import dataclass, field

from .config import DatasetMapping
from .normalize import clean, compact


@dataclass
class MappingResult:
    colmap: dict[str, str] = field(default_factory=dict)  # target field -> source header
    unmapped: list[str] = field(default_factory=list)  # headers matching nothing (ignored ones excluded)
    ignored_count: int = 0
    missing_required: list[str] = field(default_factory=list)  # fields / "a|b" groups that are absent


def map_columns(headers: list[str], mapping: DatasetMapping) -> MappingResult:
    lookup: dict[str, str] = {}
    for spec in mapping.fields.values():
        for alias in [spec.name, *spec.aliases]:
            lookup.setdefault(compact(alias), spec.name)
    ignored_keys = {compact(i) for i in mapping.ignored}

    res = MappingResult()
    for h in headers:
        key = compact(h)
        if not key:
            continue
        if key in ignored_keys:
            res.ignored_count += 1
            continue
        target = lookup.get(key)
        if target is None or target in res.colmap:
            res.unmapped.append(h)  # unknown, or a second column for an already-mapped field
        else:
            res.colmap[target] = h

    for spec in mapping.fields.values():
        if (
            spec.required
            and spec.name not in res.colmap
            and not any(s in res.colmap for s in spec.satisfied_by)
        ):
            res.missing_required.append(spec.name)
    for group in mapping.required_any:
        if not any(f in res.colmap for f in group):
            res.missing_required.append("|".join(group))
    return res


def map_row(raw: dict[str, str], colmap: dict[str, str]) -> dict[str, str | None]:
    """Source row -> {target field: cleaned string or None}. Absent columns are None."""
    return {target: clean(raw.get(header)) for target, header in colmap.items()}
