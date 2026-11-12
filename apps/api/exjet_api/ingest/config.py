"""Ingest configuration: paths, YAML mappings and founder-editable rule files."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from ..config import get_settings
from .normalize import RATING_VALUES, compact, fold, type_key

DATASETS = ("airports_fbos", "operators", "aircraft", "outreach_lists")  # dependency order
FILE_EXTENSIONS = (".csv", ".tsv", ".txt", ".xlsx", ".xlsm", ".json", ".jsonl", ".ndjson")

REPO_ROOT = Path(__file__).resolve().parents[4]


def default_data_dir() -> Path:
    return Path(os.environ.get("EXJET_DATA_DIR") or REPO_ROOT / "data")


def default_report_path() -> Path:
    return Path(os.environ.get("EXJET_REPORT_PATH") or REPO_ROOT / "DATA_REPORT.md")


class ConfigError(ValueError):
    pass


@dataclass
class FieldSpec:
    name: str
    required: bool = False
    satisfied_by: list[str] = field(default_factory=list)
    aliases: list[str] = field(default_factory=list)


@dataclass
class DatasetMapping:
    dataset: str
    fields: dict[str, FieldSpec]
    required_any: list[list[str]] = field(default_factory=list)
    ignored: list[str] = field(default_factory=list)


@dataclass
class IngestConfig:
    mappings_dir: Path
    excluded: list[str]
    dba_overrides: dict[str, str]  # folded source name -> DBA
    type_aliases: dict[str, tuple[str, str]]  # type_key(file) -> (canonical manufacturer, canonical model)
    rating_aliases: dict[str, str]
    rating_source_tokens: list[str]
    mappings: dict[str, DatasetMapping]

    def is_source_token_header(self, header: str) -> bool:
        """True when a column header names a rating vendor (reports must never show these)."""
        h = fold(header)
        c = compact(header)
        for tok in self.rating_source_tokens:
            if fold(tok) and (fold(tok) in h.split() or compact(tok) in c):
                return True
        return False


def _load_yaml(path: Path) -> dict:
    try:
        with open(path, encoding="utf-8") as fh:
            data = yaml.safe_load(fh)
    except FileNotFoundError:
        return {}
    except yaml.YAMLError as exc:
        raise ConfigError(f"{path.name}: invalid YAML ({exc.__class__.__name__})") from exc
    if data is None:
        return {}
    if not isinstance(data, dict):
        raise ConfigError(f"{path.name}: top level must be a mapping")
    return data


def _load_mapping(path: Path, dataset: str) -> DatasetMapping:
    raw = _load_yaml(path)
    if not raw:
        raise ConfigError(f"{path.name}: mapping file missing or empty for dataset {dataset}")
    fields: dict[str, FieldSpec] = {}
    for fname, spec in (raw.get("fields") or {}).items():
        spec = spec or {}
        fields[fname] = FieldSpec(
            name=fname,
            required=bool(spec.get("required", False)),
            satisfied_by=[str(x) for x in spec.get("satisfied_by") or []],
            aliases=[str(x) for x in spec.get("aliases") or []],
        )
    for group in raw.get("required_any") or []:
        for f in group:
            if f not in fields:
                raise ConfigError(f"{path.name}: required_any references unknown field {f}")
    return DatasetMapping(
        dataset=dataset,
        fields=fields,
        required_any=[[str(f) for f in g] for g in raw.get("required_any") or []],
        ignored=[str(x) for x in raw.get("ignored") or []],
    )


def load_config(mappings_dir: Path | None = None, excluded: list[str] | None = None) -> IngestConfig:
    mdir = Path(mappings_dir) if mappings_dir else default_data_dir() / "mappings"
    if excluded is None:
        excluded = [x.strip() for x in get_settings().excluded_operators.split(",") if x.strip()]

    overrides_raw = (_load_yaml(mdir / "dba_overrides.yaml").get("overrides")) or {}
    if not isinstance(overrides_raw, dict):
        raise ConfigError("dba_overrides.yaml: overrides must be a mapping")
    overrides = {
        fold(str(k)): str(v).strip() for k, v in overrides_raw.items() if fold(str(k)) and str(v).strip()
    }

    type_aliases: dict[str, tuple[str, str]] = {}
    for item in _load_yaml(mdir / "aircraft_type_aliases.yaml").get("aliases") or []:
        try:
            key = type_key(item["manufacturer"], item["model"])
            type_aliases[key] = (str(item["canonical_manufacturer"]), str(item["canonical_model"]))
        except (KeyError, TypeError) as exc:
            raise ConfigError(
                "aircraft_type_aliases.yaml: each alias needs manufacturer, model, "
                "canonical_manufacturer and canonical_model"
            ) from exc

    rating = _load_yaml(mdir / "safety_rating_map.yaml")
    rating_aliases: dict[str, str] = {}
    for k, v in (rating.get("aliases") or {}).items():
        if v not in RATING_VALUES:
            raise ConfigError(
                f"safety_rating_map.yaml: alias value must be one of {', '.join(RATING_VALUES)}"
            )
        rating_aliases[fold(str(k))] = v
    tokens = [str(t) for t in rating.get("source_tokens") or []]

    mappings = {ds: _load_mapping(mdir / f"{ds}.yaml", ds) for ds in DATASETS}
    return IngestConfig(
        mappings_dir=mdir,
        excluded=excluded,
        dba_overrides=overrides,
        type_aliases=type_aliases,
        rating_aliases=rating_aliases,
        rating_source_tokens=tokens,
        mappings=mappings,
    )
