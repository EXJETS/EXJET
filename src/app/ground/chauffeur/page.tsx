"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  Star,
  Shield,
  TrendingUp,
  Users,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TripStatusTracker } from "@/components/ground/trip-status-tracker";
import type { GroundBookingStatus } from "@/types";

const UPCOMING_TRIPS = [
  {
    id: "t-001",
    confirmationCode: "EXG-A4K2P9",
    pickup: "JFK Airport, Terminal 4",
    dropoff: "The Ritz-Carlton, Central Park",
    date: "Today",
    time: "14:30",
    passenger: "J. Montgomery",
    vehicle: "Mercedes-Benz S-Class",
    estimatedFare: 145,
    status: "confirmed" as GroundBookingStatus,
  },
  {
    id: "t-002",
    confirmationCode: "EXG-B7R3Q1",
    pickup: "The Peninsula Hotel, 5th Ave",
    dropoff: "Teterboro Airport, FBO",
    date: "Today",
    time: "17:00",
    passenger: "E. Worthington",
    vehicle: "Mercedes-Benz S-Class",
    estimatedFare: 195,
    status: "confirmed" as GroundBookingStatus,
  },
  {
    id: "t-003",
    confirmationCode: "EXG-C2M8S5",
    pickup: "Goldman Sachs, West St",
    dropoff: "JFK Airport, Terminal 1",
    date: "Tomorrow",
    time: "06:00",
    passenger: "A. Blackwood",
    vehicle: "Mercedes-Benz S-Class",
    estimatedFare: 165,
    status: "confirmed" as GroundBookingStatus,
  },
];

