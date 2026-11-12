"""Request dependencies: DB session, viewer resolution, role and entitlement gates."""
from __future__ import annotations

import uuid
from collections.abc import Iterator

from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from .config import get_settings
from .db import session_factory
from .entitlements import ANONYMOUS, Viewer
from .errors import forbidden, not_entitled, not_found, unauthenticated
from .models import Account, AccountMember, Trip, User
from .security import SESSION_COOKIE, decode_session_token


def get_session() -> Iterator[Session]:
    """A request-scoped session. Routes that change data call db.commit() explicitly; anything not
    committed is rolled back when the session closes."""
    with session_factory()() as s:
        yield s


def load_viewer(db: Session, user: User) -> Viewer:
    row = db.execute(
        select(AccountMember).where(AccountMember.user_id == user.id)
        .options(joinedload(AccountMember.account).joinedload(Account.subscription))
        .order_by(AccountMember.created_at).limit(1)
    ).unique().scalar_one_or_none()
    if row is None:
        return Viewer(user=user)
    return Viewer(user=user, account=row.account, subscription=row.account.subscription, member=row)


def user_from_cookie(request: Request, db: Session) -> User | None:
    """The user behind a valid session cookie: signature, expiry, is_active AND the session version must match.
    Bumping users.session_version (logout, password change, deactivation) revokes every outstanding token."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    decoded = decode_session_token(token)
    if decoded is None:
        return None
    uid, sv = decoded
    user = db.get(User, uid)
    if user is None or not user.is_active or user.session_version != sv:
        return None
    return user


def optional_viewer(request: Request, db: Session = Depends(get_session)) -> Viewer:
    user = user_from_cookie(request, db)
    return ANONYMOUS if user is None else load_viewer(db, user)


def require_viewer(viewer: Viewer = Depends(optional_viewer)) -> Viewer:
    if viewer.user is None:
        raise unauthenticated()
    return viewer


def require_member(viewer: Viewer = Depends(require_viewer)) -> Viewer:
    if viewer.account is None:
        raise forbidden("This action requires a member account.")
    return viewer


def require_entitled(viewer: Viewer = Depends(require_member)) -> Viewer:
    if not viewer.entitled:
        raise not_entitled()
    return viewer


def require_owner(viewer: Viewer = Depends(require_member)) -> Viewer:
    if not viewer.is_owner:
        raise forbidden("Only the account owner can do this.")
    return viewer


def require_admin(viewer: Viewer = Depends(require_viewer)) -> Viewer:
    if not viewer.is_admin:
        raise forbidden("Administrator access required.")
    return viewer


def require_dev_env() -> None:
    if not get_settings().is_dev_like:
        raise not_found()


def get_owned_trip(db: Session, viewer: Viewer, trip_id: uuid.UUID) -> Trip:
    """A trip the viewer's account owns. Anything else is a 404 so existence is not leaked."""
    t = db.get(Trip, trip_id)
    if t is None or viewer.account is None or t.account_id != viewer.account.id:
        raise not_found("Trip not found.")
    return t
