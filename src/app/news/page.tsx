"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

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
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-7xl px-5 pt-28 pb-24 sm:px-8 lg:pt-44 lg:pb-36">
          <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
            <span className="h-px w-8 bg-[var(--color-gold)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
              News &amp; Press
            </span>
          </motion.div>

          <div className="max-w-4xl">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Luminary Air Group
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">News</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Company announcements, programme awards, regulatory milestones, and
              industry partnerships from Luminary Air Group.
            </motion.p>
          </div>
        </Section>
      </section>

      {/* ── NEWS GRID ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-24">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              I · Press Releases &amp; Announcements
            </span>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <motion.div key={item.title} variants={fadeUp}>
                <Link
                  href="/blog"
                  className="group flex h-full flex-col rounded-2xl border border-black/[0.08] bg-white p-7 transition-all hover:border-[var(--color-gold)] hover:shadow-[0_12px_24px_-6px_rgba(201,168,76,0.10)]"
                >
                  {/* Date */}
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    {item.date}
                  </span>

                  {/* Title */}
                  <h2 className="mt-4 line-clamp-3 font-serif text-[20px] leading-tight text-[#111111]">
                    {item.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="mt-3 flex-1 text-[13px] leading-[1.8] text-[#555555]">
                    {item.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#888888]">
                      Luminary Air Group
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] transition-transform group-hover:translate-x-0.5">
                      Read More
                      <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── SUBSCRIBE CTA ── */}
      <section className="relative overflow-hidden border-t border-black/[0.06] bg-white py-24">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.04),transparent_70%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <motion.div variants={fadeUp} className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[var(--color-gold)]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
              II · Stay Informed
            </span>
            <span className="h-px w-8 bg-[var(--color-gold)]" />
          </motion.div>

          <motion.h2 variants={fadeUp} className="display-serif-md text-[#111111]">
            Subscribe to
            <br />
            <em className="display-serif-italic text-[#555555]">programme updates.</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.8] text-[#555555]"
          >
            Receive notifications when Luminary publishes new STC approvals, programme
            awards, or technical announcements — no marketing, no noise.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
            >
              Subscribe to Updates
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              Technical Articles
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </Section>
      </section>
    </>
  );
}
