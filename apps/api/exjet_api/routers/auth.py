from __future__ import annotations

import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import clock, mailer
from .. import schemas as S
from ..audit import audit
from ..config import get_settings
from ..deps import get_session, load_viewer, require_member, require_owner, require_viewer, user_from_cookie
from ..emailnorm import normalize_email
from ..entitlements import Viewer, member_identity_status, next_step
from ..errors import ApiError, conflict, not_found
from ..guardrails import GuardrailViolation
from ..models import (
    Account,
    AccountMember,
    KycSubmission,
    PasswordResetToken,
    SeatInvitation,
    Subscription,
    Trip,
    User,
)
from ..providers.errors import ProviderError
from ..ratelimit import client_ip, hit
from ..security import (
    SESSION_COOKIE,
    cookie_secure,
    create_session_token,
    hash_password,
    needs_rehash,
    new_token,
    token_hash,
    verify_password,
)
from ..services import billing_service as B

router = APIRouter(tags=["auth"])


def build_me(viewer: Viewer) -> S.Me:
    u, a, sub, m = viewer.user, viewer.account, viewer.subscription, viewer.member
    return S.Me(
        user=S.UserOut(id=u.id, email=u.email, full_name=u.full_name, role=u.role),
        account=S.AccountOut(id=a.id, type=a.type, display_name=a.display_name, seats=a.seats, kyc_status=a.kyc_status) if a else None,
        subscription=S.SubscriptionOut(plan=sub.plan, status=sub.status, current_period_end=sub.current_period_end) if sub else None,
        member=S.MemberOut(is_owner=m.is_owner, identity_status=member_identity_status(a, m), is_suspended=m.is_suspended) if m else None,
        entitled=viewer.entitled, next_step=next_step(a, sub, m),
    )


def _set_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        SESSION_COOKIE, create_session_token(user.id, user.session_version), max_age=get_settings().session_minutes * 60,
        httponly=True, secure=cookie_secure(), samesite="lax", path="/",
    )


def _clear_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/", secure=cookie_secure(), httponly=True, samesite="lax")


def _try_mail(db: Session, **kw) -> None:
    """Transactional email whose failure must not change the HTTP answer (it would leak account state)."""
    try:
        mailer.send(db, **kw)
    except (GuardrailViolation, ProviderError):
        pass


# --------------------------------------------------------------------------- signup / login / logout
@router.post("/auth/signup", response_model=S.Me, status_code=201, responses={202: {"model": S.SignupPending}})
def signup(body: S.SignupIn, request: Request, response: Response, db: Session = Depends(get_session)):
    """New email: account created. In dev/test the caller is logged in at once (201 Me). Everywhere else the answer is
    the same 202 for a new and for an existing email, and the caller signs in with the password (L3).
    An existing email gets an `account_notice` email and no change."""
    settings = get_settings()
    hit("signup_ip", client_ip(request))
    pw_hash = hash_password(body.password)  # hashed on both paths: no timing difference between new and existing
    existing = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if existing is not None:
        _try_mail(
            db, purpose="account_notice", to=[existing.email], subject="You already have an EXJET account",
            body=("Someone (hopefully you) tried to create an EXJET account with this email address, but one already exists.\n\n"
                  f"Sign in: {settings.app_base_url}/login\nForgot your password? Use the reset link on the sign-in page.\n\n"
                  "If this was not you, you can ignore this message.\n\nEXJET"),
            account_id=None)
        db.commit()
        return JSONResponse(S.SignupPending().model_dump(), status_code=202)
    user = User(email=body.email, password_hash=pw_hash, full_name=body.full_name.strip(), role="member",
                signup_source=body.signup_source)
    account = Account(type=body.account_type, display_name=body.full_name.strip(),
                      seats=2 if body.account_type == "family_office" else 1)  # nominal; seats are enforced by the paid plan
    db.add_all([user, account])
    db.flush()
    db.add(AccountMember(account_id=account.id, user_id=user.id, is_owner=True))
    db.commit()
    if not settings.is_dev_like:
        return JSONResponse(S.SignupPending().model_dump(), status_code=202)
    _set_cookie(response, user)
    return build_me(load_viewer(db, user))


