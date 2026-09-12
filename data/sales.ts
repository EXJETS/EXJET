export type SalesListing = {
  slug: string;
  name: string;
  maker: string;
  year?: string;
  category: string;
  status: "Sold" | "Off-market" | "For lease" | "Acquisition brief";
  availability: "record" | "active" | "search";
  summary: string;
  description: string[];
  facts: Array<[string, string]>;
  callToAction: string;
};

export const salesListings: SalesListing[] = [
  {
    slug: "citation-m2",
    name: "Citation M2",
    maker: "Cessna",
    year: "2013",
    category: "Light jet",
    status: "Sold",
    availability: "record",
    summary: "A completed EXJET transaction and a reference point for targeted light-jet acquisitions.",
    description: [
      "This Citation M2 was represented as a single-pilot certified light jet with MSP Gold enrollment, a fresh Phase 5 inspection, and 2021 paint and interior.",
      "The aircraft is no longer available. EXJET can build a confidential search for a similar M2 or comparable owner-operated light jet.",
    ],
    facts: [["Total time", "2,450 hours"], ["Seats", "6"], ["Maximum range", "1,550 nm"], ["Cruise speed", "404 kts"], ["Engines", "Williams FJ44-1AP-21"], ["Recorded sale price", "$3.3M"]],
    callToAction: "Source a similar aircraft",
  },
  {
    slug: "global-7500",
    name: "Global 7500",
    maker: "Bombardier",
    year: "2024",
    category: "Ultra-long-range",
    status: "Off-market",
    availability: "active",
    summary: "A confidential low-time Global 7500 opportunity available to qualified parties under NDA.",
    description: [
      "This low-time Global 7500 is represented with four true living spaces, a full-size galley, and a dedicated crew suite.",
      "Records, location, specification, and commercial terms are released only after buyer qualification and execution of a non-disclosure agreement.",
    ],
    facts: [["Total time", "1,200 hours"], ["Seats", "19"], ["Maximum range", "7,700 nm"], ["Cruise speed", "516 kts"], ["Engines", "GE Passport 20"], ["Paint / interior", "2024 / 2024"]],
    callToAction: "Request confidential details",
  },
  {
    slug: "praetor-600",
    name: "Praetor 600",
    maker: "Embraer",
    year: "2025",
    category: "Super-midsize",
    status: "For lease",
    availability: "active",
    summary: "A low-time Praetor 600 offered for long-term dry lease with full manufacturer warranty.",
    description: [
      "Factory-new condition, fly-by-wire controls, a flat-floor cabin, and a 5,800-foot cabin altitude make the Praetor 600 a compelling super-midsize platform.",
      "The opportunity is intended for a qualified long-term lessee with a minimum 24-month requirement. Final terms and aircraft records are subject to written verification.",
    ],
    facts: [["Total time", "120 hours"], ["Seats", "10"], ["Maximum range", "4,018 nm"], ["Cruise speed", "466 kts"], ["Engines", "Honeywell HTF7500E"], ["Minimum term", "24 months"]],
    callToAction: "Request lease terms",
  },
  {
    slug: "phenom-300e",
    name: "Phenom 300E",
    maker: "Embraer",
    category: "Light jet",
    status: "Acquisition brief",
    availability: "search",
    summary: "A targeted sourcing program for buyers seeking a current-generation Phenom 300 or 300E.",
    description: [
      "EXJET can identify on-market and quiet-market Phenom 300-series aircraft against a buyer-defined year, time, program enrollment, avionics, and budget brief.",
      "Because this is an acquisition search rather than an advertised listing, candidate aircraft and specifications are released only after the brief is confirmed.",
    ],
    facts: [["Program", "Targeted acquisition"], ["Aircraft", "Phenom 300 / 300E"], ["Market", "On-market and quiet-market"], ["Scope", "Search through closing"], ["Records", "Available on qualified candidates"], ["Pricing", "Market dependent"]],
    callToAction: "Start a Phenom search",
  },
];

export function getSalesListing(slug: string) {
  return salesListings.find((listing) => listing.slug === slug);
}

