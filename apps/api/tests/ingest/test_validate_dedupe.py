from exjet_api.ingest.dedupe import dedupe_aircraft, dedupe_airports, dedupe_operators, dedupe_outreach
from exjet_api.ingest.types import Reject, Row, ValidationContext
from exjet_api.ingest.validate import (
    validate_aircraft,
    validate_airport,
    validate_operator,
    validate_outreach,
)


def op(cfg, n=2, **raw):
    ctx = raw.pop("ctx", ValidationContext())
    return validate_operator(n, {"dba_name": "SYNTHETIC Op", **raw}, cfg, ctx)


def codes(row):
    return {f.code for f in row.flags}


# ------------------------------------------------------------------ operators
def test_operator_normalised_fields(cfg):
    r = op(
        cfg,
        certificate_number=" 0tst1a ",
        certificate_type="Part 121",
        safety_rating="ARGUS Gold Plus",
        contact_email="X@Example.com",
        contact_phone="(214) 555-0101",
        base_airport_icao="ktst",
        country="us",
    )
    assert r.data["certificate_number"] == "0TST1A"
    assert r.data["certificate_type"] == "121"
    assert r.data["safety_rating"] == "Gold+"
    assert r.data["contacts"][0]["email"] == "x@example.com"
    assert r.data["contacts"][0]["phone"] == "+12145550101"
    assert r.data["base_airport_icao"] == "KTST" and r.data["country"] == "US"
    assert not any("argus" in str(v).lower() for v in r.data.values())


def test_excluded_operator_rejected_first_even_if_row_otherwise_invalid(cfg):
    ctx = ValidationContext()
    r = validate_operator(
        2, {"dba_name": "Net Jets", "certificate_number": "0X1", "contact_email": "bad"}, cfg, ctx
    )
    assert isinstance(r, Reject) and r.reason == "excluded_operator"
    assert "0X1" in ctx.excluded_certs


def test_excluded_by_legal_name_only(cfg):
    r = validate_operator(2, {"dba_name": "Sky Brand", "legal_name": "Flexjet LLC"}, cfg, ValidationContext())
    assert isinstance(r, Reject) and r.reason == "excluded_operator"


def test_dba_override_applies_and_cannot_smuggle_excluded_name(cfg):
    cfg.dba_overrides["example holdings llc"] = "Example Air"
    r = op(cfg, dba_name="Whatever", legal_name="Example Holdings, LLC")
    assert r.data["dba_name"] == "Example Air"
    cfg.dba_overrides["bad llc"] = "NetJets"
    r = op(cfg, dba_name="Bad LLC")
    assert isinstance(r, Reject) and r.reason == "excluded_operator"


def test_override_supplies_dba_when_column_blank(cfg):
    cfg.dba_overrides["legal only inc"] = "Legal Brand"
    r = validate_operator(2, {"legal_name": "Legal Only Inc"}, cfg, ValidationContext())
    assert r.data["dba_name"] == "Legal Brand"


def test_missing_dba_rejected_never_filled_from_legal_name(cfg):
    r = validate_operator(3, {"legal_name": "Some Legal LLC"}, cfg, ValidationContext())
    assert isinstance(r, Reject) and r.reason == "missing_required:dba_name"


def test_operator_flags(cfg):
    r = op(
        cfg,
        safety_rating="Wyvern Wingman",
        contact_email="bad",
        base_airport_icao="BAD",
        certificate_type="Part 91",
    )
    assert {
        "unknown_rating",
        "invalid_contact_email",
        "invalid_icao",
        "certificate_type_unrecognized",
        "no_certificate_number",
    } <= codes(r)
    assert r.data["safety_rating"] == "Not rated" and r.data["contacts"] == []
    assert r.data["base_airport_icao"] is None
    assert "wyvern" not in " ".join(f.detail.lower() for f in r.flags)


def test_foreign_operator_without_country_flagged(cfg):
    assert "foreign_operator_country_missing" in codes(op(cfg, certificate_type="foreign"))


