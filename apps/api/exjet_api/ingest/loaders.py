"""Stage 6: transactional upserts. The caller owns the transaction (commit or rollback).

Upserts never overwrite a stored value with an empty one: missing data is flagged, not filled and not erased.
Newly created operators are always go_live_status=draft. Excluded operators are never written.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import (
    Aircraft,
    AircraftType,
    Airport,
    Fbo,
    GoLiveStatus,
    Operator,
    OperatorContact,
    OutreachContact,
)
from .config import IngestConfig
from .normalize import compact, excluded_match, name_key, slugify, type_key
from .types import Flag, LoadStats, Reject, Row

SPEC_FIELDS = [
    "max_passengers",
    "range_nm",
    "cruise_speed_kts",
    "min_runway_ft",
    "baggage_cuft",
    "cabin_length_ft",
    "cabin_width_ft",
    "cabin_height_ft",
]


def _apply(obj: Any, values: dict[str, Any]) -> bool:
    """Set non-empty values that differ. Returns True if anything changed."""
    changed = False
    for k, v in values.items():
        if v is None or v == []:
            continue
        if getattr(obj, k) != v:
            setattr(obj, k, v)
            changed = True
    return changed


def _tally(stats: LoadStats, status: str) -> None:
    setattr(stats, status, getattr(stats, status) + 1)


def _combine(*statuses: str) -> str:
    if "loaded" in statuses:
        return "loaded"
    if "updated" in statuses:
        return "updated"
    return "unchanged"


# ----------------------------------------------------------------------------- operators
def load_operators(session: Session, rows: list[Row], cfg: IngestConfig, filename: str) -> LoadStats:
    stats = LoadStats()
    existing = list(session.scalars(select(Operator)))
    by_cert = {o.certificate_number: o for o in existing if o.certificate_number}
    by_name: dict[str, list[Operator]] = defaultdict(list)
    for o in existing:
        by_name[name_key(o.dba_name)].append(o)
    no_rfq: list[int] = []
    contacts_loaded = contacts_updated = 0

    for row in rows:
        d = row.data
        if excluded_match(d["dba_name"], cfg.excluded) or excluded_match(d["legal_name"], cfg.excluded):
            stats.rejects.append(Reject(row.n, "excluded_operator", "blocked again at load"))
            continue
        cert, nk = d["certificate_number"], name_key(d["dba_name"])
        op: Operator | None = None
        if cert:
            op = by_cert.get(cert)
            if op is None:
                op = next((o for o in by_name[nk] if o.certificate_number is None), None)
                if op is None and by_name[nk]:
                    stats.flags.append(
                        Flag(
                            row.n,
                            "same_name_different_certificate",
                            "name matches an operator with another certificate; loaded separately",
                        )
                    )
        else:
            cands = by_name[nk]
            op = cands[0] if cands else None
            if len(cands) > 1:
                stats.flags.append(
                    Flag(row.n, "ambiguous_name_match", "no certificate; matches several operators")
                )

        values = {
            "dba_name": d["dba_name"],
            "legal_name": d["legal_name"],
            "certificate_number": cert,
            "certificate_type": d["certificate_type"],
            "base_airport_icao": d["base_airport_icao"],
            "country": d["country"],
        }
        rating = d["safety_rating"]
        rating_unknown = any(f.code == "unknown_rating" for f in row.flags)
        if op is None:
            op = Operator(
                dba_name=d["dba_name"],
                legal_name=d["legal_name"],
                certificate_number=cert,
                certificate_type=d["certificate_type"] or "135",
                safety_rating=rating or "Not rated",
                base_airport_icao=d["base_airport_icao"],
                country=d["country"] or "US",
                is_excluded=False,
                go_live_status=GoLiveStatus.draft.value,
                source_file=filename,
            )
            session.add(op)
            session.flush()
            if cert:
                by_cert[cert] = op
            by_name[nk].append(op)
            status = "loaded"
        else:
            changed = _apply(op, values)
            if rating is not None and not (rating_unknown and op.safety_rating != "Not rated"):
                changed |= _apply(op, {"safety_rating": rating})
            if cert and op.certificate_number == cert:
                by_cert[cert] = op
            status = "updated" if changed else "unchanged"

        for c in d["contacts"]:
            ec = session.scalar(
                select(OperatorContact).where(
                    OperatorContact.operator_id == op.id, OperatorContact.email == c["email"]
                )
            )
            if ec is None:
                session.add(OperatorContact(operator_id=op.id, **c))
                contacts_loaded += 1
                status = "loaded" if status == "loaded" else "updated"
            elif _apply(ec, {k: v for k, v in c.items() if k != "email"}):
                contacts_updated += 1
                status = _combine(status, "updated")
        session.flush()
        has_rfq = session.scalar(
            select(func.count())
            .select_from(OperatorContact)
            .where(OperatorContact.operator_id == op.id, OperatorContact.receives_rfq.is_(True))
        )
        if not has_rfq:
            no_rfq.extend(row.rows[:1])
            stats.flags.append(Flag(row.n, "operator_no_rfq_contact_email", "no RFQ contact email on file"))
        _tally(stats, status)
    stats.extras.update(
        contacts_loaded=contacts_loaded, contacts_updated=contacts_updated, operators_no_rfq_rows=no_rfq
    )
    return stats


# ----------------------------------------------------------------------------- aircraft
def load_aircraft(
    session: Session, rows: list[Row], cfg: IngestConfig, filename: str, excluded_certs: set[str]
) -> LoadStats:
    stats = LoadStats()
    ops = list(session.scalars(select(Operator)))
    by_cert = {o.certificate_number: o for o in ops if o.certificate_number}
    by_name: dict[str, list[Operator]] = defaultdict(list)
    for o in ops:
        by_name[name_key(o.dba_name)].append(o)
    types = {type_key(t.manufacturer, t.model): t for t in session.scalars(select(AircraftType))}
    slugs = set(session.scalars(select(AircraftType.slug)))
    tails = {a.tail_number: a for a in session.scalars(select(Aircraft))}
    needs_specs: dict[str, dict] = {}
    created_types: set[str] = set()

    for row in rows:
        d = row.data
        cert, nk = d["operator_certificate_number"], name_key(d["operator_name"])
        if cert and cert in excluded_certs:
            stats.rejects.append(
                Reject(row.n, "excluded_operator", "aircraft belongs to an excluded operator")
            )
            continue
        op: Operator | None = None
        if cert:
            op = by_cert.get(cert)
            if op is None and nk:
                named = by_name[nk]
                op = next((o for o in named if o.certificate_number is None), None)
                if op is None and named:
                    stats.rejects.append(
                        Reject(
                            row.n,
                            "operator_certificate_mismatch",
                            "certificate not found; name matches an operator with another certificate",
                        )
                    )
                    continue
        else:
            named = by_name[nk]
            if len(named) > 1:
                stats.rejects.append(
                    Reject(row.n, "ambiguous_operator", "operator name matches several operators")
                )
                continue
            op = named[0] if named else None
        if op is None:
            stats.rejects.append(
                Reject(row.n, "unknown_operator", "operator not in database; load operators first")
            )
            continue
        if op.is_excluded or excluded_match(op.dba_name, cfg.excluded):
            stats.rejects.append(
                Reject(row.n, "excluded_operator", "aircraft belongs to an excluded operator")
            )
            continue
        if cert and nk and name_key(op.dba_name) != nk:
            stats.flags.append(
                Flag(
                    row.n,
                    "operator_name_mismatch",
                    "operator name differs from the certificate holder on file",
                )
            )

        man, model = d["manufacturer"], d["model"]
        key = type_key(man, model)
        if key in cfg.type_aliases:
            man, model = cfg.type_aliases[key]
            key = type_key(man, model)
        t = types.get(key)
        if t is None:
            if not d["category"]:
                stats.rejects.append(
                    Reject(
                        row.n,
                        "aircraft_type_category_required",
                        "type not in aircraft_types and the file gives no category (schema requires one)",
                    )
                )
                continue
            base = slugify(f"{man} {model}") or "type"
            slug, i = base[:80], 2
            while slug in slugs:
                slug = f"{base[:76]}-{i}"
                i += 1
            t = AircraftType(
                slug=slug,
                manufacturer=man,
                model=model,
                category=d["category"],
                icao_type_code=d["icao_type_code"],
            )
            session.add(t)
            session.flush()
            types[key] = t
            slugs.add(slug)
            created_types.add(key)
        missing = [f for f in SPEC_FIELDS if getattr(t, f) is None] + (
            [] if t.icao_type_code else ["icao_type_code"]
        )
        if len(missing) >= len(SPEC_FIELDS):  # no specs at all: mission matching cannot offer this type
            entry = needs_specs.setdefault(
                key,
                {
                    "type": f"{t.manufacturer} {t.model}",
                    "created": key in created_types,
                    "missing": missing,
                    "rows": [],
                },
            )
            entry["rows"].append(row.n)
            stats.flags.append(Flag(row.n, "type_needs_specs", "aircraft type has no specs; supply them"))

        values = {
            "operator_id": op.id,
            "type_id": t.id,
            "year_of_manufacture": d["year_of_manufacture"],
            "year_refurbished": d["year_refurbished"],
            "passenger_seats": d["passenger_seats"],
            "home_airport_icao": d["home_airport_icao"],
            "amenities": d["amenities"],
        }
        ac = tails.get(d["tail_number"])
        if ac is None:
            ac = Aircraft(tail_number=d["tail_number"], source_file=filename, is_active=True, **values)
            session.add(ac)
            tails[d["tail_number"]] = ac
            status = "loaded"
        else:
            if ac.operator_id != op.id:
                stats.flags.append(Flag(row.n, "tail_operator_changed", "tail moved to a different operator"))
            status = "updated" if _apply(ac, values) else "unchanged"
        session.flush()
        _tally(stats, status)
    stats.extras["types_needing_specs"] = list(needs_specs.values())
    return stats


# ----------------------------------------------------------------------------- airports and FBOs
def load_airports(session: Session, units: list[Row], airports: dict[str, Row]) -> LoadStats:
    stats = LoadStats()
    existing = {a.icao: a for a in session.scalars(select(Airport))}
    fbos = {(f.airport_id, compact(f.name)): f for f in session.scalars(select(Fbo))}
    seen: dict[str, Airport] = {}
    fbo_counts = {"loaded": 0, "updated": 0, "unchanged": 0}

    for icao, arow in airports.items():
        for f in arow.flags:
            if f.code.startswith("merge_conflict"):
                stats.flags.append(f)

    for unit in units:
        d = unit.data
        icao = d["icao"]
        if icao in seen:
            a_status, ap = "unchanged", seen[icao]
        else:
            m = airports[icao].data
            vals = {
                k: m[k]
                for k in (
                    "iata",
                    "faa_lid",
                    "name",
                    "city",
                    "state",
                    "country",
                    "latitude",
                    "longitude",
                    "elevation_ft",
                    "longest_runway_ft",
                    "timezone",
                )
            }
            ap = existing.get(icao)
            if ap is None:
                ap = Airport(icao=icao, **{**vals, "country": vals["country"] or "US"})
                session.add(ap)
                session.flush()
                existing[icao] = ap
                a_status = "loaded"
            else:
                a_status = "updated" if _apply(ap, vals) else "unchanged"
            seen[icao] = ap
        f_status = "unchanged"
        if d["fbo"]:
            fv = d["fbo"]
            fk = (ap.id, compact(fv["name"]))
            fb = fbos.get(fk)
            if fb is None:
                fb = Fbo(airport_id=ap.id, name=fv["name"], phone=fv["phone"], email=fv["email"])
                session.add(fb)
                fbos[fk] = fb
                f_status = "loaded"
            else:
                f_status = (
                    "updated" if _apply(fb, {"phone": fv["phone"], "email": fv["email"]}) else "unchanged"
                )
            fbo_counts[f_status] += 1
        session.flush()
        _tally(stats, _combine(a_status, f_status))
    stats.extras["fbos"] = fbo_counts
    return stats


# ----------------------------------------------------------------------------- outreach
def load_outreach(session: Session, rows: list[Row], cfg: IngestConfig, filename: str) -> LoadStats:
    stats = LoadStats()
    emails = [r.data["email"] for r in rows]
    existing: dict[str, OutreachContact] = {}
    for i in range(0, len(emails), 500):
        for c in session.scalars(
            select(OutreachContact).where(OutreachContact.email.in_(emails[i : i + 500]))
        ):
            existing[c.email] = c
    for row in rows:
        d = row.data
        if excluded_match(d["company"], cfg.excluded) or excluded_match(d["full_name"], cfg.excluded):
            stats.rejects.append(Reject(row.n, "excluded_operator", "blocked again at load"))
            continue
        vals = {k: d[k] for k in ("full_name", "company", "title", "segment", "state")}
        c = existing.get(d["email"])
        if c is None:
            c = OutreachContact(email=d["email"], source_file=filename, **vals)
            session.add(c)
            existing[d["email"]] = c
            status = "loaded"
        else:
            status = "updated" if _apply(c, vals) else "unchanged"
        _tally(stats, status)
    session.flush()
    return stats
