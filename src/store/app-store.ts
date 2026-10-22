"use client";

import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEMO_USERS, SEED_FLEET, SEED_OPERATORS, seedBookings, seedEmptyLegs } from "@/lib/data/seed";
import { today } from "@/lib/format";
import { bookingRef, uid } from "@/lib/ids";
import { isLive, viewLeg, type LegView } from "@/lib/legs";
import type {
  Alert,
  Booking,
  BookingStatus,
  EmptyLeg,
  EmptyLegStatus,
  FleetAircraft,
  Operator,
  Passenger,
  Role,
  User,
} from "@/lib/types";

/*
 * Single client-side store for the whole app, persisted to localStorage (and
 * therefore to the WKWebView's storage inside the iOS app). It stands in for a
 * backend: every mutation is a named action, so swapping these for API calls
 * later doesn't touch the screens.
 */

interface Data {
  seeded: boolean;
  sessionUserId: string | null;
  users: User[];
  operators: Operator[];
  fleet: FleetAircraft[];
  emptyLegs: EmptyLeg[];
  bookings: Booking[];
  alerts: Alert[];
}

export type NewBooking = Omit<Booking, "id" | "ref" | "status" | "createdAt" | "userId">;
export type NewEmptyLeg = Omit<EmptyLeg, "id" | "status" | "createdAt">;

interface Actions {
  seed: () => void;
  resetDemo: () => void;
  signIn: (email: string) => User | null;
  signInAs: (role: Role) => void;
  register: (u: Pick<User, "name" | "email" | "phone">) => User | { error: string };
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone">>) => void;
  createBooking: (b: NewBooking) => Booking | { error: string };
  cancelBooking: (id: string) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  addPassenger: (bookingId: string, p: Passenger) => void;
  /** Operator takes an open charter request (or confirms a request on its own empty leg). */
  acceptBooking: (id: string, operatorId: string) => void;
  addAlert: (a: Pick<Alert, "from" | "to" | "maxPrice">) => void;
  removeAlert: (id: string) => void;
  addEmptyLeg: (l: NewEmptyLeg) => EmptyLeg;
  setEmptyLegStatus: (id: string, status: EmptyLegStatus) => void;
  addFleet: (f: Omit<FleetAircraft, "id">) => void;
  removeFleet: (id: string) => void;
  setOperatorVerified: (id: string, verified: boolean) => void;
}

const empty: Data = {
  seeded: false,
  sessionUserId: null,
  users: [],
  operators: [],
  fleet: [],
  emptyLegs: [],
  bookings: [],
  alerts: [],
};

function seededData(): Partial<Data> {
  const day = today();
  return {
    seeded: true,
    users: DEMO_USERS,
    operators: SEED_OPERATORS,
    fleet: SEED_FLEET,
    emptyLegs: seedEmptyLegs(day),
    bookings: seedBookings(day),
  };
}

