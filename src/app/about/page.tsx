"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { BarChart3, BadgeCheck, Shield, FileCheck2, ArrowRight, Mail, MapPin, Phone, Linkedin } from "lucide-react";

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

const values = [
  {
    icon: BarChart3,
    title: "Measurement-Driven",
    description:
      "Every acoustic outcome, weight target, and configuration specification is defined in writing before build commencement. Post-installation data is documented and issued to the operator — performance is verified, not estimated.",
  },
  {
    icon: BadgeCheck,
    title: "Certified at Every Stage",
    description:
      "FAA Part 21 manufacturer approval governs every production step from raw material receipt to final airframe installation. Regulatory traceability is not an administrative add-on — it is the manufacturing process.",
  },
  {
    icon: Shield,
    title: "Mission-Ready Reliability",
    description:
      "Luminary interiors are engineered for the demands of operational service — not just delivery-day presentation. Material selection, fastener systems, and access architecture are specified for service life, not aesthetics.",
  },
  {
    icon: FileCheck2,
    title: "Operational Transparency",
    description:
      "Programme managers and fleet operators receive complete documentation packages: scope records, configuration control logs, certification data, and maintenance instructions — enabling informed in-service decision-making.",
  },
];

const certifications = [
  { label: "FAA Part 21", sub: "Manufacturer Approval" },
  { label: "FAA ODA", sub: "Organisation Designation Auth." },
  { label: "EASA", sub: "Certified Manufacturer" },
  { label: "ISO 9001:2015", sub: "Quality Management System" },
  { label: "AS9100D", sub: "Aerospace Quality Standard" },
  { label: "ADMI™ Platform", sub: "Proprietary Mission System" },
];

