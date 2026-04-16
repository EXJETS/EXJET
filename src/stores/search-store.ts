"use client";

import { create } from "zustand";
import type { JetCategory } from "@/types";

export type TripType = "one_way" | "round_trip" | "multi_leg";

export interface FlightLeg {
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  date: string;
  time: string;
}

interface SearchState {
  tripType: TripType;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  bags: number;
  pets: number;
  legs: FlightLeg[];
  categories: JetCategory[];
  minPrice: number;
  maxPrice: number;
  priceMin: number | null;
  priceMax: number | null;
  passengerCount: number | null;
  sortBy: string;
  setTripType: (type: TripType) => void;
  setFrom: (from: string, code?: string) => void;
  setTo: (to: string, code?: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setReturnDate: (date: string) => void;
  setReturnTime: (time: string) => void;
  setPassengers: (passengers: number) => void;
  setBags: (bags: number) => void;
  setPets: (pets: number) => void;
  setLegs: (legs: FlightLeg[]) => void;
  addLeg: () => void;
  removeLeg: (index: number) => void;
  updateLeg: (index: number, leg: Partial<FlightLeg>) => void;
  toggleCategory: (category: JetCategory) => void;
  setMinPrice: (price: number) => void;
  setMaxPrice: (price: number) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setPassengerCount: (count: number | null) => void;
  setSortBy: (sort: string) => void;
  swapLocations: () => void;
  clearFilters: () => void;
  reset: () => void;
}

const emptyLeg = (): FlightLeg => ({
  from: "",
  to: "",
  fromCode: "",
  toCode: "",
  date: "",
  time: "",
});

export const useSearchStore = create<SearchState>((set) => ({
  tripType: "one_way",
  from: "",
  to: "",
  fromCode: "",
  toCode: "",
  date: "",
  time: "",
  returnDate: "",
  returnTime: "",
  passengers: 1,
  bags: 0,
  pets: 0,
  legs: [emptyLeg(), emptyLeg()],
  categories: [],
  minPrice: 0,
  maxPrice: 100000,
  priceMin: null,
  priceMax: null,
  passengerCount: null,
  sortBy: "price_asc",
  setTripType: (tripType) => set({ tripType }),
  setFrom: (from, code) => set({ from, fromCode: code || "" }),
  setTo: (to, code) => set({ to, toCode: code || "" }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setReturnDate: (returnDate) => set({ returnDate }),
  setReturnTime: (returnTime) => set({ returnTime }),
  setPassengers: (passengers) => set({ passengers }),
  setBags: (bags) => set({ bags }),
  setPets: (pets) => set({ pets }),
  setLegs: (legs) => set({ legs }),
  addLeg: () =>
    set((state) => ({
      legs: [...state.legs, emptyLeg()],
    })),
  removeLeg: (index) =>
    set((state) => ({
      legs: state.legs.filter((_, i) => i !== index),
    })),
  updateLeg: (index, leg) =>
    set((state) => ({
      legs: state.legs.map((l, i) => (i === index ? { ...l, ...leg } : l)),
    })),
  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
    })),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setPriceRange: (priceMin, priceMax) => set({ priceMin, priceMax }),
  setPassengerCount: (passengerCount) => set({ passengerCount }),
  setSortBy: (sortBy) => set({ sortBy }),
  swapLocations: () =>
    set((state) => ({
      from: state.to,
      to: state.from,
      fromCode: state.toCode,
      toCode: state.fromCode,
    })),
  clearFilters: () =>
    set({
      categories: [],
      priceMin: null,
      priceMax: null,
      passengerCount: null,
      sortBy: "price_asc",
    }),
  reset: () =>
    set({
      tripType: "one_way",
      from: "",
      to: "",
      fromCode: "",
      toCode: "",
      date: "",
      time: "",
      returnDate: "",
      returnTime: "",
      passengers: 1,
      bags: 0,
      pets: 0,
      legs: [emptyLeg(), emptyLeg()],
      categories: [],
      minPrice: 0,
      maxPrice: 100000,
      priceMin: null,
      priceMax: null,
      passengerCount: null,
      sortBy: "price_asc",
    }),
}));
