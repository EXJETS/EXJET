export type JetCategory = "light" | "midsize" | "super_midsize" | "heavy" | "ultra_long";

export interface Jet {
  id: string;
  name: string;
  manufacturer: string;
  category: JetCategory;
  description: string;
  images: string[];
  passengers: number;
  crew: number;
  range: number; // nautical miles
  speed: number; // knots
  cabinLength: number; // feet
  cabinWidth: number; // feet
  cabinHeight: number; // feet
  baggageVolume: number; // cubic feet
  yearBuilt: number;
  hourlyRate: number;
  basePrice: number;
  amenities: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  returnDate?: string;
  passengers?: number;
  category?: JetCategory[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "rating" | "range" | "speed";
}

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  passportNumber?: string;
}

export interface Booking {
  id: string;
  jetId: string;
  jet: Jet;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureDate: string;
  returnDate?: string;
  passengers: PassengerInfo[];
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalPrice: number;
  createdAt: string;
}
