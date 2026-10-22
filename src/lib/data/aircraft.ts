import type { AircraftCategory, AircraftType } from "@/lib/types";

export const CATEGORY_LABELS: Record<AircraftCategory, string> = {
  light: "Light jet",
  midsize: "Midsize jet",
  "super-midsize": "Super-midsize jet",
  heavy: "Heavy jet",
  "ultra-long-range": "Ultra-long-range",
};

export const CATEGORY_ORDER: AircraftCategory[] = ["light", "midsize", "super-midsize", "heavy", "ultra-long-range"];

export const AIRCRAFT_TYPES: AircraftType[] = [
  { id: "phenom-300e", name: "Phenom 300E", manufacturer: "Embraer", category: "light", seats: 7, rangeNm: 2010, speedKts: 453, hourlyRate: 5200, baggageCuFt: 84, cabinHeightFt: 4.9, amenities: ["Wi-Fi", "Enclosed lavatory", "Refreshment center"] },
  { id: "citation-cj4", name: "Citation CJ4", manufacturer: "Cessna", category: "light", seats: 7, rangeNm: 2165, speedKts: 451, hourlyRate: 4900, baggageCuFt: 77, cabinHeightFt: 4.8, amenities: ["Wi-Fi", "Belted lavatory", "Club seating"] },
  { id: "citation-xls", name: "Citation XLS+", manufacturer: "Cessna", category: "midsize", seats: 8, rangeNm: 2100, speedKts: 441, hourlyRate: 6300, baggageCuFt: 90, cabinHeightFt: 5.7, amenities: ["Wi-Fi", "Enclosed lavatory", "Galley"] },
  { id: "praetor-500", name: "Praetor 500", manufacturer: "Embraer", category: "midsize", seats: 9, rangeNm: 3340, speedKts: 466, hourlyRate: 7200, baggageCuFt: 150, cabinHeightFt: 6.0, amenities: ["Ka-band Wi-Fi", "Flat floor", "Full galley"] },
  { id: "challenger-350", name: "Challenger 350", manufacturer: "Bombardier", category: "super-midsize", seats: 9, rangeNm: 3200, speedKts: 470, hourlyRate: 8800, baggageCuFt: 106, cabinHeightFt: 6.0, amenities: ["Wi-Fi", "Flat-floor cabin", "Full galley", "Lie-flat seats"] },
  { id: "g280", name: "Gulfstream G280", manufacturer: "Gulfstream", category: "super-midsize", seats: 9, rangeNm: 3600, speedKts: 482, hourlyRate: 9200, baggageCuFt: 154, cabinHeightFt: 6.25, amenities: ["Wi-Fi", "Full galley", "Divan sleeps 2"] },
  { id: "challenger-650", name: "Challenger 650", manufacturer: "Bombardier", category: "heavy", seats: 12, rangeNm: 4000, speedKts: 459, hourlyRate: 10800, baggageCuFt: 115, cabinHeightFt: 6.1, amenities: ["Wi-Fi", "Widest cabin in class", "Full galley", "Sleeps 5"] },
  { id: "falcon-900lx", name: "Falcon 900LX", manufacturer: "Dassault", category: "heavy", seats: 12, rangeNm: 4750, speedKts: 459, hourlyRate: 11500, baggageCuFt: 127, cabinHeightFt: 6.2, amenities: ["Wi-Fi", "Three-zone cabin", "Full galley"] },
  { id: "g500", name: "Gulfstream G500", manufacturer: "Gulfstream", category: "heavy", seats: 13, rangeNm: 5300, speedKts: 488, hourlyRate: 13200, baggageCuFt: 175, cabinHeightFt: 6.2, amenities: ["Ka-band Wi-Fi", "100% fresh air", "Crew rest", "Sleeps 6"] },
  { id: "global-6000", name: "Global 6000", manufacturer: "Bombardier", category: "ultra-long-range", seats: 14, rangeNm: 6000, speedKts: 488, hourlyRate: 14500, baggageCuFt: 195, cabinHeightFt: 6.25, amenities: ["Wi-Fi", "Master stateroom", "Shower", "Crew rest"] },
  { id: "g650er", name: "Gulfstream G650ER", manufacturer: "Gulfstream", category: "ultra-long-range", seats: 14, rangeNm: 7500, speedKts: 516, hourlyRate: 16500, baggageCuFt: 195, cabinHeightFt: 6.4, amenities: ["Ka-band Wi-Fi", "Master stateroom", "Four living areas", "Crew rest"] },
  { id: "global-7500", name: "Global 7500", manufacturer: "Bombardier", category: "ultra-long-range", seats: 17, rangeNm: 7700, speedKts: 516, hourlyRate: 18500, baggageCuFt: 195, cabinHeightFt: 6.2, amenities: ["Ka-band Wi-Fi", "Four living spaces", "Shower", "Full kitchen"] },
];

const byId = new Map(AIRCRAFT_TYPES.map((t) => [t.id, t]));

export function getAircraftType(id: string): AircraftType | undefined {
  return byId.get(id);
}
