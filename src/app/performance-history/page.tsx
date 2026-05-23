"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
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
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
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
      {/* ── SECTION 1: HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "65vh" }}>
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1800&q=85&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-40 sm:px-8 lg:pb-28 lg:pt-52">
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
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[16px] leading-[1.9] text-white/55">
              Luminary publishes acoustic measurement data for every project we complete. Pre- and post-installation
              dB SIL verification under FAA Part 21 certification protocol.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: WORLD RECORD CALLOUT ── */}
      <section className="bg-[#0f0f0f] py-28">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Giant number */}
            <motion.div variants={fadeUp}>
              <span
                className="block font-serif leading-none text-[var(--color-gold)]"
                style={{ fontSize: "clamp(5rem, 12vw, 9rem)" }}
              >
                46.7 dB SIL
              </span>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.26em] text-white/40">
                World Record &middot; Boeing Business Jet &middot; FAA Part 21 Certified
              </p>
            </motion.div>

            {/* Explanation */}
            <motion.div variants={fadeUp}>
              <p className="text-[16px] leading-[1.9] text-white/60">
                The quietest business jet cabin ever independently measured and certified. Achieved using a bespoke
                multi-layer acoustic insulation system designed and installed by Luminary Air Group on a privately
                operated Boeing Business Jet. Pre- and post-installation measurements were conducted under controlled
                in-flight conditions, certified under FAA Part 21 protocol, and archived with full instrumentation
                records. The result remains unmatched for the type and stands as the definitive benchmark for what is
                acoustically achievable in a wide-body business jet cabin.
              </p>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── SECTION 3: CASE STUDIES ── */}
      <section className="bg-white py-28">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-16">
            <h2 className="display-serif-md text-[#111111]">
              Case Studies
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
              Each project represents a fully measured, Part 21 certified installation with independent pre- and
              post-installation acoustic data. Results are not estimated or extrapolated.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {caseStudies.map((cs, index) => (
              <motion.div
                key={cs.id}
                variants={fadeUp}
                className={`flex flex-col overflow-hidden p-8 ${
                  index === 0
                    ? "bg-[#0f0f0f]"
                    : "border border-black/[0.09] bg-white"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] ${
                      index === 0
                        ? "border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.1)] text-[var(--color-gold)]"
                        : "border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)] text-[var(--color-gold)]"
                    }`}
                  >
                    {cs.category}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                      index === 0 ? "text-white/30" : "text-[#888888]"
                    }`}
                  >
                    {cs.year}
                  </span>
                </div>

                {/* Aircraft */}
                <h3
                  className={`mt-5 font-serif text-[20px] leading-tight ${
                    index === 0 ? "text-white" : "text-[#111111]"
                  }`}
                >
                  {cs.aircraft}
                </h3>

                {/* Big result */}
                <div
                  className="mt-3 font-serif leading-none text-[var(--color-gold)]"
                  style={{ fontSize: "clamp(2.5rem,5vw,3.75rem)" }}
                >
                  {cs.result}
                </div>

                {/* Achievement label */}
                <p
                  className={`mt-4 font-mono text-[9px] uppercase tracking-[0.18em] ${
                    index === 0 ? "text-white/40" : "text-[#888888]"
                  }`}
                >
                  {cs.achievement}
                </p>

                {/* Description */}
                <p
                  className={`mt-5 flex-1 text-[13px] leading-[1.8] ${
                    index === 0 ? "text-white/55" : "text-[#555555]"
                  }`}
                >
                  {cs.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── SECTION 4: MILITARY PROGRAMMES ── */}
      <section className="bg-[#f4f3f0] py-28">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-14">
            <h2 className="display-serif-md text-[#111111]">
              Government &amp; Military Programmes
            </h2>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {militaryProgrammes.map((prog) => (
              <motion.div
                key={prog.label}
                variants={fadeUp}
                className="flex flex-col gap-5 border-t-2 border-[var(--color-gold)] bg-white px-8 py-10"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">
                  {prog.label}
                </p>
                <p className="text-[14px] leading-[1.85] text-[#555555]">{prog.body}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── SECTION 5: MEASUREMENT METHODOLOGY ── */}
      <section className="bg-white py-28">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Left: editorial header */}
            <motion.div variants={fadeUp}>
              <h2 className="display-serif-md text-[#111111]">How we measure</h2>
              <p className="mt-8 text-[15px] leading-[1.85] text-[#555555]">
                Luminary&rsquo;s performance data is produced through a rigorous, instrument-driven protocol applied
                consistently across every project and every aircraft type. We do not model outcomes or extrapolate
                from prior results. Every number published is a direct measurement from a certified in-flight
                acoustic campaign conducted on the specific airframe.
              </p>
              <p className="mt-5 text-[15px] leading-[1.85] text-[#555555]">
                The dB SIL (Sound Intensity Level) scale is used throughout — the industry standard for business
                aviation cabin characterisation, capturing true acoustic energy rather than the directional
                limitations of simple SPL readings. All equipment is calibrated to traceable national standards
                before each campaign.
              </p>
            </motion.div>

            {/* Right: numbered methodology list */}
            <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
              {methodologyPoints.map((point) => (
                <motion.div
                  key={point.num}
                  variants={fadeUp}
                  className="py-8 first:pt-0 last:pb-0"
                >
                  <div className="flex items-baseline gap-6">
                    <span className="w-8 shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                      {point.num}
                    </span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#111111]">
                        {point.title}
                      </p>
                      <p className="mt-3 text-[14px] leading-[1.8] text-[#555555]">{point.body}</p>
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
