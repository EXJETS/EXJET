"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Mic2,
  Search,
  Zap,
  Wrench,
  Weight,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import insulationProducts from "@/data/insulation-products.json";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const CATEGORIES = ["All", "Turboprop", "Light Jet", "Midsize Jet", "Large Cabin", "Wide Body"] as const;
type Category = (typeof CATEGORIES)[number];

export default function CabinComfortSystemsPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });

  const productsRef = useRef(null);
  const productsInView = useInView(productsRef, { once: true, margin: "-80px" });

  const whyRef = useRef(null);
  const whyInView = useInView(whyRef, { once: true, margin: "-80px" });

  const recordRef = useRef(null);
  const recordInView = useInView(recordRef, { once: true, margin: "-80px" });

  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered = activeCategory === "All"
    ? insulationProducts
    : insulationProducts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]" aria-hidden />
        <motion.div
          ref={heroRef}
          variants={stagger}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36"
        >
          <motion.div variants={fadeUp} className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[#c9a84c]">Cabin Comfort Systems</span>
              <span className="text-[#888888]">Acoustic Engineering</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              The science
              <br />
              <em className="display-serif-italic text-[#c9a84c]">of silence.</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Custom noise-reduction kits tailored to every aircraft&rsquo;s unique
              acoustic signature — using precision imaging, advanced materials, and
              certified manufacturing to deliver measurably quieter cabins from
              single-engine turboprops to wide-body jets.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Get a Quote
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/cabin-comfort-systems/insulation-products"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[#111111] transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              View Products
            </Link>
          </motion.div>

          {/* KPI band */}
          <motion.div
            variants={fadeUp}
            className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.04] sm:grid-cols-4"
          >
            {[
              { label: "Noise Reduction", value: "50–70%" },
              { label: "World Record", value: "46.7 dB SIL" },
              { label: "Certification", value: "Part 21 Mfr" },
              { label: "Aircraft Range", value: "Piston → Wide-Body" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 bg-white px-5 py-7 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                  {s.label}
                </span>
                <span className="font-serif text-[22px] leading-none text-[#111111]">
                  {s.value}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06]">
        <motion.div
          ref={stepsRef}
          variants={stagger}
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                I · How It Works
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                Four steps to a
                <br />
                <em className="display-serif-italic text-[#555555]">quieter cabin.</em>
              </h2>
            </div>
            <p className="max-w-md text-[14px] leading-relaxed text-[#555555] md:text-right">
              Every CCS project begins with measurement and ends with a certified,
              installed system proven on your specific airframe.
            </p>
          </motion.div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.04] sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                icon: Mic2,
                title: "Acoustic Imaging",
                description:
                  "We deploy precision instrumentation to create a full acoustic map of your aircraft — identifying every noise source, frequency, and structural transmission path before any material is selected.",
              },
              {
                number: "02",
                icon: Search,
                title: "Analysis & Design",
                description:
                  "Based on your aircraft's specific noise profile, we engineer a multi-layer insulation system using damping compounds, absorption barriers, and ECS treatment — optimised for weight and performance.",
              },
              {
                number: "03",
                icon: Zap,
                title: "Custom Fabrication",
                description:
                  "Every kit is purpose-built to your airframe's geometry as a Part 21 manufacturer. No off-the-shelf compromises — each component is certified, quality-controlled, and cut to exact tolerances.",
              },
              {
                number: "04",
                icon: Wrench,
                title: "Expert Installation",
                description:
                  "Experienced technicians install your kit with minimum aircraft downtime, full documentation for your maintenance records, and a post-installation measurement to verify the acoustic result.",
              },
            ].map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="flex flex-col bg-white px-7 py-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                    <step.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-serif text-[22px] leading-tight text-[#111111]">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[#555555]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── PRODUCT GRID ── */}
      <section className="relative bg-white py-24 border-t border-black/[0.06]">
        <motion.div
          ref={productsRef}
          variants={stagger}
          initial="hidden"
          animate={productsInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                II · Aircraft Coverage
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                From turboprop to
                <br />
                <em className="display-serif-italic text-[#555555]">wide-body.</em>
              </h2>
            </div>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-[#111111] transition-colors hover:text-[#c9a84c] md:self-end"
            >
              Request a kit for your aircraft
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
            </Link>
          </motion.div>

          {/* Filter pills */}
          <motion.div variants={fadeUp} className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all",
                  activeCategory === cat
                    ? "border-[#c9a84c] bg-[rgba(201,168,76,0.07)] text-[#c9a84c]"
                    : "border-black/[0.10] bg-white text-[#888888] hover:border-[#c9a84c] hover:text-[#c9a84c]"
                )}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeUp}
                layout
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-6 transition-all hover:border-[#c9a84c] hover:shadow-[0_20px_40px_-12px_rgba(201,168,76,0.12)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#c9a84c]">
                    {product.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-[#f8f8f6] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#555555]">
                    <Zap className="h-2.5 w-2.5 text-[#c9a84c]" strokeWidth={2.5} />
                    {product.typicalResult}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-[20px] leading-tight text-[#111111]">
                  {product.aircraft}
                </h3>
                <p className="mt-3 flex-1 text-[12px] leading-[1.75] text-[#555555] line-clamp-4">
                  {product.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                    {product.weight}
                  </span>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#111111] transition-colors hover:text-[#c9a84c]"
                  >
                    Enquire
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── WORLD RECORD CALLOUT ── dark */}
      <motion.section
        ref={recordRef}
        variants={stagger}
        initial="hidden"
        animate={recordInView ? "visible" : "hidden"}
        className="relative overflow-hidden bg-[#111111] py-24 lg:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06),transparent_70%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <span className="chapter-rule">
              <span className="text-[#c9a84c]">World Record</span>
              <span className="text-white/40">Boeing Business Jet</span>
            </span>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="font-serif text-[clamp(5rem,16vw,11rem)] leading-none text-[#c9a84c]"
          >
            46.7
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-3 font-mono text-[13px] uppercase tracking-[0.3em] text-white/60"
          >
            dB Sound Intensity Level · BBJ Cabin
          </motion.div>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            World Record —{" "}
            <em className="display-serif-italic text-[#c9a84c]">
              quietest Boeing Business Jet cabin ever measured.
            </em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-[15px] leading-[1.85] text-white/70"
          >
            Achieved through our full acoustic imaging process, custom multi-layer
            insulation engineering, and expert installation. The result is independently
            verified and unmatched in business aviation.
          </motion.p>

          <motion.div
            variants={stagger}
            className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/10 pt-10"
          >
            {[
              { value: "46.7 dB", label: "SIL measured" },
              { value: "50–70%", label: "Typical reduction" },
              { value: "Part 21", label: "Certified build" },
              { value: "Verified", label: "Independent result" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <div className="font-serif text-[26px] leading-none text-[#c9a84c]">{s.value}</div>
                <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-8"
          >
            {[
              "Full acoustic imaging survey",
              "Custom multi-layer insulation",
              "Independently verified result",
              "Replicated across the BBJ fleet",
            ].map((item) => (
              <motion.div key={item} variants={fadeUp} className="flex items-start gap-2 text-left">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#c9a84c]" strokeWidth={2} />
                <span className="text-[12px] leading-relaxed text-white/60">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── WHY LUMINARY ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06]">
        <motion.div
          ref={whyRef}
          variants={stagger}
          initial="hidden"
          animate={whyInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mb-16 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
              III · Why Luminary
            </span>
            <h2 className="display-serif-md mx-auto mt-5 text-[#111111]">
              Engineering that
              <br />
              <em className="display-serif-italic text-[#555555]">earns its results.</em>
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Mic2,
                title: "Acoustic Imaging",
                description:
                  "No other insulation provider uses full acoustic imaging as standard. We map every frequency and source before we design a single component — so the solution targets the actual problem, not a generic noise floor.",
                stat: "Source-accurate targeting",
              },
              {
                icon: Weight,
                title: "Minimum Weight",
                description:
                  "Luminary's lightweight material science keeps added weight negligible across all aircraft classes. Our kits are engineered to deliver maximum acoustic performance with the smallest possible weight penalty.",
                stat: "Weight-optimised materials",
              },
              {
                icon: ShieldCheck,
                title: "Certified Quality",
                description:
                  "As a Part 21 manufacturer, every Luminary kit is designed, fabricated, and delivered under a certified quality system. Full documentation, traceability, and regulatory compliance are built in — not bolted on.",
                stat: "Part 21 manufacturer",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[#c9a84c] hover:shadow-[0_16px_32px_-8px_rgba(201,168,76,0.10)]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                  <f.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 font-serif text-[24px] leading-tight text-[#111111]">
                  {f.title}
                </h3>
                <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-[#555555]">
                  {f.description}
                </p>
                <div className="mt-6 border-t border-black/[0.06] pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]">
                    {f.stat}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-white py-24 border-t border-black/[0.06]">
        <motion.div
          ref={ctaRef}
          variants={stagger}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          className="mx-auto max-w-4xl px-5 text-center sm:px-8"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]"
          >
            <span className="h-px w-8 bg-[#c9a84c]/50" />
            Get Started
            <span className="h-px w-8 bg-[#c9a84c]/50" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-[#111111]">
            Request an acoustic
            <br />
            <em className="display-serif-italic text-[#555555]">consultation.</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-[#555555]"
          >
            Tell us your aircraft type and noise objectives — we&rsquo;ll design a
            CCS solution with a projected acoustic result, weight impact, and
            programme timeline before any commitment is required.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Start a Consultation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[#111111] transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              Performance History
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
