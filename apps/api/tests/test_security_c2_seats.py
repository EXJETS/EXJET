"""C2: seat-add account takeover. The old flow let a family_office signup attach any empty login by email, deleting the
victim's account. Seats are now invitations accepted by the invitee; members need their own identity check."""
import uuid
from datetime import timedelta

from helpers import (
    PNG,
    approve_member_identity,
    future_trip_body,
    invite_token,
    login,
    make_entitled,
    make_family_office,
    run_jobs,
    seed_all,
    signup,
)
from sqlalchemy import select

from exjet_api import clock
from exjet_api.models import (
    Account,
    AccountMember,
    Approval,
    EmailMessage,
    KycSubmission,
    SeatInvitation,
    Subscription,
    User,
)
from exjet_api.providers import get_mail
from exjet_api.security import token_hash


def _setup(db, client):
    admin, _ = seed_all(db)
    acct = make_family_office(db, client, admin, "owner@example.com")
    return admin, acct


def _members(db, account_id):
    db.expire_all()
    return db.execute(select(AccountMember).where(AccountMember.account_id == account_id)).scalars().all()


# --------------------------------------------------------------------------- the reported takeover
def test_inviting_an_existing_login_does_not_attach_or_delete_anything(db, client, make_client):
    admin, acct = _setup(db, client)
    victim = make_client()
    signup(victim, "victim@example.com", "Vic Tim")
    victim_account = victim.get("/v1/me").json()["account"]["id"]
    r = client.post("/v1/account/seats", json={"email": "victim@example.com"})
    assert r.status_code == 202
    # the victim's account and membership are exactly as before
    assert victim.get("/v1/me").json()["account"]["id"] == victim_account
    assert db.get(Account, uuid.UUID(victim_account)) is not None
    assert len(_members(db, acct.id)) == 1


def test_invite_answer_is_identical_for_known_and_unknown_emails(db, client, make_client):
    """No 404 vs 409 enumeration: same status and body whether or not the email has a login (or is already a member)."""
    admin, acct = _setup(db, client)
    other = make_client()
    signup(other, "known@example.com")
    a = client.post("/v1/account/seats", json={"email": "known@example.com"})
    client.delete(f"/v1/account/seats/invitations/{client.get('/v1/account/seats').json()['invitations'][0]['id']}")
    b = client.post("/v1/account/seats", json={"email": "never-seen@example.com"})
    assert (a.status_code, a.json()) == (b.status_code, b.json()) == (202, {"status": "invitation_queued"})
    # inviting the owner's own address is answered the same way and creates nothing
    client.delete(f"/v1/account/seats/invitations/{client.get('/v1/account/seats').json()['invitations'][0]['id']}")
    c = client.post("/v1/account/seats", json={"email": "owner@example.com"})
    assert (c.status_code, c.json()) == (202, {"status": "invitation_queued"})
    assert db.execute(select(SeatInvitation).where(SeatInvitation.email == "owner@example.com")).first() is None


def test_victims_later_kyc_cannot_land_on_the_attackers_account(db, client, make_client):
    admin, acct = _setup(db, client)
    victim = make_client()
    signup(victim, "victim@example.com")
    client.post("/v1/account/seats", json={"email": "victim@example.com"})
    r = victim.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "Vic", "doc_types": ["passport"]},
                    files=[("files", ("p.png", PNG, "image/png"))])
    assert r.status_code == 201
    vid = db.execute(select(User.id).where(User.email == "victim@example.com")).scalar_one()
    sub = db.execute(select(KycSubmission).where(KycSubmission.submitted_by == vid)).scalar_one()
    assert sub.account_id != acct.id and sub.subject_user_id is None  # the victim's OWN account


# --------------------------------------------------------------------------- invitation mechanics
def test_invitation_email_carries_a_token_stored_only_as_a_hash(db, client):
    admin, acct = _setup(db, client)
    client.post("/v1/account/seats", json={"email": "Spouse@Example.com"})
    token = invite_token(get_mail(), "spouse@example.com")
    inv = db.execute(select(SeatInvitation)).scalar_one()
    assert inv.email == "spouse@example.com" and inv.token_hash == token_hash(token) and token not in inv.token_hash
    stored = db.execute(select(EmailMessage).where(EmailMessage.purpose == "seat_invite")).scalar_one()
    assert token not in (stored.body_text or "") and stored.status == "sent"
    assert inv.expires_at > clock.now() and inv.accepted_at is None


