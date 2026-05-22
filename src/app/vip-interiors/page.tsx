"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  Layers,
  Settings,
  BadgeCheck,
  FileCheck2,
  BarChart3,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
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
    label: "BBJ · Wide Body",
    result: "46.7 dB SIL",
    badge: "World Record",
    year: "2018",
    description:
      "A privately operated Boeing Business Jet completed with a full bespoke acoustic insulation system, achieving a cabin Sound Intensity Level of 46.7 dB SIL — the quietest ever independently recorded for the type. Precision acoustic imaging of the 737 fuselage identified dominant structural transmission paths, enabling a multi-layer custom insulation system engineered to address each resonance signature. The result remains the definitive benchmark for what is acoustically achievable in a wide-body business jet cabin.",
    highlights: [
      "46.7 dB SIL — world's quietest BBJ cabin",
      "Full acoustic imaging of 737 fuselage structure",
      "Multi-layer bespoke insulation blanket system",
      "Independent third-party measurement and verification",
      "No useful-load penalty — minimal added weight",
      "Part 21 certified installation with full data package",
    ],
  },
  {
    aircraft: "Bombardier Challenger 604",
    label: "Challenger 604 · Large Cabin Jet",
    result: "57.1 dB SIL",
    badge: "Green Completion",
    year: "2020",
    description:
      "A green (bare fuselage) Challenger 604 completed from scratch for a private owner who specified acoustic performance as the primary cabin metric from the outset. By integrating the acoustic insulation engineering into the initial completion design sequence rather than retrofitting an existing interior, the team achieved a final cabin noise level significantly below the Challenger 604 production average. This project demonstrates the acoustic advantage available when noise attenuation is treated as a first-principle design input rather than an afterthought.",
    highlights: [
      "57.1 dB SIL — below production standard average",
      "Acoustic-first design methodology from green aircraft",
      "Turnkey completion — structure to cabin sign-off",
      "FAA Part 21 certification throughout",
      "STC data package for subsequent fleet application",
      "Reproducible result across Challenger 604 fleet",
    ],
  },
];

const capabilities = [
  {
    icon: Activity,
    title: "Acoustic Survey",
    description:
      "Full-spectrum acoustic imaging using calibrated instrumentation. Every ingress point, resonance frequency, and structural transmission path is mapped before any material or system is specified.",
  },
  {
    icon: Layers,
    title: "Insulation Engineering",
    description:
      "Airframe-specific multi-layer insulation system design targeting the dominant noise signatures of your aircraft type — engineered for measurable attenuation, not general-purpose noise reduction.",
  },
  {
    icon: Settings,
    title: "Completion Integration",
    description:
      "Acoustic systems sequenced into the completion workflow from the outset — insulation installed before trim, ensuring no rework, no weight surprises, and no compromise on either acoustic or interior performance.",
  },
  {
    icon: BadgeCheck,
    title: "Part 21 Certification",
    description:
      "Every acoustic system and interior modification is designed and installed under our FAA Part 21 manufacturer approval. Luminary holds the approved data — clients receive a complete, certified documentation package.",
  },
  {
    icon: FileCheck2,
    title: "STC Management",
    description:
      "Over 100 active Supplemental Type Certificates covering acoustic insulation installations across all major business jet and turboprop platforms. Existing STCs reduce schedule risk and certification cost.",
  },
  {
    icon: BarChart3,
    title: "Performance Verification",
    description:
      "Post-installation acoustic measurement under controlled flight conditions documents the achieved cabin noise floor. Published data is independently verifiable and forms part of the certified data package.",
  },
];

const approvedPlatforms = [
  { aircraft: "Boeing BBJ", category: "Wide Body" },
  { aircraft: "Gulfstream G550", category: "Large Cabin" },
  { aircraft: "Challenger 604", category: "Large Cabin" },
  { aircraft: "Challenger 300", category: "Large Cabin" },
  { aircraft: "Citation XLS+", category: "Midsize Jet" },
  { aircraft: "Phenom 300", category: "Light Jet" },
  { aircraft: "King Air 350", category: "Turboprop" },
  { aircraft: "Pilatus PC-12", category: "Turboprop" },
];

