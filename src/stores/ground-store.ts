"use client";

import { create } from "zustand";
import type { Vehicle, GroundLocation, GroundPassenger, TripType, GroundBookingStatus } from "@/types";

interface GroundBookingDraft {
  step: number;
  tripType: TripType;
  pickup: Partial<GroundLocation>;
  dropoff: Partial<GroundLocation>;
  pickupDate: string;
  pickupTime: string;
  hours: number;
  passengers: number;
  luggage: number;
  selectedVehicle: Vehicle | null;
  passenger: Partial<GroundPassenger>;
  specialRequests: string;
  estimatedDistance: number;
  estimatedMinutes: number;
  estimatedPrice: number;
}

interface GroundBookingRecord {
  id: string;
  confirmationCode: string;
  status: GroundBookingStatus;
  chauffeurName?: string;
  chauffeurPhone?: string;
  vehiclePlate?: string;
  createdAt: string;
}

interface GroundStore {
  draft: GroundBookingDraft;
  bookings: GroundBookingRecord[];
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTripType: (type: TripType) => void;
  setPickup: (pickup: Partial<GroundLocation>) => void;
  setDropoff: (dropoff: Partial<GroundLocation>) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setHours: (hours: number) => void;
  setPassengers: (n: number) => void;
  setLuggage: (n: number) => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  setPassenger: (passenger: Partial<GroundPassenger>) => void;
  setSpecialRequests: (val: string) => void;
  setEstimate: (distance: number, minutes: number, price: number) => void;
  confirmBooking: () => GroundBookingRecord;
  resetDraft: () => void;
}

const defaultDraft: GroundBookingDraft = {
  step: 1,
  tripType: "airport_transfer",
  pickup: {},
  dropoff: {},
  pickupDate: "",
  pickupTime: "",
  hours: 3,
  passengers: 1,
  luggage: 1,
  selectedVehicle: null,
  passenger: {},
  specialRequests: "",
  estimatedDistance: 0,
  estimatedMinutes: 0,
  estimatedPrice: 0,
};

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "EXG-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const useGroundStore = create<GroundStore>((set, get) => ({
  draft: { ...defaultDraft },
  bookings: [],

  setStep: (step) => set((s) => ({ draft: { ...s.draft, step } })),
  nextStep: () => set((s) => ({ draft: { ...s.draft, step: Math.min(s.draft.step + 1, 5) } })),
  prevStep: () => set((s) => ({ draft: { ...s.draft, step: Math.max(s.draft.step - 1, 1) } })),
  setTripType: (tripType) => set((s) => ({ draft: { ...s.draft, tripType } })),
  setPickup: (pickup) => set((s) => ({ draft: { ...s.draft, pickup: { ...s.draft.pickup, ...pickup } } })),
  setDropoff: (dropoff) => set((s) => ({ draft: { ...s.draft, dropoff: { ...s.draft.dropoff, ...dropoff } } })),
  setDate: (pickupDate) => set((s) => ({ draft: { ...s.draft, pickupDate } })),
  setTime: (pickupTime) => set((s) => ({ draft: { ...s.draft, pickupTime } })),
  setHours: (hours) => set((s) => ({ draft: { ...s.draft, hours } })),
  setPassengers: (passengers) => set((s) => ({ draft: { ...s.draft, passengers } })),
  setLuggage: (luggage) => set((s) => ({ draft: { ...s.draft, luggage } })),
  setVehicle: (vehicle) => set((s) => ({ draft: { ...s.draft, selectedVehicle: vehicle } })),
  setPassenger: (passenger) => set((s) => ({ draft: { ...s.draft, passenger: { ...s.draft.passenger, ...passenger } } })),
  setSpecialRequests: (specialRequests) => set((s) => ({ draft: { ...s.draft, specialRequests } })),
  setEstimate: (estimatedDistance, estimatedMinutes, estimatedPrice) =>
    set((s) => ({ draft: { ...s.draft, estimatedDistance, estimatedMinutes, estimatedPrice } })),

  confirmBooking: () => {
    const { draft } = get();
    const record: GroundBookingRecord = {
      id: `gbk-${Date.now()}`,
      confirmationCode: generateConfirmationCode(),
      status: "confirmed",
      chauffeurName: "Marcus D.",
      chauffeurPhone: "+1 (555) 000-0001",
      vehiclePlate: "NYC-EXG-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ bookings: [record, ...s.bookings] }));
    return record;
  },

  resetDraft: () => set({ draft: { ...defaultDraft } }),
}));
