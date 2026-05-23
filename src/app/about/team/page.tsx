"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

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

const team = [
  {
    name: "David Lumgair",
    title: "Managing Partner",
    highlight: [
      "7,000+ flight hours",
      "31 certification programmes",
      "US Coast Guard veteran",
    ],
    bio: [
      "David Lumgair has over 20 years of experience in aviation. He holds a commercial pilot instrument rating with single and multi-engine privileges, and is an active flight instructor with an instrument endorsement — logging over 7,000 flight hours across civilian and military fixed-wing aircraft, from a two-seat Savannah Experimental to a Boeing 777. He has led 31 certification programmes and test flights.",
      "David entered the completion and MRO sector at Wallops Test Flight Facility in Virginia with BaySys Technologies, before expanding into aircraft certification and safety of operations consulting. He has held operations and certification roles at Flying D Solutions, Tempus Jets, ICG (International Communications Group), and Rockwell Collins — serving as Accountable Manager at four MRO facilities and contributing to two Part 21 and one Part 145 startup facilities.",
      "A veteran of the United States Coast Guard, David also served Virginia for ten years as a Marine Police officer and pilot with the State Marine Resources Commission.",
    ],
  },
  {
    name: "Derek Davis",
    title: "Director of Engineering",
    highlight: [
      "28+ years industry experience",
      "BBJ Technical Director",
      "Aerospace Engineering graduate",
    ],
    bio: [
      "Derek Davis brings over 28 years of aviation industry experience. Exposed to commercial aviation from an early age — his father retired from Delta Airlines — Derek fuelled aircraft at DFW International Airport during college before earning a Bachelor's in Aerospace Engineering in 1990. He joined Chrysler Technologies (later Raytheon, now L-3 Communications) as Secondary Structures Lead, rising to Technical Director of BBJ programmes by 1999.",
      "Derek then joined Jormac Aerospace as Engineering Projects Manager, growing the firm from a boutique engineering services provider into a premier manufacturer of liner systems for VIP aircraft — including an interior lining system for a VIP A340 for a Kingdom of Bahrain client. He subsequently served as VP of Engineering, Senior Vice President, and President of BaySys Technologies' completion centre operations, becoming a proficient instrument-rated pilot during those years.",
      "Now as Director of Engineering at Luminary Air Group, Derek's deep inside knowledge of completion centre and manufacturing operations — domestic and worldwide — anchors Luminary's engineering team and certification capability.",
    ],
  },
];

export default function TeamPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36">
          <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
            <span className="h-px w-8 bg-[var(--color-gold)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
              Our Team
            </span>
          </motion.div>

          <div className="max-w-4xl">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Experienced Aviation
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                Professionals
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Luminary Air Group is led by practitioners who have spent careers inside
              completion centres, certification programmes, and operational flight
              departments — bringing genuine industry depth to every programme we accept.
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#555555] transition-colors hover:text-[var(--color-gold)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              Back to About
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* ── TEAM BIOS ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="space-y-12">
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] lg:p-12"
              >
                <div className="grid gap-10 lg:grid-cols-12">
                  {/* Left: Name / title / stats */}
                  <div className="lg:col-span-3">
                    <h2 className="font-serif text-[26px] leading-tight text-[#111111]">
                      {member.name}
                    </h2>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                      {member.title}
                    </p>
                    <div className="mt-5 space-y-2">
                      {member.highlight.map((stat) => (
                        <p
                          key={stat}
                          className="font-mono text-[10px] leading-[1.7] text-[#888888]"
                        >
                          {stat}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Right: Bio paragraphs */}
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

      {/* ── BOTTOM LINKS ── */}
      <section className="relative border-t border-black/[0.06] bg-white py-20">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <motion.div variants={fadeUp}>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                Learn more about Luminary
              </p>
              <h2 className="display-serif-md mt-3 text-[#111111]">
                Explore our{" "}
                <em className="display-serif-italic text-[#555555]">capabilities.</em>
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                About Luminary
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
              >
                Contact the Team
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                href: "/cabin-comfort-systems",
                label: "Cabin Comfort Systems",
                sub: "Insulation STCs & acoustic engineering",
              },
              {
                href: "/special-mission-interiors",
                label: "Special Mission Interiors",
                sub: "ADMI™ platform & government solutions",
              },
              {
                href: "/vip-interiors",
                label: "VIP Interiors",
                sub: "Cabinetry, completions & upholstery",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-2xl border border-black/[0.08] bg-[#f8f8f6] px-6 py-5 transition-all hover:border-[var(--color-gold)] hover:bg-white"
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                    {link.label}
                  </p>
                  <p className="mt-1 text-[12px] text-[#888888]">{link.sub}</p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[var(--color-gold)] transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </Link>
            ))}
          </motion.div>
        </Section>
      </section>
    </>
  );
}
