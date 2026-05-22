"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Activity,
  Shield,
  BadgeCheck,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  Download,
  Layers,
  FileCheck2,
  BarChart3,
  Zap,
  Target,
} from "lucide-react";
import caseStudies from "@/data/case-studies.json";

/* ─── Animation helpers ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.09 } } };

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Data ───────────────────────────────────────────────── */
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

const certifications = [
  { label: "FAA Part 21", sub: "Manufacturer" },
  { label: "EASA", sub: "Approved" },
  { label: "ISO 9001", sub: "2015 Registered" },
  { label: "AS9100D", sub: "Aerospace QMS" },
  { label: "FAA ODA", sub: "Delegated Authority" },
  { label: "ADMI™", sub: "Proprietary Platform" },
];

const services = [
  {
    icon: Activity,
    label: "Cabin Comfort Systems",
    headline: "Acoustic attenuation engineered to specification",
    body: "Custom insulation blanket systems, airframe-specific engineering, and Part 21 certified data packages for turboprop through wide-body platforms.",
    href: "/cabin-comfort-systems",
    metric: "46.7 dB SIL",
    metricLabel: "World record result",
  },
  {
    icon: Layers,
    label: "Special Mission Interiors",
    headline: "ADMI™ platform for mission-critical operations",
    body: "Certified ISR, Med-Evac, C2, and government aircraft interior systems designed for sustained crew effectiveness and rapid field reconfiguration.",
    href: "/special-mission-interiors",
    metric: "ADMI™",
    metricLabel: "Proprietary platform",
  },
  {
    icon: BadgeCheck,
    label: "VIP Completions",
    headline: "Acoustic-first completions. Measurable results.",
    body: "Green aircraft and retrofit completions where acoustic performance is the primary engineering input — certified, documented, and delivered on schedule.",
    href: "/vip-interiors",
    metric: "Part 21",
    metricLabel: "All work certified",
  },
];

const differentiators = [
  {
    icon: Target,
    title: "Airframe-Specific Engineering",
    body: "Every insulation system is developed from acoustic survey data specific to your airframe — not adapted from a generic template.",
  },
  {
    icon: BadgeCheck,
    title: "Full Certification Authority",
    body: "We hold the approvals. FAA Part 21, EASA, ODA delegation, and over 100 STCs across 8 approved platforms. No third-party DER required.",
  },
  {
    icon: BarChart3,
    title: "Published Performance Data",
    body: "We measure and publish acoustic results for every project. You receive a Part 21 data package with before-and-after dB SIL verification.",
  },
  {
    icon: Zap,
    title: "In-House Manufacturing",
    body: "Design, fabrication, and installation under one roof. No subcontracted manufacturing. Full configuration control from drawing release to delivery.",
  },
];

