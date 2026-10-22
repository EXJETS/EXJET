import type { Airport } from "@/lib/types";

// Business-aviation airports (FBO-friendly fields preferred over airline hubs).
export const AIRPORTS: Airport[] = [
  // North America
  { code: "KTEB", iata: "TEB", name: "Teterboro", city: "New York", country: "US", region: "north-america", lat: 40.8501, lng: -74.0608 },
  { code: "KHPN", iata: "HPN", name: "Westchester County", city: "White Plains", country: "US", region: "north-america", lat: 41.067, lng: -73.7076 },
  { code: "KBOS", iata: "BOS", name: "Boston Logan", city: "Boston", country: "US", region: "north-america", lat: 42.3656, lng: -71.0096 },
  { code: "KIAD", iata: "IAD", name: "Washington Dulles", city: "Washington, D.C.", country: "US", region: "north-america", lat: 38.9531, lng: -77.4565 },
  { code: "KPBI", iata: "PBI", name: "Palm Beach International", city: "Palm Beach", country: "US", region: "north-america", lat: 26.6832, lng: -80.0956 },
  { code: "KOPF", iata: "OPF", name: "Miami-Opa Locka Executive", city: "Miami", country: "US", region: "north-america", lat: 25.907, lng: -80.2784 },
  { code: "KAPF", iata: "APF", name: "Naples Municipal", city: "Naples", country: "US", region: "north-america", lat: 26.1526, lng: -81.7753 },
  { code: "KPDK", iata: "PDK", name: "DeKalb-Peachtree", city: "Atlanta", country: "US", region: "north-america", lat: 33.8756, lng: -84.302 },
  { code: "KMDW", iata: "MDW", name: "Chicago Midway", city: "Chicago", country: "US", region: "north-america", lat: 41.7868, lng: -87.7522 },
  { code: "KDAL", iata: "DAL", name: "Dallas Love Field", city: "Dallas", country: "US", region: "north-america", lat: 32.8471, lng: -96.8518 },
  { code: "KHOU", iata: "HOU", name: "William P. Hobby", city: "Houston", country: "US", region: "north-america", lat: 29.6454, lng: -95.2789 },
  { code: "KAUS", iata: "AUS", name: "Austin-Bergstrom", city: "Austin", country: "US", region: "north-america", lat: 30.1975, lng: -97.6664 },
  { code: "KAPA", iata: "APA", name: "Centennial", city: "Denver", country: "US", region: "north-america", lat: 39.5701, lng: -104.849 },
  { code: "KASE", iata: "ASE", name: "Aspen/Pitkin County", city: "Aspen", country: "US", region: "north-america", lat: 39.2232, lng: -106.8688 },
  { code: "KEGE", iata: "EGE", name: "Eagle County Regional", city: "Vail", country: "US", region: "north-america", lat: 39.6426, lng: -106.9177 },
  { code: "KSUN", iata: "SUN", name: "Friedman Memorial", city: "Sun Valley", country: "US", region: "north-america", lat: 43.5044, lng: -114.2962 },
  { code: "KJAC", iata: "JAC", name: "Jackson Hole", city: "Jackson", country: "US", region: "north-america", lat: 43.6073, lng: -110.7377 },
  { code: "KSDL", iata: "SCF", name: "Scottsdale", city: "Scottsdale", country: "US", region: "north-america", lat: 33.6229, lng: -111.9105 },
  { code: "KLAS", iata: "LAS", name: "Harry Reid International", city: "Las Vegas", country: "US", region: "north-america", lat: 36.084, lng: -115.1537 },
  { code: "KVNY", iata: "VNY", name: "Van Nuys", city: "Los Angeles", country: "US", region: "north-america", lat: 34.2098, lng: -118.4897 },
  { code: "KSNA", iata: "SNA", name: "John Wayne", city: "Orange County", country: "US", region: "north-america", lat: 33.6757, lng: -117.8682 },
  { code: "KSAN", iata: "SAN", name: "San Diego International", city: "San Diego", country: "US", region: "north-america", lat: 32.7338, lng: -117.1933 },
  { code: "KSJC", iata: "SJC", name: "San José Mineta", city: "San Jose", country: "US", region: "north-america", lat: 37.3626, lng: -121.929 },
  { code: "KTRK", iata: "TKF", name: "Truckee Tahoe", city: "Lake Tahoe", country: "US", region: "north-america", lat: 39.32, lng: -120.1396 },
  { code: "KBFI", iata: "BFI", name: "Boeing Field", city: "Seattle", country: "US", region: "north-america", lat: 47.53, lng: -122.3019 },
  { code: "CYYZ", iata: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "CA", region: "north-america", lat: 43.6777, lng: -79.6248 },
  { code: "MMSD", iata: "SJD", name: "Los Cabos International", city: "Los Cabos", country: "MX", region: "north-america", lat: 23.1518, lng: -109.7215 },
  // Caribbean
  { code: "MYNN", iata: "NAS", name: "Lynden Pindling International", city: "Nassau", country: "BS", region: "caribbean", lat: 25.039, lng: -77.4662 },
  { code: "TNCM", iata: "SXM", name: "Princess Juliana", city: "St. Maarten", country: "SX", region: "caribbean", lat: 18.041, lng: -63.1089 },
  { code: "TFFJ", iata: "SBH", name: "Gustaf III", city: "St. Barths", country: "BL", region: "caribbean", lat: 17.9044, lng: -62.8436 },
  { code: "TQPF", iata: "AXA", name: "Clayton J. Lloyd", city: "Anguilla", country: "AI", region: "caribbean", lat: 18.2048, lng: -63.0551 },
  { code: "MKJS", iata: "MBJ", name: "Sangster International", city: "Montego Bay", country: "JM", region: "caribbean", lat: 18.5037, lng: -77.9134 },
  // Europe
  { code: "EGLF", iata: "FAB", name: "Farnborough", city: "London", country: "GB", region: "europe", lat: 51.2758, lng: -0.7763 },
  { code: "EGGW", iata: "LTN", name: "Luton", city: "London", country: "GB", region: "europe", lat: 51.8747, lng: -0.3683 },
  { code: "LFPB", iata: "LBG", name: "Le Bourget", city: "Paris", country: "FR", region: "europe", lat: 48.9694, lng: 2.4414 },
  { code: "LFMN", iata: "NCE", name: "Nice Côte d'Azur", city: "Nice", country: "FR", region: "europe", lat: 43.6584, lng: 7.2159 },
  { code: "LFKC", iata: "CLY", name: "Calvi Sainte-Catherine", city: "Corsica", country: "FR", region: "europe", lat: 42.5308, lng: 8.7932 },
  { code: "LSGG", iata: "GVA", name: "Geneva", city: "Geneva", country: "CH", region: "europe", lat: 46.2381, lng: 6.109 },
  { code: "LSZS", iata: "SMV", name: "Samedan", city: "St. Moritz", country: "CH", region: "europe", lat: 46.5341, lng: 9.8841 },
  { code: "LIML", iata: "LIN", name: "Linate", city: "Milan", country: "IT", region: "europe", lat: 45.4451, lng: 9.2767 },
  { code: "LIRA", iata: "CIA", name: "Ciampino", city: "Rome", country: "IT", region: "europe", lat: 41.7994, lng: 12.5949 },
  { code: "LIEO", iata: "OLB", name: "Olbia Costa Smeralda", city: "Sardinia", country: "IT", region: "europe", lat: 40.8987, lng: 9.5176 },
  { code: "LEIB", iata: "IBZ", name: "Ibiza", city: "Ibiza", country: "ES", region: "europe", lat: 38.8729, lng: 1.3731 },
  { code: "LEMD", iata: "MAD", name: "Madrid-Barajas", city: "Madrid", country: "ES", region: "europe", lat: 40.4719, lng: -3.5626 },
  { code: "LGMK", iata: "JMK", name: "Mykonos", city: "Mykonos", country: "GR", region: "europe", lat: 37.4351, lng: 25.3481 },
  { code: "EHAM", iata: "AMS", name: "Schiphol", city: "Amsterdam", country: "NL", region: "europe", lat: 52.3105, lng: 4.7683 },
  { code: "EDDM", iata: "MUC", name: "Munich", city: "Munich", country: "DE", region: "europe", lat: 48.3538, lng: 11.7861 },
  // Middle East
  { code: "OMDW", iata: "DWC", name: "Al Maktoum International", city: "Dubai", country: "AE", region: "middle-east", lat: 24.8964, lng: 55.1614 },
  { code: "OMAA", iata: "AUH", name: "Zayed International", city: "Abu Dhabi", country: "AE", region: "middle-east", lat: 24.433, lng: 54.6511 },
  { code: "OERK", iata: "RUH", name: "King Khalid International", city: "Riyadh", country: "SA", region: "middle-east", lat: 24.9576, lng: 46.6988 },
  { code: "OTHH", iata: "DOH", name: "Hamad International", city: "Doha", country: "QA", region: "middle-east", lat: 25.2731, lng: 51.6081 },
];

