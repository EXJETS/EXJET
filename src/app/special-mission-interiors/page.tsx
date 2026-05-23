"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const missionTypes = [
  {
    number: "01",
    title: "Intelligence, Surveillance & Reconnaissance (ISR)",
    description: "Console integration, sensor rack provisions, and data management station layouts engineered to drawing from the first build.",
  },
  {
    number: "02",
    title: "Medical Evacuation (Med-Evac)",
    description: "Certified litter mounts, medical equipment stations, oxygen distribution, and rapid role-change to standard passenger configuration.",
  },
  {
    number: "03",
    title: "Command & Control (C2)",
    description: "Communication rack integration, mission console furniture, and cabling management structured around installed electronics.",
  },
  {
    number: "04",
    title: "Special Operations Support",
    description: "Ruggedised finishes, secure storage, and rapid-reconfigure architecture optimised for mission turnaround.",
  },
  {
    number: "05",
    title: "Government & Head-of-State Transport",
    description: "Discreet functional cabin environments with full technical access and modularity for sustained multi-year service.",
  },
];

export default function SpecialMissionInteriorsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1800&q=85&fit=crop"
          alt="Aircraft cockpit instruments"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 lg:pb-16 lg:pt-36">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Special Mission Interiors
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              ADMI™ Platform
              <br />
              <em className="display-serif-italic text-white/40">Engineered for demanding operations.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[15px] leading-[1.9] text-white/65">
              The Advanced Deployable Mission Interior — Luminary&apos;s proprietary platform for certified ISR,
              Med-Evac, Command &amp; Control, and government aircraft interior systems.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Request a Quote <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION TYPES ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <div className="grid gap-12 lg:grid-cols-12">
              <motion.div variants={fadeUp} className="lg:col-span-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                  Mission configurations
                </span>
                <h2 className="display-serif-md mt-5 text-[#111111]">
                  Five operational categories.
                  <br />
                  <em className="display-serif-italic text-[#999999]">One certified manufacturer.</em>
                </h2>
              </motion.div>

              <motion.div variants={stagger} className="lg:col-span-8">
                <div className="divide-y divide-black/[0.07]">
                  {missionTypes.map((m) => (
                    <motion.div key={m.number} variants={fadeUp} className="grid grid-cols-[48px_1fr] gap-5 py-7">
                      <span className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                        {m.number}
                      </span>
                      <div>
                        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">{m.title}</h3>
                        <p className="mt-2.5 text-[14px] leading-[1.85] text-[#555555]">{m.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── ADMI™ PLATFORM ── */}
      <section className="bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <motion.div variants={fadeUp} className="max-w-3xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                The ADMI™ Platform
              </span>
              <p className="mt-7 font-serif leading-[1.5] text-white/85" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)" }}>
                The ADMI™ platform is Luminary&apos;s answer to the demand for rapidly reconfigurable,
                certified mission interior systems — engineered for sustained crew effectiveness,
                not just initial installation.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="mt-14 divide-y divide-white/[0.07]">
              {[
                { value: "FAA Part 21", label: "Manufacturer Approval" },
                { value: "Field Reconfigurable", label: "Multi-role capable" },
                { value: "STC Backed", label: "Certified data package issued with every project" },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:gap-10"
                >
                  <span className="shrink-0 font-serif leading-none text-[var(--color-gold)]" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}>
                    {s.value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="border-t border-white/[0.04] bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Section className="flex flex-col items-start">
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">
              Specify your mission requirement
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-lg text-[15px] leading-[1.85] text-white/65">
              Provide your aircraft type, programme scope, and timeline. Our engineering team will prepare
              a written programme brief addressing configuration, weight targets, and ADMI™ platform applicability.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Initiate a Programme Brief <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>
    </>
  );
}