@router.post("/auth/login", response_model=S.Me)
def login(body: S.LoginIn, request: Request, response: Response, db: Session = Depends(get_session)):
    hit("login_ip", client_ip(request))
    hit("login_email", body.email)
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
def logout(request: Request, db: Session = Depends(get_session)) -> Response:
    """Ends ALL of this user's sessions (the session version is bumped), not just this browser's."""
    user = user_from_cookie(request, db)
    if user is not None:
        user.session_version += 1
        audit(db, actor=f"user:{user.id}", action="auth.logout", subject_type="user", subject_id=user.id)
        db.commit()
    resp = Response(status_code=204)
    _clear_cookie(resp)
    return resp


@router.get("/me", response_model=S.Me)
def me(viewer: Viewer = Depends(require_viewer)):
    return build_me(viewer)


# --------------------------------------------------------------------------- password change / reset
@router.post("/auth/password", status_code=204)
def change_password(body: S.PasswordChangeIn, viewer: Viewer = Depends(require_viewer), db: Session = Depends(get_session)):
    """Change the password (current one required). Every other session is revoked; this one gets a fresh cookie."""
    hit("password_change_user", str(viewer.user.id))
    user = viewer.user
    if not verify_password(body.current_password, user.password_hash):
        raise ApiError(403, "invalid_credentials", "The current password is incorrect.")
    user.password_hash = hash_password(body.new_password)
    user.session_version += 1
    audit(db, actor=f"user:{user.id}", action="auth.password_changed", subject_type="user", subject_id=user.id)
    db.commit()
    resp = Response(status_code=204)
    resp.set_cookie(SESSION_COOKIE, create_session_token(user.id, user.session_version),
                    max_age=get_settings().session_minutes * 60, httponly=True, secure=cookie_secure(), samesite="lax", path="/")
    return resp


@router.post("/auth/password/reset-request", response_model=S.Accepted, status_code=202)
def password_reset_request(body: S.PasswordResetRequestIn, request: Request, db: Session = Depends(get_session)):
    """Always 202 'check_your_email', whether or not the email has an account."""
    hit("password_reset_ip", client_ip(request))
    hit("password_reset_email", body.email)
    user = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if user is not None and user.is_active:
        token, digest = new_token()
        db.add(PasswordResetToken(user_id=user.id, token_hash=digest,
                                  expires_at=clock.now() + timedelta(minutes=get_settings().password_reset_ttl_minutes)))
        db.flush()
        link = f"{get_settings().app_base_url}/reset-password?token={token}"
        _try_mail(
            db, purpose="password_reset", to=[user.email], subject="Reset your EXJET password",
            body=(f"Use this link to choose a new password. It works once and expires in "
                  f"{get_settings().password_reset_ttl_minutes} minutes.\n\n{link}\n\n"
                  "If you did not ask for this, ignore this message; your password has not changed.\n\nEXJET"),
            stored_body="Password reset link sent (token not stored).")
        audit(db, actor="system", action="auth.password_reset_requested", subject_type="user", subject_id=user.id)
    db.commit()
    return S.Accepted(status="check_your_email")


@router.post("/auth/password/reset", status_code=204)
def password_reset(body: S.PasswordResetIn, request: Request, db: Session = Depends(get_session)):
    hit("password_reset_ip", client_ip(request))
    row = db.execute(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash(body.token))
                     .with_for_update()).scalar_one_or_none()
    now = clock.now()
    if row is None or row.used_at is not None or row.expires_at < now:
        raise ApiError(409, "invalid_token", "This reset link is invalid or has expired.")
    user = db.get(User, row.user_id)
    if user is None or not user.is_active:
        raise ApiError(409, "invalid_token", "This reset link is invalid or has expired.")
    user.password_hash = hash_password(body.new_password)
    user.session_version += 1  # every existing session is revoked
    for t in db.execute(select(PasswordResetToken).where(PasswordResetToken.user_id == user.id,
                                                         PasswordResetToken.used_at.is_(None))).scalars():
        t.used_at = now
    audit(db, actor=f"user:{user.id}", action="auth.password_reset", subject_type="user", subject_id=user.id)
    db.commit()
    return Response(status_code=204)


