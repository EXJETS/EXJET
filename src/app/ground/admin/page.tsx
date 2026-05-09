"use client";

import { useState } from "react";
import {
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Star,
  TrendingUp,
  Users,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroundBookingStatus } from "@/types";

const TABS = ["Overview", "Bookings", "Chauffeurs", "Fleet", "Analytics"] as const;

const ALL_BOOKINGS = [
  { id: "b-001", code: "EXG-A4K2P9", passenger: "James Montgomery", vehicle: "Mercedes S-Class", chauffeur: "Marcus D.", pickup: "JFK Airport", dropoff: "Ritz-Carlton", date: "Today 14:30", fare: 145, status: "en_route" as GroundBookingStatus },
  { id: "b-002", code: "EXG-B7R3Q1", passenger: "Emma Worthington", vehicle: "BMW 7 Series", chauffeur: "Elena V.", pickup: "The Peninsula", dropoff: "Teterboro FBO", date: "Today 17:00", fare: 195, status: "confirmed" as GroundBookingStatus },
  { id: "b-003", code: "EXG-C2M8S5", passenger: "Alex Blackwood", vehicle: "Cadillac Escalade", chauffeur: "James O.", pickup: "Goldman Sachs", dropoff: "JFK Terminal 1", date: "Tomorrow 06:00", fare: 165, status: "confirmed" as GroundBookingStatus },
  { id: "b-004", code: "EXG-D9P4T2", passenger: "Sofia Chen", vehicle: "Tesla Model S", chauffeur: "Priya M.", pickup: "SFO Airport", dropoff: "Palo Alto HQ", date: "Today 09:00", fare: 135, status: "completed" as GroundBookingStatus },
  { id: "b-005", code: "EXG-E3K7R8", passenger: "Marcus Webb", vehicle: "Mercedes Sprinter", chauffeur: "Antoine B.", pickup: "O'Hare Airport", dropoff: "Marriott Marquis", date: "Today 11:30", fare: 310, status: "completed" as GroundBookingStatus },
  { id: "b-006", code: "EXG-F1M9S3", passenger: "Diana Frost", vehicle: "Range Rover Autobiography", chauffeur: "Unassigned", pickup: "Four Seasons", dropoff: "MIA Airport", date: "Today 20:00", fare: 175, status: "pending" as GroundBookingStatus },
];

const CHAUFFEURS_DATA = [
  { id: "ch-001", name: "Marcus D.", city: "New York", status: "active", rating: 4.98, trips: 2847, earnings: 89340 },
  { id: "ch-002", name: "Elena V.", city: "Los Angeles", status: "active", rating: 4.97, trips: 3124, earnings: 102800 },
  { id: "ch-003", name: "James O.", city: "London", status: "active", rating: 4.96, trips: 1892, earnings: 74200 },
  { id: "ch-004", name: "Yuki T.", city: "Miami", status: "offline", rating: 4.95, trips: 1456, earnings: 58100 },
  { id: "ch-005", name: "Antoine B.", city: "Chicago", status: "active", rating: 4.99, trips: 2103, earnings: 82500 },
  { id: "ch-006", name: "Priya M.", city: "San Francisco", status: "active", rating: 4.96, trips: 987, earnings: 41200 },
];

