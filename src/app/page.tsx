import Link from "next/link";
import {
  PlaneTakeoff,
  ArrowRight,
  ArrowUpRight,
  Flame,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Newspaper,
  HelpCircle,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { EmptyLegCard } from "@/components/booking/empty-leg-card";
import popularRoutes from "@/data/popular-routes.json";
import emptyLegs from "@/data/empty-legs.json";
import news from "@/data/news.json";
import sportsEvents from "@/data/sports-events.json";
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

      {/* HERO — Search-first */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-40 lg:pb-24">
          <div className="flex flex-col items-center text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-neutral-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Global Access, On-Demand.
            </span>
            <h1 className="display-xl max-w-4xl bg-gradient-to-b from-neutral-950 to-neutral-500 bg-clip-text text-transparent">
              The private jet, booked in minutes.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-600">
              Search any route worldwide. Confirmed in under four hours on a
              curated, ARGUS Platinum–audited fleet.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <SearchBar variant="hero" />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <HeroStat label="Airports" value="5,000+" />
            <HeroStat label="Network tails" value="2,400+" />
            <HeroStat label="Avg. confirm" value="< 4 hr" />
            <HeroStat label="Safety" value="ARGUS Platinum" />
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES */}
      <section id="popular-routes" className="relative border-b border-neutral-200 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="01 · Popular Routes"
            title="Where our jets fly most"
            description="Live pricing on the routes our members request most this week."
            icon={Flame}
            ctaHref="/search"
            ctaLabel="See all routes"
          />
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularRoutes.map((r) => (
              <PopularRouteCard key={r.id} route={r} />
            ))}
          </div>
        </div>
      </section>

      {/* EMPTY LEGS */}
      <section id="empty-legs" className="relative border-b border-neutral-200 py-20">
        <div
          className="bg-dotgrid pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="02 · Empty Legs"
            title="Repositioning flights, up to 75% off"
            description="One-way charter at a fixed price. Live inventory across our network."
            icon={PlaneTakeoff}
            ctaHref="/search?category=empty-legs"
            ctaLabel="Browse all empty legs"
          />
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {emptyLegs.map((leg) => (
              <EmptyLegCard key={leg.id} leg={leg} />
            ))}
          </div>
        </div>
      </section>

      {/* NEWS & UPDATES */}
      <section id="news" className="relative border-b border-neutral-200 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="03 · News & Updates"
            title="What's new at EXJET"
            description="Fleet additions, safety milestones, and product releases."
            icon={Newspaper}
          />
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* SPORTS & EVENTS CALENDAR */}
      <section id="events" className="relative border-b border-neutral-200 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="04 · Sports Calendar"
            title="Every major championship. One aircraft away."
            description="Curated routes and nearest jet airports for the global sports calendar."
            icon={Trophy}
          />

          <div className="mt-10 flex flex-wrap items-center gap-2">
            {["F1", "NBA", "NFL", "NHL", "FIFA", "Masters"].map((l) => {
              const count = sportsEvents.filter((e) => e.league === l).length;
              return (
                <span
                  key={l}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest ring-1 ring-inset",
                    leagueColor(l)
                  )}
                >
                  {l}
                  <span className="rounded-full bg-neutral-300 px-1.5 py-0.5 text-[10px] text-neutral-800">
                    {count}
                  </span>
                </span>
              );
            })}
          </div>

          <ul className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white backdrop-blur-xl">
            {sportsEvents.map((event, idx) => (
              <li
                key={event.id}
                className={cn(
                  "group flex flex-col gap-3 p-5 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:gap-6",
                  idx !== 0 && "border-t border-neutral-200"
                )}
              >
                <div className="flex w-28 shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex h-7 items-center justify-center rounded-full px-2.5 font-mono text-[10px] uppercase tracking-widest ring-1 ring-inset",
                      leagueColor(event.league)
                    )}
                  >
                    {event.league}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[15px] font-semibold text-neutral-950">
                      {event.event}
                    </h3>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                      {event.city}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-neutral-500">{event.venue}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <Calendar
                      className="h-3.5 w-3.5 text-neutral-400"
                      strokeWidth={1.75}
                    />
                    <span className="text-[12px]">
                      {formatDateRange(event.date, event.endDate)}
                    </span>
                  </div>
                  <div className="hidden items-center gap-1.5 text-neutral-600 sm:flex">
                    <MapPin
                      className="h-3.5 w-3.5 text-neutral-400"
                      strokeWidth={1.75}
                    />
                    <span className="font-mono text-[11px] tracking-wide">
                      {event.airports.slice(0, 3).join(" · ")}
                    </span>
                  </div>
                  <Link
                    href={`/search?event=${event.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-[12px] font-medium text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white"
                  >
                    Book
                    <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative border-b border-neutral-200 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="05 · FAQ"
            title="Frequently asked"
            description="Everything you need to know before chartering your first flight."
            icon={HelpCircle}
            align="center"
          />
          <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-white backdrop-blur-xl">
            {faq.map((item, idx) => (
              <details
                key={idx}
                className={cn(
                  "group",
                  idx !== 0 && "border-t border-neutral-200"
                )}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-neutral-50">
                  <h3 className="text-[14px] font-medium text-neutral-950">
                    {item.q}
                  </h3>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all group-open:rotate-45 group-open:border-neutral-400 group-open:text-neutral-950">
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
                <div className="px-6 pb-5">
                  <p className="text-[13px] leading-relaxed text-neutral-600">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative py-24">
        <div className="mesh-accent absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            Ready when you are
          </span>
          <h2 className="display-lg mt-4 bg-gradient-to-b from-neutral-950 to-neutral-500 bg-clip-text text-transparent">
            Global Access, On-Demand.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-neutral-600">
            Search a route, pick your aircraft, and we&apos;ll confirm. No
            membership required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#popular-routes"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-black transition-colors hover:bg-neutral-800"
            >
              Start a search
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="#empty-legs"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-50 px-6 py-3 text-[13px] font-medium text-neutral-950 transition-colors hover:bg-neutral-100"
            >
              Browse empty legs
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
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 backdrop-blur-xl">
      <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-neutral-950">{value}</div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  ctaHref,
  ctaLabel,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: typeof Flame;
  ctaHref?: string;
  ctaLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between md:gap-8"
      )}
    >
      <div className={cn(align === "center" ? "" : "max-w-2xl")}>
        <div
          className={cn(
            "flex items-center gap-2",
            align === "center" && "justify-center"
          )}
        >
          {Icon && (
            <Icon className="h-3.5 w-3.5 text-neutral-500" strokeWidth={1.75} />
          )}
          <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            {eyebrow}
          </span>
        </div>
        <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-neutral-950 sm:text-[32px]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[14px] text-neutral-600">{description}</p>
        )}
      </div>
      {ctaHref && ctaLabel && align !== "center" && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-[12px] font-medium text-neutral-950 transition-colors hover:border-neutral-400 hover:bg-neutral-100 md:self-end"
        >
          {ctaLabel}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:bg-neutral-100"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          Popular
        </span>
        {route.demand === "very_high" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-emerald-700">
            <Flame className="h-2.5 w-2.5" strokeWidth={2} />
            Hot
          </span>
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-400">
            {route.from.city}
          </div>
          <div className="mt-1 font-mono text-[22px] font-semibold leading-none text-neutral-950">
            {route.from.code}
          </div>
        </div>
        <div className="relative flex-1 self-center">
          <div className="h-px w-full bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200" />
          <PlaneTakeoff
            className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-neutral-600 transition-transform group-hover:translate-x-0"
            strokeWidth={1.75}
          />
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-neutral-400">
            {route.to.city}
          </div>
          <div className="mt-1 font-mono text-[22px] font-semibold leading-none text-neutral-950">
            {route.to.code}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-neutral-200 pt-4 text-[11px] text-neutral-600">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-neutral-400" strokeWidth={1.75} />
          {route.flightTime}
        </div>
        <div className="font-mono text-neutral-500">{route.distanceNm} nm</div>
        <div className="ml-auto rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-700">
          {route.recommended}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-neutral-200 pt-4">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            From
          </span>
          <span className="text-[18px] font-semibold text-neutral-950">
            {formatCurrency(route.fromPrice)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-950 transition-transform group-hover:translate-x-0.5">
          Quote
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

function NewsCard({ item }: { item: (typeof news)[number] }) {
  const when = new Date(item.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:bg-neutral-100">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
          {item.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
          {when}
        </span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight text-neutral-950">
        {item.title}
      </h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-neutral-600">
        {item.excerpt}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          {item.readingTime} read
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-neutral-950 transition-transform group-hover:translate-x-0.5">
          Read
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

function leagueColor(league: string) {
  switch (league) {
    case "F1":
      return "bg-red-50 text-red-700 ring-red-200";
    case "NBA":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "NFL":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "NHL":
      return "bg-indigo-50 text-indigo-700 ring-indigo-200";
    case "FIFA":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Masters":
      return "bg-green-50 text-green-700 ring-green-200";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-300";
  }
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (start === end) {
    return s.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  }
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString(
    "en-US",
    { ...opts, year: "numeric" }
  )}`;
}
