"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Mail, ArrowRight, ChevronRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

const pilatusParts = [
  { description: "Seat Cushion, Passenger Seat", pn: "0311.MC01.508-20000", uom: "Each" },
  { description: "Back Cushion, Passenger Seat", pn: "0311.MC01.508-20001", uom: "Each" },
  { description: "Headrest Cover, Passenger Seat", pn: "0311.MC01.508-20003", uom: "Each" },
  { description: "Pilot/Co-Pilot Back Cushion", pn: "0311.MC01.512-60000", uom: "Each" },
  { description: "Pilot/Co-Pilot Back Cushion", pn: "0311.MC01.512-60001", uom: "Each" },
  { description: "Seat Bottom Cushion (Foam Build-up)", pn: "0311.MC01.513-10002", uom: "Each" },
  { description: "Window Surround", pn: "0311.MC01.510-60003-1", uom: "Each" },
];

const kingAirParts = [
  { description: "Window Plug, Cargo", pn: "0212.MC01.601-40024", uom: "Each" },
  { description: "Window Plug, Main Cabin", pn: "0212.MC01.601-30029", uom: "Each" },
  { description: "ADMI Floorboards", pn: "0212.FD01.605-500XX", uom: "Each" },
  { description: "Lightweight King Air Seats", pn: "Various", uom: "Each" },
];

function PartsTable({
  title,
  aircraft,
  parts,
}: {
  title: string;
  aircraft: string;
  parts: { description: string; pn: string; uom: string }[];
}) {
  return (
    <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
      <div className="border-b border-black/[0.06] px-8 py-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
          {title}
        </p>
        <h3 className="mt-1 font-serif text-[24px] leading-tight text-[#111111]">{aircraft}</h3>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-black/[0.06] bg-[var(--color-surface)] px-8 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">Description</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">P/N</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">UOM</span>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-black/[0.04]">
        {parts.map((part, i) => (
          <div
            key={`${part.pn}-${i}`}
            className="grid grid-cols-[1fr_auto_auto] gap-4 px-8 py-4 transition-colors hover:bg-[var(--color-surface)]"
          >
            <span className="text-[14px] leading-snug text-[#111111]">{part.description}</span>
            <span className="font-mono text-[12px] text-[#555555] tabular-nums">{part.pn}</span>
            <span className="font-mono text-[12px] text-[#888888]">{part.uom}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ReplacementPartsPage() {
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
                ADMI™ Replacement Parts
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              Genuine Parts for
              <br />
              <em className="display-serif-italic text-[#888888]">ADMI Mission Interiors</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-xl text-[17px] leading-[1.75] text-[#555555]">
              Genuine ADMI replacement parts for Pilatus PC-12, King Air, and other mission platform
              interiors. Contact us directly for ordering and availability.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── CONTACT ORDERING ── */}
      <section className="border-y border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <Section>
            <div className="grid gap-5 sm:grid-cols-2">
              <motion.a
                variants={fadeUp}
                href="tel:8886242400"
                className="group flex items-center gap-5 rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]"
              >
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[var(--color-surface)]">
                  <Phone className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                    Call for Parts
                  </p>
                  <p className="mt-1 font-serif text-[22px] leading-tight text-[#111111] transition-colors group-hover:text-[var(--color-gold)]">
                    888-624-2400
                  </p>
                </div>
              </motion.a>

              <motion.a
                variants={fadeUp}
                href="mailto:info@luminary.aero"
                className="group flex items-center gap-5 rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]"
              >
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[var(--color-surface)]">
                  <Mail className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                    Email for Parts
                  </p>
                  <p className="mt-1 font-serif text-[22px] leading-tight text-[#111111] transition-colors group-hover:text-[var(--color-gold)]">
                    info@luminary.aero
                  </p>
                </div>
              </motion.a>
            </div>
          </Section>
        </div>
      </section>

      {/* ── PARTS TABLES ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <motion.div variants={fadeUp} className="mb-14">
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Parts Catalogue
                </span>
              </div>
              <h2 className="display-serif-md text-[#111111]">
                Listed Replacement
                <br />
                <em className="display-serif-italic text-[#888888]">Parts by Platform</em>
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                The following tables list available ADMI replacement parts by platform. For parts not
                listed, please contact us directly — most components can be sourced or fabricated on request.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="space-y-8">
              <PartsTable
                title="Platform · Turboprop"
                aircraft="Pilatus PC-12"
                parts={pilatusParts}
              />
              <PartsTable
                title="Platform · Turboprop"
                aircraft="King Air"
                parts={kingAirParts}
              />
            </motion.div>

            {/* Note for unlisted parts */}
            <motion.div
              variants={fadeUp}
              className="mt-8 rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.05)] p-8"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                Parts Not Listed
              </p>
              <p className="mt-3 text-[14px] leading-[1.75] text-[#555555]">
                For other parts not listed in this catalogue, please contact Luminary directly at{" "}
                <a
                  href="tel:8886242400"
                  className="text-[var(--color-gold)] underline-offset-2 hover:underline"
                >
                  888-624-2400
                </a>{" "}
                or{" "}
                <a
                  href="mailto:info@luminary.aero"
                  className="text-[var(--color-gold)] underline-offset-2 hover:underline"
                >
                  info@luminary.aero
                </a>
                . Most ADMI components can be fabricated to original specification on request.
              </p>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── INSULATION PARTS LINK ── */}
      <section className="border-t border-black/[0.06] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <Section>
            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-6 rounded-2xl border border-black/[0.08] bg-white p-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                  Related Parts
                </p>
                <h3 className="mt-2 font-serif text-[24px] leading-tight text-[#111111]">
                  Insulation Replacement Parts
                </h3>
                <p className="mt-2 max-w-md text-[13px] leading-[1.75] text-[#555555]">
                  Looking for cabin comfort and insulation replacement parts? Visit the Cabin Comfort
                  Systems replacement parts catalogue for blanket kits, acoustic materials, and system components.
                </p>
              </div>
              <Link
                href="/cabin-comfort-systems/replacement-parts"
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-black/[0.12] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                View Insulation Parts
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
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
                ADMI™ · Parts Support
              </span>
              <span className="h-px w-8 bg-[var(--color-gold)] opacity-60" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">
              Need a part not listed?
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">We can fabricate it.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/50">
              Luminary maintains the original manufacturing data for ADMI interiors across all platforms.
              If a part is not listed, it can typically be fabricated to original specification on request.
              Contact our parts team to discuss availability and lead time.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
              >
                Contact Parts Team
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
