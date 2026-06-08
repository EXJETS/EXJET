import Link from "next/link";
import type { Metadata } from "next";
import {
  PlaneTakeoff, ArrowRight, BellRing, ChevronRight, ChevronDown,
  Shield, Clock, Globe, Headphones, Users,
  PawPrint, Baby, ChefHat, Car, CheckCircle2, Plus,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import emptyLegs from "@/data/empty-legs.json";

export const metadata: Metadata = {
  title: "Private Jet Charter, Jet Card & Aircraft Sales",
  description:
    "Book a private jet from $6,500/hr — no blackout dates, no hidden fees, ARGUS-certified operators. Jet cards, empty legs, and aircraft sales across 5,000+ airports worldwide.",
  alternates: { canonical: "/" },
};

function fmt(n: number) { return n.toLocaleString("en-US"); }
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
  { label: "Light Jet",        seats: "4–8 seats",   from: 6500,  market: 8320,  href: "/search?category=light" },
  { label: "Midsize Jet",      seats: "7–9 seats",   from: 7500,  market: 9577,  href: "/search?category=midsize" },
  { label: "Super Midsize",    seats: "7–9 seats",   from: 8500,  market: 12317, href: "/search?category=super_midsize" },
  { label: "Heavy Jet",        seats: "10–19 seats", from: 9500,  market: 15264, href: "/search?category=heavy" },
  { label: "Ultra Long Range", seats: "13–19 seats", from: 13500, market: 19208, href: "/search?category=ultra_long" },
];

const TRUST_PILLARS = [
  { icon: Shield,     label: "ARGUS Platinum",    sub: "Every operator independently certified" },
  { icon: Globe,      label: "5,000+ Airports",   sub: "Six continents. Every major FBO." },
  { icon: Clock,      label: "Quoted in < 2 hrs", sub: "Confirmed by DocuSign, every time" },
  { icon: Headphones, label: "24/7 Concierge",    sub: "Senior aviation advisors — no call centres" },
];