export const useApp = create<Data & Actions>()(
  persist(
    (set, get) => ({
      ...empty,

      seed: () => {
        if (!get().seeded) set(seededData());
      },
      resetDemo: () => set({ ...empty, ...seededData() }),

      signIn: (email) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return null;
        set((s) => ({
          sessionUserId: user.id,
          // Alerts saved before signing in now belong to this account.
          alerts: s.alerts.map((a) => (a.userId === null ? { ...a, userId: user.id } : a)),
        }));
        return user;
      },
      signInAs: (role) => {
        const user = get().users.find((u) => u.role === role);
        if (user) get().signIn(user.email);
      },
      register: ({ name, email, phone }) => {
        if (get().users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
          return { error: "An account with this email already exists. Sign in instead." };
        }
        const user: User = {
          id: uid("u"),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: "client",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user] }));
        get().signIn(user.email);
        return user;
      },
      signOut: () => set({ sessionUserId: null }),
      updateProfile: (patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === s.sessionUserId ? { ...u, ...patch } : u)) })),

      createBooking: (b) => {
        const s = get();
        if (!s.sessionUserId) return { error: "Please sign in to book." };
        if (b.emptyLegId) {
          const leg = s.emptyLegs.find((l) => l.id === b.emptyLegId);
          if (!leg || leg.status !== "available") return { error: "Sorry — this empty leg was just booked." };
        }
        const booking: Booking = {
          ...b,
          id: uid("bk"),
          ref: bookingRef(),
          userId: s.sessionUserId,
          status: "requested",
          createdAt: new Date().toISOString(),
        };
        set((st) => ({
          bookings: [booking, ...st.bookings],
          emptyLegs: b.emptyLegId
            ? st.emptyLegs.map((l) => (l.id === b.emptyLegId ? { ...l, status: "booked" } : l))
            : st.emptyLegs,
        }));
        return booking;
      },
      cancelBooking: (id) => {
        const b = get().bookings.find((x) => x.id === id);
        if (!b) return;
        set((s) => ({
          bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)),
          // A cancelled empty leg goes straight back on sale.
          emptyLegs: b.emptyLegId
            ? s.emptyLegs.map((l) => (l.id === b.emptyLegId && l.status === "booked" ? { ...l, status: "available" } : l))
            : s.emptyLegs,
        }));
      },
      setBookingStatus: (id, status) => {
        if (status === "cancelled") return get().cancelBooking(id);
        set((s) => ({ bookings: s.bookings.map((x) => (x.id === id ? { ...x, status } : x)) }));
      },

      acceptBooking: (id, operatorId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id && b.status === "requested" && (!b.operatorId || b.operatorId === operatorId)
              ? { ...b, operatorId, status: "confirmed" }
              : b
          ),
        })),
      addPassenger: (bookingId, p) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId && b.passengers.length < b.pax ? { ...b, passengers: [...b.passengers, p] } : b
          ),
        })),

      addAlert: (a) =>
        set((s) => ({
          alerts: [
            { ...a, id: uid("al"), userId: s.sessionUserId, createdAt: new Date().toISOString() },
            ...s.alerts,
          ],
        })),
      removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      addEmptyLeg: (l) => {
        const leg: EmptyLeg = { ...l, id: uid("el"), status: "available", createdAt: new Date().toISOString() };
        set((s) => ({ emptyLegs: [leg, ...s.emptyLegs] }));
        return leg;
      },
      setEmptyLegStatus: (id, status) =>
        set((s) => ({ emptyLegs: s.emptyLegs.map((l) => (l.id === id ? { ...l, status } : l)) })),

      addFleet: (f) => set((s) => ({ fleet: [...s.fleet, { ...f, id: uid("fl") }] })),
      removeFleet: (id) => set((s) => ({ fleet: s.fleet.filter((f) => f.id !== id) })),
      setOperatorVerified: (id, verified) =>
        set((s) => ({ operators: s.operators.map((o) => (o.id === id ? { ...o, verified } : o)) })),
    }),
    {
      name: "exjet",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s): Data => ({
        seeded: s.seeded,
        sessionUserId: s.sessionUserId,
        users: s.users,
        operators: s.operators,
        fleet: s.fleet,
        emptyLegs: s.emptyLegs,
        bookings: s.bookings,
        alerts: s.alerts,
      }),
    }
  )
);

/** Rehydrates once on the client, seeding demo data on first launch. Mounted in the root layout. */
export function StoreBoot() {
  useEffect(() => {
    Promise.resolve(useApp.persist.rehydrate()).then(() => useApp.getState().seed());
  }, []);
  return null;
}

/**
 * False during prerender and the first client paint; true once persisted (or
 * freshly seeded) data is loaded. Screens render skeletons until then.
 */
export function useHydrated(): boolean {
  return useApp((s) => s.seeded);
}

export function useSession(): User | null {
  return useApp((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);
}

/** Live (bookable, not yet departed) empty legs, resolved for display. */
export function useLiveLegs(): LegView[] {
  const emptyLegs = useApp((s) => s.emptyLegs);
  const fleet = useApp((s) => s.fleet);
  const operators = useApp((s) => s.operators);
  return useMemo(() => {
    const now = Date.now();
    return emptyLegs
      .filter((l) => isLive(l, now))
      .map((l) => viewLeg(l, fleet, operators))
      .filter((v): v is LegView => v !== null);
  }, [emptyLegs, fleet, operators]);
}
