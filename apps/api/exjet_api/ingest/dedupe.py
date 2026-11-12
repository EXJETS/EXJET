"""Stage 5: in-file deduplication. Pure. Order of precedence per dataset:

operators      certificate number, then normalised DBA name
aircraft       tail number
airports_fbos  ICAO (airport) and airport+FBO name (FBO)
outreach       lowercased email

The first row wins. Later rows only fill fields the first row left empty. Differing non-empty values keep
the first and raise a `merge_conflict:<field>` flag.
"""

from __future__ import annotations

from typing import Any

from .normalize import compact, name_key
from .types import Duplicate, Flag, Reject, Row


def _merge(base: Row, other: Row, skip: tuple[str, ...] = ()) -> None:
    for k, v in other.data.items():
        if k in skip or v is None or v == []:
            continue
        cur = base.data.get(k)
        if cur is None or cur == []:
            base.data[k] = v
        elif cur != v and not (k == "dba_name" and name_key(cur) == name_key(v)):
            base.flags.append(
                Flag(other.n, f"merge_conflict:{k}", "later duplicate row differs; first value kept")
            )
    base.flags.extend(other.flags)
    base.rows.extend(other.rows)


def dedupe_operators(rows: list[Row]) -> tuple[list[Row], list[Duplicate]]:
    groups: list[Row] = []
    dupes: dict[tuple[int, str], list[int]] = {}  # (group, key type) -> rows

    def note(group: Row, key_type: str, n: int) -> None:
        dupes.setdefault((id(group), key_type), [group.n]).append(n)

    for row in rows:
        cert, nk = row.data["certificate_number"], name_key(row.data["dba_name"])
        target: Row | None = None
        key_type = "certificate_number"
        if cert:
            target = next((g for g in groups if g.data["certificate_number"] == cert), None)
            if target is None:
                target = next(
                    (
                        g
                        for g in groups
                        if g.data["certificate_number"] is None and name_key(g.data["dba_name"]) == nk
                    ),
                    None,
                )
                key_type = "dba_name"
        else:
            matches = [g for g in groups if name_key(g.data["dba_name"]) == nk]
            if matches:
                target, key_type = matches[0], "dba_name"
                if len(matches) > 1:
                    row.flags.append(
                        Flag(row.n, "ambiguous_name_match", "no certificate; same name as several operators")
                    )
        if target is None:
            groups.append(row)
            continue
        contacts = {c["email"]: c for c in target.data["contacts"]}
        for c in row.data["contacts"]:
            contacts.setdefault(c["email"], c)
        _merge(target, row, skip=("contacts",))
        target.data["contacts"] = list(contacts.values())
        note(target, key_type, row.n)
    return groups, [Duplicate(kt, sorted(rs)) for (_, kt), rs in dupes.items()]


def _operator_ref(data: dict[str, Any]) -> tuple[str | None, str]:
    return data.get("operator_certificate_number"), name_key(data.get("operator_name"))


def dedupe_aircraft(rows: list[Row]) -> tuple[list[Row], list[Duplicate], list[Reject]]:
    by_tail: dict[str, Row] = {}
    order: list[Row] = []
    dupes: dict[str, list[int]] = {}
    rejects: list[Reject] = []
    for row in rows:
        tail = row.data["tail_number"]
        first = by_tail.get(tail)
        if first is None:
            by_tail[tail] = row
            order.append(row)
            continue
        c1, n1 = _operator_ref(first.data)
        c2, n2 = _operator_ref(row.data)
        same = (c1 == c2) if (c1 and c2) else (n1 == n2 if (n1 and n2) else False)
        if not same:
            rejects.append(
                Reject(
                    row.n,
                    "duplicate_tail_conflicting_operator",
                    f"tail already seen on row {first.n} under a different operator",
                )
            )
            continue
        _merge(first, row)
        dupes.setdefault(tail, [first.n]).append(row.n)
    return order, [Duplicate("tail_number", sorted(v)) for v in dupes.values()], rejects


def dedupe_outreach(rows: list[Row]) -> tuple[list[Row], list[Duplicate]]:
    by_email: dict[str, Row] = {}
    dupes: dict[str, list[int]] = {}
    for row in rows:
        first = by_email.get(row.data["email"])
        if first is None:
            by_email[row.data["email"]] = row
            continue
        _merge(first, row)
        dupes.setdefault(row.data["email"], [first.n]).append(row.n)
    return list(by_email.values()), [Duplicate("email", sorted(v)) for v in dupes.values()]


def dedupe_airports(rows: list[Row]) -> tuple[list[Row], list[Duplicate], dict[str, Row]]:
    """Units are (ICAO, FBO name). Also returns one merged airport record per ICAO."""
    units: dict[tuple[str, str], Row] = {}
    airports: dict[str, Row] = {}
    dupes: dict[tuple[str, str], list[int]] = {}
    for row in rows:
        icao = row.data["icao"]
        fbo = row.data["fbo"]
        key = (icao, compact(fbo["name"]) if fbo else "")
        if icao not in airports:
            airports[icao] = Row(row.n, {k: v for k, v in row.data.items() if k != "fbo"}, [])
        else:
            _merge(airports[icao], Row(row.n, {k: v for k, v in row.data.items() if k != "fbo"}, []), skip=())
        first = units.get(key)
        if first is None:
            units[key] = row
            continue
        if fbo and first.data["fbo"]:
            for k, v in fbo.items():
                if v is not None and first.data["fbo"].get(k) is None:
                    first.data["fbo"][k] = v
        first.rows.extend(row.rows)
        first.flags.extend(row.flags)
        dupes.setdefault(key, [first.n]).append(row.n)
    return (
        list(units.values()),
        [Duplicate("icao+fbo" if k[1] else "icao", sorted(v)) for k, v in dupes.items()],
        airports,
    )
