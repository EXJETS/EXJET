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
} from "lucide-react";

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
  { value: "40 dB", label: "Avg. noise reduction" },
];

const capabilities = [
  { icon: Award, label: "Part 21 Manufacturer" },
  { icon: CheckCircle2, label: "FAA Certified" },
  { icon: Shield, label: "ADMI™ Platform" },
  { icon: Wrench, label: "In-House Engineering" },
  { icon: Eye, label: "ISR Specialists" },
  { icon: Plane, label: "Global Installation" },
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
                href="/cabin-comfort-systems"
                className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                Explore Products
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.08] sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center bg-white px-8 py-6">
                  <span className="font-serif text-[38px] leading-none text-[#111111]">{s.value}</span>
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

      {/* ── CLIENT MARQUEE ── */}
      <div className="border-y border-black/[0.06] bg-[#f8f8f6] py-5">
        <div className="no-scrollbar flex overflow-x-auto">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {[...clients, ...clients].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-8 px-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#aaaaaa]">{c}</span>
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

      {/* ── SPLIT: ADMI PLATFORM ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <Section className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div variants={fadeIn} className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.08] bg-[#ebebea]">
                <div className="flex h-full flex-col items-center justify-center gap-4 p-12">
                  <svg width="80" height="50" viewBox="0 0 38 24" fill="none" aria-hidden>
                    <path d="M2 14 L22 4 L36 8 L22 10 L28 20 L18 16 L8 20 Z" fill="#111111" opacity="0.15" />
                    <path d="M4 13.5 L34 7.5" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#aaaaaa]">ADMI™ Platform</span>
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
                ].map((item) => (
                  <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                    <span className="text-[14px] leading-relaxed text-[#555555]">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp} className="mt-10">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2.5 rounded-full border border-black/[0.15] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#333333] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                >
                  About Luminary
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </motion.div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Section>
          <div className="flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="chapter-rule">
              Certifications & Capabilities
            </motion.span>
            <motion.h2 variants={fadeUp} className="display-serif-md mt-6 text-[#111111]">
              Built to Certify.
              <br />
              <em className="display-serif-italic text-[#888888]">Engineered to Last.</em>
            </motion.h2>
          </div>

          <motion.div variants={stagger} className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.label}
                  variants={fadeUp}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.08] bg-[#f8f8f6] p-6 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.08] bg-white">
                    <Icon className="h-[18px] w-[18px] text-[var(--color-gold)]" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#555555]">{cap.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </Section>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#f8f8f6]">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
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
                  className="rounded-2xl border border-black/[0.08] bg-white p-8"
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
        </div>
      </section>

      {/* ── PERFORMANCE CTA ── */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Section>
          <motion.div
            variants={fadeUp}
            className="overflow-hidden rounded-3xl bg-[#111111] p-12 md:p-16"
          >
            <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  Performance History
                </span>
                <h2 className="mt-4 font-serif text-[40px] leading-[1.1] text-white sm:text-[52px]">
                  See the Results.
                  <br />
                  <em className="font-normal italic text-white/40">In the Data.</em>
                </h2>
                <p className="mt-5 max-w-lg text-[15px] leading-[1.8] text-white/50">
                  Our performance library documents acoustic and thermal results across
                  every major business jet platform we&apos;ve treated.
                </p>
              </div>
              <Link
                href="/performance-history"
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)] hover:text-black"
              >
                View Performance Data
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </motion.div>
        </Section>
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
              Our team is ready to assess your requirements and deliver a precise proposal for your aircraft interior project.
            </motion.p>
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
