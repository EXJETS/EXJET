import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Shield,
  Zap,
  Settings,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Special Mission Interiors — Luminary Air Group",
  description:
    "ADMI — All Day Mission Interior. Durable, lightweight, modular mission-specific aircraft interiors for ISR, Med-Evac, Command & Control, Special Operations, and Government surveillance platforms.",
};

const missionTypes = [
  {
    id: "isr",
    title: "Intelligence, Surveillance & Reconnaissance",
    abbr: "ISR",
    description:
      "Interiors engineered around sensor racks, operator consoles, and data management systems — with rapid access behind every wall panel and under all flooring to support mission-critical equipment changes.",
  },
  {
    id: "medevac",
    title: "Medical Evacuation",
    abbr: "Med-Evac",
    description:
      "Modular configurations accommodating litter mounts, medical equipment stations, and attendant seating — designed for rapid reconfiguration between casualty transport and standard passenger roles.",
  },
  {
    id: "c2",
    title: "Command & Control",
    abbr: "Command & Control",
    description:
      "Purpose-built communication and command stations integrated into lightweight ADMI cabinetry — structured to form naturally around mission electronics while maintaining clean maintenance access.",
  },
  {
    id: "specops",
    title: "Special Operations",
    abbr: "Special Operations",
    description:
      "Ruggedised, lightweight interiors for austere operating environments — durable finishes, secure storage, and rapid-reconfigure capability built for high-tempo operational use.",
  },
  {
    id: "surveillance",
    title: "Government & Surveillance",
    abbr: "Government / Surveillance",
    description:
      "Discreet, professional cabin environments for government and surveillance platforms — clean, functional aesthetics with the technical access and modularity that sustained operations demand.",
  },
] as const;

const services = [
  {
    label: "Cabinetry Fabrication",
    desc: "Custom mission cabinetry in lightweight composite and aluminium, engineered to form around your equipment.",
  },
  {
    label: "Seating & Upholstery",
    desc: "Mission-appropriate seating systems and upholstery — durable materials selected for long-duration operational use.",
  },
  {
    label: "Repairs & Modifications",
    desc: "In-service repair and configuration modification for existing mission interiors, maintaining your operational tempo.",
  },
  {
    label: "Green Aircraft Completions",
    desc: "Full ADMI completion builds on green aircraft — from blank fuselage to mission-ready interior under one certified roof.",
  },
  {
    label: "Installation Support",
    desc: "Expert installation teams available at your location or our facility, with full documentation and maintenance records.",
  },
  {
    label: "Design Consultation",
    desc: "Mission interior design support from concept through certification — working with your programme and equipment teams.",
  },
] as const;

