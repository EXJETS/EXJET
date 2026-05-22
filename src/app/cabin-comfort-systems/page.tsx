"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  Settings2,
  Layers,
  BadgeCheck,
  Target,
  Factory,
  FileCheck2,
  ArrowRight,
  ChevronRight,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import insulationProducts from "@/data/insulation-products.json";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

const CATEGORIES = ["All", "Turboprop", "Light Jet", "Midsize Jet", "Large Cabin", "Wide Body"] as const;
type Category = (typeof CATEGORIES)[number];

const steps = [
  {
    number: "01",
    icon: Activity,
    title: "Acoustic Survey",
    description:
      "Calibrated acoustic imaging equipment maps every noise source, frequency band, and structural transmission path across the airframe. No material is specified until the full acoustic signature is understood.",
  },
  {
    number: "02",
    icon: Settings2,
    title: "Custom Engineering",
    description:
      "Airframe-specific insulation systems are engineered from the survey data — multi-layer construction targeting dominant frequency bands, with each layer selected for mass, absorption, and decoupling performance.",
  },
  {
    number: "03",
    icon: Layers,
    title: "In-House Fabrication",
    description:
      "Every blanket kit is manufactured in-house under our Part 21 approval, cut to exact airframe tolerances. No subcontractors. Full traceability from raw material through to finished certified assembly.",
  },
  {
    number: "04",
    icon: BadgeCheck,
    title: "Certified Installation",
    description:
      "Installation against our STC data package at your preferred MRO or Luminary facility. Post-installation acoustic measurement documents the achieved result — delivered as Part 21 certified data.",
  },
];

const whyCards = [
  {
    icon: Target,
    title: "Airframe-Specific Engineering",
    description:
      "Every insulation system is engineered around the specific resonance signatures, structural transmission paths, and noise sources of your aircraft type — not a generic solution adapted from another platform.",
  },
  {
    icon: Factory,
    title: "In-House Manufacturing",
    description:
      "Design, fabrication, and quality control under one roof. In-house manufacturing ensures direct configuration control, faster turnaround, and full traceability without reliance on third-party suppliers.",
  },
  {
    icon: FileCheck2,
    title: "Part 21 Certified Data",
    description:
      "As an FAA Part 21 manufacturer operating under AS9100D and ISO 9001, every kit ships with a complete certified data package — STC compliance documentation, installation instructions, and measured performance records.",
  },
];

