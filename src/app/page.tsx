import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import popularRoutes from "@/data/popular-routes.json";
import emptyLegs from "@/data/empty-legs.json";
import faq from "@/data/faq.json";
import { formatCurrency } from "@/lib/utils";

const NAVY = "#07101e";
const GOLD = "#c4a052";
const CREAM = "#f0ebe0";

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

      {/* ── HERO — left/right split ────────────────────────────────────── */}
      <section className="flex min-h-screen flex-col lg:flex-row">

        {/* LEFT: Navy editorial panel */}
        <div
          className="relative flex flex-1 flex-col px-8 pb-14 pt-36 lg:px-16 lg:pb-20 lg:pt-44"
          style={{ backgroundColor: NAVY }}
        >
          {/* Gold rule + eyebrow */}
          <div className="flex items-center gap-4">
            <div className="h-px w-10 shrink-0" style={{ backgroundColor: GOLD }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
              Global Private Aviation
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mt-10 font-serif font-bold uppercase leading-[0.88] text-white"
            style={{ fontSize: "clamp(4.5rem, 11vw, 11rem)", letterSpacing: "-0.03em" }}
          >
            Fly
            <br />
            <em
              className="not-italic"
              style={{ color: GOLD }}
            >
              Any
            </em>
            <br />
            where.
          </h1>

          {/* Body */}
          <p className="mt-10 max-w-sm text-[14px] leading-[1.85] text-white/50">
            Private jet charter confirmed in under four hours. 5,000+ airports,
            2,400+ aircraft. No membership required. ARGUS Platinum safety on
            every flight.
          </p>

          {/* Bottom stats */}
          <div className="mt-auto pt-24">
            <div
              className="grid grid-cols-3 gap-6 border-t pt-8"
              style={{ borderColor: "rgba(255,255,255,0.10)" }}
            >
              {[
                ["5,000+", "Airports"],
                ["2,400+", "Aircraft"],
                ["< 4 hrs", "Confirmation"],
              ].map(([val, lbl]) => (
                <div key={lbl}>
                  <p
                    className="font-serif font-bold uppercase leading-none text-white"
                    style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}
                  >
                    {val}
                  </p>
                  <p
                    className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(255,255,255,0.30)" }}
                  >
                    {lbl}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: White search panel */}
        <div
          className="flex w-full flex-col justify-center border-t px-8 py-14 lg:w-[500px] lg:border-l lg:border-t-0 lg:px-12 lg:py-0"
          style={{ borderColor: "rgba(255,255,255,0.10)", backgroundColor: "#ffffff" }}
        >
          <p
            className="mb-8 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: "rgba(7,16,30,0.40)" }}
          >
            Plan your charter
          </p>
          <SearchBar variant="hero" />
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "rgba(7,16,30,0.08)" }} />
            <Link
              href="/empty-legs"
              className="font-mono text-[10px] uppercase tracking-[0.25em] transition-colors hover:opacity-70"
              style={{ color: "rgba(7,16,30,0.40)" }}
            >
              Browse repositioning flights
            </Link>
          </div>
        </div>
      </section>

      {/* ── REPOSITIONING FLIGHTS ─────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="mx-auto max-w-7xl px-8 py-24 sm:px-14">

          {/* Header */}
          <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
            <div>
              {/* Decorative large number */}
              <span
                className="block font-serif font-bold uppercase leading-none select-none"
                style={{
                  fontSize: "clamp(5rem, 12vw, 10rem)",
                  letterSpacing: "-0.04em",
                  color: "rgba(7,16,30,0.07)",
                  marginBottom: "-0.45em",
                }}
                aria-hidden
              >
                06
              </span>
              <h2
                className="relative font-serif font-bold uppercase leading-none"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  letterSpacing: "-0.025em",
                  color: NAVY,
                }}
              >
                Repositioning
                <br />
                Flights
              </h2>
            </div>
            <Link
              href="/empty-legs"
              className="group inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.25em] transition-opacity hover:opacity-60"
              style={{ color: NAVY }}
            >
              All departures
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>

          {/* Rows */}
          <div>
            {emptyLegs.slice(0, 6).map((leg, i) => {
              const date = new Date(leg.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <Link
                  key={leg.id}
                  href={`/booking?legId=${leg.id}`}
                  className="group block border-t py-7 transition-all hover:bg-white/60"
                  style={{ borderColor: "rgba(7,16,30,0.10)" }}
                >
                  <div className="flex flex-wrap items-center gap-5">
                    {/* Index */}
                    <span
                      className="hidden w-6 font-mono text-[10px] lg:block"
                      style={{ color: "rgba(7,16,30,0.22)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* IATA codes */}
                    <div className="flex items-baseline gap-3 lg:w-52">
                      <span
                        className="font-serif font-bold uppercase leading-none"
                        style={{ fontSize: "2.1rem", letterSpacing: "-0.02em", color: NAVY }}
                      >
                        {leg.from.code}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: GOLD }}>
                        ——
                      </span>
                      <span
                        className="font-serif font-bold uppercase leading-none"
                        style={{ fontSize: "2.1rem", letterSpacing: "-0.02em", color: NAVY }}
                      >
                        {leg.to.code}
                      </span>
                    </div>

                    {/* Cities */}
                    <span
                      className="hidden font-mono text-[11px] uppercase tracking-widest sm:block"
                      style={{ color: "rgba(7,16,30,0.40)" }}
                    >
                      {leg.from.city} to {leg.to.city}
                    </span>

                    <div className="flex-1" />

                    {/* Meta */}
                    <div className="hidden items-center gap-7 lg:flex">
                      {[date, leg.departTime, leg.aircraft, `${leg.capacity} seats`].map(
                        (m) => (
                          <span
                            key={m}
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color: "rgba(7,16,30,0.38)" }}
                          >
                            {m}
                          </span>
                        )
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-mono text-[10px] line-through"
                        style={{ color: "rgba(7,16,30,0.28)" }}
                      >
                        {formatCurrency(leg.retailPrice)}
                      </span>
                      <span
                        className="font-serif font-bold uppercase leading-none"
                        style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", color: NAVY }}
                      >
                        {formatCurrency(leg.price)}
                      </span>
                    </div>

                    <ArrowUpRight
                      className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: GOLD }}
                      strokeWidth={1.75}
                    />
                  </div>
                </Link>
              );
            })}
            <div
              className="border-t"
              style={{ borderColor: "rgba(7,16,30,0.10)" }}
            />
          </div>
        </div>
      </section>

      {/* ── THE FLEET ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#0d0d0d" }}>
        <div className="mx-auto max-w-7xl px-8 py-24 sm:px-14">

          <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="mb-5 h-px w-12" style={{ backgroundColor: GOLD }} />
              <h2
                className="font-serif font-bold uppercase leading-none text-white"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.025em" }}
              >
                Aircraft
                <br />
                Categories
              </h2>
            </div>
            <Link
              href="/search"
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/35 transition-colors hover:text-white"
            >
              Browse all →
            </Link>
          </div>

          <div>
            {fleetCategories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="group flex flex-wrap items-center gap-6 border-t py-8 transition-all duration-200 hover:pl-4"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <span
                  className="font-mono text-[10px]"
                  style={{ color: GOLD, width: "1.5rem" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className="font-serif font-bold uppercase leading-none text-white lg:w-72"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.02em" }}
                >
                  {cat.name}
                </span>

                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {[cat.pax, `${cat.range} nm range`, `${cat.speed} kts`].map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.32)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="ml-auto flex items-center gap-5">
                  <div className="text-right">
                    <p
                      className="font-mono text-[9px] uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,0.28)" }}
                    >
                      From
                    </p>
                    <p
                      className="font-serif font-bold uppercase leading-none text-white"
                      style={{ fontSize: "1.35rem", letterSpacing: "-0.02em" }}
                    >
                      {cat.from}
                      <span
                        className="ml-1 font-mono text-[10px] font-normal"
                        style={{ color: "rgba(255,255,255,0.32)" }}
                      >
                        /hr
                      </span>
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: GOLD }}
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            ))}
            <div
              className="border-t"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            />
          </div>
        </div>
      </section>

      {/* ── POPULAR CORRIDORS — card grid ────────────────────────────── */}
      <section style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-7xl px-8 py-24 sm:px-14">

          <div className="mb-14">
            <div className="mb-5 h-px w-12" style={{ backgroundColor: GOLD }} />
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2
                className="font-serif font-bold uppercase leading-none"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.025em", color: NAVY }}
              >
                Popular
                <br />
                Corridors
              </h2>
              <Link
                href="/search"
                className="font-mono text-[11px] uppercase tracking-[0.25em] transition-opacity hover:opacity-50"
                style={{ color: NAVY }}
              >
                All routes →
              </Link>
            </div>
          </div>

          {/* Gap-px card grid */}
          <div
            className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3"
            style={{ backgroundColor: "rgba(7,16,30,0.08)" }}
          >
            {popularRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/search?from=${route.from.code}&to=${route.to.code}`}
                className="group flex flex-col justify-between bg-white p-8 transition-colors hover:bg-[#f0ebe0]"
              >
                {/* Route codes */}
                <div className="flex items-baseline gap-3 mb-10">
                  <span
                    className="font-serif font-bold uppercase leading-none"
                    style={{ fontSize: "2.25rem", letterSpacing: "-0.025em", color: NAVY }}
                  >
                    {route.from.code}
                  </span>
                  <span className="font-mono text-[13px]" style={{ color: GOLD }}>
                    →
                  </span>
                  <span
                    className="font-serif font-bold uppercase leading-none"
                    style={{ fontSize: "2.25rem", letterSpacing: "-0.025em", color: NAVY }}
                  >
                    {route.to.code}
                  </span>
                </div>

                {/* Footer */}
                <div>
                  <p
                    className="font-mono text-[10px] uppercase tracking-widest mb-4"
                    style={{ color: "rgba(7,16,30,0.40)" }}
                  >
                    {route.from.city} — {route.to.city}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: "rgba(7,16,30,0.38)" }}
                    >
                      {route.flightTime}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-serif font-bold uppercase leading-none"
                        style={{ fontSize: "1.35rem", letterSpacing: "-0.02em", color: NAVY }}
                      >
                        {formatCurrency(route.fromPrice)}
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: GOLD }}
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STANDARDS ─────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="mx-auto max-w-7xl px-8 py-24 sm:px-14">

          <div className="mb-16">
            <div className="mb-5 h-px w-12" style={{ backgroundColor: GOLD }} />
            <h2
              className="font-serif font-bold uppercase leading-none text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.025em" }}
            >
              Our Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-0 border-t sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderColor: "rgba(255,255,255,0.10)" }}
          >
            {standards.map((s) => (
              <div
                key={s.title}
                className="border-b py-10 lg:border-b-0 lg:border-r lg:px-8 lg:py-0 lg:first:pl-0 lg:last:border-r-0"
                style={{ borderColor: "rgba(255,255,255,0.10)" }}
              >
                <p
                  className="font-serif font-bold uppercase leading-tight text-white"
                  style={{ fontSize: "1.15rem", letterSpacing: "-0.01em" }}
                >
                  {s.title}
                </p>
                <p
                  className="mt-4 text-[13px] leading-[1.85]"
                  style={{ color: "rgba(255,255,255,0.42)" }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="mx-auto max-w-3xl px-8 py-24 sm:px-14">

          <div className="mb-12">
            <div className="mb-5 h-px w-12" style={{ backgroundColor: GOLD }} />
            <h2
              className="font-serif font-bold uppercase leading-none"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.025em", color: NAVY }}
            >
              Common
              <br />
              Questions
            </h2>
          </div>

          <div>
            {faq.map((item, i) => (
              <details
                key={i}
                className="group border-t"
                style={{ borderColor: "rgba(7,16,30,0.10)" }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
                  <span
                    className="text-[15px] font-medium leading-snug"
                    style={{ color: NAVY }}
                  >
                    {item.q}
                  </span>
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center border transition-transform group-open:rotate-45"
                    style={{ borderColor: "rgba(7,16,30,0.18)", color: NAVY }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div
                  className="pb-7 text-[13px] leading-[1.9]"
                  style={{ color: "rgba(7,16,30,0.52)" }}
                >
                  {item.a}
                </div>
              </details>
            ))}
            <div
              className="border-t"
              style={{ borderColor: "rgba(7,16,30,0.10)" }}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#0d0d0d" }}>
        <div className="mx-auto max-w-7xl px-8 py-32 sm:px-14">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-end lg:justify-between">

            {/* Big word */}
            <div>
              <h2
                className="font-serif font-bold uppercase text-white"
                style={{
                  fontSize: "clamp(5rem, 16vw, 16rem)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.85,
                }}
              >
                De
                <br />
                part.
              </h2>
            </div>

            {/* Right: copy + actions */}
            <div className="max-w-sm">
              <div className="mb-6 h-px w-12" style={{ backgroundColor: GOLD }} />
              <p
                className="text-[14px] leading-[1.85]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Enter your route and receive aircraft options with confirmed
                pricing within four hours. No obligation. No membership required.
              </p>
              <div className="mt-10 flex flex-col gap-3">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] transition-opacity hover:opacity-85"
                  style={{ backgroundColor: GOLD, color: "#0d0d0d" }}
                >
                  Search Aircraft
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  href="/empty-legs"
                  className="inline-flex items-center justify-center gap-2 border px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60 transition-all hover:border-white/60 hover:text-white"
                  style={{ borderColor: "rgba(255,255,255,0.18)" }}
                >
                  Repositioning Flights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────── */
const fleetCategories = [
  { slug: "light",         name: "Light Jet",       pax: "4–7 pax",  range: "1,500", speed: "430", from: "$3,200"  },
  { slug: "midsize",       name: "Midsize",          pax: "7–9 pax",  range: "2,800", speed: "460", from: "$5,500"  },
  { slug: "super_midsize", name: "Super Midsize",    pax: "8–12 pax", range: "3,500", speed: "480", from: "$7,800"  },
  { slug: "heavy",         name: "Heavy Jet",        pax: "12–16 pax",range: "4,500", speed: "500", from: "$10,500" },
  { slug: "ultra_long",    name: "Ultra Long Range", pax: "14–19 pax",range: "7,500", speed: "520", from: "$16,000" },
];

const standards = [
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
    body: "Access the full fleet with a single booking. No initiation fee, no monthly minimums.",
  },
];
