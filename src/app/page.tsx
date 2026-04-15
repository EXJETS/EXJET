import Link from "next/link";
import {
  PlaneTakeoff,
  PlaneLanding,
  ShieldCheck,
  Globe2,
  Clock4,
  Headset,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Tag,
  Users,
  Gauge,
  Ruler,
  Quote,
  Search,
  Zap,
  Wallet,
  Award,
} from "lucide-react";
import { FlightBookingWidget } from "@/components/booking/flight-booking-widget";
import {
  EmptyLegCard,
  type EmptyLeg,
} from "@/components/booking/empty-leg-card";
import { JetGrid } from "@/components/jets/jet-grid";
import jetsData from "@/data/jets.json";
import emptyLegsData from "@/data/empty-legs.json";
import type { Jet } from "@/types";

const jets = jetsData as unknown as Jet[];
const emptyLegs = emptyLegsData as EmptyLeg[];

const pressLogos = [
  "FORBES",
  "BLOOMBERG",
  "THE WALL STREET JOURNAL",
  "CONDÉ NAST",
  "ROBB REPORT",
  "THE NEW YORK TIMES",
];

const stats = [
  { label: "500+",   caption: "Flights completed" },
  { label: "50+",    caption: "Destinations" },
  { label: "ARGUS",  caption: "Platinum safety" },
  { label: "24 / 7", caption: "Concierge" },
];

