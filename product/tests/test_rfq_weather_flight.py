from datetime import UTC, datetime, timedelta

from exjet_product import flight_watch as F
from exjet_product import rfq as R
from exjet_product import weather as W


def ctx(**kw):
    leg = R.RfqLeg("KTEB", "Teterboro Airport", "KVNY", "Van Nuys Airport", datetime(2026, 11, 13, 14, 0, tzinfo=UTC), "America/New_York")
    base = dict(reference="EXJ-ABC234", legs=(leg,), passengers=6, checked_bags=4, carry_on_bags=0, golf_bags=2, ski_bags=0,
                member_name="Jane Q. Member", aircraft_type="Cessna Citation XLS+")
    base.update(kw)
    return R.RfqContext(**base)


def test_reference_format_and_extraction():
    ref = R.generate_reference()
    assert R.REFERENCE_RE.fullmatch(ref)
    assert all(ch not in ref[4:] for ch in "0O1IL")
    assert R.extract_reference(f"Re: [{ref}] Charter request") == ref
    assert R.extract_reference("no token here") is None
    assert R.extract_reference("re: exj-abc234 quote") == "EXJ-ABC234"
    assert len({R.generate_reference() for _ in range(200)}) == 200


def test_rfq_email_content():
    subject, body = R.build_rfq_email(ctx())
    assert "EXJ-ABC234" in subject and "KTEB" in subject and "KVNY" in subject
    for needle in ("Teterboro Airport (KTEB)", "Van Nuys Airport (KVNY)", "Passengers: 6", "4 checked bags", "2 golf bags",
                   "PDF", "charter agreement", "Jane Q. Member", "payment link", "does not collect or process flight payments"):
        assert needle.lower() in body.lower(), needle
    assert "$" not in body  # no prices anywhere
    assert all(ord(c) < 0x2600 for c in body)  # no emoji
    assert "09:00 EST" in body  # departure shown in airport-local time


def test_free_text_is_cleaned():
    assert R.clean_free_text("hello\x00 \x07world\n\n  there") == "hello world there"
    assert len(R.clean_free_text("x" * 5000)) == R.MAX_FREE_TEXT


def test_ground_email():
    s, b = R.build_ground_rfq_email(R.GroundRfqContext("EXJ-ABC234", "chauffeur", "KVNY", "Van Nuys Airport",
                                                      datetime(2026, 11, 13, 20, 0, tzinfo=UTC), "America/Los_Angeles",
                                                      "Test FBO", "Jane Member", "3 passengers, 4 bags"))
    assert "Chauffeur" in s and "EXJ-ABC234" in s and "3 passengers" in b


def test_metar_parse_and_category():
    m = W.parse_metar("KTEB 121951Z 27010G18KT 10SM FEW050 BKN250 12/04 A3002 RMK AO2")
    assert (m.station, m.wind_dir, m.wind_kts, m.gust_kts, m.visibility_sm, m.ceiling_ft, m.flight_category) == (
        "KTEB", 270, 10, 18, 10.0, 25000, "VFR")
    assert W.parse_metar("KJFK 011200Z 18005KT 1 1/2SM BR OVC008 10/10 A2990").flight_category == "IFR"
    assert W.parse_metar("KJFK 011200Z VRB03KT 1/4SM FG VV002 10/10 A2990").flight_category == "LIFR"
    assert W.parse_metar("KJFK 011200Z 18005KT 4SM HZ SCT020 10/10 A2990").flight_category == "MVFR"
    assert W.flight_category(None, None) is None


def test_weather_summary():
    s = W.summarize_leg("KTEB", "KTEB 011200Z 18005KT 10SM FEW050 10/10 A2990", "KVNY", "KVNY 011200Z 18005KT 2SM BR OVC008 A2990")
    assert "KTEB: VFR" in s and "KVNY: IFR" in s and "Instrument conditions" in s
    assert "no observation" in W.summarize_leg("KTEB", None, "KVNY", None)


def test_flight_status_derivation():
    assert F.derive_trip_status("scheduled", ["airborne"]) == "in_flight"
    assert F.derive_trip_status("in_flight", ["landed", "landed"]) == "completed"
    assert F.derive_trip_status("in_flight", ["landed", "scheduled"]) == "in_flight"
    assert F.derive_trip_status("scheduled", ["scheduled"]) == "scheduled"
    assert F.derive_trip_status("cancelled", ["airborne"]) == "cancelled"


def test_watch_schedule():
    dep = datetime(2026, 11, 13, 14, 0, tzinfo=UTC)
    assert F.next_watch_at(dep - timedelta(hours=10), dep, dep, "scheduled") == dep - timedelta(hours=2)
    assert F.next_watch_at(dep, dep, dep, "in_flight") == dep + F.ACTIVE_INTERVAL
    assert F.next_watch_at(dep, dep, dep, "completed") is None
    assert F.next_watch_at(dep + timedelta(days=2), dep, dep, "in_flight") is None
