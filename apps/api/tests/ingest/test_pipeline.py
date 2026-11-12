import json

import pytest
from sqlalchemy import func, select

from exjet_api.ingest import IngestError, run_ingest
from exjet_api.models import (
    Aircraft,
    AircraftType,
    Airport,
    Fbo,
    IngestRun,
    Operator,
    OperatorContact,
    OutreachContact,
)

COUNTS = ("rows_read", "loaded", "updated", "unchanged", "rejected", "duplicates_merged")


def count(session, model):
    return session.scalar(select(func.count()).select_from(model))


def reasons(run):
    return {(r["row"], r["reason"]) for r in run.report["rejects"]}


def test_row_accounting_adds_up_for_every_dataset(load_all):
    for ds, run in load_all().items():
        r = run.report
        assert (
            r["rows_read"]
            == r["loaded"] + r["updated"] + r["unchanged"] + r["rejected"] + r["duplicates_merged"]
        ), ds


def test_airports_and_fbos(session, ingest):
    run = ingest("airports_fbos", "airports_fbos_synthetic.csv")
    assert (run.rows_read, run.rows_loaded, run.rows_rejected, run.duplicates_merged) == (8, 4, 3, 1)
    assert reasons(run) == {(6, "invalid_icao"), (7, "missing_required:latitude"), (8, "invalid_latitude")}
    assert {a.icao for a in session.scalars(select(Airport))} == {"KTST", "KABC", "ZZZZ"}
    assert count(session, Fbo) == 3
    ktst = session.scalar(select(Airport).where(Airport.icao == "KTST"))
    assert len(ktst.fbos) == 2 and {f.phone for f in ktst.fbos} == {"+12145550100", None}
    kabc = session.scalar(select(Airport).where(Airport.icao == "KABC"))
    assert kabc.fbos[0].email is None and "invalid_fbo_email" in run.report["flags"]
    assert "country_missing_defaulted_us" in run.report["flags"]
    assert run.report["fbos"] == {"loaded": 3, "updated": 0, "unchanged": 0}


def test_operators_load_and_reject(session, ingest):
    run = ingest("operators", "operators_synthetic.csv")
    assert (run.rows_read, run.rows_loaded, run.rows_rejected, run.duplicates_merged) == (13, 6, 5, 2)
    assert reasons(run) == {
        (6, "excluded_operator"),
        (7, "excluded_operator"),
        (8, "excluded_operator"),
        (9, "excluded_operator"),
        (12, "missing_required:dba_name"),
    }
    names = {o.dba_name for o in session.scalars(select(Operator))}
    assert names == {f"SYNTHETIC Test Operator {x}" for x in "ABCDFG"}
    assert not any(o.is_excluded for o in session.scalars(select(Operator)))
    # duplicates merged: certificate (rows 2,10) and DBA name (rows 3,11)
    assert {(d["key"], tuple(d["rows"])) for d in run.report["duplicates"]} == {
        ("certificate_number", (2, 10)),
        ("dba_name", (3, 11)),
    }


def test_new_operators_are_draft_and_normalised(session, ingest):
    ingest("operators", "operators_synthetic.csv")
    ops = {o.dba_name[-1]: o for o in session.scalars(select(Operator))}
    assert {o.go_live_status for o in ops.values()} == {"draft"}
    a = ops["A"]
    assert (a.certificate_number, a.certificate_type, a.safety_rating) == ("0TST001A", "135", "Platinum")
    assert ops["B"].safety_rating == "Gold+"
    assert ops["C"].certificate_type == "121" and ops["C"].safety_rating == "Not rated"  # unknown rating
    assert (
        ops["D"].certificate_type == "foreign"
        and ops["D"].country == "CA"
        and ops["D"].base_airport_icao is None
    )
    assert ops["G"].safety_rating == "Platinum+"
    assert ops["F"].certificate_number is None
    assert {o.safety_rating for o in ops.values()} <= {"Not rated", "Gold", "Gold+", "Platinum", "Platinum+"}


