"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import catalogData from "@/data/insulation-aircraft-catalog.json";

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

const ALL_LABEL = "All";
const MANUFACTURERS = [ALL_LABEL, ...catalogData.map((g) => g.manufacturer)];

export default function InsulationProductsPage() {
  const [selected, setSelected] = useState<string>(ALL_LABEL);

  const groups =
    selected === ALL_LABEL
      ? catalogData
      : catalogData.filter((g) => g.manufacturer === selected);

  return (
    <main className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-50" />
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div className="relative mx-auto max-w-7xl px-5 pt-32 pb-20 sm:px-8 lg:pt-44 lg:pb-28">
          <Section className="flex flex-col items-center text-center">
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Insulation Product Catalog
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              Aircraft Insulation Systems
              <br />
              <em className="display-serif-italic text-[#888888]">22 Makes, 100+ Models.</em>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              Every kit in this catalog is designed, fabricated, and certified in-house under Luminary&apos;s FAA Part
              21 approval. Systems are supplied with Supplemental Type Certificate (STC) documentation and PMA-approved
              components where applicable — no third-party guesswork, no grey-market parts.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="sticky top-0 z-20 border-y border-black/[0.08] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex flex-wrap gap-2">
            {MANUFACTURERS.map((mfr) => (
              <button
                key={mfr}
                onClick={() => setSelected(mfr)}
                className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all ${
                  selected === mfr
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-white"
                    : "border-black/[0.12] text-[#555555] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                }`}
              >
                {mfr}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATALOG TABLES ── */}
      <section className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          {groups.map((group) => (
            <Section key={group.manufacturer} className="mb-10">
              {/* Manufacturer heading */}
              <motion.div variants={fadeUp} className="mb-3 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  {group.manufacturer}
                </span>
              </motion.div>

              {/* Table card */}
              <motion.div
                variants={fadeUp}
                className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/[0.08] bg-[var(--color-surface)]">
                      <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                        Part No.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.models.map((item, idx) => (
                      <tr
                        key={`${item.model}-${item.partNo}-${idx}`}
                        className="border-b border-black/[0.04] last:border-0 hover:bg-[var(--color-surface)] transition-colors"
                      >
                        <td className="px-6 py-3.5 text-[14px] text-[#111111] font-medium">
                          {item.model}
                        </td>
                        <td className="px-6 py-3.5 text-[14px] text-[#555555]">{item.description}</td>
                        <td className="px-6 py-3.5 font-mono text-[13px] text-[#555555]">
                          {item.partNo || <span className="text-[#bbbbbb]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </Section>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Custom Engineering
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
              Don&apos;t see your aircraft?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[16px] leading-[1.8] text-[#555555]">
              Contact us — we may already have it, or we can engineer a solution from scratch. Luminary has designed
              insulation systems for one-off military conversions, head-of-state aircraft, and platforms with no
              prior STC coverage.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
              >
                Contact Us
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/cabin-comfort-systems"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                Back to Cabin Comfort
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>
    </main>
  );
}
