"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Mic2,
  Layers,
  ShieldCheck,
  Wrench,
  FileCheck,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";

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

const projects = [
  {
    aircraft: "Boeing Business Jet",
    type: "BBJ · Wide Body",
    result: "46.7 dB SIL",
    badge: "World Record",
    headline: "World's Quietest BBJ Completion",
    description: "Full acoustic insulation system for a privately operated Boeing Business Jet. By precision-imaging the airframe and engineering a multi-layer custom insulation kit targeting the specific resonance signatures of the 737 fuselage, Luminary achieved a cabin Sound Intensity Level of 46.7 dB SIL — the quietest ever recorded for the type.",
    highlights: [
      "46.7 dB SIL — Guinness-class result",
      "Custom multi-layer blanket system",
      "Precision acoustic imaging of fuselage",
      "No useful-load penalty",
    ],
    year: "2018",
  },
  {
    aircraft: "Bombardier Challenger 604",
    type: "Large Cabin Jet",
    result: "57.1 dB SIL",
    badge: "Green Completion",
    headline: "Quiet-First Green Completion",
    description: "Acoustic performance was made the primary cabin design input from day one on this green (bare fuselage) Challenger 604. Integrating acoustic engineering into the initial completion rather than retrofitting, Luminary achieved a final cabin noise level significantly below the production average — demonstrating the advantage of noise control as a first-principle design decision.",
    highlights: [
      "57.1 dB SIL — below production avg.",
      "Acoustic-first design methodology",
      "Green aircraft — turnkey completion",
      "FAA Part 21 certification",
    ],
    year: "2020",
  },
];

const capabilities = [
  {
    icon: Mic2,
    title: "Acoustic Engineering",
    description: "Full-spectrum acoustic analysis using calibrated imaging equipment. We identify every ingress point and engineer a solution before fabrication begins.",
  },
  {
    icon: Layers,
    title: "Insulation Manufacturing",
    description: "In-house production of bespoke acoustic insulation blanket systems — multi-layer, aircraft-specific, and built to our Part 21 approval.",
  },
  {
    icon: Wrench,
    title: "Completion Integration",
    description: "Acoustic systems designed to integrate seamlessly with interior completions — no rework, no weight penalty, no schedule impact.",
  },
  {
    icon: ShieldCheck,
    title: "Part 21 Certification",
    description: "Every acoustic system and interior modification is certified under our FAA Part 21 manufacturer approval. We hold the data — you don't need a separate DER.",
  },
  {
    icon: FileCheck,
    title: "STC Support",
    description: "Over 100 Supplemental Type Certificates covering acoustic insulation installations across all major business jet platforms.",
  },
  {
    icon: Zap,
    title: "Performance Guarantee",
    description: "We publish our acoustic results. Every VIP project is measured and documented — you see the number before and after installation.",
  },
];

const process = [
  {
    step: "01",
    title: "Acoustic Survey",
    description: "We conduct a full acoustic analysis of your airframe — mapping noise ingress points, resonance signatures, and transmission paths specific to your aircraft type.",
  },
  {
    step: "02",
    title: "Custom Engineering",
    description: "Our engineering team designs a bespoke insulation system targeting your specific noise profile. Multi-layer, multi-material, and precision-fitted to your fuselage.",
  },
  {
    step: "03",
    title: "In-House Fabrication",
    description: "Every blanket kit is manufactured in-house under our Part 21 approval. No subcontractors. Full quality control from raw material to finished assembly.",
  },
  {
    step: "04",
    title: "Certified Installation",
    description: "Installation at your preferred MRO or our facility, certified against our STC data. Post-installation acoustic measurement confirms your result in writing.",
  },
];