def test_operator_contacts_merged_normalised_and_rfq_flag(session, ingest):
    run = ingest("operators", "operators_synthetic.csv")
    a = session.scalar(select(Operator).where(Operator.certificate_number == "0TST001A"))
    assert {c.email for c in a.contacts} == {"rfq.a@example.com", "rfq.a2@example.com"}
    assert next(c for c in a.contacts if c.email == "rfq.a@example.com").phone == "+12145550101"
    b = session.scalar(select(Operator).where(Operator.certificate_number == "0TST002B"))
    assert [c.email for c in b.contacts] == ["rfq.b@example.com"]  # lowercased
    assert run.report["operators_without_rfq_contact"] == {"count": 2, "rows": [4, 5]}  # C and D
    assert count(session, OperatorContact) == 5
    assert run.report["flags"]["invalid_contact_email"]["rows"] == [5]


def test_excluded_names_never_reach_any_table(session, load_all):
    load_all()
    forbidden = ("netjets", "net jets", "flexjet", "nicholas")
    for model, cols in ((Operator, ("dba_name", "legal_name")), (OutreachContact, ("company",))):
        for obj in session.scalars(select(model)):
            for c in cols:
                assert not any(f in (getattr(obj, c) or "").lower() for f in forbidden)
    assert (
        session.scalar(
            select(func.count()).select_from(Operator).where(Operator.certificate_number == "0TST900X")
        )
        == 0
    )


def test_excluded_operator_aircraft_and_contacts_rejected(session, load_all):
    runs = load_all()
    assert (8, "excluded_operator") in reasons(runs["aircraft"])  # by certificate of an excluded operator
    assert (9, "excluded_operator") in reasons(runs["aircraft"])  # by operator name
    assert (7, "excluded_operator") in reasons(runs["outreach_lists"])  # contact at an excluded company
    assert (
        "excluded_operator" in next(r for r in runs["operators"].report["rejects"] if r["row"] == 6)["reason"]
    )
    assert (
        "contact rejected too"
        in next(r for r in runs["operators"].report["rejects"] if r["row"] == 6)["detail"]
    )
    assert not session.scalars(select(OperatorContact).where(OperatorContact.email.like("excluded%"))).all()
    assert not session.scalars(select(Aircraft).where(Aircraft.tail_number.in_(["N00TST2", "N00TST3"]))).all()


def test_aircraft_load_types_tails_and_flags(session, load_all):
    run = load_all()["aircraft"]
    assert (run.rows_read, run.rows_loaded, run.rows_rejected, run.duplicates_merged) == (11, 4, 6, 1)
    assert reasons(run) == {
        (7, "duplicate_tail_conflicting_operator"),
        (8, "excluded_operator"),
        (9, "excluded_operator"),
        (10, "unknown_operator"),
        (11, "missing_required:tail_number"),
        (12, "aircraft_type_category_required"),
    }
    tails = {a.tail_number: a for a in session.scalars(select(Aircraft))}
    assert set(tails) == {"N10TS", "N11TS", "N00TST1", "C-GTST1"}
    assert tails["N10TS"].amenities == ["WiFi", "Lavatory"] and tails["N10TS"].year_of_manufacture == 2015
    assert tails["C-GTST1"].year_of_manufacture is None  # invalid year left empty, flagged
    assert run.report["flags"]["non_us_tail"]["rows"] == [4, 5]  # only tails that were loaded
    assert "N10TS" not in " ".join(run.report["flags"])  # flags carry codes and rows, never tails
    assert tails["N11TS"].type_id == tails["N10TS"].type_id  # "TJ 100" matched "TJ-100"
    assert tails["N11TS"].operator.certificate_number == "0TST002B"


def test_unknown_aircraft_type_created_with_only_file_fields_and_flagged(session, load_all):
    run = load_all()["aircraft"]
    types = {t.model: t for t in session.scalars(select(AircraftType))}
    assert set(types) == {"TJ-100", "TJ-200"}
    t = types["TJ-100"]
    assert (t.category, t.slug) == ("light", "synthetic-aerospace-tj-100")
    for f in (
        "max_passengers",
        "range_nm",
        "cruise_speed_kts",
        "min_runway_ft",
        "baggage_cuft",
        "cabin_length_ft",
        "cabin_width_ft",
        "cabin_height_ft",
        "icao_type_code",
    ):
        assert getattr(t, f) is None, f
    needing = {x["type"]: x for x in run.report["types_needing_specs"]}
    assert set(needing) == {"SYNTHETIC Aerospace TJ-100", "SYNTHETIC Aerospace TJ-200"}
    assert "range_nm" in needing["SYNTHETIC Aerospace TJ-100"]["missing"]


