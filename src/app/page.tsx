import Link from "next/link";
import { ArrowRight, ArrowUpRight, PlaneTakeoff } from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { EmptyLegCard } from "@/components/booking/empty-leg-card";
import popularRoutes from "@/data/popular-routes.json";
import emptyLegs from "@/data/empty-legs.json";
import faq from "@/data/faq.json";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EXJET",
    url: "https://exjet.com",
    logo: "https://exjet.com/icon.svg",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Reservations",
      availableLanguage: ["English"],
      areaServed: "Worldwide",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EXJET",
    url: "https://exjet.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://exjet.com/search?from={from}&to={to}",
      "query-input": "required name=from required name=to",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ============================================================
          HERO — Full viewport, dark navy
          ============================================================ */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pt-28 pb-12 sm:px-8 lg:pt-36">
          {/* Status bar */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/80">
                Live &middot; {emptyLegs.length} Empty Legs Available
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="mt-10 text-center">
            <h1 className="font-serif font-semibold uppercase leading-none tracking-tight">
              <span
                className="block text-white"
                style={{ fontSize: "clamp(3rem, 9vw, 8.5rem)", lineHeight: "0.93", letterSpacing: "-0.02em" }}
              >
                Private Jet Charter
              </span>
              <span
                className="mt-2 block text-[var(--color-champagne)]"
                style={{ fontSize: "clamp(2rem, 6vw, 5.5rem)", lineHeight: "1.0", letterSpacing: "-0.015em" }}
              >
                Confirmed in Under 4 Hours.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-white/55">
              5,000+ airports &middot; 2,400+ aircraft &middot; ARGUS Platinum safety &middot; No membership
            </p>
          </div>

          {/* Search panel */}
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.55)]">
              <SearchBar variant="hero" />
            </div>
          </div>

          {/* KPI strip */}
          <div className="mt-auto pt-16">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
              <KpiStat label="Airports" value="5,000+" />
              <KpiStat label="Network Tails" value="2,400+" />
              <KpiStat label="Avg. Confirm" value="&lt; 4 hr" />
              <KpiStat label="Safety Rating" value="ARGUS Platinum" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          EMPTY LEGS — White background, 4-column grid
          ============================================================ */}
      <section id="empty-legs" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-[2.25rem] font-semibold uppercase leading-none tracking-tight text-[var(--color-ink)] sm:text-[2.75rem]">
                Live Empty Legs
              </h2>
              <span className="inline-flex items-center rounded border border-[var(--color-champagne)]/30 bg-[var(--color-champagne)]/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-champagne)]">
                Up to 75% Off
              </span>
            </div>
            <Link
              href="/empty-legs"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-champagne)] transition-colors hover:text-[var(--color-ink)]"
            >
              Browse all
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
          </div>

          {/* 4-column grid */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {emptyLegs.slice(0, 4).map((leg) => (
              <EmptyLegCard key={leg.id} leg={leg} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FLEET CATEGORIES — Navy background
          ============================================================ */}
      <section className="bg-[var(--color-ink)] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="text-center font-serif text-[2.25rem] font-semibold uppercase leading-none tracking-tight text-white sm:text-[2.75rem]">
            Select Your Aircraft Class
          </h2>

          {/* Horizontal scroll on mobile, 5 columns on desktop */}
          <div className="mt-10 flex gap-4 overflow-x-auto pb-4 sm:pb-0 lg:grid lg:grid-cols-5">
            {fleetCategories.map((cat) => (
              <FleetCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — Off-white background, 3-column grid
          ============================================================ */}
      <section className="bg-[var(--color-ivory)] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="font-serif text-[2.25rem] font-semibold uppercase leading-none tracking-tight text-[var(--color-ink)] sm:text-[2.75rem]">
            How It Works
          </h2>

          <div className="mt-10 grid grid-cols-1 divide-y divide-[var(--color-hairline)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <HowItWorksStep
              number="01"
              title="Search"
              description="Enter route, date, and passengers. Instantly see available aircraft with live pricing."
            />
            <HowItWorksStep
              number="02"
              title="Select"
              description="Compare aircraft by range, speed, cabin, and amenities. No hidden fees."
            />
            <HowItWorksStep
              number="03"
              title="Confirm"
              description="Dedicated trip specialist confirms your charter within 4 hours. ARGUS-vetted crew."
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          POPULAR ROUTES — White background, table layout
          ============================================================ */}
      <section id="popular-routes" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-[2.25rem] font-semibold uppercase leading-none tracking-tight text-[var(--color-ink)] sm:text-[2.75rem]">
              Popular Routes
            </h2>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-champagne)] transition-colors hover:text-[var(--color-ink)]"
            >
              View all routes
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
          </div>

          {/* Routes table */}
          <div className="mt-8 overflow-hidden rounded-xl border border-[var(--color-hairline)]">
            {/* Table header */}
            <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-6 border-b border-[var(--color-hairline)] bg-[var(--color-ivory)] px-6 py-3 sm:grid">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">Route</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">Time</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">Distance</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">Aircraft</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">From</span>
            </div>

            {popularRoutes.map((route, idx) => (
              <RouteRow key={route.id} route={route} isLast={idx === popularRoutes.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST / SAFETY STRIP — Navy background
          ============================================================ */}
      <section className="bg-[var(--color-ink)] py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            <TrustPillar
              title="ARGUS Platinum"
              description="The aviation industry's highest independent safety rating, held by every operator in our network."
            />
            <TrustPillar
              title="Wyvern Wingman"
              description="All operators independently audited for safety management systems and crew qualifications."
            />
            <TrustPillar
              title="24/7 Concierge"
              description="Live trip specialists on call around the clock — no automated phone trees, ever."
            />
            <TrustPillar
              title="Zero Membership Fees"
              description="Pay per flight. No initiation fees, no monthly minimums, no hidden charges."
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          CLOSING CTA — Dark navy mesh
          ============================================================ */}
      <section className="relative overflow-hidden py-28 text-center">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <h2
            className="font-serif font-semibold uppercase text-white"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: "0.94", letterSpacing: "-0.02em" }}
          >
            Ready to Fly?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.75] text-white/60">
            Choose a route. Select an aircraft. Confirm in minutes.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded bg-white px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-colors hover:bg-white/90"
            >
              Search Jets
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/empty-legs"
              className="inline-flex items-center gap-2 rounded border border-white/30 px-7 py-3.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white/10"
            >
              View Empty Legs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const fleetCategories = [
  {
    slug: "light",
    name: "Light",
    pax: "4–7 pax",
    range: "1,500 nm",
    fromPrice: "$3,200/hr",
  },
  {
    slug: "midsize",
    name: "Midsize",
    pax: "7–9 pax",
    range: "2,800 nm",
    fromPrice: "$5,500/hr",
  },
  {
    slug: "super_midsize",
    name: "Super Midsize",
    pax: "8–12 pax",
    range: "3,500 nm",
    fromPrice: "$7,800/hr",
  },
  {
    slug: "heavy",
    name: "Heavy",
    pax: "12–16 pax",
    range: "4,500 nm",
    fromPrice: "$10,500/hr",
  },
  {
    slug: "ultra_long",
    name: "Ultra Long Range",
    pax: "14–19 pax",
    range: "7,500 nm",
    fromPrice: "$16,000/hr",
  },
];

/* ------------------------------------------------------------------ */
/* Components                                                           */
/* ------------------------------------------------------------------ */

function KpiStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-white/5 px-5 py-6 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
        {label}
      </span>
      <span
        className="font-serif font-semibold uppercase text-white"
        style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", lineHeight: "1" }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

function FleetCard({
  category,
}: {
  category: (typeof fleetCategories)[number];
}) {
  return (
    <Link
      href={`/search?category=${category.slug}`}
      className="group flex min-w-[200px] flex-col rounded-xl border border-white/15 bg-white p-6 transition-all duration-200 hover:border-transparent hover:bg-[var(--color-champagne)] lg:min-w-0"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)] transition-colors group-hover:text-white/60">
        Aircraft Class
      </span>
      <h3 className="mt-3 font-serif text-[1.35rem] font-semibold uppercase leading-none tracking-tight text-[var(--color-ink)] transition-colors group-hover:text-white">
        {category.name}
      </h3>
      <div className="mt-4 space-y-1.5">
        <div className="font-mono text-[11px] text-[var(--color-subtle)] transition-colors group-hover:text-white/70">
          {category.pax}
        </div>
        <div className="font-mono text-[11px] text-[var(--color-subtle)] transition-colors group-hover:text-white/70">
          {category.range} range
        </div>
      </div>
      <div className="mt-5 border-t border-[var(--color-hairline)] pt-4 transition-colors group-hover:border-white/20">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-champagne)] transition-colors group-hover:text-white">
          From {category.fromPrice}
        </span>
      </div>
    </Link>
  );
}

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="px-8 py-10 first:pl-0 last:pr-0 sm:first:pl-0 sm:last:pr-0">
      <span
        className="font-serif font-bold text-[var(--color-champagne)]"
        style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)", lineHeight: "1", letterSpacing: "-0.02em" }}
      >
        {number}
      </span>
      <h3 className="mt-4 font-serif text-[1.5rem] font-semibold uppercase leading-none tracking-tight text-[var(--color-ink)]">
        {title}
      </h3>
      <p className="mt-3 text-[14px] leading-[1.8] text-[var(--color-muted)]">
        {description}
      </p>
    </div>
  );
}

