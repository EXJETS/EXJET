"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ChevronRight, Download } from "lucide-react";
import caseStudies from "@/data/case-studies.json";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

const services = [
  {
    label: "Cabin Comfort Systems",
    headline: "Acoustic attenuation engineered to specification",
    body: "Custom insulation blanket systems, airframe-specific engineering, and Part 21 certified data packages.",
    metric: "46.7 dB SIL",
    href: "/cabin-comfort-systems",
    img: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=900&q=80&fit=crop",
  },
  {
    label: "Special Mission Interiors",
    headline: "ADMI™ platform for mission-critical operations",
    body: "Certified ISR, Med-Evac, C2, and government interior systems designed for sustained crew effectiveness.",
    metric: "ADMI™",
    href: "/special-mission-interiors",
    img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&q=80&fit=crop",
  },
  {
    label: "VIP Completions",
    headline: "Acoustic-first completions. Measurable results.",
    body: "Green aircraft and retrofit completions where acoustic performance is the primary engineering input.",
    metric: "Part 21",
    href: "/vip-interiors",
    img: "https://images.unsplash.com/photo-1474302771737-d1729c1a2318?w=900&q=80&fit=crop",
  },
];

const platforms = [
  { model: "Boeing BBJ", type: "Wide Body" },
  { model: "Gulfstream G550", type: "Large Cabin" },
  { model: "Challenger 604", type: "Large Cabin" },
  { model: "Challenger 300", type: "Large Cabin" },
  { model: "Citation XLS+", type: "Midsize Jet" },
  { model: "Phenom 300", type: "Light Jet" },
  { model: "King Air 350", type: "Turboprop" },
  { model: "Pilatus PC-12", type: "Turboprop" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════
          HERO — dark photo, editorial text bottom-left
      ═══════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2400&q=85&fit=crop"
          alt="Aircraft interior"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:pb-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl">
            <motion.div variants={fadeUp} className="mb-7 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Luminary Air Group · Part 21 Manufacturer
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Aircraft Interior
              <br />
              Systems.{" "}
              <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.45)" }}>
                Engineered.
              </em>
              <br />
              <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.45)" }}>
                Certified. Delivered.
              </em>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[16px] leading-[1.9] text-white/60">
              Luminary designs, manufactures, and certifies acoustic insulation systems, special
              mission interiors, and VIP completions — holding our own Part 21 approvals and
              publishing measured performance data for every project we deliver.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Request a Quote
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about/downloads"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75 transition-all hover:border-white/50 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                STCs &amp; Downloads
              </Link>
            </motion.div>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-14 grid grid-cols-2 gap-px sm:grid-cols-4"
          >
            {[
              { n: "46.7 dB", l: "World Record SIL" },
              { n: "100+", l: "STC Approvals" },
              { n: "25 yr", l: "Operational History" },
              { n: "Part 21", l: "FAA Manufacturer" },
            ].map((s) => (
              <div key={s.l} className="border border-white/10 bg-white/[0.06] px-6 py-5 backdrop-blur-sm">
                <div className="font-serif text-[30px] leading-none text-white">{s.n}</div>
                <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CERT BAR
      ═══════════════════════════════════════════ */}
      <div className="border-b border-black/[0.07] bg-[#f4f3f0]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center divide-x divide-black/[0.06]">
            {["FAA Part 21 Manufacturer", "EASA Approved", "ISO 9001:2015", "AS9100D Aerospace QMS", "FAA ODA", "ADMI™ Platform"].map((c) => (
              <div key={c} className="px-5 py-4 first:pl-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#777777]">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SERVICES — full-width editorial rows
      ═══════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mb-10">
            <motion.div variants={fadeUp} className="flex items-end justify-between gap-6">
              <div>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Capabilities</p>
                <h2 className="display-serif-md text-[#111111]">
                  Three disciplines.
                  <br />
                  <em className="display-serif-italic text-[#999999]">One certified manufacturer.</em>
                </h2>
              </div>
            </motion.div>
          </Reveal>

          <Reveal>
            {services.map((svc, i) => (
              <motion.div key={svc.label} variants={fadeUp} className="group border-t border-black/[0.07]">
                <Link href={svc.href} className="grid items-stretch lg:grid-cols-[1fr_420px]">
                  <div className="flex flex-col justify-between py-8 lg:pr-12">
                    <div>
                      <span className="font-mono text-[11px] text-[#dddddd]">{String(i + 1).padStart(2, "0")}</span>
                      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--color-gold)]">{svc.label}</p>
                      <h3 className="mt-3 font-serif text-[30px] leading-[1.1] text-[#111111] lg:text-[36px]">{svc.headline}</h3>
                      <p className="mt-4 max-w-lg text-[14px] leading-[1.9] text-[#666666]">{svc.body}</p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbbbbb] transition-all duration-300 group-hover:gap-3 group-hover:text-[var(--color-gold)]">
                      Explore <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="relative hidden overflow-hidden lg:block" style={{ minHeight: "300px" }}>
                    <img
                      src={svc.img}
                      alt={svc.label}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
            <div className="border-t border-black/[0.07]" />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WORLD RECORD — dark editorial callout
      ═══════════════════════════════════════════ */}
      <section className="bg-[#0f0f0f] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="grid items-center gap-16 lg:grid-cols-[1fr_1fr]">
            <motion.div variants={fadeUp}>
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Performance Record</p>
              <div className="font-serif leading-none text-white" style={{ fontSize: "clamp(5rem, 14vw, 11rem)" }}>
                46.7
              </div>
              <div className="mt-2 font-serif leading-none text-white/20" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
                dB SIL
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                World Record · Boeing Business Jet · FAA Part 21 Certified
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="text-[15px] leading-[2] text-white/45">
                Luminary achieved the world record for cabin sound attenuation on a Boeing Business Jet,
                verified by independent acoustic measurement under FAA Part 21 certification protocol.
                Every Luminary project produces a certified data package with pre- and post-installation
                dB SIL measurements — published, independent, and reproducible.
              </p>
              <div className="mt-10 h-px w-full bg-white/[0.06]" />
              <div className="mt-8 grid grid-cols-3 gap-8">
                {[
                  { n: "100+", l: "STCs Held" },
                  { n: "25 yr", l: "In Service" },
                  { n: "8", l: "Platforms" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-serif text-[36px] leading-none text-white/80">{s.n}</div>
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">{s.l}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/performance-history"
                className="mt-10 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-4"
              >
                View Performance Library <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PLATFORMS — flat text strip
      ═══════════════════════════════════════════ */}
      <section className="border-y border-black/[0.06] bg-[#f4f3f0] py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <motion.span variants={fadeUp} className="mr-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
              Approved platforms
            </motion.span>
            {platforms.map((p, i) => (
              <motion.span key={p.model} variants={fadeUp} className="font-mono text-[11px] text-[#333333]">
                {p.model}{i < platforms.length - 1 && <span className="mx-2 text-[#cccccc]">·</span>}
              </motion.span>
            ))}
            <motion.span variants={fadeUp} className="ml-auto font-mono text-[10px] text-[var(--color-gold)]">
              <Link href="/cabin-comfort-systems" className="hover:underline">Full catalog →</Link>
            </motion.span>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CASE STUDIES
      ═══════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-10 flex items-end justify-between gap-8">
              <motion.div variants={fadeUp}>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Project Record</p>
                <h2 className="display-serif-md text-[#111111]">
                  Documented results.
                  <br />
                  <em className="display-serif-italic text-[#999999]">Every project.</em>
                </h2>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link
                  href="/performance-history"
                  className="hidden shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3 sm:inline-flex"
                >
                  Full Library <ChevronRight className="h-3 w-3" strokeWidth={2} />
                </Link>
              </motion.div>
            </div>

            <motion.div variants={stagger}>
              {caseStudies.map((s) => (
                <motion.div
                  key={s.id}
                  variants={fadeUp}
                  className="grid grid-cols-[100px_1fr] gap-8 border-t border-black/[0.07] py-8 sm:grid-cols-[120px_1fr_160px]"
                >
                  <div>
                    <div className="font-serif text-[44px] leading-none text-[#111111]">{s.result}</div>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-gold)]">{s.achievement}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{s.aircraft}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#888888]">{s.category}</p>
                    <p className="mt-3 text-[13px] leading-[1.85] text-[#666666]">{s.description}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#cccccc]">{s.year}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#cccccc]">{s.operator}</p>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-black/[0.07]" />
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY LUMINARY — editorial 2-col, no icon boxes
      ═══════════════════════════════════════════ */}
      <section className="border-t border-black/[0.06] bg-[#f4f3f0] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <motion.div variants={fadeUp}>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">The Manufacturer Advantage</p>
              <h2 className="display-serif-md text-[#111111]">
                Not a reseller.
                <br />
                <em className="display-serif-italic text-[#999999]">The manufacturer.</em>
              </h2>
              <p className="mt-8 text-[15px] leading-[2] text-[#666666]">
                Luminary designs, fabricates, and certifies every system under our own Part 21 approval.
                No subcontracted manufacturing. No third-party DER required. Full configuration control
                from drawing release to delivery — and published acoustic data for every project.
              </p>
              <Link
                href="/about"
                className="mt-10 inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] bg-white px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                About Luminary <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </motion.div>

            <motion.div variants={stagger}>
              {[
                { n: "01", title: "Airframe-Specific Engineering", body: "Every insulation system developed from acoustic survey data for your specific airframe — not adapted from a generic template." },
                { n: "02", title: "Full Certification Authority", body: "FAA Part 21, EASA, ODA delegation, and 100+ STCs across 8 approved platforms. No third-party DER required." },
                { n: "03", title: "Published Performance Data", body: "Before-and-after dB SIL measurement on every project. Part 21 certified data packages issued to the operator." },
                { n: "04", title: "In-House Manufacturing", body: "Design, fabrication, and installation under one roof. No subcontracted manufacturing. Full configuration control." },
              ].map((d) => (
                <motion.div key={d.n} variants={fadeUp} className="grid grid-cols-[48px_1fr] gap-6 border-t border-black/[0.09] py-7">
                  <span className="pt-0.5 font-mono text-[11px] text-[#cccccc]">{d.n}</span>
                  <div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">{d.title}</h3>
                    <p className="mt-3 text-[14px] leading-[1.9] text-[#666666]">{d.body}</p>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-black/[0.09]" />
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONTACT CTA — dark, single focus
      ═══════════════════════════════════════════ */}
      <section className="bg-[#0f0f0f] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp}>
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">Ready to Start</p>
              <h2 className="display-serif-md text-white">
                Specify your requirement.
                <br />
                <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.3)" }}>
                  We&apos;ll engineer the solution.
                </em>
              </h2>
              <p className="mx-auto mt-8 max-w-lg text-[15px] leading-[1.95] text-white/40">
                Provide your aircraft type and programme scope. Our engineering team responds
                within one business day with a written brief: scope, timeline, and certification path.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
                >
                  Initiate an Enquiry
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
                <a
                  href="mailto:info@luminary.aero"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition-all hover:border-white/30 hover:text-white/90"
                >
                  info@luminary.aero
                </a>
              </div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                Response within 1 business day · 1-888-624-2400
              </p>
            </motion.div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
