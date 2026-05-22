"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  BarChart3,
  FileCheck2,
  BadgeCheck,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import caseStudies from "@/data/case-studies.json";

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

const methodologySteps = [
  {
    number: "01",
    icon: Activity,
    title: "Calibrated Equipment",
    description:
      "All acoustic measurements are conducted using precision instrumentation calibrated to traceable national standards before every campaign. Measurements use the Sound Intensity Level (dB SIL) scale — the industry standard for business aviation cabin characterisation, capturing true acoustic energy independent of the limitations of simple SPL readings.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Independent Verification",
    description:
      "Results are not self-reported estimates. Post-installation measurements are conducted under controlled, repeatable in-flight conditions by independent operators where required, and the raw data is archived with full instrumentation calibration records — independently verifiable on request.",
  },
  {
    number: "03",
    icon: FileCheck2,
    title: "Part 21 Data Package",
    description:
      "Every measurement campaign produces a complete Part 21 certified data package — pre- and post-installation readings, cabin position documentation, flight condition parameters, instrumentation records, and analysis. Full traceability is maintained throughout and delivered to clients as part of project close-out.",
  },
  {
    number: "04",
    icon: BadgeCheck,
    title: "Published Results",
    description:
      "Luminary publishes acoustic performance data for every project where client permission is granted. Results are not selectively disclosed — every documented outcome, from midsize jet optimization programmes to world-record wide-body completions, is available to prospective clients as reference data.",
  },
];

