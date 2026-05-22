"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  const countersRef = useRef(null);
  const countersInView = useInView(countersRef, { once: true, margin: "-80px" });

  const storyRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-80px" });

  const daveRef = useRef(null);
  const daveInView = useInView(daveRef, { once: true, margin: "-80px" });

  const valuesRef = useRef(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: "-80px" });

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
              <span className="text-[#c9a84c]">About Luminary</span>
              <span className="text-[#888888]">Experienced · Reliable · Flexible</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-5xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Built on{" "}
              <em className="display-serif-italic text-[#c9a84c]">expertise.</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-[#555555]"
            >
              Luminary Air Group is a Part 21 aircraft interior manufacturer with more
              than two decades of experience designing, building, and installing aircraft
              interiors. Our team combines engineering precision, hands-on craftsmanship,
              and deep operational insight — led by an owner who has logged over 11,000
              flight hours.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            {["Experienced", "Reliable", "Flexible"].map((word) => (
              <span
                key={word}
                className="inline-block rounded-full border border-[#c9a84c]/40 bg-[rgba(201,168,76,0.07)] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]"
              >
                {word}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── ANIMATED COUNTERS ── */}
      <section className="relative bg-[#f8f8f6] border-t border-black/[0.06]">
        <motion.div
          ref={countersRef}
          variants={stagger}
          initial="hidden"
          animate={countersInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid grid-cols-1 gap-px overflow-hidden border-x border-black/[0.06] bg-black/[0.04] sm:grid-cols-3">
            {[
              { value: "20+", label: "Years of Experience", sub: "In aircraft interiors" },
              { value: "11,000+", label: "Flight Hours", sub: "Founder Dave Lumgair" },
              { value: "Part 21", label: "Manufacturer", sub: "FAA certified quality" },
            ].map((c) => (
              <motion.div
                key={c.label}
                variants={fadeUp}
                className="flex flex-col items-center justify-center gap-2 bg-white px-8 py-12 text-center"
              >
                <span className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-[#c9a84c]">
                  {c.value}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#111111]">
                  {c.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                  {c.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── COMPANY STORY ── 2-col ── */}
      <section className="relative bg-white py-24 border-t border-black/[0.06]">
        <motion.div
          ref={storyRef}
          variants={stagger}
          initial="hidden"
          animate={storyInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-12 md:grid-cols-12">
            {/* Left — large serif display */}
            <motion.div variants={fadeUp} className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                I · The Company
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                20 years of
                <br />
                <em className="display-serif-italic text-[#555555]">aircraft interiors.</em>
              </h2>
              <div className="mt-8 flex items-center gap-4 border-t border-black/[0.06] pt-8">
                <div className="text-center">
                  <div className="font-serif text-[40px] leading-none text-[#c9a84c]">20+</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">Years</div>
                </div>
                <div className="h-10 w-px bg-black/[0.08]" />
                <div className="text-center">
                  <div className="font-serif text-[40px] leading-none text-[#c9a84c]">P21</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">Manufacturer</div>
                </div>
                <div className="h-10 w-px bg-black/[0.08]" />
                <div className="text-center">
                  <div className="font-serif text-[40px] leading-none text-[#c9a84c]">WR</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#888888]">World record</div>
                </div>
              </div>
            </motion.div>

            {/* Right — paragraphs */}
            <motion.div variants={stagger} className="md:col-span-7">
              <div className="space-y-5 text-[15px] leading-[1.85] text-[#555555]">
                <motion.p variants={fadeUp}>
                  Luminary Air Group was founded on a simple conviction: that aircraft
                  interiors deserve the same level of engineering rigour applied to the
                  airframes they inhabit. Over more than twenty years, we have built a
                  reputation for delivering interior work that is precise, durable,
                  certified, and genuinely exceeds the performance targets we commit to
                  at the outset of every project.
                </motion.p>
                <motion.p variants={fadeUp}>
                  We operate as a Part 21 manufacturer, which means every component we
                  produce carries full regulatory traceability — from raw material
                  procurement through fabrication to final installation on the aircraft.
                  This is not simply a certification we hold; it shapes the culture of
                  quality that runs through every build we complete.
                </motion.p>
                <motion.p variants={fadeUp}>
                  Our capabilities span cabin insulation and acoustic engineering, special
                  mission interior platforms, and full VIP completions from green airframe.
                  Whatever the scope, the approach is always the same: understand the
                  aircraft and the mission, engineer the right solution, build it right,
                  and document everything.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── DAVE LUMGAIR FEATURE ── */}
      <section className="relative bg-[#f8f8f6] py-24 border-t border-black/[0.06]">
        <motion.div
          ref={daveRef}
          variants={stagger}
          initial="hidden"
          animate={daveInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-12 md:grid-cols-12">
            {/* Aside — gold-bordered feature card */}
            <motion.div variants={fadeUp} className="md:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-[#c9a84c]/40 bg-white p-8 shadow-[0_0_0_1px_rgba(201,168,76,0.10),0_8px_24px_-4px_rgba(201,168,76,0.08)]">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                  Founder &amp; Owner
                </span>
                <h3 className="mt-4 font-serif text-[32px] leading-tight text-[#111111]">
                  Dave
                  <br />
                  Lumgair
                </h3>
                <p className="mt-4 text-[13px] leading-[1.75] text-[#555555]">
                  Our founder is a pilot with over 11,000 flight hours. He understands
                  aircraft from both sides of the interior.
                </p>
                <div className="mt-6 space-y-3 border-t border-black/[0.06] pt-6">
                  {[
                    { label: "Flight hours", value: "11,000+" },
                    { label: "Role", value: "Pilot & Engineer" },
                    { label: "Certification", value: "Part 21 Mfr" },
                    { label: "Experience", value: "20+ Years" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#888888]">
                        {f.label}
                      </span>
                      <span className="font-mono text-[11px] font-medium text-[#111111]">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main bio copy */}
            <motion.div variants={stagger} className="md:col-span-8">
              <motion.span variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                II · Leadership
              </motion.span>
              <motion.h2 variants={fadeUp} className="display-serif-md mt-5 text-[#111111]">
                The pilot&rsquo;s perspective meets
                <br />
                <em className="display-serif-italic text-[#555555]">engineering precision.</em>
              </motion.h2>

              <div className="mt-8 space-y-5 text-[15px] leading-[1.85] text-[#555555]">
                <motion.p variants={fadeUp}>
                  Dave Lumgair founded Luminary Air Group having logged more than 11,000
                  flight hours across a wide range of aircraft types. That experience is
                  not incidental — it is foundational to the way Luminary approaches every
                  interior project. When you understand how a cabin feels, sounds, and
                  performs from the left seat, you think differently about what an interior
                  needs to achieve.
                </motion.p>
                <motion.p variants={fadeUp}>
                  Having operated aircraft himself for over two decades, Dave brings an
                  operator&rsquo;s perspective to every client conversation: what matters
                  in a cabin is not only how it looks on delivery day, but how it performs
                  on hour twelve of a mission, how easy it is to maintain, and how well it
                  holds up to the realities of operational service.
                </motion.p>
                <motion.p variants={fadeUp}>
                  That operator&rsquo;s lens, combined with the engineering disciplines of
                  a Part 21 manufacturer, is what distinguishes Luminary&rsquo;s work.
                  Solutions are not selected from a catalogue — they are engineered from
                  first principles for the specific airframe, mission, and operator.
                </motion.p>
              </div>

              <motion.blockquote
                variants={fadeUp}
                className="mt-8 border-l-2 border-[#c9a84c] pl-6"
              >
                <p className="font-serif text-[20px] italic leading-relaxed text-[#111111]">
                  &ldquo;When you&rsquo;ve flown the aircraft yourself, you know exactly what
                  the crew and passengers need from the interior — and nothing less is
                  acceptable.&rdquo;
                </p>
                <cite className="mt-3 block font-mono text-[11px] not-italic uppercase tracking-[0.22em] text-[#888888]">
                  Dave Lumgair, Founder
                </cite>
              </motion.blockquote>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── VALUES ── 4 animated cards ── */}
      <section className="relative bg-white py-24 border-t border-black/[0.06]">
        <motion.div
          ref={valuesRef}
          variants={stagger}
          initial="hidden"
          animate={valuesInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center mb-16">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
              III · Values
            </span>
            <h2 className="display-serif-md mt-5 text-[#111111]">
              What we stand for,
              <br />
              <em className="display-serif-italic text-[#555555]">on every build.</em>
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Precision",
                description:
                  "Every measurement, every joint, every component — built to drawing and inspected before it reaches your aircraft. Precision is non-negotiable.",
              },
              {
                number: "02",
                title: "Reliability",
                description:
                  "We commit to a scope, a schedule, and a standard — and we deliver it. Our clients return because they trust us to do exactly what we say we will.",
              },
              {
                number: "03",
                title: "Flexibility",
                description:
                  "No two aircraft projects are identical. We design and build for your specific aircraft, mission, and constraints — not a generic template.",
              },
              {
                number: "04",
                title: "Certified Quality",
                description:
                  "As a Part 21 manufacturer, every component carries full regulatory traceability. Quality is not aspirational — it is documented.",
              },
            ].map((v) => (
              <motion.div
                key={v.number}
                variants={fadeUp}
                className="flex flex-col rounded-2xl border border-black/[0.08] bg-[#f8f8f6] p-8 transition-all hover:border-[#c9a84c] hover:shadow-[0_12px_24px_-6px_rgba(201,168,76,0.10)]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c]">
                  {v.number}
                </span>
                <h3 className="mt-4 font-serif text-[26px] leading-tight text-[#111111]">
                  {v.title}
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[#555555]">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-[#111111] py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05),transparent_70%)]" aria-hidden />
        <motion.div
          ref={ctaRef}
          variants={stagger}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          className="relative mx-auto max-w-4xl px-5 text-center sm:px-8"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]"
          >
            <span className="h-px w-8 bg-[#c9a84c]/50" />
            Work with us
            <span className="h-px w-8 bg-[#c9a84c]/50" />
          </motion.span>
          <motion.h2 variants={fadeUp} className="display-serif-md mt-8 text-white">
            Let&rsquo;s discuss
            <br />
            <em className="display-serif-italic text-white/50">your next project.</em>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-white/60"
          >
            Whether you&rsquo;re planning a full green completion, an acoustic upgrade,
            or a special mission interior — tell us about your aircraft and your objectives.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
            >
              Get in touch
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-white/50"
            >
              View performance history
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
