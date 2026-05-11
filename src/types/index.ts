export type JetCategory = "light" | "midsize" | "super_midsize" | "heavy" | "ultra_long";

// ── Ground / Black Car ──────────────────────────────────────────────────────

export type VehicleCategory = "sedan" | "suv" | "electric" | "van" | "limousine";

export type TripType = "point_to_point" | "hourly" | "airport_transfer" | "full_day";

export type GroundBookingStatus =
  | "pending"
  | "confirmed"
  | "chauffeur_assigned"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  category: VehicleCategory;
  passengers: number;
  luggage: number;
  description: string;
  amenities: string[];
  basePrice: number;
  pricePerMile: number;
  image: string;
  popular: boolean;
  badge: string | null;
}

export interface Chauffeur {
  id: string;
  name: string;
  city: string;
  rating: number;
  trips: number;
  yearsExperience: number;
  languages: string[];
  specialties: string[];
  vehicles: string[];
  bio: string;
  verified: boolean;
  badge: string;
}

export interface GroundLocation {
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  flightNumber?: string;
}

export interface GroundPassenger {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface GroundBooking {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  chauffeurId?: string;
  chauffeur?: Chauffeur;
  tripType: TripType;
  pickup: GroundLocation;
  dropoff: GroundLocation;
  pickupDate: string;
  pickupTime: string;
  hours?: number;
  passengers: number;
  luggage: number;
  passenger: GroundPassenger;
  specialRequests?: string;
  status: GroundBookingStatus;
  estimatedDistance?: number;
  estimatedMinutes?: number;
  totalPrice: number;
  createdAt: string;
  confirmationCode: string;
}

export interface GroundSearchParams {
  pickup?: string;
  dropoff?: string;
  date?: string;
  time?: string;
  passengers?: number;
  tripType?: TripType;
  vehicleCategory?: VehicleCategory;
}

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
