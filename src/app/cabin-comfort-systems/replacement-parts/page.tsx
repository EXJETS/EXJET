"use client";

import { motion } from "framer-motion";
import { Package, ExternalLink, Phone, Mail, ShieldCheck } from "lucide-react";

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

const tapeFeatured = [
  {
    partNo: "M9900-3000",
    name: "Silver Aluminized Tape",
    spec: "3\" × 60 yd",
    price: "$348",
    color: "Silver",
    certifications: ["FAR 25.853"],
    maxTemp: "250°F",
    construction: "PSA",
    description:
      "Pressure-sensitive aluminized tape for securing and sealing insulation blanket edges. Meets FAR 25.853 flammability requirements. Rated to 250°F continuous service temperature. Also available via Skygeek.com.",
    skygeek: true,
  },
  {
    partNo: "M9910-3000",
    name: "Black Matte Polyethylene Tape",
    spec: "3\" × 60 yd",
    price: "$312",
    color: "Black Matte",
    certifications: ["FAR 25.853 A/B", "FAR 25.956 A", "BSS-7230"],
    burnLength: "0\" burn length",
    description:
      "Black matte polyethylene tape with an exceptional flammability certification stack — FAR 25.853 A and B, FAR 25.956 A, and Boeing BSS-7230. Zero recorded burn length. Used where strict fire test compliance is a contract requirement. Also available via Skygeek.com.",
    skygeek: true,
  },
  {
    partNo: "M9948-3000",
    name: "White Matte Polyethylene Tape",
    spec: "3\" × 60 yd",
    price: "$384",
    color: "White Matte",
    certifications: ["FAR 25.853"],
    maxTemp: "250°F",
    description:
      "White matte finish polyethylene tape for installations requiring colour-matched surfaces or light cabin finishes. FAR 25.853 compliant, 250°F rated. Also available via Skygeek.com.",
    skygeek: true,
  },
];

const partsTable = [
  { description: "LAG 1/4\" Acoustic Foam", partNo: "M9802-0.25\"", uom: "Yard (12 sq ft)" },
  { description: "LAG 3/8\" Acoustic Foam", partNo: "M9802-0.375\"", uom: "Yard (12 sq ft)" },
  { description: "LAG 1/2\" Acoustic Foam", partNo: "M9802-0.5\"", uom: "Yard (12 sq ft)" },
  { description: "LAG Aluminized Felt", partNo: "M9858", uom: "Yard (13.5 sq ft)" },
  { description: "LAG Dual-side Aluminized Felt", partNo: "M9858", uom: "Yard (13.5 sq ft)" },
  { description: "LAG 3/8\" Self-adhesive Foam", partNo: "M9862-0.375\"", uom: "Yard (12 sq ft)" },
  { description: "LAG 1/4\" Self-adhesive Foam", partNo: "M9863-0.25\"", uom: "Yard (12 sq ft)" },
  { description: "LAG Aluminized Tape 2\" Wide", partNo: "M9900-2\"", uom: "Roll (60 yards)" },
  { description: "LAG Aluminized Tape 3\" Wide", partNo: "M9900-3\"", uom: "Roll (60 yards)" },
  { description: "LAG White Poly Tape 3\" Wide", partNo: "M9948-3000", uom: "Roll (60 yards)" },
  { description: "Velcro HOOK 1\" Wide", partNo: "M9908-Hook", uom: "Roll (50 yards)" },
  { description: "Velcro LOOP 1\" Wide", partNo: "M9908-Loop", uom: "Roll (50 yards)" },
  { description: "LAG 1\" Transfer Tape", partNo: "M9909-1\"", uom: "Roll (60 yards)" },
  { description: "LAG Black Poly Tape 3\" Wide", partNo: "M9910-3\"", uom: "Roll (60 yards)" },
  { description: "LAG 0.050\" Damper", partNo: "M9864-050", uom: "Sheet (13.75 sq ft)" },
];

const skygeekParts = ["M9900-3000", "M9910-3000", "M9948-3000"];

