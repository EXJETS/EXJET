"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Layers, Package, Lightbulb, LayoutGrid, Settings, ArrowRight, ChevronRight } from "lucide-react";

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

const treatmentCategories = [
  {
    icon: Layers,
    title: "Sidewall Panels",
    description:
      "Luminary has been fabricating and treating aircraft sidewall panels for roughly a decade. We design, engineer, and manufacture new sidewalls entirely in-house — or rework existing panels to customer specifications. Our in-house capability covers every aspect from raw material selection through final finish.",
  },
  {
    icon: Package,
    title: "Lower Sidewall Blankets",
    description:
      "Light and durable, lower sidewall blankets provide an excellent fit for any mission aircraft. Fully customisable for wiring feed-throughs and mission equipment pass-throughs, these blankets are engineered to complement the overall interior weight target while providing adequate protection and thermal acoustic contribution.",
  },
  {
    icon: Lightbulb,
    title: "Headliner Panels",
    description:
      "Existing headliners are often refurbished using high-quality foams, fabrics, and leathers. Mission aircraft may require a complete rethinking of the headliner system: flexible, modular solutions that integrate lighting, oxygen provisions, and gaspers at a fraction of original weight — engineered for access and maintenance throughout the service life.",
  },
  {
    icon: LayoutGrid,
    title: "Flooring Treatments",
    description:
      "Custom multi-layered carpet pad and carpet, anti-microbial leak-proof treatment, or mission floor covering designed to minimise weight. Luminary delivers flooring solutions for VIP, Med-Evac, or mission interiors — each engineered to its specific performance requirements and certified under FAA Part 21 authority.",
  },
  {
    icon: Settings,
    title: "Other Interior Components",
    description:
      "Aft pressure bulkhead treatments, window plugs, floor mats, cockpit treatments, and customised replacement parts for many different aircraft makes and models. If it is part of the interior and it requires engineering, fabrication, or certification — Luminary has the capability to deliver it.",
  },
];

export default function InteriorTreatmentsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 lg:pt-48 lg:pb-36">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Mission Interior Treatments
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-5xl text-[#111111]">
              Custom Interior Components
              <br />
              <em className="display-serif-italic text-[#888888]">for Any Mission Configuration</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              From sidewall panels to headliner systems, flooring treatments to pressure bulkhead components —
              Luminary engineers, fabricates, and certifies custom interior treatments for any aircraft and
              any mission requirement. Every solution is delivered under FAA Part 21 manufacturer approval.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── TREATMENT CATEGORIES ── */}
      <section className="border-t border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Treatment Categories
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
                Five Areas of Interior
                <br />
                <em className="display-serif-italic text-[#888888]">Engineering Expertise</em>
              </motion.h2>
            </div>

            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {treatmentCategories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.title}
                    variants={fadeUp}
                    className={`flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]${
                      index === treatmentCategories.length - 1 ? " sm:col-span-2 lg:col-span-1" : ""
                    }`}
                  >
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[var(--color-surface)]">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">
                      {cat.title}
                    </h3>
                    <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-[#555555]">
                      {cat.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.blockquote
              variants={fadeUp}
              className="font-serif text-[clamp(1.3rem,2.6vw,2rem)] leading-[1.55] text-[#111111]"
            >
              &ldquo;Whether it&rsquo;s designing new sidewalls from scratch or reworking existing
              panels to customer specifications — we have the solutions to fit your budget.&rdquo;
            </motion.blockquote>
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
                Luminary Air Group · Interior Treatments
              </p>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── BOTTOM LINKS ── */}
      <section className="border-t border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <Section>
            <motion.div variants={fadeUp} className="mb-10 flex flex-col items-center text-center">
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Explore Further
                </span>
              </div>
              <h2 className="display-serif-md text-[#111111]">
                Related Mission Interior
                <em className="display-serif-italic text-[#888888]"> Programmes</em>
              </h2>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "ISR Platforms",
                  description: "Intelligence, Surveillance & Reconnaissance interiors built on the ADMI™ platform.",
                  href: "/special-mission-interiors/isr",
                },
                {
                  label: "Med-Evac Interiors",
                  description: "Anti-microbial, sterile medical evacuation interior systems.",
                  href: "/special-mission-interiors/med-evac",
                },
                {
                  label: "Contact",
                  description: "Discuss your interior treatment requirements with our engineering team.",
                  href: "/contact",
                },
              ].map((link) => (
                <motion.div key={link.href} variants={fadeUp}>
                  <Link
                    href={link.href}
                    className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">
                      {link.label}
                    </span>
                    <p className="mt-3 text-[13px] leading-[1.75] text-[#555555]">{link.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-all group-hover:gap-3">
                      Learn more
                      <ChevronRight className="h-3 w-3" strokeWidth={2} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
              >
                Initiate a Project
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
