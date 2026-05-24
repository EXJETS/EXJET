import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import popularRoutes from "@/data/popular-routes.json";
import emptyLegs from "@/data/empty-legs.json";
import faq from "@/data/faq.json";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col bg-[#07101e]">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(26,95,168,0.18) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-12 pt-36 sm:px-8 lg:pt-44">
          {/* Headline */}
          <div className="max-w-4xl">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
              EXJET &mdash; Global Private Aviation
            </p>
            <h1
              className="font-serif font-semibold uppercase text-white"
              style={{
                fontSize: "clamp(3.5rem, 9vw, 9rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.025em",
              }}
            >
              The world,
              <br />
              <span className="text-white/30">on your</span>
              <br />
              schedule.
            </h1>
          </div>

          {/* Search */}
          <div className="mt-14 w-full max-w-5xl rounded-xl border border-white/10 bg-white/95 p-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] backdrop-blur">
            <SearchBar variant="hero" />
          </div>

          {/* Footer stats — understated */}
          <div className="mt-auto pt-20">
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-white/10 pt-8">
              {[
                ["5,000+", "Airports worldwide"],
                ["2,400+", "Aircraft available"],
                ["< 4 hrs", "Average confirmation"],
                ["ARGUS Platinum", "Safety standard"],
              ].map(([val, label]) => (
                <div key={label} className="flex items-baseline gap-2.5">
                  <span className="font-serif text-[1.35rem] font-semibold uppercase leading-none tracking-tight text-white">
                    {val}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REPOSITIONING FLIGHTS ──────────────────────────────────────── */}
      <section className="border-b border-[#e8eef6] bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#1a5fa8]">
                Available Now
              </p>
              <h2
                className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", letterSpacing: "-0.02em" }}
              >
                Repositioning
                <br />
                Flights
              </h2>
            </div>
            <Link
              href="/empty-legs"
              className="inline-flex items-center gap-2 border-b border-[#07101e]/20 pb-0.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e] transition-colors hover:border-[#1a5fa8] hover:text-[#1a5fa8]"
            >
              View all departures
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          {/* Clean list — not cards */}
          <div className="divide-y divide-[#e8eef6]">
            {emptyLegs.slice(0, 6).map((leg) => {
              const date = new Date(leg.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <Link
                  key={leg.id}
                  href={`/booking?legId=${leg.id}`}
                  className="group flex flex-col gap-4 py-6 transition-colors hover:bg-[#f5f7fa] sm:flex-row sm:items-center sm:gap-8"
                >
                  {/* Route */}
                  <div className="flex items-baseline gap-3 sm:w-56">
                    <span
                      className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                      style={{ fontSize: "1.6rem", letterSpacing: "-0.01em" }}
                    >
                      {leg.from.code}
                    </span>
                    <span className="font-mono text-[10px] text-[#7a90a8]">→</span>
                    <span
                      className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                      style={{ fontSize: "1.6rem", letterSpacing: "-0.01em" }}
                    >
                      {leg.to.code}
                    </span>
                  </div>

                  {/* Cities */}
                  <div className="hidden text-[13px] text-[#4a6080] sm:block sm:w-48">
                    {leg.from.city} &rarr; {leg.to.city}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-6 text-[12px] text-[#7a90a8]">
                    <span className="font-mono uppercase tracking-widest">{date}</span>
                    <span className="font-mono uppercase tracking-widest">{leg.departTime}</span>
                    <span className="font-mono uppercase tracking-widest">{leg.aircraft}</span>
                    <span className="font-mono uppercase tracking-widest">
                      {leg.capacity} seats
                    </span>
                  </div>

                  {/* Price */}
                  <div className="ml-auto flex items-center gap-5 text-right">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#7a90a8] line-through">
                        {formatCurrency(leg.retailPrice)}
                      </p>
                      <p
                        className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                        style={{ fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                      >
                        {formatCurrency(leg.price)}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-5 w-5 text-[#1a5fa8] opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={1.75}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── THE FLEET ─────────────────────────────────────────────────── */}
      <section className="bg-[#07101e] py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#1a5fa8]">
                Aircraft
              </p>
              <h2
                className="font-serif font-semibold uppercase leading-none text-white"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", letterSpacing: "-0.02em" }}
              >
                The Fleet
              </h2>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 border-b border-white/20 pb-0.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60 transition-colors hover:border-white hover:text-white"
            >
              Browse all aircraft
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="divide-y divide-white/8">
            {fleetCategories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="group flex flex-col gap-4 py-7 transition-colors hover:bg-white/4 sm:flex-row sm:items-center sm:gap-12"
              >
                <span className="w-8 font-mono text-[11px] text-white/25">
                  0{i + 1}
                </span>
                <div className="sm:w-52">
                  <p
                    className="font-serif font-semibold uppercase leading-none text-white"
                    style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}
                  >
                    {cat.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-10 gap-y-2 text-[12px] text-white/40">
                  <span className="font-mono uppercase tracking-widest">
                    {cat.pax}
                  </span>
                  <span className="font-mono uppercase tracking-widest">
                    {cat.range} nm range
                  </span>
                  <span className="font-mono uppercase tracking-widest">
                    {cat.speed} kts
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                      From
                    </p>
                    <p
                      className="font-serif font-semibold uppercase leading-none text-white"
                      style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}
                    >
                      {cat.from}
                      <span className="ml-1 font-mono text-[11px] font-normal text-white/40">/hr</span>
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 text-[#1a5fa8] opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ────────────────────────────────────────────── */}
      <section className="border-b border-[#e8eef6] bg-[#f5f7fa] py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#1a5fa8]">
                Routes
              </p>
              <h2
                className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", letterSpacing: "-0.02em" }}
              >
                Popular
                <br />
                Corridors
              </h2>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 border-b border-[#07101e]/20 pb-0.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e] transition-colors hover:border-[#1a5fa8] hover:text-[#1a5fa8]"
            >
              All routes
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          {/* Table header */}
          <div className="mb-2 grid grid-cols-12 gap-4 border-b border-[#d5e0ee] pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a90a8]">
            <div className="col-span-5">Route</div>
            <div className="col-span-2 hidden sm:block">Flight time</div>
            <div className="col-span-2 hidden sm:block">Category</div>
            <div className="col-span-2 text-right sm:col-span-3">Charter from</div>
          </div>

          <div className="divide-y divide-[#e8eef6]">
            {popularRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/search?from=${route.from.code}&to=${route.to.code}`}
                className="group grid grid-cols-12 items-center gap-4 py-5 transition-colors hover:bg-white"
              >
                <div className="col-span-7 flex items-baseline gap-2 sm:col-span-5">
                  <span
                    className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.35rem", letterSpacing: "-0.01em" }}
                  >
                    {route.from.code}
                  </span>
                  <span className="font-mono text-[10px] text-[#7a90a8]">→</span>
                  <span
                    className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.35rem", letterSpacing: "-0.01em" }}
                  >
                    {route.to.code}
                  </span>
                  <span className="hidden text-[12px] text-[#4a6080] sm:block">
                    {route.from.city} &rarr; {route.to.city}
                  </span>
                </div>
                <div className="col-span-2 hidden font-mono text-[12px] text-[#7a90a8] sm:block">
                  {route.flightTime}
                </div>
                <div className="col-span-2 hidden font-mono text-[12px] uppercase tracking-widest text-[#7a90a8] sm:block">
                  {route.recommended}
                </div>
                <div className="col-span-5 flex items-center justify-end gap-4 sm:col-span-3">
                  <span
                    className="font-serif font-semibold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.2rem", letterSpacing: "-0.01em" }}
                  >
                    {formatCurrency(route.fromPrice)}
                  </span>
                  <ArrowUpRight
                    className="hidden h-4 w-4 text-[#1a5fa8] opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STANDARDS ─────────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-14">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#1a5fa8]">
              Safety &amp; Standards
            </p>
            <h2
              className="font-serif font-semibold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", letterSpacing: "-0.02em" }}
            >
              Our Commitment
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-[#e8eef6] sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "ARGUS Platinum",
                body: "Every operator holds ARGUS Platinum certification — the industry's highest independent safety rating.",
              },
              {
                title: "Wyvern Wingman",
                body: "All aircraft and crews are Wyvern Wingman audited. Dual-rated captains on every flight.",
              },
              {
                title: "24/7 Trip Support",
                body: "A dedicated aviation specialist manages every booking from enquiry through landing.",
              },
              {
                title: "No Membership",
                body: "Access the full fleet with a single booking. No initiation fee, no monthly minimums, no blackout dates.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white px-8 py-10">
                <p
                  className="font-serif font-semibold uppercase leading-tight text-[#07101e]"
                  style={{ fontSize: "1.25rem", letterSpacing: "-0.01em" }}
                >
                  {item.title}
                </p>
                <p className="mt-4 text-[13px] leading-[1.85] text-[#4a6080]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="border-t border-[#e8eef6] bg-[#f5f7fa] py-24">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="mb-12">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#1a5fa8]">
              Information
            </p>
            <h2
              className="font-serif font-semibold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", letterSpacing: "-0.02em" }}
            >
              Frequently
              <br />
              Asked
            </h2>
          </div>

          <div className="divide-y divide-[#e8eef6]">
            {faq.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 transition-colors hover:text-[#1a5fa8]">
                  <span className="text-[15px] font-medium text-[#07101e] group-hover:text-[#1a5fa8]">
                    {item.q}
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#d5e0ee] text-[#4a6080] transition-all group-open:rotate-45 group-open:border-[#1a5fa8] group-open:text-[#1a5fa8]">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-6 text-[13px] leading-[1.9] text-[#4a6080]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-[#07101e] py-32">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
            Ready to Depart
          </p>
          <h2
            className="font-serif font-semibold uppercase leading-none text-white"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)", letterSpacing: "-0.025em" }}
          >
            Request
            <br />
            a Quote
          </h2>
          <p className="mx-auto mt-8 max-w-md text-[14px] leading-[1.85] text-white/45">
            Enter your route and receive aircraft options with confirmed pricing
            within four hours. No obligation.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2.5 rounded-none border border-white bg-white px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e] transition-all hover:bg-[#1a5fa8] hover:border-[#1a5fa8] hover:text-white"
            >
              Search Aircraft
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/empty-legs"
              className="inline-flex items-center gap-2.5 rounded-none border border-white/20 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70 transition-all hover:border-white hover:text-white"
            >
              Repositioning Flights
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Fleet data ───────────────────────────────────────────────────────── */
const fleetCategories = [
  { slug: "light",         name: "Light Jet",         pax: "4–7 passengers",  range: "1,500", speed: "430", from: "$3,200" },
  { slug: "midsize",       name: "Midsize",            pax: "7–9 passengers",  range: "2,800", speed: "460", from: "$5,500" },
  { slug: "super_midsize", name: "Super Midsize",      pax: "8–12 passengers", range: "3,500", speed: "480", from: "$7,800" },
  { slug: "heavy",         name: "Heavy Jet",          pax: "12–16 passengers",range: "4,500", speed: "500", from: "$10,500"},
  { slug: "ultra_long",    name: "Ultra Long Range",   pax: "14–19 passengers",range: "7,500", speed: "520", from: "$16,000"},
];
