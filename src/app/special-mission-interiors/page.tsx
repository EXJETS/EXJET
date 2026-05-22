"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Eye,
  Heart,
  Radio,
  Shield,
  Building2,
  Zap,
  Settings,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const missionTypes = [
  {
    id: "isr",
    abbr: "ISR",
    title: "Intelligence, Surveillance & Reconnaissance",
    icon: Eye,
    description:
      "Interiors engineered around sensor racks, operator consoles, and data management systems — with rapid access behind every wall panel and under all flooring to support mission-critical equipment changes.",
  },
  {
    id: "medevac",
    abbr: "Med-Evac",
    title: "Medical Evacuation",
    icon: Heart,
    description:
      "Modular configurations accommodating litter mounts, medical equipment stations, and attendant seating — designed for rapid reconfiguration between casualty transport and standard passenger roles.",
  },
  {
    id: "c2",
    abbr: "Command & Control",
    title: "Command & Control",
    icon: Radio,
    description:
      "Purpose-built communication and command stations integrated into lightweight ADMI cabinetry — structured to form naturally around mission electronics while maintaining clean maintenance access.",
  },
  {
    id: "specops",
    abbr: "Special Ops",
    title: "Special Operations",
    icon: Shield,
    description:
      "Ruggedised, lightweight interiors for austere operating environments — durable finishes, secure storage, and rapid-reconfigure capability built for high-tempo operational use.",
  },
  {
    id: "surveillance",
    abbr: "Government / Surveillance",
    title: "Government & Surveillance",
    icon: Building2,
    description:
      "Discreet, professional cabin environments for government and surveillance platforms — clean, functional aesthetics with the technical access and modularity that sustained operations demand.",
  },
] as const;

const services = [
  {
    label: "Cabinetry Fabrication",
    desc: "Custom mission cabinetry in lightweight composite and aluminium, engineered to form around your equipment.",
  },
  {
    label: "Seating & Upholstery",
    desc: "Mission-appropriate seating systems and upholstery — durable materials selected for long-duration operational use.",
  },
  {
    label: "Repairs & Modifications",
    desc: "In-service repair and configuration modification for existing mission interiors, maintaining your operational tempo.",
  },
  {
    label: "Green Aircraft Completions",
    desc: "Full ADMI completion builds on green aircraft — from blank fuselage to mission-ready interior under one certified roof.",
  },
  {
    label: "Installation Support",
    desc: "Expert installation teams available at your location or our facility, with full documentation and maintenance records.",
  },
  {
    label: "Design Consultation",
    desc: "Mission interior design support from concept through certification — working with your programme and equipment teams.",
  },
] as const;

export default function SpecialMissionInteriorsPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  const admiRef = useRef(null);
  const admiInView = useInView(admiRef, { once: true, margin: "-80px" });

  const missionsRef = useRef(null);
  const missionsInView = useInView(missionsRef, { once: true, margin: "-80px" });

  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-80px" });

  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]" aria-hidden />
        <motion.div
          ref={heroRef}
          variants={stagger}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36"
        >
          <motion.div variants={fadeUp} className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[#c9a84c]">Special Mission Interiors</span>
              <span className="text-[#888888]">ADMI Platform</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Built for
              <br />
              <em className="display-serif-italic text-[#c9a84c]">the mission.</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              The ADMI — All Day Mission Interior — is Luminary&rsquo;s purpose-built
              platform for mission-specific aircraft interiors. Durable, lightweight,
              and modular by design; engineered to form around your equipment and
              support your mission from first deployment through sustained operations.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Discuss Your Mission
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/vip-interiors"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[#111111] transition-all hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              VIP Interiors
            </Link>
          </motion.div>

          {/* KPI band */}
          <motion.div
            variants={fadeUp}
            className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.04] sm:grid-cols-4"
          >
            {[
              { label: "Platform", value: "ADMI™" },
              { label: "Weight vs VIP", value: "Reduced" },
              { label: "Access", value: "Full Rapid" },
              { label: "Certification", value: "Part 21 Mfr" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 bg-white px-5 py-7 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                  {s.label}
                </span>
                <span className="font-serif text-[22px] leading-none text-[#111111]">
                  {s.value}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── ADMI PLATFORM 2-COL ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06]">
        <motion.div
          ref={admiRef}
          variants={stagger}
          initial="hidden"
          animate={admiInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-12 md:grid-cols-12 lg:gap-16">
            {/* Left */}
            <motion.div variants={fadeUp} className="md:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                I · The ADMI Platform
              </span>
              <div className="mt-6 mb-5">
                <div className="font-serif text-[clamp(3rem,7vw,5.5rem)] leading-none text-[#c9a84c]">
                  ADMI™
                </div>
                <div className="mt-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[#888888]">
                  All Day Mission Interior
                </div>
              </div>
              <div className="space-y-4 text-[15px] leading-[1.85] text-[#555555]">
                <p>
                  The ADMI is Luminary&rsquo;s proprietary mission interior platform —
                  engineered from first principles around the demands of sustained
                  operational use rather than adapted from a VIP design intent.
                </p>
                <p>
                  Where VIP interiors prioritise aesthetics and passenger comfort,
                  ADMI prioritises weight reduction, modular reconfiguration, equipment
                  integration, and rapid access behind every interior surface.
                </p>
                <p>
                  ADMI builds are available as green aircraft completions or as
                  retrofit projects on existing platforms — with full design support,
                  Part 21 certified manufacturing, and installation services.
                </p>
              </div>
              <Link
                href="/contact"
                className="group mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#111111] transition-colors hover:text-[#c9a84c]"
              >
                Request an ADMI briefing
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </Link>
            </motion.div>

            {/* Right — hallmarks checklist */}
            <motion.div variants={stagger} className="md:col-span-6">
              <div className="grid gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.04]">
                {[
                  {
                    icon: Zap,
                    title: "Lightweight",
                    description:
                      "ADMI cabinetry and structures are engineered in lightweight composites and aluminium alloys — delivering a measurable weight saving versus equivalent VIP-spec interiors.",
                  },
                  {
                    icon: Settings,
                    title: "Modular",
                    description:
                      "Modular panel systems and standardised mounting interfaces allow rapid role-change between configurations, adapting to evolving mission requirements without full interior removal.",
                  },
                  {
                    icon: Layers,
                    title: "Quick Access",
                    description:
                      "Every ADMI interior provides full maintenance and equipment access behind all interior walls and under all flooring — designed in from the first drawing, never retrofitted.",
                  },
                  {
                    icon: Shield,
                    title: "Mission-Adaptable",
                    description:
                      "ADMI forms naturally around mission equipment — sensor racks, console stations, communication systems, medical equipment — rather than forcing equipment to fit around the interior.",
                  },
                ].map((h) => (
                  <motion.div
                    key={h.title}
                    variants={fadeUp}
                    className="flex gap-5 bg-white px-7 py-6"
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                      <h.icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                        {h.title}
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.75] text-[#555555]">
                        {h.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── MISSION TYPES ── */}
      <section className="relative bg-white py-24 border-t border-black/[0.06]">
        <motion.div
          ref={missionsRef}
          variants={stagger}
          initial="hidden"
          animate={missionsInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                II · Mission Types
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                Interiors for every
                <br />
                <em className="display-serif-italic text-[#555555]">operational role.</em>
              </h2>
            </div>
            <p className="max-w-sm text-[14px] leading-relaxed text-[#555555] md:text-right">
              Each mission type demands a different interior configuration.
              ADMI&rsquo;s modularity makes it the platform of choice across roles.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {missionTypes.map((mission, i) => (
              <motion.div
                key={mission.id}
                variants={fadeUp}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-[#f8f8f6] p-7 transition-all hover:border-[#c9a84c] hover:shadow-[0_16px_32px_-8px_rgba(201,168,76,0.10)]",
                  i === missionTypes.length - 1 && "sm:col-span-2 lg:col-span-1"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                    <mission.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#c9a84c]">
                    {mission.abbr}
                  </span>
                </div>
                <h3 className="font-serif text-[22px] leading-tight text-[#111111]">
                  {mission.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[#555555]">
                  {mission.description}
                </p>
                <div className="mt-5 border-t border-black/[0.06] pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#111111] transition-colors hover:text-[#c9a84c]"
                  >
                    Discuss this mission type
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SERVICES LIST ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06]">
        <motion.div
          ref={servicesRef}
          variants={stagger}
          initial="hidden"
          animate={servicesInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-12 md:grid-cols-12 lg:gap-16">
            <motion.div variants={fadeUp} className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                III · Services
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                Everything your
                <br />
                <em className="display-serif-italic text-[#555555]">mission needs.</em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.85] text-[#555555]">
                Luminary provides a complete special mission interior service —
                from initial design consultation through certified manufacture,
                installation, and in-service support.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-8">
                {[
                  { value: "Part 21", label: "Certified mfr" },
                  { value: "20+", label: "Years expertise" },
                  { value: "ADMI™", label: "Proprietary platform" },
                  { value: "Full", label: "Lifecycle support" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-serif text-[28px] leading-none text-[#c9a84c]">{s.value}</div>
                    <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#888888]">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={stagger} className="md:col-span-7">
              <div className="divide-y divide-black/[0.06]">
                {services.map((service) => (
                  <motion.div
                    key={service.label}
                    variants={fadeUp}
                    className="flex items-start gap-5 py-6"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,76,0.10)] text-[#c9a84c]">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                    </span>
                    <div className="flex-1">
                      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                        {service.label}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-[1.7] text-[#555555]">
                        {service.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── DARK CTA ── */}
      <motion.section
        ref={ctaRef}
        variants={stagger}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        className="relative overflow-hidden bg-[#111111] py-24 lg:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05),transparent_70%)]" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]"
          >
            <span className="h-px w-8 bg-[#c9a84c]/50" />
            ADMI · Special Mission Interiors
            <span className="h-px w-8 bg-[#c9a84c]/50" />
          </motion.span>

          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            Discuss your mission
            <br />
            <em className="display-serif-italic text-[#c9a84c]">requirements.</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70"
          >
            Every mission is different. Tell us about your aircraft, your role
            requirements, and your programme timeline — we&rsquo;ll prepare an ADMI
            brief that addresses your specific configuration, weight targets,
            and access requirements.
          </motion.p>

          <motion.div
            variants={stagger}
            className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3 text-left"
          >
            {[
              "Green completions",
              "Retrofit projects",
              "Design support",
              "Part 21 certified",
              "Installation teams",
              "Full documentation",
            ].map((item) => (
              <motion.div key={item} variants={fadeUp} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#c9a84c]" strokeWidth={2} />
                <span className="text-[13px] text-white/70">{item}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Discuss Your Mission
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-white/50"
            >
              Cabin Comfort Systems
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}
