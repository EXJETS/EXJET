"""Supply queries. Every query that can surface operators or tails goes through here so exclusions
and go-live status are always applied (guardrails 3 and 5).

Exclusion matching is exjet_api.opname (shared with the ingest layer). Besides names (config
`excluded_operators` + `excluded_operator_aliases`) an operator is excluded by certificate number
(`excluded_certificates`). An operator is sellable only if it is live AND an approved, human-decided
`operator_go_live` approval row exists for it (a status flipped by hand is not enough).
"""
from __future__ import annotations

import uuid
from collections.abc import Iterable

from sqlalchemy import String as SAString
from sqlalchemy import and_, cast, exists, func, not_, or_, select
from sqlalchemy.orm import Session, joinedload, object_session

from .config import get_settings
from .guardrails import operator_has_go_live_approval
from .models import Aircraft, AircraftType, Approval, ApprovalStatus, GoLiveStatus, Operator
from .opname import (
    excluded_certificate_set,
    excluded_sql_regex,
    match_excluded_name,
    normalize_certificate,
    split_csv,
)


def excluded_names() -> list[str]:
    s = get_settings()
    return split_csv(s.excluded_operators) + split_csv(s.excluded_operator_aliases)


def excluded_certificates() -> set[str]:
    return excluded_certificate_set(get_settings().excluded_certificates)


def is_excluded_name(*names: str | None) -> bool:
    """Defense in depth: shared normalizer ('Net Jets' == 'NetJets', Cyrillic lookalikes, suffixes ignored)."""
    targets = excluded_names()
    return any(match_excluded_name(n, targets) for n in names if n)


def is_excluded_operator(op: Operator) -> bool:
    if op.is_excluded or is_excluded_name(op.dba_name, op.legal_name):
        return True
    return bool(op.certificate_number) and normalize_certificate(op.certificate_number) in excluded_certificates()


def operator_sellable(op: Operator, db: Session | None = None) -> bool:
    """Live, not excluded, and backed by an approved go-live approval row. The only operators that appear in
    listings or receive RFQs."""
    if op.go_live_status != GoLiveStatus.live.value or is_excluded_operator(op):
        return False
    db = db or object_session(op)
    return db is not None and operator_has_go_live_approval(db, op.id)


def _name_filter():
    clauses = []
    for n in excluded_names():
        rx = excluded_sql_regex(n)
        if rx:
            clauses.append(or_(Operator.name_norm.op("~")(rx), Operator.legal_name_norm.op("~")(rx)))
    certs = excluded_certificates()
    if certs:
        clauses.append(func.regexp_replace(func.upper(func.coalesce(Operator.certificate_number, "")), "[^A-Z0-9]", "", "g").in_(certs))
    # an operator whose normalized name was never computed is not sellable (fail closed)
    return and_(Operator.name_norm.is_not(None), not_(or_(*clauses))) if clauses else Operator.name_norm.is_not(None)


def _has_approval_filter():
    return exists().where(
        Approval.kind == "operator_go_live", Approval.subject_type == "operator",
        Approval.subject_id == cast(Operator.id, SAString), Approval.status == ApprovalStatus.approved.value,
        Approval.decided_by.is_not(None),
    )


def sellable_aircraft_stmt():
    return (
        select(Aircraft)
        .join(Operator, Aircraft.operator_id == Operator.id)
        .join(AircraftType, Aircraft.type_id == AircraftType.id)
        .where(
            and_(
                Aircraft.is_active.is_(True),
                Operator.is_excluded.is_(False),
                Operator.go_live_status == GoLiveStatus.live.value,
                _has_approval_filter(),
                _name_filter(),
            )
        )
        .options(joinedload(Aircraft.operator).selectinload(Operator.contacts), joinedload(Aircraft.type))
    )


def sellable_aircraft(db: Session, *, type_slug: str | None = None, category: str | None = None,
                      ids: Iterable[uuid.UUID] | None = None) -> list[Aircraft]:
    stmt = sellable_aircraft_stmt()
    if type_slug:
        stmt = stmt.where(AircraftType.slug == type_slug)
    if category:
        stmt = stmt.where(AircraftType.category == category)
    if ids is not None:
        stmt = stmt.where(Aircraft.id.in_(list(ids)))
    rows = db.execute(stmt.order_by(AircraftType.slug, Aircraft.id)).unique().scalars().all()
    return [a for a in rows if operator_sellable(a.operator, db)]  # python-side defense in depth