export default function PerformanceHistoryPage() {
  return (
    <main className="min-h-screen">

      {/* ── HERO (dark) ── */}
      <section className="relative overflow-hidden bg-[#111111]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(201,168,76,0.1),transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 lg:pt-48 lg:pb-36">
          <Section className="flex flex-col items-center text-center">
            <motion.span
              variants={fadeUp}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
            >
              Performance Record · Documented Results
            </motion.span>
            <motion.h1 variants={fadeUp} className="display-serif mt-6 text-white">
              The Data
              <br />
              <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                Speaks.
              </em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-white/60">
              Luminary publishes acoustic performance for every project. Independent measurement. Part 21 certified
              data. Reproducible results across turboprop, midsize, large cabin, and wide-body aircraft.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Request a Data Sheet
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition-all hover:border-white/40 hover:text-white"
              >
                Contact Engineering
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── WORLD RECORD STRIP ── */}
      <section className="bg-white border-b border-black/[0.06]">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 text-center">
          <Section>
            <motion.span variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#888888]">
              World Record Achievement
            </motion.span>
            <motion.div
              variants={fadeUp}
              className="display-serif mt-4 text-[var(--color-gold)]"
            >
              46.7 dB SIL
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 font-mono text-[12px] uppercase tracking-[0.2em] text-[#555555]">
              Boeing Business Jet · 2018
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 mx-auto w-16 h-px bg-[var(--color-gold)] opacity-50" />
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl mx-auto text-[16px] leading-[1.85] text-[#555555]">
              The quietest business jet cabin ever independently measured and recorded. Achieved using a bespoke
              multi-layer acoustic insulation system designed and installed by Luminary Air Group on a privately
              operated Boeing Business Jet. The result remains unmatched for the type.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="bg-[#f8f8f6] border-b border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Section>
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 gap-px overflow-hidden bg-black/[0.06] sm:grid-cols-4"
            >
              {[
                { value: "46.7 dB", label: "World Record SIL" },
                { value: "57.1 dB", label: "Challenger 604" },
                { value: "100+", label: "STC Approvals" },
                { value: "25+ yr", label: "Measurement Record" },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="flex flex-col items-center gap-2 bg-white px-8 py-8 text-center"
                >
                  <span className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-none text-[#111111]">
                    {s.value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16">
              <motion.span variants={fadeUp} className="chapter-rule">
                Case Studies · All Projects
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 max-w-2xl text-[#111111]">
                Documented Results,
                <br />
                <em className="display-serif-italic text-[#888888]">Aircraft by Aircraft.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Each project below represents a fully measured, Part 21 certified installation with independent
                pre- and post-installation acoustic data. Results are not estimated or extrapolated.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid gap-6 sm:grid-cols-2">
              {caseStudies.map((cs) => (
                <motion.div
                  key={cs.id}
                  variants={fadeUp}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_20px_48px_-12px_rgba(201,168,76,0.12)]"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-block rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                      {cs.category}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">{cs.year}</span>
                  </div>

                  {/* Aircraft and result */}
                  <h3 className="mt-5 display-serif-sm text-[#111111]">{cs.aircraft}</h3>
                  <div className="mt-3 font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-none text-[var(--color-gold)]">
                    {cs.result}
                  </div>

                  {/* Achievement badge */}
                  <div className="mt-4 inline-block self-start rounded-lg bg-[#f8f8f6] border border-black/[0.06] px-4 py-2.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">Achievement</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#111111] font-medium">
                      {cs.achievement}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="mt-5 flex-1 text-[13px] leading-[1.8] text-[#555555]">{cs.description}</p>

                  {/* Footer */}
                  <div className="mt-7 flex items-center justify-between border-t border-black/[0.06] pt-5">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#aaaaaa]">Operator</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#555555]">
                        {cs.operator}
                      </p>
                    </div>
                    <CheckCircle2
                      className="h-5 w-5 text-[rgba(201,168,76,0.4)] transition-colors group-hover:text-[var(--color-gold)]"
                      strokeWidth={1.5}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── MILITARY & GOVERNMENT PROGRAMS ── */}
      <section className="bg-[#f8f8f6] border-t border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-14">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Military &amp; Government Programs
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
                Government programmes,
                <br />
                <em className="display-serif-italic text-[#888888]">classified and unclassified.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Luminary has built a strong relationship over the last two decades with the DoD and its largest
                vendors. Government aircraft interior work has been part of Luminary&apos;s programme portfolio
                since our inception in 1998.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="space-y-5">
              {[
                {
                  label: "Boeing Business Jet Fleet",
                  badge: "50+ Aircraft",
                  body: "Luminary has the most experience of any provider in wide-body thermal and acoustical treatments. More than 50 Boeing Business Jets treated with the Flight Environments Cabin Comfort System since market entry. A 2021 multi-aircraft contract awarded directly by Boeing to design, fabricate, and install insulation kits for VVIP aircraft operated by one of their customers.",
                },
                {
                  label: "Presidential Fleet · E-4B",
                  badge: "All Aircraft Completed",
                  body: "Luminary has completed the interiors of all E-4B aircraft — designing and flight-testing the quietest conference room in the sky for a Boeing 747. Every member of Luminary's staff considers this programme a singular point of professional pride.",
                },
                {
                  label: "KC-135 · Boom Pod Acoustic Treatment",
                  badge: "Air Force Programme",
                  body: "Challenged by the Air Force to reduce cabin sound levels and refurbish interior panels, with particular attention to the Boom Pod area. Data acquired through acoustic and thermal flight tests allowed Luminary to develop a system that significantly reduced cabin sound levels and substantially improved the Boom Pod Operator's working environment. Luminary was recognised for its success and now offers systems for both the aircraft cabin and the Boom Pod.",
                },
              ].map((prog) => (
                <motion.div
                  key={prog.label}
                  variants={fadeUp}
                  className="flex flex-col gap-5 rounded-2xl border border-black/[0.08] bg-white p-8 sm:flex-row sm:items-start"
                >
                  <div className="shrink-0 sm:w-64">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">{prog.label}</p>
                    <span className="mt-2 inline-block rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                      {prog.badge}
                    </span>
                  </div>
                  <p className="flex-1 text-[14px] leading-[1.8] text-[#555555]">{prog.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="bg-white border-t border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.span variants={fadeUp} className="chapter-rule">
                Measurement Standard
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                Our Measurement
                <br />
                <em className="display-serif-italic text-[#888888]">Standard.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Luminary&apos;s performance data is produced through a rigorous, instrument-driven protocol applied
                consistently across every project. Results are measured — not modelled or extrapolated.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2">
              {methodologySteps.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    variants={fadeUp}
                    className="flex gap-6 rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)]"
                  >
                    <div className="shrink-0">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                        <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                        Step {step.number}
                      </p>
                      <h3 className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[13px] leading-[1.8] text-[#555555]">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111111]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              Commission an Acoustic Survey
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-5 text-white">
              Your Aircraft.
              <br />
              <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                A Documented Result.
              </em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
              Every Luminary project begins with a thorough acoustic survey of your specific airframe. We commit to
              a projected dB SIL target before any installation work begins — and we publish the result when complete.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Commission an Acoustic Survey
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/cabin-comfort-systems"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition-all hover:border-white/40 hover:text-white"
              >
                Cabin Comfort Systems
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
