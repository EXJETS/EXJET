"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import caseStudies from "@/data/case-studies.json";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function PerformanceHistoryPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  const recordRef = useRef(null);
  const recordInView = useInView(recordRef, { once: true, margin: "-80px" });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  const casesRef = useRef(null);
  const casesInView = useInView(casesRef, { once: true, margin: "-80px" });

  const methodRef = useRef(null);
  const methodInView = useInView(methodRef, { once: true, margin: "-80px" });

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
              <span className="text-[#c9a84c]">Performance History</span>
              <span className="text-[#888888]">Measured · Documented · Proven</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Measured.{" "}
              <em className="display-serif-italic text-[#c9a84c]">Documented.</em>
              <br />
              Proven.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-[#555555]"
            >
              Every Luminary installation is measured before and after using precision
              acoustic instrumentation. The results are documented, independently
              verifiable, and consistently exceptional — from midsize jets to
              world-record wide-body completions.
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
              Discuss your project
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[#111111] transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              Cabin Comfort Systems
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── WORLD RECORD HERO NUMBER ── dark section */}
      <section className="relative overflow-hidden bg-[#111111] border-t border-black/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.07),transparent_70%)]" aria-hidden />
        <motion.div
          ref={recordRef}
          variants={stagger}
          initial="hidden"
          animate={recordInView ? "visible" : "hidden"}
          className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              variants={fadeUp}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]"
            >
              World Record
            </motion.span>
            <motion.div
              variants={fadeUp}
              className="mt-6 font-serif text-[clamp(5rem,16vw,11rem)] leading-none tracking-tight text-[#c9a84c]"
            >
              46.7
              <span className="text-[0.35em] text-white/60"> dB SIL</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-serif text-[clamp(1.25rem,3vw,2rem)] font-normal leading-tight text-white"
            >
              World&rsquo;s Quietest Boeing Business Jet
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-[15px] leading-[1.8] text-white/70"
            >
              Achieved on a privately operated Boeing Business Jet using a bespoke
              multi-layer acoustic insulation system designed and installed by Luminary
              Air Group. This result — 46.7 dB Sound Intensity Level — remains the
              lowest cabin noise floor ever documented for the Boeing Business Jet type.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* ── ANIMATED STATS BAND ── */}
      <section className="relative bg-[#f8f8f6] border-t border-black/[0.06]">
        <motion.div
          ref={statsRef}
          variants={stagger}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid grid-cols-2 gap-px overflow-hidden border-x border-black/[0.06] bg-black/[0.04] sm:grid-cols-4">
            {[
              { value: "50–70%", label: "Avg. noise reduction" },
              { value: "20+", label: "Years in aircraft interiors" },
              { value: "Part 21", label: "Manufacturer" },
              { value: "Multi-type", label: "Aircraft coverage" },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="flex flex-col items-center gap-2 bg-white px-5 py-8 text-center"
              >
                <span className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] leading-none text-[#111111]">
                  {s.value}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CASE STUDIES GRID ── */}
      <section className="relative bg-white py-24 border-t border-black/[0.06]">
        <motion.div
          ref={casesRef}
          variants={stagger}
          initial="hidden"
          animate={casesInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="max-w-xl mb-16">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
              I · Case Studies
            </span>
            <h2 className="display-serif-md mt-5 text-[#111111]">
              Documented results,{" "}
              <em className="display-serif-italic text-[#555555]">aircraft by aircraft.</em>
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#555555]">
              Each project below represents a fully measured, documented installation
              with verified pre- and post-installation acoustic data.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {caseStudies.map((cs) => (
              <motion.div
                key={cs.id}
                variants={fadeUp}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[#c9a84c] hover:shadow-[0_16px_32px_-8px_rgba(201,168,76,0.10)]"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-block rounded-full border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                    {cs.category}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                    {cs.year}
                  </span>
                </div>

                <h3 className="mt-5 font-serif text-[24px] leading-tight text-[#111111]">
                  {cs.title}
                </h3>
                <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#555555]">
                  {cs.aircraft}
                </p>

                {/* Achievement banner */}
                <div className="mt-5 rounded-lg bg-[#f8f8f6] px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9a84c]">
                    Achievement
                  </div>
                  <div className="mt-1 text-[13px] font-medium leading-snug text-[#111111]">
                    {cs.achievement}
                  </div>
                </div>

                <p className="mt-5 flex-1 text-[13px] leading-[1.8] text-[#555555]">
                  {cs.description}
                </p>

                {/* Result footer */}
                <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                      Documented result
                    </div>
                    <div className="mt-0.5 font-serif text-[28px] leading-none text-[#c9a84c]">
                      {cs.result}
                    </div>
                  </div>
                  <CheckCircle2
                    className="h-5 w-5 text-[#c9a84c]/40 transition-colors group-hover:text-[#c9a84c]"
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06]">
        <motion.div
          ref={methodRef}
          variants={stagger}
          initial="hidden"
          animate={methodInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-12 md:grid-cols-12">
            <motion.div variants={fadeUp} className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                II · Methodology
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                How we{" "}
                <em className="display-serif-italic text-[#555555]">measure.</em>
              </h2>
              <p className="mt-5 text-[14px] leading-[1.85] text-[#555555]">
                Luminary&rsquo;s performance data is produced through a rigorous,
                instrument-driven measurement protocol. Results are not estimated
                or extrapolated — they are measured directly in the aircraft cabin
                under controlled in-flight conditions.
              </p>
              <Link
                href="/blog"
                className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-[#c9a84c] transition-opacity hover:opacity-80"
              >
                Read our acoustic engineering articles
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="md:col-span-7">
              <div className="grid gap-4">
                {[
                  {
                    step: "01",
                    title: "dB SIL Scale",
                    description:
                      "All noise measurements use the Sound Intensity Level (dB SIL) scale — the industry standard for cabin acoustic characterisation. SIL measurements capture the true acoustic energy in the cabin, independent of the limitations of simple SPL measurements.",
                  },
                  {
                    step: "02",
                    title: "Calibrated Acoustic Instrumentation",
                    description:
                      "Measurements are taken using calibrated precision instrumentation at defined cabin positions. Equipment is calibrated to traceable national standards before every measurement campaign.",
                  },
                  {
                    step: "03",
                    title: "Pre- and Post-Installation Comparison",
                    description:
                      "Baseline measurements are taken prior to any insulation work under identical flight conditions. Post-installation measurements replicate those conditions exactly, enabling a direct and unambiguous comparison.",
                  },
                  {
                    step: "04",
                    title: "Full Documentation",
                    description:
                      "All measurement data — raw readings, instrumentation calibration records, and analysis — is archived and available to clients. Results are traceable, reproducible, and independently verifiable.",
                  },
                ].map((m) => (
                  <motion.div
                    key={m.step}
                    variants={fadeUp}
                    className="flex gap-5 rounded-xl border border-black/[0.08] bg-white p-6"
                  >
                    <div className="shrink-0">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                        {m.step}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                        {m.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-[1.75] text-[#555555]">
                        {m.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
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
            What can we achieve for your aircraft
            <span className="h-px w-8 bg-[#c9a84c]/50" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-[#111111]">
            Your aircraft.
            <br />
            <em className="display-serif-italic text-[#555555]">Your result.</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-[#555555]"
          >
            Every aircraft is different. We begin every project with a thorough acoustic
            survey to understand exactly what is achievable — and we commit to a target
            before any installation work begins.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Request an acoustic consultation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[#111111] transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              Explore cabin systems
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
