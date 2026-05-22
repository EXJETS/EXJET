"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Eye,
  HeartPulse,
  Radio,
  Shield,
  Building2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Download,
} from "lucide-react";

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

const missionPlatforms = [
  {
    id: "isr",
    abbr: "ISR",
    title: "Intelligence, Surveillance & Reconnaissance",
    icon: Eye,
    description:
      "ISR-configured interiors are engineered around operator consoles, sensor rack integration, and data management station placement. Structural provisions for equipment mounting are designed to drawing from the first build, not field-modified. Rapid-access panels behind all interior walls ensure unscheduled maintenance does not compromise operational tempo.",
  },
  {
    id: "medevac",
    abbr: "Med-Evac",
    title: "Medical Evacuation",
    icon: HeartPulse,
    description:
      "ADMI Med-Evac configurations accommodate certified litter mount systems, medical equipment stations, oxygen distribution provisions, and attendant seating — all within a modular architecture that permits rapid role-change to standard passenger configuration. Airworthiness documentation is maintained across all configured states.",
  },
  {
    id: "c2",
    abbr: "C2",
    title: "Command & Control",
    icon: Radio,
    description:
      "Command and control platforms require communication rack integration, console furniture, and cabling management that is both lightweight and maintenance-accessible. ADMI C2 cabinetry is structured to form naturally around installed mission electronics while preserving clean routing for communications, power, and data throughout the service life.",
  },
  {
    id: "specops",
    abbr: "Special Ops",
    title: "Special Operations",
    icon: Shield,
    description:
      "High-tempo operational platforms require interiors that tolerate austere conditions without serviceability degradation. ADMI Special Operations configurations use ruggedised finishes, secure storage solutions, and rapid-reconfigure architecture optimised for mission turnaround. Weight targets are documented and verified at installation.",
  },
  {
    id: "gov-surveillance",
    abbr: "Gov / Surv",
    title: "Government & Surveillance",
    icon: Building2,
    description:
      "Government surveillance platforms demand discreet, functional cabin environments with the technical access and modularity that sustained multi-year operational service requires. Luminary delivers these completions under full FAA Part 21 manufacturer approval, with configuration control documentation maintained from initial build through subsequent modifications.",
  },
] as const;

const scopeOfServices = [
  "Green Aircraft Completions",
  "In-Service Modifications & Upgrades",
  "Custom Mission Cabinetry & Fabrication",
  "Acoustic Treatment for Extended Crew Operations",
  "Seating, Upholstery & Ergonomic Systems",
  "Documentation, Configuration Control & Certification",
];

