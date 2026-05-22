"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Mail,
  Phone,
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

const inputClass =
  "w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[14px] text-[#111111] placeholder:text-[#aaaaaa] focus:border-[var(--color-gold)] focus:outline-none transition-colors";

const labelClass =
  "block font-mono text-[10px] uppercase tracking-[0.22em] text-[#555555] mb-1.5";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]"
          aria-hidden
        />
        <Section className="relative mx-auto max-w-7xl px-5 pt-28 pb-16 sm:px-8 lg:pt-40 lg:pb-20">
          <motion.div variants={fadeUp} className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-gold)]">Contact Luminary Air Group</span>
              <span className="text-[#888888]">FAA Part 21 Manufacturer</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-4xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Initiate a
              <br />
              <em className="display-serif-italic text-[var(--color-gold)]">
                Project Enquiry
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.8] text-[#555555]"
            >
              Our engineering team responds within one business day. Please provide your
              aircraft type, programme scope, and any specific requirements to accelerate
              our response.
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="mt-8 flex justify-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.06)] px-5 py-2.5">
              <Clock className="h-4 w-4 text-[var(--color-gold)]" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                Response within 1 business day
              </span>
            </span>
          </motion.div>
        </Section>
      </section>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-20">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-3">

            {/* ── LEFT: Form (col-span-2) ── */}
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · Project Enquiry Form
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                Tell us about
                <br />
                <em className="display-serif-italic text-[#555555]">your programme.</em>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#555555]">
                Use the form below to submit a project enquiry. Include your aircraft
                type, programme scope, and timeline. Every enquiry is reviewed by our
                engineering team before response.
              </p>

              {submitted ? (
                <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-gold)]/40 bg-white p-10 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(201,168,76,0.10)]">
                    <CheckCircle2 className="h-7 w-7 text-[var(--color-gold)]" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-serif text-[26px] leading-tight text-[#111111]">
                    Enquiry Received
                  </h3>
                  <p className="max-w-sm text-[14px] leading-relaxed text-[#555555]">
                    Thank you. Our engineering team will review your programme scope and
                    respond within one business day.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-10 space-y-5"
                  noValidate
                >
                  {/* Name + Organisation */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className={labelClass}>
                        Name <span className="text-[var(--color-gold)]">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="organisation" className={labelClass}>
                        Organisation / Company <span className="text-[var(--color-gold)]">*</span>
                      </label>
                      <input
                        id="organisation"
                        name="organisation"
                        type="text"
                        placeholder="Operator, MRO, or agency"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email <span className="text-[var(--color-gold)]">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="programme@operator.aero"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (000) 000-0000"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Aircraft Type */}
                  <div>
                    <label htmlFor="aircraft_type" className={labelClass}>
                      Aircraft Type
                    </label>
                    <input
                      id="aircraft_type"
                      name="aircraft_type"
                      type="text"
                      placeholder="e.g. Bombardier Challenger 604"
                      className={inputClass}
                    />
                  </div>

                  {/* Service Required */}
                  <div>
                    <label htmlFor="service_required" className={labelClass}>
                      Service Required
                    </label>
                    <select
                      id="service_required"
                      name="service_required"
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">Select a service...</option>
                      <option value="acoustic-insulation">Acoustic Insulation Systems</option>
                      <option value="special-mission">Special Mission Interior</option>
                      <option value="vip-completion">VIP Completion</option>
                      <option value="replacement-parts">Replacement Parts</option>
                      <option value="technical-consultation">Technical Consultation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Project Description */}
                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Project Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      placeholder="Describe your programme scope — aircraft configuration, mission type, timeline, acoustic targets, or certification requirements. The more detail you provide, the more specific our response can be."
                      className={`${inputClass} resize-none leading-relaxed`}
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[var(--color-gold)]"
                    >
                      Submit Enquiry
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-[#888888]">
                    Your information is used solely to respond to your enquiry and is not
                    shared with third parties.
                  </p>
                </form>
              )}
            </motion.div>

            {/* ── RIGHT: Info card (col-span-1) ── */}
            <motion.div variants={fadeUp} className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">

                {/* What happens next */}
                <div className="rounded-2xl border border-black/[0.08] bg-white p-8">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    What happens next
                  </span>
                  <div className="mt-6 space-y-6">
                    {[
                      {
                        step: "1",
                        title: "Engineering Review",
                        body: "We assess your aircraft type and programme scope within 1 business day — identifying applicable certifications and configuration options.",
                      },
                      {
                        step: "2",
                        title: "Programme Brief",
                        body: "We provide a written scope with timeline, certification path, and applicable ADMI™ platform details — specific to your airframe.",
                      },
                      {
                        step: "3",
                        title: "Project Kickoff",
                        body: "Formal engagement with a dedicated programme manager, configuration control documentation, and defined deliverables.",
                      },
                    ].map((s, i) => (
                      <div key={s.step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,76,0.10)] font-mono text-[11px] text-[var(--color-gold)]">
                            {s.step}
                          </span>
                          {i < 2 && (
                            <div className="mt-1 w-px flex-1 bg-black/[0.06]" style={{ minHeight: "1.5rem" }} />
                          )}
                        </div>
                        <div className="pb-2">
                          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                            {s.title}
                          </div>
                          <p className="mt-1.5 text-[13px] leading-[1.7] text-[#555555]">
                            {s.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct contact */}
                <div className="rounded-2xl border border-black/[0.08] bg-white px-7 py-6 space-y-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                    Direct Contact
                  </span>
                  <a
                    href="mailto:info@luminary.aero"
                    className="flex items-center gap-3 text-[14px] text-[#111111] transition-colors hover:text-[var(--color-gold)]"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-[#f8f8f6]">
                      <Mail className="h-3.5 w-3.5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </span>
                    info@luminary.aero
                  </a>
                  <a
                    href="tel:+18886242400"
                    className="flex items-center gap-3 text-[14px] text-[#111111] transition-colors hover:text-[var(--color-gold)]"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-[#f8f8f6]">
                      <Phone className="h-3.5 w-3.5 text-[var(--color-gold)]" strokeWidth={1.5} />
                    </span>
                    1-888-624-2400
                  </a>
                </div>

                {/* Credential badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-center rounded-xl border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.05)] px-4 py-4 text-center">
                    <div>
                      <div className="font-serif text-[15px] leading-none text-[var(--color-gold)]">
                        Part 21
                      </div>
                      <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#888888]">
                        Manufacturer
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center rounded-xl border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.05)] px-4 py-4 text-center">
                    <div>
                      <div className="font-serif text-[15px] leading-none text-[var(--color-gold)]">
                        ADMI™
                      </div>
                      <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#888888]">
                        Platform
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>
      </section>

      {/* ── BOTTOM STRIP ── */}
      <section className="relative border-t border-black/[0.06] bg-[#f8f8f6] py-14">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <motion.div
              variants={fadeUp}
              className="flex items-start gap-5 rounded-2xl border border-black/[0.08] bg-white px-7 py-6"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                <CheckCircle2 className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
              </span>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#111111]">
                  Replacement Parts
                </h4>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#555555]">
                  For ADMI™ replacement parts and insulation kit re-orders, reference
                  your original part numbers in your enquiry and our parts team will
                  prepare a same-day quotation.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] hover:underline"
                >
                  Submit a Parts Enquiry
                  <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-start gap-5 rounded-2xl border border-black/[0.08] bg-white px-7 py-6"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f8f8f6]">
                <Download className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
              </span>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#111111]">
                  Downloads
                </h4>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#555555]">
                  STCs, data sheets, and product documentation are available in our
                  resources section. Specify your aircraft type and applicable service
                  in your enquiry to receive targeted documentation.
                </p>
                <Link
                  href="/blog"
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)] hover:underline"
                >
                  Browse Technical Resources
                  <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                </Link>
              </div>
            </motion.div>
          </div>
        </Section>
      </section>
    </>
  );
}