def test_value_too_long_rejected(cfg):
    r = op(cfg, dba_name="x" * 201)
    assert isinstance(r, Reject) and r.reason == "value_too_long:dba_name"


def test_dedupe_operators_certificate_first_then_name(cfg):
    a = op(cfg, 2, dba_name="Acme Air", certificate_number="C1", contact_email="a@example.com")
    b = op(
        cfg, 3, dba_name="Acme Air LLC", certificate_number="C1", contact_email="b@example.com"
    )  # same cert
    c = op(cfg, 4, dba_name="ACME AIR")  # no cert -> by name
    d = op(cfg, 5, dba_name="Acme Air", certificate_number="C2")  # same name, different cert -> separate
    rows, dupes = dedupe_operators([a, b, c, d])
    assert [r.data["certificate_number"] for r in rows] == ["C1", "C2"]
    assert {(x.key_type, tuple(x.rows)) for x in dupes} == {
        ("certificate_number", (2, 3)),
        ("dba_name", (2, 4)),
    }
    assert [c["email"] for c in rows[0].data["contacts"]] == ["a@example.com", "b@example.com"]
    assert rows[0].rows == [2, 3, 4]


def test_dedupe_certificate_beats_name_when_both_could_match(cfg):
    a = op(cfg, 2, dba_name="Acme Air", certificate_number="C1")
    b = op(cfg, 3, dba_name="Other Name", certificate_number="C1")
    rows, dupes = dedupe_operators([a, b])
    assert len(rows) == 1 and dupes[0].key_type == "certificate_number"
    assert any(f.code == "merge_conflict:dba_name" for f in rows[0].flags)


def test_dedupe_adopts_certificate_from_later_row(cfg):
    a = op(cfg, 2, dba_name="Acme Air")
    b = op(cfg, 3, dba_name="Acme Air", certificate_number="C9")
    rows, _ = dedupe_operators([a, b])
    assert len(rows) == 1 and rows[0].data["certificate_number"] == "C9"


# ------------------------------------------------------------------ aircraft
def ac(cfg, n=2, ctx=None, **raw):
    base = {"tail_number": "N10TS", "operator_certificate_number": "C1", "manufacturer": "M", "model": "X1"}
    return validate_aircraft(n, {**base, **raw}, cfg, ctx or ValidationContext())


def test_aircraft_tail_flags_and_normalisation(cfg):
    r = ac(cfg, tail_number=" n10ts ")
    assert r.data["tail_number"] == "N10TS" and not r.flags
    assert "non_us_tail" in codes(ac(cfg, tail_number="C-GABC"))
    assert "non_us_tail" in codes(ac(cfg, tail_number="N00TST1"))
    bad = ac(cfg, tail_number="N 12$")
    assert isinstance(bad, Reject) and bad.reason == "invalid_tail"


def test_aircraft_required_fields(cfg):
    assert ac(cfg, tail_number=None).reason == "missing_required:tail_number"
    assert ac(cfg, operator_certificate_number=None).reason == "missing_required:operator"
    assert ac(cfg, manufacturer=None).reason == "missing_required:manufacturer"
    assert ac(cfg, model=None).reason == "missing_required:model"


def test_aircraft_excluded_by_name_and_by_known_excluded_certificate(cfg):
    assert (
        ac(cfg, operator_name="Nicholas Air Inc", operator_certificate_number=None).reason
        == "excluded_operator"
    )
    ctx = ValidationContext(excluded_certs={"C1"})
    assert ac(cfg, ctx=ctx).reason == "excluded_operator"


def test_aircraft_numeric_and_category_validation(cfg):
    r = ac(
        cfg,
        year_of_manufacture="1850",
        passenger_seats="abc",
        category="Super Midsize",
        amenities="WiFi; Bar, Galley",
    )
    assert {"invalid_year_of_manufacture", "invalid_passenger_seats"} <= codes(r)
    assert r.data["category"] == "super_midsize" and r.data["amenities"] == ["WiFi", "Bar", "Galley"]
    assert r.data["year_of_manufacture"] is None


