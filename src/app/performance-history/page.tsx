"use client";

import { motion } from "framer-motion";
import caseStudies from "@/data/case-studies.json";

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

const militaryProgrammes = [
  {
    label: "E4B Presidential Fleet",
    body: "Cabin acoustic insulation systems for the National Airborne Operations Center fleet. Classified programme under government contract.",
  },
  {
    label: "KC-135 Boom Pod",
    body: "Interior insulation system for the aerial refuelling boom operator station. Part 21 certified replacement programme.",
  },
  {
    label: "Boeing VVIP Multi-Aircraft",
    body: "Multi-aircraft VVIP completion programme with full acoustic data package and STC coverage for each airframe.",
  },
];

const methodologyPoints = [
  {
    num: "01",
    title: "Calibrated Equipment",
    body: "All acoustic measurements use precision instrumentation calibrated to traceable national standards before every campaign, recorded on the dB SIL scale.",
  },
  {
    num: "02",
    title: "Independent Verification",
    body: "Results are not self-reported estimates. Post-installation measurements are conducted under controlled, repeatable in-flight conditions with raw data archived and independently verifiable on request.",
  },
  {
    num: "03",
    title: "Part 21 Data Package",
    body: "Every campaign produces a complete Part 21 certified data package — pre- and post-installation readings, cabin position documentation, flight parameters, and instrumentation records.",
  },
  {
    num: "04",
    title: "Published Results",
    body: "Luminary publishes acoustic performance data for every project where client permission is granted. Every documented outcome is available to prospective clients as reference data.",
  },
];

export default function PerformanceHistoryPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1800&q=85&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 lg:pb-16 lg:pt-36">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Performance History
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Documented Results.
              <br />
              <em className="display-serif-italic text-white/40">Every project. Every number.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[15px] leading-[1.9] text-white/65">
              Luminary publishes acoustic measurement data for every project we complete. Pre- and post-installation
              dB SIL verification under FAA Part 21 certification protocol.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── WORLD RECORD ── */}
      <section className="bg-[#0f0f0f] py-14 lg:py-20">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <motion.div variants={fadeUp}>
              <span
                className="block font-serif leading-none text-[var(--color-gold)]"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
              >
                46.7 dB SIL
              </span>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.26em] text-white/45">
                World Record · Boeing Business Jet · FAA Part 21 Certified
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="text-[15px] leading-[1.9] text-white/70">
                The quietest business jet cabin ever independently measured and certified. Achieved using a bespoke
                multi-layer acoustic insulation system designed and installed by Luminary Air Group on a privately
                operated Boeing Business Jet. Pre- and post-installation measurements were conducted under controlled
                in-flight conditions, certified under FAA Part 21 protocol, and archived with full instrumentation records.
              </p>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── CASE STUDIES ── */}
      <section className="bg-white py-14 lg:py-20">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Project record</span>
            <h2 className="display-serif-md mt-3 text-[#111111]">Case Studies</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
              Each project represents a fully measured, Part 21 certified installation with independent pre- and
              post-installation acoustic data.
            </p>
          </motion.div>

          <motion.div variants={stagger}>
            {caseStudies.map((cs) => (
              <motion.div key={cs.id} variants={fadeUp} className="border-t border-black/[0.07] py-10">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                    {cs.aircraft} · {cs.category}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-[#cccccc]">{cs.year}</span>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-12">
                  <div className="shrink-0">
                    <span
                      className="font-serif leading-none text-[#111111]"
                      style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
                    >
                      {cs.result}
                    </span>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                      {cs.achievement}
                    </p>
                  </div>
                  <p className="flex-1 text-[14px] leading-[1.9] text-[#555555]">{cs.description}</p>
                </div>
              </motion.div>
            ))}
            <div className="border-t border-black/[0.07]" />
          </motion.div>
        </Section>
      </section>

      {/* ── MILITARY ── */}
      <section className="bg-[#f4f3f0] py-14 lg:py-20">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Government</span>
            <h2 className="display-serif-md mt-3 text-[#111111]">Government &amp; Military Programmes</h2>
          </motion.div>

          <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
            {militaryProgrammes.map((prog) => (
              <motion.div key={prog.label} variants={fadeUp} className="grid gap-6 py-8 sm:grid-cols-[220px_1fr] sm:gap-12">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">{prog.label}</h3>
                <p className="text-[14px] leading-[1.9] text-[#555555]">{prog.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="bg-white py-14 lg:py-20">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-20">
            <motion.div variants={fadeUp}>
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Methodology</span>
              <h2 className="display-serif-md mt-3 text-[#111111]">How we measure</h2>
              <p className="mt-7 text-[15px] leading-[1.9] text-[#555555]">
                Luminary&rsquo;s performance data is produced through a rigorous, instrument-driven protocol applied
                consistently across every project and every aircraft type. We do not model outcomes or extrapolate
                from prior results. Every number published is a direct measurement from a certified in-flight
                acoustic campaign conducted on the specific airframe.
              </p>
              <p className="mt-5 text-[15px] leading-[1.9] text-[#555555]">
                The dB SIL (Sound Intensity Level) scale is used throughout — the industry standard for business
                aviation cabin characterisation, capturing true acoustic energy rather than the directional
                limitations of simple SPL readings.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
              {methodologyPoints.map((point) => (
                <motion.div key={point.num} variants={fadeUp} className="py-7 first:pt-0">
                  <div className="flex items-baseline gap-6">
                    <span className="w-7 shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                      {point.num}
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#111111]">{point.title}</p>
                      <p className="mt-3 text-[14px] leading-[1.85] text-[#555555]">{point.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>
      </section>
    </>
  );
}
