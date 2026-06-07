import Link from "next/link";
import {
  PlaneTakeoff,
  ArrowRight,
  BellRing,
  ChevronRight,
  Shield,
  Clock,
  Globe,
  Headphones,
  ChevronDown,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import emptyLegs from "@/data/empty-legs.json";
import popularRoutes from "@/data/popular-routes.json";
import sportsEvents from "@/data/sports-events.json";
import faqData from "@/data/faq.json";

/* ── helpers ─────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString("en-US");
}
function fmtDate(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── gradient palette for deal cards ─────────────────── */
const DEAL_GRADIENTS = [
  "from-[#1a1714] to-[#3b3028]",
  "from-[#0d1b2a] to-[#162235]",
  "from-[#1a1424] to-[#2e1f3e]",
  "from-[#0e1e18] to-[#1a3228]",
  "from-[#1e1208] to-[#332011]",
  "from-[#111827] to-[#1f2d3d]",
];

/* ── aircraft classes ─────────────────────────────────── */
const AIRCRAFT_CLASSES = [
  {
    category: "Light",
    example: "Phenom 300E / Citation CJ4",
    seats: "6–8",
    range: "2,000 nm",
    from: 3200,
  },
  {
    category: "Midsize",
    example: "Citation XLS+ / Hawker 900XP",
    seats: "7–9",
    range: "2,800 nm",
    from: 5600,
  },
  {
    category: "Super Midsize",
    example: "Challenger 350 / Citation Longitude",
    seats: "8–10",
    range: "3,400 nm",
    from: 8500,
  },
  {
    category: "Heavy",
    example: "Gulfstream G450 / Challenger 605",
    seats: "12–14",
    range: "4,800 nm",
    from: 11000,
  },
  {
    category: "Ultra Long",
    example: "Global 7500 / G650ER",
    seats: "13–19",
    range: "7,700 nm",
    from: 15000,
  },
];

/* ── trust pillars ────────────────────────────────────── */
const TRUST_PILLARS = [
  { icon: Shield, label: "ARGUS Platinum", sub: "Every operator certified" },
  { icon: Globe, label: "5,000+ Airports", sub: "Worldwide access" },
  { icon: Clock, label: "<4 hr Confirm", sub: "Standard requests" },
  { icon: Headphones, label: "24/7 Concierge", sub: "Dedicated team" },
];

/* ── sport badge colors ───────────────────────────────── */
const SPORT_COLORS: Record<string, string> = {
  F1: "bg-red-600",
  NBA: "bg-orange-500",
  NFL: "bg-blue-700",
  NHL: "bg-sky-500",
  FIFA: "bg-emerald-600",
  Masters: "bg-green-700",
};

export default function HomePage() {
  const upcomingEvents = sportsEvents
    .filter((e) => new Date(e.date) >= new Date("2026-06-07"))
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative bg-[#f2f2f7] px-4 pb-10 pt-20">
        {/* champagne glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-14 flex justify-center"
        >
          <div className="h-64 w-64 rounded-full bg-[#0d1f3c] opacity-[0.07] blur-[80px]" />
        </div>

        {/* Aircraft icon */}
        <div className="relative mx-auto mb-6 flex max-w-7xl items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-[0_8px_40px_rgba(0,0,0,0.10)]">
            <PlaneTakeoff
              className="h-12 w-12 text-[var(--color-champagne)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Headline */}
        <div className="mx-auto mb-8 max-w-xl text-center">
          <h1 className="font-serif text-[clamp(2.2rem,6vw,3.5rem)] font-normal leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
            Private jets,
            <br />
            <span className="italic text-[var(--color-champagne)]">
              on demand.
            </span>
          </h1>
          <p className="mt-3 text-[15px] text-neutral-500">
            5,000+ airports · confirmed in hours · ARGUS Platinum fleet
          </p>
        </div>

        {/* Search widget */}
        <div className="mx-auto max-w-md">
          <SearchBar />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PROMO CARDS
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 py-6">
        <div className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-2">
          {/* EXJET Program */}
          <div className="mesh-ink relative overflow-hidden rounded-3xl p-5 text-white">
            <span className="mb-2 inline-block rounded-full border border-[rgba(255,255,255,0.3)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.65)]">
              EXJET Program
            </span>
            <h2 className="font-serif text-[1.5rem] leading-tight">
              Fly without limits.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
              Guaranteed availability, fixed hourly rates, and a dedicated
              aviation advisor — every flight.
            </p>
            <Link
              href="/auth/register"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-champagne)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-80"
            >
              Enquire
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Featured route */}
          <div className="relative overflow-hidden rounded-3xl bg-[var(--color-ink)] p-5 text-white">
            <span className="mb-2 inline-block rounded-full border border-white/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Popular Route
            </span>
            <h2 className="font-serif text-[1.5rem] leading-tight">
              New York ↔ Miami
            </h2>
            <p className="mt-1 text-[13px] text-neutral-400">
              Teterboro · Opa-Locka · 2h 55m
            </p>
            <p className="mt-3 text-[22px] font-semibold">
              From{" "}
              <span className="text-[var(--color-champagne-soft)]">
                $18,900
              </span>
            </p>
            <Link
              href="/search"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Book now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DEAL ALERT BANNER
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 pb-6">
        <div className="mx-auto max-w-md sm:max-w-2xl">
          <div className="flex items-center justify-between rounded-2xl border border-[rgba(13,31,60,0.15)] bg-[rgba(13,31,60,0.06)] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-champagne)]">
                <BellRing className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--color-ink)]">
                  Empty leg alerts
                </p>
                <p className="text-[12px] text-neutral-500">
                  Save 50–75% on repositioning flights
                </p>
              </div>
            </div>
            <Link
              href="/auth/register"
              className="shrink-0 rounded-full bg-[var(--color-champagne)] px-3.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-80"
            >
              Get alerts
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          JET DEALS (empty legs)
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 pb-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">
              Jet Deals
            </h2>
            <Link
              href="/search?category=empty-legs"
              className="flex items-center gap-0.5 text-[13px] text-[var(--color-champagne)] hover:underline"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
            {emptyLegs.map((leg, i) => (
              <Link
                key={leg.id}
                href="/search?category=empty-legs"
                className={`shrink-0 w-[220px] sm:w-[240px] lg:w-auto rounded-3xl bg-gradient-to-br ${DEAL_GRADIENTS[i % DEAL_GRADIENTS.length]} p-5 text-white transition-transform hover:scale-[1.02]`}
              >
                <span className="mb-3 inline-block rounded-full bg-[var(--color-champagne)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  -{leg.discountPct}%
                </span>
                <div className="mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-semibold">
                      {leg.from.city}
                    </span>
                    <PlaneTakeoff className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-[15px] font-semibold">
                      {leg.to.city}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {leg.from.code} → {leg.to.code}
                  </p>
                </div>
                <p className="text-[12px] text-neutral-400">
                  {leg.aircraft} · {fmtDate(leg.date)} · {leg.departTime}
                </p>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="text-[11px] text-neutral-500 line-through">
                    ${fmt(leg.retailPrice)}
                  </p>
                  <p className="text-[20px] font-bold">${fmt(leg.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          POPULAR ROUTES
      ══════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">
              Popular Routes
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-0.5 text-[13px] text-[var(--color-champagne)] hover:underline"
            >
              All routes
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
            {popularRoutes.slice(0, 6).map((route) => (
              <Link
                key={route.id}
                href="/search"
                className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 last:border-b-0 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2f2f7]">
                    <PlaneTakeoff
                      className="h-4 w-4 text-neutral-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--color-ink)]">
                      {route.from.city} → {route.to.city}
                    </p>
                    <p className="text-[12px] text-neutral-400">
                      {route.flightTime} · {route.recommended}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-[var(--color-ink)]">
                    ${fmt(route.fromPrice)}
                  </p>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          AIRCRAFT CLASSES
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">
              Choose your aircraft
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              From city hops to intercontinental missions
            </p>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {AIRCRAFT_CLASSES.map((cls) => (
              <Link
                key={cls.category}
                href="/search"
                className="shrink-0 w-[160px] sm:w-[180px] lg:w-auto rounded-2xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span className="inline-block rounded-lg bg-[#f2f2f7] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-ink)]">
                  {cls.category}
                </span>
                <p className="mt-3 text-[12px] leading-relaxed text-neutral-400">
                  {cls.example}
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] text-neutral-400">
                    <span className="font-medium text-neutral-600">
                      {cls.seats}
                    </span>{" "}
                    seats
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    <span className="font-medium text-neutral-600">
                      {cls.range}
                    </span>{" "}
                    range
                  </p>
                </div>
                <p className="mt-3 border-t border-neutral-100 pt-3 text-[13px] font-semibold text-[var(--color-ink)]">
                  from ${fmt(cls.from)}/hr
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY EXJET
      ══════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <h2 className="mb-6 text-[17px] font-semibold text-[var(--color-ink)]">
            Why EXJET
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TRUST_PILLARS.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="rounded-2xl border border-neutral-100 bg-[#f2f2f7] p-4"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                  <Icon
                    className="h-[18px] w-[18px] text-[var(--color-champagne)]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[14px] font-semibold text-[var(--color-ink)]">
                  {label}
                </p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SPORTS & EVENTS
      ══════════════════════════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[var(--color-ink)]">
              Upcoming Events
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-0.5 text-[13px] text-[var(--color-champagne)] hover:underline"
            >
              Plan a trip
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href="/search"
                className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 last:border-b-0 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-14 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white ${SPORT_COLORS[event.league] ?? "bg-neutral-600"}`}
                  >
                    {event.league}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--color-ink)]">
                      {event.event}
                    </p>
                    <p className="text-[12px] text-neutral-400">
                      {event.city} · {fmtDate(event.date)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-3xl">
          <h2 className="mb-6 text-[17px] font-semibold text-[var(--color-ink)]">
            Frequently asked
          </h2>
          <div className="overflow-hidden rounded-2xl border border-neutral-100">
            {faqData.map((item, i) => (
              <details key={i} className="group border-b border-neutral-100 bg-white last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 hover:bg-neutral-50">
                  <span className="pr-4 text-[14px] font-medium text-[var(--color-ink)]">
                    {item.q}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 pt-1 text-[13px] leading-relaxed text-neutral-500">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CLOSING CTA
      ══════════════════════════════════════════════ */}
      <section className="mesh-ink px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)]">
              <PlaneTakeoff
                className="h-6 w-6 text-[var(--color-champagne)]"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] font-normal leading-tight text-white">
            Ready to depart?
          </h2>
          <p className="mt-3 text-[14px] text-neutral-400">
            Reserve your aircraft in minutes — available 24/7 worldwide.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-navy)] px-6 py-3 text-[14px] font-medium text-white shadow-[0_4px_20px_rgba(13,31,60,0.5)] transition-opacity hover:opacity-90"
            >
              Search flights
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