function RouteRow({
  route,
  isLast,
}: {
  route: (typeof popularRoutes)[number];
  isLast: boolean;
}) {
  return (
    <Link
      href={`/search?from=${route.from.code}&to=${route.to.code}`}
      className={`group flex flex-col gap-3 px-6 py-5 transition-colors hover:bg-[var(--color-ivory)] sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-6 ${!isLast ? "border-b border-[var(--color-hairline)]" : ""}`}
    >
      {/* Route */}
      <div className="flex items-center gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {route.from.city}
          </span>
          <div className="font-serif text-[1.6rem] font-semibold leading-none text-[var(--color-ink)]">
            {route.from.code}
          </div>
        </div>
        <PlaneTakeoff className="h-4 w-4 shrink-0 text-[var(--color-champagne)] transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {route.to.city}
          </span>
          <div className="font-serif text-[1.6rem] font-semibold leading-none text-[var(--color-ink)]">
            {route.to.code}
          </div>
        </div>
        {route.demand === "very_high" && (
          <span className="ml-2 rounded border border-[var(--color-champagne)]/30 bg-[var(--color-champagne)]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-champagne)]">
            In demand
          </span>
        )}
      </div>

      {/* Flight time */}
      <span className="font-mono text-[12px] text-[var(--color-muted)]">
        {route.flightTime}
      </span>

      {/* Distance */}
      <span className="font-mono text-[12px] text-[var(--color-muted)]">
        {route.distanceNm} nm
      </span>

      {/* Category */}
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
        {route.recommended}
      </span>

      {/* Price + CTA */}
      <div className="flex items-center gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
            From
          </span>
          <div className="font-serif text-[1.1rem] font-semibold leading-none text-[var(--color-ink)]">
            {formatCurrency(route.fromPrice)}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-[var(--color-hairline)] px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-all group-hover:border-[var(--color-champagne)] group-hover:bg-[var(--color-champagne)] group-hover:text-white">
          Get Quote
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

function TrustPillar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-8 py-10 first:pl-0 last:pr-0 sm:first:pl-0 sm:last:pr-0">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-champagne)]">
        {title}
      </h3>
      <p className="mt-3 text-[13px] leading-[1.8] text-white/50">
        {description}
      </p>
    </div>
  );
}