def test_accept_needs_the_invited_login_and_a_valid_token(db, client, make_client):
    admin, acct = _setup(db, client)
    client.post("/v1/account/seats", json={"email": "spouse@example.com"})
    token = invite_token(get_mail(), "spouse@example.com")
    anon = make_client()
    assert anon.post("/v1/account/seats/accept", json={"token": token}).status_code == 401
    wrong = make_client()
    signup(wrong, "someone-else@example.com")
    r = wrong.post("/v1/account/seats/accept", json={"token": token})
    assert r.status_code == 403 and r.json()["error"]["code"] == "invitation_wrong_user"
    spouse = make_client()
    signup(spouse, "spouse@example.com")
    assert spouse.post("/v1/account/seats/accept", json={"token": "x" * 43}).json()["error"]["code"] == "invitation_invalid"
    ok = spouse.post("/v1/account/seats/accept", json={"token": token})
    assert ok.status_code == 200 and ok.json()["member"] == {"is_owner": False, "identity_status": "not_started", "is_suspended": False}
    # single use
    assert spouse.post("/v1/account/seats/accept", json={"token": token}).json()["error"]["code"] == "invitation_invalid"


def test_expired_and_revoked_invitations_cannot_be_accepted(db, client, make_client):
    admin, acct = _setup(db, client)
    spouse = make_client()
    signup(spouse, "spouse@example.com")
    client.post("/v1/account/seats", json={"email": "spouse@example.com"})
    token = invite_token(get_mail(), "spouse@example.com")
    inv = db.execute(select(SeatInvitation)).scalar_one()
    assert client.delete(f"/v1/account/seats/invitations/{inv.id}").status_code == 204
    assert spouse.post("/v1/account/seats/accept", json={"token": token}).json()["error"]["code"] == "invitation_invalid"
    client.post("/v1/account/seats", json={"email": "spouse@example.com"})
    token2 = invite_token(get_mail(), "spouse@example.com")
    clock.set_now(clock.now() + timedelta(hours=73))
    assert spouse.post("/v1/account/seats/accept", json={"token": token2}).json()["error"]["code"] == "invitation_invalid"
    assert len(_members(db, acct.id)) == 1


def test_an_invitee_with_an_active_account_gets_a_clear_error_and_nothing_is_deleted(db, client, make_client):
    admin, acct = _setup(db, client)
    busy = make_client()
    busy_acct = make_entitled(db, busy, admin, "busy@example.com", "Busy Person")  # KYC submission + subscription
    busy.post("/v1/trips", json=future_trip_body())
    client.post("/v1/account/seats", json={"email": "busy@example.com"})
    r = busy.post("/v1/account/seats/accept", json={"token": invite_token(get_mail(), "busy@example.com")})
    assert r.status_code == 409 and r.json()["error"]["code"] == "already_in_account"
    assert db.get(Account, busy_acct.id) is not None
    assert db.execute(select(KycSubmission).where(KycSubmission.account_id == busy_acct.id)).first() is not None
    assert db.execute(select(Subscription).where(Subscription.account_id == busy_acct.id)).first() is not None
    assert len(_members(db, acct.id)) == 1


def test_an_empty_personal_account_is_replaced_only_on_explicit_accept(db, client, make_client):
    admin, acct = _setup(db, client)
    spouse = make_client()
    signup(spouse, "spouse@example.com")
    empty_id = spouse.get("/v1/me").json()["account"]["id"]
    client.post("/v1/account/seats", json={"email": "spouse@example.com"})
    assert db.get(Account, uuid.UUID(empty_id)) is not None  # invitation alone changes nothing
    spouse.post("/v1/account/seats/accept", json={"token": invite_token(get_mail(), "spouse@example.com")})
    db.expire_all()
    assert db.get(Account, uuid.UUID(empty_id)) is None
    assert spouse.get("/v1/me").json()["account"]["id"] == str(acct.id)