# --------------------------------------------------------------------------- seats (invitations)
def _pending_invitations(db: Session, account_id: uuid.UUID) -> list[SeatInvitation]:
    return list(db.execute(select(SeatInvitation).where(
        SeatInvitation.account_id == account_id, SeatInvitation.accepted_at.is_(None), SeatInvitation.revoked_at.is_(None),
        SeatInvitation.expires_at > clock.now()).order_by(SeatInvitation.created_at)).scalars())


@router.post("/account/seats", response_model=S.SeatInviteOut, status_code=202)
def invite_seat(body: S.SeatIn, viewer: Viewer = Depends(require_owner), db: Session = Depends(get_session)):
    """Invite a person to a seat. Never reveals whether the email has an EXJET login: the answer is always the same
    202. Nothing changes for the invitee until they sign in with the invited email and explicitly accept."""
    hit("seat_invite_user", str(viewer.user.id))
    acct, sub = viewer.account, viewer.subscription
    if acct.type not in ("family_office", "enterprise"):
        raise conflict("seat_not_available", "Extra seats are only available on the Family Office plan.")
    if sub is None or sub.status != "active":
        raise conflict("subscription_required", "An active membership is required before inviting someone.")
    if acct.kyc_status != "approved":
        raise conflict("kyc_required", "The account's identity check must be approved before inviting someone.")
    members = db.execute(select(AccountMember).where(AccountMember.account_id == acct.id)).scalars().all()
    pending = [p for p in _pending_invitations(db, acct.id) if p.email != body.email]  # a re-invite replaces the old one
    if len(members) + len(pending) >= B.plan_seats(acct, sub):
        raise conflict("seat_limit_reached", "All seats on this account are in use or already offered.")
    member_emails = {normalize_email(e) for e in db.execute(
        select(User.email).join(AccountMember, AccountMember.user_id == User.id).where(AccountMember.account_id == acct.id)).scalars()}
    if body.email not in member_emails:
        now = clock.now()
        for old in _pending_invitations(db, acct.id):
            if old.email == body.email:
                old.revoked_at = now
        token, digest = new_token()
        inv = SeatInvitation(account_id=acct.id, email=body.email, token_hash=digest, invited_by=viewer.user.id,
                             expires_at=now + timedelta(hours=get_settings().seat_invite_ttl_hours))
        db.add(inv)
        db.flush()
        link = f"{get_settings().app_base_url}/account/seats/accept?token={token}"
        _try_mail(
            db, purpose="seat_invite", to=[body.email], invitation_id=inv.id, actor_user_id=viewer.user.id,
            subject="You have been invited to an EXJET membership",
            body=("You have been invited to share an EXJET Family Office membership.\n\n"
                  f"To accept, sign in (or create an account) with this email address and open:\n{link}\n\n"
                  f"The invitation expires in {get_settings().seat_invite_ttl_hours} hours. You will be asked to complete your own "
                  "identity check before you can use the membership. If you were not expecting this, ignore this message.\n\nEXJET"),
            stored_body="Seat invitation link sent (token not stored).")
        audit(db, actor=f"user:{viewer.user.id}", action="seat.invited", subject_type="seat_invitation", subject_id=inv.id)
    db.commit()
    return S.SeatInviteOut()


@router.get("/account/seats", response_model=S.SeatsOut)
def list_seats(viewer: Viewer = Depends(require_owner), db: Session = Depends(get_session)):
    acct = viewer.account
    rows = db.execute(select(AccountMember, User).join(User, User.id == AccountMember.user_id)
                      .where(AccountMember.account_id == acct.id).order_by(AccountMember.is_owner.desc(), AccountMember.created_at)).all()
    return S.SeatsOut(
        account_id=acct.id, seats=B.plan_seats(acct, viewer.subscription),
        members=[S.SeatMemberOut(user_id=u.id, email=u.email, full_name=u.full_name, is_owner=m.is_owner,
                                 identity_status=member_identity_status(acct, m), is_suspended=m.is_suspended) for m, u in rows],
        invitations=[S.SeatInvitationOut(id=i.id, email=i.email, created_at=i.created_at, expires_at=i.expires_at)
                     for i in _pending_invitations(db, acct.id)])


