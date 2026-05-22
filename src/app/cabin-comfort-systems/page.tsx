import type { Metadata } from "next";
import Link from "next/link";
import {
  Mic2,
  Weight,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import insulationProducts from "@/data/insulation-products.json";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cabin Comfort Systems — Luminary Air Group",
  description:
    "Custom aircraft acoustic insulation kits engineered to each aircraft's unique noise signature. 50–70% noise reduction. World Record: 46.7 dB SIL BBJ cabin. Part 21 manufacturer.",
};

export default function CabinComfortSystemsPage() {
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
              <span className="text-[var(--color-gold)]">Cabin Comfort Systems</span>
              <span className="text-white/50">Acoustic Engineering</span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-white">
              The science
              <br />
              <em className="display-serif-italic" style={{ color: "var(--color-gold)" }}>
                of silence.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-white/50">
              Custom noise-reduction kits tailored to every aircraft&rsquo;s unique
              acoustic signature — using precision imaging, advanced materials, and
              certified manufacturing to deliver measurably quieter cabins from
              single-engine pistons to wide-body jets.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-gold-soft)]"
            >
              Request a Consultation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              View Performance History
            </Link>
          </div>

          {/* KPI band */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--color-hairline)] sm:grid-cols-4">
            <HeroStat label="Noise Reduction" value="50–70%" />
            <HeroStat label="World Record" value="46.7 dB SIL" />
            <HeroStat label="Certification" value="Part 21 Mfr" />
            <HeroStat label="Aircraft Range" value="Piston → Wide-Body" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative border-t border-white/[0.07] bg-black py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · How It Works
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                Four steps to a
                <br />
                <em className="display-serif-italic text-white/50">quieter cabin.</em>
              </h2>
            </div>
            <p className="max-w-md text-[14px] leading-relaxed text-white/50 md:text-right">
              Every CCS project begins with measurement and ends with a certified,
              installed system proven on your specific airframe.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-[var(--color-hairline)] sm:grid-cols-2 lg:grid-cols-4">
            <ProcessStep
              number="01"
              title="Acoustic Imaging"
              description="We deploy precision instrumentation to create a full acoustic map of your aircraft — identifying every noise source, frequency, and structural transmission path before any material is selected."
            />
            <ProcessStep
              number="02"
              title="Material Selection"
              description="Based on your aircraft's specific noise profile, we engineer a multi-layer insulation system using damping compounds, absorption barriers, muffler materials, and ECS treatment — optimised for weight and performance."
            />
            <ProcessStep
              number="03"
              title="Custom Fabrication"
              description="Every kit is purpose-built to your airframe's geometry as a Part 21 manufacturer. No off-the-shelf compromises — each component is certified, quality-controlled, and cut to exact tolerances."
            />
            <ProcessStep
              number="04"
              title="Expert Installation"
              description="Experienced technicians install your kit with minimum aircraft downtime, full documentation for your maintenance records, and a post-installation measurement to verify the acoustic result."
            />
          </div>
        </div>
      </section>

      {/* ── WHY IT WORKS ── */}
      <section className="relative border-t border-white/[0.07] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              II · Why It Works
            </span>
            <h2 className="display-serif-md mx-auto mt-5 text-white">
              Engineering that
              <br />
              <em className="display-serif-italic text-white/50">earns its results.</em>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureBlock
              icon={Mic2}
              title="Acoustic Imaging"
              description="No other insulation provider uses full acoustic imaging as standard. We map every frequency and source before we design a single component — so the solution targets the actual problem, not a generic noise floor."
              stat="Source-accurate targeting"
            />
            <FeatureBlock
              icon={Weight}
              title="Minimal Weight"
              description="Luminary's lightweight material science keeps added weight negligible across all aircraft classes. Our kits are engineered to deliver maximum acoustic performance with the smallest possible weight penalty."
              stat="Weight-optimised materials"
            />
            <FeatureBlock
              icon={ShieldCheck}
              title="Certified Quality"
              description="As a Part 21 manufacturer, every Luminary kit is designed, fabricated, and delivered under a certified quality system. Full documentation, traceability, and regulatory compliance are built in — not bolted on."
              stat="Part 21 manufacturer"
            />
          </div>
        </div>
      </section>

      {/* ── PRODUCTS GRID ── */}
      <section className="relative border-t border-white/[0.07] bg-black py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                III · Aircraft Coverage
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                From piston to
                <br />
                <em className="display-serif-italic text-white/50">wide-body.</em>
              </h2>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-white/50">
                CCS kits are available for a wide range of business and
                mission aircraft — each one engineered from an acoustic survey
                of that specific airframe, not adapted from a generic template.
              </p>
            </div>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-white transition-colors hover:text-[var(--color-gold)] md:self-end"
            >
              Request a kit for your aircraft
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {insulationProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WORLD RECORD CALLOUT ── dark ink mesh-ink */}
      <section className="relative overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl">
            {/* Eyebrow */}
            <div className="flex justify-center">
              <span className="chapter-rule" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span className="text-[var(--color-gold)]">World Record</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Boeing Business Jet</span>
              </span>
            </div>

            {/* Big number */}
            <div className="mt-12 text-center">
              <div className="font-serif text-[clamp(5rem,15vw,11rem)] leading-none text-[var(--color-gold)]">
                46.7
              </div>
              <div className="mt-2 font-mono text-[13px] uppercase tracking-[0.3em] text-white/60">
                dB Sound Intensity Level — BBJ Cabin
              </div>
            </div>

            {/* Body */}
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="display-serif-md text-white">
                  The quietest BBJ
                  <br />
                  <em className="display-serif-italic text-[var(--color-gold)]">
                    ever independently measured.
                  </em>
                </h2>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[15px] leading-[1.85] text-white/70">
                  Luminary&rsquo;s world-record Boeing Business Jet installation set a new
                  benchmark for cabin acoustic refinement in business aviation. Achieved
                  through our full acoustic imaging process, custom multi-layer
                  insulation engineering, and expert installation — the result is
                  independently verified and unmatched.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                  <RecordStat value="46.7 dB" label="SIL measured" />
                  <RecordStat value="50–70%" label="Typical reduction" />
                  <RecordStat value="Part 21" label="Certified build" />
                </div>
              </div>
            </div>

            {/* Hallmarks */}
            <div className="mt-12 grid gap-4 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Full acoustic imaging survey",
                "Custom multi-layer insulation",
                "Independently verified result",
                "Replicated across the BBJ fleet",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
                    <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-[13px] leading-relaxed text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t border-white/[0.07] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
            <span className="h-px w-8 bg-[var(--color-gold)]/60" />
            Get Started
            <span className="h-px w-8 bg-[var(--color-gold)]/60" />
          </span>
          <h2 className="display-serif-md mt-8 text-white">
            Request an acoustic
            <br />
            <em className="display-serif-italic text-white/50">consultation.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
            Tell us your aircraft type and noise objectives — we&rsquo;ll design a
            CCS solution with a projected acoustic result, weight impact, and
            programme timeline before any commitment is required.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-gold-soft)]"
            >
              Start a Consultation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              Performance History
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ── */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[#0d0d0d] px-5 py-7 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {label}
      </span>
      <span className="font-serif text-[22px] leading-none text-white">
        {value}
      </span>
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
      <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-white/50">
        {description}
      </p>
    </div>
  );
}

