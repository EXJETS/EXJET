"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FlaskConical, Layers, Square, Shield, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

const treatments = [
  {
    icon: FlaskConical,
    title: "Flooring",
    description:
      "A barrier that completely seals the cabin floor, preventing liquids from breaching to the subfloor and causing corrosion. Anti-microbial materials are applied on all treated areas, incorporating the latest bacteria and fungus-killing floor treatment technologies certified for aviation use.",
  },
  {
    icon: Layers,
    title: "Sidewall Panels",
    description:
      "Custom fitted sidewall panels engineered for any Med-Evac layout. Panels accommodate all necessary medical equipment while increasing functional workspace. Can be manufactured from scratch or reworked from existing panels — anti-microbial technology applied throughout.",
  },
  {
    icon: Square,
    title: "Seating",
    description:
      "Med-Evac seating can be reworked or replaced with functional alternatives in conversion aircraft. Configurations accommodate attendant seating, litter mount integration points, and rapid role-change capability between medical and standard passenger configurations.",
  },
  {
    icon: Shield,
    title: "Anti-Microbial Systems",
    description:
      "All Luminary Med-Evac installations utilise anti-microbial materials on every treated surface. Bacteria and fungus-destroying technology is applied consistently across flooring and sidewall systems, establishing a sterile operational environment throughout the cabin.",
  },
];

export default function MedEvacPage() {
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
                ADMI™ · Medical Evacuation
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-5xl text-[#111111]">
              Med-Evac Interiors Engineered
              <br />
              <em className="display-serif-italic text-[#888888]">for Sterile, Functional Operations</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              Med-Evac customers require specialised interiors that accommodate crew needs and proactively
              guard against corrosion, bacteria, and fungus to promote a sterile workplace in the sky.
              Every Luminary Med-Evac installation is engineered to meet these requirements under FAA
              Part 21 manufacturer approval.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
              >
                Discuss Your Programme
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── TREATMENTS ── */}
      <section className="border-t border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Interior Systems
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
                Four Disciplines,
                <br />
                <em className="display-serif-italic text-[#888888]">One Sterile Standard</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Luminary addresses every surface and system in the Med-Evac cabin — from structural
                flooring protection to anti-microbial sidewall coverage.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {treatments.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]"
                  >
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[var(--color-surface)]">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">
                      {item.title}
                    </h3>
                    <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-[#555555]">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── FEATURE CALLOUT ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.blockquote
              variants={fadeUp}
              className="font-serif text-[clamp(1.4rem,2.8vw,2.1rem)] leading-[1.5] text-[#111111]"
            >
              &ldquo;The only aircraft interior that treats sterility as a structural requirement,
              not an afterthought.&rdquo;
            </motion.blockquote>
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
                Luminary Air Group · ADMI™ Med-Evac Division
              </p>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="relative overflow-hidden bg-[#111111]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06),transparent_70%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
          <Section>
            <motion.div variants={fadeUp} className="mb-4 flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                ADMI™ · Med-Evac
              </span>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">
              Sterile by Design.
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">Certified by Authority.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/50">
              Provide your aircraft type, mission profile, and programme timeline. Luminary will
              respond with a scoped proposal addressing sterility requirements, configuration options,
              and certification path — before any commitment is required.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
              >
                Contact for Programme Brief
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
