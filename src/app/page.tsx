import Link from "next/link";
import {
  Globe,
  Airplane,
  Clock,
  Headset,
  ShieldCheck,
  Lightning,
  Tag,
  ArrowRight,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import popularRoutesData from "@/data/popular-routes.json";
import emptyLegsData from "@/data/empty-legs.json";
import { HeroSearch } from "@/components/booking/hero-search";

const popularRoutes = popularRoutesData.slice(0, 6);
const featuredLegs = emptyLegsData.slice(0, 4);

const fleetClasses = [
  {
    name: "Light",
    range: "Up to 2,200 nm",
    pax: "Up to 7 pax",
    example: "Citation CJ4 · Phenom 300E",
    price: "from $7,400",
    slug: "light",
  },
  {
    name: "Midsize",
    range: "Up to 2,800 nm",
    pax: "Up to 9 pax",
    example: "Hawker 900XP · Citation XLS",
    price: "from $12,000",
    slug: "midsize",
  },
  {
    name: "Super Mid",
    range: "Up to 3,500 nm",
    pax: "Up to 9 pax",
    example: "Citation X+ · Challenger 350",
    price: "from $18,500",
    slug: "super_midsize",
  },
  {
    name: "Heavy",
    range: "Up to 5,500 nm",
    pax: "Up to 16 pax",
    example: "Challenger 605 · Falcon 900",
    price: "from $28,000",
    slug: "heavy",
  },
  {
    name: "Ultra Long",
    range: "Up to 7,500 nm",
    pax: "Up to 19 pax",
    example: "Global 7500 · Gulfstream G700",
    price: "from $55,000",
    slug: "ultra_long",
  },
];

const heroStats = [
  { Icon: Globe, n: "5,000+", label: "Airports" },
  { Icon: Airplane, n: "2,400+", label: "Aircraft" },
  { Icon: Clock, n: "<4 hr", label: "Confirmation" },
  { Icon: Headset, n: "24/7", label: "Concierge" },
];

const pillars = [
  {
    Icon: ShieldCheck,
    title: "ARGUS Platinum Safety",
    body: "Every aircraft and operator is vetted against the highest safety standards in private aviation — no exceptions.",
  },
  {
    Icon: Lightning,
    title: "Confirmed in Under 4 Hours",
    body: "Submit a request and receive full confirmation, pricing, and crew details in hours — not days.",
  },
  {
    Icon: Headset,
    title: "24/7 Dedicated Concierge",
    body: "Your personal aviation advisor is available around the clock for every request, change, and question.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="mesh-ink relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20">
        {/* top accent drip */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-28 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(184,155,110,0.35))",
          }}
        />

        <div className="max-w-4xl mx-auto w-full text-center">
          {/* eyebrow */}
          <div className="animate-fade-in-up mb-6">
            <span className="chapter-rule" style={{ color: "rgba(184,155,110,0.65)" }}>
              Global private aviation
            </span>
          </div>

          {/* headline */}
          <div className="animate-fade-in-up animate-delay-100 mb-6">
            <h1 className="display-serif leading-none" style={{ color: "#faf8f4" }}>
              Global Access,
              <br />
              <em className="display-serif-italic gradient-text-champagne">On Demand.</em>
            </h1>
          </div>

          {/* sub */}
          <p
            className="animate-fade-in-up animate-delay-200 text-lg leading-relaxed max-w-xl mx-auto mb-10"
            style={{ color: "rgba(250,248,244,0.55)" }}
          >
            Reserve a private jet in minutes. 5,000+ airports worldwide,
            ARGUS Platinum safety, 24/7 concierge.
          </p>

          {/* search */}
          <div className="animate-fade-in-up animate-delay-300 mb-14">
            <HeroSearch />
          </div>

          {/* stats */}
          <div className="animate-fade-in-up animate-delay-400 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {heroStats.map(({ Icon, n, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon weight="thin" size={22} style={{ color: "rgba(184,155,110,0.6)" }} />
                <div className="font-serif text-2xl" style={{ color: "rgba(250,248,244,0.9)" }}>
                  {n}
                </div>
                <div className="eyebrow-mono text-xs" style={{ color: "rgba(250,248,244,0.35)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* scroll cue */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "rgba(250,248,244,0.25)" }}
        >
          <div className="eyebrow-mono text-xs">Scroll</div>
          <div
            className="w-px h-8"
            style={{ background: "linear-gradient(to bottom, rgba(250,248,244,0.25), transparent)" }}
          />
        </div>
      </section>

      {/* ── POPULAR ROUTES ───────────────────────────────────────── */}
      <section className="bg-ivory py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="chapter-rule mb-4">Popular Routes</div>
              <h2 className="display-serif-md text-ink">Most-booked corridors</h2>
            </div>
            <Link
              href="/search"
              className="hidden md:flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
            >
              View all <CaretRight weight="bold" size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularRoutes.map((route) => (
              <Link
                key={route.id}
                href={`/search?from=${route.from.code}&to=${route.to.code}`}
                className="surface rounded-2xl p-6 hover:shadow-lg transition-all duration-200 group block"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="font-serif text-4xl text-ink leading-none">
                      {route.from.code}
                    </div>
                    <div className="eyebrow-mono text-xs text-muted mt-1.5">
                      {route.from.city}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-px" style={{ background: "rgba(26,23,20,0.10)" }} />
                    <Airplane weight="thin" size={14} className="text-champagne" />
                    <div className="eyebrow-mono text-xs text-muted">{route.flightTime}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif text-4xl text-ink leading-none">
                      {route.to.code}
                    </div>
                    <div className="eyebrow-mono text-xs text-muted mt-1.5">
                      {route.to.city}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: "1px solid rgba(26,23,20,0.08)" }}
                >
                  <div>
                    <div className="text-xs text-muted mb-0.5">From</div>
                    <div className="text-lg font-semibold text-ink">
                      ${route.fromPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow-mono text-xs text-muted bg-bone px-2.5 py-1 rounded-full">
                      {route.recommended}
                    </span>
                    <ArrowRight
                      weight="regular"
                      size={16}
                      className="text-muted group-hover:text-champagne group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET CLASSES ────────────────────────────────────────── */}
      <section className="bg-ink py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="chapter-rule mb-4" style={{ color: "rgba(184,155,110,0.55)" }}>
              The Fleet
            </div>
            <h2 className="display-serif-md" style={{ color: "#faf8f4" }}>
              Find your aircraft class
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {fleetClasses.map((cls, i) => (
              <Link
                key={cls.name}
                href={`/search?category=${cls.slug}`}
                className="group relative rounded-2xl p-6 flex flex-col justify-between min-h-[220px] transition-all duration-300 overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(250,248,244,0.08)",
                }}
              >
                {/* watermark */}
                <div className="absolute -bottom-3 -right-3 pointer-events-none opacity-[0.06]">
                  <Airplane weight="thin" size={84} style={{ color: "#faf8f4" }} />
                </div>

                <div>
                  <div
                    className="eyebrow-mono text-xs mb-3"
                    style={{ color: "rgba(184,155,110,0.5)" }}
                  >
                    Class {String.fromCharCode(65 + i)}
                  </div>
                  <div className="font-serif text-3xl leading-none" style={{ color: "#faf8f4" }}>
                    {cls.name}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: "rgba(250,248,244,0.35)" }}
                  >
                    <span>{cls.pax}</span>
                    <span>{cls.range}</span>
                  </div>
                  <div
                    className="eyebrow-mono text-xs"
                    style={{ color: "rgba(250,248,244,0.2)" }}
                  >
                    {cls.example}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-sm font-medium text-champagne">{cls.price}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight weight="bold" size={14} className="text-champagne" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPTY LEGS ───────────────────────────────────────────── */}
      <section className="bg-bone py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="chapter-rule mb-4">Empty Legs</div>
              <h2 className="display-serif-md text-ink">
                Private jet,{" "}
                <em className="display-serif-italic gradient-text-champagne">up to 75% off.</em>
              </h2>
              <p className="text-muted text-sm mt-3 max-w-md leading-relaxed">
                Repositioning flights at significant discounts. Available on a
                first-come, first-served basis.
              </p>
            </div>
            <Link
              href="/empty-legs"
              className="hidden md:flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
            >
              View all <CaretRight weight="bold" size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredLegs.map((leg) => (
              <div
                key={leg.id}
                className="surface rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-serif text-4xl text-ink leading-none">
                        {leg.from.code}
                      </div>
                      <div className="eyebrow-mono text-xs text-muted mt-1.5">
                        {leg.from.city}
                      </div>
                    </div>
                    <ArrowRight weight="bold" size={16} className="text-champagne mt-1 shrink-0" />
                    <div>
                      <div className="font-serif text-4xl text-ink leading-none">
                        {leg.to.code}
                      </div>
                      <div className="eyebrow-mono text-xs text-muted mt-1.5">
                        {leg.to.city}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: "rgba(184,155,110,0.12)", color: "#7a5f38" }}
                  >
                    <Tag weight="bold" size={11} />
                    <span className="eyebrow-mono text-xs">−{leg.discountPct}%</span>
                  </div>
                </div>

                <div
                  className="flex items-end justify-between pt-4"
                  style={{ borderTop: "1px solid rgba(26,23,20,0.08)" }}
                >
                  <div>
                    <div className="text-sm text-muted">
                      {new Date(leg.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {leg.departTime}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {leg.aircraft} · {leg.capacity} seats
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted line-through mb-0.5">
                      ${leg.retailPrice.toLocaleString()}
                    </div>
                    <div className="text-2xl font-semibold text-ink">
                      ${leg.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY EXJET ────────────────────────────────────────────── */}
      <section
        className="bg-ivory py-28 px-4"
        style={{ borderTop: "1px solid rgba(26,23,20,0.07)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="chapter-rule justify-center mb-4">Why EXJET</div>
            <h2 className="display-serif-md text-ink">Built for discerning travelers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pillars.map(({ Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "#ece5d8" }}
                >
                  <Icon weight="thin" size={28} className="text-champagne" />
                </div>
                <h3 className="text-base font-semibold text-ink mb-3">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────── */}
      <section className="mesh-ink py-36 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div
            className="chapter-rule justify-center mb-8"
            style={{ color: "rgba(184,155,110,0.55)" }}
          >
            Ready to depart
          </div>
          <h2
            className="display-serif leading-none mb-6"
            style={{ color: "#faf8f4" }}
          >
            Your runway
            <br />
            <em className="display-serif-italic gradient-text-champagne">awaits.</em>
          </h2>
          <p
            className="text-lg mb-12 max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(250,248,244,0.45)" }}
          >
            Begin a search or explore our empty legs to find your next private flight.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-champagne hover:bg-champagne-soft text-ink font-medium rounded-full px-8 py-4 text-sm transition-colors"
            >
              Begin a search <ArrowRight weight="bold" size={16} />
            </Link>
            <Link
              href="/empty-legs"
              className="inline-flex items-center gap-2 font-medium rounded-full px-8 py-4 text-sm transition-colors"
              style={{ color: "rgba(250,248,244,0.55)" }}
            >
              View empty legs <CaretRight weight="bold" size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
