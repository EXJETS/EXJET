"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Volume2, BarChart3, Mic, FileCheck2, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

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

const noiseScale = [
  { level: "45 dB SIL", label: "Very Quiet", description: "Normal conversation is effortless. A library is noisier.", color: "bg-emerald-500" },
  { level: "55 dB SIL", label: "Comfortable", description: "Typical business jet cabin at cruise — speech clear, no raised voice required.", color: "bg-yellow-400" },
  { level: "60 dB SIL", label: "Acceptable", description: "Forced but intelligible. You are aware you are working against the noise.", color: "bg-orange-400" },
  { level: "75 dB SIL", label: "Unintelligible", description: "Speech is no longer reliably understood. Communication requires shouting or headsets.", color: "bg-red-500" },
];

const contextTable = [
  { platform: "Small single-engine piston", typical: "90–100 dBA", silEquiv: "~80 dB SIL", note: "Noise is the defining cabin characteristic" },
  { platform: "Twin turboprop (unpressurised)", typical: "85–95 dBA", silEquiv: "~75 dB SIL", note: "Headsets are standard equipment" },
  { platform: "Commercial airliner (cruise)", typical: "65–80 dBA", silEquiv: "~60 dB SIL", note: "Airline-standard cabin treatment" },
  { platform: "Business jet (factory delivery)", typical: "70–80 dBA", silEquiv: "55–60 dB SIL", note: "Varies significantly by type and age" },
  { platform: "Luminary BBJ (world record)", typical: "~56 dBA", silEquiv: "46.7 dB SIL", note: "Quietest independently measured BBJ cabin" },
];

const funFacts = [
  {
    headline: "Microsoft's anechoic chamber registers −20 dBA.",
    body: "That is not a typo. The room in Redmond absorbs so much sound that the residual hiss of your own blood moving becomes audible. It holds the Guinness World Record for quietest place. Nobody has stayed inside longer than 45 minutes without requesting to leave.",
  },
  {
    headline: "The Orfield Labs 45-minute rule.",
    body: "Orfield Laboratories in Minneapolis operates one of the world's quietest rooms (-9.4 dBA). The longest anyone has voluntarily remained inside is 45 minutes — at which point the brain, deprived of ambient input, begins generating its own noise. Hallucinations are reported. Aircraft cabin acoustics are a long way from this problem.",
  },
  {
    headline: "Zero decibels is not silence.",
    body: "0 dB SPL is the threshold of human hearing — approximately the sound of a mosquito hovering 10 feet away in a perfectly quiet room. Negative decibel readings in anechoic chambers mean the room itself is quieter than the internationally agreed threshold. Aircraft cabins are not anechoic chambers, and the goal is never silence — it is intelligibility.",
  },
];

