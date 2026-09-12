import type { EmptyLeg } from "@/data/emptyLegs";

export type EmptyLegSearchInput = {
  departureIcao?: string;
  arrivalIcao?: string;
  departureDate: string;
  flexibilityDays?: number;
  passengers: number;
};

export type EmptyLegFeedResult = {
  items: EmptyLeg[];
  fetchedAt: string;
  source: "avinode";
};

/**
 * Server-only Avinode boundary. The browser consumes normalized EXJET records,
 * never Avinode credentials or raw operator data.
 */
export interface EmptyLegFeed {
  search(input: EmptyLegSearchInput): Promise<EmptyLegFeedResult>;
}
