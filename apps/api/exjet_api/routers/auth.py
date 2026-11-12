from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas as S
from ..config import get_settings
from ..deps import get_session, load_viewer, require_member, require_viewer
from ..entitlements import Viewer, next_step
from ..errors import ApiError, conflict, not_found
from ..models import Account, AccountMember, Subscription, Trip, User
from ..security import (
    SESSION_COOKIE,
    auth_limiter,
    cookie_secure,
    create_session_token,
    hash_password,
    needs_rehash,
    verify_password,
)

router = APIRouter(tags=["auth"])


def build_me(viewer: Viewer) -> S.Me:
    u, a, sub = viewer.user, viewer.account, viewer.subscription
    return S.Me(
        user=S.UserOut(id=u.id, email=u.email, full_name=u.full_name, role=u.role),
        account=S.AccountOut(id=a.id, type=a.type, display_name=a.display_name, seats=a.seats, kyc_status=a.kyc_status) if a else None,
        subscription=S.SubscriptionOut(plan=sub.plan, status=sub.status, current_period_end=sub.current_period_end) if sub else None,
        entitled=viewer.entitled, next_step=next_step(a, sub),
    )


def _set_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        SESSION_COOKIE, create_session_token(user.id), max_age=get_settings().session_minutes * 60, httponly=True,
        secure=cookie_secure(), samesite="lax", path="/",
    )


def _ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@router.post("/auth/signup", response_model=S.Me, status_code=201)
def signup(body: S.SignupIn, request: Request, response: Response, db: Session = Depends(get_session)):
    auth_limiter.check(f"signup:{_ip(request)}", 10, 600)
    if db.execute(select(User.id).where(User.email == body.email)).first():
        raise conflict("email_taken", "An account with this email already exists.")
    user = User(email=body.email, password_hash=hash_password(body.password), full_name=body.full_name.strip(),
                role="member", signup_source=body.signup_source)
    account = Account(type=body.account_type, display_name=body.full_name.strip(), seats=2 if body.account_type == "family_office" else 1)
    db.add_all([user, account])
    db.flush()
    db.add(AccountMember(account_id=account.id, user_id=user.id, is_owner=True))
    db.commit()
    _set_cookie(response, user)
    return build_me(load_viewer(db, user))


@router.post("/auth/login", response_model=S.Me)
def login(body: S.LoginIn, request: Request, response: Response, db: Session = Depends(get_session)):
    auth_limiter.check(f"login-ip:{_ip(request)}", 20, 300)
    auth_limiter.check(f"login-email:{body.email}", 10, 900)
    user = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    ok = verify_password(body.password, user.password_hash if user else None)
    if not ok or user is None or not user.is_active:
        raise ApiError(401, "invalid_credentials", "Email or password is incorrect.")
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(body.password)
        db.commit()
    _set_cookie(response, user)
    return build_me(load_viewer(db, user))


@router.post("/auth/logout", status_code=204)
def logout() -> Response:
    resp = Response(status_code=204)
    resp.delete_cookie(SESSION_COOKIE, path="/", secure=cookie_secure(), httponly=True, samesite="lax")
    return resp


@router.get("/me", response_model=S.Me)
def me(viewer: Viewer = Depends(require_viewer)):
    return build_me(viewer)


@router.post("/account/seats", response_model=S.SeatOut, status_code=201)
def add_seat(body: S.SeatIn, viewer: Viewer = Depends(require_member), db: Session = Depends(get_session)):
    """Add the second Family Office seat. The person must already have an EXJET login with an empty
    personal account (no subscription, no identity check started, no trips); that empty account is removed."""
    acct = viewer.account
    if acct.type != "family_office":
        raise conflict("seat_not_available", "Extra seats are only available on the Family Office plan.")
    owner = db.execute(select(AccountMember).where(AccountMember.account_id == acct.id, AccountMember.user_id == viewer.user.id)).scalar_one_or_none()
    if owner is None or not owner.is_owner:
        raise ApiError(403, "forbidden", "Only the account owner can add a seat.")
    used = db.execute(select(AccountMember).where(AccountMember.account_id == acct.id)).scalars().all()
    if len(used) >= acct.seats:
        raise conflict("seat_limit_reached", "All seats on this account are in use.")
    invitee = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if invitee is None:
        raise not_found("No EXJET login exists for that email yet. Ask them to create one, then add them.")
    mem = db.execute(select(AccountMember).where(AccountMember.user_id == invitee.id)).scalars().all()
    if any(m.account_id == acct.id for m in mem):
        raise conflict("already_member", "That person already has a seat on this account.")
    for m in mem:
        other = db.get(Account, m.account_id)
        others = db.execute(select(AccountMember).where(AccountMember.account_id == other.id)).scalars().all()
        has_trips = db.execute(select(Trip.id).where(Trip.account_id == other.id)).first() is not None
        has_sub = db.execute(select(Subscription.id).where(Subscription.account_id == other.id)).first() is not None
        if len(others) > 1 or has_trips or has_sub or other.kyc_status != "not_started":
            raise conflict("seat_unavailable", "That login already belongs to an active account.")
        db.delete(m)
        db.flush()
        db.delete(other)
    db.flush()
    db.add(AccountMember(account_id=acct.id, user_id=invitee.id, is_owner=False))
    db.commit()
    return S.SeatOut(account_id=acct.id, seats_used=len(used) + 1, seats=acct.seats)