/* ─── Component ──────────────────────────────────────────── */
export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle dot grid */}
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-50" />
        {/* Gold atmospheric glow */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(201,168,76,0.1) 0%, transparent 65%)"
        }} />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8 lg:pb-32 lg:pt-48">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Luminary Air Group · Part 21 Manufacturer
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="display-serif text-[#111111]"
            >
              Aircraft Interior
              <br />
              Systems.{" "}
              <em className="display-serif-italic" style={{ color: "#888888" }}>
                Engineered.
              </em>
              <br />
              <em className="display-serif-italic" style={{ color: "#888888" }}>
                Certified. Delivered.
              </em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-[17px] leading-[1.8] text-[#555555]"
            >
              Luminary designs, manufactures, and certifies acoustic insulation systems, special
              mission interiors, and VIP completions — holding our own Part 21 approvals and
              publishing performance data for every project we deliver.
            </motion.p>

            {/* CTA row */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-gold-deep)]"
              >
                Request a Quote
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about/downloads"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
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
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.06] sm:grid-cols-4"
          >
            {[
              { n: "46.7 dB", l: "World Record SIL" },
              { n: "100+", l: "STC Approvals" },
              { n: "25 yr", l: "Operational History" },
              { n: "Part 21", l: "FAA Manufacturer" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col items-center bg-white px-6 py-7 text-center">
                <span className="font-serif text-[32px] leading-none tracking-tight text-[#111111]">{s.n}</span>
                <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#aaaaaa]">{s.l}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CERTIFICATION TRUST BAR
      ═══════════════════════════════════════════════════ */}
      <div className="border-y border-black/[0.06] bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-3 divide-x divide-black/[0.06] sm:grid-cols-6">
            {certifications.map((c) => (
              <div key={c.label} className="flex flex-col items-center px-4 py-5 text-center">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111111]">{c.label}</span>
                <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#aaaaaa]">{c.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal>
          <motion.div variants={fadeUp} className="mb-16 flex items-end justify-between gap-8">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Services</span>
              </div>
              <h2 className="display-serif-md text-[#111111]">
                Three Capabilities.
                <br />
                <em className="display-serif-italic text-[#888888]">One Certified Manufacturer.</em>
              </h2>
            </div>
            <Link
              href="/contact"
              className="hidden shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3 sm:inline-flex"
            >
              Get a Quote <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="grid gap-5 md:grid-cols-3">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.label}
                  variants={fadeUp}
                  className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8 transition-all duration-300 hover:border-[var(--color-gold)] hover:shadow-[0_12px_40px_-10px_rgba(201,168,76,0.18)]"
                >
                  {/* Icon */}
                  <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                    <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </div>

                  {/* Metric */}
                  <div className="mb-4">
                    <span className="font-serif text-[36px] leading-none text-[#111111]">{svc.metric}</span>
                    <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#aaaaaa]">{svc.metricLabel}</span>
                  </div>

                  {/* Label + headline */}
                  <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">{svc.label}</span>
                  <h3 className="font-serif text-[20px] leading-snug text-[#111111]">{svc.headline}</h3>
                  <p className="mt-3 flex-1 text-[13px] leading-[1.85] text-[#555555]">{svc.body}</p>

                  {/* Link */}
                  <Link
                    href={svc.href}
                    className="mt-7 inline-flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)] transition-all group-hover:gap-3"
                  >
                    Explore <ChevronRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════
          APPROVED PLATFORMS
      ═══════════════════════════════════════════════════ */}
      <section className="border-y border-black/[0.06] bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal>
            <div className="mb-10 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Approved Platforms</span>
                <span className="h-px w-8 bg-[var(--color-gold)]" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-sm text-[#111111]">
                STC Coverage Across the Fleet
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 max-w-xl text-[14px] leading-[1.8] text-[#888888]">
                Luminary holds approved data and manufacturing authorisation for the following platforms.
                Contact us for airframes not listed — we actively expand our STC portfolio.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {platforms.map((p) => (
                <motion.div
                  key={p.model}
                  variants={fadeUp}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-3 py-5 text-center transition-colors hover:border-[var(--color-gold)]"
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#111111]">{p.model}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#aaaaaa]">{p.type}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex justify-center">
              <Link
                href="/cabin-comfort-systems"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3"
              >
                View Full Product Catalog <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PERFORMANCE RECORD
      ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal>
          <div className="mb-16 flex items-end justify-between gap-8">
            <motion.div variants={fadeUp}>
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Performance Record</span>
              </div>
              <h2 className="display-serif-md text-[#111111]">
                Documented Results.
                <br />
                <em className="display-serif-italic text-[#888888]">Every Project.</em>
              </h2>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link
                href="/performance-history"
                className="hidden shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3 sm:inline-flex"
              >
                Full Performance Library <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {caseStudies.map((s) => (
              <motion.div
                key={s.id}
                variants={fadeUp}
                className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_40px_-10px_rgba(201,168,76,0.14)]"
              >
                <div className="mb-4 inline-block self-start rounded-full border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.07)] px-3 py-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">{s.category}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#aaaaaa]">{s.aircraft}</span>
                <div className="mt-2 font-serif text-[40px] leading-none tracking-tight text-[#111111]">{s.result}</div>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--color-gold)]">{s.achievement}</p>
                <p className="mt-4 flex-1 text-[12px] leading-[1.8] text-[#888888] line-clamp-3">{s.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-black/[0.05] pt-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#aaaaaa]">{s.year}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#aaaaaa]">{s.operator}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY LUMINARY — 4-UP DIFFERENTIATORS
      ═══════════════════════════════════════════════════ */}
      <section className="border-t border-b border-black/[0.06] bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <Reveal>
            <div className="mb-16 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Why Luminary</span>
                <span className="h-px w-8 bg-[var(--color-gold)]" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
                The Manufacturer Advantage
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.85] text-[#555555]">
                Luminary is not a reseller. We design, manufacture, and certify every system
                under our own Part 21 approval — which means faster delivery, tighter tolerance,
                and published performance data you can rely on.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {differentiators.map((d) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.title}
                    variants={fadeUp}
                    className="rounded-2xl border border-black/[0.08] bg-white p-7"
                  >
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">{d.title}</h3>
                    <p className="mt-3 text-[13px] leading-[1.85] text-[#555555]">{d.body}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          RESOURCES SPLIT
      ═══════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal className="grid gap-5 lg:grid-cols-3">
          {/* Performance CTA — spans 2 cols */}
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl bg-[#111111] p-10 lg:col-span-2"
          >
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{
              background: "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(201,168,76,0.5), transparent 65%)"
            }} />
            <span className="relative font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--color-gold)]">Performance Data Library</span>
            <h3 className="relative mt-4 font-serif text-[38px] leading-[1.1] text-white sm:text-[46px]">
              See the Numbers.
              <br />
              <em className="font-normal italic text-white/40">Verify the Work.</em>
            </h3>
            <p className="relative mt-4 max-w-md text-[14px] leading-[1.85] text-white/50">
              Every Luminary project produces a Part 21 certified data package with pre- and
              post-installation acoustic measurements. Published. Independent. Reproducible.
            </p>
            <Link
              href="/performance-history"
              className="relative mt-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-gold)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)] hover:text-black"
            >
              Open Performance Library
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>

          {/* Side resource cards */}
          <motion.div variants={stagger} className="flex flex-col gap-5">
            <motion.div variants={fadeUp} className="flex flex-1 flex-col rounded-2xl border border-black/[0.08] bg-white p-7">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                <Download className="h-4.5 w-4.5 text-[var(--color-gold)]" strokeWidth={1.5} />
              </div>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">STC Library</h4>
              <p className="mt-2 flex-1 text-[12px] leading-[1.85] text-[#888888]">Download our full Supplemental Type Certificate catalog and approved data sheets for all covered platforms.</p>
              <Link href="/about/downloads" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                Browse STCs <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-1 flex-col rounded-2xl border border-black/[0.08] bg-white p-7">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                <FileCheck2 className="h-4.5 w-4.5 text-[var(--color-gold)]" strokeWidth={1.5} />
              </div>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">AOG Support</h4>
              <p className="mt-2 flex-1 text-[12px] leading-[1.85] text-[#888888]">Aircraft on ground? Priority replacement parts and expedited installation support with our AOG response team.</p>
              <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                Contact Now <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </motion.div>
          </motion.div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════
          CONTACT CTA
      ═══════════════════════════════════════════════════ */}
      <section className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Reveal className="flex flex-col items-center text-center">
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">Ready to Start</span>
              <span className="h-px w-8 bg-[var(--color-gold)]" />
            </motion.div>

            <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
              Specify Your Requirement.
              <br />
              <em className="display-serif-italic text-[#888888]">We&apos;ll Engineer the Solution.</em>
            </motion.h2>

            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-[15px] leading-[1.85] text-[#555555]">
              Provide your aircraft type and programme scope. Our engineering team will respond
              within one business day with a written brief including scope, timeline, and certification path.
            </motion.p>

            {/* Response promise */}
            <motion.div variants={fadeUp} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[rgba(201,168,76,0.08)] px-5 py-2">
              <Clock className="h-3.5 w-3.5 text-[var(--color-gold)]" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">Response within 1 business day</span>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-gold-deep)]"
              >
                Initiate an Enquiry
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <a
                href="mailto:info@luminary.aero"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.12] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                info@luminary.aero
              </a>
              <a
                href="tel:+18000000000"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.12] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                +1 (800) 000-0000
              </a>
            </motion.div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
