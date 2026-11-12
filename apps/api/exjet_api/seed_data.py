"""Reference data for dev and tests.

AIRPORTS and AIRCRAFT_TYPES are public facts (airport identifiers, coordinates, field elevation,
longest runway; manufacturer-published aircraft specifications). They were entered by hand and
are approximate for aircraft: VERIFY against FAA NASR (airports) and manufacturer spec sheets
before any production use. Fields not known with confidence are left None, never guessed.

OPERATORS, AIRCRAFT and EMPTY_LEGS are CLEARLY SYNTHETIC test doubles. Names start with
"SYNTHETIC", tails look like N00TST1, emails use example.com. They must never be loaded outside
dev/test (seed_dev refuses staging and prod).
"""
from __future__ import annotations

# icao, iata, name, city, state, lat, lon, elevation_ft, longest_runway_ft, timezone
AIRPORTS: list[tuple] = [
    ("KTEB", "TEB", "Teterboro Airport", "Teterboro", "NJ", 40.8501, -74.0608, 9, 6013, "America/New_York"),
    ("KVNY", "VNY", "Van Nuys Airport", "Van Nuys", "CA", 34.2098, -118.4900, 802, 8001, "America/Los_Angeles"),
    ("KLAX", "LAX", "Los Angeles International Airport", "Los Angeles", "CA", 33.9425, -118.4081, 128, 12091, "America/Los_Angeles"),
    ("KJFK", "JFK", "John F. Kennedy International Airport", "New York", "NY", 40.6398, -73.7789, 13, 14511, "America/New_York"),
    ("KLGA", "LGA", "LaGuardia Airport", "New York", "NY", 40.7772, -73.8726, 21, 7003, "America/New_York"),
    ("KEWR", "EWR", "Newark Liberty International Airport", "Newark", "NJ", 40.6925, -74.1687, 18, 11000, "America/New_York"),
    ("KHPN", "HPN", "Westchester County Airport", "White Plains", "NY", 41.0670, -73.7076, 439, 6548, "America/New_York"),
    ("KMMU", "MMU", "Morristown Municipal Airport", "Morristown", "NJ", 40.7994, -74.4149, 187, 5998, "America/New_York"),
    ("KBOS", "BOS", "Boston Logan International Airport", "Boston", "MA", 42.3643, -71.0052, 20, 10083, "America/New_York"),
    ("KBED", "BED", "Laurence G. Hanscom Field", "Bedford", "MA", 42.4700, -71.2890, 133, 7011, "America/New_York"),
    ("KACK", "ACK", "Nantucket Memorial Airport", "Nantucket", "MA", 41.2531, -70.0600, 48, 6303, "America/New_York"),
    ("KDCA", "DCA", "Ronald Reagan Washington National Airport", "Washington", "DC", 38.8521, -77.0377, 15, 7169, "America/New_York"),
    ("KIAD", "IAD", "Washington Dulles International Airport", "Dulles", "VA", 38.9445, -77.4558, 313, 11500, "America/New_York"),
    ("KPHL", "PHL", "Philadelphia International Airport", "Philadelphia", "PA", 39.8719, -75.2411, 36, 12000, "America/New_York"),
    ("KCLT", "CLT", "Charlotte Douglas International Airport", "Charlotte", "NC", 35.2140, -80.9431, 748, 10000, "America/New_York"),
    ("KATL", "ATL", "Hartsfield-Jackson Atlanta International Airport", "Atlanta", "GA", 33.6367, -84.4281, 1026, 12390, "America/New_York"),
    ("KPDK", "PDK", "DeKalb-Peachtree Airport", "Atlanta", "GA", 33.8756, -84.3020, 1003, 6001, "America/New_York"),
    ("KMIA", "MIA", "Miami International Airport", "Miami", "FL", 25.7932, -80.2906, 8, 13016, "America/New_York"),
    ("KOPF", "OPF", "Miami-Opa Locka Executive Airport", "Miami", "FL", 25.9070, -80.2784, 8, 8002, "America/New_York"),
    ("KPBI", "PBI", "Palm Beach International Airport", "West Palm Beach", "FL", 26.6832, -80.0956, 19, 10008, "America/New_York"),
    ("KTPA", "TPA", "Tampa International Airport", "Tampa", "FL", 27.9755, -82.5332, 26, 11002, "America/New_York"),
    ("KORD", "ORD", "Chicago O'Hare International Airport", "Chicago", "IL", 41.9786, -87.9048, 672, 13000, "America/Chicago"),
    ("KMDW", "MDW", "Chicago Midway International Airport", "Chicago", "IL", 41.7868, -87.7522, 620, 6522, "America/Chicago"),
    ("KPWK", "PWK", "Chicago Executive Airport", "Wheeling", "IL", 42.1142, -87.9015, 647, 5001, "America/Chicago"),
    ("KSTL", "STL", "St. Louis Lambert International Airport", "St. Louis", "MO", 38.7487, -90.3700, 618, 11019, "America/Chicago"),
    ("KDAL", "DAL", "Dallas Love Field", "Dallas", "TX", 32.8471, -96.8518, 487, 8800, "America/Chicago"),
    ("KDFW", "DFW", "Dallas/Fort Worth International Airport", "Dallas", "TX", 32.8998, -97.0403, 607, 13401, "America/Chicago"),
    ("KHOU", "HOU", "William P. Hobby Airport", "Houston", "TX", 29.6454, -95.2789, 46, 7602, "America/Chicago"),
    ("KAUS", "AUS", "Austin-Bergstrom International Airport", "Austin", "TX", 30.1975, -97.6664, 542, 12250, "America/Chicago"),
    ("KDEN", "DEN", "Denver International Airport", "Denver", "CO", 39.8617, -104.6731, 5434, 16000, "America/Denver"),
    ("KAPA", "APA", "Centennial Airport", "Englewood", "CO", 39.5701, -104.8493, 5885, 10001, "America/Denver"),
    ("KASE", "ASE", "Aspen-Pitkin County Airport", "Aspen", "CO", 39.2232, -106.8688, 7820, 8006, "America/Denver"),
    ("KEGE", "EGE", "Eagle County Regional Airport", "Eagle", "CO", 39.6426, -106.9177, 6548, 8000, "America/Denver"),
    ("KSLC", "SLC", "Salt Lake City International Airport", "Salt Lake City", "UT", 40.7884, -111.9778, 4227, 12003, "America/Denver"),
    ("KLAS", "LAS", "Harry Reid International Airport", "Las Vegas", "NV", 36.0840, -115.1537, 2181, 14515, "America/Los_Angeles"),
    ("KPHX", "PHX", "Phoenix Sky Harbor International Airport", "Phoenix", "AZ", 33.4343, -112.0116, 1135, 11489, "America/Phoenix"),
    ("KSDL", "SDL", "Scottsdale Airport", "Scottsdale", "AZ", 33.6229, -111.9105, 1510, 8249, "America/Phoenix"),
    ("KSAN", "SAN", "San Diego International Airport", "San Diego", "CA", 32.7336, -117.1897, 17, 9401, "America/Los_Angeles"),
    ("KSFO", "SFO", "San Francisco International Airport", "San Francisco", "CA", 37.6189, -122.3750, 13, 11870, "America/Los_Angeles"),
    ("KSEA", "SEA", "Seattle-Tacoma International Airport", "Seattle", "WA", 47.4502, -122.3088, 432, 11901, "America/Los_Angeles"),
    ("KJAC", "JAC", "Jackson Hole Airport", "Jackson", "WY", 43.6073, -110.7377, 6451, 6300, "America/Denver"),
]

