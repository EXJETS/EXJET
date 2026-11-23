import { approvedAircraft } from "./approved-aircraft";
import { aircraft, type Aircraft } from "./aircraft";

export type ModelSpecification = {
  name: string; slug: string; maker: string; category: string;
  rangeNm?: number; maxPassengers?: number; maxSpeed?: string;
  cabin?: { height?: string; width?: string; length?: string };
  baggage?: string; source?: { label: string; url: string }; notes?: string;
  family?: boolean; requestOnly?: boolean; rangeBasis?: string; ceiling?: string; configurationSeats?: number;
};

export const modelSpecs: readonly ModelSpecification[] = approvedAircraft;
export const rangeLabel = (range: number) => `${range.toLocaleString("en-US")} nm`;
export const unknownSpec = "Not verified for this profile";
export const isRequestOnly = (model: ModelSpecification) => Boolean(model.requestOnly || /vip|airliner|airbus corporate|boeing business/i.test(model.category));

export const directoryAircraft: Aircraft[] = modelSpecs.map(model => {
  const legacy = aircraft.find(item => item.slug === model.slug && item.name.trim().toLowerCase() === model.name.trim().toLowerCase());
  return {
    slug: model.slug, name: model.name, maker: model.maker, category: model.category,
    status: "charter",
    summary: isRequestOnly(model) ? `${model.name} reference profile. Ask an advisor about the exact variant and available configuration.` : `Compare ${model.name} seating, performance and published range for trip planning. Your advisor confirms the exact aircraft and availability.`,
    image: legacy?.image, portraitImage: legacy?.portraitImage, cardFit: legacy?.cardFit,
    scenes: legacy?.scenes ?? [],
    typical: {
      passengers: model.maxPassengers !== undefined ? `Up to ${model.maxPassengers} (published)` : model.configurationSeats !== undefined ? `${model.configurationSeats} (example configuration)` : unknownSpec,
      range: model.rangeNm !== undefined ? `${rangeLabel(model.rangeNm)}${model.family && model.rangeBasis ? ` (${model.rangeBasis})` : ""}` : unknownSpec,
      baggage: model.baggage ?? unknownSpec,
      cabin: model.category,
    },
  };
});

export const getDirectoryAircraft = (slug: string) => directoryAircraft.find(model => model.slug === slug);
export const getModelSpecification = (slug: string) => modelSpecs.find(model => model.slug === slug);