export default function ReplacementPartsPage() {
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
                Replacement Parts & Materials
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif max-w-4xl text-[#111111]">
              Replacement Parts
              <br />
              <em className="display-serif-italic text-[#888888]">&amp; Materials.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              Original Luminary parts for Flight Environments insulation systems. Every material in this catalog
              is the same specification used in Luminary-engineered insulation blanket kits — certified,
              traceable, and ready for immediate dispatch.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── FEATURED TAPE PRODUCTS ── */}
      <section className="border-t border-black/[0.08] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-14 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Certified Tape Products
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
                Aviation-grade tapes —
                <br />
                <em className="display-serif-italic text-[#888888]">FAR 25.853 certified.</em>
              </motion.h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {tapeFeatured.map((tape) => (
                <motion.div
                  key={tape.partNo}
                  variants={fadeUp}
                  className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8"
                >
                  {/* Price badge */}
                  <div className="mb-6 flex items-start justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <Package className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </span>
                    <span className="font-serif text-[24px] text-[#111111]">{tape.price}</span>
                  </div>

                  {/* Part number */}
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                    {tape.partNo}
                  </p>
                  <h3 className="mb-1 font-serif text-[18px] font-semibold text-[#111111]">{tape.name}</h3>
                  <p className="mb-4 font-mono text-[12px] text-[#888888]">{tape.spec}</p>

                  {/* Specs row */}
                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-black/[0.08] bg-[var(--color-surface)] px-3 py-1 font-mono text-[10px] tracking-[0.1em] text-[#555555]">
                      Color: {tape.color}
                    </span>
                    {tape.maxTemp && (
                      <span className="rounded-full border border-black/[0.08] bg-[var(--color-surface)] px-3 py-1 font-mono text-[10px] tracking-[0.1em] text-[#555555]">
                        {tape.maxTemp} max
                      </span>
                    )}
                    {tape.construction && (
                      <span className="rounded-full border border-black/[0.08] bg-[var(--color-surface)] px-3 py-1 font-mono text-[10px] tracking-[0.1em] text-[#555555]">
                        {tape.construction}
                      </span>
                    )}
                    {tape.burnLength && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[10px] tracking-[0.1em] text-emerald-700">
                        {tape.burnLength}
                      </span>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {tape.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-gold)]"
                      >
                        <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
                        {cert}
                      </span>
                    ))}
                  </div>

                  <p className="mb-5 flex-1 text-[14px] leading-[1.8] text-[#555555]">{tape.description}</p>

                  {tape.skygeek && (
                    <a
                      href="https://www.skygeek.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888] hover:text-[var(--color-gold)] transition-colors"
                    >
                      Also at Skygeek.com
                      <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── FULL PARTS TABLE ── */}
      <section className="border-t border-black/[0.08] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="mb-14 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Complete Parts List
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md max-w-2xl text-[#111111]">
                All replacement materials —
                <br />
                <em className="display-serif-italic text-[#888888]">direct from Luminary.</em>
              </motion.h2>
            </div>

            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-black/[0.08] overflow-hidden bg-white"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.08] bg-[var(--color-surface)]">
                    <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      Part Description
                    </th>
                    <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      P/N
                    </th>
                    <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      UOM
                    </th>
                    <th className="px-6 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {partsTable.map((part, idx) => {
                    const onSkygeek = skygeekParts.some((pn) => part.partNo.includes(pn.replace("-3000", "")));
                    return (
                      <tr
                        key={`${part.partNo}-${idx}`}
                        className="border-b border-black/[0.04] last:border-0 hover:bg-[var(--color-surface)] transition-colors"
                      >
                        <td className="px-6 py-3.5 text-[14px] text-[#111111]">{part.description}</td>
                        <td className="px-6 py-3.5 font-mono text-[13px] text-[#555555]">{part.partNo}</td>
                        <td className="px-6 py-3.5 text-[14px] text-[#555555]">{part.uom}</td>
                        <td className="px-6 py-3.5">
                          {onSkygeek ? (
                            <a
                              href="https://www.skygeek.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-gold)] hover:underline"
                            >
                              Skygeek
                              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                            </a>
                          ) : (
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#aaaaaa]">
                              Direct only
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-center text-[13px] text-[#888888]">
              M9900-3000, M9910-3000, and M9948-3000 are also available via{" "}
              <a
                href="https://www.skygeek.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-gold)] hover:underline"
              >
                Skygeek.com
              </a>
              . All other parts are available direct from Luminary only.
            </motion.p>
          </Section>
        </div>
      </section>

      {/* ── ORDER CTA ── */}
      <section className="border-t border-black/[0.08] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section>
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center gap-6 rounded-2xl border border-black/[0.08] bg-white px-8 py-12 text-center"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  To Order
                </span>
                <span className="h-px w-8 bg-[var(--color-gold)]" />
              </div>
              <h2 className="display-serif-md text-[#111111]">Ready to order?</h2>
              <p className="max-w-lg text-[15px] leading-[1.8] text-[#555555]">
                Contact the Luminary parts team directly. We maintain stock of high-turn materials and can advise
                on quantities, compatibility, and lead times for specialty items.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="tel:18886242400"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  888-624-2400
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
    </main>
  );
}
