"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import insulationProducts from "@/data/insulation-products.json";

void insulationProducts;

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

const products = [
  {
    title: "Broadband Blankets",
    description:
      "Primary insulation systems using mass-loaded vinyl and acoustic fibre combinations. Engineered per airframe-specific acoustic survey data.",
  },
  {
    title: "Septum Layer Systems",
    description:
      "Barrier-septum constructions for targeted frequency attenuation. Specified where standard broadband blankets require supplemental treatment.",
  },
  {
    title: "Trim Panel Backing",
    description:
      "Secondary insulation bonded to trim panel reverse faces. Provides additional mass-law attenuation without modifying primary structure.",
  },
  {
    title: "Specialty Materials",
    description:
      "Fire-blocking, EMI-shielding, and vibration-damping materials for platforms with non-standard operational requirements.",
  },
];

export default function CabinComfortSystemsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1800&q=85&fit=crop"
          alt="Aircraft cabin interior"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 lg:pb-16 lg:pt-36">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Cabin Comfort Systems
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Acoustic Engineering
              <br />
              <em className="display-serif-italic text-white/40">Precision-manufactured. Certified.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[15px] leading-[1.9] text-white/65">
              Luminary designs and manufactures aircraft insulation systems from acoustic survey to certified
              installation — custom-built for your airframe under our own Part 21 approval.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9">
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

      {/* ── KPI STRIP ── */}
      <section className="border-b border-black/[0.06] bg-[#f4f3f0]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Section className="grid grid-cols-2 divide-x divide-black/[0.06] sm:grid-cols-4">
            {[
              { value: "46.7 dB SIL", label: "World Record" },
              { value: "100+", label: "STCs Held" },
              { value: "25 yr", label: "In Service" },
              { value: "Part 21", label: "Certified Manufacturer" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="flex flex-col gap-2 px-6 py-10 sm:px-8">
                <span className="font-serif leading-none text-[#111111]" style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)" }}>
                  {s.value}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <motion.div variants={fadeUp} className="mb-12">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">Process</span>
              <h2 className="display-serif-md mt-4 text-white">From survey to certification</h2>
            </motion.div>
            <motion.div variants={stagger} className="grid gap-0 sm:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Acoustic Survey",
                  description: "On-aircraft acoustic measurement to establish baseline dB SIL levels and identify attenuation targets.",
                },
                {
                  number: "02",
                  title: "Engineering & Fabrication",
                  description: "Insulation blanket systems designed to specification and manufactured in-house under Part 21 quality control.",
                },
                {
                  number: "03",
                  title: "Certification & Delivery",
                  description: "A Part 21 data package with pre/post installation measurements is issued with every project.",
                },
              ].map((step) => (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  className="border-t border-white/[0.08] py-10 sm:border-t-0 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
                >
                  <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)] opacity-80">
                    {step.number}
                  </span>
                  <h3 className="mt-5 font-mono text-[12px] uppercase tracking-[0.22em] text-white">{step.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.85] text-white/65">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── PRODUCT CATALOG ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <motion.div variants={fadeUp}>
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Products</span>
                <h2 className="display-serif-md mt-3 text-[#111111]">Insulation Systems</h2>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link
                  href="/cabin-comfort-systems/insulation-products"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3"
                >
                  View Full Catalog <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </motion.div>
            </div>

            <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
              {products.map((product) => (
                <motion.div
                  key={product.title}
                  variants={fadeUp}
                  className="grid gap-6 py-9 sm:grid-cols-[220px_1fr] sm:gap-12"
                >
                  <h3 className="font-serif text-[#111111]" style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)" }}>
                    {product.title}
                  </h3>
                  <p className="text-[14px] leading-[1.9] text-[#555555]">{product.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Section className="flex flex-col items-start">
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">
              Start your acoustic programme
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-lg text-[15px] leading-[1.85] text-white/65">
              Provide your aircraft type and noise objectives. We will return a scoped proposal with projected
              acoustic result, programme timeline, and Part 21 certification path.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9">
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