# --------------------------------------------------------------------------- preconditions and limits
def test_invite_preconditions(db, client, make_client):
    admin, _ = seed_all(db)
    # not family office
    solo = make_client()
    make_entitled(db, solo, admin, "solo@example.com")
    assert solo.post("/v1/account/seats", json={"email": "x@example.com"}).json()["error"]["code"] == "seat_not_available"
    # family office but no subscription / no approved KYC
    fo = make_client()
    signup(fo, "fo@example.com", account_type="family_office")
    assert fo.post("/v1/account/seats", json={"email": "x@example.com"}).json()["error"]["code"] == "subscription_required"
    fo_id = db.execute(select(User.id).where(User.email == "fo@example.com")).scalar_one()
    acct = db.get(Account, db.execute(select(AccountMember.account_id).where(AccountMember.user_id == fo_id)).scalar_one())
    db.add(Subscription(account_id=acct.id, plan="family_office", status="active", provider="fake", unit_amount_cents=100000))
    db.commit()
    assert fo.post("/v1/account/seats", json={"email": "x@example.com"}).json()["error"]["code"] == "kyc_required"
    # not the owner
    owner = make_client()
    make_family_office(db, owner, admin, "owner2@example.com")
    owner.post("/v1/account/seats", json={"email": "m@example.com"})
    member = make_client()
    signup(member, "m@example.com")
    member.post("/v1/account/seats/accept", json={"token": invite_token(get_mail(), "m@example.com")})
    r = member.post("/v1/account/seats", json={"email": "z@example.com"})
    assert r.status_code == 403
    assert member.get("/v1/account/seats").status_code == 403


def test_members_plus_pending_invitations_cannot_exceed_plan_seats(db, client):
    admin, acct = _setup(db, client)
    assert client.post("/v1/account/seats", json={"email": "a@example.com"}).status_code == 202
    r = client.post("/v1/account/seats", json={"email": "b@example.com"})  # 1 member + 1 pending = 2 = plan seats
    assert r.status_code == 409 and r.json()["error"]["code"] == "seat_limit_reached"
    # re-inviting the same address replaces its invitation instead of counting twice
    assert client.post("/v1/account/seats", json={"email": "a@example.com"}).status_code == 202
    assert len(client.get("/v1/account/seats").json()["invitations"]) == 1


def test_seat_limit_is_rechecked_at_accept_time(db, client, make_client):
    admin, acct = _setup(db, client)
    client.post("/v1/account/seats", json={"email": "a@example.com"})
    token = invite_token(get_mail(), "a@example.com")
    extra = db.execute(select(User).where(User.email == "owner@example.com")).scalar_one()
    other = User(email="filler@example.com", password_hash="x", full_name="F")
    db.add(other)
    db.flush()
    db.add(AccountMember(account_id=acct.id, user_id=other.id, is_owner=False))  # a seat taken some other way
    db.commit()
    a = make_client()
    signup(a, "a@example.com")
    r = a.post("/v1/account/seats/accept", json={"token": token})
    assert r.status_code == 409 and r.json()["error"]["code"] == "seat_limit_reached" and extra is not None


def test_owner_lists_members_and_pending_invitations_and_revokes(db, client, make_client):
    admin, acct = _setup(db, client)
    client.post("/v1/account/seats", json={"email": "p@example.com"})
    out = client.get("/v1/account/seats").json()
    assert out["seats"] == 2 and [m["email"] for m in out["members"]] == ["owner@example.com"]
    assert out["members"][0]["is_owner"] is True and out["members"][0]["identity_status"] == "approved"
    assert [i["email"] for i in out["invitations"]] == ["p@example.com"]
    assert client.delete(f"/v1/account/seats/invitations/{out['invitations'][0]['id']}").status_code == 204
    assert client.get("/v1/account/seats").json()["invitations"] == []
    assert client.delete(f"/v1/account/seats/invitations/{uuid.uuid4()}").status_code == 404


# --------------------------------------------------------------------------- per-person identity
def _accepted_member(db, client, make_client, email="sam@example.com"):
    client.post("/v1/account/seats", json={"email": email})
    m = make_client()
    signup(m, email, "Sam Member")
    m.post("/v1/account/seats/accept", json={"token": invite_token(get_mail(), email)})
    return m


def test_member_is_not_entitled_until_their_own_identity_is_approved(db, client, make_client):
    admin, acct = _setup(db, client)
    m = _accepted_member(db, client, make_client)
    me = m.get("/v1/me").json()
    # the account is approved and paid, yet this person is not entitled
    assert me["account"]["kyc_status"] == "approved" and me["subscription"]["status"] == "active"
    assert me["entitled"] is False and me["next_step"] == "kyc"
    rows = m.get("/v1/listings").json()
    assert rows and all(x["tail_number"] is None and x["operator"] is None for x in rows)
    assert m.post("/v1/trips", json=future_trip_body()).status_code == 201  # membership lets them plan...
    assert m.post(f"/v1/trips/{client.get('/v1/trips').json()[0]['id'] if client.get('/v1/trips').json() else uuid.uuid4()}/rfqs",
                  json={"listing_ids": [str(uuid.uuid4())]}).status_code in (403, 404)
    uid = db.execute(select(User.id).where(User.email == "sam@example.com")).scalar_one()
    approve_member_identity(db, admin, acct.id, uid)
    me = m.get("/v1/me").json()
    assert me["entitled"] is True and me["member"]["identity_status"] == "approved"
    assert any(x["tail_number"] for x in m.get("/v1/listings").json())


