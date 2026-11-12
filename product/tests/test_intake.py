from datetime import date

from exjet_product.intake import parse_bags, parse_date, parse_time, parse_trip_request

EXAMPLE = ("Teterboro to Van Nuys next Friday 9am, 6 passengers, 4 checked bags and 2 golf bags, "
           "returning Sunday")


def test_spec_example(airports, now):
    d = parse_trip_request(EXAMPLE, airports, now)
    assert d.trip_type == "round_trip"
    assert [(l.origin_icao, l.destination_icao) for l in d.legs] == [("KTEB", "KVNY"), ("KVNY", "KTEB")]
    out = d.legs[0]
    assert out.depart_date == date(2026, 11, 13)  # nearest Friday after Thursday 2026-11-12
    assert out.depart_at.isoformat() == "2026-11-13T09:00:00-05:00"
    assert d.passengers == 6 and d.checked_bags == 4 and d.golf_bags == 2
    assert d.legs[1].depart_date == date(2026, 11, 15)  # Sunday after the outbound
    assert d.legs[1].depart_at is None  # no return time given: unresolved, not guessed
    assert d.unresolved == ["legs[1].depart_at"]
    assert any("next friday" in n.lower() for n in d.notes)
    assert 0.8 < d.confidence < 1


def test_return_time_resolved(airports, now):
    d = parse_trip_request(EXAMPLE + " at 4pm", airports, now)
    assert d.legs[1].depart_at.isoformat() == "2026-11-15T16:00:00-08:00"  # local time at Van Nuys
    assert d.unresolved == []
    assert d.confidence == 1.0


def test_icao_and_iata(airports, now):
    d = parse_trip_request("KTEB to KLAX tomorrow 8:30am 3 pax", airports, now)
    assert d.legs[0].origin_icao == "KTEB" and d.legs[0].destination_icao == "KLAX"
    assert d.passengers == 3 and d.legs[0].depart_at.hour == 8 and d.legs[0].depart_at.minute == 30
    d2 = parse_trip_request("TEB to VNY on 12/5 at 2 pm for 4 passengers", airports, now)
    assert d2.legs[0].destination_icao == "KVNY"
    assert d2.legs[0].depart_date == date(2026, 12, 5)
    assert d2.legs[0].depart_at.hour == 14


def test_from_to_order(airports, now):
    d = parse_trip_request("fly to Van Nuys from Teterboro tomorrow 9am 2 passengers", airports, now)
    assert d.legs[0].origin_icao == "KTEB" and d.legs[0].destination_icao == "KVNY"


def test_ambiguous_city_is_unresolved_with_candidates(airports, now):
    d = parse_trip_request("New York to Los Angeles tomorrow 9am, 2 passengers", airports, now)
    assert "legs[0].origin_icao" in d.unresolved
    assert set(d.candidates["legs[0].origin_icao"]) == {"KJFK", "KLGA"}
    assert d.legs[0].destination_icao == "KLAX"


def test_missing_everything_is_unresolved(airports, now):
    d = parse_trip_request("I need a jet sometime soon", airports, now)
    assert d.passengers is None
    assert set(d.unresolved) >= {"legs[0].origin_icao", "legs[0].destination_icao", "legs[0].depart_at", "passengers"}
    assert d.confidence == 0


def test_ambiguous_time_not_guessed(airports, now):
    d = parse_trip_request("Teterboro to Van Nuys tomorrow at 9, 2 passengers", airports, now)
    assert d.legs[0].depart_at is None
    assert "legs[0].depart_at" in d.unresolved


def test_multi_leg_chain(airports, now):
    d = parse_trip_request("Teterboro to Chicago Midway to Van Nuys Friday 7am 5 pax", airports, now)
    assert d.trip_type == "multi_leg"
    assert [(l.origin_icao, l.destination_icao) for l in d.legs] == [("KTEB", "KMDW"), ("KMDW", "KVNY")]
    assert "legs[1].depart_at" in d.unresolved


def test_number_words_and_bags():
    assert parse_bags("two golf bags, three carry-ons and 5 suitcases, one set of skis") == {
        "checked_bags": 5, "carry_on_bags": 3, "golf_bags": 2, "ski_bags": 1}
    assert parse_bags("no luggage") == {"checked_bags": 0, "carry_on_bags": 0, "golf_bags": 0, "ski_bags": 0}


def test_passengers_variants(airports, now):
    assert parse_trip_request("TEB to VNY tomorrow 9am, six people", airports, now).passengers == 6
    assert parse_trip_request("TEB to VNY tomorrow 9am, party of 4", airports, now).passengers == 4
    d = parse_trip_request("TEB to VNY tomorrow 9am, just me", airports, now)
    assert d.passengers == 1 and any("just me" in n for n in d.notes)


def test_date_and_time_helpers(now):
    base = date(2026, 11, 12)
    notes = []
    assert parse_date("on dec 25", base, notes) == date(2026, 12, 25)
    assert parse_date("January 3rd", base, notes) == date(2027, 1, 3)  # rolls to next year
    assert parse_date("today", base, notes) == base
    assert parse_date("in 3 days", base, notes) == date(2026, 11, 15)
    assert parse_date("this friday", base, notes) == date(2026, 11, 13)
    assert parse_date("nothing here", base, notes) is None
    assert parse_time("9am")[0].hour == 9
    assert parse_time("12 pm")[0].hour == 12 and parse_time("12am")[0].hour == 0
    assert parse_time("noon")[0].hour == 12
    assert parse_time("depart 18:45")[0].minute == 45
    assert parse_time("at 9") == (None, True)
