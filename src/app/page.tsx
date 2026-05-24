import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
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

      {/* ── ANNOUNCEMENT BAR ──────────────────────────────────────────── */}
      <div className="bg-[#07101e] px-4 py-2.5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
          Confirmed within 4 hours &nbsp;·&nbsp; 5,000+ airports worldwide &nbsp;·&nbsp; ARGUS Platinum safety
        </p>
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="bg-[#f4f7fc] pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">

          {/* Headline */}
          <div className="mb-10 text-center">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[#07101e]/40">
              EXJET &mdash; Global Private Aviation
            </p>
            <h1
              className="font-serif font-bold uppercase leading-[0.92] text-[#07101e]"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)", letterSpacing: "-0.03em" }}
            >
              Your jet,
              <br />
              <span className="text-[#c4a052]">any airport.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.75] text-[#07101e]/55">
              Charter a private jet in minutes. 2,400+ aircraft available across
              5,000 airports — no membership, no minimums.
            </p>
          </div>

          {/* Search */}
          <div className="rounded-2xl bg-white p-4 shadow-[0_8px_40px_rgba(7,16,30,0.10)]">
            <SearchBar variant="hero" />
          </div>

          {/* Category shortcuts */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {fleetCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="rounded-full border border-[#07101e]/12 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#07101e]/60 shadow-sm transition-all hover:border-[#c4a052] hover:text-[#07101e]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWSE THE FLEET ──────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
                Collections
              </p>
              <h2
                className="font-serif font-bold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
              >
                Browse the Fleet
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/50 transition-colors hover:text-[#07101e] sm:flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          {/* Aircraft category cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {fleetCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl p-5 transition-shadow hover:shadow-lg"
                style={{ background: cat.bg, minHeight: "200px" }}
              >
                {/* Top label */}
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.25em]"
                  style={{ color: cat.labelColor }}
                >
                  {cat.pax}
                </span>

                {/* Category name */}
                <div>
                  <p
                    className="font-serif font-bold uppercase leading-tight"
                    style={{
                      fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                      letterSpacing: "-0.02em",
                      color: cat.textColor,
                    }}
                  >
                    {cat.name}
                  </p>
                  <p
                    className="mt-2 font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: cat.subColor }}
                  >
                    From {cat.from}/hr
                  </p>
                </div>

                {/* Arrow */}
                <ArrowUpRight
                  className="absolute bottom-4 right-4 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: cat.textColor }}
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── REPOSITIONING FLIGHTS ─────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-[#f7f8fa] py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
                Available Now
              </p>
              <h2
                className="font-serif font-bold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
              >
                Repositioning Flights
              </h2>
            </div>
            <Link
              href="/empty-legs"
              className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/50 transition-colors hover:text-[#07101e] sm:flex"
            >
              All flights <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="group rounded-xl border border-[#07101e]/08 bg-white p-6 shadow-sm transition-all hover:border-[#c4a052]/40 hover:shadow-md"
                >
                  {/* Route */}
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-serif font-bold uppercase leading-none text-[#07101e]"
                        style={{ fontSize: "2rem", letterSpacing: "-0.025em" }}
                      >
                        {leg.from.code}
                      </span>
                      <span className="font-mono text-[11px] text-[#c4a052]">→</span>
                      <span
                        className="font-serif font-bold uppercase leading-none text-[#07101e]"
                        style={{ fontSize: "2rem", letterSpacing: "-0.025em" }}
                      >
                        {leg.to.code}
                      </span>
                    </div>
                    <span className="rounded-full bg-[#f4f7fc] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#07101e]/50">
                      {leg.aircraft}
                    </span>
                  </div>

                  {/* Cities */}
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#07101e]/40">
                    {leg.from.city} to {leg.to.city}
                  </p>

                  {/* Meta row */}
                  <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1">
                    {[date, leg.departTime, `${leg.capacity} seats`].map((m) => (
                      <span
                        key={m}
                        className="font-mono text-[10px] uppercase tracking-widest text-[#07101e]/40"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-end justify-between border-t border-[#07101e]/06 pt-4">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[#07101e]/30 line-through">
                        {formatCurrency(leg.retailPrice)}
                      </p>
                      <p
                        className="font-serif font-bold uppercase leading-none text-[#07101e]"
                        style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}
                      >
                        {formatCurrency(leg.price)}
                      </p>
                    </div>
                    <span className="rounded-lg bg-[#07101e] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors group-hover:bg-[#c4a052] group-hover:text-[#07101e]">
                      Reserve
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/empty-legs"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#07101e]/12 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/60"
            >
              View all flights <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">

          <div className="mb-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
              Routes
            </p>
            <h2
              className="font-serif font-bold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
            >
              Popular Corridors
            </h2>
          </div>

          <div className="divide-y divide-[#07101e]/06">
            {popularRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/search?from=${route.from.code}&to=${route.to.code}`}
                className="group flex flex-wrap items-center gap-4 py-5 transition-colors hover:bg-[#f7f8fa] sm:gap-6"
              >
                {/* IATA */}
                <div className="flex w-40 items-baseline gap-2 shrink-0">
                  <span
                    className="font-serif font-bold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}
                  >
                    {route.from.code}
                  </span>
                  <span className="font-mono text-[11px] text-[#c4a052]">→</span>
                  <span
                    className="font-serif font-bold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}
                  >
                    {route.to.code}
                  </span>
                </div>

                {/* Cities */}
                <span className="hidden font-mono text-[11px] uppercase tracking-widest text-[#07101e]/40 sm:block">
                  {route.from.city} — {route.to.city}
                </span>

                <div className="ml-auto flex items-center gap-6">
                  <span className="hidden font-mono text-[11px] uppercase tracking-widest text-[#07101e]/38 sm:block">
                    {route.flightTime}
                  </span>
                  <span className="hidden rounded-full bg-[#f4f7fc] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#07101e]/50 sm:block">
                    {route.recommended}
                  </span>
                  <span
                    className="font-serif font-bold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.2rem", letterSpacing: "-0.02em" }}
                  >
                    {formatCurrency(route.fromPrice)}
                  </span>
                  <ArrowUpRight
                    className="hidden h-4 w-4 text-[#c4a052] opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                    strokeWidth={1.75}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / WHY EXJET ─────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-[#f7f8fa] py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">

          <div className="mb-10 text-center">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
              Why EXJET
            </p>
            <h2
              className="font-serif font-bold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
            >
              Built on safety &amp; trust
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-[#07101e]/08 bg-white p-7 shadow-sm"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#07101e]">
                  <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <p
                  className="font-serif font-bold uppercase leading-tight text-[#07101e]"
                  style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}
                >
                  {s.title}
                </p>
                <p className="mt-3 text-[13px] leading-[1.85] text-[#07101e]/55">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">

          <div className="mb-10">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
              Support
            </p>
            <h2
              className="font-serif font-bold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
            >
              Common Questions
            </h2>
          </div>

          <div className="divide-y divide-[#07101e]/06">
            {faq.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5">
                  <span className="text-[14px] font-medium text-[#07101e]">{item.q}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#07101e]/15 text-[#07101e]/50 transition-transform group-open:rotate-45">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-5 text-[13px] leading-[1.9] text-[#07101e]/52">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-[#07101e] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
            Ready to fly
          </p>
          <h2
            className="font-serif font-bold uppercase leading-[0.92] text-white"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", letterSpacing: "-0.03em" }}
          >
            Request a quote.
            <br />
            Depart today.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[14px] leading-[1.8] text-white/45">
            Enter your route and receive aircraft options with confirmed pricing
            within four hours. No obligation.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-[#c4a052] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e] transition-opacity hover:opacity-88"
            >
              Search Aircraft
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/empty-legs"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/65 transition-all hover:border-white/40 hover:text-white"
            >
              Repositioning Flights
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────── */
const fleetCategories = [
  {
    slug: "light",
    name: "Light Jet",
    pax: "4–7 passengers",
    range: "1,500",
    speed: "430",
    from: "$3,200",
    bg: "linear-gradient(145deg, #e8f0f8 0%, #d4e4f4 100%)",
    textColor: "#07101e",
    subColor: "rgba(7,16,30,0.45)",
    labelColor: "rgba(7,16,30,0.40)",
  },
  {
    slug: "midsize",
    name: "Midsize",
    pax: "7–9 passengers",
    range: "2,800",
    speed: "460",
    from: "$5,500",
    bg: "linear-gradient(145deg, #b8d0e8 0%, #98b8d8 100%)",
    textColor: "#07101e",
    subColor: "rgba(7,16,30,0.50)",
    labelColor: "rgba(7,16,30,0.45)",
  },
  {
    slug: "super_midsize",
    name: "Super Midsize",
    pax: "8–12 passengers",
    range: "3,500",
    speed: "480",
    from: "$7,800",
    bg: "linear-gradient(145deg, #3a6494 0%, #2a4a74 100%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.55)",
    labelColor: "rgba(255,255,255,0.50)",
  },
  {
    slug: "heavy",
    name: "Heavy Jet",
    pax: "12–16 passengers",
    range: "4,500",
    speed: "500",
    from: "$10,500",
    bg: "linear-gradient(145deg, #1a3050 0%, #0e2038 100%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.50)",
    labelColor: "rgba(255,255,255,0.45)",
  },
  {
    slug: "ultra_long",
    name: "Ultra Long Range",
    pax: "14–19 passengers",
    range: "7,500",
    speed: "520",
    from: "$16,000",
    bg: "linear-gradient(145deg, #07101e 0%, #020810 100%)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.45)",
    labelColor: "rgba(196,160,82,0.90)",
  },
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