const FAQS = [
  {
    q: "How much does a private jet charter cost?",
    a: "EXJET charter rates start at $6,500/hr for a Light Jet, $7,500/hr for Midsize, $8,500/hr for Super Midsize, $9,500/hr for Heavy, and $13,500/hr for Ultra Long Range — materially below the industry average jet card rate of $8,320–$19,208/hr by category.",
  },
  {
    q: "What is an empty leg flight?",
    a: "An empty leg — also known as a deadhead or ferry flight — is a private aircraft repositioning without passengers ahead of its next charter. EXJET lists these flights at 50–75% below the retail charter price, on the same aircraft with the same crew and safety standards.",
  },
  {
    q: "What is the EXJET Card?",
    a: "The EXJET Card is a deposit-based private aviation programme with balances starting from $100,000. Members fly at fixed wholesale rates with full transparency on the operator's cost and EXJET's management fee. Deposits are fully refundable with no expiration on unused funds.",
  },
  {
    q: "How quickly can I book a private jet?",
    a: "Most charter requests receive a confirmed quote within two hours. EXJET Card holders with 24–48 hours' notice receive guaranteed aircraft availability. For same-day requirements, our 24/7 concierge line is available at all times.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ══ 1. HERO ══════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#040b16] via-[#091422] to-[#0d1f3c]">
        {/* Top label */}
        <div className="px-5 pt-7 sm:px-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.35)]">
            ARGUS Platinum · FAR Part 135 · 5,000+ Airports Worldwide
          </span>
        </div>

        {/* Subtle diagonal lines — decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Bottom content */}
        <div className="mt-auto px-4 pb-10 sm:px-8">
          <div className="mx-auto max-w-lg">
            <h1 className="font-serif text-[clamp(3.25rem,10vw,5.5rem)] font-normal leading-[1.02] tracking-tight text-white">
              Book your
              <br />
              charter.
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-[rgba(255,255,255,0.45)]">
              From $6,500/hr · No blackout dates · Confirmed within two hours
            </p>

            {/* Search card */}
            <div className="mt-6 rounded-2xl bg-white p-4 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
              <SearchBar />
            </div>

            {/* Scroll indicator */}
            <div className="mt-8 flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.38)]">
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
              <span>Explore services</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. CHARTER SERVICES — 2×2 grid ══════════════ */}
      <section className="bg-[#f5f0eb] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-lg sm:max-w-xl lg:max-w-4xl">
          <p className="mb-5 text-[14px] text-neutral-400">Charter services</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Private Charter",
                sub: "On-demand · One-way · Multi-leg",
                href: "/search",
                gradient: "from-[#08111e] to-[#162a50]",
              },
              {
                label: "Empty Legs",
                sub: "Up to 75% off repositioning flights",
                href: "/search?category=empty-legs",
                gradient: "from-[#0d1f3c] to-[#1e3a6e]",
              },
              {
                label: "EXJET Card",
                sub: "Wholesale rates · Fully refundable",
                href: "/membership",
                gradient: "from-[#091520] to-[#0f2540]",
              },
              {
                label: "Aircraft Sales",
                sub: "Pre-owned · Dry lease · IADA",
                href: "/aircraft-sales",
                gradient: "from-[#050e1a] to-[#0d1f3c]",
              },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 transition-transform hover:scale-[1.02] sm:p-5`}
              >
                {/* Subtle plane icon — decorative */}
                <PlaneTakeoff
                  className="absolute right-4 top-4 h-8 w-8 text-[rgba(255,255,255,0.07)] transition-colors group-hover:text-[rgba(255,255,255,0.12)]"
                  strokeWidth={1}
                />
                <div>
                  <p className="text-[14px] font-semibold text-white sm:text-[15px]">{s.label}</p>
                  <p className="mt-0.5 text-[11px] text-[rgba(255,255,255,0.45)]">{s.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. EMPTY LEG DEALS ═══════════════════════════ */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Empty Legs</p>
              <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">Repositioning flights — up to 75% off</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/register"
                className="hidden items-center gap-1.5 text-[12px] text-neutral-500 transition-colors hover:text-[#0a1628] sm:flex"
              >
                <BellRing className="h-3.5 w-3.5" />
                Price alerts
              </Link>
              <Link
                href="/search?category=empty-legs"
                className="flex items-center gap-0.5 text-[13px] font-medium text-[#0d1f3c] hover:underline"
              >
                View all <ChevronRight className="h-4 w-4" />
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
      <section className="bg-[#f5f0eb] px-4 py-10">
        <div className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Fleet</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">Select your aircraft category</h2>
          </div>
          <p className="mb-5 text-[12px] text-neutral-400">
            EXJET wholesale rates are 20–50% below the industry average jet card price (Q4 2025 benchmark: $8,320–$19,208/hr by class).
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {AIRCRAFT_CLASSES.map((cls) => {
              const savings = Math.round(((cls.market - cls.from) / cls.market) * 100);
              return (
                <Link
                  key={cls.label}
                  href={cls.href}
                  className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:border-[#0d1f3c] hover:bg-[#0d1f3c]"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[#0a1628] group-hover:text-white">{cls.label}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-neutral-400 group-hover:text-[rgba(255,255,255,0.5)]" strokeWidth={1.75} />
                      <span className="text-[12px] text-neutral-500 group-hover:text-[rgba(255,255,255,0.6)]">{cls.seats}</span>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-neutral-200 pt-3 group-hover:border-[rgba(255,255,255,0.15)]">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 group-hover:text-[rgba(255,255,255,0.4)]">From</p>
                    <p className="text-[13px] font-semibold text-[#0a1628] group-hover:text-white">
                      ${fmt(cls.from)}<span className="text-[11px] font-normal">/hr</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] text-emerald-600 group-hover:text-emerald-400">
                      Save ~{savings}% vs benchmark
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 5. THE EXJET STANDARD ════════════════════════ */}
      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Standards</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">The EXJET standard</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TRUST_PILLARS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-2xl border border-neutral-200 bg-[#f5f0eb] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                  <Icon className="h-[18px] w-[18px] text-[#0d1f3c]" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-semibold text-[#0a1628]">{label}</p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-[#f5f0eb] p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "No blackout dates", sub: "365 days a year, including all public holidays" },
                { label: "No peak-day surcharges", sub: "Your rate is fixed — every day of the year" },
                { label: "No hidden fees", sub: "Operator cost shown in full on every quote" },
                { label: "Funds never expire", sub: "EXJET Card deposits are fully refundable at any time" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0d1f3c]" strokeWidth={2} />
                  <div>
                    <p className="text-[12px] font-semibold text-[#0a1628]">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. IN-FLIGHT & GROUND SERVICES ══════════════ */}
      <section className="bg-[#f5f0eb] px-4 py-10">
        <div className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-7xl">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Curated Services</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">In-flight & ground arrangements</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { title: "Pet Travel",       sub: "Your animals fly in the cabin — no cargo holds, no compromise.",    icon: PawPrint },
              { title: "Family Cabins",    sub: "Purpose-configured interiors with curated children's provisions.",  icon: Baby },
              { title: "Private Dining",   sub: "Michelin-quality catering sourced to your destination and palate.", icon: ChefHat },
              { title: "Ground Services",  sub: "Transfers, hotels, yacht charters — coordinated in advance.",       icon: Car },
            ].map(({ title, sub, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f0eb]">
                  <Icon className="h-[18px] w-[18px] text-[#0d1f3c]" strokeWidth={1.5} />
                </div>
                <p className="mt-3 text-[14px] font-semibold text-[#0a1628]">{title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. FAQ ═══════════════════════════════════════ */}
      <section id="faq" className="bg-white px-4 py-10">
        <div className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-3xl">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">Common questions</p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#0a1628]">Private jet FAQs</h2>
          </div>
          <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-[#f5f0eb]">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group bg-white first:rounded-t-2xl last:rounded-b-2xl">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[13px] font-medium text-[#0a1628]">
                  {faq.q}
                  <Plus className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-45" strokeWidth={2} />
                </summary>
                <div className="border-t border-neutral-100 px-5 pb-4 pt-3 text-[13px] leading-relaxed text-neutral-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          <p className="mt-4 text-center text-[12px] text-neutral-400">
            Further questions?{" "}
            <Link href="/contact" className="text-[#0d1f3c] hover:underline">
              Speak with a senior advisor →
            </Link>
          </p>
        </div>
      </section>

      {/* ══ 8. CLOSING CTA ═══════════════════════════════ */}
      <section className="bg-[#f5f0eb] px-4 py-10">
        <div className="mx-auto max-w-lg sm:max-w-2xl lg:max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-[#0d1f3c] px-8 py-14 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)]">
                <PlaneTakeoff className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] font-normal text-white">
              Ready to depart?
            </h2>
            <p className="mt-3 text-[14px] text-[rgba(255,255,255,0.45)]">
              Reserve your aircraft in minutes — available around the clock, every day of the year.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[14px] font-medium text-[#0d1f3c] transition-opacity hover:opacity-90"
              >
                Search flights <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.25)] px-7 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
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
