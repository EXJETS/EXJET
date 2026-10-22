export type Region = "north-america" | "europe" | "caribbean" | "middle-east";

export interface Airport {
  code: string; // ICAO
  iata?: string;
  name: string;
  city: string;
  country: string;
  region: Region;
  lat: number;
  lng: number;
}

export type AircraftCategory = "light" | "midsize" | "super-midsize" | "heavy" | "ultra-long-range";

/** An aircraft model, e.g. "Challenger 350". */
export interface AircraftType {
  id: string;
  name: string;
  manufacturer: string;
  category: AircraftCategory;
  seats: number;
  rangeNm: number;
  speedKts: number;
  hourlyRate: number; // USD per block hour
  baggageCuFt: number;
  cabinHeightFt: number;
  amenities: string[];
}

export interface Operator {
  id: string;
  name: string;
  base: string; // ICAO
  safetyRating: string;
  verified: boolean;
}

/** A specific tail on an operator's certificate. */
export interface FleetAircraft {
  id: string;
  tail: string;
  typeId: string;
  operatorId: string;
  base: string; // ICAO
  yearOfManufacture: number;
}

export type EmptyLegStatus = "available" | "booked" | "withdrawn";

export interface EmptyLeg {
  id: string;
  operatorId: string;
  fleetId: string;
  from: string; // ICAO
  to: string; // ICAO
  date: string; // YYYY-MM-DD (local)
  time: string; // HH:mm (local)
  flexHours: number; // departure can move ± this many hours
  price: number; // all-in price for the whole aircraft
  status: EmptyLegStatus;
  createdAt: string;
}

export interface Segment {
  from: string;
  to: string;
  date: string;
  time: string;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface PriceLine {
  label: string;
  amount: number;
}

export interface Quote {
  lines: PriceLine[];
  total: number;
}

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  ref: string;
  userId: string;
  kind: "charter" | "empty-leg";
  emptyLegId?: string;
  typeId: string;
  operatorId?: string;
  segments: Segment[];
  pax: number;
  passengers: Passenger[];
  contact: { name: string; email: string; phone: string };
  notes: string;
  quote: Quote;
  status: BookingStatus;
  createdAt: string;
}

export interface Alert {
  id: string;
  userId: string | null; // null = saved on device before sign-in
  from: string; // free text: code, city or "" for anywhere
  to: string;
  maxPrice?: number;
  createdAt: string;
}

export type Role = "client" | "operator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  operatorId?: string;
  createdAt: string;
}
