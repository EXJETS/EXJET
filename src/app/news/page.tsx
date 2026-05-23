"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

const news = [
  {
    date: "Oct 2022",
    title: "Luminary Appointed Distributor of Teledyne ACES® Cabin Air Monitor",
    excerpt:
      "Luminary Air Group appointed by Teledyne Controls as distributor for ACES® cabin air quality monitoring system for the Business Aviation market. LAG will produce the STC installation kit for non-Air Transport aircraft.",
  },
  {
    date: "Jun 2021",
    title: "Luminary Receives Multi-Aircraft Award for VVIP Insulation from Boeing",
    excerpt:
      "Multi-aircraft contract awarded by Boeing to design, build and install thermal/acoustic insulation systems on numerous VVIP aircraft operated by one of their customers.",
  },
  {
    date: "Mar 2020",
    title: "Luminary Produces Face Masks for Local Hospitals During COVID-19",
    excerpt:
      "Luminary Air Group reached out to local Eastern Shore of Virginia authorities and produced face masks for local hospitals and first responders.",
  },
  {
    date: "Jan 2018",
    title: "Luminary Replacement Parts Now Available on Skygeek.com",
    excerpt:
      "Partnership with Styles Logistics (Skygeek) for distribution of commonly used replacement parts for insulation systems. M9900-3000, M9910-3000, M9948-3000 tapes now available.",
  },
  {
    date: "Feb 2017",
    title: "FAA Issues Quality Manual Approval and PMA to Luminary Air Group",
    excerpt:
      "FAA confirms Luminary meets 14 CFR airworthiness requirements. Parts Manufacturer Approval (PMA) granted — FAA PAH #PQ10024NE.",
  },
  {
    date: "Feb 2017",
    title: "Luminary Receives Supplier Approval from Gulfstream Aerospace",
    excerpt:
      "Gulfstream Aerospace Corporation granted Luminary supplier approval for materials, parts and services for thermal and acoustic insulation treatments.",
  },
  {
    date: "Jan 2017",
    title: "Luminary Air Group Adds VIP Interior Capabilities",
    excerpt:
      "New cabinet shop in Richmond Hill, GA. Luminary can now offer full VIP cabinetry fabrication, green aircraft completions, installations and design support.",
  },
];

export default function NewsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1800&q=85&fit=crop"
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
                News &amp; Press
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="display-serif text-white">
              Luminary Air Group
              <br />
              <em className="display-serif-italic text-white/40">News &amp; Announcements.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-xl text-[15px] leading-[1.9] text-white/65">
              Company announcements, programme awards, regulatory milestones, and
              industry partnerships from Luminary Air Group.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── NEWS ROWS ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <Section>
            <motion.div variants={fadeUp} className="mb-10">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
                Press Releases &amp; Announcements
              </span>
            </motion.div>
            <motion.div variants={stagger} className="divide-y divide-black/[0.07]">
              {news.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="grid gap-4 py-8 sm:grid-cols-[120px_1fr] sm:gap-10"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                    {item.date}
                  </span>
                  <div>
                    <h2
                      className="font-serif leading-tight text-[#111111]"
                      style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)" }}
                    >
                      {item.title}
                    </h2>
                    <p className="mt-3 text-[14px] leading-[1.85] text-[#555555]">{item.excerpt}</p>
                  </div>
                </motion.div>
              ))}
              <div className="border-b border-black/[0.07]" />
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="border-t border-white/[0.04] bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <Section className="flex flex-col items-start">
            <motion.h2 variants={fadeUp} className="display-serif-md text-white">
              Stay informed on programme updates
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-lg text-[15px] leading-[1.85] text-white/65">
              Receive notifications when Luminary publishes new STC approvals, programme
              awards, or technical announcements — no marketing, no noise.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-deep)]"
              >
                Contact Us <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/50 hover:text-white"
              >
                Technical Articles
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>
    </>
  );
}
