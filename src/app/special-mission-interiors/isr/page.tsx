"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Eye, Shield, Zap, Settings2, ArrowRight } from "lucide-react";

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

const capabilities = [
  {
    icon: Eye,
    title: "Rigorous Weight Reduction",
    description:
      "Mission equipment payload requires every gram to be justified. ADMI panels deliver substantial weight savings over conventional interiors — without compromising structural integrity or acoustic performance.",
  },
  {
    icon: Shield,
    title: "On-Station Modularity",
    description:
      "Quick access behind all walls and flooring without dismantling the interior. Critical maintenance on demand, preserving operational tempo regardless of unscheduled requirements.",
  },
  {
    icon: Zap,
    title: "Mission Endurance",
    description:
      "Air crews in ADMI aircraft report reduced fatigue. Lower noise and improved thermal stability extend effective on-station performance across long-duration surveillance missions.",
  },
  {
    icon: Settings2,
    title: "Combat-Proven Durability",
    description:
      "US Air Force tactical reconnaissance aircraft with ADMI flying up to three sorties per day. Proven in the harshest operational conditions over extended service life.",
  },
];

export default function ISRPage() {
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
                ADMI™ · ISR Platforms
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-5xl text-[#111111]">
              Intelligence, Surveillance
              <br />
              <em className="display-serif-italic text-[#888888]">&amp; Reconnaissance Interiors</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              ISR aircraft date back to World War II, and the mission category has seen a marked resurgence
              in modern conflicts. Luminary began development of a lightweight, modular, and durable interior
              solution in 2005 for the Army ARMS programme. Since then, we have completed more than 100 ADMI
              mission interiors for ISR platforms worldwide.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
              >
                Request a Programme Brief
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="border-y border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                The ADMI Benchmark
              </span>
            </motion.div>
            <motion.p variants={fadeUp} className="text-[17px] leading-[1.8] text-[#555555]">
              The ADMI system set the benchmark for ISR interiors — combining function, durability, weight
              savings, crew comfort, and thermal acoustic benefits into a single certified platform. No other
              interior solution delivers these attributes in a modular, mission-ready package approved under
              FAA Part 21 authority.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── PULL QUOTE ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.blockquote
              variants={fadeUp}
              className="font-serif text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.45] text-[#111111]"
            >
              &ldquo;Endorsed by commanders, embraced by operators.&rdquo;
            </motion.blockquote>
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
                Luminary Air Group · ADMI™ ISR Programme
              </p>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Core Capabilities
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
                Engineered for the
                <br />
                <em className="display-serif-italic text-[#888888]">Demands of the Mission</em>
              </motion.h2>
            </div>

            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    variants={fadeUp}
                    className="rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]"
                  >
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[var(--color-surface)]">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">
                      {cap.title}
                    </h3>
                    <p className="mt-4 text-[13px] leading-[1.8] text-[#555555]">{cap.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DARK STAT SECTION ── */}
      <section className="bg-[#111111]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Programme Scale
              </span>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
            </motion.div>
            <motion.div variants={fadeUp} className="display-serif text-[var(--color-gold)]">
              100+
            </motion.div>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-2 text-white">
              ADMI Mission Interiors Completed
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
              From the 2005 Army ARMS programme to the most recent theatre deployments, ADMI has been
              installed, operated, and trusted in the most demanding ISR environments in the world.
              Every interior manufactured under FAA Part 21 authority with full configuration documentation.
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