function FeatureBlock({
  icon: Icon,
  title,
  description,
  stat,
}: {
  icon: typeof Mic2;
  title: string;
  description: string;
  stat: string;
}) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-black p-8">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-gold-bg)] text-[var(--color-gold)]">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h3 className="mt-6 font-serif text-[24px] leading-tight text-white">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-white/50">
        {description}
      </p>
      <div className="mt-6 border-t border-white/[0.07] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
          {stat}
        </span>
      </div>
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: (typeof insulationProducts)[number];
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-6 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.15)]">
      {/* Category + result */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
          {product.category}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-black px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">
          <Zap className="h-2.5 w-2.5 text-[var(--color-gold)]" strokeWidth={2.5} />
          {product.typicalResult}
        </span>
      </div>

      {/* Aircraft name */}
      <h3 className="mt-4 font-serif text-[20px] leading-tight text-white">
        {product.aircraft}
      </h3>

      {/* Description */}
      <p className="mt-3 flex-1 text-[12px] leading-[1.75] text-white/50 line-clamp-4">
        {product.description}
      </p>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
          {product.weight}
        </span>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-white transition-colors hover:text-[var(--color-gold)]"
        >
          Enquire
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function RecordStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <div className="font-serif text-[28px] leading-none text-[var(--color-gold)]">
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
        {label}
      </div>
    </div>
  );
}
