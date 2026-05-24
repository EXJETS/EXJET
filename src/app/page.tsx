import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import HeroSearch from "@/components/search/hero-search";
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
      <section className="bg-[#f5f3ef] pt-20 pb-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">

            {/* Left: Brand + stats */}
            <div className="flex-1 pt-6 lg:pt-14">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.35em] text-[#07101e]/40">
                EXJET &mdash; Global Private Aviation
              </p>
              <h1
                className="font-serif font-bold uppercase leading-[0.9] text-[#07101e]"
                style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)", letterSpacing: "-0.03em" }}
              >
                Your jet.
                <br />
                <span className="text-[#c4a052]">Any airport.</span>
                <br />
                Any time.
              </h1>
              <p className="mt-7 max-w-md text-[15px] leading-[1.75] text-[#07101e]/55">
                Private jet charter confirmed in under four hours. 2,400+ aircraft
                across 5,000+ airports worldwide. No membership required.
              </p>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#07101e]/10 pt-8">
                {[
                  ["5,000+", "Airports"],
                  ["2,400+", "Aircraft"],
                  ["< 4 hrs", "Confirmation"],
                ].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p
                      className="font-serif font-bold uppercase leading-none text-[#07101e]"
                      style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}
                    >
                      {val}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#07101e]/38">
                      {lbl}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trust row */}
              <div className="mt-8 flex flex-wrap gap-4">
                {["ARGUS Platinum", "Wyvern Wingman", "24/7 Support"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#c4a052]" strokeWidth={2.5} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#07101e]/55">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Search form */}
            <div className="w-full rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(7,16,30,0.10)] lg:w-[420px] lg:shrink-0">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-[#07101e]/40">
                Plan your charter
              </p>
              <HeroSearch />
              <div className="mt-5 flex items-center justify-center gap-2">
                <Link
                  href="/empty-legs"
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#07101e]/38 transition-colors hover:text-[#07101e]"
                >
                  Browse repositioning flights →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AIRCRAFT CATEGORIES ───────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">Collections</p>
              <h2
                className="font-serif font-bold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
              >
                Browse the Fleet
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/45 transition-colors hover:text-[#07101e] sm:block"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {fleetCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
                style={{ background: cat.bg, minHeight: "190px" }}
              >
                <div className="p-4">
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.22em]"
                    style={{ color: cat.labelColor }}
                  >
                    {cat.pax}
                  </span>
                </div>
                <div className="p-4">
                  <p
                    className="font-serif font-bold uppercase leading-tight"
                    style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", letterSpacing: "-0.02em", color: cat.textColor }}
                  >
                    {cat.name}
                  </p>
                  <p
                    className="mt-1.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: cat.subColor }}
                  >
                    From {cat.from}/hr
                  </p>
                </div>
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
      <section className="border-t border-[#07101e]/08 bg-[#f5f3ef] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">Available Now</p>
              <h2
                className="font-serif font-bold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
              >
                Repositioning Flights
              </h2>
            </div>
            <Link
              href="/empty-legs"
              className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/45 transition-colors hover:text-[#07101e] sm:block"
            >
              All flights →
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
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif font-bold uppercase leading-none text-[#07101e]" style={{ fontSize: "1.85rem", letterSpacing: "-0.025em" }}>
                        {leg.from.code}
                      </span>
                      <span className="font-mono text-[11px] text-[#c4a052]">→</span>
                      <span className="font-serif font-bold uppercase leading-none text-[#07101e]" style={{ fontSize: "1.85rem", letterSpacing: "-0.025em" }}>
                        {leg.to.code}
                      </span>
                    </div>
                    <span className="rounded-full bg-[#f5f3ef] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#07101e]/50">
                      {leg.aircraft}
                    </span>
                  </div>
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#07101e]/38">
                    {leg.from.city} to {leg.to.city}
                  </p>
                  <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1">
                    {[date, leg.departTime, `${leg.capacity} seats`].map((m) => (
                      <span key={m} className="font-mono text-[10px] uppercase tracking-widest text-[#07101e]/38">{m}</span>
                    ))}
                  </div>
                  <div className="flex items-end justify-between border-t border-[#07101e]/06 pt-4">
                    <div>
                      <p className="font-mono text-[9px] text-[#07101e]/28 line-through">{formatCurrency(leg.retailPrice)}</p>
                      <p className="font-serif font-bold uppercase leading-none text-[#07101e]" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
                        {formatCurrency(leg.price)}
                      </p>
                    </div>
                    <span className="rounded-lg bg-[#07101e] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-all group-hover:bg-[#c4a052] group-hover:text-[#07101e]">
                      Reserve
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mb-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">Routes</p>
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
                className="group flex flex-wrap items-center gap-4 py-5 transition-colors hover:bg-[#f5f3ef] sm:gap-6"
              >
                <div className="flex w-40 shrink-0 items-baseline gap-2">
                  <span className="font-serif font-bold uppercase leading-none text-[#07101e]" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
                    {route.from.code}
                  </span>
                  <span className="font-mono text-[11px] text-[#c4a052]">→</span>
                  <span className="font-serif font-bold uppercase leading-none text-[#07101e]" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
                    {route.to.code}
                  </span>
                </div>
                <span className="hidden font-mono text-[11px] uppercase tracking-widest text-[#07101e]/38 sm:block">
                  {route.from.city} — {route.to.city}
                </span>
                <div className="ml-auto flex items-center gap-6">
                  <span className="hidden font-mono text-[11px] uppercase tracking-widest text-[#07101e]/35 sm:block">{route.flightTime}</span>
                  <span className="hidden rounded-full bg-[#f5f3ef] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#07101e]/50 sm:block">{route.recommended}</span>
                  <span className="font-serif font-bold uppercase leading-none text-[#07101e]" style={{ fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
                    {formatCurrency(route.fromPrice)}
                  </span>
                  <ArrowUpRight className="hidden h-4 w-4 text-[#c4a052] opacity-0 transition-opacity group-hover:opacity-100 sm:block" strokeWidth={1.75} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ─────────────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-[#f5f3ef] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">Why EXJET</p>
            <h2
              className="font-serif font-bold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}
            >
              Built on safety &amp; trust
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((s) => (
              <div key={s.title} className="rounded-xl border border-[#07101e]/08 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#07101e]">
                  <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <p className="font-serif font-bold uppercase leading-tight text-[#07101e]" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
                  {s.title}
                </p>
                <p className="mt-3 text-[13px] leading-[1.85] text-[#07101e]/52">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="mb-10">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">Support</p>
            <h2 className="font-serif font-bold uppercase leading-none text-[#07101e]" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.025em" }}>
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
                <div className="pb-5 text-[13px] leading-[1.9] text-[#07101e]/50">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-[#07101e] py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">Ready to fly</p>
          <h2 className="font-serif font-bold uppercase leading-[0.92] text-white" style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", letterSpacing: "-0.03em" }}>
            Request a quote.
            <br />
            Depart today.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[14px] leading-[1.8] text-white/42">
            Enter your route and receive aircraft options with confirmed pricing
            within four hours. No obligation.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c4a052] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e] transition-opacity hover:opacity-88"
            >
              Search Aircraft
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/empty-legs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60 transition-all hover:border-white/40 hover:text-white"
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
  { slug: "light",         name: "Light Jet",       pax: "4–7 pax",  from: "$3,200", bg: "linear-gradient(145deg,#dce8f8,#f0f6fd)", textColor: "#07101e", subColor: "rgba(7,16,30,0.45)", labelColor: "rgba(7,16,30,0.38)" },
  { slug: "midsize",       name: "Midsize",          pax: "7–9 pax",  from: "$5,500", bg: "linear-gradient(145deg,#9ab8d4,#bdd0e4)", textColor: "#07101e", subColor: "rgba(7,16,30,0.50)", labelColor: "rgba(7,16,30,0.45)" },
  { slug: "super_midsize", name: "Super Midsize",    pax: "8–12 pax", from: "$7,800", bg: "linear-gradient(145deg,#3a6494,#5580aa)", textColor: "#ffffff", subColor: "rgba(255,255,255,0.55)", labelColor: "rgba(255,255,255,0.50)" },
  { slug: "heavy",         name: "Heavy Jet",        pax: "12–16 pax",from: "$10,500",bg: "linear-gradient(145deg,#1a3050,#2a4060)", textColor: "#ffffff", subColor: "rgba(255,255,255,0.50)", labelColor: "rgba(255,255,255,0.45)" },
  { slug: "ultra_long",    name: "Ultra Long Range", pax: "14–19 pax",from: "$16,000",bg: "linear-gradient(145deg,#07101e,#111e30)", textColor: "#ffffff", subColor: "rgba(255,255,255,0.45)", labelColor: "rgba(196,160,82,0.85)" },
];

const standards = [
  { title: "ARGUS Platinum",   body: "Every operator holds ARGUS Platinum certification — the industry's highest independent safety rating." },
  { title: "Wyvern Wingman",   body: "All aircraft and crews are Wyvern Wingman audited. Dual-rated captains on every flight." },
  { title: "24/7 Trip Support",body: "A dedicated aviation specialist manages every booking from enquiry through landing." },
  { title: "No Membership",    body: "Access the full fleet with a single booking. No initiation fee, no monthly minimums." },
];
