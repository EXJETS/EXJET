"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Layers,
  Shield,
  Star,
  Award,
  Plane,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  Eye,
  Wrench,
  Clock,
  Download,
  Zap,
} from "lucide-react";
import caseStudies from "@/data/case-studies.json";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75 } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
    icon: Layers,
    title: "Cabin Comfort Systems",
    description: "Industry-leading acoustic insulation blankets engineered for maximum noise attenuation and thermal performance across all business jet platforms.",
    href: "/cabin-comfort-systems",
    stat: "40+ dB",
    statLabel: "noise reduction",
  },
  {
    icon: Shield,
    title: "Special Mission Interiors",
    description: "Purpose-built ISR, Med-Evac, and government aircraft interiors certified under our proprietary ADMI™ platform for demanding operational requirements.",
    href: "/special-mission-interiors",
    stat: "100+",
    statLabel: "mission platforms",
  },
  {
    icon: Star,
    title: "VIP Completions",
    description: "Bespoke interior completions for ultra-long-range jets and head-of-state aircraft. Every detail engineered for extraordinary comfort and prestige.",
    href: "/vip-interiors",
    stat: "25+",
    statLabel: "years expertise",
  },
];

const stats = [
  { value: "25+", label: "Years in service" },
  { value: "500+", label: "Aircraft completed" },
  { value: "100+", label: "STC approvals" },
  { value: "46.7 dB", label: "World record SIL" },
];

const certs = [
  { label: "FAA Part 21", sub: "Manufacturer" },
  { label: "EASA", sub: "Certified" },
  { label: "ISO 9001", sub: "2015 Registered" },
  { label: "AS9100D", sub: "Aerospace Quality" },
  { label: "ADMI™", sub: "Platform" },
  { label: "FAA ODA", sub: "Authority" },
];

const aircraft = [
  { label: "Boeing BBJ", sub: "737 / 777 / 787" },
  { label: "Gulfstream", sub: "G-IV / G-V / G650" },
  { label: "Bombardier", sub: "Challenger / Global" },
  { label: "Cessna", sub: "Citation Series" },
  { label: "Dassault", sub: "Falcon Series" },
  { label: "Beechcraft", sub: "King Air Series" },
  { label: "Embraer", sub: "Legacy / Lineage" },
  { label: "Sikorsky", sub: "S-76 / S-92" },
];

const clients = [
  "Boeing", "Gulfstream", "Bombardier", "Cessna", "Dassault", "Embraer",
  "Beechcraft", "Hawker", "Piper", "Sikorsky",
];

