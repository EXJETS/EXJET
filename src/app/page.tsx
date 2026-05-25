import Link from "next/link";
import {
  PlaneTakeoff,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Zap,
  Globe,
  Utensils,
  Car,
  PawPrint,
  Luggage,
  Building2,
  Compass,
  Users,
  Tag,
  Award,
  Gift,
  TrendingUp,
  Check,
  Phone,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { EmptyLegCard } from "@/components/booking/empty-leg-card";
import { CardCarousel } from "@/components/ui/card-carousel";
import emptyLegs from "@/data/empty-legs.json";
import sportsEvents from "@/data/sports-events.json";
import faq from "@/data/faq.json";
import { cn, formatCurrency } from "@/lib/utils";

/* -------- Static data for new sections -------- */

const destinations = [
  { id: "nyc", name: "New York", region: "New York, USA", airport: "KTEB · Teterboro", fromPrice: 18900, accent: "bg-[#1a1714]" },
  { id: "mia", name: "Miami", region: "Florida, USA", airport: "KOPF · Opa-Locka", fromPrice: 12400, accent: "bg-[#0c1c2c]" },
  { id: "aspen", name: "Aspen", region: "Colorado, USA", airport: "KASE · Sardy Field", fromPrice: 16500, accent: "bg-[#1a2a1a]" },
  { id: "hamptons", name: "The Hamptons", region: "New York, USA", airport: "KHTO · East Hampton", fromPrice: 9800, accent: "bg-[#1f1f2e]" },
  { id: "vegas", name: "Las Vegas", region: "Nevada, USA", airport: "KLAS · Harry Reid", fromPrice: 7400, accent: "bg-[#2e1c0c]" },
  { id: "london", name: "London", region: "United Kingdom", airport: "EGLL · Heathrow", fromPrice: 68000, accent: "bg-[#1a1a22]" },
  { id: "monaco", name: "Monaco", region: "Monaco", airport: "LFMN · Côte d'Azur", fromPrice: 52000, accent: "bg-[#0f1f2e]" },
  { id: "dubai", name: "Dubai", region: "UAE", airport: "OMDB · International", fromPrice: 95000, accent: "bg-[#1f1c0c]" },
];

const fleetCategories = [
  {
    id: "light",
    name: "Light Jet",
    capacity: "Up to 7 guests",
    range: "2,165 nm",
    time: "Up to 5h non-stop",
    fromPrice: 7400,
    example: "Citation CJ4 / Phenom 300E",
    desc: "City hops, coastal routes, and weekend escapes.",
    colorBar: "bg-sky-500",
  },
  {
    id: "midsize",
    name: "Midsize Jet",
    capacity: "Up to 9 guests",
    range: "2,500 nm",
    time: "5–7h non-stop",
    fromPrice: 16500,
    example: "Hawker 900XP / Citation XLS",
    desc: "The business workhorse — coast-to-coast comfort.",
    colorBar: "bg-violet-500",
  },
  {
    id: "super_midsize",
    name: "Super Midsize",
    capacity: "Up to 10 guests",
    range: "3,400 nm",
    time: "7–9h non-stop",
    fromPrice: 23000,
    example: "Challenger 300 / Citation X",
    desc: "Stand-up cabin. Transcontinental capable.",
    colorBar: "bg-amber-500",
  },
  {
    id: "heavy",
    name: "Heavy Jet",
    capacity: "Up to 16 guests",
    range: "4,000 nm",
    time: "9–12h non-stop",
    fromPrice: 38000,
    example: "Challenger 605 / Global 5000",
    desc: "Full executive suite. Conference tables. Lie-flat beds.",
    colorBar: "bg-emerald-500",
  },
  {
    id: "ultra_long",
    name: "Ultra Long Range",
    capacity: "Up to 19 guests",
    range: "7,500+ nm",
    time: "Non-stop worldwide",
    fromPrice: 65000,
    example: "Global 7500 / Gulfstream G700",
    desc: "New York to Dubai. London to Singapore. No stops.",
    colorBar: "bg-rose-500",
  },
];

const travelInfo = [
  {
    title: "Catering & Dining",
    desc: "Bespoke menus from private chefs. From light canapés to full silver-service dining.",
    icon: Utensils,
    href: "/travel/catering",
  },
  {
    title: "Ground Transport",
    desc: "Limousine coordination to every FBO worldwide, timed to your wheels-down.",
    icon: Car,
    href: "/travel/transport",
  },
  {
    title: "Pets Welcome",
    desc: "Your companions fly in cabin. No cargo holds, no fees, no restrictions.",
    icon: PawPrint,
    href: "/travel/pets",
  },
  {
    title: "No Bag Limits",
    desc: "Generous baggage capacity. No checked-bag fees, no weight penalties.",
    icon: Luggage,
    href: "/travel/baggage",
  },
  {
    title: "Private FBO",
    desc: "Dedicated private terminals. Arrive 15 minutes before wheels-up. Skip every queue.",
    icon: Building2,
    href: "/travel/fbo",
  },
  {
    title: "Global Customs",
    desc: "International clearance and customs documentation handled end-to-end.",
    icon: Compass,
    href: "/travel/customs",
  },
];

const milesPerks = [
  {
    title: "Earn 1 Mile per Dollar",
    desc: "Every dollar charted earns one EXJET Mile, redeemable on future flights.",
    icon: TrendingUp,
  },
  {
    title: "Status Tiers",
    desc: "Silver, Gold, and Platinum tiers unlock priority booking, bonus miles, and a dedicated rep.",
    icon: Award,
  },
  {
    title: "Partner Rewards",
    desc: "Earn and redeem with our hotel, ground transport, and luxury lifestyle partners.",
    icon: Gift,
  },
  {
    title: "Miles Never Expire",
    desc: "As long as you fly once every 24 months, your miles remain valid — forever.",
    icon: Check,
  },
];

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── 1. HERO — Delta-style dark booking hero ── */}
      <section className="relative overflow-hidden">
        {/* Dark editorial background */}
        <div className="mesh-ink absolute inset-0" aria-hidden />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right,rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          {/* Top spacer for fixed nav */}
          <div className="pt-32 pb-4 lg:pt-40 lg:pb-6">
            {/* Eyebrow */}
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-champagne/60" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                Private Jet Charter · Worldwide
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.96] tracking-[-0.02em] text-white">
              Your sky.
              <br />
              <em className="font-serif italic text-champagne">Your schedule.</em>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-[1.7] text-white/60">
              5,000+ airports worldwide · ARGUS Platinum fleet · Confirm in under 4 hours.
              No membership required.
            </p>
          </div>

          {/* Booking Widget — white panel */}
          <div className="relative mt-6 mb-0 rounded-2xl bg-white/95 p-5 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl sm:p-6 lg:p-8">
            <SearchBar variant="hero" />
          </div>

          {/* Quick-link chips */}
          <div className="flex flex-wrap items-center gap-2.5 pb-10 pt-5 lg:pb-14">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
              Popular:
            </span>
            {[
              { label: "New York → Miami", href: "/search?from=KTEB&to=KOPF" },
              { label: "LA → Aspen", href: "/search?from=KVNY&to=KASE" },
              { label: "Teterboro → London", href: "/search?from=KTEB&to=EGLL" },
              { label: "Empty Legs", href: "/search?mode=empty" },
            ].map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur transition-all hover:border-white/40 hover:bg-white/15 hover:text-white"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
            <HeroStat label="Airports" value="5,000+" />
            <HeroStat label="Network tails" value="2,400+" />
            <HeroStat label="Avg. confirm" value="< 4 hr" />
            <HeroStat label="Safety" value="ARGUS Platinum" />
          </div>
        </div>
      </section>

      {/* ── 2. EXCLUSIVE OFFERS — Delta "Shop Smarter" ── */}
      <section className="border-t border-[var(--color-hairline)] bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                Exclusive Offers
              </span>
              <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
                Fly smarter,
                <em className="font-serif italic text-[var(--color-muted)]"> pay less.</em>
              </h2>
            </div>
            <Link
              href="/search"
              className="group hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)] hover:text-champagne sm:inline-flex"
            >
              All offers
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Offer 1 — Empty Legs */}
            <OfferCard
              eyebrow="Limited Availability"
              title="Empty Legs"
              subtitle="Up to 75% off repositioning flights. Fixed flat fares, live inventory."
              cta="Browse empty legs"
              href="/search?mode=empty"
              accentClass="bg-champagne"
              icon={Tag}
            />
            {/* Offer 2 — New Destinations */}
            <OfferCard
              eyebrow="New This Season"
              title="Summer Routes"
              subtitle="St. Tropez, Mykonos, and Sardinia now bookable from Teterboro and Van Nuys."
              cta="Explore destinations"
              href="/search"
              accentClass="bg-[var(--color-forest)]"
              icon={Globe}
            />
            {/* Offer 3 — Miles Bonus */}
            <OfferCard
              eyebrow="EXJET Miles"
              title="Double Miles"
              subtitle="Earn 2× miles on every charter booked before August 31st. No minimum spend."
              cta="Join EXJET Miles"
              href="/auth/register"
              accentClass="bg-[var(--color-bordeaux)]"
              icon={Star}
            />
          </div>
        </div>
      </section>

      {/* ── 3. POPULAR DESTINATIONS — Delta "Explore Destinations" ── */}
      <section className="border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                Explore Destinations
              </span>
              <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
                The world,
                <em className="font-serif italic text-[var(--color-muted)]"> on demand.</em>
              </h2>
            </div>
            <Link
              href="/search"
              className="group hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)] hover:text-champagne sm:inline-flex"
            >
              All destinations
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. EXJET MILES — Delta SkyMiles ── */}
      <section id="miles" className="relative overflow-hidden border-t border-[var(--color-hairline)]">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Left — program intro */}
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                Loyalty Program
              </span>
              <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.75rem)] leading-[1] tracking-[-0.02em] text-white">
                EXJET Miles.
                <br />
                <em className="font-serif italic text-champagne">Every mile counts.</em>
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-[1.75] text-white/60">
                Earn one mile for every dollar chartered. Redeem for free flights, upgrades,
                concierge services, and exclusive experiences. No blackout dates.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 text-[13px] font-medium text-white transition-all hover:bg-white hover:text-[var(--color-ink)]"
                >
                  Join free — earn instantly
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-transparent px-6 py-3 text-[13px] font-medium text-white/80 transition-all hover:border-white/50 hover:text-white"
                >
                  Sign in to my miles
                </Link>
              </div>

              {/* Miles tiers */}
              <div className="mt-12 grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10">
                {[
                  { tier: "Silver", min: "25,000 mi", perk: "Priority booking" },
                  { tier: "Gold", min: "75,000 mi", perk: "Bonus miles ×1.5" },
                  { tier: "Platinum", min: "150,000 mi", perk: "Dedicated agent" },
                ].map((t) => (
                  <div key={t.tier} className="flex flex-col gap-1.5 px-4 py-5 text-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
                      {t.tier}
                    </span>
                    <span className="font-serif text-[18px] leading-none text-white">
                      {t.min}
                    </span>
                    <span className="text-[11px] text-white/50">{t.perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — perks grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:self-center">
              {milesPerks.map((perk) => (
                <div
                  key={perk.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/15">
                    <perk.icon className="h-4.5 w-4.5 text-champagne" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                    {perk.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.7] text-white/55">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FLEET CATEGORIES — Delta cabin class selector ── */}
      <section className="border-t border-[var(--color-hairline)] bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              The Fleet
            </span>
            <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
              Choose your cabin.
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[var(--color-muted)]">
              Five categories. Every operator ARGUS Platinum–audited. Every crew dual-rated.
              Every cabin appointed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {fleetCategories.map((cat) => (
              <FleetCategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. EMPTY LEGS ── */}
      <section
        id="empty-legs"
        className="border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                Repositioning Flights
              </span>
              <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
                Empty legs,
                <em className="font-serif italic text-[var(--color-muted)]"> up to 75% off.</em>
              </h2>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[var(--color-muted)]">
                Fixed-price one-way charter on returning aircraft. Live inventory across our network.
              </p>
            </div>
            <Link
              href="/search?mode=empty"
              className="group hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)] hover:text-champagne sm:inline-flex"
            >
              All empty legs
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>

          <CardCarousel itemClassName="w-[88%] sm:w-[60%] md:w-[48%] lg:w-[42%]">
            {emptyLegs.map((leg) => (
              <EmptyLegCard key={leg.id} leg={leg} />
            ))}
          </CardCarousel>
        </div>
      </section>

      {/* ── 7. TRAVEL INFORMATION — Delta Travel Info style ── */}
      <section className="border-t border-[var(--color-hairline)] bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              Travel Information
            </span>
            <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
              Everything you need,
              <em className="font-serif italic text-[var(--color-muted)]"> handled.</em>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {travelInfo.map((item) => (
              <TravelInfoCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. SPORTS & EVENTS — Delta destination calendar ── */}
      <section
        id="events"
        className="border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              The Season
            </span>
            <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
              Every championship,
              <em className="font-serif italic text-[var(--color-muted)]"> one cabin away.</em>
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[var(--color-muted)]">
              Curated charter routes and nearby FBOs for the global sports calendar.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {["F1", "NBA", "NFL", "NHL", "FIFA", "Masters"].map((l) => {
              const count = sportsEvents.filter((e) => e.league === l).length;
              return (
                <span
                  key={l}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ring-1 ring-inset",
                    leagueColor(l)
                  )}
                >
                  {l}
                  <span className="rounded-full bg-[var(--color-ink)]/10 px-1.5 py-0.5 text-[10px] text-[var(--color-ink)]">
                    {count}
                  </span>
                </span>
              );
            })}
          </div>

          <ul className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
            {sportsEvents.map((event, idx) => (
              <li
                key={event.id}
                className={cn(
                  "group flex flex-col gap-3 p-6 transition-colors hover:bg-[var(--color-ivory)] sm:flex-row sm:items-center sm:gap-6",
                  idx !== 0 && "border-t border-[var(--color-hairline)]"
                )}
              >
                <div className="flex w-28 shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex h-7 items-center justify-center rounded-full px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] ring-1 ring-inset",
                      leagueColor(event.league)
                    )}
                  >
                    {event.league}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-serif text-[20px] leading-tight text-[var(--color-ink)]">
                      {event.event}
                    </h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                      {event.city}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--color-muted)]">{event.venue}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[var(--color-ink-soft)]">
                    <Calendar className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
                    <span className="text-[12px]">
                      {formatDateRange(event.date, event.endDate)}
                    </span>
                  </div>
                  <div className="hidden items-center gap-1.5 text-[var(--color-muted)] sm:flex">
                    <MapPin className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
                    <span className="font-mono text-[11px] tracking-wide">
                      {event.airports.slice(0, 3).join(" · ")}
                    </span>
                  </div>
                  <Link
                    href={`/search?event=${event.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-ink)] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-white"
                  >
                    Reserve
                    <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 9. WHY EXJET — Trust signals (Delta "Why Delta") ── */}
      <section className="border-t border-[var(--color-hairline)] bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              Why EXJET
            </span>
            <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
              The standard for private aviation.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "ARGUS Platinum",
                desc: "Every operator independently audited to the highest safety standard in private aviation.",
              },
              {
                icon: Zap,
                title: "Confirm in 4 Hours",
                desc: "Live pricing. Real availability. Your charter confirmed faster than any alternative.",
              },
              {
                icon: Phone,
                title: "24/7 Concierge",
                desc: "A live specialist, never an automated phone tree. Available any hour, any time zone.",
              },
              {
                icon: Globe,
                title: "5,000+ Airports",
                desc: "Access private terminals unavailable to commercial carriers. Closer to where you're going.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne/10">
                  <item.icon className="h-5 w-5 text-champagne" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.75] text-[var(--color-muted)]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ── */}
      <section
        id="faq"
        className="border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-20"
      >
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              Before You Fly
            </span>
            <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]">
              Frequently asked.
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white">
            {faq.map((item, idx) => (
              <details
                key={idx}
                className={cn("group", idx !== 0 && "border-t border-[var(--color-hairline)]")}
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
                  <p className="text-[14px] leading-[1.85] text-[var(--color-muted)]">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. CONCIERGE STRIP — Delta "Need Help?" ── */}
      <section className="border-t border-[var(--color-hairline)] bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid divide-y divide-[var(--color-hairline)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              {
                icon: Phone,
                title: "24/7 Concierge",
                desc: "Speak with a live specialist any time.",
                cta: "Call now",
                href: "tel:+18003935387",
              },
              {
                icon: Zap,
                title: "Instant Quote",
                desc: "Live pricing. No membership required.",
                cta: "Get a quote",
                href: "/search",
              },
              {
                icon: PlaneTakeoff,
                title: "Track Your Flight",
                desc: "Real-time position for every tail in our network.",
                cta: "Live tracking",
                href: "/tracking",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center gap-5 px-8 py-8 transition-colors hover:bg-[var(--color-ivory)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] transition-colors group-hover:border-champagne group-hover:bg-champagne/5">
                  <item.icon className="h-5 w-5 text-[var(--color-muted)] transition-colors group-hover:text-champagne" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
                    {item.title}
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--color-muted)]">{item.desc}</p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-all group-hover:translate-x-0.5 group-hover:text-champagne"
                  strokeWidth={1.75}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. CLOSING CTA ── */}
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
          <h2 className="mt-8 font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.02em] text-white">
            The world,
            <br />
            <em className="font-serif italic text-champagne">on your schedule.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.8] text-white/60">
            Choose a route. Select an aircraft. Confirm in minutes.
            No membership. No waiting list.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-champagne px-8 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-white hover:text-[var(--color-ink)]"
            >
              Book a charter
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/search?mode=empty"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-8 py-3.5 text-[13px] font-medium text-white transition-all hover:border-white hover:bg-white/10"
            >
              View empty legs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Component helpers ─── */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
        {label}
      </span>
      <span className="font-serif text-[20px] leading-none text-white">{value}</span>
    </div>
  );
}

function OfferCard({
  eyebrow,
  title,
  subtitle,
  cta,
  href,
  accentClass,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  accentClass: string;
  icon: typeof Tag;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-0 transition-all hover:border-champagne hover:shadow-[0_20px_50px_-15px_rgba(184,155,110,0.3)]"
    >
      {/* Color accent bar */}
      <div className={cn("h-1.5 w-full", accentClass)} />

      <div className="flex flex-1 flex-col gap-4 p-7">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", accentClass)}>
            <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {eyebrow}
          </span>
        </div>

        <div>
          <h3 className="font-serif text-[26px] leading-tight text-[var(--color-ink)]">
            {title}
          </h3>
          <p className="mt-2.5 text-[13px] leading-[1.75] text-[var(--color-muted)]">{subtitle}</p>
        </div>

        <div className="mt-auto flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5">
          {cta}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
        </div>
      </div>
    </Link>
  );
}

function DestinationCard({
  dest,
}: {
  dest: (typeof destinations)[number];
}) {
  return (
    <Link
      href={`/search?to=${dest.airport.split(" · ")[0]}`}
      className={cn(
        "group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl p-5",
        dest.accent
      )}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        aria-hidden
      />

      {/* Top — airport code */}
      <div className="relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
          {dest.airport}
        </span>
      </div>

      {/* Bottom — city + price */}
      <div className="relative z-10">
        <h3 className="font-serif text-[22px] leading-tight text-white">{dest.name}</h3>
        <p className="mt-0.5 text-[11px] text-white/60">{dest.region}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne">
              From
            </span>
            <div className="font-serif text-[18px] leading-none text-white">
              {formatCurrency(dest.fromPrice)}
            </div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-all group-hover:bg-champagne group-hover:border-champagne">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FleetCategoryCard({
  cat,
}: {
  cat: (typeof fleetCategories)[number];
}) {
  return (
    <Link
      href={`/search?category=${cat.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white transition-all hover:border-champagne hover:shadow-[0_20px_50px_-15px_rgba(184,155,110,0.25)]"
    >
      {/* Color category indicator */}
      <div className={cn("h-1 w-full", cat.colorBar)} />

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="font-serif text-[20px] leading-tight text-[var(--color-ink)]">
            {cat.name}
          </h3>
          <p className="mt-1 text-[12px] text-[var(--color-muted)]">{cat.desc}</p>
        </div>

        <div className="space-y-2 border-t border-[var(--color-hairline)] pt-4 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-muted)]">Guests</span>
            <span className="font-mono text-[var(--color-ink)]">{cat.capacity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-muted)]">Range</span>
            <span className="font-mono text-[var(--color-ink)]">{cat.range}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-muted)]">Duration</span>
            <span className="font-mono text-[var(--color-ink)]">{cat.time}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-[var(--color-hairline)] pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne">
            From
          </span>
          <div className="flex items-end justify-between">
            <span className="font-serif text-[22px] leading-none text-[var(--color-ink)]">
              {formatCurrency(cat.fromPrice)}
            </span>
            <ArrowRight
              className="h-4 w-4 text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-champagne"
              strokeWidth={1.75}
            />
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-subtle)]">{cat.example}</p>
        </div>
      </div>
    </Link>
  );
}

function TravelInfoCard({
  item,
}: {
  item: (typeof travelInfo)[number];
}) {
  return (
    <Link
      href={item.href}
      className="group flex items-start gap-5 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-7 transition-all hover:border-champagne hover:bg-white"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[var(--color-hairline)] transition-all group-hover:border-champagne group-hover:bg-champagne/5">
        <item.icon className="h-5 w-5 text-champagne" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
          {item.title}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-muted)]">{item.desc}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5">
          Learn more
          <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
}

function leagueColor(league: string) {
  switch (league) {
    case "F1":
      return "bg-[var(--color-bordeaux)]/8 text-[var(--color-bordeaux)] ring-[var(--color-bordeaux)]/20";
    case "NBA":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "NFL":
      return "bg-blue-50 text-blue-800 ring-blue-200";
    case "NHL":
      return "bg-indigo-50 text-indigo-800 ring-indigo-200";
    case "FIFA":
      return "bg-[var(--color-forest)]/10 text-[var(--color-forest)] ring-[var(--color-forest)]/20";
    case "Masters":
      return "bg-[var(--color-forest)]/10 text-[var(--color-forest)] ring-[var(--color-forest)]/20";
    default:
      return "bg-[var(--color-hairline)] text-[var(--color-ink)] ring-[var(--color-hairline-strong)]";
  }
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (start === end) {
    return s.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  }
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  })}`;
}
