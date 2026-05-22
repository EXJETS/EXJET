import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  CheckCircle2,
  Layers,
  Lightbulb,
  PanelTop,
  Sparkles,
  Square,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "VIP Interiors",
  description:
    "Full-lifecycle VIP and corporate aircraft interior design, manufacturing, and installation. Cabinetry, seating, headliners, flooring, lighting, and green completions — crafted as a Part 21 manufacturer.",
  alternates: { canonical: "/vip-interiors" },
  openGraph: {
    title: "VIP Interiors · Luminary Air Group",
    description:
      "Complete interior design, manufacturing, and installation for VIP and corporate aircraft. Every detail perfected.",
    url: "https://luminary.aero/vip-interiors",
  },
};

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function VipInteriorsPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(181,180,0,0.07),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 sm:px-8 lg:pt-40 lg:pb-32">
          {/* Eyebrow */}
          <div className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-gold)]">VIP Interiors</span>
              <span className="text-white/50">
                Design · Manufacturing · Installation
              </span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-white">
              Every detail,{" "}
              <em className="display-serif-italic text-[var(--color-gold)]">
                perfected.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-white/50">
              Luminary Air Group delivers full-lifecycle VIP and corporate
              aircraft interiors — from concept and design through
              manufacturing, installation, and certification. Every surface,
              material, and system is engineered with precision and built to
              last.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-gold-soft)]"
            >
              Start your interior project
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              View performance history
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · Services
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                Every interior discipline,
                <br />
                <em className="display-serif-italic text-white/50">
                  under one roof.
                </em>
              </h2>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-white/50">
                From hand-crafted cabinetry to full green completions, our
                skilled team handles every element of your aircraft interior
                in-house — with the quality and documentation of a Part 21
                manufacturer.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={Layers}
              number="01"
              title="Cabinetry Design & Fabrication"
              description="Custom hardwood and composite cabinetry engineered to your specification. Every unit is designed for the exact airframe geometry, meeting weight budgets and airworthiness requirements without compromise."
              badge="Custom hardwood / composite"
            />
            <ServiceCard
              icon={Armchair}
              number="02"
              title="Seating & Divan Upholstery"
              description="Executive seating, club configurations, and divan builds using premium materials selected for durability, aesthetics, and compliance with airworthiness flammability standards."
              badge="Executive & divan"
            />
            <ServiceCard
              icon={PanelTop}
              number="03"
              title="Headliner & Sidewall Panels"
              description="Precision-fabricated headliner assemblies and sidewall panels in fabric, leather, or composite finishes. Seamlessly integrated with lighting, ventilation, and PSU systems."
              badge="Headliner · sidewall"
            />
            <ServiceCard
              icon={Square}
              number="04"
              title="Flooring Systems"
              description="Full-width flooring in carpet, hardwood, tile, or bespoke material combinations. Each installation is engineered for weight, acoustic properties, and long-term durability in the demanding cabin environment."
              badge="Carpet · hardwood · tile"
            />
            <ServiceCard
              icon={Lightbulb}
              number="05"
              title="Lighting Systems"
              description="Integrated LED lighting design and installation — ambient, task, and mood lighting architectures that enhance the passenger experience while meeting certification requirements."
              badge="LED ambient & task"
            />
            <ServiceCard
              icon={Sparkles}
              number="06"
              title="Green Aircraft Completions"
              description="Full interior delivery from a bare airframe. We manage every interior discipline — insulation, structure, panels, seating, cabinetry, and systems — as a single coordinated build, ensuring optimum acoustic and aesthetic performance from day one."
              badge="Bare airframe to complete"
            />
          </div>

          {/* Repairs callout */}
          <div className="mt-8 flex items-start gap-5 rounded-2xl border border-white/[0.07] bg-black p-7">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold-bg)] text-[var(--color-gold)]">
              <Wrench className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-white">
                Repairs & Modifications
              </h3>
              <p className="mt-2 text-[13px] leading-[1.75] text-white/50">
                Existing interior repairs, damage rectification, and
                modification work are handled with the same precision and
                documentation standards as new builds. From panel replacement
                to full refurbishment programs, we bring worn or damaged
                interiors back to as-new condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-black py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              II · Process
            </span>
            <h2 className="display-serif-md mt-5 text-white">
              From brief to{" "}
              <em className="display-serif-italic text-white/50">
                certified completion.
              </em>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/50">
              A disciplined four-stage process ensures every VIP interior
              project is delivered on time, on spec, and to the highest
              standard of certified quality.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--color-hairline)] sm:grid-cols-4">
            <ProcessStep
              number="01"
              title="Consultation & Design"
              description="We begin with a detailed brief — understanding your aircraft, objectives, aesthetic preferences, and operational requirements. A design package is produced before any material is specified."
            />
            <ProcessStep
              number="02"
              title="Material Sourcing"
              description="Premium materials selected against your design brief, weight budget, and airworthiness criteria. Every material is qualified for use in the aircraft environment before procurement."
            />
            <ProcessStep
              number="03"
              title="Fabrication"
              description="In-house fabrication as a Part 21 manufacturer. Every component is built to drawing, quality-inspected, and documented with full traceability before it reaches your aircraft."
            />
            <ProcessStep
              number="04"
              title="Installation & Certification"
              description="Expert installation by experienced technicians, followed by full certification documentation. Your maintenance records are updated and every modification is fully traceable."
            />
          </div>
        </div>
      </section>

      {/* ── QUALITY CALLOUT ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                III · Certified Quality
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                Built to the{" "}
                <em className="display-serif-italic text-[var(--color-gold)]">
                  highest standard.
                </em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.8] text-white/70">
                As a Part 21 manufacturer, every component Luminary produces
                carries full FAA certification traceability. Quality is not an
                aspiration — it is documented, inspected, and signed off at
                every stage of manufacture and installation.
              </p>
            </div>

            <div className="md:col-span-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <QualityPillar
                  title="Part 21 Manufacturer"
                  description="FAA-certified manufacturing authority covering every component we produce."
                />
                <QualityPillar
                  title="FAA Certified"
                  description="All installations are completed to current airworthiness standards with full documentation."
                />
                <QualityPillar
                  title="Every Component Documented"
                  description="Full traceability from raw material through fabrication to aircraft installation."
                />
                <QualityPillar
                  title="20+ Years Experience"
                  description="Two decades of aircraft interiors means we have encountered — and solved — every challenge."
                />
              </div>
            </div>
          </div>

          {/* Certification badge row */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-black/10 sm:grid-cols-4">
            <CertBadge value="Part 21" label="Manufacturer" />
            <CertBadge value="FAA" label="Certified" />
            <CertBadge value="Full" label="Documentation" />
            <CertBadge value="20+" label="Years experience" />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-black py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
            <span className="h-px w-8 bg-[var(--color-gold)]/60" />
            Ready to get started
            <span className="h-px w-8 bg-[var(--color-gold)]/60" />
          </span>
          <h2 className="display-serif-md mt-8 text-white">
            Start your
            <br />
            <em className="display-serif-italic text-white/50">
              interior project.
            </em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
            Tell us about your aircraft, your vision, and your timeline.
            We&rsquo;ll design a VIP interior that meets your objectives —
            and deliver it with the certified quality your aircraft deserves.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-gold-soft)]"
            >
              Get in touch
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              About Luminary
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function ServiceCard({
  icon: Icon,
  number,
  title,
  description,
  badge,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  number: string;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-black p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.2)]">
      <div className="flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold-bg)] text-[var(--color-gold)]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
          {number}
        </span>
      </div>

      <h3 className="mt-6 font-serif text-[24px] leading-tight text-white">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-white/50">
        {description}
      </p>

      <div className="mt-6 border-t border-white/[0.07] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
          {badge}
        </span>
      </div>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col bg-[#0d0d0d] px-7 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {number}
      </span>
      <h3 className="mt-4 font-serif text-[22px] leading-tight text-white">
        {title}
      </h3>
      <p className="mt-3 text-[13px] leading-[1.75] text-white/50">
        {description}
      </p>
    </div>
  );
}

function QualityPillar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/5 p-5">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
      </span>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">
          {title}
        </div>
        <div className="mt-1.5 text-[12px] leading-relaxed text-white/60">
          {description}
        </div>
      </div>
    </div>
  );
}

function CertBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-black/5 px-5 py-7 text-center">
      <span className="font-serif text-[28px] leading-none text-[var(--color-gold)]">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
        {label}
      </span>
    </div>
  );
}