const steps = [
  {
    number: "01",
    title: "Search",
    description:
      "Enter your route, dates, and passengers. Instant availability. Transparent pricing.",
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

const pillars = [
  {
    icon: ShieldCheck,
    title: "Safety, non‑negotiable",
    body: "Only ARGUS Platinum and Wyvern Wingman operators fly in our network.",
  },
  {
    icon: Clock4,
    title: "Wheels‑up in 4 hours",
    body: "Same-day departures from every major metro. No queues. No delays.",
  },
  {
    icon: Sparkles,
    title: "Curated cabins",
    body: "Every interior inspected for condition, finish, and onboard amenities.",
  },
  {
    icon: Headset,
    title: "Concierge 24/7",
    body: "A dedicated flight specialist on call, every hour of every day.",
  },
];

const tiers = [
  {
    name: "Access",
    price: "Pay‑as‑you‑fly",
    tagline: "No membership. Book on demand.",
    highlight: false,
    features: [
      "Instant quotes on every aircraft",
      "Full fleet & empty‑leg access",
      "Standard 24/7 concierge",
      "Flexible cancellation on charter",
    ],
    cta: "Start Flying",
  },
  {
    name: "Select",
    price: "$1,500 / mo",
    tagline: "For frequent flyers who want more.",
    highlight: true,
    features: [
      "Locked hourly rates",
      "Priority aircraft sourcing",
      "Dedicated flight advisor",
      "Complimentary catering upgrades",
      "20% off select empty legs",
    ],
    cta: "Become a Member",
  },
  {
    name: "Elite",
    price: "Invite‑only",
    tagline: "Bespoke aviation for principals.",
    highlight: false,
    features: [
      "Guaranteed availability worldwide",
      "Fixed global hourly rates",
      "Private hangar preferences",
      "White‑glove ground coordination",
      "Unlimited empty‑leg access",
    ],
    cta: "Request an Invite",
  },
];

const testimonials = [
  {
    text: "The booking experience is as refined as the aircraft. EXJET has replaced every other option for our leadership team.",
    name: "Alexandra Chen",
    role: "CEO, Vantage Capital",
  },
  {
    text: "Between games and training camps I need reliability and discretion. EXJET delivers — every single time.",
    name: "Marcus Whitfield",
    role: "Professional Athlete",
  },
  {
    text: "We chartered a heavy jet for our team retreat to Aspen. From boarding to arrival, every detail was flawless.",
    name: "Isabella Moreau",
    role: "Creative Director, Lumière Studios",
  },
];

export default function HomePage() {
  const featuredJets = jets.filter((j) => j.featured);

  return (
    <>
      {/* ============================================================ */}
      {/* HERO — Vercel mesh + Tesla full-viewport + Apple type         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-black text-white">
        {/* Mesh + grid backdrop */}
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div className="pointer-events-none absolute inset-0 bg-linegrid opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-5 pt-32 pb-16 text-center sm:px-8">
          {/* Mono eyebrow — Vercel */}
          <p className="animate-fade-in-up eyebrow-mono text-white/50">
            [ 01 ] &nbsp;— &nbsp;Global Access, On‑Demand.
          </p>

          {/* Headline — Apple display, gradient */}
          <h1 className="animate-fade-in-up animate-delay-100 display-xl mt-6">
            <span className="gradient-text">Your jet.</span>
            <br />
            <span className="gradient-text">Ready when you are.</span>
          </h1>

          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-white/60">
            Reserve a private jet to any of 50+ destinations — in under 60
            seconds. No memberships. No minimums. Just flight.
          </p>

          {/* Dual CTAs — Tesla pattern */}
          <div className="animate-fade-in-up animate-delay-300 mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="#book"
              className="inline-flex min-w-[220px] items-center justify-center gap-1.5 rounded-full bg-white px-7 py-3 text-[13px] font-medium text-black transition-colors hover:bg-white/90"
            >
              Reserve a Jet
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="#empty-legs"
              className="inline-flex min-w-[220px] items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <Tag className="h-3.5 w-3.5" strokeWidth={2} />
              View Empty Legs
            </Link>
          </div>

          {/* Booking Widget */}
          <div
            id="book"
            className="animate-fade-in-up animate-delay-400 mt-14 w-full max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <FlightBookingWidget />
            </div>
          </div>

          {/* Stat bar */}
          <div className="animate-fade-in-up animate-delay-500 mt-12 grid w-full max-w-4xl grid-cols-2 divide-white/[0.08] border-y border-white/[0.08] md:grid-cols-4 md:divide-x">
            {stats.map((s) => (
              <div
                key={s.caption}
                className="flex flex-col items-center gap-1 py-5"
              >
                <span className="text-xl font-semibold tracking-tight text-white">
                  {s.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {s.caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRESS STRIP — Vercel hairline marquee                          */}
      {/* ============================================================ */}
      <section className="relative border-y border-white/[0.08] bg-black py-8">
        <p className="mb-5 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          As featured in
        </p>
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex min-w-max items-center gap-16 whitespace-nowrap px-8">
            {[...pressLogos, ...pressLogos, ...pressLogos].map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="text-[13px] font-semibold tracking-[0.25em] text-white/30"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* EMPTY LEG DEALS — flyxo-inspired card grid                     */}
      {/* ============================================================ */}
      <section
        id="empty-legs"
        className="relative overflow-hidden bg-black py-24 sm:py-32"
      >
        <div className="pointer-events-none absolute inset-0 mesh-accent" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow-mono text-white/50">
                [ 02 ] &nbsp;— &nbsp;Empty Legs
              </p>
              <h2 className="display-lg mt-4 gradient-text">
                Luxury for less.
              </h2>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/60">
                Repositioning flights, discounted up to <span className="text-white">70%</span>. Entire aircraft, no membership required. Book in seconds.
              </p>
            </div>
            <Link
              href="/search?mode=empty"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] text-white transition-colors hover:bg-white/10"
            >
              View all deals
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {emptyLegs.map((leg) => (
              <EmptyLegCard key={leg.id} leg={leg} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CHARTER THE FLEET — dark cohesive surface                      */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-black py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-30" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <p className="eyebrow-mono text-white/50">
              [ 03 ] &nbsp;— &nbsp;Charter
            </p>
            <h2 className="display-lg mt-4 gradient-text">
              Book the entire jet.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-white/60">
              Hand‑picked aircraft from our global network. Every jet inspected,
              every operator certified ARGUS Platinum or Wyvern Wingman.
            </p>
          </div>

          <JetGrid jets={featuredJets} />

          <div className="mt-12 flex justify-center">
            <Link
              href="/jets"
              className="group inline-flex items-center gap-1 text-[14px] font-medium text-white transition-colors hover:text-white/80"
            >
              View the entire fleet
              <ChevronRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.25}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS — Vercel numbered cards                           */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-black py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-40" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="eyebrow-mono text-white/50">
              [ 04 ] &nbsp;— &nbsp;Process
            </p>
            <h2 className="display-lg mt-4 gradient-text">
              Three steps. Zero friction.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] tracking-widest text-white/40">
                    {step.number}
                  </span>
                  <step.icon
                    className="h-5 w-5 text-white/70"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-12 text-[22px] font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY EXJET — Feature pillars                                    */}
      {/* ============================================================ */}
      <section className="relative bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="eyebrow-mono text-white/50">
              [ 05 ] &nbsp;— &nbsp;Why EXJET
            </p>
            <h2 className="display-lg mt-4 gradient-text">
              Designed around you.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((f) => (
              <div
                key={f.title}
                className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <f.icon
                  className="h-6 w-6 text-white/80"
                  strokeWidth={1.5}
                />
                <h3 className="mt-10 text-[17px] font-semibold tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/55">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MEMBERSHIP TIERS — flyxo-style                                 */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-black py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 mesh-accent" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="eyebrow-mono text-white/50">
              [ 06 ] &nbsp;— &nbsp;Membership
            </p>
            <h2 className="display-lg mt-4 gradient-text">
              Fly the way that fits.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-white/60">
              Book on demand or join one of two membership tiers — each built
              around how often you fly.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-colors ${
                  t.highlight
                    ? "border-white/25 bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white">
                    <Zap className="h-3 w-3" strokeWidth={2.25} />
                    Most popular
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {t.name === "Access" && <Wallet className="h-4 w-4 text-white/70" strokeWidth={1.5} />}
                  {t.name === "Select" && <Zap     className="h-4 w-4 text-white/70" strokeWidth={1.5} />}
                  {t.name === "Elite"  && <Award   className="h-4 w-4 text-white/70" strokeWidth={1.5} />}
                  <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">
                    {t.name}
                  </span>
                </div>
                <h3 className="mt-4 text-[26px] font-semibold tracking-tight text-white">
                  {t.price}
                </h3>
                <p className="mt-1 text-[13px] text-white/55">{t.tagline}</p>

                <ul className="mt-8 space-y-3 border-t border-white/[0.08] pt-6 text-[13px]">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-white/75">
                      <span className="mt-[7px] inline-block h-1 w-1 rounded-full bg-white/60" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={t.name === "Elite" ? "/auth/register" : "/search"}
                  className={`mt-8 inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors ${
                    t.highlight
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {t.cta}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS                                                   */}
      {/* ============================================================ */}
      <section className="relative bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <p className="eyebrow-mono text-white/50">
              [ 07 ] &nbsp;— &nbsp;In their words
            </p>
            <h2 className="display-lg mt-4 gradient-text">
              Trusted at altitude.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8"
              >
                <Quote className="h-5 w-5 text-white/40" strokeWidth={1.5} />
                <blockquote className="mt-5 text-[16px] leading-relaxed text-white/85">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 border-t border-white/[0.08] pt-5">
                  <p className="text-[13px] font-semibold text-white">
                    {t.name}
                  </p>
                  <p className="text-[12px] text-white/50">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CLOSING CTA — Tesla full-bleed                                 */}
      {/* ============================================================ */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-0 mesh-hero opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-linegrid opacity-40" />

        <div className="relative mx-auto w-full max-w-4xl px-5 py-28 text-center sm:px-8">
          <p className="eyebrow-mono text-white/50">
            [ 08 ] &nbsp;— &nbsp;Cleared for takeoff
          </p>
          <h2 className="display-xl mt-6 gradient-text">Clear skies ahead.</h2>
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-white/60">
            Your next flight begins with a single tap. Live availability, transparent pricing, zero friction.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="#book"
              className="inline-flex min-w-[220px] items-center justify-center gap-1.5 rounded-full bg-white px-8 py-3 text-[13px] font-medium text-black transition-colors hover:bg-white/90"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2.25} />
              Reserve a Jet
            </Link>
            <Link
              href="#empty-legs"
              className="inline-flex min-w-[220px] items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <Tag className="h-3.5 w-3.5" strokeWidth={2} />
              Empty Legs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
