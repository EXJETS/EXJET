import pytest

from exjet_api.ingest.normalize import (
    RATING_VALUES,
    excluded_match,
    is_us_tail,
    is_valid_icao,
    mask_email,
    name_key,
    normalize_category,
    normalize_certificate,
    normalize_certificate_type,
    normalize_email,
    normalize_phone,
    normalize_rating,
    normalize_tail,
)

EXCLUDED = ["NetJets", "Flexjet", "Nicholas Air"]
TOKENS = ["argus", "wyvern", "isbao", "is-bao", "is bao"]


@pytest.mark.parametrize(
    "name",
    [
        "NetJets",
        "Net Jets",
        "NETJETS Aviation Inc",
        "net-jets",
        "Net Jets, Inc.",
        "Flexjet LLC",
        "FlexJet",
        "Flex Jet",
        "Nicholas Air",
        "Nicholas Air Inc",
        "NICHOLAS-AIR",
        "NicholasAir",
        "Nicholas  Air  Charter",
    ],
)
def test_excluded_variants_match(name):
    assert excluded_match(name, EXCLUDED)


@pytest.mark.parametrize(
    "name", ["SYNTHETIC Test Operator A", "Nicholas Aircraft Services", "Net Zero Air", "", None, "Flex Air"]
)
def test_non_excluded_names_pass(name):
    assert excluded_match(name, EXCLUDED) is None


def test_name_key_drops_corporate_suffixes_and_punctuation():
    assert name_key("Acme Air, L.L.C.") == name_key("ACME AIR") == "acme air"
    assert name_key("Inc") == "inc"  # never reduces a name to nothing


@pytest.mark.parametrize("tail", ["N1", "N12345", "N1234A", "N123AB", "N1A", "N99999", "N100TS"])
def test_us_tails_valid(tail):
    assert is_us_tail(tail)


@pytest.mark.parametrize(
    "tail", ["N0123", "N00TST1", "N123IO", "N12345A", "CGABC", "C-GABC", "G-ABCD", "N", "N123ABC"]
)
def test_non_us_or_malformed_tails_not_us(tail):
    assert not is_us_tail(tail)


def test_tail_normalisation():
    assert normalize_tail(" n 123 ab ") == "N123AB"
    assert normalize_tail("N-123AB") == "N123AB"
    assert normalize_tail("c-gabc") == "C-GABC"
    assert normalize_tail("  ") is None


def test_certificate_normalisation():
    assert normalize_certificate("  1abc 23x ") == "1ABC 23X"
    assert normalize_certificate(None) is None


def test_email_normalisation_and_validation():
    assert normalize_email(" Foo.Bar@Example.COM ") == ("foo.bar@example.com", True)
    assert normalize_email("Name <a@example.com>") == ("a@example.com", True)
    assert normalize_email("mailto:a@example.com") == ("a@example.com", True)
    assert normalize_email("") == (None, True)
    for bad in ["nope", "a@b", "a@@b.com", "a..b@c.com", "a b@c.com", "@c.com"]:
        assert normalize_email(bad) == (None, False), bad


def test_mask_email_never_returns_full_address():
    assert mask_email("alice@example.com") == "a***@example.com"
    assert "alice" not in mask_email("alice@example.com")
    assert mask_email("garbage") == "g***"


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("(214) 555-0101", "+12145550101"),
        ("214.555.0102", "+12145550102"),
        ("1-214-555-0103", "+12145550103"),
        ("+44 20 7946 0958", "+442079460958"),
    ],
)
def test_phone_e164_when_unambiguous(raw, expected):
    assert normalize_phone(raw) == (expected, True)


@pytest.mark.parametrize(
    "raw", ["12345", "555-0101", "214-555-0101 x22", "+1 214 555", "011 44 20 7946 0958"]
)
def test_phone_ambiguous_is_kept_verbatim_and_flagged(raw):
    assert normalize_phone(raw) == (raw, False)


def test_icao():
    assert is_valid_icao("KTST") and not is_valid_icao("KT1") and not is_valid_icao("TOOLONG")


def test_certificate_type():
    assert normalize_certificate_type("Part 135") == "135"
    assert normalize_certificate_type("14 CFR 121") == "121"
    assert normalize_certificate_type("Foreign / Non-US") == "foreign"
    assert normalize_certificate_type("Part 91") is None
    assert normalize_certificate_type(None) is None


def test_category():
    assert normalize_category("Super Mid-Size") == "super_midsize"
    assert normalize_category("Very Light Jet") == "very_light"
    assert normalize_category("space shuttle") is None


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("Gold", "Gold"),
        ("gold+", "Gold+"),
        ("Gold Plus", "Gold+"),
        ("PLATINUM", "Platinum"),
        ("Platinum+", "Platinum+"),
        ("ARGUS Platinum", "Platinum"),
        ("ARGUS Platinum Plus", "Platinum+"),
        ("Argus Gold+ Rated", "Gold+"),
        ("Wyvern Gold", "Gold"),
        ("IS-BAO Platinum", "Platinum"),
        ("Not rated", "Not rated"),
        ("N/A", "Not rated"),
        ("unrated", "Not rated"),
    ],
)
def test_rating_mapped_to_value_only(raw, expected):
    value, known = normalize_rating(raw, TOKENS)
    assert (value, known) == (expected, True)
    assert value in RATING_VALUES


def test_rating_unknown_is_not_rated_and_flagged_and_never_echoes_source():
    value, known = normalize_rating("Wyvern Wingman", TOKENS)
    assert (value, known) == ("Not rated", False)
    value, known = normalize_rating("Diamond", TOKENS)
    assert (value, known) == ("Not rated", False)


def test_rating_blank_means_no_information():
    assert normalize_rating(None, TOKENS) == (None, True)
    assert normalize_rating("  ", TOKENS) == (None, True)


def test_rating_founder_alias_applies_after_source_words_are_stripped():
    assert normalize_rating("Wyvern Wingman", TOKENS, {"wingman": "Gold"}) == ("Gold", True)


def test_rating_output_always_in_allowed_set():
    for raw in ["x", "Platinum Gold", "gold platinum", "silver", "123", "Platinum++"]:
        value, _ = normalize_rating(raw, TOKENS)
        assert value in RATING_VALUES