export default function ChauffeurPortalPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "trips" | "earnings" | "apply">("dashboard");
  const [activeTrip, setActiveTrip] = useState<(typeof UPCOMING_TRIPS)[0] | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginView onLogin={() => setLoggedIn(true)} />;
  }

  if (activeTrip) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)]">
        <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTrip(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-hairline)] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">Active Trip</div>
              <h2 className="font-serif text-[22px] text-[var(--color-ink)]">{activeTrip.confirmationCode}</h2>
            </div>
          </div>
          <TripStatusTracker
            status={activeTrip.status}
            chauffeurName="You"
            vehiclePlate="NYC-EXG-4721"
            pickupAddress={activeTrip.pickup}
            dropoffAddress={activeTrip.dropoff}
            autoProgress
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ivory)]">
      {/* Portal header */}
      <div className="border-b border-[var(--color-hairline)] bg-white">
        <div className="mx-auto max-w-7xl px-5 pt-24 pb-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">EXJET Ground · Chauffeur Portal</div>
              <h1 className="mt-1 font-serif text-[28px] text-[var(--color-ink)]">Good morning, Marcus.</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-forest)]/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-[var(--color-forest)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-forest)]">Online</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-1 overflow-x-auto no-scrollbar">
            {(["dashboard", "trips", "earnings"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all",
                  activeTab === tab ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-8">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Today's earnings", value: "$340", icon: DollarSign, change: "+$145 pending" },
                { label: "Trips today", value: "2 / 3", icon: Car, change: "1 upcoming" },
                { label: "Rating", value: "4.98 ★", icon: Star, change: "Last 30 days" },
                { label: "Hours online", value: "6.5 hr", icon: Clock, change: "Shift ends 20:00" },
              ].map(({ label, value, icon: Icon, change }) => (
                <div key={label} className="rounded-2xl border border-[var(--color-hairline)] bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10">
                      <Icon className="h-4.5 w-4.5 text-champagne" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="mt-4 font-serif text-[28px] leading-none text-[var(--color-ink)]">{value}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</div>
                  <div className="mt-1 text-[11px] text-[var(--color-subtle)]">{change}</div>
                </div>
              ))}
            </div>

            {/* Next trip */}
            <div>
              <h2 className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Next Trip</h2>
              {UPCOMING_TRIPS.slice(0, 1).map((trip) => (
                <div
                  key={trip.id}
                  className="overflow-hidden rounded-2xl border border-champagne/30 bg-white shadow-[0_8px_32px_-12px_rgba(184,155,110,0.2)]"
                >
                  <div className="bg-champagne/5 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">{trip.date}</span>
                        <div className="mt-0.5 font-serif text-[28px] leading-none text-[var(--color-ink)]">{trip.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Fare</div>
                        <div className="font-serif text-[28px] leading-none text-[var(--color-ink)]">${trip.estimatedFare}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 p-6">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 shrink-0 text-champagne" strokeWidth={1.75} />
                      <span className="text-[14px] text-[var(--color-ink)]">{trip.pickup}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 shrink-0 text-[var(--color-forest)]" strokeWidth={1.75} />
                      <span className="text-[14px] text-[var(--color-ink)]">{trip.dropoff}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 shrink-0 text-champagne" strokeWidth={1.75} />
                      <span className="text-[14px] text-[var(--color-ink)]">{trip.passenger}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 border-t border-[var(--color-hairline)] p-4">
                    <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-hairline-strong)] py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-champagne hover:text-champagne">
                      <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                      Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTrip(trip)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
                    >
                      <Navigation className="h-3.5 w-3.5" strokeWidth={2} />
                      Start Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "trips" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Upcoming Trips ({UPCOMING_TRIPS.length})
            </h2>
            {UPCOMING_TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-hairline)] px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12px] text-champagne">{trip.date} · {trip.time}</span>
                    <span className="font-mono text-[11px] text-[var(--color-subtle)]">{trip.confirmationCode}</span>
                  </div>
                  <span className="font-serif text-[20px] text-[var(--color-ink)]">${trip.estimatedFare}</span>
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-champagne" strokeWidth={1.75} />
                    <span className="text-[13px] text-[var(--color-ink)]">{trip.pickup}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-forest)]" strokeWidth={1.75} />
                    <span className="text-[13px] text-[var(--color-ink)]">{trip.dropoff}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="h-3.5 w-3.5 shrink-0 text-champagne" strokeWidth={1.75} />
                    <span className="text-[13px] text-[var(--color-muted)]">{trip.passenger} · {trip.vehicle}</span>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-[var(--color-hairline)] p-4">
                  <button
                    type="button"
                    onClick={() => setActiveTrip(trip)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--color-ink)] py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
                  >
                    <Navigation className="h-3.5 w-3.5" strokeWidth={2} />
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "This week", value: "$1,847", change: "+12% vs last week" },
                { label: "This month", value: "$7,230", change: "124 trips" },
                { label: "All time", value: "$89,340", change: "2,847 trips" },
              ].map(({ label, value, change }) => (
                <div key={label} className="rounded-2xl border border-[var(--color-hairline)] bg-white p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne">{label}</div>
                  <div className="mt-2 font-serif text-[32px] leading-none text-[var(--color-ink)]">{value}</div>
                  <div className="mt-1 text-[12px] text-[var(--color-muted)]">{change}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--color-hairline)] bg-white">
              <div className="border-b border-[var(--color-hairline)] px-6 py-4">
                <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Recent Trips</h3>
              </div>
              {[
                { date: "Today 14:30", route: "JFK → Ritz-Carlton", amount: 145, rating: 5 },
                { date: "Today 09:00", route: "Midtown → LaGuardia", amount: 95, rating: 5 },
                { date: "Yesterday 22:00", route: "MoMA → JFK Airport", amount: 165, rating: 5 },
                { date: "Yesterday 16:00", route: "Four Seasons → Teterboro", amount: 210, rating: 4 },
              ].map((trip, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[var(--color-hairline)] px-6 py-4 last:border-b-0">
                  <div>
                    <div className="text-[13px] text-[var(--color-ink)]">{trip.route}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-[var(--color-muted)]">{trip.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-[18px] text-[var(--color-ink)]">${trip.amount}</div>
                    <div className="flex items-center justify-end gap-0.5 text-[11px] text-champagne">
                      {"★".repeat(trip.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  const [showApply, setShowApply] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-ivory)]">
      <div className="mx-auto max-w-md px-5 py-20 sm:px-8">
        <div className="mb-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">EXJET Ground</div>
          <h1 className="mt-3 font-serif text-[36px] text-[var(--color-ink)]">Chauffeur Portal</h1>
          <p className="mt-2 text-[14px] text-[var(--color-muted)]">
            For professional chauffeurs on the EXJET Ground network.
          </p>
        </div>

        {!showApply ? (
          <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="driver@exjet.com"
                  defaultValue="marcus@exjet.com"
                  className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Password
                </label>
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="w-full rounded-xl border border-[var(--color-hairline)] bg-white py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={onLogin}
                className="w-full rounded-full bg-[var(--color-ink)] py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
              >
                Sign In
              </button>
            </div>

            <div className="mt-6 border-t border-[var(--color-hairline)] pt-5 text-center">
              <p className="text-[13px] text-[var(--color-muted)]">
                Not yet a chauffeur?{" "}
                <button
                  type="button"
                  onClick={() => setShowApply(true)}
                  className="font-medium text-champagne underline underline-offset-2"
                >
                  Apply to drive
                </button>
              </p>
            </div>
          </div>
        ) : (
          <ApplyForm onBack={() => setShowApply(false)} />
        )}

        {/* Trust signals */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: DollarSign, label: "Up to $8k/mo" },
            { icon: Shield, label: "Fully insured" },
            { icon: Star, label: "Elite status" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-white p-3">
              <Icon className="h-4 w-4 text-champagne" strokeWidth={1.75} />
              <span className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplyForm({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-8 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-champagne" strokeWidth={1.5} />
        <h3 className="mt-4 font-serif text-[24px] text-[var(--color-ink)]">Application Received</h3>
        <p className="mt-2 text-[13px] text-[var(--color-muted)]">
          We'll review your application within 2 business days and reach out via email.
        </p>
        <button type="button" onClick={onBack} className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <button type="button" onClick={onBack} className="text-[var(--color-muted)] hover:text-champagne">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <h2 className="font-serif text-[20px] text-[var(--color-ink)]">Apply as Chauffeur</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input type="text" placeholder="First name" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
          <input type="text" placeholder="Last name" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
        </div>
        <input type="email" placeholder="Email" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
        <input type="tel" placeholder="Phone" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
        <input type="text" placeholder="City you'll operate in" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
        <input type="text" placeholder="Years of professional driving experience" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="w-full rounded-full bg-[var(--color-ink)] py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne"
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}
