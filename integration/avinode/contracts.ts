/**
 * Avinode integration contracts only.
 *
 * This module deliberately contains no network client and reads no secrets.
 * It gives the future server route one stable boundary between the EXJET form
 * and Avinode's End Client Trip Search / Client Lead payload.
 */

export type ExjetLeadMode = "charter" | "group";

export type ExjetAirport = {
  icao: string;
  iata?: string;
  name: string;
  city?: string;
  country?: string;
};

export type ExjetLeadSegment = {
  startAirport: ExjetAirport;
  endAirport: ExjetAirport;
  departureDate: string;
  departureTime: string;
  passengers: number;
};

export type ExjetLeadContact = {
  name: string;
  email: string;
  phone?: string;
};

export type ExjetLeadInput = {
  mode: ExjetLeadMode;
  contact: ExjetLeadContact;
  segments: ExjetLeadSegment[];
  notes?: string;
  clientIdentifier: string;
  domainName?: string;
};

export type ExjetEmptyLegLeadInput = {
  searchId: string;
  emptyLegId: string;
  contact: ExjetLeadContact;
  notes?: string;
  clientIdentifier: string;
  domainName?: string;
};

export type AvinodeLeadPayload = {
  segments: Array<{
    startAirport: { icao: string };
    endAirport: { icao: string };
    dateTime: {
      date: string;
      time: string;
      departure: true;
      local: true;
    };
    paxCount: string;
    paxSegment: true;
  }>;
  leadContactInfo: {
    name: string;
    emailAddresses: Array<{
      type: "Work";
      emailAddress: string;
    }>;
    phoneNumbers?: Array<{
      type: "Work";
      phoneNumber: string;
    }>;
  };
  leadCurrency: "USD";
  leadLocale: "en" | "en_US";
  leadMessage?: string;
  campaignIdentifier: string;
  clientIdentifier: string;
  domainName: string;
};

export function createAvinodeLeadPayload(input: ExjetLeadInput): AvinodeLeadPayload {
  return {
    segments: input.segments.map((segment) => ({
      startAirport: { icao: segment.startAirport.icao.toUpperCase() },
      endAirport: { icao: segment.endAirport.icao.toUpperCase() },
      dateTime: {
        date: segment.departureDate,
        time: segment.departureTime,
        departure: true,
        local: true,
      },
      paxCount: String(segment.passengers),
      paxSegment: true,
    })),
    leadContactInfo: {
      name: input.contact.name,
      emailAddresses: [{ type: "Work", emailAddress: input.contact.email }],
      ...(input.contact.phone
        ? { phoneNumbers: [{ type: "Work" as const, phoneNumber: input.contact.phone }] }
        : {}),
    },
    leadCurrency: "USD",
    leadLocale: "en",
    ...(input.notes ? { leadMessage: input.notes } : {}),
    campaignIdentifier:
      input.mode === "group"
        ? "EXJET Website Group Charter"
        : "EXJET Website Private Charter",
    clientIdentifier: input.clientIdentifier,
    domainName: input.domainName ?? "exjet.com",
  };
}

export function createAvinodeEmptyLegLeadPayload(input: ExjetEmptyLegLeadInput) {
  return {
    searchId: input.searchId,
    inquiryLift: [{ emptyLegId: input.emptyLegId, priceExpectation: 0 }],
    leadContactInfo: {
      name: input.contact.name,
      emailAddresses: [{ type: "Work" as const, emailAddress: input.contact.email }],
      ...(input.contact.phone
        ? { phoneNumbers: [{ type: "Work" as const, phoneNumber: input.contact.phone }] }
        : {}),
    },
    leadCurrency: "USD",
    leadLocale: "en",
    ...(input.notes ? { leadMessage: input.notes } : {}),
    campaignIdentifier: "EXJET Website Empty Legs",
    clientIdentifier: input.clientIdentifier,
    domainName: input.domainName ?? "exjet.com",
  };
}