def test_dedupe_aircraft_by_tail(cfg):
    a, b, c = ac(cfg, 2), ac(cfg, 3, year_of_manufacture="2015"), ac(cfg, 4, operator_certificate_number="C2")
    rows, dupes, rejects = dedupe_aircraft([a, b, c])
    assert len(rows) == 1 and rows[0].data["year_of_manufacture"] == 2015
    assert dupes[0].key_type == "tail_number" and dupes[0].rows == [2, 3]
    assert rejects[0].row == 4 and rejects[0].reason == "duplicate_tail_conflicting_operator"


# ------------------------------------------------------------------ airports
def apt(cfg, n=2, **raw):
    base = {"icao": "ktst", "name": "SYNTHETIC Field", "latitude": "10", "longitude": "20"}
    return validate_airport(n, {**base, **raw}, cfg, ValidationContext())


def test_airport_validation(cfg):
    assert apt(cfg).data["icao"] == "KTST"
    assert apt(cfg, icao="TOOLONG").reason == "invalid_icao"
    assert apt(cfg, icao=None).reason == "missing_required:icao"
    assert apt(cfg, latitude=None).reason == "missing_required:latitude"
    assert apt(cfg, latitude="91").reason == "invalid_latitude"
    assert apt(cfg, longitude="-181").reason == "invalid_longitude"


def test_airport_fbo_and_flags(cfg):
    r = apt(cfg, fbo_name="SYN FBO", fbo_email="bad", fbo_phone="214-555-0100", state="Texas")
    assert r.data["fbo"] == {"name": "SYN FBO", "phone": "+12145550100", "email": None}
    assert {"invalid_fbo_email", "invalid_state"} <= codes(r)
    assert "fbo_without_name" in codes(apt(cfg, fbo_email="a@example.com"))
    assert "country_missing_defaulted_us" in codes(apt(cfg, icao="ZZZZ"))


def test_dedupe_airports_by_icao_and_fbo(cfg):
    rows = [
        apt(cfg, 2, fbo_name="One"),
        apt(cfg, 3, fbo_name="Two"),
        apt(cfg, 4, fbo_name="ONE "),
        apt(cfg, 5, city="Testville"),
    ]
    units, dupes, airports = dedupe_airports(rows)
    assert len(units) == 3  # One, Two, and the airport-only row
    assert [(d.key_type, d.rows) for d in dupes] == [("icao+fbo", [2, 4])]
    assert list(airports) == ["KTST"] and airports["KTST"].data["city"] == "Testville"


# ------------------------------------------------------------------ outreach
def out(cfg, n=2, **raw):
    return validate_outreach(n, {"email": "A@Example.com", **raw}, cfg, ValidationContext())


def test_outreach_rules(cfg):
    r = out(cfg, first_name="Al", last_name="Prospect", state="tx")
    assert (
        r.data["email"] == "a@example.com"
        and r.data["full_name"] == "Al Prospect"
        and r.data["state"] == "TX"
    )
    assert out(cfg, email="nope").reason == "invalid_email"
    assert out(cfg, email=None).reason == "missing_required:email"
    assert out(cfg, company="NetJets Aviation").reason == "excluded_operator"
    assert "invalid_state" in codes(out(cfg, state="Texas"))


def test_dedupe_outreach_by_lowercased_email(cfg):
    rows, dupes = dedupe_outreach(
        [out(cfg, 2), out(cfg, 3, email="a@example.COM", company="Co"), out(cfg, 4, email="b@example.com")]
    )
    assert len(rows) == 2 and rows[0].data["company"] == "Co"
    assert dupes[0].key_type == "email" and dupes[0].rows == [2, 3]


def test_row_defaults():
    assert Row(5, {}).rows == [5]
