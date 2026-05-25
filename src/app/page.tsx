import Link from "next/link";
import {
  PlaneTakeoff,
  ArrowRight,
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
  ChevronRight,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { EmptyLegCard } from "@/components/booking/empty-leg-card";
import { CardCarousel } from "@/components/ui/card-carousel";
import emptyLegs from "@/data/empty-legs.json";
import sportsEvents from "@/data/sports-events.json";
import faq from "@/data/faq.json";
import { cn, formatCurrency } from "@/lib/utils";

/* ── Static data ── */

const destinations = [
  { id: "nyc", name: "New York", sub: "Teterboro · KTEB", price: 18900, bg: "from-slate-800 to-slate-900" },
  { id: "mia", name: "Miami", sub: "Opa-Locka · KOPF", price: 12400, bg: "from-sky-800 to-sky-950" },
  { id: "aspen", name: "Aspen", sub: "Sardy Field · KASE", price: 16500, bg: "from-emerald-800 to-emerald-950" },
  { id: "hamptons", name: "The Hamptons", sub: "East Hampton · KHTO", price: 9800, bg: "from-indigo-800 to-indigo-950" },
  { id: "vegas", name: "Las Vegas", sub: "Harry Reid · KLAS", price: 7400, bg: "from-amber-800 to-amber-950" },
  { id: "london", name: "London", sub: "Farnborough · EGLF", price: 68000, bg: "from-zinc-700 to-zinc-900" },
  { id: "monaco", name: "Monaco", sub: "Nice · LFMN", price: 52000, bg: "from-blue-800 to-blue-950" },
  { id: "dubai", name: "Dubai", sub: "International · OMDB", price: 95000, bg: "from-orange-800 to-orange-950" },
];

const fleetCategories = [
  { id: "light", name: "Light Jet", pax: "1–7 guests", range: "2,165 nm", time: "Up to 5h", from: 7400, example: "Citation CJ4 / Phenom 300E" },
  { id: "midsize", name: "Midsize Jet", pax: "1–9 guests", range: "2,500 nm", time: "Up to 7h", from: 16500, example: "Hawker 900XP / Citation XLS" },
  { id: "super_midsize", name: "Super Midsize", pax: "1–10 guests", range: "3,400 nm", time: "Up to 9h", from: 23000, example: "Challenger 300 / Citation X" },
  { id: "heavy", name: "Heavy Jet", pax: "1–16 guests", range: "4,000 nm", time: "Up to 12h", from: 38000, example: "Global 5000 / Challenger 605" },
  { id: "ultra_long", name: "Ultra Long Range", pax: "1–19 guests", range: "7,500+ nm", time: "Non-stop worldwide", from: 65000, example: "Global 7500 / Gulfstream G700" },
];

const travelInfoItems = [
  { title: "Catering & Dining", desc: "Custom menus from private chefs. Champagne, caviar, or clean-eating — your choice.", icon: Utensils },
  { title: "Ground Transport", desc: "Limousine service timed to your wheels-down, at every FBO worldwide.", icon: Car },
  { title: "Pets Welcome", desc: "Your companion travels in-cabin. No cargo holds, no extra fees.", icon: PawPrint },
  { title: "No Baggage Fees", desc: "Generous hold capacity, no checked-bag limits, no weight restrictions.", icon: Luggage },
  { title: "Private FBO", desc: "Arrive 15 minutes before departure. Private terminals, zero security queues.", icon: Building2 },
  { title: "Global Customs", desc: "International customs, documentation, and clearance handled end-to-end.", icon: Compass },
];

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

      {/* ══════════════════════════════════════════════
          1. HERO — Delta-style navy booking hero
          (dark sky photo simulation + white widget panel)
         ══════════════════════════════════════════════ */}
      <section className="delta-hero relative overflow-hidden">
        {/* Simulated sky horizon line */}
        <div
          className="absolute inset-x-0 top-0 h-full opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 40% at 50% 30%, rgba(100,160,255,0.4) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="pt-[100px] lg:pt-[108px]">
            {/* Eyebrow + headline — compact, functional, not editorial */}
            <div className="pb-7 pt-10 lg:pt-14">
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/55">
                Private Jet Charter · Worldwide
              </p>
              <h1 className="mt-2 text-[clamp(1.9rem,4.5vw,3.25rem)] font-semibold leading-tight tracking-[-0.025em] text-white">
                Book a private charter.
                <span className="block text-champagne">Confirm in under 4 hours.</span>
              </h1>
            </div>

            {/* ── Booking widget — Delta white panel with navy tab bar ── */}
            <div className="overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              {/* Tab bar — the key Delta signature element */}
              <div className="flex bg-[var(--color-navy)]">
                {[
                  { label: "Book Charter", active: true },
                  { label: "Empty Legs", href: "/search?mode=empty", active: false },
                  { label: "Group Charter", href: "/search?group=true", active: false },
                  { label: "Manage Trip", href: "/dashboard", active: false },
                ].map((tab) => (
                  <Link
                    key={tab.label}
                    href={(tab as { href?: string }).href ?? "/search"}
                    className={cn(
                      "px-5 py-3.5 text-[13px] font-medium transition-colors",
                      tab.active
                        ? "border-b-2 border-champagne bg-white/10 text-white"
                        : "text-white/55 hover:bg-white/5 hover:text-white/80"
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              {/* Search form */}
              <div className="p-5 lg:p-7">
                <SearchBar variant="hero" />
              </div>
            </div>

            {/* Trending routes */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-12 pt-5">
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
                Trending routes:
              </span>
              {[
                { label: "New York → Miami", href: "/search?from=KTEB&to=KOPF" },
                { label: "LA → Aspen", href: "/search?from=KVNY&to=KASE" },
                { label: "Teterboro → London", href: "/search?from=KTEB&to=EGLF" },
                { label: "View empty legs", href: "/search?mode=empty" },
              ].map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="flex items-center gap-1 text-[12px] text-white/60 underline-offset-2 hover:text-white hover:underline"
                >
                  {r.label}
                  <ChevronRight className="h-3 w-3" strokeWidth={2} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats bar — Delta-style KPI strip */}
        <div className="border-t border-white/10 bg-[var(--color-navy)]/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
            {[
              { label: "Airports", value: "5,000+" },
              { label: "Network aircraft", value: "2,400+" },
              { label: "Average confirm", value: "< 4 hours" },
              { label: "Safety rating", value: "ARGUS Platinum" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 py-4 text-center">
                <span className="text-[20px] font-semibold text-white">{s.value}</span>
                <span className="text-[11px] text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2. EXCLUSIVE OFFERS — Delta "Shop Smarter"
          (3 horizontal promo cards, white bg)
         ══════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-[var(--color-navy)]">
              Exclusive offers
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-[13px] font-medium text-champagne hover:underline"
            >
              See all <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <DeltaOfferCard
              label="Limited seats"
              title="Empty Legs"
              body="Repositioning flights up to 75% below charter rates. Live inventory, flat fares."
              cta="Browse empty legs"
              href="/search?mode=empty"
              accentColor="bg-champagne"
            />
            <DeltaOfferCard
              label="Summer 2026"
              title="Europe Escapes"
              body="St. Tropez, Mykonos & Sardinia now bookable from Teterboro and Van Nuys."
              cta="Explore routes"
              href="/search"
              accentColor="bg-[var(--color-navy)]"
            />
            <DeltaOfferCard
              label="EXJET Miles"
              title="Double Miles Event"
              body="Earn 2× miles on every charter booked through August 31st. No minimum spend."
              cta="Join EXJET Miles"
              href="/auth/register"
              accentColor="bg-emerald-700"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. DESTINATIONS — Delta "Explore Destinations"
          (image-forward card grid, light blue-tint bg)
         ══════════════════════════════════════════════ */}
      <section className="bg-[var(--color-navy-light)] py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-[var(--color-navy)]">
              Explore destinations
            </h2>
            <Link
              href="/search"
              className="flex items-center gap-1 text-[13px] font-medium text-champagne hover:underline"
            >
              All destinations <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {destinations.map((d) => (
              <Link
                key={d.id}
                href={`/search?to=${d.sub.split(" · ")[1]}`}
                className={cn(
                  "group relative flex flex-col justify-end overflow-hidden rounded-lg bg-gradient-to-br p-4",
                  d.bg,
                  "aspect-[3/4] sm:aspect-[2/3]"
                )}
              >
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                  aria-hidden
                />
                <div className="relative z-10">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/60">
                    {d.sub}
                  </p>
                  <h3 className="mt-0.5 text-[15px] font-semibold text-white">{d.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/55">From</p>
                      <p className="text-[14px] font-semibold text-champagne">
                        {formatCurrency(d.price)}
                      </p>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-champagne">
                      <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. EXJET MILES — Delta SkyMiles section
          (navy blue full-width, very Delta)
         ══════════════════════════════════════════════ */}
      <section id="miles" className="bg-[var(--color-navy)] py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
                EXJET Miles
              </p>
              <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight text-white">
                Earn miles.<br />Fly free.
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-[1.75] text-white/60">
                Every dollar you charter earns one EXJET Mile. Redeem for free flights, upgrades,
                and exclusive experiences — with no blackout dates and miles that never expire.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/auth/register"
                  className="rounded-md bg-champagne px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#c9a97a]"
                >
                  Join EXJET Miles — it's free
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-md border border-white/25 px-6 py-3 text-[13px] font-medium text-white/80 transition-colors hover:border-white/50 hover:text-white"
                >
                  Sign in to my miles
                </Link>
              </div>

              {/* Tier table */}
              <div className="mt-10 overflow-hidden rounded-lg border border-white/15">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">Tier</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">Threshold</th>
                      <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">Key perk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      { tier: "Silver", miles: "25,000 mi", perk: "Priority booking" },
                      { tier: "Gold", miles: "75,000 mi", perk: "1.5× miles earned" },
                      { tier: "Platinum", miles: "150,000 mi", perk: "Dedicated agent" },
                    ].map((row) => (
                      <tr key={row.tier} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-[13px] font-semibold text-champagne">{row.tier}</td>
                        <td className="px-4 py-3 text-[13px] text-white/70">{row.miles}</td>
                        <td className="px-4 py-3 text-[13px] text-white/70">{row.perk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right — perk cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:self-center">
              {[
                { icon: TrendingUp, title: "Earn 1 mile / $1", desc: "Accumulate miles on every dollar chartered." },
                { icon: Award, title: "Status tiers", desc: "Silver, Gold, and Platinum unlock growing privileges." },
                { icon: Gift, title: "Partner rewards", desc: "Earn and redeem with hotels, cars, and lifestyle partners." },
                { icon: Check, title: "Miles never expire", desc: "Fly once in 24 months and your miles stay active, forever." },
              ].map((perk) => (
                <div
                  key={perk.title}
                  className="rounded-lg border border-white/15 bg-white/5 p-5"
                >
                  <perk.icon className="h-5 w-5 text-champagne" strokeWidth={1.75} />
                  <h3 className="mt-3 text-[13px] font-semibold text-white">{perk.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-[1.65] text-white/55">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. FLEET CATEGORIES — Delta cabin-class selector
          (white bg, comparison card grid)
         ══════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold text-[var(--color-navy)]">
              Find your aircraft class
            </h2>
            <p className="mt-1 text-[14px] text-[var(--color-muted)]">
              Five categories. Every operator ARGUS Platinum–audited.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            {fleetCategories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/search?category=${cat.id}`}
                className={cn(
                  "group flex flex-col gap-3 p-5 transition-colors hover:bg-[var(--color-navy-light)] sm:flex-row sm:items-center sm:gap-6",
                  idx !== 0 && "border-t border-gray-200"
                )}
              >
                {/* Category name */}
                <div className="w-44 shrink-0">
                  <p className="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-navy)]">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">{cat.example}</p>
                </div>

                {/* Specs */}
                <div className="flex flex-1 flex-wrap items-center gap-6 text-[13px]">
                  <div className="flex items-center gap-2 text-[var(--color-muted)]">
                    <Users className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
                    {cat.pax}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-muted)]">
                    <Globe className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
                    {cat.range}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-muted)]">
                    <Clock className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
                    {cat.time}
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center gap-4 sm:ml-auto">
                  <div>
                    <p className="text-[11px] text-[var(--color-muted)]">From</p>
                    <p className="text-[16px] font-semibold text-[var(--color-navy)]">
                      {formatCurrency(cat.from)}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-300 text-[var(--color-muted)] transition-all group-hover:border-champagne group-hover:bg-champagne group-hover:text-white">
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. EMPTY LEGS — Delta "Best fare finder"
         ══════════════════════════════════════════════ */}
      <section id="empty-legs" className="bg-[var(--color-navy-light)] py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-champagne/15 px-3 py-1">
                <Tag className="h-3.5 w-3.5 text-champagne" strokeWidth={2} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-champagne">
                  Up to 75% off
                </span>
              </div>
              <h2 className="mt-3 text-[22px] font-semibold text-[var(--color-navy)]">
                Empty leg deals
              </h2>
              <p className="mt-1 text-[14px] text-[var(--color-muted)]">
                Fixed flat fares on returning repositioning aircraft. Live inventory.
              </p>
            </div>
            <Link
              href="/search?mode=empty"
              className="hidden shrink-0 items-center gap-1 text-[13px] font-medium text-champagne hover:underline sm:flex"
            >
              Browse all <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          <CardCarousel itemClassName="w-[88%] sm:w-[60%] md:w-[48%] lg:w-[42%]">
            {emptyLegs.map((leg) => (
              <EmptyLegCard key={leg.id} leg={leg} />
            ))}
          </CardCarousel>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. TRAVEL INFORMATION — Delta "Travel Info"
          (white bg, 6 info tiles — very Delta)
         ══════════════════════════════════════════════ */}
      <section id="travel-info" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold text-[var(--color-navy)]">
              Travel information
            </h2>
            <p className="mt-1 text-[14px] text-[var(--color-muted)]">
              Everything you need to know before you fly.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {travelInfoItems.map((item) => (
              <Link
                key={item.title}
                href="#"
                className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-[var(--color-navy)] hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy-light)]">
                  <item.icon className="h-5 w-5 text-[var(--color-navy)]" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[var(--color-navy)]">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[var(--color-muted)]">
                    {item.desc}
                  </p>
                </div>
                <ChevronRight
                  className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-champagne"
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8. WHY EXJET — Delta "Why fly with us"
          (navy-light bg, 4 trust cards)
         ══════════════════════════════════════════════ */}
      <section className="bg-[var(--color-navy-light)] py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-8 text-[22px] font-semibold text-[var(--color-navy)]">
            Why fly with EXJET
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "ARGUS Platinum", desc: "Aviation's highest independent safety rating on every operator." },
              { icon: Zap, title: "Confirmed in < 4 hrs", desc: "Live pricing, real availability, no waiting around." },
              { icon: Phone, title: "24/7 Concierge", desc: "A real person, never a bot, any hour, any time zone." },
              { icon: Globe, title: "5,000+ Airports", desc: "Private FBOs closer to where you're actually going." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-navy)] mb-4">
                  <item.icon className="h-5 w-5 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-[var(--color-navy)]">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-[var(--color-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          9. SPORTS & EVENTS CALENDAR
         ══════════════════════════════════════════════ */}
      <section id="events" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold text-[var(--color-navy)]">
              Sports &amp; events calendar
            </h2>
            <p className="mt-1 text-[14px] text-[var(--color-muted)]">
              Charter routes and nearby FBOs for the global sporting calendar.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {["F1", "NBA", "NFL", "NHL", "FIFA", "Masters"].map((l) => {
              const count = sportsEvents.filter((e) => e.league === l).length;
              return (
                <span
                  key={l}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium",
                    leagueColor(l)
                  )}
                >
                  {l}
                  <span className="rounded-full bg-gray-900/10 px-1.5 py-0.5 text-[10px]">{count}</span>
                </span>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            {sportsEvents.map((event, idx) => (
              <div
                key={event.id}
                className={cn(
                  "flex flex-col gap-3 p-5 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-5",
                  idx !== 0 && "border-t border-gray-200"
                )}
              >
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    leagueColor(event.league)
                  )}
                >
                  {event.league}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--color-navy)]">{event.event}</p>
                  <p className="text-[12px] text-[var(--color-muted)]">{event.venue} · {event.city}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-muted)]">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.75} />
                    {formatDateRange(event.date, event.endDate)}
                  </div>
                  <div className="hidden items-center gap-1.5 text-[12px] text-[var(--color-muted)] sm:flex">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.75} />
                    {event.airports.slice(0, 3).join(" · ")}
                  </div>
                  <Link
                    href={`/search?event=${event.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white"
                  >
                    Reserve
                    <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          10. FAQ — Delta "Need Help?"
         ══════════════════════════════════════════════ */}
      <section className="bg-[var(--color-navy-light)] py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="mb-8 text-[22px] font-semibold text-[var(--color-navy)]">
            Frequently asked questions
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {faq.map((item, idx) => (
              <details
                key={idx}
                className={cn("group", idx !== 0 && "border-t border-gray-200")}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 hover:bg-gray-50">
                  <h3 className="text-[15px] font-medium text-[var(--color-navy)]">{item.q}</h3>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-400 transition-all group-open:rotate-45 group-open:border-champagne group-open:bg-champagne group-open:text-white">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-gray-100 px-6 py-4">
                  <p className="text-[13px] leading-[1.75] text-[var(--color-muted)]">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          11. CONCIERGE STRIP — Delta "Need Help?"
          (3 quick-action tiles, white bg)
         ══════════════════════════════════════════════ */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl divide-y divide-gray-200 px-5 sm:px-8 sm:divide-x sm:divide-y-0">
          <div className="grid sm:grid-cols-3">
            {[
              { icon: Phone, label: "24/7 Concierge", sub: "Speak with a live specialist", cta: "1-800-EXJET", href: "tel:+18003935387" },
              { icon: PlaneTakeoff, label: "Instant Quote", sub: "Live pricing, no membership", cta: "Get a quote", href: "/search" },
              { icon: Star, label: "EXJET Miles", sub: "Earn on every dollar chartered", cta: "Join free", href: "/auth/register" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-4 border-b border-gray-200 p-6 transition-colors hover:bg-[var(--color-navy-light)] sm:border-b-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white transition-all group-hover:border-[var(--color-navy)] group-hover:bg-[var(--color-navy)]">
                  <item.icon className="h-5 w-5 text-[var(--color-navy)] transition-colors group-hover:text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-navy)]">{item.label}</p>
                  <p className="text-[12px] text-[var(--color-muted)]">{item.sub}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-champagne">{item.cta}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          12. CLOSING CTA — Delta bottom blue CTA
         ══════════════════════════════════════════════ */}
      <section className="bg-[var(--color-navy)] py-20 text-center">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">
            Ready to fly
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight text-white">
            The world on your schedule.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[1.75] text-white/60">
            Choose a route. Pick an aircraft. Confirm in minutes.
            No membership. No waiting list. No compromises.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="rounded-md bg-champagne px-8 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#c9a97a]"
            >
              Book a charter
            </Link>
            <Link
              href="/search?mode=empty"
              className="rounded-md border border-white/25 px-8 py-3.5 text-[14px] font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5"
            >
              View empty legs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Helpers ── */

function DeltaOfferCard({
  label, title, body, cta, href, accentColor,
}: {
  label: string; title: string; body: string; cta: string; href: string; accentColor: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
    >
      <div className={cn("h-2 w-full", accentColor)} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">
          {label}
        </p>
        <h3 className="text-[19px] font-semibold text-[var(--color-navy)]">{title}</h3>
        <p className="flex-1 text-[13px] leading-[1.65] text-[var(--color-muted)]">{body}</p>
        <div className="flex items-center gap-1 text-[13px] font-semibold text-champagne transition-transform group-hover:translate-x-0.5">
          {cta} <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}

function leagueColor(league: string) {
  switch (league) {
    case "F1": return "border-red-200 bg-red-50 text-red-800";
    case "NBA": return "border-amber-200 bg-amber-50 text-amber-800";
    case "NFL": return "border-blue-200 bg-blue-50 text-blue-800";
    case "NHL": return "border-indigo-200 bg-indigo-50 text-indigo-800";
    case "FIFA": return "border-green-200 bg-green-50 text-green-800";
    case "Masters": return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default: return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (start === end) return s.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}