# slug, manufacturer, model, category, max_pax, range_nm, cruise_kts, min_runway_ft, baggage_cuft, cabin L/W/H (ft), icao code
# Published manufacturer figures, approximate. min_runway_ft = takeoff field length, ISA sea level, as published.
AIRCRAFT_TYPES: list[tuple] = [
    ("pilatus-pc-12-ngx", "Pilatus", "PC-12 NGX", "turboprop", 9, 1803, 290, 2485, 40.0, (16.9, 5.0, 4.8), "PC12"),
    ("embraer-phenom-100ev", "Embraer", "Phenom 100EV", "very_light", 8, 1178, 405, 3125, 66.0, None, "E50P"),
    ("cessna-citation-cj3-plus", "Cessna", "Citation CJ3+", "light", 9, 2040, 416, 3180, 65.0, (15.5, 4.8, 4.8), "C25B"),
    ("embraer-phenom-300e", "Embraer", "Phenom 300E", "light", 10, 2010, 453, 3200, 84.0, (17.2, 5.1, 4.9), "E55P"),
    ("cessna-citation-xls-plus", "Cessna", "Citation XLS+", "midsize", 9, 1858, 441, 3560, 80.0, (18.5, 5.7, 5.7), "C56X"),
    ("cessna-citation-latitude", "Cessna", "Citation Latitude", "midsize", 9, 2700, 446, 3580, 127.0, (21.9, 6.4, 6.0), "C68A"),
    ("bombardier-challenger-350", "Bombardier", "Challenger 350", "super_midsize", 10, 3200, 470, 4835, 106.0, (25.0, 7.2, 6.0), "CL30"),
    ("embraer-praetor-600", "Embraer", "Praetor 600", "super_midsize", 12, 4018, 466, 4222, 155.0, None, "E550"),
    ("bombardier-challenger-650", "Bombardier", "Challenger 650", "heavy", 12, 4000, 459, 5640, 115.0, None, "CL60"),
    ("dassault-falcon-7x", "Dassault", "Falcon 7X", "heavy", 14, 5950, 488, 5710, 140.0, None, "FA7X"),
    ("gulfstream-g450", "Gulfstream", "G450", "heavy", 16, 4350, 476, 5000, 169.0, (45.1, 7.2, 6.2), "GLF4"),
    ("gulfstream-g550", "Gulfstream", "G550", "ultra_long_range", 19, 6750, 488, 5910, 226.0, (50.1, 7.3, 6.2), "GLF5"),
    ("bombardier-global-6000", "Bombardier", "Global 6000", "ultra_long_range", 17, 6000, 488, 6000, 195.0, None, "GLEX"),
]