@router.delete("/account/seats/invitations/{invitation_id}", status_code=204)
def revoke_invitation(invitation_id: uuid.UUID, viewer: Viewer = Depends(require_owner), db: Session = Depends(get_session)):
    inv = db.get(SeatInvitation, invitation_id)
    if inv is None or inv.account_id != viewer.account.id:
        raise not_found("Invitation not found.")
    if inv.accepted_at is not None:
        raise conflict("invitation_accepted", "This invitation was already accepted.")
    if inv.revoked_at is None:
        inv.revoked_at = clock.now()
        audit(db, actor=f"user:{viewer.user.id}", action="seat.invitation_revoked", subject_type="seat_invitation", subject_id=inv.id)
    db.commit()
    return Response(status_code=204)


def _is_empty_personal_account(db: Session, acct: Account, membership: AccountMember, user: User) -> bool:
    """Only a brand-new, unused personal account may be dropped when its owner explicitly joins another account.
    Anything with a KYC submission, subscription, trip, other member or progress is never deleted or merged."""
    if not membership.is_owner or acct.kyc_status != "not_started":
        return False
    if db.execute(select(func.count()).select_from(AccountMember).where(AccountMember.account_id == acct.id)).scalar_one() != 1:
        return False
    for model in (KycSubmission, Subscription, Trip):
        if db.execute(select(model.id).where(model.account_id == acct.id).limit(1)).first() is not None:
            return False
    return True


@router.post("/account/seats/accept", response_model=S.Me)
def accept_invitation(body: S.SeatAcceptIn, viewer: Viewer = Depends(require_viewer), db: Session = Depends(get_session)):
    """The invitee, signed in with the invited email, explicitly accepts. Only now is a membership created."""
    hit("seat_accept_user", str(viewer.user.id))
    user = viewer.user
    inv = db.execute(select(SeatInvitation).where(SeatInvitation.token_hash == token_hash(body.token)).with_for_update()
                     ).scalar_one_or_none()
    if inv is None or inv.accepted_at is not None or inv.revoked_at is not None or inv.expires_at < clock.now():
        raise conflict("invitation_invalid", "This invitation is invalid, expired or was withdrawn.")
    if normalize_email(user.email) != inv.email:
        raise ApiError(403, "invitation_wrong_user", "Sign in with the email address that was invited.")
    acct = db.get(Account, inv.account_id)
    sub = B.get_subscription(db, acct.id)
    if sub is None or sub.status != "active" or acct.kyc_status != "approved":
        raise conflict("account_not_active", "This account is not currently able to add members.")
    members = db.execute(select(AccountMember).where(AccountMember.account_id == acct.id)).scalars().all()
    if any(m.user_id == user.id for m in members):
        raise conflict("already_member", "You already have a seat on this account.")
    if len(members) >= B.plan_seats(acct, sub):
        raise conflict("seat_limit_reached", "All seats on this account are in use.")
    others = db.execute(select(AccountMember).where(AccountMember.user_id == user.id)).scalars().all()
    droppable: list[tuple[AccountMember, Account]] = []
    for m in others:
        other = db.get(Account, m.account_id)
        if not _is_empty_personal_account(db, other, m, user):
            raise conflict("already_in_account", "This login already belongs to an account that has activity "
                           "(an identity check, membership or trips). It cannot be merged or removed; use a different email.")
        droppable.append((m, other))
    for m, other in droppable:
        db.delete(m)
        db.flush()
        db.delete(other)
    db.flush()
    db.add(AccountMember(account_id=acct.id, user_id=user.id, is_owner=False, identity_status="not_started"))
    inv.accepted_at, inv.accepted_by = clock.now(), user.id
    audit(db, actor=f"user:{user.id}", action="seat.accepted", subject_type="seat_invitation", subject_id=inv.id,
          detail={"account_id": str(acct.id)})
    db.commit()
    return build_me(load_viewer(db, user))


__all__ = ["router", "require_member"]
