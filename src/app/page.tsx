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
  Users,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import emptyLegs from "@/data/empty-legs.json";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}
function fmtDate(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const DEAL_GRADIENTS = [
  "from-[#0a1628] to-[#0d1f3c]",
  "from-[#0d1f3c] to-[#162a50]",
  "from-[#091522] to-[#0f2040]",
  "from-[#0a1e35] to-[#112644]",
  "from-[#0c1b30] to-[#1a3461]",
  "from-[#071220] to-[#0d2540]",
];

const AIRCRAFT_CLASSES = [
  { label: "Light Jet",       seats: "4–8 seats",   from: 3200,  href: "/search?category=light" },
  { label: "Midsize Jet",     seats: "7–9 seats",   from: 5600,  href: "/search?category=midsize" },
  { label: "Super Midsize",   seats: "7–9 seats",   from: 8500,  href: "/search?category=super_midsize" },
  { label: "Heavy Jet",       seats: "10–19 seats", from: 11000, href: "/search?category=heavy" },
  { label: "Ultra Long Range",seats: "13–19 seats", from: 15000, href: "/search?category=ultra_long" },
];

const TRUST_PILLARS = [
  { icon: Shield,     label: "ARGUS Platinum",  sub: "Every operator certified" },
  { icon: Globe,      label: "5,000+ Airports", sub: "Worldwide access" },
  { icon: Clock,      label: "<2 hr Quote",     sub: "Standard requests" },
  { icon: Headphones, label: "24/7 Concierge",  sub: "Dedicated team" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#f2f2f7]">

      {/* ══ 1. HERO ══════════════════════════════════════ */}
      <section className="px-4 pt-20 pb-10">
        <div className="mx-auto max-w-md">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              Private Aviation
            </span>
          </div>

          <h1 className="mb-2 text-[clamp(2rem,7vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-[#0a1628]">
            Book Your<br />Private Jet
          </h1>
          <p className="mb-7 text-[14px] leading-relaxed text-neutral-500">
            5,000+ airports worldwide. Confirmed quotes in under two hours.
          </p>

          {/* Search form on light gray bg — white cards float naturally */}
          <SearchBar />
        </div>

        {/* Stats */}
        <div className="mx-auto mt-10 max-w-md">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "4,500+", label: "Aircraft on Platform" },
              { value: "5,000+", label: "Airports Worldwide" },
              { value: "24/7",   label: "Concierge Support" },
            ].map((s) => (
              <div key={s.value} className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[clamp(1.25rem,4vw,1.75rem)] font-semibold tracking-tight text-[#0a1628]">{s.value}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase leading-snug tracking-[0.15em] text-neutral-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 2. SERVICE PILLARS ═══════════════════════════ */}
      <section className="bg-white px-4 py-8">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                label: "Charter a Flight",
                sub: "One-way, round-trip, or multi-leg. Quoted in under two hours.",
                href: "/search",
                cta: "Search now",
              },
              {
                label: "The EXJET Card",
                sub: "Deposit-based access from $100K. Fixed rates, guaranteed availability.",
                href: "/membership",
                cta: "Learn more",
                featured: true,
              },
              {
                label: "Empty Leg Flights",
                sub: "Save 50–75% on repositioning flights. Limited availability.",
                href: "/search?category=empty-legs",
                cta: "See deals",
              },
            ].map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className={`group flex flex-col justify-between rounded-2xl border p-5 transition-colors ${
                  p.featured
                    ? "border-[#0d1f3c] bg-[#0d1f3c] text-white"
                    : "border-neutral-200 bg-white hover:border-[#0d1f3c] hover:bg-neutral-50"
                }`}
              >
                <div>
                  <p className={`text-[15px] font-semibold ${p.featured ? "text-white" : "text-[#0a1628]"}`}>
                    {p.label}
                  </p>
                  <p className={`mt-1.5 text-[13px] leading-relaxed ${p.featured ? "text-[rgba(255,255,255,0.6)]" : "text-neutral-500"}`}>
                    {p.sub}
                  </p>
                </div>
                <div className={`mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium ${p.featured ? "text-white" : "text-[#0d1f3c]"}`}>
                  {p.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. EMPTY LEG DEALS ═══════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Empty Legs</p>
              <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">Jet Deals</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/register"
                className="hidden items-center gap-1.5 text-[12px] text-neutral-500 transition-colors hover:text-[#0a1628] sm:flex"
              >
                <BellRing className="h-3.5 w-3.5" />
                Get alerts
              </Link>
              <Link
                href="/search?category=empty-legs"
                className="flex items-center gap-0.5 text-[13px] font-medium text-[#0d1f3c] hover:underline"
              >
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
            {emptyLegs.map((leg, i) => (
              <Link
                key={leg.id}
                href="/search?category=empty-legs"
                className={`shrink-0 w-[220px] sm:w-[240px] lg:w-auto rounded-3xl bg-gradient-to-br ${DEAL_GRADIENTS[i % DEAL_GRADIENTS.length]} p-5 text-white transition-transform hover:scale-[1.02]`}
              >
                <span className="mb-3 inline-block rounded-full bg-[rgba(255,255,255,0.15)] px-2.5 py-0.5 text-[10px] font-semibold">
                  -{leg.discountPct}%
                </span>
                <div className="mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-semibold">{leg.from.city}</span>
                    <PlaneTakeoff className="h-3.5 w-3.5 text-[rgba(255,255,255,0.4)]" />
                    <span className="text-[15px] font-semibold">{leg.to.city}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[rgba(255,255,255,0.45)]">
                    {leg.from.code} → {leg.to.code}
                  </p>
                </div>
                <p className="text-[12px] text-[rgba(255,255,255,0.5)]">
                  {leg.aircraft} · {fmtDate(leg.date)} · {leg.departTime}
                </p>
                <div className="mt-3 border-t border-[rgba(255,255,255,0.1)] pt-3">
                  <p className="text-[11px] text-[rgba(255,255,255,0.35)] line-through">${fmt(leg.retailPrice)}</p>
                  <p className="text-[20px] font-bold">${fmt(leg.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. AIRCRAFT CLASSES ══════════════════════════ */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Fleet</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">Choose your aircraft</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {AIRCRAFT_CLASSES.map((cls) => (
              <Link
                key={cls.label}
                href={cls.href}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#f2f2f7] p-4 transition-all hover:border-[#0d1f3c] hover:bg-[#0d1f3c]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#0a1628] group-hover:text-white">{cls.label}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-neutral-400 group-hover:text-[rgba(255,255,255,0.5)]" strokeWidth={1.75} />
                    <span className="text-[12px] text-neutral-500 group-hover:text-[rgba(255,255,255,0.6)]">{cls.seats}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200 group-hover:border-[rgba(255,255,255,0.15)]">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 group-hover:text-[rgba(255,255,255,0.4)]">From</p>
                  <p className="text-[13px] font-semibold text-[#0a1628] group-hover:text-white">
                    ${fmt(cls.from)}<span className="text-[11px] font-normal">/hr</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. WHY EXJET ═════════════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Standards</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">Why fly with EXJET</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TRUST_PILLARS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2f2f7]">
                  <Icon className="h-[18px] w-[18px] text-[#0d1f3c]" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-semibold text-[#0a1628]">{label}</p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6. PRIVATE EXPERIENCES ═══════════════════════ */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Curated Add-Ons</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">Private Experiences</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { title: "EXJET Pet",       sub: "Pets travel in the cabin — no cargo holds, no compromise.", icon: "🐾" },
              { title: "EXJET Kids",      sub: "Family-first cabins with curated children's menus on board.", icon: "✈️" },
              { title: "Private Dining",  sub: "Michelin-quality catering sourced from your destination.", icon: "🍽" },
              { title: "Ground Concierge",sub: "Transfers, hotel bookings, yacht charters — all arranged.", icon: "🚘" },
            ].map((exp) => (
              <div key={exp.title} className="rounded-2xl border border-neutral-100 bg-[#f2f2f7] p-5">
                <span className="text-[24px]">{exp.icon}</span>
                <p className="mt-3 text-[14px] font-semibold text-[#0a1628]">{exp.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">{exp.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. CLOSING CTA ═══════════════════════════════ */}
      <section className="bg-[#f2f2f7] px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-[#0d1f3c] px-8 py-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)]">
                <PlaneTakeoff className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-semibold tracking-tight text-white">
              Ready to depart?
            </h2>
            <p className="mt-3 text-[14px] text-[rgba(255,255,255,0.5)]">
              Reserve your aircraft in minutes — available 24/7 worldwide.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[#0d1f3c] transition-opacity hover:opacity-90"
              >
                Search flights <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.25)] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
