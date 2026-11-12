"""Ingest side of the security fixes: L5 go-live approval, L6 new contacts on live operators, M6 shared exclusion matcher,
configured aliases and certificates."""
from pathlib import Path

from sqlalchemy import select

from exjet_api import supply
from exjet_api.config import get_settings
from exjet_api.ingest import load_config
from exjet_api.models import Aircraft, Approval, Operator, OperatorContact, User

MAPPINGS = Path(__file__).resolve().parents[4] / "data" / "mappings"

HEADER = "DBA Name,Certificate Number,Contact Email\n"


def _go_live(session, op, *, approved=True):
    ceo = session.scalar(select(User).where(User.email == "ceo@example.com")) or User(email="ceo@example.com", password_hash="x", role="admin")
    session.add(ceo)
    session.flush()
    if approved:
        session.add(Approval(kind="operator_go_live", subject_type="operator", subject_id=str(op.id), requested_by="test",
                             status="approved", summary="fixture go-live", decided_by=ceo.id))
    op.go_live_status = "live"
    session.commit()


def _op(session, cert):
    return session.scalar(select(Operator).where(Operator.certificate_number == cert))


# --------------------------------------------------------------------------- L5
def test_live_without_an_approved_go_live_row_is_never_sellable(session, ingest):
    ingest("airports_fbos", "airports_fbos_synthetic.csv")
    ingest("operators", "operators_synthetic.csv")
    ingest("aircraft", "aircraft_synthetic.csv")
    op = _op(session, "0TST001A")
    _go_live(session, op, approved=False)  # status flipped by hand: no approval row
    assert not supply.operator_sellable(op, session)
    assert not [a for a in supply.sellable_aircraft(session) if a.operator_id == op.id]
    session.add(Approval(kind="operator_go_live", subject_type="operator", subject_id=str(op.id), requested_by="test", status="pending",
                         summary="not yet decided"))
    session.commit()
    assert not supply.operator_sellable(op, session)  # a pending approval is not an approval
    ceo = session.scalar(select(User).where(User.email == "ceo@example.com"))
    session.add(Approval(kind="operator_go_live", subject_type="operator", subject_id=str(op.id), requested_by="test", status="approved",
                         summary="decided", decided_by=ceo.id))
    session.commit()
    assert supply.operator_sellable(op, session)
    assert [a for a in supply.sellable_aircraft(session) if a.operator_id == op.id]


# --------------------------------------------------------------------------- L6
def _load_with_extra_contact(ingest, tmp_path, cert, email, name="SYNTHETIC Test Operator A"):
    p = tmp_path / "operators_extra.csv"
    p.write_text(HEADER + f"{name},{cert},{email}\n")
    return ingest("operators", p)


def test_new_contact_on_a_live_operator_does_not_receive_rfqs_until_confirmed(session, ingest, tmp_path):
    ingest("operators", "operators_synthetic.csv")
    op = _op(session, "0TST001A")
    _go_live(session, op)
    run = _load_with_extra_contact(ingest, tmp_path, "0TST001A", "new.person@example.com")
    c = session.scalar(select(OperatorContact).where(OperatorContact.email == "new.person@example.com"))
    assert c is not None and c.receives_rfq is False  # stored, but not an RFQ recipient
    assert "new_contact_pending_confirmation" in run.report["flags"]
    assert run.report["contacts"]["pending_admin_confirmation"] == {"count": 1, "rows": [2]}
    # the existing, previously approved contacts are untouched
    assert {x.email for x in op.contacts if x.receives_rfq} == {"rfq.a@example.com", "rfq.a2@example.com"}


