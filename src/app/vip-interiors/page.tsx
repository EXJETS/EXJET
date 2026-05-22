"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Armchair,
  Layers,
  PanelTop,
  Grid,
  Lightbulb,
  Leaf,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function VipInteriorsPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-80px" });

  const processRef = useRef(null);
  const processInView = useInView(processRef, { once: true, margin: "-80px" });

  const qualityRef = useRef(null);
  const qualityInView = useInView(qualityRef, { once: true, margin: "-80px" });

  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

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
              <span className="text-[#c9a84c]">VIP Interiors</span>
              <span className="text-[#888888]">Design · Manufacturing · Installation</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Every detail,{" "}
              <em className="display-serif-italic text-[#c9a84c]">perfected.</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-[#555555]"
            >
              Luminary Air Group delivers full-lifecycle VIP and corporate
              aircraft interiors — from concept and design through manufacturing,
              installation, and certification. Every surface, material, and
              system is engineered with precision and built to last.
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
              Start your interior project
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[#111111] transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              View performance history
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06]">
        <motion.div
          ref={servicesRef}
          variants={stagger}
          initial="hidden"
          animate={servicesInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
              I · Services
            </span>
            <h2 className="display-serif-md mt-5 text-[#111111]">
              Every interior discipline,
              <br />
              <em className="display-serif-italic text-[#555555]">under one roof.</em>
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[#555555]">
              From hand-crafted cabinetry to full green completions, our skilled team
              handles every element of your aircraft interior in-house — with the
              quality and documentation of a Part 21 manufacturer.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Armchair,
                number: "01",
                title: "Cabinetry Design & Fabrication",
                description:
                  "Custom hardwood and composite cabinetry engineered to your specification. Every unit is designed for the exact airframe geometry, meeting weight budgets and airworthiness requirements without compromise.",
                badge: "Custom hardwood / composite",
              },
              {
                icon: Layers,
                number: "02",
                title: "Seating & Divan Upholstery",
                description:
                  "Executive seating, club configurations, and divan builds using premium materials selected for durability, aesthetics, and compliance with airworthiness flammability standards.",
                badge: "Executive & divan",
              },
              {
                icon: PanelTop,
                number: "03",
                title: "Headliner & Sidewall Panels",
                description:
                  "Precision-fabricated headliner assemblies and sidewall panels in fabric, leather, or composite finishes. Seamlessly integrated with lighting, ventilation, and PSU systems.",
                badge: "Headliner · sidewall",
              },
              {
                icon: Grid,
                number: "04",
                title: "Flooring Systems",
                description:
                  "Full-width flooring in carpet, hardwood, tile, or bespoke material combinations. Each installation is engineered for weight, acoustic properties, and long-term durability in the demanding cabin environment.",
                badge: "Carpet · hardwood · tile",
              },
              {
                icon: Lightbulb,
                number: "05",
                title: "Lighting Systems",
                description:
                  "Integrated LED lighting design and installation — ambient, task, and mood lighting architectures that enhance the passenger experience while meeting certification requirements.",
                badge: "LED ambient & task",
              },
              {
                icon: Leaf,
                number: "06",
                title: "Green Completions",
                description:
                  "Full interior delivery from a bare airframe. We manage every interior discipline — insulation, structure, panels, seating, cabinetry, and systems — as a single coordinated build.",
                badge: "Bare airframe to complete",
              },
            ].map((card) => (
              <motion.div
                key={card.number}
                variants={fadeUp}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[#c9a84c] hover:shadow-[0_16px_32px_-8px_rgba(201,168,76,0.12)]"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                    <card.icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">
                    {card.number}
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-[22px] leading-tight text-[#111111]">
                  {card.title}
                </h3>
                <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-[#555555]">
                  {card.description}
                </p>
                <div className="mt-6 border-t border-black/[0.06] pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]">
                    {card.badge}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Repairs callout */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-start gap-5 rounded-2xl border border-black/[0.08] bg-white p-7"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
              <Wrench className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#111111]">
                Repairs & Modifications
              </h3>
              <p className="mt-2 text-[13px] leading-[1.75] text-[#555555]">
                Existing interior repairs, damage rectification, and modification work
                are handled with the same precision and documentation standards as new
                builds. From panel replacement to full refurbishment programmes, we
                bring worn or damaged interiors back to as-new condition.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── PROCESS ── 4-step horizontal ── */}
      <section className="relative bg-white py-24 border-t border-black/[0.06]">
        <motion.div
          ref={processRef}
          variants={stagger}
          initial="hidden"
          animate={processInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center mb-16">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
              II · Process
            </span>
            <h2 className="display-serif-md mt-5 text-[#111111]">
              From brief to{" "}
              <em className="display-serif-italic text-[#555555]">certified completion.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-[#555555]">
              A disciplined four-stage process ensures every VIP interior project is
              delivered on time, on spec, and to the highest standard of certified quality.
            </p>
          </motion.div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.04] sm:grid-cols-4">
            {[
              {
                number: "01",
                title: "Consultation",
                description:
                  "A detailed brief — understanding your aircraft, objectives, aesthetic preferences, and operational requirements. A design package is produced before any material is specified.",
              },
              {
                number: "02",
                title: "Design",
                description:
                  "Premium materials selected against your design brief, weight budget, and airworthiness criteria. Every material is qualified for use in the aircraft environment before procurement.",
              },
              {
                number: "03",
                title: "Fabrication",
                description:
                  "In-house fabrication as a Part 21 manufacturer. Every component is built to drawing, quality-inspected, and documented with full traceability before it reaches your aircraft.",
              },
              {
                number: "04",
                title: "Install",
                description:
                  "Expert installation by experienced technicians, followed by full certification documentation. Your maintenance records are updated and every modification is fully traceable.",
              },
            ].map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="flex flex-col bg-white px-7 py-8"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                  {step.number}
                </span>
                <h3 className="mt-4 font-serif text-[22px] leading-tight text-[#111111]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.75] text-[#555555]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── QUALITY / PART 21 ── */}
      <section className="relative bg-[#111111] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05),transparent_70%)]" aria-hidden />
        <motion.div
          ref={qualityRef}
          variants={stagger}
          initial="hidden"
          animate={qualityInView ? "visible" : "hidden"}
          className="relative mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-12 md:grid-cols-12">
            <motion.div variants={fadeUp} className="md:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                III · Certified Quality
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                Built to the{" "}
                <em className="display-serif-italic text-[#c9a84c]">highest standard.</em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.8] text-white/70">
                As a Part 21 manufacturer, every component Luminary produces carries
                full FAA certification traceability. Quality is not an aspiration — it
                is documented, inspected, and signed off at every stage of manufacture
                and installation.
              </p>
              <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.05)] p-7 text-center">
                <ShieldCheck className="h-10 w-10 text-[#c9a84c]" strokeWidth={1.25} />
                <div>
                  <div className="font-serif text-[clamp(1.25rem,3vw,2rem)] leading-none text-[#c9a84c]">
                    Part 21 Manufacturer
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.75] text-white/60">
                    FAA-certified manufacturing authority covering every component we produce.
                    Every build is fully documented and traceable.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={stagger} className="md:col-span-6">
              <div className="grid gap-4">
                {[
                  {
                    title: "Part 21 Manufacturer",
                    description: "FAA-certified manufacturing authority covering every component we produce.",
                  },
                  {
                    title: "FAA Certified",
                    description: "All installations are completed to current airworthiness standards with full documentation.",
                  },
                  {
                    title: "Every Component Documented",
                    description: "Full traceability from raw material through fabrication to aircraft installation.",
                  },
                  {
                    title: "20+ Years Experience",
                    description: "Two decades of aircraft interiors means we have encountered — and solved — every challenge.",
                  },
                ].map((p) => (
                  <motion.div
                    key={p.title}
                    variants={fadeUp}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-5"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,76,0.20)] text-[#c9a84c]">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                    </span>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">
                        {p.title}
                      </div>
                      <div className="mt-1.5 text-[12px] leading-relaxed text-white/60">
                        {p.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                variants={fadeUp}
                className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                {[
                  { value: "Part 21", label: "Manufacturer" },
                  { value: "FAA", label: "Certified" },
                  { value: "Full", label: "Documentation" },
                  { value: "20+", label: "Years experience" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-2 bg-white/[0.04] px-5 py-6 text-center">
                    <span className="font-serif text-[24px] leading-none text-[#c9a84c]">{b.value}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/50">{b.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
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
            Ready to get started
            <span className="h-px w-8 bg-[#c9a84c]/50" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-[#111111]">
            Start your
            <br />
            <em className="display-serif-italic text-[#555555]">interior project.</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-[#555555]"
          >
            Tell us about your aircraft, your vision, and your timeline. We&rsquo;ll design
            a VIP interior that meets your objectives — and deliver it with the certified
            quality your aircraft deserves.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Get in touch
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[#111111] transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              About Luminary
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