export default function GroundAdminPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-ivory)]">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-hairline)] bg-white p-8">
          <div className="mb-6 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">EXJET Ground</div>
            <h1 className="mt-2 font-serif text-[28px] text-[var(--color-ink)]">Admin Portal</h1>
          </div>
          <div className="flex flex-col gap-4">
            <input type="email" placeholder="admin@exjet.com" defaultValue="admin@exjet.com" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
            <input type="password" defaultValue="••••••••" className="rounded-xl border border-[var(--color-hairline)] py-3 px-4 text-[14px] text-[var(--color-ink)] focus:border-champagne focus:outline-none" />
            <button type="button" onClick={() => setLoggedIn(true)} className="w-full rounded-full bg-[var(--color-ink)] py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne">Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = ALL_BOOKINGS.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch = !search || b.passenger.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--color-ivory)]">
      {/* Sidebar + main layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-[var(--color-hairline)] bg-white pt-20 lg:block">
          <div className="flex flex-col gap-1 px-3">
            <div className="mb-4 px-3 py-2">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-champagne">EXJET Ground</div>
              <div className="mt-0.5 font-serif text-[16px] text-[var(--color-ink)]">Admin</div>
            </div>
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-all",
                  activeTab === tab
                    ? "bg-[var(--color-ivory)] text-[var(--color-ink)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                )}
              >
                {tabIcon(tab)}
                {tab}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-x-hidden pt-20">
          {/* Mobile tab bar */}
          <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-hairline)] bg-white px-4 py-2 no-scrollbar lg:hidden">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all",
                  activeTab === tab ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-muted)]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-8">
            {activeTab === "Overview" && (
              <OverviewTab />
            )}
            {activeTab === "Bookings" && (
              <BookingsTab
                bookings={filteredBookings}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            )}
            {activeTab === "Chauffeurs" && (
              <ChauffeurTab chauffeurs={CHAUFFEURS_DATA} />
            )}
            {activeTab === "Fleet" && (
              <FleetTab />
            )}
            {activeTab === "Analytics" && (
              <AnalyticsTab />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[30px] text-[var(--color-ink)]">Good morning.</h1>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Here's what's happening with EXJET Ground today.</p>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's revenue", value: "$4,820", change: "+18% vs yesterday", icon: DollarSign, up: true },
          { label: "Active trips", value: "12", change: "6 chauffeurs online", icon: Navigation, up: null },
          { label: "Pending bookings", value: "3", change: "Needs assignment", icon: AlertCircle, up: null },
          { label: "Avg. rating today", value: "4.97 ★", change: "28 completed trips", icon: Star, up: true },
        ].map(({ label, value, change, icon: Icon, up }) => (
          <div key={label} className="rounded-2xl border border-[var(--color-hairline)] bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10">
                <Icon className="h-4 w-4 text-champagne" strokeWidth={1.75} />
              </div>
              {up !== null && (
                <TrendingUp className={cn("h-4 w-4", up ? "text-[var(--color-forest)]" : "rotate-180 text-[var(--color-bordeaux)]")} strokeWidth={2} />
              )}
            </div>
            <div className="mt-4 font-serif text-[30px] leading-none text-[var(--color-ink)]">{value}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{label}</div>
            <div className="mt-0.5 text-[11px] text-[var(--color-subtle)]">{change}</div>
          </div>
        ))}
      </div>

      {/* Live active trips */}
      <div>
        <h2 className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Live Trips</h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
          {ALL_BOOKINGS.filter((b) => b.status === "en_route" || b.status === "in_progress").map((b, i, arr) => (
            <div key={b.id} className={cn("flex items-center gap-4 px-5 py-4", i < arr.length - 1 && "border-b border-[var(--color-hairline)]")}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-champagne/10">
                <Navigation className="h-4 w-4 text-champagne animate-pulse" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-[var(--color-ink)]">{b.passenger}</span>
                  <span className="font-mono text-[10px] text-[var(--color-subtle)]">· {b.chauffeur}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
                  <MapPin className="h-3 w-3 text-champagne" strokeWidth={1.75} />
                  {b.pickup} → {b.dropoff}
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {ALL_BOOKINGS.filter((b) => b.status === "en_route" || b.status === "in_progress").length === 0 && (
            <div className="px-6 py-8 text-center text-[13px] text-[var(--color-muted)]">No live trips right now.</div>
          )}
        </div>
      </div>

      {/* Pending assignment */}
      <div>
        <h2 className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Needs Assignment
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-bordeaux)]/20 bg-white">
          {ALL_BOOKINGS.filter((b) => b.chauffeur === "Unassigned").map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-[var(--color-bordeaux)]" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[12px] text-[var(--color-ink)]">{b.passenger} · {b.date}</div>
                <div className="mt-0.5 text-[11px] text-[var(--color-muted)]">{b.pickup} → {b.dropoff}</div>
              </div>
              <button type="button" className="rounded-full bg-[var(--color-ink)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-champagne">Assign</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingsTab({ bookings, search, setSearch, statusFilter, setStatusFilter }: {
  bookings: typeof ALL_BOOKINGS;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">All Bookings</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search passenger or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-[var(--color-hairline)] py-2 pl-9 pr-4 text-[13px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]" strokeWidth={2} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[var(--color-hairline)] py-2 pl-9 pr-4 text-[13px] text-[var(--color-ink)] focus:border-champagne focus:outline-none"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="en_route">En Route</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-ivory)]">
              {["Code", "Passenger", "Route", "Chauffeur", "Date", "Fare", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={b.id} className={cn("hover:bg-[var(--color-ivory)] transition-colors", i < bookings.length - 1 && "border-b border-[var(--color-hairline)]")}>
                <td className="px-4 py-3 font-mono text-[12px] text-champagne">{b.code}</td>
                <td className="px-4 py-3 text-[13px] text-[var(--color-ink)]">{b.passenger}</td>
                <td className="px-4 py-3 text-[12px] text-[var(--color-muted)]">{b.pickup.split(",")[0]} → {b.dropoff.split(",")[0]}</td>
                <td className="px-4 py-3 text-[13px] text-[var(--color-ink)]">{b.chauffeur}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[var(--color-muted)]">{b.date}</td>
                <td className="px-4 py-3 font-serif text-[16px] text-[var(--color-ink)]">${b.fare}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <button type="button" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
                    <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="py-12 text-center text-[13px] text-[var(--color-muted)]">No bookings match your filter.</div>
        )}
      </div>
    </div>
  );
}

function ChauffeurTab({ chauffeurs }: { chauffeurs: typeof CHAUFFEURS_DATA }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Chauffeurs</h2>
        <button type="button" className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne">+ Add Chauffeur</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-ivory)]">
              {["Chauffeur", "City", "Status", "Rating", "Trips", "All-time earnings", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chauffeurs.map((c, i) => (
              <tr key={c.id} className={cn("hover:bg-[var(--color-ivory)] transition-colors", i < chauffeurs.length - 1 && "border-b border-[var(--color-hairline)]")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ivory-deep)] font-serif text-[14px] text-[var(--color-ink)]">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-[13px] text-[var(--color-ink)]">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-[var(--color-muted)]">{c.city}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", c.status === "active" ? "bg-[var(--color-forest)]/10 text-[var(--color-forest)]" : "bg-[var(--color-hairline)] text-[var(--color-muted)]")}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-[var(--color-ink)]">{c.rating} ★</td>
                <td className="px-4 py-3 font-mono text-[13px] text-[var(--color-muted)]">{c.trips.toLocaleString()}</td>
                <td className="px-4 py-3 font-serif text-[16px] text-[var(--color-ink)]">${c.earnings.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button type="button" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
                    <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FleetTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Fleet Management</h2>
        <button type="button" className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-champagne">+ Add Vehicle</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { model: "Mercedes-Benz S-Class (×4)", plate: "NYC-EXG-****", status: "In service", mileage: "24,300 mi", nextService: "May 28" },
          { model: "BMW 7 Series (×2)", plate: "LAX-EXG-****", status: "In service", mileage: "18,900 mi", nextService: "Jun 5" },
          { model: "Cadillac Escalade (×3)", plate: "NYC-EXG-****", status: "In service", mileage: "31,200 mi", nextService: "May 20" },
          { model: "Tesla Model S (×2)", plate: "SFO-EXG-****", status: "Charging", mileage: "12,400 mi", nextService: "Jul 1" },
          { model: "Mercedes Sprinter (×1)", plate: "CHI-EXG-****", status: "In service", mileage: "42,000 mi", nextService: "May 15" },
          { model: "Lincoln Stretch (×1)", plate: "MIA-EXG-****", status: "Available", mileage: "9,800 mi", nextService: "Jun 20" },
        ].map((v) => (
          <div key={v.model} className="rounded-2xl border border-[var(--color-hairline)] bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10">
                <Car className="h-4 w-4 text-champagne" strokeWidth={1.75} />
              </div>
              <span className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                v.status === "In service" ? "bg-[var(--color-forest)]/10 text-[var(--color-forest)]" :
                v.status === "Charging" ? "bg-blue-50 text-blue-700" : "bg-[var(--color-ivory)] text-[var(--color-muted)]"
              )}>
                {v.status}
              </span>
            </div>
            <div className="mt-3">
              <div className="font-mono text-[12px] text-[var(--color-ink)]">{v.model}</div>
              <div className="mt-0.5 font-mono text-[11px] text-[var(--color-muted)]">{v.mileage} · Next service: {v.nextService}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-serif text-[24px] text-[var(--color-ink)]">Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "This month revenue", value: "$124,800", change: "+22% YoY" },
          { label: "Total trips (MTD)", value: "847", change: "+18% vs last month" },
          { label: "Avg. trip value", value: "$147", change: "$12 increase" },
          { label: "Customer satisfaction", value: "4.97 / 5", change: "99.2% positive" },
        ].map(({ label, value, change }) => (
          <div key={label} className="rounded-2xl border border-[var(--color-hairline)] bg-white p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-champagne">{label}</div>
            <div className="mt-2 font-serif text-[30px] leading-none text-[var(--color-ink)]">{value}</div>
            <div className="mt-1 text-[12px] text-[var(--color-muted)]">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
          <h3 className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Top Cities by Revenue</h3>
          {[
            { city: "New York", rev: 42000, pct: 34 },
            { city: "Los Angeles", rev: 28000, pct: 22 },
            { city: "San Francisco", rev: 19000, pct: 15 },
            { city: "Chicago", rev: 16000, pct: 13 },
            { city: "Miami", rev: 12000, pct: 10 },
          ].map(({ city, rev, pct }) => (
            <div key={city} className="mb-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[13px] text-[var(--color-ink)]">{city}</span>
                <span className="font-mono text-[12px] text-[var(--color-muted)]">${(rev / 1000).toFixed(0)}k · {pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-ivory-deep)]">
                <div className="h-full rounded-full bg-champagne" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-6">
          <h3 className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Trip Types (MTD)</h3>
          {[
            { type: "Airport Transfer", count: 380, pct: 45 },
            { type: "Point to Point", count: 255, pct: 30 },
            { type: "Hourly", count: 143, pct: 17 },
            { type: "Full Day", count: 69, pct: 8 },
          ].map(({ type, count, pct }) => (
            <div key={type} className="mb-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[13px] text-[var(--color-ink)]">{type}</span>
                <span className="font-mono text-[12px] text-[var(--color-muted)]">{count} trips · {pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-ivory-deep)]">
                <div className="h-full rounded-full bg-[var(--color-ink)]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: GroundBookingStatus }) {
  const map: Record<GroundBookingStatus, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700" },
    confirmed: { label: "Confirmed", cls: "bg-blue-50 text-blue-700" },
    chauffeur_assigned: { label: "Assigned", cls: "bg-blue-50 text-blue-700" },
    en_route: { label: "En Route", cls: "bg-champagne/10 text-champagne" },
    arrived: { label: "Arrived", cls: "bg-champagne/10 text-champagne" },
    in_progress: { label: "In Progress", cls: "bg-champagne/10 text-champagne" },
    completed: { label: "Completed", cls: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]" },
    cancelled: { label: "Cancelled", cls: "bg-[var(--color-bordeaux)]/10 text-[var(--color-bordeaux)]" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", cls)}>
      {label}
    </span>
  );
}

function tabIcon(tab: string) {
  const map: Record<string, React.ReactNode> = {
    Overview: <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.75} />,
    Bookings: <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />,
    Chauffeurs: <Users className="h-3.5 w-3.5" strokeWidth={1.75} />,
    Fleet: <Car className="h-3.5 w-3.5" strokeWidth={1.75} />,
    Analytics: <DollarSign className="h-3.5 w-3.5" strokeWidth={1.75} />,
  };
  return map[tab] ?? null;
}
