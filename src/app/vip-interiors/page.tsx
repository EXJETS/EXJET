"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

const portfolio = [
  {
    aircraft: "Boeing BBJ",
    photoUrl: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1800&q=85&fit=crop",
    photoAlt: "Aircraft cabin interior",
    title: "World Record Acoustic Completion",
    description:
      "The only BBJ completion to achieve 46.7 dB SIL — the world record for cabin sound attenuation. Full Luminary acoustic insulation system, Part 21 certified data package issued.",
    year: "2019",
  },
  {
    aircraft: "Bombardier Challenger 604",
    photoUrl: "https://images.unsplash.com/photo-1569728723197-a2d6db1cb9a9?w=1800&q=85&fit=crop",
    photoAlt: "Aircraft exterior",
    title: "Green Aircraft Acoustic Completion",
    description:
      "Complete acoustic survey, custom insulation fabrication, and Part 21 certified installation for a green aircraft delivery. Post-installation dB SIL data issued to operator.",
    year: "2020",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Survey",
    description: "On-aircraft acoustic measurement establishing baseline dB SIL levels and structural transmission paths.",
  },
  {
    number: "02",
    title: "Design",
    description: "Airframe-specific multi-layer insulation system designed to target the dominant noise signatures.",
  },
  {
    number: "03",
    title: "Fabricate",
    description: "Insulation blanket systems manufactured in-house under Part 21 quality control to exact specification.",
  },
  {
    number: "04",
    title: "Certify",
    description: "Part 21 data package with pre/post installation measurements issued with every completed programme.",
  },
];

export default function VipInteriorsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "70vh" }}>
        <img
          src="https://images.unsplash.com/photo-1474302771737-d1729c1a2318?w=1800&q=85&fit=crop"
          alt="VIP aircraft interior"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-40 sm:px-8 lg:pb-28 lg:pt-52">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                VIP Completions
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Acoustic-first completions.
              <br />
              <em className="display-serif-italic text-white/40">Where performance is the brief.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[16px] leading-[1.9] text-white/55">
              Luminary approaches every VIP completion with acoustic performance as the primary engineering input
              — not an afterthought. The result is a cabin that performs to specification, documented and certified.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
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

      {/* ── PORTFOLIO ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <Section>
            <motion.h2 variants={fadeUp} className="display-serif-md mb-14 text-[#111111]">
              Completed programmes
            </motion.h2>

            <motion.div variants={stagger} className="flex flex-col gap-8">
              {portfolio.map((project) => (
                <motion.div
                  key={project.aircraft}
                  variants={fadeUp}
                  className="grid overflow-hidden rounded-2xl border border-black/[0.08] lg:grid-cols-[1fr_1.6fr]"
                >
                  {/* Photo */}
                  <div className="relative min-h-[260px] lg:min-h-[320px]">
                    <img
                      src={project.photoUrl}
                      alt={project.photoAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-6 left-7">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                        Completed {project.year}
                      </span>
                      <p className="mt-1 font-serif text-[1.25rem] text-white leading-snug">{project.aircraft}</p>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col justify-center bg-white px-10 py-12">
                    <h3 className="font-serif text-[clamp(1.3rem,2.2vw,1.75rem)] leading-tight text-[#111111]">
                      {project.title}
                    </h3>
                    <p className="mt-5 text-[15px] leading-[1.85] text-[#555555]">{project.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="bg-[#f4f3f0]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <Section>
            <motion.div variants={fadeUp} className="mb-14">
              <h2 className="display-serif-md text-[#111111]">How every completion is delivered</h2>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step) => (
                <motion.div key={step.number} variants={fadeUp} className="border-t border-black/[0.1] pt-8">
                  <span className="font-serif text-[clamp(3rem,6vw,4.5rem)] leading-none text-[var(--color-gold)] opacity-50">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-mono text-[12px] uppercase tracking-[0.22em] text-[#111111]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.85] text-[#555555]">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section className="flex flex-col items-start">
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">
              Commission a VIP completion
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
              Specify your aircraft type and target noise floor. Luminary will respond with a scoped proposal,
              projected dB SIL outcome, and programme timeline — before any commitment is required.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Request Quote <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