const team = [
  {
    name: "David Lumgair",
    title: "Managing Partner",
    bio: [
      "David Lumgair has over 20 years of experience in aviation. He holds a commercial pilot instrument rating with single and multi-engine privileges, and is an active flight instructor with an instrument endorsement — logging over 7,000 flight hours across civilian and military fixed-wing aircraft from a two-seat Savannah Experimental to a Boeing 777. He has led 31 certification programs and test flights.",
      "David entered the completion and MRO sector at Wallops Test Flight Facility in Virginia with BaySys Technologies, before expanding into aircraft certification and safety of operations consulting. He has held operations and certification roles at Flying D Solutions, Tempus Jets, ICG (International Communications Group), and Rockwell Collins — serving as Accountable Manager at four MRO facilities and contributing to two Part 21 and one Part 145 startup facilities.",
      "A veteran of the United States Coast Guard, David also served Virginia for ten years as a Marine Police officer and pilot with the State Marine Resources Commission.",
    ],
    highlight: "7,000+ flight hours · 31 certification programmes · Coast Guard veteran",
  },
  {
    name: "Derek Davis",
    title: "Director of Engineering",
    bio: [
      "Derek Davis brings over 28 years of aviation industry experience. Exposed to commercial aviation from an early age — his father retired from Delta Airlines — Derek fuelled aircraft at DFW International Airport during college before earning a Bachelor's in Aerospace Engineering in 1990. He joined Chrysler Technologies (later Raytheon, now L-3 Communications) as Secondary Structures Lead, rising to Technical Director of BBJ programmes by 1999.",
      "Derek then joined Jormac Aerospace as Engineering Projects Manager, growing the firm from a boutique engineering services provider into a premier manufacturer of liner systems for VIP aircraft — including an interior lining system for a VIP A340 for a Kingdom of Bahrain client. He subsequently served as VP of Engineering, Senior Vice President, and President of BaySys Technologies' completion centre operations.",
      "Now as Director of Engineering at Luminary Air Group, Derek's deep inside knowledge of completion centre and manufacturing operations — domestic and worldwide — anchors Luminary's engineering team and certification capability.",
    ],
    highlight: "28+ years · BBJ Technical Director · Aerospace Engineering graduate",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36">
          <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
            <span className="h-px w-8 bg-[var(--color-gold)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
              About Luminary Air Group
            </span>
          </motion.div>

          <div className="max-w-4xl">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Over Two Decades of Certified
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                Aviation Interior Engineering
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Luminary Air Group is your partner for aircraft insulation, interiors, seating,
              and program management — operating as a FAA Part 21 approved manufacturer from
              Accomack County Airport in Virginia.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Our Performance Record
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              Contact the Team
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ── CREDENTIAL STRIP ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6]">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden border-x border-black/[0.06] bg-black/[0.04] sm:grid-cols-4">
            {[
              { value: "FAA Part 21", label: "Manufacturer", sub: "Approved authority" },
              { value: "EASA", label: "Certified", sub: "European authority" },
              { value: "AS9100D", label: "Quality System", sub: "Aerospace standard" },
              { value: "25+ Years", label: "Operational History", sub: "Founded in service" },
            ].map((c) => (
              <motion.div
                key={c.label}
                variants={fadeUp}
                className="flex flex-col items-center justify-center gap-1.5 bg-white px-6 py-10 text-center"
              >
                <span className="font-serif text-[clamp(1.25rem,2.5vw,2rem)] leading-none text-[var(--color-gold)]">
                  {c.value}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#111111]">
                  {c.label}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                  {c.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── COMPANY STORY ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 md:grid-cols-12">
            {/* Left */}
            <motion.div variants={fadeUp} className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · The Company
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                Precision Engineering.
                <br />
                <em className="display-serif-italic text-[#555555]">Certified Results.</em>
              </h2>
            </motion.div>

            {/* Right */}
            <motion.div variants={stagger} className="md:col-span-7">
              <div className="space-y-5 text-[15px] leading-[1.85] text-[#555555]">
                <motion.p variants={fadeUp}>
                  Luminary Air Group was founded on the principle that aircraft acoustic
                  performance could be predicted, targeted, and verified — not estimated.
                  From the first build, the company applied measurement science to insulation
                  engineering, establishing a methodology that has since been formalised
                  into the ADMI™ platform and applied across hundreds of aircraft programmes.
                </motion.p>
                <motion.p variants={fadeUp}>
                  The development of the ADMI™ (Advanced Design &amp; Manufacturing
                  Integration) platform marked Luminary&rsquo;s formal expansion into special
                  mission aircraft interiors. Recognising that mission platforms required a
                  purpose-built architecture rather than a reconfigured VIP approach, the
                  company invested in modular structural systems, configuration control
                  documentation, and multi-role reconfiguration methodology — all under
                  FAA Part 21 manufacturer approval.
                </motion.p>
                <motion.p variants={fadeUp}>
                  Today, Luminary serves government operators, programme managers, and fleet
                  operators requiring documented performance outcomes, certified manufacturing
                  traceability, and in-service modification support. Every programme —
                  whether an acoustic insulation upgrade, a green aircraft completion, or
                  a multi-role mission interior — is delivered with the same commitment
                  to written targets, verified results, and full certification documentation.
                </motion.p>
              </div>

              {/* Dave quote callout */}
              <motion.div
                variants={fadeUp}
                className="mt-10 rounded-2xl border border-[var(--color-gold)]/40 bg-[#f8f8f6] p-8 shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_8px_24px_-4px_rgba(201,168,76,0.06)]"
              >
                <blockquote>
                  <p className="font-serif text-[19px] italic leading-relaxed text-[#111111]">
                    &ldquo;Acoustic engineering taught us to measure first and build second.
                    That discipline — commit to a target, engineer to achieve it, document
                    the result — is the foundation of everything we deliver.&rdquo;
                  </p>
                  <cite className="mt-4 block font-mono text-[10px] not-italic uppercase tracking-[0.22em] text-[#888888]">
                    David Lumgair · Managing Partner, Luminary Air Group
                  </cite>
                </blockquote>
              </motion.div>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── OUR TEAM ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-16">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                II · Our Team
              </span>
            </div>
            <h2 className="display-serif-md max-w-xl text-[#111111]">
              Managed by experienced
              <br />
              <em className="display-serif-italic text-[#555555]">aviation professionals.</em>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] lg:p-12"
              >
                <div className="grid gap-10 lg:grid-cols-12">
                  {/* Name / title */}
                  <div className="lg:col-span-3">
                    <h3 className="font-serif text-[26px] leading-tight text-[#111111]">
                      {member.name}
                    </h3>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                      {member.title}
                    </p>
                    <p className="mt-5 font-mono text-[10px] leading-[1.7] text-[#888888]">
                      {member.highlight}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-4 text-[14px] leading-[1.85] text-[#555555] lg:col-span-9">
                    {member.bio.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── VALUES ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              III · Our Approach
            </span>
            <h2 className="display-serif-md mt-5 text-[#111111]">
              What drives every
              <br />
              <em className="display-serif-italic text-[#555555]">programme we accept.</em>
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="flex flex-col rounded-2xl border border-black/[0.08] bg-white p-8 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_24px_-6px_rgba(201,168,76,0.10)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                  <v.icon className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                  {v.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[#555555]">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              IV · Approvals &amp; Quality Standards
            </span>
            <h2 className="display-serif-md mt-5 text-[#111111]">
              Certifications &amp;
              <br />
              <em className="display-serif-italic text-[#555555]">regulatory approvals.</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {certifications.map((cert) => (
              <motion.div
                key={cert.label}
                variants={fadeUp}
                className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-white px-4 py-7 text-center transition-all hover:border-[var(--color-gold)]/40"
              >
                <span className="font-serif text-[22px] leading-none text-[var(--color-gold)]">
                  {cert.label}
                </span>
                <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                  {cert.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── HEADQUARTERS ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div variants={fadeUp}>
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  V · Headquarters
                </span>
              </div>
              <h2 className="display-serif-md text-[#111111]">
                Find us at
                <br />
                <em className="display-serif-italic text-[#555555]">Accomack County Airport.</em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.8] text-[#555555]">
                Luminary Air Group operates from Accomack County Airport on the Eastern Shore
                of Virginia — providing direct airfield access for aircraft delivery, test
                flights, and on-aircraft installation programmes.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">Luminary Air Group, LLC</p>
                    <p className="mt-0.5 text-[14px] text-[#555555]">18321 Parkway</p>
                    <p className="text-[14px] text-[#555555]">Melfa, VA 23410</p>
                  </div>
                </div>
                <a
                  href="mailto:info@luminary.aero"
                  className="flex items-center gap-3 text-[14px] text-[#555555] transition-colors hover:text-[var(--color-gold)]"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                  info@luminary.aero
                </a>
                <a
                  href="tel:+18886242400"
                  className="flex items-center gap-3 text-[14px] text-[#555555] transition-colors hover:text-[var(--color-gold)]"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                  1-888-624-2400
                </a>
                <a
                  href="https://www.linkedin.com/company/luminary-air-group"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] text-[#555555] transition-colors hover:text-[var(--color-gold)]"
                >
                  <Linkedin className="h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
                  Follow us on LinkedIn
                </a>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-start justify-center lg:justify-end"
            >
              <div className="w-full max-w-md rounded-2xl border border-black/[0.08] bg-[#f8f8f6] p-8">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  Programme Enquiries
                </h3>
                <p className="mt-3 text-[14px] leading-[1.75] text-[#555555]">
                  For new programme enquiries, STC questions, acoustic data requests, or
                  replacement parts — our team responds within one business day.
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
                >
                  New Customer Enquiry
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── DARK CTA ── */}
      <section className="relative overflow-hidden bg-[#111111] py-24 lg:py-32">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05),transparent_70%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
          >
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
            Luminary Air Group
            <span className="h-px w-8 bg-[var(--color-gold)]/50" />
          </motion.span>

          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            Work with a manufacturer that
            <br />
            <em className="display-serif-italic text-[var(--color-gold)]">
              publishes its results.
            </em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-white/70"
          >
            Every programme Luminary delivers is documented — from initial acoustic
            prediction through post-installation verification. Our engineering team is
            available to discuss your aircraft, scope, and certification requirements.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Contact the Engineering Team
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:border-white/50"
            >
              View Performance History
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </Section>
      </section>
    </>
  );
}
