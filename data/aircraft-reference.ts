import references from "./aircraft-reference.json";

export type AircraftFloorplan = {
  label: string;
  src: string;
  width: number;
  height: number;
};

type AircraftReferenceData = {
  name: string;
  metrics: string[][];
  cabin: string[][];
  performance: string[][];
  floorplans?: AircraftFloorplan[];
  note: string;
  source: string;
};

export type AircraftComparison = {
  range: string;
  height: string;
  width: string;
  length: string;
  baggage: string;
  source: string;
};

const aircraftReferences: Record<string, AircraftReferenceData> = references;

export function getAircraftReference(slug: string) {
  return aircraftReferences[slug];
}

// Build a small, serializable summary on the server. Keep operating notes and
// layout assets out of the interactive catalogue's client bundle.
export function getAircraftComparison(slug: string): AircraftComparison | undefined {
  const reference = getAircraftReference(slug);
  if (!reference) return undefined;
  const cabinValue = (label: string) => reference.cabin.find(row => row[0] === label)?.[1] ?? "Confirm with advisor";
  return {
    range: reference.metrics.find(row => /range/i.test(row[0]))?.[1] ?? "Mission dependent",
    height: cabinValue("Cabin height"),
    width: cabinValue("Cabin width"),
    length: cabinValue("Cabin length"),
    baggage: cabinValue("Baggage volume"),
    source: reference.source,
  };
}