const byCode = new Map(AIRPORTS.map((a) => [a.code, a]));

export function getAirport(code: string): Airport | undefined {
  return byCode.get(code.toUpperCase());
}

export function airportLabel(code: string): string {
  const a = getAirport(code);
  return a ? `${a.city} · ${a.name}` : code;
}

/** Ranked airport search over ICAO/IATA codes, city and airport name. */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { a: Airport; s: number }[] = [];
  for (const a of AIRPORTS) {
    const code = a.code.toLowerCase();
    const iata = a.iata?.toLowerCase() ?? "";
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();
    let s = 0;
    if (code === q || iata === q) s = 100;
    else if (city.startsWith(q)) s = 80;
    else if (code.startsWith(q) || iata.startsWith(q)) s = 70;
    else if (name.startsWith(q)) s = 60;
    else if (city.includes(q) || name.includes(q)) s = 40;
    if (s) scored.push({ a, s });
  }
  return scored
    .sort((x, y) => y.s - x.s || x.a.city.localeCompare(y.a.city))
    .slice(0, limit)
    .map((x) => x.a);
}

/** True when free text (code, city or airport name) refers to this airport. "" matches anything. */
export function airportMatches(code: string, text: string): boolean {
  const q = text.trim().toLowerCase();
  if (!q) return true;
  const a = getAirport(code);
  if (!a) return code.toLowerCase() === q;
  return (
    a.code.toLowerCase() === q ||
    a.iata?.toLowerCase() === q ||
    a.city.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q)
  );
}
