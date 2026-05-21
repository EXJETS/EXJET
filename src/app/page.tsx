import Link from "next/link";
import {
  PlaneTakeoff,
  ArrowRight,
  ArrowUpRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { EmptyLegCard } from "@/components/booking/empty-leg-card";
import { CardCarousel } from "@/components/ui/card-carousel";
import { SportsEventsList } from "@/components/sports-events-list";
import popularRoutes from "@/data/popular-routes.json";
import emptyLegs from "@/data/empty-legs.json";
import news from "@/data/news.json";
import faq from "@/data/faq.json";
import { cn, formatCurrency } from "@/lib/utils";

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

      {/* HERO — Editorial / Cinematic */}
      <section className="relative overflow-hidden">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(184,155,110,0.08),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 sm:px-8 lg:pt-40 lg:pb-28">
          {/* Editorial chapter rule */}
          <div className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-champagne">EXJET</span>
              <span className="text-[var(--color-muted)]">Est. for the modern voyager</span>
            </span>
          </div>

          {/* Editorial display headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              Global access,
              <br />
              <em className="display-serif-italic text-champagne">on&nbsp;demand.</em>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.7] text-[var(--color-muted)]">
              An invitation to travel without compromise. A curated worldwide
              fleet, ARGUS Platinum&ndash;audited, confirmed in under four hours.
            </p>
          </div>

          {/* Search */}
          <div className="mt-14 flex justify-center">
            <SearchBar variant="hero" />
          </div>

          {/* Editorial KPI band */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-4">
            <HeroStat label="Airports" value="5,000+" />
            <HeroStat label="Network tails" value="2,400+" />
            <HeroStat label="Avg. confirm" value="< 4 hr" />
            <HeroStat label="Safety" value="ARGUS Platinum" />
          </div>
        </div>
      </section>

      {/* THE COLLECTION — Editorial intro chapter */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-12 lg:py-32">
          <div className="md:col-span-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              I · The Collection
            </span>
            <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
              A curated fleet,
              <br />
              <em className="display-serif-italic">without exception.</em>
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-[15px] leading-[1.85] text-[var(--color-muted)]">
              Every aircraft on EXJET is hand-selected from operators that
              meet ARGUS Platinum and Wyvern Wingman standards. From light
              jets for the morning meeting to ultra-long-range cabins crossing
              continents overnight &mdash; each tail is vetted, each crew
              dual-rated, each cabin appointed.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-5 border-t border-[var(--color-hairline)] pt-8 sm:grid-cols-2">
              <Hallmark
                title="ARGUS Platinum"
                desc="The aviation industry's highest independent safety rating."
              />
              <Hallmark
                title="24/7 Concierge"
                desc="Live trip specialists, never automated phone trees."
              />
              <Hallmark
                title="Five categories"
                desc="Light · Midsize · Super Midsize · Heavy · Ultra Long."
              />
              <Hallmark
                title="No membership"
                desc="Pay per flight. No initiation, no monthly minimums."
              />
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES */}
      <section
        id="popular-routes"
        className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="II"
            eyebrow="Most-flown corridors"
            title="Popular routes,"
            italic="this week"
            description="Live pricing on the journeys our members request most."
            ctaHref="/search"
            ctaLabel="See all routes"
          />
          <div className="mt-16">
            <CardCarousel itemClassName="w-[80%] sm:w-[48%] md:w-[36%] lg:w-[26%]" fadeFrom="#faf8f4">
              {popularRoutes.map((r) => (
                <PopularRouteCard key={r.id} route={r} />
              ))}
            </CardCarousel>
          </div>
        </div>
      </section>

      {/* EMPTY LEGS */}
      <section
        id="empty-legs"
        className="relative border-t border-[var(--color-hairline)] bg-white py-24"
      >
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="III"
            eyebrow="Repositioning at concierge fares"
            title="Empty legs,"
            italic="up to 75% off"
            description="Fixed-price one-way charter on returning aircraft. Live inventory across our network."
            ctaHref="/search?category=empty-legs"
            ctaLabel="Browse all empty legs"
          />
          <div className="mt-16">
            <CardCarousel itemClassName="w-[88%] sm:w-[60%] md:w-[48%] lg:w-[42%]">
              {emptyLegs.map((leg) => (
                <EmptyLegCard key={leg.id} leg={leg} />
              ))}
            </CardCarousel>
          </div>
        </div>
      </section>

      {/* NEWS & UPDATES */}
      <section
        id="news"
        className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="IV"
            eyebrow="The journal"
            title="News &"
            italic="dispatches"
            description="Fleet additions, safety milestones, and new destinations."
          />
          <div className="mt-16">
            <CardCarousel itemClassName="w-[80%] sm:w-[48%] md:w-[36%] lg:w-[26%]" fadeFrom="#faf8f4">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </CardCarousel>
          </div>
        </div>
      </section>

      {/* SPORTS & EVENTS CALENDAR */}
      <section
        id="events"
        className="relative border-t border-[var(--color-hairline)] bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="V"
            eyebrow="The season"
            title="Every championship,"
            italic="one cabin away"
            description="Curated routes and nearest jet airports for the global sports calendar."
          />
          <SportsEventsList />
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24"
      >
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <SectionHeader
            chapter="VI"
            eyebrow="Before you fly"
            title="Frequently"
            italic="asked"
            description="Everything you need to know before chartering your first journey."
            align="center"
          />
          <div className="mt-16 overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
            {faq.map((item, idx) => (
              <details
                key={idx}
                className={cn(
                  "group",
                  idx !== 0 && "border-t border-[var(--color-hairline)]"
                )}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-7 py-6 transition-colors hover:bg-[var(--color-ivory)]">
                  <h3 className="font-serif text-[19px] leading-tight text-[var(--color-ink)]">
                    {item.q}
                  </h3>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] text-[var(--color-muted)] transition-all group-open:rotate-45 group-open:border-champagne group-open:bg-champagne group-open:text-white">
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
                <div className="px-7 pb-6">
                  <p className="text-[14px] leading-[1.85] text-[var(--color-muted)]">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING — Editorial CTA on ink */}
      <section className="relative overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-5 py-32 text-center sm:px-8 lg:py-40">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              <span className="h-px w-8 bg-champagne/60" />
              Ready when you are
              <span className="h-px w-8 bg-champagne/60" />
            </span>
          </div>
          <h2 className="display-serif mt-8 text-white">
            The world,
            <br />
            <em className="display-serif-italic text-champagne">on your schedule.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.8] text-white/70">
            Choose a route, select an aircraft, confirm in minutes.
            No membership. No waiting list.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:bg-champagne hover:text-white"
            >
              Begin a search
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="#empty-legs"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-white hover:bg-white/10"
            >
              View empty legs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* -------- Helpers -------- */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[var(--color-ivory)] px-5 py-7 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
        {label}
      </span>
      <span className="font-serif text-[22px] leading-none text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}

function Hallmark({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-champagne/10 text-champagne">
        <ShieldCheck className="h-3 w-3" strokeWidth={2} />
      </span>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
          {title}
        </div>
        <div className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
          {desc}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  chapter,
  eyebrow,
  title,
  italic,
  description,
  ctaHref,
  ctaLabel,
  align = "left",
}: {
  chapter: string;
  eyebrow: string;
  title: string;
  italic?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between md:gap-12"
      )}
    >
      <div className={cn(align === "center" ? "" : "max-w-2xl")}>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
          {chapter} · {eyebrow}
        </span>
        <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
          {title}
          {italic && (
            <>
              {" "}
              <em className="display-serif-italic text-[var(--color-muted)]">
                {italic}
              </em>
            </>
          )}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-[14px] leading-relaxed text-[var(--color-muted)]",
              align === "center" ? "mx-auto max-w-md" : "max-w-lg"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {ctaHref && ctaLabel && align !== "center" && (
        <Link
          href={ctaHref}
          className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:text-champagne md:self-end"
        >
          {ctaLabel}
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
          />
        </Link>
      )}
    </div>
  );
}

