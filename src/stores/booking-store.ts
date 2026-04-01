"use client";

import { create } from "zustand";
import type { Jet, Airport, PassengerInfo } from "@/types";

interface BookingState {
  step: number;
  jet: Jet | null;
  departureAirport: Airport | null;
  arrivalAirport: Airport | null;
  departureDate: string;
  returnDate: string;
  passengerCount: number;
  passengers: PassengerInfo[];
  totalPrice: number;
  setStep: (step: number) => void;
  setJet: (jet: Jet) => void;
  setDepartureAirport: (airport: Airport) => void;
  setArrivalAirport: (airport: Airport) => void;
  setDepartureDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setPassengerCount: (count: number) => void;
  setPassengers: (passengers: PassengerInfo[]) => void;
  setTotalPrice: (price: number) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  jet: null,
  departureAirport: null,
  arrivalAirport: null,
  departureDate: "",
  returnDate: "",
  passengerCount: 1,
  passengers: [],
  totalPrice: 0,
  setStep: (step) => set({ step }),
  setJet: (jet) => set({ jet }),
  setDepartureAirport: (airport) => set({ departureAirport: airport }),
  setArrivalAirport: (airport) => set({ arrivalAirport: airport }),
  setDepartureDate: (date) => set({ departureDate: date }),
  setReturnDate: (date) => set({ returnDate: date }),
  setPassengerCount: (count) => set({ passengerCount: count }),
  setPassengers: (passengers) => set({ passengers }),
  setTotalPrice: (price) => set({ totalPrice: price }),
  reset: () =>
    set({
      step: 1,
      jet: null,
      departureAirport: null,
      arrivalAirport: null,
      departureDate: "",
      returnDate: "",
      passengerCount: 1,
      passengers: [],
      totalPrice: 0,
    }),
}));