export default function AircraftInsulationBasicsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-50" />
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-20 sm:px-8 lg:pt-44 lg:pb-28">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Acoustic Fundamentals
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              Understanding Aircraft
              <br />
              <em className="display-serif-italic text-[#888888]">Cabin Noise.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              Before specifying a single gram of insulation material, Luminary engineers need to understand what the
              numbers mean — and so should you. Here is everything relevant about aircraft cabin acoustics, from the
              physics of decibels to the metrics that actually determine whether a cabin is comfortable.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── SECTION 1: dBA vs dB SIL ── */}
      <section className="border-t border-black/[0.08] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 lg:items-start">
            <Section>
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  The Metrics
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
                dBA vs dB SIL —
                <br />
                <em className="display-serif-italic text-[#888888]">why both matter.</em>
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-6 space-y-5 text-[15px] leading-[1.8] text-[#555555]">
                <p>
                  <strong className="font-semibold text-[#111111]">A-weighted decibels (dBA)</strong> apply a
                  frequency-weighting curve to the raw sound pressure level that approximates the human ear&apos;s
                  sensitivity response. Low frequencies (below 500 Hz) and very high frequencies are de-emphasised
                  relative to the mid-range, which is where human hearing is most sensitive. The result is a single
                  number that correlates reasonably well with perceived loudness.
                </p>
                <p>
                  <strong className="font-semibold text-[#111111]">dB SIL (Speech Interference Level)</strong> is a
                  more targeted metric. It averages the sound pressure levels at four octave bands — 500, 1000, 2000,
                  and 4000 Hz — specifically because those are the frequencies most critical to speech intelligibility.
                  A low dB SIL means communication in the cabin is easy. A high dB SIL means passengers are fighting
                  the noise to be understood.
                </p>
                <p>
                  Luminary uses both metrics. dBA gives an overall picture. dB SIL tells you what the cabin actually
                  feels like to use. The world-record 46.7 dB SIL figure achieved in the Luminary BBJ project is a
                  speech intelligibility measure — not just a loudness claim.
                </p>
              </motion.div>
            </Section>

            {/* Icon card column */}
            <Section className="flex flex-col gap-5">
              {[
                {
                  Icon: Volume2,
                  title: "dBA — Perceived Loudness",
                  body: "A-weighted SPL. Calibrated to the human ear's frequency response curve. Good for comparing overall cabin environments.",
                },
                {
                  Icon: BarChart3,
                  title: "dB SIL — Speech Intelligibility",
                  body: "Average SPL at 500, 1 000, 2 000, and 4 000 Hz. Measures how much background noise interferes with conversation.",
                },
                {
                  Icon: Mic,
                  title: "The Range That Matters",
                  body: "45 dB SIL: easy conversation at any volume. 60 dB SIL: speech is forced but intelligible. 75 dB SIL: communication breaks down.",
                },
              ].map(({ Icon, title, body }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="flex gap-5 rounded-2xl border border-black/[0.08] bg-white p-6"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                    <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="mb-1.5 font-semibold text-[14px] text-[#111111]">{title}</p>
                    <p className="text-[14px] leading-[1.7] text-[#555555]">{body}</p>
                  </div>
                </motion.div>
              ))}
            </Section>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Context scale ── */}
      <section className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-14 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Reference Numbers
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
                What the numbers mean
                <br />
                <em className="display-serif-italic text-[#888888]">in context.</em>
              </motion.h2>
            </div>

            {/* SIL scale */}
            <motion.div variants={fadeUp} className="mb-12 rounded-2xl border border-black/[0.08] overflow-hidden bg-white">
              <div className="border-b border-black/[0.08] bg-[var(--color-surface)] px-6 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">Speech Interference Level Scale</span>
              </div>
              <div className="divide-y divide-black/[0.04]">
                {noiseScale.map((item) => (
                  <div key={item.level} className="flex items-center gap-5 px-6 py-4">
                    <div className={`h-3 w-3 rounded-full shrink-0 ${item.color}`} />
                    <span className="font-mono text-[13px] text-[#111111] w-24 shrink-0">{item.level}</span>
                    <span className="font-semibold text-[13px] text-[#333333] w-28 shrink-0">{item.label}</span>
                    <span className="text-[13px] text-[#555555]">{item.description}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Context comparison table */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-black/[0.08] overflow-hidden bg-white">
              <div className="border-b border-black/[0.08] bg-[var(--color-surface)] px-6 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">Comparative Noise Levels by Aircraft Type</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[var(--color-surface)]">
                    {["Platform", "Typical dBA", "Approx. SIL", "Notes"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contextTable.map((row, i) => (
                    <tr key={i} className="border-b border-black/[0.04] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                      <td className="px-6 py-3.5 text-[14px] font-medium text-[#111111]">{row.platform}</td>
                      <td className="px-6 py-3.5 font-mono text-[13px] text-[#555555]">{row.typical}</td>
                      <td className="px-6 py-3.5 font-mono text-[13px] text-[#555555]">{row.silEquiv}</td>
                      <td className="px-6 py-3.5 text-[13px] text-[#555555]">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── SECTION 3: Fun Facts ── */}
      <section className="border-t border-black/[0.08] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-14 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Acoustic Curiosities
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
                Fun facts —
                <br />
                <em className="display-serif-italic text-[#888888]">for the technically inclined.</em>
              </motion.h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {funFacts.map((fact, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="rounded-2xl border border-black/[0.08] bg-white p-8"
                >
                  <p className="mb-4 font-semibold text-[15px] text-[#111111] leading-[1.5]">{fact.headline}</p>
                  <p className="text-[14px] leading-[1.8] text-[#555555]">{fact.body}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── SECTION 4: How it's measured ── */}
      <section className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 lg:items-start">
            <Section>
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Measurement Methodology
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
                How cabin noise
                <br />
                <em className="display-serif-italic text-[#888888]">is measured.</em>
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-6 space-y-5 text-[15px] leading-[1.8] text-[#555555]">
                <p>
                  The baseline standard is <strong className="font-semibold text-[#111111]">ISO 5129:2001</strong> —
                  the internationally recognised procedure for measuring sound pressure levels in the cabins of
                  propeller-driven and jet-powered aircraft. It specifies measurement positions, operating conditions,
                  and reporting requirements. Luminary uses ISO 5129 as a floor, not a ceiling.
                </p>
                <p>
                  Where ISO 5129 measures at fixed microphone positions, Luminary supplements standard testing with
                  a circular carbon fibre disc housing an array of up to{" "}
                  <strong className="font-semibold text-[#111111]">384 microphones</strong>. This provides full
                  360-degree acoustical imaging of the cabin — no assumptions about where the noise is entering,
                  no averaging away inconvenient data.
                </p>
                <p>
                  Additional analysis layers include <strong className="font-semibold text-[#111111]">Fast Fourier
                  Transform (FFT)</strong> analysis to identify tonal components from engines and pumps,
                  vibration analysis to separate structure-borne from airborne transmission, and bench-level
                  material testing per ASTM 2611-09 before any product goes near an aircraft.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/cabin-comfort-systems/acoustic-testing"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
                >
                  View Our Testing Services
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </motion.div>
            </Section>

            <Section className="flex flex-col gap-5">
              {[
                {
                  Icon: FileCheck2,
                  title: "ISO 5129:2001",
                  body: "International standard for SPL measurement in aircraft cabins. Third-octave band analysis, A-weighted and linear, SIL3 and SIL4 reporting.",
                },
                {
                  Icon: BarChart3,
                  title: "384-Microphone Array",
                  body: "Circular carbon fibre disc with up to 384 microphones delivers full 360-degree acoustical imaging. Every noise source located and quantified.",
                },
                {
                  Icon: Mic,
                  title: "FFT & Vibration Analysis",
                  body: "Narrow-band FFT identifies tonal noise sources. Vibration analysis separates structure-borne from airborne transmission paths.",
                },
                {
                  Icon: Volume2,
                  title: "ASTM 2611-09 Bench Testing",
                  body: "Transmission loss and absorption measurements on material samples before aircraft application. No surprises at installation.",
                },
              ].map(({ Icon, title, body }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="flex gap-5 rounded-2xl border border-black/[0.08] bg-[var(--color-surface)] p-6"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                    <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="mb-1.5 font-semibold text-[14px] text-[#111111]">{title}</p>
                    <p className="text-[14px] leading-[1.7] text-[#555555]">{body}</p>
                  </div>
                </motion.div>
              ))}
            </Section>
          </div>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="bg-[#111111]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Acoustic Testing
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-white">
              Ready to benchmark
              <br />
              <em className="display-serif-italic text-white/50">your aircraft?</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[16px] leading-[1.8] text-white/60">
              The only way to know where your cabin stands — and what is achievable — is to measure it. Luminary
              acoustic testing provides a complete, independent baseline you can take to any completion centre
              or MRO.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-[#111111]"
              >
                Schedule a Test Flight
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/cabin-comfort-systems/acoustic-testing"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/80 transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                Testing Methodology
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>
    </main>
  );
}
