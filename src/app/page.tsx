import Link from "next/link";
import {
  PlaneTakeoff,
  PlaneLanding,
  Search,
  ShieldCheck,
  Globe2,
  Clock4,
  Headset,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Users,
  Gauge,
  Ruler,
  Quote,
} from "lucide-react";
import SearchBar from "@/components/search/search-bar";
import { JetGrid } from "@/components/jets/jet-grid";
import jetsData from "@/data/jets.json";
import type { Jet } from "@/types";

const jets = jetsData as unknown as Jet[];

const stats = [
  { icon: Globe2, label: "50+", caption: "Destinations" },
  { icon: PlaneTakeoff, label: "500+", caption: "Flights completed" },
  { icon: ShieldCheck, label: "ARGUS", caption: "Platinum safety" },
  { icon: Headset, label: "24/7", caption: "Concierge" },
];

const steps = [
  {
    number: "01",
    title: "Search",
    description:
      "Enter your route, dates, and passengers. Instant availability, transparent pricing.",
    icon: Search,
  },
  {
    number: "02",
    title: "Select",
    description:
      "Compare aircraft side‑by‑side. Filter by range, cabin, speed, and amenities.",
    icon: PlaneTakeoff,
  },
  {
    number: "03",
    title: "Soar",
    description:
      "Confirm in minutes. Track your flight live. Arrive effortlessly, anywhere.",
    icon: PlaneLanding,
  },
];

const categories = [
  {
    name: "Light",
    slug: "light",
    passengers: "4–6",
    range: "1,500 nm",
    priceRange: "From $3,000 / hr",
    headline: "Agile. Efficient.",
    tagline:
      "The perfect aircraft for regional trips and short hops — nimble, fuel‑efficient, and ready on short notice.",
    accent: "bg-neutral-950 text-white",
  },
  {
    name: "Midsize",
    slug: "midsize",
    passengers: "6–8",
    range: "2,800 nm",
    priceRange: "From $5,000 / hr",
    headline: "The balance of range and comfort.",
    tagline:
      "Stand‑up cabins, coast‑to‑coast capability, and a ride that disappears into the clouds.",
    accent: "bg-neutral-100 text-neutral-900",
  },
  {
    name: "Super Midsize",
    slug: "super-midsize",
    passengers: "8–10",
    range: "3,600 nm",
    priceRange: "From $6,500 / hr",
    headline: "Quiet. Fast. Uncompromised.",
    tagline:
      "Transcontinental range with a cabin engineered for focus, conversation, and rest.",
    accent: "bg-neutral-950 text-white",
  },
  {
    name: "Heavy",
    slug: "heavy",
    passengers: "10–14",
    range: "4,500 nm",
    priceRange: "From $8,000 / hr",
    headline: "A residence above the weather.",
    tagline:
      "Full galley, private lavatory, and cabin zones that turn any distance into a short flight.",
    accent: "bg-neutral-100 text-neutral-900",
  },
  {
    name: "Ultra Long Range",
    slug: "ultra-long-range",
    passengers: "12–19",
    range: "7,500 nm",
    priceRange: "From $12,000 / hr",
    headline: "Non‑stop. Anywhere. Always.",
    tagline:
      "The summit of private aviation. A private suite, a private sky, and the entire world within reach.",
    accent: "bg-neutral-950 text-white",
  },
];

const testimonials = [
  {
    text:
      "The booking experience is as refined as the aircraft. EXJET has replaced every other option for our leadership team.",
    name: "Alexandra Chen",
    role: "CEO, Vantage Capital",
  },
  {
    text:
      "Between games and training camps I need reliability and discretion. EXJET delivers — every single time.",
    name: "Marcus Whitfield",
    role: "Professional Athlete",
  },
  {
    text:
      "We chartered a heavy jet for our team retreat to Aspen. From boarding to arrival, every detail was flawless.",
    name: "Isabella Moreau",
    role: "Creative Director, Lumière Studios",
  },
];

