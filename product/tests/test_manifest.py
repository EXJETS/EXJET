from datetime import UTC, date, datetime

from exjet_product import manifest as M


def pax(**kw):
    base = dict(full_name="Test Person", date_of_birth="1980-01-01", id_type="real_id", id_number="X123",
                id_expiry=date(2030, 1, 1), id_issuer="NJ")
    base.update(kw)
    return M.PassengerInput(**base)


def test_required_id_type():
    assert M.required_id_type([False, False]) == "real_id"
    assert M.required_id_type([False, True]) == "passport"
    assert M.required_id_type([]) == "real_id"


def test_due_and_reminders():
    dep = datetime(2026, 12, 1, 15, 0, tzinfo=UTC)
    assert M.compute_due_at(dep) == datetime(2026, 11, 30, 15, 0, tzinfo=UTC)
    r = M.reminder_times(dep)
    assert r == [datetime(2026, 11, 29, 15, 0, tzinfo=UTC), datetime(2026, 11, 30, 13, 0, tzinfo=UTC)]


def test_valid_manifest():
    assert M.validate_manifest([pax(), pax()], 2, "real_id", date(2026, 12, 1), date(2026, 11, 12)) == {}


def test_wrong_id_type_domestic_requires_real_id():
    errs = M.validate_manifest([pax(id_type="passport")], 1, "real_id", date(2026, 12, 1), date(2026, 11, 12))
    assert errs == {0: [M.E_ID_TYPE]}


def test_international_requires_passport():
    errs = M.validate_manifest([pax()], 1, "passport", date(2026, 12, 1), date(2026, 11, 12))
    assert M.E_ID_TYPE in errs[0]


def test_count_expiry_dob_missing_fields():
    errs = M.validate_manifest([pax(id_expiry=date(2026, 11, 30)), pax(date_of_birth="2099-01-01", full_name=" ", id_number="")],
                               3, "real_id", date(2026, 12, 1), date(2026, 11, 12))
    assert errs[-1] == [M.E_COUNT]
    assert errs[0] == [M.E_ID_EXPIRED]
    assert set(errs[1]) == {M.E_DOB, M.E_NAME, M.E_ID_NUMBER}
