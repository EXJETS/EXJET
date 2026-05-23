"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
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
      {/* ── SECTION 1: HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1569728723197-a2d6db1cb9a9?w=1800&q=85&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 lg:pb-16 lg:pt-36">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                About Luminary Air Group
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Aviation Interior
              <br />
              <em className="display-serif-italic text-white/40">Engineering &amp; Manufacturing.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[16px] leading-[1.9] text-white/55">
              Luminary Air Group is a FAA Part 21 certified manufacturer of aircraft interior systems — acoustic
              insulation, special mission platforms, and VIP completions — with headquarters at Accomack County
              Airport, Melfa, Virginia.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: STORY SPLIT ── */}
      <section className="bg-white py-12">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Left */}
            <motion.div variants={fadeUp}>
              <blockquote className="font-serif text-[clamp(1.4rem,2.2vw,1.875rem)] leading-[1.35] text-[#111111]">
                &ldquo;We don&rsquo;t estimate performance. We measure it, certify it, and publish it.&rdquo;
              </blockquote>
              <p className="mt-10 text-[15px] leading-[1.85] text-[#555555]">
                Founded over two decades ago on Virginia&rsquo;s Eastern Shore, Luminary Air Group has grown from a
                boutique interior specialist into a full Part 21 certified manufacturer — holding our own STCs,
                operating under our own ODA authority, and delivering every project with a certified acoustic data
                package.
              </p>
            </motion.div>

            {/* Right: numbered stats */}
            <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
              {[
                { num: "01", stat: "25+ years in aviation interior manufacturing" },
                { num: "02", stat: "100+ Supplemental Type Certificates held" },
                { num: "03", stat: "FAA Part 21 & EASA certified manufacturer" },
                { num: "04", stat: "31 certification programmes led by founding team" },
              ].map((item) => (
                <motion.div
                  key={item.num}
                  variants={fadeUp}
                  className="flex items-baseline gap-8 py-6"
                >
                  <span className="w-8 shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    {item.num}
                  </span>
                  <span className="text-[15px] leading-[1.6] text-[#111111]">{item.stat}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── SECTION 3: TEAM ── */}
      <section className="bg-[#f4f3f0] py-12">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-8">
            <h2 className="display-serif-md text-[#111111]">Leadership</h2>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="flex flex-col bg-white p-10"
              >
                <div className="mb-6 border-b border-black/[0.08] pb-6">
                  <h3 className="font-serif text-[28px] leading-tight text-[#111111]">
                    {member.name}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                    {member.title}
                  </p>
                </div>

                <div className="flex-1 space-y-4 text-[14px] leading-[1.85] text-[#555555]">
                  {member.bio.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                <div className="mt-8 border-t border-black/[0.07] pt-6">
                  <span className="inline-block rounded-full border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.06)] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
                    {member.highlight}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── SECTION 4: CERTIFICATIONS ── */}
      <section className="bg-white py-12">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {certifications.map((cert) => (
              <motion.div
                key={cert.label}
                variants={fadeUp}
                className="flex flex-col items-center justify-center border border-black/[0.09] px-4 py-8 text-center transition-all hover:border-[var(--color-gold)]/40"
              >
                <span className="font-serif text-[20px] leading-none text-[var(--color-gold)]">
                  {cert.label}
                </span>
                <span className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                  {cert.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── SECTION 5: CONTACT / HQ ── */}
      <section className="bg-[#0f0f0f] py-12">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Left */}
            <motion.div variants={fadeUp}>
              <div className="mb-6 flex items-center gap-4">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                  Headquarters
                </span>
              </div>
              <h2 className="display-serif-md text-white">
                Headquartered at Accomack County Airport
              </h2>
              <div className="mt-8 space-y-5 text-[15px] leading-[1.8] text-white/55">
                <p>18321 Parkway, Melfa, VA 23410</p>
                <a
                  href="tel:+18886242400"
                  className="block transition-colors hover:text-[var(--color-gold)]"
                >
                  1-888-624-2400
                </a>
                <a
                  href="mailto:info@luminary.aero"
                  className="block transition-colors hover:text-[var(--color-gold)]"
                >
                  info@luminary.aero
                </a>
              </div>
            </motion.div>

            {/* Right: CTA */}
            <motion.div variants={fadeUp} className="flex flex-col justify-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                Programme Enquiries
              </p>
              <p className="mt-5 text-[18px] leading-[1.7] text-white/70">
                Our engineering team responds within one business day with a written brief including scope,
                timeline, and certification path.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
                >
                  Start a programme enquiry
                </Link>
              </div>
            </motion.div>
          </div>
        </Section>
      </section>
    </>
  );
}