def test_existing_type_matched_by_normalised_manufacturer_and_model(session, ingest):
    session.add(
        AircraftType(
            slug="existing",
            manufacturer="SYNTHETIC Aerospace",
            model="TJ-100",
            category="light",
            max_passengers=7,
            range_nm=1000,
            cruise_speed_kts=400,
            min_runway_ft=3000,
            baggage_cuft=50,
        )
    )
    session.commit()
    ingest("operators", "operators_synthetic.csv")
    run = ingest("aircraft", "aircraft_synthetic.csv")
    assert count(session, AircraftType) == 2  # only TJ-200 created
    assert {x["type"] for x in run.report["types_needing_specs"]} == {"SYNTHETIC Aerospace TJ-200"}
    existing = session.scalar(select(AircraftType).where(AircraftType.slug == "existing"))
    assert existing.range_nm == 1000  # untouched


def test_type_alias_file_maps_spelling_to_canonical_type(session, ingest, cfg):
    from exjet_api.ingest.normalize import type_key

    session.add(
        AircraftType(slug="canon", manufacturer="Canon Aero", model="C1", category="light", max_passengers=4)
    )
    session.commit()
    cfg.type_aliases[type_key("SYNTHETIC Aerospace", "TJ-100")] = ("Canon Aero", "C1")
    ingest("operators", "operators_synthetic.csv")
    ingest("aircraft", "aircraft_synthetic.csv")
    t10 = session.scalar(select(Aircraft).where(Aircraft.tail_number == "N10TS")).type
    assert t10.slug == "canon"


def test_aircraft_for_unknown_operator_rejected_when_operators_not_loaded(session, ingest):
    run = ingest("aircraft", "aircraft_synthetic.csv")
    assert run.rows_loaded == 0 and run.report["rejects_by_reason"]["unknown_operator"] >= 4
    assert count(session, Aircraft) == 0


def test_outreach_contacts(session, load_all):
    run = load_all()["outreach_lists"]
    assert (run.rows_read, run.rows_loaded, run.rows_rejected, run.duplicates_merged) == (7, 3, 3, 1)
    assert reasons(run) == {(5, "invalid_email"), (6, "missing_required:email"), (7, "excluded_operator")}
    c = {x.email: x for x in session.scalars(select(OutreachContact))}
    assert set(c) == {
        "alice.synthetic@example.com",
        "bob.synthetic@example.com",
        "dave.synthetic@example.com",
    }
    assert c["alice.synthetic@example.com"].full_name == "SYNTHETIC Alice Prospect"
    assert c["dave.synthetic@example.com"].state is None


def test_pii_is_encrypted_at_rest(session, engine, load_all):
    load_all()
    from sqlalchemy import text

    with engine.connect() as conn:
        raw = conn.execute(
            text("select full_name from outreach_contacts where email='alice.synthetic@example.com'")
        ).scalar()
    assert raw and "Alice" not in raw


# ------------------------------------------------------------------ idempotency
def test_second_run_changes_nothing(session, ingest):
    files = {
        "airports_fbos": "airports_fbos_synthetic.csv",
        "operators": "operators_synthetic.csv",
        "aircraft": "aircraft_synthetic.csv",
        "outreach_lists": "outreach_lists_synthetic.csv",
    }
    first = {ds: ingest(ds, f) for ds, f in files.items()}

    def snapshot():
        return {
            m.__name__: count(session, m)
            for m in (Airport, Fbo, Operator, OperatorContact, AircraftType, Aircraft, OutreachContact)
        }

    def rows():
        out = []
        for m in (Operator, Aircraft, AircraftType, Airport, Fbo, OutreachContact, OperatorContact):
            for o in session.scalars(select(m)):
                out.append((m.__name__, o.id, o.updated_at))
        return sorted(out, key=str)

    before, before_rows = snapshot(), rows()
    for ds, f in files.items():
        again = ingest(ds, f)
        r, r1 = again.report, first[ds].report
        assert (r["loaded"], r["updated"]) == (0, 0), ds
        assert r["unchanged"] == r1["loaded"] + r1["updated"] + r1["unchanged"], ds
        assert r["rejected"] == r1["rejected"] and r["duplicates_merged"] == r1["duplicates_merged"], ds
        assert again.file_sha256 == first[ds].file_sha256
    assert snapshot() == before
    assert rows() == before_rows  # not even updated_at moved
    assert count(session, IngestRun) == 8  # every run is recorded, including the no-op ones