export default function CabinComfortSystemsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? insulationProducts
      : insulationProducts.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-50" />
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 lg:pt-48 lg:pb-36">
          <Section className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule mb-8">
              Cabin Comfort Systems · Acoustic Engineering
            </motion.span>
            <motion.h1 variants={fadeUp} className="display-serif max-w-5xl text-[#111111]">
              Precision Acoustic Engineering
              <br />
              <em className="display-serif-italic text-[#888888]">for Business Aviation.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              Luminary designs and manufactures custom acoustic insulation blanket kits for every major business jet
              platform — engineered to your airframe&apos;s specific noise signature, certified under our FAA Part 21
              approval, and delivering independently measured noise reductions of 50–70% across the cabin.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
              >
                Request a Quote
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="#product-catalog"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                View Product Catalog
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>

            {/* KPI strip */}
            <motion.div
              variants={fadeUp}
              className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.08] sm:grid-cols-4"
            >
              {[
                { value: "50–70%", label: "Noise Reduction" },
                { value: "46.7 dB", label: "World Record SIL" },
                { value: "Part 21", label: "Manufacturer" },
                { value: "8 Platforms", label: "STC Coverage" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2 bg-white px-8 py-6">
                  <span className="font-serif text-[36px] leading-none text-[#111111]">{s.value}</span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#f8f8f6] border-y border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.span variants={fadeUp} className="chapter-rule">
                Process · Four Phases
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 max-w-2xl text-[#111111]">
                A Systematic Approach to
                <br />
                <em className="display-serif-italic text-[#888888]">Acoustic Attenuation.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Every Cabin Comfort Systems engagement follows the same four-phase methodology — survey, engineer,
                fabricate, install — with documented acoustic data at each stage.
              </motion.p>
            </div>

            <motion.div
              variants={stagger}
              className="grid gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.06] sm:grid-cols-2 lg:grid-cols-4"
            >
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    variants={fadeUp}
                    className="flex flex-col bg-white px-7 py-9"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                        <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                      </div>
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#111111]">
                      {step.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[13px] leading-[1.8] text-[#555555]">{step.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PRODUCT CATALOG ── */}
      <section id="product-catalog" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <motion.span variants={fadeUp} className="chapter-rule">
                  Product Catalog · Insulation Systems
                </motion.span>
                <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                  Insulation Systems
                  <br />
                  <em className="display-serif-italic text-[#888888]">by Platform.</em>
                </motion.h2>
              </div>
              <motion.div variants={fadeUp} className="shrink-0">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3"
                >
                  Request a custom platform
                  <ChevronRight className="h-3 w-3" strokeWidth={2} />
                </Link>
              </motion.div>
            </div>

            {/* Category filter pills */}
            <motion.div variants={fadeUp} className="mb-8 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all",
                    activeCategory === cat
                      ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.07)] text-[var(--color-gold)]"
                      : "border-black/[0.10] bg-white text-[#888888] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Product cards */}
            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  layout
                  className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_20px_40px_-12px_rgba(201,168,76,0.12)]"
                >
                  {/* Category badge */}
                  <div className="mb-5 inline-block self-start rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)] px-3 py-1">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                      {product.category}
                    </span>
                  </div>

                  {/* Aircraft name */}
                  <h3 className="display-serif-sm text-[#111111]">{product.aircraft}</h3>

                  {/* Specs rows */}
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-black/[0.05] pb-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">Typical Result</span>
                      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#111111]">
                        {product.typicalResult}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-black/[0.05] pb-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">Added Weight</span>
                      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#111111]">
                        {product.weight}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 flex-1 text-[12px] leading-[1.8] text-[#555555] line-clamp-4">
                    {product.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-black/[0.06]">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-2.5"
                    >
                      Request Data Sheet
                      <ChevronRight className="h-3 w-3" strokeWidth={2} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── WORLD RECORD DARK SECTION ── */}
      <section className="relative overflow-hidden bg-[#111111]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,168,76,0.1),transparent_65%)]" />
        <div className="relative mx-auto max-w-5xl px-5 py-28 sm:px-8 lg:py-36 text-center">
          <Section>
            <motion.span variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              World Record · Boeing Business Jet
            </motion.span>
            <motion.div
              variants={fadeUp}
              className="display-serif mt-4 text-[var(--color-gold)]"
            >
              46.7 dB SIL
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 mx-auto max-w-2xl text-[16px] leading-[1.85] text-white/70">
              World&apos;s Quietest Boeing Business Jet — independently measured and verified. Achieved through precision
              acoustic imaging of the 737 fuselage, a custom multi-layer insulation system, and Part 21 certified
              installation. The definitive benchmark for acoustic performance in wide-body business aviation.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Link
                href="/performance-history"
                className="inline-flex items-center gap-2.5 rounded-full border border-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)] hover:text-black"
              >
                View Performance History
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── WHY LUMINARY ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.span variants={fadeUp} className="chapter-rule">
                Our Differentiation
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                Why Luminary
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Three structural advantages that separate Luminary from general MRO suppliers and generic
                acoustic aftermarket products.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid gap-6 sm:grid-cols-3">
              {whyCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    variants={fadeUp}
                    className="rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_16px_48px_-12px_rgba(201,168,76,0.12)]"
                  >
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">{card.title}</h3>
                    <p className="mt-4 text-[13px] leading-[1.8] text-[#555555]">{card.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="bg-[#111111]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule mb-2" style={{ color: "var(--color-gold)" }}>
              Commission Your System
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-white">
              Specify Your Aircraft.
              <br />
              <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                We&apos;ll Engineer the Solution.
              </em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
              Provide your aircraft type, operational noise objectives, and weight constraints. Luminary
              will respond with a scoped proposal, projected acoustic result, and programme timeline.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Request a Quote
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about/downloads"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition-all hover:border-white/40 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                Download STC List
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