def test_a_file_cannot_promote_a_pending_contact_on_a_live_operator(session, ingest, tmp_path):
    ingest("operators", "operators_synthetic.csv")
    op = _op(session, "0TST001A")
    _go_live(session, op)
    _load_with_extra_contact(ingest, tmp_path, "0TST001A", "new.person@example.com")
    run = _load_with_extra_contact(ingest, tmp_path, "0TST001A", "new.person@example.com")  # loaded again, asking for RFQs
    c = session.scalar(select(OperatorContact).where(OperatorContact.email == "new.person@example.com"))
    assert c.receives_rfq is False and "contact_rfq_change_pending_confirmation" in run.report["flags"]


def test_contacts_on_draft_operators_still_default_to_receiving_rfqs(session, ingest, tmp_path):
    ingest("operators", "operators_synthetic.csv")
    _load_with_extra_contact(ingest, tmp_path, "0TST001A", "draft.contact@example.com")  # operator A is still draft here
    c = session.scalar(select(OperatorContact).where(OperatorContact.email == "draft.contact@example.com"))
    assert c.receives_rfq is True


def test_ingest_email_normalization_is_the_shared_normalizer():
    from exjet_api.emailnorm import normalize_email as shared
    from exjet_api.ingest.normalize import normalize_email as ingest_norm

    for raw in ("  Mixed.Case@Example.COM ", "<Ops@Example.com>", "mailto:Ops@Example.com", "A.B+tag@Sub.Example.org"):
        value, ok = ingest_norm(raw)
        assert ok and value == shared(value) and value == value.lower()
    assert ingest_norm("not an email") == (None, False)


# --------------------------------------------------------------------------- M6
def test_ingest_rejects_confusable_spellings_of_excluded_operators(session, ingest, tmp_path):
    p = tmp_path / "operators_evasion.csv"
    p.write_text(HEADER + "NеtJets,0EV0001,a@example.com\nFlex​jet LLC,0EV0002,b@example.com\n"
                 "Ｎｉｃｈｏｌａｓ Air,0EV0003,c@example.com\nHonest Charter Co,0EV0004,d@example.com\n")
    run = ingest("operators", p)
    assert {(r["row"], r["reason"]) for r in run.report["rejects"]} == {(2, "excluded_operator"), (3, "excluded_operator"), (4, "excluded_operator")}
    assert [o.dba_name for o in session.scalars(select(Operator))] == ["Honest Charter Co"]


def test_aliases_and_certificates_from_config_are_enforced_at_ingest(session, tmp_path, monkeypatch):
    monkeypatch.setenv("EXJET_EXCLUDED_OPERATOR_ALIASES", "Skyline Trade Name")
    monkeypatch.setenv("EXJET_EXCLUDED_CERTIFICATES", "0cfg-777")
    get_settings.cache_clear()
    cfg = load_config(MAPPINGS)
    assert "Skyline Trade Name" in cfg.excluded and cfg.excluded_certificates == frozenset({"0CFG777"})
    from exjet_api.ingest import run_ingest

    p = tmp_path / "operators_cfg.csv"
    p.write_text(HEADER + "Skyline Trade Name Aviation,0OK00001,a@example.com\nInnocent Name,0CFG-777,b@example.com\n"
                 "Fine Operator,0OK00002,c@example.com\n")
    run = run_ingest(session, "operators", p, p.name, "test", write_report=False, config=cfg)
    assert {(r["row"], r["reason"]) for r in run.report["rejects"]} == {(2, "excluded_operator"), (3, "excluded_operator")}
    # aircraft of the certificate-excluded operator are rejected too, even when the file names a different operator
    a = tmp_path / "aircraft_cfg.csv"
    a.write_text("Tail,Operator Certificate,Operator,Make,Model,Category,Year,Seats,Home Base,Amenities\n"
                 "N77CF,0CFG-777,Whoever,SYNTHETIC Aerospace,TJ-100,light,2015,6,KTST,\n")
    run = run_ingest(session, "aircraft", a, a.name, "test", write_report=False, config=cfg)
    assert {r["reason"] for r in run.report["rejects"]} == {"excluded_operator"}
    assert session.scalar(select(Aircraft).where(Aircraft.tail_number == "N77CF")) is None
