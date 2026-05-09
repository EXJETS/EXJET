import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Car,
  Clock,
  MapPin,
  Shield,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { CardCarousel } from "@/components/ui/card-carousel";
import { RouteCard } from "@/components/ground/route-card";
import { ChauffeurCard } from "@/components/ground/chauffeur-card";
import groundRoutes from "@/data/ground-routes.json";
import chauffeurs from "@/data/chauffeurs.json";
import vehicles from "@/data/vehicles.json";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "EXJET Ground — Black Car & Chauffeur Service",
  description:
    "Premium black car service worldwide. Book a chauffeur-driven sedan, SUV, or limousine for airport transfers, corporate travel, and special occasions.",
};

const VEHICLE_CATEGORIES = [
  { key: "sedan", label: "Sedan", icon: Car, desc: "Executive seating for up to 3 passengers" },
  { key: "suv", label: "SUV", icon: Car, desc: "Spacious luxury for groups up to 5" },
  { key: "electric", label: "Electric", icon: Zap, desc: "Zero-emission performance vehicles" },
  { key: "van", label: "Sprinter", icon: Users, desc: "Group transport for up to 12" },
];

export default function GroundPage() {
  const popularRoutes = groundRoutes.filter((r) => r.popular);
  const featuredChauffeurs = chauffeurs.slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(26,23,20,0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-20 sm:px-8 lg:pt-44 lg:pb-28">

          <div className="mb-8 flex justify-center">
            <span className="chapter-rule">
              <span className="text-champagne">EXJET Ground</span>
              <span className="text-[var(--color-muted)]">Black Car Service</span>
            </span>
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              Your city,
              <br />
              <em className="display-serif-italic text-champagne">on demand.</em>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.7] text-[var(--color-muted)]">
              Chauffeur-driven luxury from airport to boardroom, across the world's most important cities.
              Confirmed in under 60 seconds.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ground/book"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-champagne"
            >
              <span className="font-mono uppercase tracking-[0.18em]">Book a Ride</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <Link
              href="/ground/fleet"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] bg-white px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:border-champagne hover:text-champagne"
            >
              View Fleet
            </Link>
          </div>

          {/* KPI band */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-4">
            <GroundStat label="Cities" value="180+" />
            <GroundStat label="Chauffeurs" value="12,000+" />
            <GroundStat label="Confirm in" value="< 60s" />
            <GroundStat label="Rides rating" value="4.97 ★" />
          </div>
        </div>
      </section>

      {/* QUICK BOOK STRIP */}
      <section className="border-t border-[var(--color-hairline)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              Quick book:
            </span>
            {["Airport Transfer", "Hourly Chauffeur", "Point to Point", "Full Day"].map((t) => (
              <Link
                key={t}
                href={`/ground/book?type=${t.toLowerCase().replace(/ /g, "_")}`}
                className="rounded-full border border-[var(--color-hairline-strong)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-all hover:border-champagne hover:text-champagne"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VEHICLE CATEGORIES */}
      <section className="border-t border-[var(--color-hairline)] bg-[var(--color-ivory)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                I · The Fleet
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                Every occasion,
                <br />
                <em className="display-serif-italic">one vehicle away.</em>
              </h2>
            </div>
            <Link
              href="/ground/fleet"
              className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:text-champagne md:self-end"
            >
              Browse full fleet
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VEHICLE_CATEGORIES.map(({ key, label, icon: Icon, desc }) => {
              const count = vehicles.filter((v) => v.category === key).length;
              return (
                <Link
                  key={key}
                  href={`/ground/fleet?category=${key}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-[var(--color-hairline)] bg-white p-6 transition-all hover:border-champagne hover:shadow-[0_16px_40px_-16px_rgba(184,155,110,0.25)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)] transition-colors group-hover:border-champagne/30 group-hover:bg-champagne/5">
                    <Icon className="h-5 w-5 text-champagne" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-serif text-[20px] leading-tight text-[var(--color-ink)]">{label}</div>
                    <div className="mt-1 text-[12px] text-[var(--color-muted)]">{desc}</div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-[var(--color-hairline)] pt-3">
                    <span className="font-mono text-[11px] text-[var(--color-subtle)]">{count} models</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-muted)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-champagne" strokeWidth={2} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-[var(--color-hairline)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              II · How it works
            </span>
            <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
              Confirmed in{" "}
              <em className="display-serif-italic">seconds.</em>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Enter your route", desc: "Pick-up address, destination, date and time — takes under 30 seconds.", icon: MapPin },
              { step: "02", title: "Choose your vehicle", desc: "Select from executive sedans, SUVs, electric vehicles, or group sprinters.", icon: Car },
              { step: "03", title: "Get confirmed", desc: "Instant confirmation with your chauffeur's name and vehicle details.", icon: ShieldCheck },
              { step: "04", title: "Ride in style", desc: "Your chauffeur arrives on time, every time. Live ETA tracking included.", icon: Star },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                    {step}
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-hairline)]" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-[var(--color-ivory-deep)]">
                  <Icon className="h-5 w-5 text-champagne" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-[20px] leading-tight text-[var(--color-ink)]">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES */}
      <section id="routes" className="border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                III · Popular transfers
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                Most-booked
                <br />
                <em className="display-serif-italic">corridors</em>
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--color-muted)]">
                Live pricing on the transfers our clients request most.
              </p>
            </div>
            <Link
              href="/ground/book"
              className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:text-champagne md:self-end"
            >
              Book any route
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
          <div className="mt-16">
            <CardCarousel itemClassName="w-[88%] sm:w-[52%] md:w-[40%] lg:w-[28%]">
              {popularRoutes.map((r) => (
                <RouteCard key={r.id} route={r} />
              ))}
            </CardCarousel>
          </div>
        </div>
      </section>

      {/* CHAUFFEURS */}
      <section id="chauffeurs" className="border-t border-[var(--color-hairline)] bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
                IV · Our chauffeurs
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                Elite drivers,
                <br />
                <em className="display-serif-italic">verified.</em>
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--color-muted)]">
                Every chauffeur is background-checked, professionally trained, and rated by thousands of clients.
              </p>
            </div>
            <Link
              href="/ground/chauffeur"
              className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:text-champagne md:self-end"
            >
              Join as chauffeur
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredChauffeurs.map((c) => (
              <ChauffeurCard key={c.id} chauffeur={c} />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
              V · Why EXJET Ground
            </span>
            <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
              Built for the
              <br />
              <em className="display-serif-italic">demanding traveler.</em>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Background verified", desc: "Every chauffeur passes a comprehensive background check, DMV review, and defensive driving certification before their first ride." },
              { icon: Clock, title: "Punctuality guarantee", desc: "Chauffeurs arrive 10 minutes early. If your driver is more than 5 minutes late, your next ride is complimentary." },
              { icon: Shield, title: "Fully insured", desc: "All rides carry commercial liability insurance up to $10M. Your safety and peace of mind are our priority." },
              { icon: Star, title: "5-star rated fleet", desc: "All vehicles are no older than 3 years, maintained to manufacturer standards, and detailed before every booking." },
              { icon: Zap, title: "Instant confirmation", desc: "No waiting. Your booking is confirmed in under 60 seconds with full chauffeur and vehicle details." },
              { icon: Users, title: "24/7 concierge", desc: "Our operations team is available around the clock for itinerary changes, special requests, and flight monitoring." },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-[var(--color-hairline)] bg-white p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne/10">
                  <Icon className="h-5 w-5 text-champagne" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)]">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-5 py-32 text-center sm:px-8">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-champagne">
            <span className="h-px w-8 bg-champagne/60" />
            Ready when you are
            <span className="h-px w-8 bg-champagne/60" />
          </span>
          <h2 className="display-serif mt-8 text-white">
            First class,
            <br />
            <em className="display-serif-italic text-champagne">door to door.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.8] text-white/70">
            Book your chauffeur in 60 seconds. Cancel free up to 1 hour before pickup.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ground/book"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:bg-champagne hover:text-white"
            >
              <span className="font-mono uppercase tracking-[0.18em]">Book Now</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
            <Link
              href="/ground/fleet"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-white hover:bg-white/10"
            >
              View Fleet
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function GroundStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[var(--color-ivory)] px-5 py-7 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">{label}</span>
      <span className="font-serif text-[22px] leading-none text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
