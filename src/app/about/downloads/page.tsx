"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

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

const brochures = [
  { title: "Luminary Air Group Overview Brochure", desc: "Company capabilities, certifications, and programme overview" },
  { title: "Cabin Comfort Systems Brochure", desc: "Acoustic insulation engineering, STC portfolio and product details" },
  { title: "ADMI Mission Interiors Brochure", desc: "Advanced Design & Manufacturing Integration platform documentation" },
  { title: "Luminary Interiors Brochure", desc: "VIP Interiors — cabinetry fabrication, completions and upholstery" },
];

const insulationStcs = [
  { aircraft: "Airbus A-340", stc: "ST02324LA" },
  { aircraft: "Beechcraft V-35", stc: "SA00352LA" },
  { aircraft: "Boeing 727-200", stc: "ST01580LA" },
  { aircraft: "Boeing 737", stc: "ST00933LA" },
  { aircraft: "Boeing 747-200", stc: "ST01666LA" },
  { aircraft: "Boeing 747SP", stc: "ST01544LA" },
  { aircraft: "Bombardier 600, 601, 604", stc: "ST01382LA" },
  { aircraft: "Cessna Citation 500, 560", stc: "ST01286LA" },
  { aircraft: "Dassault Falcon 50", stc: "ST0101387LA" },
  { aircraft: "Gulfstream 200", stc: "ST01419LA" },
  { aircraft: "Gulfstream G-1159", stc: "ST01319LA" },
  { aircraft: "Hawker XP 800", stc: "ST01381LA" },
  { aircraft: "Pilatus PC-12", stc: "SA01828LA" },
  { aircraft: "Raytheon 390 Premier", stc: "A00010WI" },
  { aircraft: "Raytheon MU-300, 400, 400A, 400T", stc: "ST01265LA" },
  { aircraft: "Beechcraft · Cessna · Piper · Mooney", stc: "SA00063LA" },
];

const admiStcs = [
  { aircraft: "Hawker Beechcraft King Air B300", stc: "SA00087MC" },
  { aircraft: "Hawker Beechcraft King Air B300", stc: "SA00089MC" },
];

export default function DownloadsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1800&q=85&fit=crop"
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
                Downloads &amp; STCs
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Supplemental Type Certificates
              <br />
              <em className="display-serif-italic text-white/40">&amp; Documentation.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[15px] leading-[1.9] text-white/65">
              Luminary holds FAA approval across a broad portfolio of aircraft types.
              Browse our STC registry and review qualification documentation for your programme.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex items-baseline gap-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">FAA PMA License</p>
                <p className="mt-1 font-serif leading-none text-[var(--color-gold)]" style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}>PQ10024NE</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">STCs Held</p>
                <p className="mt-1 font-serif leading-none text-[var(--color-gold)]" style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}>100+</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── BROCHURES ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <motion.div variants={fadeUp} className="mb-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">Product Brochures</span>
              <h2 className="display-serif-md mt-3 text-[#111111]">
                Documentation
                <br />
                <em className="display-serif-italic text-[#999999]">available on request.</em>
              </h2>
            </motion.div>
            <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
              {brochures.map((b) => (
                <motion.div key={b.title} variants={fadeUp} className="grid gap-4 py-7 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-12">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">{b.title}</p>
                    <p className="mt-1.5 text-[14px] leading-[1.8] text-[#555555]">{b.desc}</p>
                  </div>
                  <a href="mailto:info@luminary.aero" className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-colors hover:text-[var(--color-gold-deep)]">
                    <Mail className="h-3 w-3" strokeWidth={1.5} />
                    Request
                  </a>
                </motion.div>
              ))}
              <div className="border-b border-black/[0.07]" />
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── INSULATION STCs ── */}
      <section className="bg-[#f4f3f0]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <motion.div variants={fadeUp} className="mb-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">Cabin Comfort Systems</span>
              <h2 className="display-serif-md mt-3 text-[#111111]">Insulation STC Registry</h2>
              <p className="mt-4 max-w-xl text-[14px] leading-[1.8] text-[#555555]">
                FAA Supplemental Type Certificates held by Luminary Air Group for thermal and acoustic insulation systems.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="overflow-hidden border border-black/[0.07]">
              <div className="grid grid-cols-2 border-b border-black/[0.07] bg-[#111111] px-6 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">Aircraft Type</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">STC Number</span>
              </div>
              {insulationStcs.map((row) => (
                <div key={row.stc} className="grid grid-cols-2 border-b border-black/[0.05] px-6 py-4 last:border-0 odd:bg-white even:bg-[#f4f3f0]">
                  <span className="text-[14px] text-[#111111]">{row.aircraft}</span>
                  <span className="font-mono text-[13px] text-[var(--color-gold)]">{row.stc}</span>
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── ADMI STCs + FORMS ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <motion.div variants={fadeUp}>
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">ADMI Special Mission Interiors</span>
                <h2 className="display-serif-md mt-3 text-[#111111]">Mission Interior STCs</h2>
                <div className="mt-8 overflow-hidden border border-black/[0.07]">
                  <div className="grid grid-cols-2 border-b border-black/[0.07] bg-[#111111] px-6 py-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">Aircraft</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">STC</span>
                  </div>
                  {admiStcs.map((row, i) => (
                    <div key={`${row.stc}-${i}`} className="grid grid-cols-2 border-b border-black/[0.05] px-6 py-4 last:border-0 odd:bg-white even:bg-[#f4f3f0]">
                      <span className="text-[14px] text-[#111111]">{row.aircraft}</span>
                      <span className="font-mono text-[13px] text-[var(--color-gold)]">{row.stc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={stagger}>
                <motion.div variants={fadeUp}>
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">Programme Forms</span>
                  <h2 className="display-serif-md mt-3 text-[#111111]">Terms &amp; Quality Codes</h2>
                </motion.div>
                <motion.div variants={stagger} className="mt-8 divide-y divide-black/[0.07]">
                  {[
                    { title: "Customer Terms and Conditions", desc: "Standard customer agreement for Luminary Air Group programmes, parts orders, and services." },
                    { title: "Supplier Quality Codes", desc: "Quality requirements and codes applicable to Luminary supplier purchase orders." },
                  ].map((form) => (
                    <motion.div key={form.title} variants={fadeUp} className="py-7">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">{form.title}</p>
                      <p className="mt-2 text-[14px] leading-[1.8] text-[#555555]">{form.desc}</p>
                      <a href="mailto:info@luminary.aero" className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-colors hover:text-[var(--color-gold-deep)]">
                        Available on request <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                      </a>
                    </motion.div>
                  ))}
                  <div className="border-b border-black/[0.07]" />
                </motion.div>
              </motion.div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="border-t border-white/[0.04] bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Section className="flex flex-col items-start">
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">Need documentation for your aircraft?</motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-lg text-[15px] leading-[1.85] text-white/65">
              Our team will identify applicable STCs, pull relevant data sheets, and confirm
              certification status for your specific airframe — typically within one business day.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]">
                Request Documentation <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/50 hover:text-white">
                About Luminary
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>
    </>
  );
}