def test_rerun_with_changed_value_updates_only_that_row(session, ingest, tmp_path, fixtures_dir):
    ingest("operators", "operators_synthetic.csv")
    text = (fixtures_dir / "operators_synthetic.csv").read_text()
    p = tmp_path / "operators_changed.csv"
    p.write_text(text.replace("Gold Plus", "Platinum"))
    run = ingest("operators", p)
    assert (run.report["loaded"], run.report["updated"]) == (0, 1)
    assert (
        session.scalar(select(Operator).where(Operator.certificate_number == "0TST002B")).safety_rating
        == "Platinum"
    )


def test_rerun_never_blanks_or_downgrades_existing_data(session, ingest, tmp_path):
    ingest("operators", "operators_synthetic.csv")
    p = tmp_path / "operators_sparse.csv"
    p.write_text(
        "DBA Name,Certificate Number,Rating\nSYNTHETIC Test Operator A,0TST001A,Wyvern Wingman\n"
        "SYNTHETIC Test Operator B,0TST002B,\n"
    )
    run = ingest("operators", p)
    assert run.report["updated"] == 0  # unknown rating does not downgrade; blank does not erase
    a = session.scalar(select(Operator).where(Operator.certificate_number == "0TST001A"))
    assert a.safety_rating == "Platinum" and a.base_airport_icao == "KTST"
    assert "unknown_rating" in run.report["flags"]


def test_go_live_status_never_changed_by_reload(session, ingest):
    ingest("operators", "operators_synthetic.csv")
    op = session.scalar(select(Operator).where(Operator.certificate_number == "0TST001A"))
    op.go_live_status = "live"
    session.commit()
    ingest("operators", "operators_synthetic.csv")
    session.refresh(op)
    assert op.go_live_status == "live"


def test_operator_dedupe_against_database_certificate_then_name(session, ingest, tmp_path):
    ingest("operators", "operators_synthetic.csv")
    p = tmp_path / "operators_later.csv"
    p.write_text(
        "DBA Name,Certificate Number,Base Airport\n"
        "SYNTHETIC Test Operator F,0TST006F,KTST\n"  # existing by name (had no cert) -> adopts certificate
        "SYNTHETIC Test Operator A Renamed,0TST001A,\n"  # existing by certificate -> renamed, not duplicated
        "SYNTHETIC Test Operator B,0TST999Z,\n"
    )  # same name, other certificate -> separate operator
    run = ingest("operators", p)
    assert (run.report["loaded"], run.report["updated"]) == (1, 2)
    assert (
        session.scalar(
            select(Operator).where(Operator.dba_name == "SYNTHETIC Test Operator F")
        ).certificate_number
        == "0TST006F"
    )
    assert session.scalar(
        select(Operator).where(Operator.certificate_number == "0TST001A")
    ).dba_name.endswith("Renamed")
    assert count(session, Operator) == 7
    assert "same_name_different_certificate" in run.report["flags"]


def test_dba_overrides_normalise_names(session, ingest, cfg, tmp_path):
    cfg.dba_overrides["synthetic legal holdings llc"] = "SYNTHETIC Brand Air"
    p = tmp_path / "operators_o.csv"
    p.write_text(
        "DBA Name,Legal Name,Certificate Number\nSYNTHETIC Legal Holdings LLC,,0TST010A\n,SYNTHETIC Legal Holdings, LLC,0TST010A\n"
    )
    run = ingest("operators", p)
    assert run.rows_loaded == 1
    assert session.scalar(select(Operator)).dba_name == "SYNTHETIC Brand Air"


