"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Crown, Shield, Settings2, Plane, ArrowRight } from "lucide-react";

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
    icon: Crown,
    title: "VIP & Head of State",
    description:
      "VVIP quality upholstery for the most demanding completions. From single-seat refurbishment to full cabin re-upholstery, Flight Interiors delivers the finish and specification quality required for head-of-state and ultra-high-net-worth private aircraft.",
  },
  {
    icon: Shield,
    title: "Military & Tactical",
    description:
      "Mission-grade materials and construction for operational aircraft. Military upholstery work meets the durability requirements of high-tempo operations while maintaining compliance with manufacturer specifications and applicable airworthiness standards.",
  },
  {
    icon: Settings2,
    title: "Commercial & Charter",
    description:
      "Volume refurbishment for commercial and charter fleet operators. Flight Interiors' in-house production capability supports multi-aircraft programmes with consistent quality, repeatable results, and documented compliance across an entire fleet.",
  },
  {
    icon: Plane,
    title: "Vintage & Classic",
    description:
      "Restoration-quality work for vintage and classic aircraft. Flight Interiors has deep experience sourcing period-appropriate materials and applying restoration standards that honour the original design intent while meeting current airworthiness requirements.",
  },
];

export default function UpholsteryPage() {
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
                Flight Interiors · Upholstery
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-5xl text-[#111111]">
              High Quality Aircraft
              <br />
              <em className="display-serif-italic text-[#888888]">Seating &amp; Upholstery</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              Luminary Air Group&rsquo;s Flight Interiors brand offers high quality upholstery and
              refurbishing services for aircraft seating of all types — VIP and head of state aircraft,
              business, military and tactical aircraft, commercial, and vintage aircraft.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
              >
                Discuss Your Project
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── VALUE PROPOSITION ── */}
      <section className="border-y border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section>
            <div className="grid gap-10 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Entirely In-House",
                  description:
                    "All upholstery work is performed in-house. Flight Interiors controls the entire process from material selection through to final delivery — no outsourcing, no quality gaps.",
                },
                {
                  number: "02",
                  title: "Aviation Experience",
                  description:
                    "In-depth experience across the aviation and aerospace industries ensures every material choice, construction method, and finish meets the unique requirements of an airborne environment.",
                },
                {
                  number: "03",
                  title: "Certified Compliance",
                  description:
                    "Strict adherence to manufacturer specifications and industry certifications. Flight Interiors works within the approved data framework to ensure every completed seat is airworthy.",
                },
              ].map((item) => (
                <motion.div
                  key={item.number}
                  variants={fadeUp}
                  className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
                    {item.number}
                  </span>
                  <h3 className="mt-4 font-serif text-[22px] leading-tight text-[#111111]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-[1.8] text-[#555555]">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Upholstery Capability
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
                Every Aircraft Type.
                <br />
                <em className="display-serif-italic text-[#888888]">Every Seat Configuration.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Flight Interiors serves the full spectrum of aviation — from ultra-high-net-worth private
                clients through to government and military operators requiring mission-grade materials.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    variants={fadeUp}
                    className="flex flex-col rounded-2xl border border-black/[0.08] bg-[var(--color-surface)] p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]"
                  >
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-white">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">
                      {cap.title}
                    </h3>
                    <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-[#555555]">
                      {cap.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── KEY DIFFERENTIATOR ── */}
      <section className="border-t border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.blockquote
              variants={fadeUp}
              className="font-serif text-[clamp(1.4rem,2.8vw,2.1rem)] leading-[1.5] text-[#111111]"
            >
              &ldquo;All upholstery work is performed in-house. We control quality from material
              selection to final delivery.&rdquo;
            </motion.blockquote>
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-50" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
                Luminary Air Group · Flight Interiors Brand
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
                Flight Interiors · Contact
              </span>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">
              Your Aircraft.
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">Our Craftsmanship.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/50">
              Submit your aircraft type, seat count, and scope of work. Flight Interiors will respond
              with a proposal addressing materials, timeline, and certification compliance — before any
              commitment is required.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
              >
                Get a Quote
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
