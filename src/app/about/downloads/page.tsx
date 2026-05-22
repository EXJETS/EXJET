"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Download, ArrowRight, Mail, FileText, Shield } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

const brochures = [
  {
    title: "Luminary Air Group Overview Brochure",
    desc: "Company capabilities, certifications, and programme overview",
  },
  {
    title: "Cabin Comfort Systems Brochure",
    desc: "Acoustic insulation engineering, STC portfolio and product details",
  },
  {
    title: "ADMI Mission Interiors Brochure",
    desc: "Advanced Design & Manufacturing Integration platform documentation",
  },
  {
    title: "Luminary Interiors Brochure",
    desc: "VIP Interiors — cabinetry fabrication, completions and upholstery",
  },
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
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36">
          <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
            <span className="h-px w-8 bg-[var(--color-gold)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
              Downloads &amp; STCs
            </span>
          </motion.div>

          <div className="max-w-4xl">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Supplemental Type Certificates
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                &amp; Documentation
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Luminary Air Group holds FAA approval across a broad portfolio of aircraft
              types. Browse our STC registry, download product brochures, and review
              qualification documentation for your aircraft programme.
            </motion.p>
          </div>

          {/* PMA Badge */}
          <motion.div variants={fadeUp} className="mt-10">
            <div className="inline-flex items-center gap-4 rounded-2xl border border-[var(--color-gold)]/40 bg-[rgba(201,168,76,0.05)] px-7 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-gold)]/30 bg-white">
                <Shield className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">
                  FAA Parts Manufacturer Approval
                </p>
                <p className="font-serif text-[20px] leading-tight text-[var(--color-gold)]">
                  PMA License PQ10024NE
                </p>
              </div>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* ── BROCHURE DOWNLOADS ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                I · Product Brochures
              </span>
            </div>
            <h2 className="display-serif-md text-[#111111]">
              Documentation
              <br />
              <em className="display-serif-italic text-[#555555]">available on request.</em>
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {brochures.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_24px_-6px_rgba(201,168,76,0.10)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                  <Download className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] leading-[1.6] text-[#111111]">
                  {b.title}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.75] text-[#555555]">
                  {b.desc}
                </p>
                <div className="mt-5 border-t border-black/[0.06] pt-4">
                  <a
                    href="mailto:info@luminary.aero"
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-colors hover:text-[#b8963e]"
                  >
                    <Mail className="h-3 w-3" strokeWidth={1.5} />
                    info@luminary.aero
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── INSULATION STCs TABLE ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                II · Cabin Comfort Systems
              </span>
            </div>
            <h2 className="display-serif-md text-[#111111]">
              Insulation STC
              <br />
              <em className="display-serif-italic text-[#555555]">Registry</em>
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.8] text-[#555555]">
              FAA Supplemental Type Certificates held by Luminary Air Group for thermal
              and acoustic insulation systems across the following aircraft types.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
          >
            {/* Table header */}
            <div className="grid grid-cols-2 bg-[var(--color-gold)] px-6 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
                Aircraft Type
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
                STC Number
              </span>
            </div>
            {/* Table rows */}
            {insulationStcs.map((row, i) => (
              <div
                key={row.stc}
                className={`grid grid-cols-2 border-t border-black/[0.06] px-6 py-4 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#f8f8f6]"
                }`}
              >
                <span className="text-[14px] text-[#111111]">{row.aircraft}</span>
                <span className="font-mono text-[13px] text-[var(--color-gold)]">
                  {row.stc}
                </span>
              </div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── ADMI STCs TABLE ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                III · ADMI Special Mission Interiors
              </span>
            </div>
            <h2 className="display-serif-md text-[#111111]">
              Mission Interior
              <br />
              <em className="display-serif-italic text-[#555555]">STCs</em>
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
          >
            <div className="grid grid-cols-2 bg-[var(--color-gold)] px-6 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
                Aircraft Type
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
                STC Number
              </span>
            </div>
            {admiStcs.map((row, i) => (
              <div
                key={`${row.stc}-${i}`}
                className={`grid grid-cols-2 border-t border-black/[0.06] px-6 py-4 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#f8f8f6]"
                }`}
              >
                <span className="text-[14px] text-[#111111]">{row.aircraft}</span>
                <span className="font-mono text-[13px] text-[var(--color-gold)]">
                  {row.stc}
                </span>
              </div>
            ))}
          </motion.div>

          {/* PMA credential */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-center gap-5 rounded-2xl border border-[var(--color-gold)]/40 bg-[rgba(201,168,76,0.05)] px-8 py-6"
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-gold)]/30 bg-white">
              <Shield className="h-6 w-6 text-[var(--color-gold)]" strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">
                FAA Parts Manufacturer Approval License
              </p>
              <p className="mt-1 font-serif text-[22px] text-[var(--color-gold)]">
                PQ10024NE
              </p>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* ── FORMS SECTION ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                IV · Programme Forms
              </span>
            </div>
            <h2 className="display-serif-md text-[#111111]">
              Terms &amp;
              <br />
              <em className="display-serif-italic text-[#555555]">Quality Codes</em>
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: "Customer Terms and Conditions",
                desc: "Standard customer agreement for Luminary Air Group programmes, parts orders, and services.",
              },
              {
                title: "Supplier Quality Codes",
                desc: "Quality requirements and codes applicable to Luminary supplier purchase orders.",
              },
            ].map((form) => (
              <motion.div
                key={form.title}
                variants={fadeUp}
                className="flex items-start gap-5 rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)]"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                  <FileText className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                    {form.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.7] text-[#555555]">
                    {form.desc}
                  </p>
                  <a
                    href="mailto:info@luminary.aero"
                    className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] hover:underline"
                  >
                    Available on request
                    <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-[#111111] py-24">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05),transparent_70%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
          >
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
            Luminary Air Group
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
          </motion.span>

          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            Need documentation for
            <br />
            <em className="display-serif-italic text-[var(--color-gold)]">
              your aircraft?
            </em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70"
          >
            Our team will identify applicable STCs, pull relevant data sheets, and confirm
            certification status for your specific airframe — typically within one business day.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Request Documentation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:border-white/50"
            >
              About Luminary
            </Link>
          </motion.div>
        </Section>
      </section>
    </>
  );
}