export default function SpecialMissionInteriorsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36">
          <motion.div variants={fadeUp} className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-gold)]">Special Mission Interiors</span>
              <span className="text-[#888888]">ADMI™ Platform</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Mission-Configured Interiors
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                for Demanding Operations
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Luminary&rsquo;s ADMI™ (Advanced Design &amp; Manufacturing Integration)
              platform delivers certified special mission interiors engineered for sustained
              crew effectiveness across ISR, Med-Evac, C2, and government platforms.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Request a Programme Brief
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="#admi-platform"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              About ADMI™
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ── ADMI PLATFORM ── */}
      <section
        id="admi-platform"
        className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24"
      >
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12 lg:gap-20">
            {/* Left */}
            <motion.div variants={fadeUp} className="flex flex-col justify-center md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · The ADMI™ Platform
              </span>
              <div className="mt-6 mb-4">
                <div className="font-serif text-[clamp(3.5rem,8vw,6rem)] leading-none text-[var(--color-gold)]">
                  ADMI™
                </div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#888888]">
                  Advanced Design &amp; Manufacturing Integration
                </div>
              </div>
              <p className="mt-4 text-[15px] leading-[1.85] text-[#555555]">
                Purpose-engineered for mission aircraft. Modular architecture. Certified
                configuration control. In-service modification support.
              </p>
              <p className="mt-4 text-[15px] leading-[1.85] text-[#555555]">
                Where conventional completions adapt a passenger cabin to a secondary
                purpose, ADMI builds begin with mission requirements — equipment integration,
                crew endurance, access architecture — and constructs the interior around
                them under FAA Part 21 manufacturer approval.
              </p>
            </motion.div>

            {/* Right — hallmarks */}
            <motion.div variants={stagger} className="md:col-span-7">
              <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                {[
                  {
                    title: "Modular cabinetry adaptable to any airframe configuration",
                    detail:
                      "Standardised ADMI mounting interfaces allow role-change between configurations without full interior removal — preserving programme flexibility across the airframe service life.",
                  },
                  {
                    title: "Certified under FAA Part 21 and EASA manufacturer approval",
                    detail:
                      "Every ADMI completion is manufactured under Luminary&rsquo;s FAA Part 21 authority. Certification documentation is maintained and traceable from raw material to final installation.",
                  },
                  {
                    title: "Configuration management from initial build through service life",
                    detail:
                      "ADMI configuration control documentation captures every modification state — enabling rapid return to any prior configuration and supporting supplemental type certificate compliance.",
                  },
                  {
                    title: "Rapid reconfiguration capability for multi-role platforms",
                    detail:
                      "Panel systems and structural provisions engineered for documented reconfiguration times, supporting multi-role operators who require verifiable turnaround between mission configurations.",
                  },
                ].map((h) => (
                  <motion.div
                    key={h.title}
                    variants={fadeUp}
                    className="flex items-start gap-5 px-8 py-6"
                  >
                    <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <CheckCircle2
                        className="h-5 w-5 text-[var(--color-gold)]"
                        strokeWidth={1.5}
                      />
                    </span>
                    <div>
                      <div className="text-[14px] font-medium leading-snug text-[#111111]">
                        {h.title}
                      </div>
                      <p
                        className="mt-2 text-[13px] leading-[1.75] text-[#555555]"
                        dangerouslySetInnerHTML={{ __html: h.detail }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── MISSION PLATFORMS ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-14 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              II · Platforms We Support
            </span>
            <h2 className="display-serif-md mt-5 text-[#111111]">
              Certified for every
              <br />
              <em className="display-serif-italic text-[#555555]">mission role.</em>
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {missionPlatforms.map((m, i) => (
              <motion.div
                key={m.id}
                variants={fadeUp}
                className={`flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_32px_-8px_rgba(201,168,76,0.10)]${
                  i === missionPlatforms.length - 1 ? " sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                    <m.icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    {m.abbr}
                  </span>
                </div>
                <h3 className="font-serif text-[22px] leading-tight text-[#111111]">
                  {m.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[#555555]">
                  {m.description}
                </p>
                <div className="mt-6 border-t border-black/[0.06] pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:text-[var(--color-gold)]"
                  >
                    Discuss this platform
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── SCOPE OF SERVICES ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 md:grid-cols-12">
            <motion.div variants={fadeUp} className="md:col-span-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                III · Scope of Services
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                Full lifecycle
                <br />
                <em className="display-serif-italic text-[#555555]">capability.</em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.85] text-[#555555]">
                Luminary delivers the complete scope of special mission interior work —
                from green aircraft completions through certification documentation and
                long-term in-service modification support.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-5 border-t border-black/[0.06] pt-8">
                {[
                  { value: "Part 21", label: "Mfr approval" },
                  { value: "EASA", label: "Certified" },
                  { value: "AS9100D", label: "Quality system" },
                  { value: "FAA ODA", label: "Designee" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-serif text-[26px] leading-none text-[var(--color-gold)]">
                      {s.value}
                    </div>
                    <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#888888]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={stagger} className="md:col-span-8">
              <div className="grid gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.04] sm:grid-cols-2">
                {scopeOfServices.map((svc) => (
                  <motion.div
                    key={svc}
                    variants={fadeUp}
                    className="flex items-center gap-4 bg-white px-7 py-5"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                      <CheckCircle2
                        className="h-5 w-5 text-[var(--color-gold)]"
                        strokeWidth={1.5}
                      />
                    </span>
                    <span className="text-[14px] leading-snug text-[#111111]">{svc}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── DARK CTA ── */}
      <section className="relative overflow-hidden bg-[#111111] py-24 lg:py-32">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06),transparent_70%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
          >
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
            ADMI™ · Special Mission Interiors
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
          </motion.span>

          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            Luminary holds the approvals.
            <br />
            <em className="display-serif-italic text-[var(--color-gold)]">
              You hold the mission.
            </em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70"
          >
            Provide your aircraft type, programme scope, and timeline. Our engineering
            team will prepare a written programme brief addressing configuration, weight
            targets, certification path, and ADMI™ platform applicability.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Initiate a Programme Brief
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:border-white/50"
            >
              Download ADMI™ Overview
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </Section>
      </section>
    </>
  );
}
