export type AircraftCategory = {
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  idealFor: string;
  passengers: string;
  range: string;
  cabin: string;
  models: Array<{
    name: string;
    href?: string;
  }>;
};

export const aircraftCategories: AircraftCategory[] = [
  {
    slug: "light-jet",
    name: "Light Jet",
    shortName: "Light",
    summary: "Fast, flexible aircraft for shorter private missions with access to more regional airports.",
    idealFor: "Regional business travel, weekend trips, small groups",
    passengers: "Typically 6 to 8",
    range: "Short to regional",
    cabin: "Compact private cabin",
    models: [
      { name: "Phenom 300" },
      { name: "Citation CJ3+" },
      { name: "Citation CJ4" },
      { name: "Learjet 45XR" },
      { name: "Citation M2" },
    ],
  },
  {
    slug: "midsize-jet",
    name: "Midsize Jet",
    shortName: "Midsize",
    summary: "More cabin room and range for longer domestic missions without moving into a large-cabin aircraft.",
    idealFor: "Longer domestic routes, added baggage, cabin comfort",
    passengers: "Typically 7 to 9",
    range: "Domestic and regional",
    cabin: "More headroom and storage",
    models: [
      { name: "Citation XLS+" },
      { name: "Hawker 800XP" },
      { name: "Learjet 60XR" },
      { name: "Citation Latitude", href: "/aircraft/citation-latitude" },
      { name: "Citation Sovereign" },
    ],
  },
  {
    slug: "super-midsize-jet",
    name: "Super-Midsize Jet",
    shortName: "Super-Mid",
    summary: "A high-demand charter category balancing coast-to-coast range, speed, baggage, and stand-up cabin comfort.",
    idealFor: "Coast-to-coast trips, executive teams, time-sensitive missions",
    passengers: "Typically 8 to 10",
    range: "Transcontinental capable",
    cabin: "Stand-up cabin",
    models: [
      { name: "Citation X", href: "/aircraft/citation-x" },
      { name: "Challenger 350", href: "/aircraft/challenger-350" },
      { name: "Challenger 300", href: "/aircraft/challenger-300" },
      { name: "Gulfstream G280" },
      { name: "Praetor 600" },
    ],
  },
  {
    slug: "heavy-jet",
    name: "Heavy Jet",
    shortName: "Heavy",
    summary: "Large-cabin aircraft with greater range, generous baggage capacity, and room for longer journeys.",
    idealFor: "International routes, larger groups, extended cabin time",
    passengers: "Typically 10 to 14",
    range: "Long-range missions",
    cabin: "Large cabin, often multi-zone",
    models: [
      { name: "Challenger 605 / 650" },
      { name: "Gulfstream G450" },
      { name: "Falcon 2000LX", href: "/aircraft/falcon-2000lx" },
      { name: "Falcon 900", href: "/aircraft/falcon-900" },
      { name: "Legacy 600 / 650" },
    ],
  },
  {
    slug: "ultra-long-range-jet",
    name: "Ultra-Long-Range Jet",
    shortName: "Ultra-Long-Range",
    summary: "Flagship large-cabin aircraft designed for nonstop intercontinental travel and extended onboard comfort.",
    idealFor: "Intercontinental travel, global itineraries, premium long-haul missions",
    passengers: "Typically 12 to 17",
    range: "Intercontinental",
    cabin: "Multiple living zones",
    models: [
      { name: "Gulfstream G650 / G650ER", href: "/aircraft/gulfstream-g650" },
      { name: "Global 6000 / 6500" },
      { name: "Global 7500 / 8000", href: "/aircraft/global-8000" },
      { name: "Falcon 7X / 8X" },
      { name: "Gulfstream G550" },
    ],
  },
];
