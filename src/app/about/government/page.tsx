"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Users, Plane, Target, ArrowRight, Download, Mail } from "lucide-react";

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

const capabilities = [
  "Special Mission Interiors",
  "Aircraft Cabin Insulation Kits",
  "High Quality Upholstery & Seating",
  "Lightweight Seats & Foam Build-ups",
  "Flooring",
  "Cabinetry Fabrication & Finish",
  "Repairs & Modifications",
  "Green Aircraft Completion Builds",
];

const companyData = [
  { label: "Company Name", value: "Luminary Air Group, LLC" },
  { label: "Address", value: "18321 Parkway, Melfa, VA 23410" },
  { label: "Business Type", value: "Small Business" },
  { label: "DUNS Number", value: "080301755" },
  { label: "Cage Code", value: "7SCF2" },
  { label: "NAICS Codes", value: "336411, 336413, 811219, 811420, 336360, 488190" },
  { label: "FAA PMA License", value: "PQ10024NE" },
  { label: "GSA Contract (via Global Enterprise, Inc.)", value: "GS-07F-248BA" },
  { label: "Credit / Purchase Cards", value: "Accepted" },
];

const differentiators = [
  {
    icon: Shield,
    title: "Government-Responsive Seating",
    desc: "Long history designing and building seat components in direct response to government needs. Luminary designed seat cushions specifically for U.S. Army special mission use — engineering to operational specification, not commercial catalogue.",
  },
  {
    icon: Users,
    title: "Skilled Upholstery Staff",
    desc: "Highly skilled upholsterers with extensive industry experience, capable of executing exacting government finish standards on tight programme timelines.",
  },
  {
    icon: Plane,
    title: "Experienced Management",
    desc: "Management team includes a test pilot with over 10,000 flight hours across civilian and military fixed-wing aircraft — providing operational insight that informs every engineering decision.",
  },
  {
    icon: Target,
    title: "Mission-Specific Engineering",
    desc: "Custom engineering solutions for specialised government requirements. Every configuration is documented, certified, and designed for reconfigurability across multiple mission roles.",
  },
];

export default function GovernmentPage() {
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
              Government &amp; Defence
            </span>
          </motion.div>

          <div className="max-w-4xl">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Certified Solutions for
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                Government Operators
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              FAA authorised Part 21 manufacturer with extensive experience providing
              customised mission solutions to U.S. government agencies. Luminary operates
              under formal quality and configuration management disciplines suited to
              classified and sensitive programme requirements.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Request Programme Brief
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/about/downloads"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              Capability Statement
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ── CORE COMPETENCIES ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                I · Core Competencies
              </span>
            </div>
            <h2 className="display-serif-md text-[#111111]">
              Capabilities for
              <br />
              <em className="display-serif-italic text-[#555555]">mission operators.</em>
            </h2>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            {capabilities.map((cap) => (
              <motion.span
                key={cap}
                variants={fadeUp}
                className="inline-flex items-center rounded-full border border-[var(--color-gold)]/40 bg-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#111111] transition-all hover:border-[var(--color-gold)] hover:bg-[rgba(201,168,76,0.05)]"
              >
                {cap}
              </motion.span>
            ))}
          </div>
        </Section>
      </section>

      {/* ── COMPANY DATA ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                II · Company Data
              </span>
            </div>
            <h2 className="display-serif-md text-[#111111]">
              Registration &amp;
              <br />
              <em className="display-serif-italic text-[#555555]">qualification data.</em>
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
          >
            {companyData.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-2 border-t border-black/[0.06] px-6 py-4 first:border-t-0 sm:grid-cols-3 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#f8f8f6]"
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888] sm:col-span-1">
                  {row.label}
                </span>
                <span className="col-span-1 text-[14px] text-[#111111] sm:col-span-2">
                  {row.label === "FAA PMA License" ? (
                    <span className="font-serif text-[16px] text-[var(--color-gold)]">
                      {row.value}
                    </span>
                  ) : (
                    row.value
                  )}
                </span>
              </div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── DIFFERENTIATORS ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                III · Why Luminary
              </span>
            </div>
            <h2 className="display-serif-md text-[#111111]">
              What distinguishes us for
              <br />
              <em className="display-serif-italic text-[#555555]">government work.</em>
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((d) => (
              <motion.div
                key={d.title}
                variants={fadeUp}
                className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_24px_-6px_rgba(201,168,76,0.10)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                  <d.icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                  {d.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[#555555]">
                  {d.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── PAST PERFORMANCE ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div variants={fadeUp}>
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  IV · Past Performance
                </span>
              </div>
              <h2 className="display-serif-md text-[#111111]">
                Proven across government
                <br />
                <em className="display-serif-italic text-[#555555]">programmes.</em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.8] text-[#555555]">
                Luminary has delivered to various U.S. Government agencies across a
                range of mission interior and acoustic insulation programmes. Notable
                past performance includes acoustic treatment work on the E-4B Presidential
                Fleet conference room and KC-135 Boom Pod acoustic treatment — contact us
                for additional programme details.
              </p>
              <p className="mt-4 text-[14px] leading-[1.75] text-[#555555]">
                Full past performance history and references are available on request.
                Team members hold appropriate security clearances as required by programme
                classification level.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-colors hover:text-[#b8963e]"
                >
                  Request past performance references
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              {/* Capability Statement download card */}
              <div className="rounded-2xl border border-black/[0.08] bg-[#f8f8f6] p-8">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/[0.08] bg-white">
                  <Download className="h-6 w-6 text-[var(--color-gold)]" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#111111]">
                  Capability Statement
                </h3>
                <p className="mt-3 text-[14px] leading-[1.75] text-[#555555]">
                  Our formal government capability statement covers company data,
                  NAICS codes, core competencies, certifications, GSA contract details,
                  and past performance summary — formatted for programme offices and
                  contracting officers.
                </p>
                <a
                  href="mailto:info@luminary.aero?subject=Capability Statement Request"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
                >
                  Request Capability Statement
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              </div>

              {/* Security note */}
              <div className="mt-5 rounded-2xl border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.05)] px-7 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  Security Clearances
                </p>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#555555]">
                  Selected Luminary team members hold appropriate security clearances
                  as required by programme classification. Clearance specifics are
                  discussed under NDA or through formal contracting channels.
                </p>
              </div>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── DARK CTA ── */}
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
            Government &amp; Defence
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
          </motion.span>

          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            Start a government
            <br />
            <em className="display-serif-italic text-[var(--color-gold)]">
              programme brief.
            </em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70"
          >
            Our engineering team is available to discuss your mission requirements,
            platform type, and applicable certification pathway. Responses within
            one business day.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Contact for Programme Brief
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/special-mission-interiors"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:border-white/50"
            >
              Special Mission Interiors
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </Section>
      </section>
    </>
  );
}