function PopularRouteCard({
  route,
}: {
  route: (typeof popularRoutes)[number];
}) {
  return (
    <Link
      href={`/search?from=${route.from.code}&to=${route.to.code}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white p-7 transition-all hover:border-champagne hover:shadow-[0_24px_50px_-20px_rgba(184,155,110,0.35)]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
          Route
        </span>
        {route.demand === "very_high" && (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-bordeaux)]">
            In demand
          </span>
        )}
      </div>

      <div className="mt-7 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {route.from.city}
          </div>
          <div className="mt-1 font-serif text-[34px] leading-none text-[var(--color-ink)]">
            {route.from.code}
          </div>
        </div>
        <div className="relative flex-1 self-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
          <PlaneTakeoff
            className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-champagne transition-transform group-hover:translate-x-3"
            strokeWidth={1.5}
          />
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {route.to.city}
          </div>
          <div className="mt-1 font-serif text-[34px] leading-none text-[var(--color-ink)]">
            {route.to.code}
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-4 border-t border-[var(--color-hairline)] pt-5 text-[11px] text-[var(--color-muted)]">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-champagne" strokeWidth={1.75} />
          {route.flightTime}
        </div>
        <div className="font-mono text-[var(--color-subtle)]">
          {route.distanceNm} nm
        </div>
        <div className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
          {route.recommended}
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-[var(--color-hairline)] pt-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
            From
          </span>
          <div className="font-serif text-[24px] leading-none text-[var(--color-ink)]">
            {formatCurrency(route.fromPrice)}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5">
          Quote
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

function NewsCard({ item }: { item: (typeof news)[number] }) {
  const when = new Date(item.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white p-7 transition-all hover:border-champagne hover:shadow-[0_24px_50px_-20px_rgba(184,155,110,0.25)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
          {item.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
          {when}
        </span>
      </div>
      <h3 className="mt-6 font-serif text-[22px] leading-tight text-[var(--color-ink)]">
        {item.title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[var(--color-muted)]">
        {item.excerpt}
      </p>
      <div className="mt-6 border-t border-[var(--color-hairline)] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
          {item.readingTime} read
        </span>
      </div>
    </article>
  );
}