export default function HomePage() {
  const featuredJets = jets.filter((j) => j.featured);

  return (
    <>
      {/* ============================================================ */}
      {/* HERO — Tesla-style full-viewport with transparent nav overlay */}
      {/* ============================================================ */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-between overflow-hidden bg-neutral-950 text-white">
        {/* Ambient background — subtle spotlight, no noisy gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
        </div>

        {/* Hero copy — centered, tall, Tesla-style */}
        <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 flex flex-col items-center justify-center px-6 pt-32 text-center">
          <p className="animate-fade-in-up eyebrow text-white/60">
            Private Aviation, On Demand
          </p>
          <h1 className="animate-fade-in-up animate-delay-100 display-xl mt-5 text-white">
            Your jet.
            <br />
            <span className="text-white/70">Ready when you are.</span>
          </h1>
          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-white/70">
            Reserve a private jet to any of 50+ destinations — in under 60
            seconds. No memberships. No minimums. Just flight.
          </p>

          {/* Dual CTAs — Tesla signature pattern */}
          <div className="animate-fade-in-up animate-delay-300 mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-white px-8 py-3.5 text-[14px] font-medium text-neutral-900 transition-colors hover:bg-white/90"
            >
              Reserve a Jet
            </Link>
            <Link
              href="/jets"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-[14px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Explore the Fleet
            </Link>
          </div>
        </div>

        {/* Bottom stat bar — Apple-style quiet footer on hero */}
        <div className="animate-fade-in-up animate-delay-400 relative z-10 w-full border-t border-white/10 bg-black/30 backdrop-blur-md">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-0 px-6 py-6 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.caption}
                className={`flex items-center gap-3 py-2 ${
                  i < stats.length - 1 ? "md:border-r md:border-white/10" : ""
                } md:justify-center`}
              >
                <s.icon className="h-5 w-5 text-white/70" strokeWidth={1.5} />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-white">
                    {s.label}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-white/50">
                    {s.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* QUICK SEARCH STRIP — floating, minimal                         */}
      {/* ============================================================ */}
      <section className="relative -mt-10 z-20 px-4">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
          <div className="p-3 sm:p-4">
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED AIRCRAFT — Apple white section, large type            */}
      {/* ============================================================ */}
      <section className="bg-white py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="eyebrow text-neutral-500">The Fleet</p>
            <h2 className="display-lg mt-4 text-neutral-950">
              Aircraft, curated.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-neutral-500">
              Every jet in our network meets ARGUS Platinum and Wyvern Wingman
              safety standards. Hand‑picked. Exceptionally maintained.
            </p>
          </div>

          <JetGrid jets={featuredJets} />

          <div className="mt-14 flex justify-center">
            <Link
              href="/jets"
              className="inline-flex items-center gap-1 text-[15px] font-medium text-[var(--color-accent-500)] transition-colors hover:text-[var(--color-accent-600)]"
            >
              View the entire fleet
              <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS — Apple dark section                              */}
      {/* ============================================================ */}
      <section className="bg-neutral-950 py-28 text-white sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="eyebrow text-white/50">The Experience</p>
            <h2 className="display-lg mt-4">Three steps. Zero friction.</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-10 transition-colors hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-mono tracking-widest text-white/40">
                    {step.number}
                  </span>
                  <step.icon
                    className="h-6 w-6 text-white/70"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-14 text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CATEGORIES — Tesla-style alternating full-viewport panels      */}
      {/* ============================================================ */}
      {categories.map((cat, idx) => {
        const dark = cat.accent.includes("neutral-950");
        return (
          <section
            key={cat.slug}
            className={`${cat.accent} relative flex min-h-[82vh] items-center overflow-hidden`}
          >
            {/* Soft geometric backdrop */}
            <div
              className={`pointer-events-none absolute inset-0 ${
                dark ? "opacity-10" : "opacity-60"
              }`}
            >
              <div
                className={`absolute ${
                  idx % 2 === 0 ? "-right-40" : "-left-40"
                } top-1/2 h-[80vh] w-[80vh] -translate-y-1/2 rounded-full blur-3xl ${
                  dark ? "bg-white" : "bg-neutral-300"
                }`}
              />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
              <div
                className={`mx-auto flex max-w-2xl flex-col items-center text-center`}
              >
                <p
                  className={`eyebrow ${
                    dark ? "text-white/50" : "text-neutral-500"
                  }`}
                >
                  {cat.name} Jet
                </p>
                <h3 className="display-lg mt-4">{cat.headline}</h3>
                <p
                  className={`mt-5 max-w-xl text-[17px] leading-relaxed ${
                    dark ? "text-white/70" : "text-neutral-600"
                  }`}
                >
                  {cat.tagline}
                </p>

                {/* Spec strip */}
                <div
                  className={`mt-10 grid w-full max-w-xl grid-cols-3 gap-6 border-y py-6 ${
                    dark ? "border-white/10" : "border-neutral-300/70"
                  }`}
                >
                  <SpecItem
                    icon={Users}
                    label="Passengers"
                    value={cat.passengers}
                    dark={dark}
                  />
                  <SpecItem
                    icon={Ruler}
                    label="Range"
                    value={cat.range}
                    dark={dark}
                  />
                  <SpecItem
                    icon={Gauge}
                    label="Rate"
                    value={cat.priceRange.replace("From ", "")}
                    dark={dark}
                  />
                </div>

                {/* Dual CTA — Tesla pattern */}
                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                  <Link
                    href={`/search?category=${cat.slug}`}
                    className={`inline-flex min-w-[200px] items-center justify-center rounded-full px-7 py-3 text-[14px] font-medium transition-colors ${
                      dark
                        ? "bg-white text-neutral-900 hover:bg-white/90"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    }`}
                  >
                    Reserve
                  </Link>
                  <Link
                    href={`/search?category=${cat.slug}`}
                    className={`inline-flex min-w-[200px] items-center justify-center rounded-full border px-7 py-3 text-[14px] font-medium transition-colors ${
                      dark
                        ? "border-white/30 bg-white/5 text-white hover:bg-white/10"
                        : "border-neutral-400/50 bg-transparent text-neutral-900 hover:bg-white/60"
                    }`}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ============================================================ */}
      {/* WHY EXJET — Apple feature grid                                 */}
      {/* ============================================================ */}
      <section className="bg-[#f5f5f7] py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="eyebrow text-neutral-500">Why EXJET</p>
            <h2 className="display-lg mt-4 text-neutral-950">
              Designed around you.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Safety first",
                body: "Only ARGUS Platinum and Wyvern Wingman operators fly in our network.",
              },
              {
                icon: Clock4,
                title: "Ready in 4 hours",
                body: "Same-day departures across major metros. No queues. No delays.",
              },
              {
                icon: Sparkles,
                title: "Curated cabins",
                body: "Every interior inspected for condition, finish, and amenities.",
              },
              {
                icon: Headset,
                title: "Concierge 24/7",
                body: "A dedicated flight specialist on call, every hour of every day.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group flex flex-col rounded-3xl bg-white p-8 ring-1 ring-black/5 transition-shadow hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)]"
              >
                <f.icon
                  className="h-6 w-6 text-neutral-800"
                  strokeWidth={1.5}
                />
                <h3 className="mt-14 text-[19px] font-semibold tracking-tight text-neutral-950">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS — quiet, single-column, editorial                 */}
      {/* ============================================================ */}
      <section className="bg-white py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="eyebrow text-neutral-500">In Their Words</p>
            <h2 className="display-lg mt-4 text-neutral-950">
              Trusted at altitude.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-3xl border border-neutral-200/80 p-10"
              >
                <Quote
                  className="h-6 w-6 text-neutral-300"
                  strokeWidth={1.5}
                />
                <blockquote className="mt-6 text-[17px] leading-relaxed text-neutral-800">
                  {t.text}
                </blockquote>
                <figcaption className="mt-8 border-t border-neutral-200/80 pt-5">
                  <p className="text-[14px] font-semibold text-neutral-950">
                    {t.name}
                  </p>
                  <p className="text-[13px] text-neutral-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CLOSING CTA — Tesla-style full black                           */}
      {/* ============================================================ */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-28 text-center">
          <h2 className="display-xl">Clear skies ahead.</h2>
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-white/70">
            Your next flight begins with a single tap. Search live availability
            now — no account required.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/search"
              className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-[14px] font-medium text-neutral-900 transition-colors hover:bg-white/90"
            >
              <Search className="h-4 w-4" strokeWidth={2} />
              Search Flights
            </Link>
            <Link
              href="/jets"
              className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-[14px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Browse Aircraft
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
  dark,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  dark: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon
        className={`h-4 w-4 ${dark ? "text-white/60" : "text-neutral-500"}`}
        strokeWidth={1.75}
      />
      <span
        className={`text-[11px] uppercase tracking-widest ${
          dark ? "text-white/50" : "text-neutral-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-base font-semibold ${
          dark ? "text-white" : "text-neutral-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
