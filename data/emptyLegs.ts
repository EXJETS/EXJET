export type EmptyLeg = {
  id: string;
  searchId: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  departureDate: string;
  departureWindow?: string;
  aircraftCategory: string;
  aircraftModel?: string;
  seats?: number;
  priceNote?: string;
};

// The static preview never publishes fabricated availability. This array is
// replaced by the server-side availability provider when the site leaves export mode.
export const emptyLegPreview: EmptyLeg[] = [];