# ------------------------------------------------------------------ formats and failures
def test_csv_xlsx_json_variants_give_identical_results(session, ingest):
    results = {}
    for name in ("operators_synthetic.csv", "operators_synthetic.xlsx", "operators_synthetic.json"):
        run = ingest("operators", name, dry_run=True)
        results[name] = {k: run.report[k] for k in COUNTS} | {"flags": run.report["flags"].keys()}
    assert (
        results["operators_synthetic.csv"]
        == results["operators_synthetic.xlsx"]
        == results["operators_synthetic.json"]
    )


def test_xlsx_and_json_loads_are_idempotent_with_csv(session, ingest):
    ingest("operators", "operators_synthetic.csv")
    for name in ("operators_synthetic.xlsx", "operators_synthetic.json"):
        r = ingest("operators", name).report
        assert (r["loaded"], r["updated"]) == (0, 0)
    ingest("aircraft", "aircraft_synthetic.csv")
    assert ingest("aircraft", "aircraft_synthetic.json").report["loaded"] == 0
    ingest("outreach_lists", "outreach_lists_synthetic.csv")
    assert ingest("outreach_lists", "outreach_lists_synthetic.xlsx").report["loaded"] == 0


def test_missing_required_column_rejects_every_row_and_loads_nothing(session, ingest, tmp_path):
    p = tmp_path / "outreach_lists_nocols.csv"
    p.write_text("Name,Company\nA,B\nC,D\n")
    run = ingest("outreach_lists", p)
    assert run.rows_loaded == 0 and run.rows_rejected == 2
    assert run.report["missing_required_columns"] == ["email"]
    assert run.report["rejects_by_reason"] == {"missing_required_column": 2}
    assert count(session, OutreachContact) == 0


def test_unmapped_columns_reported_and_rating_source_columns_hidden(ingest):
    rep = ingest("operators", "operators_synthetic.csv", dry_run=True).report
    assert "Internal Notes" in rep["unmapped_columns"]
    blob = json.dumps(rep).lower()
    assert "argus" not in blob and "wyvern" not in blob
    assert rep["ignored_columns"] == 1  # the Rating Source column is dropped, never stored


def test_unknown_dataset_and_unreadable_file(session, cfg):
    with pytest.raises(IngestError):
        run_ingest(session, "bogus", b"a\n1\n", "x.csv", "t", config=cfg)
    with pytest.raises(IngestError):
        run_ingest(session, "operators", b"%PDF", "x.pdf", "t", config=cfg)


def test_accepts_bytes_and_file_objects(session, cfg, fixtures_dir):
    data = (fixtures_dir / "outreach_lists_synthetic.csv").read_bytes()
    r = run_ingest(
        session, "outreach_lists", data, "outreach_lists_x.csv", "user:1", write_report=False, config=cfg
    )
    assert r.rows_loaded == 3 and r.started_by == "user:1" and r.filename == "outreach_lists_x.csv"
    with open(fixtures_dir / "outreach_lists_synthetic.csv", "rb") as fh:
        assert (
            run_ingest(
                session, "outreach_lists", fh, "outreach_lists_x.csv", "t", write_report=False, config=cfg
            ).rows_loaded
            == 0
        )


# ------------------------------------------------------------------ dry run
def test_dry_run_writes_nothing_but_reports_everything(session, ingest, tmp_path):
    report = tmp_path / "DATA_REPORT.md"
    run = ingest("operators", "operators_synthetic.csv", dry_run=True, write_report=True, report_path=report)
    assert (run.report["rows_read"], run.report["loaded"], run.report["rejected"]) == (13, 6, 5)
    assert run.report["dry_run"] is True
    for m in (Operator, OperatorContact, IngestRun):
        assert count(session, m) == 0
    assert not report.exists()


def test_dry_run_matches_real_run(session, ingest):
    dry = ingest("operators", "operators_synthetic.csv", dry_run=True).report
    real = ingest("operators", "operators_synthetic.csv").report
    for k in COUNTS + ("rejects", "flags", "duplicates"):
        assert dry[k] == real[k], k
