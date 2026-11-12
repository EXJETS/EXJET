from exjet_product import matching as M


def req(o, d, pax=4, **kw):
    return M.MissionRequest([M.LegRequest(o, d)], pax, **kw)


def slugs(res):
    return {m.slug for m in res.feasible}


def test_great_circle_teb_vny_is_plausible():
    d = M.great_circle_nm(40.8501, -74.0608, 34.2098, -118.4900)
    assert 2000 < d < 2200


def test_short_hop_everything_with_data_is_nonstop(types, airport_map):
    res = M.match_mission(req("KTEB", "KMDW"), types, airport_map)
    assert {"cj3", "xls", "ch350", "g550"} <= slugs(res)
    assert all(m.stops == 0 and m.fuel_stop_icao is None for m in res.feasible)
    assert res.legs[0].distance_nm and 500 < res.legs[0].distance_nm < 650


def test_missing_type_data_is_not_offered_never_guessed(types, airport_map):
    res = M.match_mission(req("KTEB", "KMDW"), types, airport_map)
    rej = {r.slug: r.reasons for r in res.rejected}
    assert rej["nodata"] == (M.R_MISSING_TYPE_DATA,)
    assert "nodata" not in slugs(res)


def test_transcon_needs_fuel_stop_for_light_jet(types, airport_map):
    res = M.match_mission(req("KTEB", "KVNY", pax=4), types, airport_map)
    cj3 = next(m for m in res.feasible if m.slug == "cj3")
    assert cj3.stops == 1
    assert cj3.fuel_stop_icao in airport_map and cj3.fuel_stop_icao not in ("KTEB", "KVNY")
    stop = airport_map[cj3.fuel_stop_icao]
    assert stop.longest_runway_ft >= 3180
    g = next(m for m in res.feasible if m.slug == "g550")
    assert g.stops == 0


def test_fuel_stop_never_exceeds_max(types, airport_map):
    res = M.match_mission(req("KTEB", "KVNY", pax=4), types, airport_map, max_fuel_stops=0)
    assert "cj3" not in slugs(res)
    rej = {r.slug: r.reasons for r in res.rejected}
    assert M.R_OUT_OF_RANGE in rej["cj3"]


def test_passenger_limit(types, airport_map):
    res = M.match_mission(req("KTEB", "KMDW", pax=10), types, airport_map)
    rej = {r.slug: r.reasons for r in res.rejected}
    assert M.R_TOO_MANY_PAX in rej["cj3"] and M.R_TOO_MANY_PAX in rej["xls"]
    assert "ch350" in slugs(res)


def test_full_cabin_reduces_range():
    assert M.payload_factor(2, 9) == 1.0
    assert M.payload_factor(9, 9) < 1.0
    assert abs(M.payload_factor(9, 9) - (1 - M.MAX_PAYLOAD_RANGE_REDUCTION)) < 1e-9


def test_runway_requirement_adjusts_for_elevation(types, airport_map):
    # Aspen: 8,006 ft at 7,820 ft elevation. XLS needs 3,560 * (1 + .03*7.82) = 4,395 ft -> ok
    res = M.match_mission(req("KDEN", "KASE"), types, airport_map)
    assert "xls" in slugs(res)
    # Santa Monica 3,500 ft: only the CJ3+ (3,180 ft) fits
    res2 = M.match_mission(req("KVNY", "KSMO"), types, airport_map)
    assert slugs(res2) == {"cj3"}
    rej = {r.slug: r.reasons for r in res2.rejected}
    assert all(M.R_RUNWAY_DEST in rej[s] for s in ("xls", "ch350", "g550"))


def test_missing_airport_runway_data_blocks(types, airport_map):
    from dataclasses import replace

    ap = dict(airport_map)
    ap["KASE"] = replace(ap["KASE"], longest_runway_ft=None)
    res = M.match_mission(req("KDEN", "KASE"), types, ap)
    assert not res.feasible
    assert all(M.R_AIRPORT_DATA_MISSING in r.reasons for r in res.rejected if r.slug != "nodata")


def test_baggage_volume(types, airport_map):
    # CJ3+ holds 65 cu ft; 12 checked (60) + 2 golf (12) = 72
    res = M.match_mission(req("KTEB", "KMDW", checked_bags=12, golf_bags=2), types, airport_map)
    rej = {r.slug: r.reasons for r in res.rejected}
    assert M.R_BAGGAGE in rej["cj3"]
    assert "ch350" in slugs(res)
    assert M.baggage_volume_cuft(req("a", "b", checked_bags=1, carry_on_bags=1, golf_bags=1, ski_bags=1)) == 17.0


def test_multi_leg_requires_every_leg(types, airport_map):
    r = M.MissionRequest([M.LegRequest("KTEB", "KMDW"), M.LegRequest("KMDW", "KVNY")], 4)
    res = M.match_mission(r, types, airport_map)
    assert "g550" in slugs(res)
    assert all(len(m.legs) == 2 for m in res.feasible)


def test_unknown_airport(types, airport_map):
    res = M.match_mission(req("KTEB", "KXXX"), types, airport_map)
    assert not res.feasible
    assert all(M.R_AIRPORT_UNKNOWN in r.reasons for r in res.rejected if r.slug != "nodata")


def test_deterministic(types, airport_map):
    a = M.match_mission(req("KTEB", "KVNY"), types, airport_map)
    b = M.match_mission(req("KTEB", "KVNY"), types, airport_map)
    assert a == b