# --- SYNTHETIC fixtures -------------------------------------------------------------------------
# key, dba_name, certificate_number, safety_rating, go_live ("live" | "draft"), is_excluded, base icao
OPERATORS: list[tuple] = [
    ("A", "SYNTHETIC Test Operator A", "SYNTH-A", "Platinum", "live", False, "KTEB"),
    ("B", "SYNTHETIC Test Operator B", "SYNTH-B", "Gold", "draft", False, "KVNY"),
    ("C", "SYNTHETIC Test Operator C", "SYNTH-C", "Gold+", "live", False, "KDAL"),
    ("X", "SYNTHETIC Excluded Operator", "SYNTH-X", "Not rated", "live", True, "KMIA"),
]
# Payment hosts an admin has "approved" for the synthetic operators, so the dev loop (and the e2e test, whose PDFs link to
# pay.example.com) runs. Real operators get their hosts at onboarding or on first quote review; none are invented.
SYNTHETIC_PAYMENT_HOSTS: list[str] = ["pay.example.com"]
# tail, operator key, type slug, year, refurbished, seats, home icao, amenities
AIRCRAFT: list[tuple] = [
    ("N00TST1", "A", "cessna-citation-xls-plus", 2016, 2022, 8, "KTEB", ["wifi", "lavatory"]),
    ("N00TST2", "A", "bombardier-challenger-350", 2019, None, 9, "KTEB", ["wifi", "galley"]),
    ("N00TST3", "A", "gulfstream-g550", 2012, 2021, 14, "KHPN", ["wifi", "galley", "shower"]),
    ("N00TST4", "B", "cessna-citation-cj3-plus", 2018, None, 7, "KVNY", ["lavatory"]),
    ("N00TST5", "C", "embraer-phenom-300e", 2020, None, 7, "KDAL", ["wifi"]),
    ("N00TST6", "C", "cessna-citation-latitude", 2021, None, 8, "KDAL", ["wifi", "galley"]),
    ("N00TST7", "X", "cessna-citation-xls-plus", 2015, None, 8, "KMIA", ["wifi"]),
]
CONTACTS: dict[str, list[tuple]] = {
    "A": [("Test Contact A1", "Charter Desk", "ops-a@example.com", "+1-555-0100")],
    "B": [("Test Contact B1", "Charter Desk", "ops-b@example.com", "+1-555-0101")],
    "C": [("Test Contact C1", "Charter Desk", "ops-c@example.com", "+1-555-0102")],
    "X": [("Test Contact X1", "Charter Desk", "ops-x@example.com", "+1-555-0103")],
}
# tail, origin, destination, days_from_now_start, window_days
EMPTY_LEGS: list[tuple] = [
    ("N00TST1", "KTEB", "KPBI", 7, 3),
    ("N00TST5", "KDAL", "KAUS", 10, 2),
]

# icao, name, phone, email. CLEARLY SYNTHETIC (example.com, 555 numbers) so the ground-request flow works in dev without an
# ingest step. Real FBOs come from the founder's airports_fbos file.
FBOS: list[tuple] = [
    ("KTEB", "SYNTHETIC FBO A", "+1-555-0150", "fbo-a-kteb@example.com"),
    ("KTEB", "SYNTHETIC FBO B", "+1-555-0151", "fbo-b-kteb@example.com"),
    ("KMDW", "SYNTHETIC FBO A", "+1-555-0152", "fbo-a-kmdw@example.com"),
    ("KVNY", "SYNTHETIC FBO A", "+1-555-0153", "fbo-a-kvny@example.com"),
    ("KDAL", "SYNTHETIC FBO A", "+1-555-0154", "fbo-a-kdal@example.com"),
    ("KPBI", "SYNTHETIC FBO A", "+1-555-0155", "fbo-a-kpbi@example.com"),
    ("KHPN", "SYNTHETIC FBO A", "+1-555-0156", "fbo-a-khpn@example.com"),
]