def test_member_submits_their_own_check_and_it_never_touches_the_account(db, client, make_client):
    admin, acct = _setup(db, client)
    m = _accepted_member(db, client, make_client)
    adm = make_client()
    login(adm, "admin@example.com")
    r = m.post("/v1/kyc/submissions", data={"kind": "individual", "holder_name": "Sam Member", "doc_types": ["passport"]},
              files=[("files", ("p.png", PNG, "image/png"))])
    assert r.status_code == 201
    assert m.get("/v1/kyc/status").json()["scope"] == "member" and m.get("/v1/kyc/status").json()["kyc_status"] == "submitted"
    run_jobs()
    assert m.get("/v1/me").json()["member"]["identity_status"] == "in_review"
    db.expire_all()
    assert db.get(Account, acct.id).kyc_status == "approved"  # the account's status is untouched by a member's check
    sub = adm.get("/v1/admin/kyc/submissions", params={"status": "in_review"}).json()[0]
    assert sub["scope"] == "member" and sub["subject_user_id"]
    ap = db.execute(select(Approval).where(Approval.kind == "kyc_final", Approval.status == "pending")).scalar_one()
    assert adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "approved", "note": "ok"}).status_code == 200
    me = m.get("/v1/me").json()
    assert me["member"]["identity_status"] == "approved" and me["entitled"] is True
    # and the owner's status is unchanged
    assert client.get("/v1/me").json()["entitled"] is True


def test_member_cannot_submit_business_checks_or_use_the_owner_flow(db, client, make_client):
    admin, acct = _setup(db, client)
    m = _accepted_member(db, client, make_client)
    r = m.post("/v1/kyc/submissions",
               data={"kind": "business", "holder_name": "Sam", "business_name": "X LLC", "business_tax_id": "12-3456789",
                     "doc_types": ["business_doc"]}, files=[("files", ("p.png", PNG, "image/png"))])
    assert r.status_code == 422 and r.json()["error"]["code"] == "member_individual_only"
    assert m.post("/v1/billing/checkout", json={"plan": "family_office"}).status_code == 403
    assert m.post("/v1/billing/portal").status_code == 403


def test_member_identity_cannot_be_approved_without_an_admin_decision(db, client, make_client):
    import pytest

    from exjet_api.guardrails import GuardrailViolation

    admin, acct = _setup(db, client)
    _accepted_member(db, client, make_client)
    m = db.execute(select(AccountMember).where(AccountMember.is_owner.is_(False))).scalar_one()
    m.identity_status = "approved"
    with pytest.raises(GuardrailViolation) as e:
        db.commit()
    assert e.value.code == "member_identity_requires_admin_decision"
    db.rollback()


# --------------------------------------------------------------------------- seats follow the paid plan
def test_downgrade_with_too_many_members_suspends_extras_and_flags_an_admin(db, client, make_client):
    from exjet_api.providers.billing import FakeBilling

    admin, acct = _setup(db, client)
    m = _accepted_member(db, client, make_client)
    uid = db.execute(select(User.id).where(User.email == "sam@example.com")).scalar_one()
    approve_member_identity(db, admin, acct.id, uid)
    assert m.get("/v1/me").json()["entitled"] is True
    body, sig = FakeBilling().make_event("checkout.completed", acct.id, "individual", 4_102_444_800)
    assert client.post("/v1/billing/webhook", content=body, headers={"X-Webhook-Signature": sig}).status_code == 200
    me = m.get("/v1/me").json()
    assert me["member"]["is_suspended"] is True and me["entitled"] is False  # not silently entitled beyond the plan
    assert client.get("/v1/me").json()["entitled"] is True  # the owner keeps the seat
    ap = db.execute(select(Approval).where(Approval.kind == "seat_overage")).scalar_one()
    assert ap.status == "pending" and ap.payload["seats"] == 1 and ap.payload["members"] == 2
    # an explicit CEO approval keeps the extra member
    adm = make_client()
    login(adm, "admin@example.com")
    adm.post(f"/v1/admin/approvals/{ap.id}/decide", json={"decision": "approved"})
    assert m.get("/v1/me").json()["entitled"] is True
