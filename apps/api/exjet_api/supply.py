"""Supply queries. Every query that can surface operators or tails goes through here so exclusions
and go-live status are always applied (guardrails 3 and 5)."""
from __future__ import annotations

import re
import uuid
from collections.abc import Iterable

from sqlalchemy import and_, func, not_, or_, select
from sqlalchemy.orm import Session, joinedload

from .config import get_settings
from .models import Aircraft, AircraftType, GoLiveStatus, Operator


def excluded_names() -> list[str]:
    return [n.strip().lower() for n in get_settings().excluded_operators.split(",") if n.strip()]


def _squash(s: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def is_excluded_name(*names: str | None) -> bool:
    """Defense in depth: name match ignoring case, spaces and punctuation ('Net Jets' == 'NetJets')."""
    ex = [_squash(n) for n in excluded_names()]
    return any(e and e in _squash(n) for e in ex for n in names if n)


def is_excluded_operator(op: Operator) -> bool:
    return bool(op.is_excluded) or is_excluded_name(op.dba_name, op.legal_name)


def operator_sellable(op: Operator) -> bool:
    """Live and not excluded. The only operators that appear in listings or receive RFQs."""
    return op.go_live_status == GoLiveStatus.live.value and not is_excluded_operator(op)


def _name_filter():
    clauses = []
    for n in excluded_names():
        squashed = func.regexp_replace(func.lower(Operator.dba_name), "[^a-z0-9]+", "", "g")
        squashed_legal = func.regexp_replace(func.lower(func.coalesce(Operator.legal_name, "")), "[^a-z0-9]+", "", "g")
        s = _squash(n)
        clauses.append(or_(squashed.contains(s), squashed_legal.contains(s)))
    return not_(or_(*clauses)) if clauses else True


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
    return [a for a in rows if operator_sellable(a.operator)]  # python-side defense in depth
