"use client";

import { create } from "zustand";
import type { JetCategory } from "@/types";

interface SearchState {
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  date: string;
  returnDate: string;
  passengers: number;
  categories: JetCategory[];
  minPrice: number;
  maxPrice: number;
  priceMin: number | null;
  priceMax: number | null;
  passengerCount: number | null;
  sortBy: string;
  setFrom: (from: string, code?: string) => void;
  setTo: (to: string, code?: string) => void;
  setDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setPassengers: (passengers: number) => void;
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

export const useSearchStore = create<SearchState>((set) => ({
  from: "",
  to: "",
  fromCode: "",
  toCode: "",
  date: "",
  returnDate: "",
  passengers: 1,
  categories: [],
  minPrice: 0,
  maxPrice: 100000,
  priceMin: null,
  priceMax: null,
  passengerCount: null,
  sortBy: "price_asc",
  setFrom: (from, code) => set({ from, fromCode: code || "" }),
  setTo: (to, code) => set({ to, toCode: code || "" }),
  setDate: (date) => set({ date }),
  setReturnDate: (returnDate) => set({ returnDate }),
  setPassengers: (passengers) => set({ passengers }),
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
      from: "",
      to: "",
      fromCode: "",
      toCode: "",
      date: "",
      returnDate: "",
      passengers: 1,
      categories: [],
      minPrice: 0,
      maxPrice: 100000,
      priceMin: null,
      priceMax: null,
      passengerCount: null,
      sortBy: "price_asc",
    }),
}));
