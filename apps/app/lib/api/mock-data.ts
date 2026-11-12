/**
 * SYNTHETIC seed data for mock mode only. Operators, tails and contacts are fictional.
 * Aircraft type names and US airports are real; numeric type specs are approximate and used only by the mock matcher.
 */
import type { Airport } from "./types";

export const MOCK_AIRPORTS: Airport[] = [
  { icao: "KTEB", iata: "TEB", name: "Teterboro Airport", city: "Teterboro", state: "NJ", elevation_ft: 9, longest_runway_ft: 7000 },
  { icao: "KHPN", iata: "HPN", name: "Westchester County Airport", city: "White Plains", state: "NY", elevation_ft: 439, longest_runway_ft: 6548 },
  { icao: "KJFK", iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", state: "NY", elevation_ft: 13, longest_runway_ft: 14511 },
  { icao: "KBOS", iata: "BOS", name: "General Edward Lawrence Logan International Airport", city: "Boston", state: "MA", elevation_ft: 20, longest_runway_ft: 10083 },
  { icao: "KPBI", iata: "PBI", name: "Palm Beach International Airport", city: "West Palm Beach", state: "FL", elevation_ft: 19, longest_runway_ft: 10008 },
  { icao: "KMIA", iata: "MIA", name: "Miami International Airport", city: "Miami", state: "FL", elevation_ft: 8, longest_runway_ft: 13016 },
  { icao: "KOPF", iata: "OPF", name: "Miami-Opa Locka Executive Airport", city: "Miami", state: "FL", elevation_ft: 8, longest_runway_ft: 8002 },
  { icao: "KPDK", iata: "PDK", name: "DeKalb-Peachtree Airport", city: "Atlanta", state: "GA", elevation_ft: 997, longest_runway_ft: 6001 },
  { icao: "KATL", iata: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", state: "GA", elevation_ft: 1026, longest_runway_ft: 12390 },
  { icao: "KMDW", iata: "MDW", name: "Chicago Midway International Airport", city: "Chicago", state: "IL", elevation_ft: 620, longest_runway_ft: 6522 },
  { icao: "KORD", iata: "ORD", name: "Chicago O'Hare International Airport", city: "Chicago", state: "IL", elevation_ft: 672, longest_runway_ft: 13000 },
  { icao: "KDAL", iata: "DAL", name: "Dallas Love Field", city: "Dallas", state: "TX", elevation_ft: 487, longest_runway_ft: 8800 },
  { icao: "KDFW", iata: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", state: "TX", elevation_ft: 607, longest_runway_ft: 13401 },
  { icao: "KHOU", iata: "HOU", name: "William P. Hobby Airport", city: "Houston", state: "TX", elevation_ft: 46, longest_runway_ft: 7602 },
  { icao: "KAUS", iata: "AUS", name: "Austin-Bergstrom International Airport", city: "Austin", state: "TX", elevation_ft: 542, longest_runway_ft: 12248 },
  { icao: "KAPA", iata: "APA", name: "Centennial Airport", city: "Denver", state: "CO", elevation_ft: 5885, longest_runway_ft: 10000 },
  { icao: "KASE", iata: "ASE", name: "Aspen/Pitkin County Airport", city: "Aspen", state: "CO", elevation_ft: 7820, longest_runway_ft: 8006 },
  { icao: "KEGE", iata: "EGE", name: "Eagle County Regional Airport", city: "Eagle", state: "CO", elevation_ft: 6548, longest_runway_ft: 9000 },
  { icao: "KSDL", iata: "SDL", name: "Scottsdale Airport", city: "Scottsdale", state: "AZ", elevation_ft: 1510, longest_runway_ft: 8249 },
  { icao: "KLAS", iata: "LAS", name: "Harry Reid International Airport", city: "Las Vegas", state: "NV", elevation_ft: 2181, longest_runway_ft: 14512 },
  { icao: "KVNY", iata: "VNY", name: "Van Nuys Airport", city: "Van Nuys", state: "CA", elevation_ft: 802, longest_runway_ft: 8001 },
  { icao: "KLAX", iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", state: "CA", elevation_ft: 128, longest_runway_ft: 12091 },
  { icao: "KSFO", iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", state: "CA", elevation_ft: 13, longest_runway_ft: 11870 },
  { icao: "KSNA", iata: "SNA", name: "John Wayne Airport", city: "Santa Ana", state: "CA", elevation_ft: 56, longest_runway_ft: 5701 },
  { icao: "KTEX", iata: "TEX", name: "Telluride Regional Airport", city: "Telluride", state: "CO", elevation_ft: 9078, longest_runway_ft: 7111 },
  { icao: "KSEA", iata: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", state: "WA", elevation_ft: 433, longest_runway_ft: 11901 },
  { icao: "KBFI", iata: "BFI", name: "Boeing Field/King County International Airport", city: "Seattle", state: "WA", elevation_ft: 21, longest_runway_ft: 10000 },
  { icao: "KIAD", iata: "IAD", name: "Washington Dulles International Airport", city: "Washington", state: "DC", elevation_ft: 313, longest_runway_ft: 11500 },
  { icao: "MMSD", iata: "SJD", name: "Los Cabos International Airport", city: "San Jose del Cabo", state: "BCS", elevation_ft: 359, longest_runway_ft: 10171 },
];

export interface MockType {
  slug: string;
  manufacturer: string;
  model: string;
  category: string;
  max_passengers: number;
  range_nm: number;
  cruise_speed_kts: number;
  min_runway_ft: number;
  baggage_cuft: number;
}

export const MOCK_CATEGORIES = [
  { category: "light", name: "Light jets" },
  { category: "midsize", name: "Midsize jets" },
  { category: "super_midsize", name: "Super midsize jets" },
  { category: "large", name: "Large jets" },
  { category: "ultra_long_range", name: "Ultra long range jets" },
];

export const MOCK_TYPES: MockType[] = [
  { slug: "cessna-citation-cj3-plus", manufacturer: "Cessna", model: "Citation CJ3+", category: "light", max_passengers: 7, range_nm: 1900, cruise_speed_kts: 416, min_runway_ft: 3500, baggage_cuft: 65 },
  { slug: "embraer-phenom-300e", manufacturer: "Embraer", model: "Phenom 300E", category: "light", max_passengers: 8, range_nm: 2010, cruise_speed_kts: 453, min_runway_ft: 3700, baggage_cuft: 66 },
  { slug: "cessna-citation-latitude", manufacturer: "Cessna", model: "Citation Latitude", category: "midsize", max_passengers: 9, range_nm: 2700, cruise_speed_kts: 446, min_runway_ft: 3600, baggage_cuft: 127 },
  { slug: "hawker-800xp", manufacturer: "Hawker", model: "Hawker 800XP", category: "midsize", max_passengers: 8, range_nm: 2300, cruise_speed_kts: 447, min_runway_ft: 5000, baggage_cuft: 50 },
  { slug: "bombardier-challenger-350", manufacturer: "Bombardier", model: "Challenger 350", category: "super_midsize", max_passengers: 10, range_nm: 3200, cruise_speed_kts: 470, min_runway_ft: 4800, baggage_cuft: 106 },
  { slug: "cessna-citation-longitude", manufacturer: "Cessna", model: "Citation Longitude", category: "super_midsize", max_passengers: 12, range_nm: 3500, cruise_speed_kts: 476, min_runway_ft: 5400, baggage_cuft: 112 },
  { slug: "gulfstream-g450", manufacturer: "Gulfstream", model: "G450", category: "large", max_passengers: 16, range_nm: 4350, cruise_speed_kts: 476, min_runway_ft: 5600, baggage_cuft: 169 },
  { slug: "dassault-falcon-7x", manufacturer: "Dassault", model: "Falcon 7X", category: "large", max_passengers: 14, range_nm: 5950, cruise_speed_kts: 480, min_runway_ft: 5500, baggage_cuft: 140 },
  { slug: "bombardier-global-7500", manufacturer: "Bombardier", model: "Global 7500", category: "ultra_long_range", max_passengers: 19, range_nm: 7700, cruise_speed_kts: 488, min_runway_ft: 5800, baggage_cuft: 195 },
];

export const MOCK_OPERATORS = [
  { id: "op_syn_a", dba_name: "SYNTHETIC Test Operator A", certificate_type: "Part 135", contact: { name: "SYNTHETIC Dispatcher A", title: "Dispatch", email: "dispatch-a@example.com", phone: "+1 555 010 0001" } },
  { id: "op_syn_b", dba_name: "SYNTHETIC Test Operator B", certificate_type: "Part 135", contact: { name: "SYNTHETIC Dispatcher B", title: "Charter desk", email: "charter-b@example.com", phone: "+1 555 010 0002" } },
  { id: "op_syn_c", dba_name: "SYNTHETIC Test Operator C", certificate_type: "Part 135", contact: { name: "SYNTHETIC Dispatcher C", title: "Operations", email: "ops-c@example.com", phone: "+1 555 010 0003" } },
];

// [type slug, operator index, home city, seats, year, refurb, rating, amenities]
export const MOCK_LISTING_SEED: [string, number, string, number, number, number | null, string, string[]][] = [
  ["cessna-citation-cj3-plus", 0, "Dallas", 7, 2016, null, "Gold", ["Wi-Fi"]],
  ["cessna-citation-cj3-plus", 1, "Atlanta", 6, 2013, 2021, "Not rated", []],
  ["embraer-phenom-300e", 0, "Teterboro", 7, 2020, null, "Platinum", ["Wi-Fi", "Refreshment center"]],
  ["embraer-phenom-300e", 2, "Van Nuys", 8, 2018, null, "Gold+", ["Wi-Fi"]],
  ["cessna-citation-latitude", 1, "Scottsdale", 8, 2019, null, "Gold", ["Wi-Fi", "Flat floor"]],
  ["cessna-citation-latitude", 0, "Chicago", 9, 2017, 2023, "Platinum+", ["Wi-Fi"]],
  ["hawker-800xp", 2, "Houston", 8, 2005, 2019, "Not rated", []],
  ["bombardier-challenger-350", 0, "Teterboro", 9, 2018, null, "Platinum", ["Wi-Fi", "Enclosed lavatory"]],
  ["bombardier-challenger-350", 1, "Los Angeles", 9, 2021, null, "Platinum+", ["Wi-Fi", "Enclosed lavatory"]],
  ["bombardier-challenger-350", 2, "Miami", 10, 2015, 2022, "Gold+", ["Wi-Fi"]],
  ["cessna-citation-longitude", 1, "Denver", 12, 2022, null, "Platinum", ["Wi-Fi"]],
  ["gulfstream-g450", 0, "West Palm Beach", 14, 2010, 2020, "Gold", ["Wi-Fi", "Shower"]],
  ["dassault-falcon-7x", 2, "Teterboro", 12, 2014, 2022, "Gold+", ["Wi-Fi"]],
  ["bombardier-global-7500", 1, "Las Vegas", 17, 2022, null, "Platinum+", ["Wi-Fi", "Four living areas"]],
];

/** IANA zone per mock airport (real zones). */
export const MOCK_TZ: Record<string, string> = {
  KTEB: "America/New_York", KHPN: "America/New_York", KJFK: "America/New_York", KBOS: "America/New_York", KPBI: "America/New_York",
  KMIA: "America/New_York", KOPF: "America/New_York", KPDK: "America/New_York", KATL: "America/New_York", KIAD: "America/New_York",
  KMDW: "America/Chicago", KORD: "America/Chicago", KDAL: "America/Chicago", KDFW: "America/Chicago", KHOU: "America/Chicago", KAUS: "America/Chicago",
  KAPA: "America/Denver", KASE: "America/Denver", KEGE: "America/Denver", KTEX: "America/Denver", KSDL: "America/Phoenix",
  KLAS: "America/Los_Angeles", KVNY: "America/Los_Angeles", KLAX: "America/Los_Angeles", KSFO: "America/Los_Angeles", KSNA: "America/Los_Angeles",
  KSEA: "America/Los_Angeles", KBFI: "America/Los_Angeles", MMSD: "America/Mazatlan",
};