export default function VipInteriorsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-40" />
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 lg:pt-48 lg:pb-36">
          <Section className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule mb-8">
              VIP Interiors · Acoustic-First Completions
            </motion.span>
            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              The Quietest Cabin
              <br />
              <em className="display-serif-italic text-[#888888]">Is the Finest Cabin.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              VIP cabin excellence begins with acoustic engineering. Luminary builds
              bespoke insulation systems that set measurable noise records — certified under our
              FAA Part 21 approval and backed by published performance data.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
              >
                Start a Project
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/performance-history"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                View Performance Data
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="bg-[#f8f8f6] border-y border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.blockquote variants={fadeUp} className="font-serif text-[24px] leading-[1.55] text-[#111111] max-w-3xl sm:text-[30px]">
              &ldquo;Acoustic performance is not a finishing touch. For a truly exceptional
              VIP cabin, it must be the first engineering input — before the seats, before
              the finishes, before anything else.&rdquo;
            </motion.blockquote>
            <motion.p variants={fadeUp} className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#aaaaaa]">
              Luminary Air Group · VIP Acoustic Design Philosophy
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Section>
          <motion.span variants={fadeUp} className="chapter-rule">
            Project Record
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-6 max-w-2xl text-[#111111]">
            Results That Define
            <br />
            <em className="display-serif-italic text-[#888888]">the Benchmark.</em>
          </motion.h2>

          <motion.div variants={stagger} className="mt-16 space-y-6">
            {projects.map((project) => (
              <motion.div
                key={project.aircraft}
                variants={fadeUp}
                className="group grid gap-8 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_20px_60px_-12px_rgba(201,168,76,0.1)] lg:grid-cols-[1fr_2fr]"
              >
                {/* Left — identity + result */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="mb-3 flex gap-2">
                      <span className="inline-block rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                        {project.badge}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{project.type}</p>
                    <h3 className="mt-2 font-serif text-[30px] leading-[1.1] text-[#111111] sm:text-[36px]">{project.aircraft}</h3>
                    <p className="mt-2 font-serif text-[18px] italic text-[#888888]">{project.headline}</p>
                    <div className="mt-5 font-serif text-[48px] leading-none text-[#111111]">{project.result}</div>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#aaaaaa]">Cabin Sound Intensity Level</p>
                  </div>
                  <div className="mt-6 border-t border-black/[0.06] pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">Completed {project.year}</span>
                  </div>
                </div>

                {/* Right — description + highlights */}
                <div className="flex flex-col justify-center">
                  <p className="text-[15px] leading-[1.85] text-[#555555]">{project.description}</p>
                  <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                        <span className="text-[13px] text-[#555555]">{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      href="/performance-history"
                      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3"
                    >
                      Full performance record
                      <ChevronRight className="h-3 w-3" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <Section>
            <div className="flex flex-col items-center text-center">
              <motion.span variants={fadeUp} className="chapter-rule">
                Our Capabilities
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                Engineering to Installation,
                <br />
                <em className="display-serif-italic text-[#888888]">In-House.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Every discipline required to deliver a certified VIP acoustic completion lives under our roof —
                from acoustic survey to Part 21 installation sign-off.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    variants={fadeUp}
                    className="rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)]"
                  >
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">{cap.title}</h3>
                    <p className="mt-3 text-[13px] leading-[1.8] text-[#555555]">{cap.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Section>
          <div className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule">
              How We Work
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
              Four Steps to
              <br />
              <em className="display-serif-italic text-[#888888]">a Quieter Cabin.</em>
            </motion.h2>
          </div>

          <motion.div variants={stagger} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <motion.div key={p.step} variants={fadeUp} className="relative">
                {i < process.length - 1 && (
                  <div className="absolute top-6 left-[calc(100%+12px)] hidden h-[1px] w-[calc(100%-24px)] bg-black/[0.06] lg:block" />
                )}
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)]">
                  <span className="font-mono text-[12px] font-medium text-[var(--color-gold)]">{p.step}</span>
                </div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">{p.title}</h3>
                <p className="mt-3 text-[13px] leading-[1.8] text-[#555555]">{p.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── AIRCRAFT COVERAGE ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section>
            <div className="flex flex-col items-center text-center mb-10">
              <motion.span variants={fadeUp} className="chapter-rule">
                Approved Platforms
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-sm mt-5 text-[#111111]">
                VIP Coverage Across All Major Airframes
              </motion.h2>
            </div>
            <motion.div variants={stagger} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { a: "Boeing BBJ", b: "Wide Body" },
                { a: "Gulfstream G550", b: "Large Cabin" },
                { a: "Challenger 604", b: "Large Cabin" },
                { a: "Challenger 300", b: "Large Cabin" },
                { a: "Citation XLS+", b: "Midsize Jet" },
                { a: "Phenom 300", b: "Light Jet" },
                { a: "King Air 350", b: "Turboprop" },
                { a: "Pilatus PC-12", b: "Turboprop" },
              ].map((item) => (
                <motion.div
                  key={item.a}
                  variants={fadeUp}
                  className="flex flex-col items-center rounded-xl border border-black/[0.08] bg-white px-3 py-4 text-center"
                >
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#222222]">{item.a}</span>
                  <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#aaaaaa]">{item.b}</span>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111111]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-6 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[var(--color-gold)] text-[var(--color-gold)]" strokeWidth={0} />
              ))}
            </motion.div>
            <motion.span variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Request a Consultation
            </motion.span>
            <motion.h2 variants={fadeUp} className="mt-5 font-serif text-[40px] leading-[1.1] text-white sm:text-[52px]">
              Your Aircraft.
              <br />
              <em className="font-normal italic text-white/40">Measurably Quieter.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
              Tell us your aircraft type and your target noise floor.
              We&apos;ll respond within one business day with a scope and a confidence level.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Get a Proposal
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/performance-history"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition-all hover:border-white/40 hover:text-white"
              >
                Performance Record
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