export default function VipInteriorsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-50" />
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 lg:pt-48 lg:pb-36">
          <Section className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule mb-8">
              VIP Completions · Acoustic-First
            </motion.span>
            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              Completions Where Silence
              <br />
              <em className="display-serif-italic text-[#888888]">Is the Specification.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              In Luminary VIP completions, acoustic engineering is the primary design input — not the final
              step. Insulation systems are sequenced before trim, before furnishings, before every interior
              decision. The result is a cabin defined by measurable quiet, not approximate comfort.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
              >
                Initiate a Project
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/performance-history"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                Performance Record
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="bg-[#f8f8f6] border-y border-black/[0.06]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.blockquote
              variants={fadeUp}
              className="font-serif text-[clamp(1.4rem,2.8vw,2.1rem)] leading-[1.5] text-[#111111]"
            >
              &ldquo;The finest VIP cabin is not merely beautiful — it is measurably quiet. Acoustic
              performance is our first engineering input, not our last.&rdquo;
            </motion.blockquote>
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
                Luminary Air Group · VIP Division
              </p>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DOCUMENTED RESULTS ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <motion.span variants={fadeUp} className="chapter-rule">
              Documented Results · Project Record
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-6 max-w-2xl text-[#111111]">
              The Numbers
              <br />
              <em className="display-serif-italic text-[#888888]">Define the Standard.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
              Luminary publishes acoustic results for every VIP project. Independent measurement. Part 21 certified
              data. Reproducible outcomes documented for client records.
            </motion.p>

            <motion.div variants={stagger} className="mt-16 space-y-6">
              {projects.map((project) => (
                <motion.div
                  key={project.aircraft}
                  variants={fadeUp}
                  className="group grid gap-8 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_20px_60px_-12px_rgba(201,168,76,0.1)] lg:grid-cols-[1fr_2fr]"
                >
                  {/* Left — identity and result */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="mb-4">
                        <span className="inline-block rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                          {project.badge}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{project.label}</p>
                      <h3 className="mt-2 display-serif-sm text-[#111111]">{project.aircraft}</h3>
                      <div className="mt-6 font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-none text-[#111111]">
                        {project.result}
                      </div>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                        Cabin Sound Intensity Level
                      </p>
                    </div>
                    <div className="mt-6 border-t border-black/[0.06] pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">
                        Completed {project.year}
                      </span>
                    </div>
                  </div>

                  {/* Right — description and highlights */}
                  <div className="flex flex-col justify-center">
                    <p className="text-[15px] leading-[1.85] text-[#555555]">{project.description}</p>
                    <ul className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {project.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                          <span className="text-[13px] leading-relaxed text-[#555555]">{h}</span>
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
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.span variants={fadeUp} className="chapter-rule">
                Capabilities · Full Scope
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                Engineering to Installation,
                <br />
                <em className="display-serif-italic text-[#888888]">In-House.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Every discipline required to deliver a certified VIP acoustic completion operates under our roof —
                from the initial acoustic survey through to Part 21 installation sign-off and performance verification.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    variants={fadeUp}
                    className="rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.1)]"
                  >
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">{cap.title}</h3>
                    <p className="mt-4 text-[13px] leading-[1.8] text-[#555555]">{cap.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── APPROVED PLATFORMS ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section>
            <div className="mb-12 flex flex-col items-center text-center">
              <motion.span variants={fadeUp} className="chapter-rule">
                Approved Platforms
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-sm mt-5 text-[#111111]">
                VIP Coverage Across All Major Airframes
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 max-w-lg text-[14px] leading-[1.8] text-[#555555]">
                Luminary holds approved data and active STCs across the full spectrum of business aviation — from
                single-engine turboprop to ultra-long-range wide-body.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {approvedPlatforms.map((item) => (
                <motion.div
                  key={item.aircraft}
                  variants={fadeUp}
                  className="flex flex-col items-center rounded-xl border border-black/[0.08] bg-[#f8f8f6] px-3 py-4 text-center transition-all hover:border-[var(--color-gold)]"
                >
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#222222]">
                    {item.aircraft}
                  </span>
                  <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#aaaaaa]">
                    {item.category}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="bg-[#111111]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Commission a VIP Completion
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-5 text-white">
              Your Aircraft.
              <br />
              <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                A Measurable Standard.
              </em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
              Specify your aircraft type and your target noise floor. Luminary will respond within one business
              day with a scoped proposal, projected dB SIL outcome, and programme timeline — before any commitment
              is required.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Initiate a Consultation
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
