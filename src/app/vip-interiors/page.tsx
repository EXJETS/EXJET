"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Armchair,
  Layers,
  Lightbulb,
  Palette,
  PanelTop,
  Shield,
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

const completedProjects = [
  {
    aircraft: "Boeing Business Jet",
    type: "BBJ / 737-800",
    headline: "Ultra-Long-Range Executive Suite",
    description: "Full green completion from bare fuselage. Master stateroom, private lounge, 8-seat dining, conference zone, and crew rest — with the world's lowest recorded BBJ cabin noise at 46.7 dB SIL.",
    highlights: ["46.7 dB SIL — world record", "Full green completion", "Custom bespoke cabinetry", "Gold & walnut finish package"],
    operator: "Private owner",
    year: "2018",
  },
  {
    aircraft: "Bombardier Challenger 604",
    type: "Large Cabin Jet",
    headline: "Quiet Cabin Green Completion",
    description: "Turnkey completion from green aircraft. Acoustic performance made a first-principle design input — achieving 57.1 dB SIL, significantly below the 604 production average. Bespoke leather seating and custom millwork throughout.",
    highlights: ["57.1 dB SIL result", "Below production average by 8 dB", "Bespoke leather & veneer", "Custom lighting system"],
    operator: "Private operator",
    year: "2020",
  },
  {
    aircraft: "Dassault Falcon 7X",
    type: "Ultra-Long-Range Trijet",
    headline: "Head-of-State Interior Refurbishment",
    description: "Full interior refurbishment of an existing aircraft for a government head-of-state operation. New acoustic insulation, bespoke seating in hand-stitched leather, custom stone-effect surfaces, and a redesigned forward galley.",
    highlights: ["Government head-of-state mission", "Full acoustic refit", "Hand-stitched leather throughout", "Redesigned galley & lavatory"],
    operator: "Government operator",
    year: "2021",
  },
  {
    aircraft: "Gulfstream G650ER",
    type: "Ultra-Long-Range",
    headline: "Premium VIP Retrofit",
    description: "Interior refresh on an in-service G650ER for a private owner upgrading from factory specification. New seating groupings, redesigned aft cabin lounge, custom credenza, and upgraded cabin management system integration.",
    highlights: ["Factory → bespoke upgrade", "New aft lounge configuration", "Custom CMS integration", "Upgraded galley & lavatory"],
    operator: "Private owner",
    year: "2023",
  },
];

const capabilities = [
  {
    icon: Armchair,
    title: "Bespoke Seating",
    description: "Hand-stitched leather, custom foam profiling, and recline/berthing configurations engineered for ultra-long-range comfort.",
  },
  {
    icon: Layers,
    title: "Cabinetry & Millwork",
    description: "In-house CNC fabrication in exotic veneers, high-gloss lacquer, carbon fibre, and stone-effect laminates.",
  },
  {
    icon: Lightbulb,
    title: "Lighting Systems",
    description: "Full LED indirect lighting architectures with programmable scenes, mood control, and circadian rhythm support.",
  },
  {
    icon: Palette,
    title: "Surface Treatments",
    description: "Fabric, leather, Alcantara, veneer, stone, and custom paint finishing from our in-house design studio.",
  },
  {
    icon: PanelTop,
    title: "Cabin Management",
    description: "Integration of leading CMS and IFE platforms — Honeywell, Collins, Panasonic Avionics — with bespoke UI skins.",
  },
  {
    icon: Shield,
    title: "Full Certification",
    description: "Every installation certified under our FAA Part 21 / EASA manufacturer approval with supplemental type certificate support.",
  },
];

const process = [
  { step: "01", title: "Client Brief", description: "We begin with the client — not the aircraft. Understanding lifestyle, mission, and aesthetic intent before any engineering begins." },
  { step: "02", title: "Design Development", description: "Our design team produces concept layouts, material boards, and 3D renders for review and refinement prior to any fabrication." },
  { step: "03", title: "Engineering & Approval", description: "All designs are engineered to certification standards. We hold the approvals — you don't need a separate DER." },
  { step: "04", title: "Fabrication & Installation", description: "In-house fabrication, followed by on-aircraft installation at your preferred MRO or our facility. On-time delivery, guaranteed." },
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
              VIP Completions · Design · Manufacture · Certify
            </motion.span>
            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              Every Interior
              <br />
              <em className="display-serif-italic text-[#888888]">Is a Singular Work.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              We begin with you — your mission, your aesthetic, your aircraft. Then we engineer it to FAA and EASA standards,
              fabricate it in-house, and install it on time. No subcontractors. No compromises.
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
                href="#portfolio"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                View Projects
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="bg-[#f8f8f6] border-y border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.blockquote variants={fadeUp} className="font-serif text-[26px] leading-[1.5] text-[#111111] max-w-3xl sm:text-[32px]">
              &ldquo;We begin with the client, not the aircraft. The aircraft is the canvas —
              the client&apos;s life is the brief.&rdquo;
            </motion.blockquote>
            <motion.p variants={fadeUp} className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#aaaaaa]">
              Luminary VIP Completions Philosophy
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Section>
          <motion.span variants={fadeUp} className="chapter-rule">
            Completed Projects
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-6 max-w-2xl text-[#111111]">
            Interiors That Define
            <br />
            <em className="display-serif-italic text-[#888888]">the Standard.</em>
          </motion.h2>

          <motion.div variants={stagger} className="mt-16 space-y-6">
            {completedProjects.map((project, idx) => (
              <motion.div
                key={project.aircraft}
                variants={fadeUp}
                className="group grid gap-8 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_20px_60px_-12px_rgba(201,168,76,0.1)] lg:grid-cols-[1fr_2fr]"
              >
                {/* Left — aircraft ID */}
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">{project.type}</span>
                    <h3 className="mt-2 font-serif text-[30px] leading-[1.1] text-[#111111] sm:text-[36px]">{project.aircraft}</h3>
                    <p className="mt-3 font-serif text-[18px] italic text-[#888888]">{project.headline}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-4 border-t border-black/[0.06] pt-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{project.operator}</span>
                    <span className="h-[1px] flex-1 bg-black/[0.06]" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{project.year}</span>
                  </div>
                </div>

                {/* Right — details */}
                <div>
                  <p className="text-[15px] leading-[1.85] text-[#555555]">{project.description}</p>
                  <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                        <span className="text-[13px] text-[#555555]">{h}</span>
                      </li>
                    ))}
                  </ul>
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
                In-House Capabilities
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                Everything Under
                <br />
                <em className="display-serif-italic text-[#888888]">One Roof.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                No subcontractors for key disciplines. Our facility houses design, engineering,
                fabrication, and certification capability to deliver complete VIP interiors with full accountability.
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
              Four Steps.
              <br />
              <em className="display-serif-italic text-[#888888]">One Outcome.</em>
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
              Your Aircraft.<br />
              <em className="font-normal italic text-white/40">Your Vision.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
              Every VIP project begins with a conversation. Share your aircraft type, mission requirements, and design intent —
              we&apos;ll respond within one business day with a tailored consultation.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Start a Consultation
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
