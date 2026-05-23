"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Download } from "lucide-react";
import caseStudies from "@/data/case-studies.json";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

const services = [
  {
    label: "Cabin Comfort Systems",
    headline: "Acoustic attenuation engineered to specification",
    body: "Custom insulation blanket systems, airframe-specific acoustic engineering, and Part 21 certified data packages issued on every project.",
    metric: "46.7 dB SIL",
    href: "/cabin-comfort-systems",
  },
  {
    label: "Special Mission Interiors",
    headline: "ADMI™ platform for mission-critical operations",
    body: "Certified ISR, Med-Evac, C2, and government interior systems designed for sustained crew effectiveness on extended missions.",
    metric: "ADMI™",
    href: "/special-mission-interiors",
  },
  {
    label: "VIP Completions",
    headline: "Acoustic-first completions. Measurable results.",
    body: "Green aircraft and retrofit completions where acoustic performance is the primary engineering input — not an afterthought.",
    metric: "Part 21",
    href: "/vip-interiors",
  },
];

const platforms = [
  "Boeing BBJ", "Gulfstream G550", "Challenger 604",
  "Challenger 300", "Citation XLS+", "Phenom 300", "King Air 350", "Pilatus PC-12",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ══════ HERO ══════ */}
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2400&q=85&fit=crop"
          alt="Aircraft in flight"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 lg:pb-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Luminary Air Group · Part 21 Manufacturer
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Aircraft Interior Systems.
              <br />
              <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.38)" }}>
                Engineered. Certified. Delivered.
              </em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[15px] leading-[1.9] text-white/60">
              Luminary designs, manufactures, and certifies acoustic insulation systems, special
              mission interiors, and VIP completions — with our own Part 21 approvals and published
              performance data for every project.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Request a Quote <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about/downloads"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/50 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                STCs &amp; Downloads
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.65 }}
            className="mt-12 grid grid-cols-2 gap-px sm:grid-cols-4"
          >
            {[
              { n: "46.7 dB", l: "World Record SIL" },
              { n: "100+", l: "STC Approvals" },
              { n: "25 yr", l: "Operational History" },
              { n: "Part 21", l: "FAA Manufacturer" },
            ].map((s) => (
              <div key={s.l} className="border border-white/[0.1] bg-white/[0.05] px-5 py-5 backdrop-blur-sm">
                <div className="font-serif text-[26px] leading-none text-white">{s.n}</div>
                <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ CERT BAR ══════ */}
      <div className="border-b border-black/[0.07] bg-[#f4f3f0]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center divide-x divide-black/[0.06]">
            {["FAA Part 21 Manufacturer", "EASA Approved", "AS9100D", "FAA ODA", "ADMI™ Platform"].map((c) => (
              <div key={c} className="px-5 py-4 first:pl-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#777777]">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ SERVICES ══════ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mb-12">
            <motion.div variants={fadeUp}>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Capabilities</p>
              <h2 className="display-serif-md text-[#111111]">
                Three disciplines.
                <br />
                <em className="display-serif-italic text-[#999999]">One certified manufacturer.</em>
              </h2>
            </motion.div>
          </Reveal>

          <Reveal>
            {services.map((svc, i) => (
              <motion.div key={svc.label} variants={fadeUp} className="group border-t border-black/[0.07]">
                <Link href={svc.href} className="flex items-start gap-6 py-10 sm:gap-10 lg:gap-16">
                  <span className="hidden shrink-0 pt-1 font-mono text-[11px] text-[#d8d8d8] sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--color-gold)]">
                      {svc.label}
                    </p>
                    <h3 className="font-serif leading-[1.15] text-[#111111]" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)" }}>
                      {svc.headline}
                    </h3>
                    <p className="mt-4 max-w-2xl text-[14px] leading-[1.9] text-[#666666]">{svc.body}</p>
                    <div className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbbbbb] transition-all duration-300 group-hover:gap-3 group-hover:text-[var(--color-gold)]">
                      Explore <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right lg:flex lg:flex-col lg:items-end lg:justify-between lg:self-stretch">
                    <span className="font-serif leading-none text-[#e0ddd8]" style={{ fontSize: "clamp(1.25rem, 2vw, 2rem)" }}>
                      {svc.metric}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
            <div className="border-t border-black/[0.07]" />
          </Reveal>
        </div>
      </section>

      {/* ══════ WORLD RECORD ══════ */}
      <section className="bg-[#0f0f0f] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div variants={fadeUp}>
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Performance Record</p>
              <div className="font-serif leading-none text-white" style={{ fontSize: "clamp(4rem, 9vw, 8rem)" }}>
                46.7
              </div>
              <div className="mt-1 font-serif leading-none text-white/35" style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                dB SIL
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                World Record · Boeing Business Jet · FAA Part 21 Certified
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="text-[15px] leading-[1.95] text-white/70">
                Luminary achieved the world record for cabin sound attenuation on a Boeing Business Jet,
                verified by independent acoustic measurement under FAA Part 21 certification protocol.
                Every Luminary project produces a certified data package with pre- and post-installation
                dB SIL measurements — published, independent, and reproducible.
              </p>
              <div className="mt-10 h-px w-full bg-white/[0.08]" />
              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  { n: "100+", l: "STCs Held" },
                  { n: "25 yr", l: "In Service" },
                  { n: "8", l: "Platforms" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-serif text-[30px] leading-none text-white">{s.n}</div>
                    <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">{s.l}</div>
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

      {/* ══════ PLATFORMS ══════ */}
      <section className="border-y border-black/[0.06] bg-[#f4f3f0] py-7">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
            <motion.span variants={fadeUp} className="mr-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#aaaaaa]">
              Approved platforms
            </motion.span>
            {platforms.map((p, i) => (
              <motion.span key={p} variants={fadeUp} className="font-mono text-[11px] text-[#444444]">
                {p}{i < platforms.length - 1 && <span className="mx-2 text-[#cccccc]">·</span>}
              </motion.span>
            ))}
            <motion.span variants={fadeUp} className="ml-auto font-mono text-[10px] text-[var(--color-gold)]">
              <Link href="/cabin-comfort-systems" className="hover:underline">Full catalog →</Link>
            </motion.span>
          </Reveal>
        </div>
      </section>

      {/* ══════ CASE STUDIES ══════ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-8">
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
                <motion.div key={s.id} variants={fadeUp} className="border-t border-black/[0.07] py-9">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                      {s.aircraft} · {s.category}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-[#cccccc]">{s.year}</span>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-10">
                    <span
                      className="shrink-0 font-serif leading-none text-[#111111]"
                      style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
                    >
                      {s.result}
                    </span>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
                      {s.achievement}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-black/[0.07]" />
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ══════ WHY LUMINARY ══════ */}
      <section className="border-t border-black/[0.06] bg-[#f4f3f0] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <motion.div variants={fadeUp}>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">The Manufacturer Advantage</p>
              <h2 className="display-serif-md text-[#111111]">
                Not a reseller.
                <br />
                <em className="display-serif-italic text-[#999999]">The manufacturer.</em>
              </h2>
              <p className="mt-7 text-[15px] leading-[1.95] text-[#555555]">
                Luminary designs, fabricates, and certifies every system under our own Part 21 approval.
                No subcontracted manufacturing. No third-party DER. Full configuration control
                from drawing release to delivery — and published acoustic data for every project.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] bg-white px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
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
                <motion.div key={d.n} variants={fadeUp} className="grid grid-cols-[40px_1fr] gap-5 border-t border-black/[0.09] py-7">
                  <span className="pt-0.5 font-mono text-[10px] text-[#cccccc]">{d.n}</span>
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

      {/* ══════ CTA ══════ */}
      <section className="bg-[#0f0f0f] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <motion.div variants={fadeUp}>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">Ready to Start</p>
              <h2 className="display-serif-md text-white">
                Specify your requirement.
                <br />
                <em className="display-serif-italic" style={{ color: "rgba(255,255,255,0.3)" }}>
                  We&apos;ll engineer the solution.
                </em>
              </h2>
              <p className="mx-auto mt-7 max-w-md text-[15px] leading-[1.9] text-white/60">
                Provide your aircraft type and programme scope. Our engineering team responds
                within one business day with a written brief: scope, timeline, and certification path.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
                >
                  Initiate an Enquiry <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
                <a
                  href="mailto:info@luminary.aero"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition-all hover:border-white/30 hover:text-white"
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
