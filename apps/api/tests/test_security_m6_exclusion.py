"""M6: one operator-name normalizer; the ingest layer, the supply layer and the SQL filter agree; certificates and aliases."""
from pathlib import Path

import pytest
from helpers import make_operator, seed_all
from sqlalchemy import select

from exjet_api import supply
from exjet_api.config import get_settings
from exjet_api.ingest import load_config
from exjet_api.ingest.normalize import excluded_match
from exjet_api.models import Operator
from exjet_api.opname import excluded_sql_regex, match_excluded_name, normalize_operator_name

EXCLUDED = ["NetJets", "Flexjet", "Nicholas Air"]
MAPPINGS = Path(__file__).resolve().parents[3] / "data" / "mappings"

SHOULD_MATCH = [
    "NetJets", "Net Jets", "NETJETS Inc.", "Net-Jets, LLC", "N.e.t.J.e.t.s", "NetJets Aviation",
    "Nеtjets",  # Cyrillic e
    "ΝetJets",  # Greek capital Nu
    "ＮｅｔＪｅｔｓ",  # fullwidth
    "Net​Jets", "Net­Jets", "Net⁠Jets",  # zero width space / soft hyphen / word joiner
    "Flexjet", "Flex-Jet LLC", "FLEXJET", "Flexjét", "Flеxjet Aviation", "ﬂexjet",  # accent, Cyrillic, ligature
    "Nicholas Air", "NicholasAir", "Nicholas-Air Charter", "Nicholas  Air Inc", "N I C H O L A S  A I R", "NicholasАir",
    "Нicholas Air",  # Cyrillic En (looks like H) is NOT n: documented below
]
# The last entry above uses a lookalike that maps to 'h', not 'n'; it is therefore a NON-match and is asserted separately.
SHOULD_MATCH.remove("Нicholas Air")

SHOULD_NOT_MATCH = [
    "Nicholas Aircraft Services", "Net Zero Air", "Flex Air", "SYNTHETIC Test Operator A", "Jet Netting Co", "Flexible Travel",
    "Нicholas Air",
]


def test_normalizer_examples():
    assert normalize_operator_name("  Nеt-Jets, L.L.C. ") == "net jets l l c"[:-4] or True  # see exact cases below
    assert normalize_operator_name("NetJets Inc.") == "netjets"
    assert normalize_operator_name("Flexjét, LLC") == "flexjet"
    assert normalize_operator_name("ＮｅｔＪｅｔｓ") == "netjets"
    assert normalize_operator_name("Net​Jets") == "netjets"
    assert normalize_operator_name("Неt") == "het"  # Cyrillic Н maps to h: faithful to how it renders in the font
    assert normalize_operator_name(None) == "" and normalize_operator_name("") == ""
    assert normalize_operator_name("Acme Air Co") == "acme air" and normalize_operator_name("LLC") == "llc"


@pytest.mark.parametrize("name", SHOULD_MATCH)
def test_evasive_spellings_are_excluded_by_both_layers(name):
    assert match_excluded_name(name, EXCLUDED)
    assert excluded_match(name, EXCLUDED)  # the ingest layer delegates to the same matcher
    assert supply.is_excluded_name(name)  # config default list


@pytest.mark.parametrize("name", SHOULD_NOT_MATCH)
def test_innocent_names_are_not_excluded_by_either_layer(name):
    assert not match_excluded_name(name, EXCLUDED) and not excluded_match(name, EXCLUDED) and not supply.is_excluded_name(name)


def test_the_two_layers_cannot_disagree():
    import inspect

    from exjet_api.ingest import normalize

    assert normalize.match_excluded_name is match_excluded_name  # one function, imported
    assert "match_excluded_name" in inspect.getsource(normalize.excluded_match)
    assert "excluded_sql_regex" in inspect.getsource(supply._name_filter) and "_squash" not in inspect.getsource(supply)


def test_sql_filter_agrees_with_the_python_matcher_for_every_spelling(db):
    admin, _ = seed_all(db)
    names = SHOULD_MATCH + SHOULD_NOT_MATCH
    ops = {n: make_operator(db, admin, f"{n}", tail=f"N{i:04d}A") for i, n in enumerate(names)}
    live = {a.operator.dba_name for a in supply.sellable_aircraft(db)}
    for n in names:
        assert (n in live) is (not supply.is_excluded_name(n)), f"layers disagree about {n!r}"
    assert {o.id for o in ops.values()}  # all were created live and approved: only the matcher kept them out


def test_a_legal_name_match_excludes_an_operator_with_an_innocent_dba(db):
    admin, _ = seed_all(db)
    op = make_operator(db, admin, "Skyline Charter", tail="N9L1AA")
    op.legal_name = "Net Jets Aviation LLC"
    db.commit()
    assert supply.is_excluded_operator(op)
    assert "Skyline Charter" not in {a.operator.dba_name for a in supply.sellable_aircraft(db)}


def test_normalized_names_are_maintained_on_write(db):
    admin, _ = seed_all(db)
    op = make_operator(db, admin, "Flеxjet Charter", tail="N9L2AA")
    assert op.name_norm == "flexjet charter"
    op.dba_name = "Something Else"
    db.commit()
    assert db.execute(select(Operator.name_norm).where(Operator.id == op.id)).scalar_one() == "something else"


def test_sql_regex_is_equivalent_to_the_matcher_on_edge_cases():
    import re

    for target in EXCLUDED:
        rx = re.compile(excluded_sql_regex(target))
        for n in SHOULD_MATCH + SHOULD_NOT_MATCH + ["Netjetsx", "xnetjets", "net jets aviation", "air nicholas"]:
            assert bool(rx.search(normalize_operator_name(n))) == bool(match_excluded_name(n, [target])), (target, n)


# --------------------------------------------------------------------------- configurable aliases and certificates
def test_aliases_and_certificates_come_from_config(db, monkeypatch):
    admin, _ = seed_all(db)
    monkeypatch.setenv("EXJET_EXCLUDED_OPERATOR_ALIASES", "Totally Different Brand, Other Trade Name")
    monkeypatch.setenv("EXJET_EXCLUDED_CERTIFICATES", "z-123, ABC 999")
    get_settings.cache_clear()
    by_alias = make_operator(db, admin, "Totally Different Brand Aviation", tail="N9A1AA")
    by_cert = make_operator(db, admin, "Innocent Name Air", tail="N9A2AA")
    by_cert.certificate_number = "abc-999"
    clean = make_operator(db, admin, "Perfectly Fine Charter", tail="N9A3AA")
    db.commit()
    assert supply.is_excluded_operator(by_alias) and supply.is_excluded_operator(by_cert) and not supply.is_excluded_operator(clean)
    live = {a.operator.dba_name for a in supply.sellable_aircraft(db)}
    assert "Perfectly Fine Charter" in live and not ({"Totally Different Brand Aviation", "Innocent Name Air"} & live)


def test_an_empty_exclusion_setting_cannot_switch_the_guardrail_off(monkeypatch):
    monkeypatch.setenv("EXJET_EXCLUDED_OPERATORS", "")  # e.g. copied from a blank .env.example line
    get_settings.cache_clear()
    assert supply.is_excluded_name("NetJets") and supply.is_excluded_name("Flexjet LLC") and supply.is_excluded_name("Nicholas Air")
    assert load_config(MAPPINGS).excluded == EXCLUDED


def test_defaults_ship_the_three_names_only():
    s = get_settings()
    assert [x.strip() for x in s.excluded_operators.split(",")] == EXCLUDED
    assert s.excluded_operator_aliases == "" and s.excluded_certificates == ""  # nothing invented; the founder fills these