export default function SpecialMissionInteriorsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(181,180,0,0.07),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36">
          {/* Eyebrow */}
          <div className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-lime)]">Special Mission Interiors</span>
              <span className="text-[var(--color-muted)]">ADMI Platform</span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              Built for
              <br />
              <em className="display-serif-italic" style={{ color: "var(--color-lime)" }}>
                the mission.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-[var(--color-muted)]">
              The ADMI — All Day Mission Interior — is Luminary&rsquo;s purpose-built
              platform for mission-specific aircraft interiors. Durable, lightweight,
              and modular by design; engineered to form around your equipment and
              support your mission from first deployment through sustained operations.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-lime)]"
            >
              Discuss Your Mission
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/vip-interiors"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              VIP Interiors
            </Link>
          </div>

          {/* KPI band */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-4">
            <HeroStat label="Platform" value="ADMI™" />
            <HeroStat label="Weight vs VIP" value="Reduced" />
            <HeroStat label="Access" value="Full Rapid" />
            <HeroStat label="Certification" value="Part 21 Mfr" />
          </div>
        </div>
      </section>

      {/* ── ADMI INTRO ── 2-column */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12 lg:gap-16">
            {/* Left — description */}
            <div className="md:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                I · The ADMI Platform
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                All Day Mission
                <br />
                <em className="display-serif-italic text-[var(--color-muted)]">Interior.</em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.85] text-[var(--color-muted)]">
                The ADMI is Luminary&rsquo;s proprietary mission interior platform —
                engineered from first principles around the demands of sustained
                operational use rather than adapted from a VIP design intent.
              </p>
              <p className="mt-4 text-[15px] leading-[1.85] text-[var(--color-muted)]">
                Where VIP interiors prioritise aesthetics and passenger comfort,
                ADMI prioritises weight reduction, modular reconfiguration, equipment
                integration, and rapid access behind every interior surface. The result
                is an interior that weighs less, adapts faster, and costs less to
                maintain through its operational life.
              </p>
              <p className="mt-4 text-[15px] leading-[1.85] text-[var(--color-muted)]">
                ADMI builds are available as green aircraft completions or as
                retrofit projects on existing platforms — with full design support,
                Part 21 certified manufacturing, and installation services provided
                by Luminary&rsquo;s experienced teams.
              </p>
              <Link
                href="/contact"
                className="group mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-lime)]"
              >
                Request an ADMI briefing
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>

            {/* Right — hallmarks */}
            <div className="md:col-span-6">
              <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)]">
                <Hallmark
                  icon={Zap}
                  title="Lightweight"
                  description="ADMI cabinetry and structures are engineered in lightweight composites and aluminium alloys — delivering a measurable weight saving versus equivalent VIP-spec interiors without compromising structural integrity or longevity."
                />
                <Hallmark
                  icon={Settings}
                  title="Modular"
                  description="Modular panel systems and standardised mounting interfaces allow rapid role-change between configurations — adapting to evolving mission requirements without requiring full interior removal or expensive re-engineering."
                />
                <Hallmark
                  icon={Shield}
                  title="Quick Access"
                  description="Every ADMI interior provides full maintenance and equipment access behind all interior walls and under all flooring — designed in from the first drawing, not engineered around as an afterthought."
                />
                <Hallmark
                  icon={Layers}
                  title="Mission-Adaptable"
                  description="ADMI forms naturally around mission equipment — sensor racks, console stations, communication systems, medical equipment — rather than forcing equipment to fit around an interior designed for a different purpose."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION TYPES ── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                II · Mission Types
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                Interiors for every
                <br />
                <em className="display-serif-italic text-[var(--color-muted)]">
                  operational role.
                </em>
              </h2>
            </div>
            <p className="max-w-sm text-[14px] leading-relaxed text-[var(--color-muted)] md:text-right">
              Each mission type demands a different interior configuration.
              ADMI&rsquo;s modularity makes it the platform of choice across roles.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {missionTypes.map((mission, i) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12 lg:gap-16">
            {/* Header column */}
            <div className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                III · Services
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                Everything your
                <br />
                <em className="display-serif-italic text-[var(--color-muted)]">
                  mission needs.
                </em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.85] text-[var(--color-muted)]">
                Luminary provides a complete special mission interior service —
                from initial design consultation through certified manufacture,
                installation, and in-service support.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--color-hairline)] pt-8">
                <ServiceStat value="Part 21" label="Certified mfr" />
                <ServiceStat value="20+" label="Years expertise" />
                <ServiceStat value="ADMI™" label="Proprietary platform" />
                <ServiceStat value="Full" label="Lifecycle support" />
              </div>
            </div>

            {/* Services list */}
            <div className="md:col-span-7">
              <div className="divide-y divide-[var(--color-hairline)]">
                {services.map((service) => (
                  <ServiceRow key={service.label} service={service} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DARK CTA ── mesh-ink */}
      <section className="relative overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
              <span className="h-px w-8 bg-[var(--color-lime)]/50" />
              ADMI · Special Mission Interiors
              <span className="h-px w-8 bg-[var(--color-lime)]/50" />
            </span>

            <h2 className="display-serif-md mt-8 text-white">
              Discuss your mission
              <br />
              <em className="display-serif-italic text-[var(--color-lime)]">requirements.</em>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70">
              Every mission is different. Tell us about your aircraft, your role
              requirements, and your programme timeline — we&rsquo;ll prepare an ADMI
              brief that addresses your specific configuration, weight targets,
              and access requirements.
            </p>

            {/* Key points */}
            <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3 text-left">
              {[
                "Green completions",
                "Retrofit projects",
                "Design support",
                "Part 21 certified",
                "Installation teams",
                "Full documentation",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0 text-[var(--color-lime)]"
                    strokeWidth={2}
                  />
                  <span className="text-[13px] text-white/70">{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-lime)] px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:bg-white"
              >
                Discuss Your Mission
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
              </Link>
              <Link
                href="/cabin-comfort-systems"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-white/50 hover:bg-white/5"
              >
                Cabin Comfort Systems
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ── */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[var(--color-ivory)] px-5 py-7 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
        {label}
      </span>
      <span className="font-serif text-[22px] leading-none text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}

function Hallmark({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Zap;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 bg-[var(--color-ivory)] px-7 py-7">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime-bg)] text-[var(--color-lime)]">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
          {title}
        </div>
        <p className="mt-2 text-[13px] leading-[1.75] text-[var(--color-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function MissionCard({
  mission,
  index,
}: {
  mission: (typeof missionTypes)[number];
  index: number;
}) {
  const isLast = index === missionTypes.length - 1;
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white p-7 transition-all hover:border-[var(--color-lime)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.15)]",
        isLast && "sm:col-span-2 lg:col-span-1"
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
        {mission.abbr}
      </span>
      <h3 className="mt-3 font-serif text-[22px] leading-tight text-[var(--color-ink)]">
        {mission.title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[var(--color-muted)]">
        {mission.description}
      </p>
      <div className="mt-5 border-t border-[var(--color-hairline)] pt-4">
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-lime)]"
        >
          Discuss this mission type
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function ServiceRow({
  service,
}: {
  service: (typeof services)[number];
}) {
  return (
    <div className="group flex items-start gap-5 py-6">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime)]/10 text-[var(--color-lime)]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
      </span>
      <div className="flex-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
          {service.label}
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.7] text-[var(--color-muted)]">
          {service.desc}
        </p>
      </div>
    </div>
  );
}

function ServiceStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-[28px] leading-none text-[var(--color-ink)]">
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
        {label}
      </div>
    </div>
  );
}