const testimonials = [
  {
    quote: "Luminary's insulation blankets transformed our BBJ cabin — quieter than we thought possible at altitude.",
    author: "Chief of Completions",
    org: "Fortune 100 Flight Department",
  },
  {
    quote: "Their ADMI™ platform gave us the configuration flexibility our ISR mission demanded. Delivered on time, on spec.",
    author: "Program Manager",
    org: "US Government Agency",
  },
  {
    quote: "From concept to certification, the Luminary team was exceptional. Our VIP clients noticed the difference immediately.",
    author: "Director of Operations",
    org: "Charter Management Group",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white pt-16">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-60" />
        <div className="pointer-events-none absolute inset-0 mesh-hero" />

        <div className="relative mx-auto max-w-7xl px-5 py-32 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center text-center"
          >
            <motion.span variants={fadeUp} className="chapter-rule mb-8">
              Luminary Air Group · Part 21 Manufacturer
            </motion.span>

            <motion.h1 variants={fadeUp} className="display-serif max-w-5xl text-[#111111]">
              Aircraft Interiors
              <br />
              <em className="display-serif-italic text-[#888888]">Engineered to Excel.</em>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[17px] leading-[1.75] text-[#555555]">
              From acoustic insulation blankets to special mission platforms and VIP completions —
              Luminary delivers precision-engineered interiors for the world&apos;s most demanding aircraft operations.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#111111] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
              >
                Get a Quote
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about/downloads"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                Downloads & STCs
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.08] sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center bg-white px-8 py-6">
                  <span className="font-serif text-[36px] leading-none text-[#111111]">{s.value}</span>
                  <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#aaaaaa]">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-8 w-[1px] bg-gradient-to-b from-[#aaaaaa] to-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* ── CERTIFICATIONS TRUST BAR ── */}
      <div className="border-y border-black/[0.06] bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-3 divide-x divide-black/[0.06] sm:grid-cols-6">
            {certs.map((c) => (
              <div key={c.label} className="flex flex-col items-center py-5 px-4 text-center">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#111111]">{c.label}</span>
                <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#aaaaaa]">{c.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CLIENT MARQUEE ── */}
      <div className="border-b border-black/[0.06] bg-white py-4">
        <div className="no-scrollbar flex overflow-x-auto">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {[...clients, ...clients].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-8 px-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#cccccc]">{c}</span>
                <span className="h-[3px] w-[3px] rounded-full bg-[#c9a84c] opacity-60" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Section>
          <motion.span variants={fadeUp} className="chapter-rule">
            What We Build
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-6 max-w-2xl text-[#111111]">
            Three Disciplines.
            <br />
            <em className="display-serif-italic text-[#888888]">One Standard of Excellence.</em>
          </motion.h2>

          <motion.div variants={stagger} className="mt-16 grid gap-6 md:grid-cols-3">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_16px_48px_-12px_rgba(201,168,76,0.15)]"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                    <Icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </div>
                  <div className="mb-3 flex items-end gap-3">
                    <span className="font-serif text-[42px] leading-none text-[#111111]">{svc.stat}</span>
                    <span className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#aaaaaa]">{svc.statLabel}</span>
                  </div>
                  <h3 className="font-serif text-[22px] text-[#111111]">{svc.title}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-[#555555]">{svc.description}</p>
                  <Link
                    href={svc.href}
                    className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-all hover:gap-3"
                  >
                    Explore
                    <ChevronRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </Section>
      </section>

      {/* ── AIRCRAFT WE SERVE ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Section>
            <div className="flex flex-col items-center text-center">
              <motion.span variants={fadeUp} className="chapter-rule">
                Airframe Coverage
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                We Service Your Aircraft
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
                Luminary holds approved data and manufacturing experience across the full spectrum of business aviation platforms — turboprop through ultra-long-range wide-body.
              </motion.p>
            </div>

            <motion.div variants={stagger} className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {aircraft.map((a) => (
                <motion.div
                  key={a.label}
                  variants={fadeUp}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white p-4 text-center transition-all hover:border-[var(--color-gold)]"
                >
                  <Plane className="h-5 w-5 text-[var(--color-gold)] opacity-70" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#222222]">{a.label}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#aaaaaa]">{a.sub}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 text-center">
              <Link
                href="/cabin-comfort-systems"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] hover:gap-3 transition-all"
              >
                View Product Catalog
                <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ── */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Section>
          <div className="flex items-end justify-between gap-6">
            <div>
              <motion.span variants={fadeUp} className="chapter-rule">
                Project Portfolio
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                Work That Speaks
                <br />
                <em className="display-serif-italic text-[#888888]">for Itself.</em>
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} className="hidden sm:block shrink-0">
              <Link
                href="/performance-history"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] hover:gap-3 transition-all"
              >
                All Case Studies
                <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </motion.div>
          </div>

          <motion.div variants={stagger} className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {caseStudies.map((study) => (
              <motion.div
                key={study.id}
                variants={fadeUp}
                className="group rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_16px_48px_-12px_rgba(201,168,76,0.12)]"
              >
                <div className="mb-4 inline-block rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.07)] px-3 py-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">{study.category}</span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{study.aircraft}</p>
                <div className="mt-3 font-serif text-[38px] leading-none text-[#111111]">{study.result}</div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-gold)]">{study.achievement}</p>
                <p className="mt-4 text-[13px] leading-[1.75] text-[#555555] line-clamp-3">{study.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{study.year}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#888888]">{study.operator}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 sm:hidden text-center">
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)]"
            >
              All Case Studies <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ── SPLIT: ADMI PLATFORM ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <Section className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div variants={fadeIn} className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.08] bg-[#ebebea]">
                <div className="flex h-full flex-col items-center justify-center gap-6 p-12">
                  <svg width="80" height="50" viewBox="0 0 38 24" fill="none" aria-hidden>
                    <path d="M2 14 L22 4 L36 8 L22 10 L28 20 L18 16 L8 20 Z" fill="#111111" opacity="0.15" />
                    <path d="M4 13.5 L34 7.5" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                    {["FAA Part 21", "EASA Cert.", "ISO 9001", "AS9100D"].map((cert) => (
                      <div key={cert} className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-center">
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#555555]">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-lg">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">Part 21 Certified</p>
                <p className="mt-1 font-serif text-[28px] text-[#111111]">25+ yrs</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">Industry leadership</p>
              </div>
            </motion.div>

            <div>
              <motion.span variants={fadeUp} className="chapter-rule">
                Our Platform
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
                The ADMI™ Advantage
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 text-[16px] leading-[1.85] text-[#555555]">
                Our proprietary Advanced Design & Manufacturing Integration platform enables rapid configuration,
                certification, and delivery of complex aircraft interior systems. Built on 25 years of Part 21
                manufacturing experience.
              </motion.p>
              <motion.ul variants={stagger} className="mt-8 space-y-4">
                {[
                  "Modular design adaptable to any airframe",
                  "In-house acoustic and thermal engineering",
                  "Concurrent certification with FAA & EASA",
                  "Dedicated program management per aircraft",
                  "Global installation and AOG support",
                  "STC library covering 100+ aircraft types",
                ].map((item) => (
                  <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                    <span className="text-[14px] leading-relaxed text-[#555555]">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp} className="mt-8 flex gap-4 flex-wrap">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                >
                  About Luminary
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
                <Link
                  href="/about/downloads"
                  className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(201,168,76,0.4)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-all hover:bg-[rgba(201,168,76,0.08)]"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  STC Library
                </Link>
              </motion.div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Section>
          <div className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule">
              Client Perspectives
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
              Trusted by Flight Departments
              <br />
              <em className="display-serif-italic text-[#888888]">Worldwide.</em>
            </motion.h2>
          </div>

          <motion.div variants={stagger} className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <motion.div
                key={t.author}
                variants={fadeUp}
                className="rounded-2xl border border-black/[0.08] bg-[#f8f8f6] p-8"
              >
                <div className="mb-5 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[var(--color-gold)] text-[var(--color-gold)]" strokeWidth={0} />
                  ))}
                </div>
                <p className="font-serif text-[18px] leading-[1.65] text-[#333333]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-black/[0.06] pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#333333]">{t.author}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaaaaa]">{t.org}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── PERFORMANCE + RESOURCES ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <Section className="grid gap-6 md:grid-cols-3">
            {/* Performance CTA */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 overflow-hidden rounded-3xl bg-[#111111] p-10 md:p-12"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                Performance History
              </span>
              <h2 className="mt-4 font-serif text-[36px] leading-[1.1] text-white sm:text-[46px]">
                See the Results.
                <br />
                <em className="font-normal italic text-white/40">In the Data.</em>
              </h2>
              <p className="mt-4 max-w-lg text-[14px] leading-[1.8] text-white/50">
                Our performance library documents acoustic and thermal results across
                every major business jet platform we&apos;ve treated.
              </p>
              <Link
                href="/performance-history"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)] hover:text-black"
              >
                View Performance Data
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>

            {/* Resource cards */}
            <motion.div variants={stagger} className="flex flex-col gap-4">
              <motion.div
                variants={fadeUp}
                className="flex flex-1 flex-col justify-between rounded-2xl border border-black/[0.08] bg-white p-7"
              >
                <div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.08] bg-[#f8f8f6]">
                    <Download className="h-4 w-4 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">STC Library</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#888888]">Download our full Supplemental Type Certificate catalog and approved data sheets.</p>
                </div>
                <Link href="/about/downloads" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                  Browse STCs <ChevronRight className="h-3 w-3" strokeWidth={2} />
                </Link>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex flex-1 flex-col justify-between rounded-2xl border border-black/[0.08] bg-white p-7"
              >
                <div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.08] bg-[#f8f8f6]">
                    <Zap className="h-4 w-4 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#111111]">AOG Support</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#888888]">Aircraft-on-ground? We offer emergency part sourcing and priority installation support.</p>
                </div>
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                  Contact Now <ChevronRight className="h-3 w-3" strokeWidth={2} />
                </Link>
              </motion.div>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
      <section className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Section className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule">
              Ready to Begin?
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
              Start Your Project
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-[15px] leading-[1.8] text-[#555555]">
              Our team responds within one business day. Whether you need a single insulation kit, a full ISR build, or a bespoke VIP completion — we&apos;re ready to scope it.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[rgba(201,168,76,0.08)] px-4 py-2">
              <Clock className="h-3.5 w-3.5 text-[var(--color-gold)]" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">Response within 1 business day</span>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:info@luminary.aero"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold-deep)]"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                Email Us
              </a>
              <a
                href="tel:+18000000000"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                +1 (800) 000-0000
              </a>
            </motion.div>
          </Section>
        </div>
      </section>

    </main>
  );
}
