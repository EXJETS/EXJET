"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plane,
  Activity,
  Radio,
  Search,
  Layers,
  FlaskConical,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";

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

const methods = [
  {
    number: "01",
    Icon: Plane,
    title: "Standard ISO In-Flight Testing",
    standard: "ISO 5129:2001",
    description:
      "The internationally recognised baseline for aircraft cabin acoustic measurement. Third-octave band SPL analysis reported A-weighted, Linear, SIL3, and SIL4. Measurements taken at defined cabin positions during stabilised cruise conditions. This is the benchmark every Luminary project is measured against — and the number that appears on the performance certificate.",
    tags: ["ISO 5129:2001", "Third-Octave Band", "A-Weighted", "SIL3 / SIL4"],
  },
  {
    number: "02",
    Icon: Activity,
    title: "Fast Fourier Transform (FFT) Analysis",
    standard: "Narrow-Band Spectral",
    description:
      "Where ISO 5129 averages across octave bands, FFT resolves the spectrum into narrow frequency bins — revealing tonal noise sources that broad-band measurements obscure. Engine blade passage frequencies, hydraulic pump harmonics, ECS resonance peaks: each is identified by frequency, amplitude, and phase. This is the analysis that tells you precisely which source to target.",
    tags: ["Tonal Identification", "Blade Passage Frequency", "Pump Harmonics", "Engine Noise"],
  },
  {
    number: "03",
    Icon: Radio,
    title: "Vibration Analysis",
    standard: "Structure-Borne vs Airborne",
    description:
      "Not all cabin noise travels through air. Structure-borne noise — vibration transmitted through the airframe — is a distinct and often dominant contributor that standard SPL measurements cannot separate from airborne sources. Vibration analysis quantifies each transmission path independently, enabling precise isolation mount specification for monuments, floor panels, and ceiling assemblies.",
    tags: ["Structure-Borne", "Airborne Separation", "Isolation Mounts", "Transmission Paths"],
  },
  {
    number: "04",
    Icon: Search,
    title: "Ground Testing SPL",
    standard: "Source Isolation",
    description:
      "In-flight testing captures the composite noise environment. Ground testing with engines at power allows individual noise sources to be isolated — ECS compressors, hydraulic pumps, APU contribution, engine ground run levels. Acoustical imaging using the 384-microphone array is fully capable in ground configuration, enabling source-specific attenuation strategies without flight time.",
    tags: ["ECS Isolation", "APU Contribution", "Hydraulic Pumps", "Acoustical Imaging"],
  },
  {
    number: "05",
    Icon: Layers,
    title: "Sound Absorption in Cabin",
    standard: "Reverberation Testing",
    description:
      "One-third-octave reverberation time testing measures how the cabin interior absorbs sound energy across the frequency spectrum. Results vary significantly with cabin configuration — number of seats, soft furnishings, carpet area, sidewall treatment. This data is used to tune interior material selection and validate predicted absorption coefficients against measured results.",
    tags: ["Reverberation Time", "One-Third-Octave", "Material Absorption", "Cabin Configuration"],
  },
  {
    number: "06",
    Icon: FlaskConical,
    title: "Bench Testing",
    standard: "ASTM 2611-09",
    description:
      "Material selection does not wait for aircraft time. ASTM 2611-09 transmission loss and sound absorption testing evaluates insulation materials at bench level before any assembly is specified for aircraft application. Transmission Loss, Noise Reduction Coefficient, and Sound Absorption Average are measured across frequency, providing a validated materials database for Luminary engineering design.",
    tags: ["ASTM 2611-09", "Transmission Loss", "NRC", "Materials Validation"],
  },
];

export default function AcousticTestingPage() {
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
                Acoustic Testing Services
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              A Comprehensive Approach
              <br />
              <em className="display-serif-italic text-[#888888]">to the Science of Sound.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              Gone are the days of relying on a master acoustician&apos;s ear alone. Standard ISO 5129:2001 testing is
              the baseline — but Luminary supplements it with a circular carbon fibre disc housing an array of up to
              384 microphones, delivering full 360-degree acoustical imaging of your cabin with no assumptions about
              where the noise is entering or how it is propagating.
            </motion.p>

            {/* KPI strip */}
            <motion.div
              variants={fadeUp}
              className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.08] sm:grid-cols-4"
            >
              {[
                { value: "384", label: "Microphone Array" },
                { value: "360°", label: "Acoustical Imaging" },
                { value: "ISO 5129", label: "Measurement Standard" },
                { value: "6 Methods", label: "Testing Protocols" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2 bg-white px-8 py-6">
                  <span className="font-serif text-[32px] leading-none text-[#111111]">{s.value}</span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="border-t border-black/[0.08] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section className="mx-auto max-w-3xl text-center">
            <motion.p variants={fadeUp} className="text-[16px] leading-[1.9] text-[#555555]">
              The 384-microphone array is not a marketing exercise — it changes what is knowable. Where a conventional
              test with four fixed microphones produces four data points and an average, the array produces a complete
              spatial map of the sound field. Dominant noise ingress points are visible immediately. Structural
              transmission paths that would require iterative guesswork are identified in a single test. The result
              is a materials and installation specification built on data, not convention.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── 6 TESTING METHODS ── */}
      <section className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Testing Protocols
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
                Six methods —
                <br />
                <em className="display-serif-italic text-[#888888]">no assumptions.</em>
              </motion.h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {methods.map((method) => (
                <motion.div
                  key={method.number}
                  variants={fadeUp}
                  className="flex flex-col rounded-2xl border border-black/[0.08] bg-[var(--color-surface)] p-8"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <method.Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-[11px] text-[var(--color-gold)]">{method.number}</span>
                  </div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                    {method.standard}
                  </p>
                  <h3 className="mb-4 font-serif text-[18px] font-semibold text-[#111111]">{method.title}</h3>
                  <p className="mb-6 flex-1 text-[14px] leading-[1.8] text-[#555555]">{method.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {method.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-black/[0.08] bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#888888]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── CONTACT BAR ── */}
      <section className="border-t border-black/[0.08] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <Section>
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center gap-6 rounded-2xl border border-black/[0.08] bg-white px-8 py-10 text-center"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Schedule Testing
                </span>
                <span className="h-px w-8 bg-[var(--color-gold)]" />
              </div>
              <p className="max-w-xl text-[16px] leading-[1.8] text-[#555555]">
                To schedule your test flight — or to discuss whether ground testing is more appropriate for your
                aircraft — call or email the Luminary acoustic team directly.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="tel:18886242400"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  1-888-624-2400
                </a>
                <a
                  href="mailto:info@luminary.aero"
                  className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                  info@luminary.aero
                </a>
              </div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PERFORMANCE RESULTS CTA ── */}
      <section className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Sample Results
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
              See what the testing
              <br />
              <em className="display-serif-italic text-[#888888]">actually achieves.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
              Luminary&apos;s performance history includes the world-record 46.7 dB SIL Boeing Business Jet and
              multiple below-production-standard completions across large-cabin and wide-body platforms.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link
                href="/performance-history"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
              >
                View Performance History
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>
    </main>
  );
}
