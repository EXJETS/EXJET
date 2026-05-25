import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Shield, Clock, Headphones, CreditCard } from "lucide-react";
import SearchWidget from "@/components/search/search-widget";
import { CardCarousel } from "@/components/ui/card-carousel";
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

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#07101e] pb-12 pt-28">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1c2e] via-[#07101e] to-[#050e18]" />
        {/* Gold accent line at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c4a052]/40 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          {/* Headline */}
          <div className="mb-10 text-center">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.45em] text-white/28">
              EXJET &mdash; Global Private Aviation
            </p>
            <h1
              className="mx-auto font-serif font-bold uppercase leading-[0.88] text-white"
              style={{
                fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
                letterSpacing: "-0.03em",
                maxWidth: "14ch",
              }}
            >
              Charter your
              <br />
              <span className="text-[#c4a052]">flight.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-[15px] leading-[1.8] text-white/40">
              2,400+ aircraft across 5,000+ airports. Confirmed in under four hours.
            </p>
          </div>

          {/* Horizontal search widget */}
          <div className="mx-auto max-w-5xl">
            <SearchWidget />
          </div>

          {/* Quick links under search */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/empty-legs"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30 transition-colors hover:text-white/60"
            >
              Repositioning Deals →
            </Link>
            <span className="text-white/15">·</span>
            <Link
              href="/search"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30 transition-colors hover:text-white/60"
            >
              Browse Fleet →
            </Link>
            <span className="text-white/15">·</span>
            <Link
              href="/tracking"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30 transition-colors hover:text-white/60"
            >
              Live Tracking →
            </Link>
          </div>
        </div>
      </section>

      {/* ── STAT BAR ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[#07101e]/08 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex divide-x divide-[#07101e]/06 overflow-x-auto">
            {[
              { val: "5,000+", lbl: "Airports Worldwide" },
              { val: "2,400+", lbl: "Aircraft Available" },
              { val: "< 4 hrs", lbl: "Booking Confirmation" },
              { val: "24/7", lbl: "Dedicated Support" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="flex-1 shrink-0 px-6 py-5 text-center">
                <p
                  className="font-serif font-bold uppercase leading-none text-[#07101e]"
                  style={{ fontSize: "1.35rem", letterSpacing: "-0.02em" }}
                >
                  {val}
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#07101e]/38">
                  {lbl}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REPOSITIONING DEALS ───────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/06 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="relative mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
                Available Now
              </p>
              <h2
                className="font-serif font-bold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.025em" }}
              >
                Repositioning Deals
              </h2>
            </div>
            <Link
              href="/empty-legs"
              className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/40 transition-colors hover:text-[#07101e] sm:block"
            >
              All flights →
            </Link>
          </div>

          <CardCarousel
            itemClassName="w-[82%] sm:w-[50%] md:w-[36%] lg:w-[26%]"
            gap="gap-4"
          >
            {emptyLegs.map((leg) => {
              const dateStr = new Date(leg.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <Link
                  key={leg.id}
                  href={`/booking?legId=${leg.id}`}
                  className="group block h-full"
                >
                  <article className="flex h-full flex-col rounded-xl border border-[#07101e]/08 bg-white shadow-sm transition-all hover:border-[#07101e]/20 hover:shadow-md">
                    {/* Header gradient */}
                    <div
                      className="flex items-end justify-between rounded-t-xl px-5 py-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #07101e 0%, #1a3050 100%)",
                      }}
                    >
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-serif font-bold uppercase leading-none text-white"
                          style={{ fontSize: "1.65rem", letterSpacing: "-0.025em" }}
                        >
                          {leg.from.code}
                        </span>
                        <span className="font-mono text-sm text-[#c4a052]">→</span>
                        <span
                          className="font-serif font-bold uppercase leading-none text-white"
                          style={{ fontSize: "1.65rem", letterSpacing: "-0.025em" }}
                        >
                          {leg.to.code}
                        </span>
                      </div>
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/60">
                        {leg.category}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#07101e]/50">
                        {leg.from.city} to {leg.to.city}
                      </p>
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#07101e]/32">
                        {dateStr} &middot; {leg.departTime} &middot; {leg.capacity} seats
                      </p>
                      <div className="mt-auto flex items-end justify-between border-t border-[#07101e]/06 pt-4">
                        <div>
                          <p className="font-mono text-[9px] text-[#07101e]/28 line-through">
                            {formatCurrency(leg.retailPrice)}
                          </p>
                          <p
                            className="font-serif font-bold uppercase leading-none text-[#07101e]"
                            style={{ fontSize: "1.35rem", letterSpacing: "-0.02em" }}
                          >
                            {formatCurrency(leg.price)}
                          </p>
                        </div>
                        <span className="rounded-lg bg-[#07101e] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white transition-all group-hover:bg-[#c4a052] group-hover:text-[#07101e]">
                          Reserve
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </CardCarousel>
        </div>
      </section>

      {/* ── BROWSE BY AIRCRAFT CLASS ───────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-[#f5f3ef] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
                Fleet
              </p>
              <h2
                className="font-serif font-bold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.025em" }}
              >
                Browse by Aircraft Class
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/40 transition-colors hover:text-[#07101e] sm:block"
            >
              All aircraft →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {fleetCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: cat.bg, minHeight: "200px" }}
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
                    style={{
                      fontSize: "clamp(0.95rem, 1.8vw, 1.3rem)",
                      letterSpacing: "-0.02em",
                      color: cat.textColor,
                    }}
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

      {/* ── POPULAR CORRIDORS ──────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
                Routes
              </p>
              <h2
                className="font-serif font-bold uppercase leading-none text-[#07101e]"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.025em" }}
              >
                Top Corridors
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[#07101e]/40 transition-colors hover:text-[#07101e] sm:block"
            >
              Explore routes →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/search?from=${route.from.code}&to=${route.to.code}`}
                className="group flex items-center gap-4 rounded-xl border border-[#07101e]/08 bg-white px-5 py-4 shadow-sm transition-all hover:border-[#07101e]/18 hover:shadow-md"
              >
                <div className="flex shrink-0 items-baseline gap-2">
                  <span
                    className="font-serif font-bold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                  >
                    {route.from.code}
                  </span>
                  <span className="font-mono text-[10px] text-[#c4a052]">→</span>
                  <span
                    className="font-serif font-bold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                  >
                    {route.to.code}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[10px] uppercase tracking-widest text-[#07101e]/45">
                    {route.from.city} — {route.to.city}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#07101e]/28">
                    {route.flightTime} &middot; {route.recommended}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#07101e]/28">
                    from
                  </p>
                  <p
                    className="font-serif font-bold uppercase leading-none text-[#07101e]"
                    style={{ fontSize: "1.1rem", letterSpacing: "-0.02em" }}
                  >
                    {formatCurrency(route.fromPrice)}
                  </p>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-[#c4a052] opacity-0 transition-opacity group-hover:opacity-100"
                  strokeWidth={1.75}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY EXJET ──────────────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-[#f5f3ef] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
              Why EXJET
            </p>
            <h2
              className="font-serif font-bold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.025em" }}
            >
              Built on Safety &amp; Trust
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-[#07101e]/08 bg-white p-7 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#07101e]">
                  <s.Icon className="h-4.5 w-4.5 text-white" style={{ height: "18px", width: "18px" }} strokeWidth={2} />
                </div>
                <p
                  className="font-serif font-bold uppercase leading-tight text-[#07101e]"
                  style={{ fontSize: "1.05rem", letterSpacing: "-0.01em" }}
                >
                  {s.title}
                </p>
                <p className="mt-3 text-[13px] leading-[1.85] text-[#07101e]/50">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-[#07101e]/08 bg-white py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="mb-10">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#c4a052]">
              Support
            </p>
            <h2
              className="font-serif font-bold uppercase leading-none text-[#07101e]"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.025em" }}
            >
              Common Questions
            </h2>
          </div>

          <div className="divide-y divide-[#07101e]/06">
            {faq.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5">
                  <span className="text-[14px] font-medium text-[#07101e]">{item.q}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#07101e]/15 text-[#07101e]/45 transition-transform group-open:rotate-45">
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
                <div className="pb-5 text-[13px] leading-[1.9] text-[#07101e]/50">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-[#07101e] py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/28">
            Ready to fly
          </p>
          <h2
            className="font-serif font-bold uppercase leading-[0.9] text-white"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", letterSpacing: "-0.03em" }}
          >
            Request a quote.
            <br />
            <span className="text-[#c4a052]">Depart today.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[14px] leading-[1.8] text-white/38">
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-white/55 transition-all hover:border-white/35 hover:text-white"
            >
              Repositioning Flights
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Static data ─────────────────────────────────────────────────────────── */

const fleetCategories = [
  {
    slug: "light",
    name: "Light Jet",
    pax: "4–7 pax",
    from: "$3,200",
    bg: "linear-gradient(145deg,#dce8f8,#f0f6fd)",
    textColor: "#07101e",
    subColor: "rgba(7,16,30,0.45)",
    labelColor: "rgba(7,16,30,0.38)",
  },
  {
    slug: "midsize",
    name: "Midsize",
    pax: "7–9 pax",
    from: "$5,500",
    bg: "linear-gradient(145deg,#9ab8d4,#bdd0e4)",
    textColor: "#07101e",
    subColor: "rgba(7,16,30,0.50)",
    labelColor: "rgba(7,16,30,0.45)",
  },
  {
    slug: "super_midsize",
    name: "Super Midsize",
    pax: "8–12 pax",
    from: "$7,800",
    bg: "linear-gradient(145deg,#3a6494,#5580aa)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.55)",
    labelColor: "rgba(255,255,255,0.50)",
  },
  {
    slug: "heavy",
    name: "Heavy Jet",
    pax: "12–16 pax",
    from: "$10,500",
    bg: "linear-gradient(145deg,#1a3050,#2a4060)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.50)",
    labelColor: "rgba(255,255,255,0.45)",
  },
  {
    slug: "ultra_long",
    name: "Ultra Long Range",
    pax: "14–19 pax",
    from: "$16,000",
    bg: "linear-gradient(145deg,#07101e,#111e30)",
    textColor: "#ffffff",
    subColor: "rgba(255,255,255,0.45)",
    labelColor: "rgba(196,160,82,0.85)",
  },
];

const standards = [
  {
    Icon: Shield,
    title: "ARGUS Platinum",
    body: "Every operator holds ARGUS Platinum certification — the industry's highest independent safety rating.",
  },
  {
    Icon: Check,
    title: "Wyvern Wingman",
    body: "All aircraft and crews are Wyvern Wingman audited. Dual-rated captains on every flight.",
  },
  {
    Icon: Headphones,
    title: "24/7 Trip Support",
    body: "A dedicated aviation specialist manages every booking from enquiry through landing.",
  },
  {
    Icon: CreditCard,
    title: "No Membership",
    body: "Access the full fleet with a single booking. No initiation fee, no monthly minimums.",
  },
];
