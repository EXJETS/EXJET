"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

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

const inputClass =
  "w-full border border-black/[0.12] bg-white px-4 py-3.5 text-[14px] text-[#111111] placeholder:text-[#aaaaaa] focus:border-[var(--color-gold)] focus:outline-none transition-colors";

const labelClass = "block font-mono text-[10px] uppercase tracking-[0.22em] text-[#555555] mb-2";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* ── SECTION 1: HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "52vh" }}>
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1800&q=85&fit=crop"
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
                Contact Luminary Air Group
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-serif text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
              Project Enquiry.
              <br />
              <span style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}><em className="display-serif-italic text-white/40">We respond within one business day.</em></span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-[16px] leading-[1.9] text-white/55">
              Provide your aircraft type and programme scope. Our engineering team will respond with a written brief
              including scope, timeline, and certification path.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: FORM + INFO ── */}
      <section className="bg-white py-12">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-5">

            {/* LEFT: Form (~60%) */}
            <motion.div variants={fadeUp} className="lg:col-span-3">
              {submitted ? (
                <div className="flex flex-col gap-6 border border-[var(--color-gold)]/30 bg-[rgba(201,168,76,0.04)] p-12">
                  <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                    Enquiry Received
                  </p>
                  <p className="font-serif text-[22px] leading-tight text-[#111111]">
                    Your enquiry has been received. We will respond within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Full Name <span className="text-[var(--color-gold)]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className={labelClass}>
                      Company / Organisation <span className="text-[var(--color-gold)]">*</span>
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Operator, MRO, programme manager, or agency"
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address <span className="text-[var(--color-gold)]">*</span>
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

                  {/* Programme Scope */}
                  <div>
                    <label htmlFor="scope" className={labelClass}>
                      Programme Scope
                    </label>
                    <textarea
                      id="scope"
                      name="scope"
                      rows={5}
                      placeholder="Describe your programme scope — acoustic targets, mission type, timeline, certification requirements, or any specific configuration details."
                      className={`${inputClass} resize-none leading-relaxed`}
                    />
                  </div>

                  {/* How did you hear */}
                  <div>
                    <label htmlFor="source" className={labelClass}>
                      How did you hear about us?
                    </label>
                    <select
                      id="source"
                      name="source"
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">Select an option...</option>
                      <option value="google">Google</option>
                      <option value="referral">Referral</option>
                      <option value="trade-show">Trade show</option>
                      <option value="existing-customer">Existing customer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-gold)] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-all hover:bg-[#b8963e]"
                    >
                      Send Enquiry
                    </button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* RIGHT: Contact info (~40%) */}
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <div className="sticky top-24 border border-black/[0.09]">
                {/* Direct Contact */}
                <div className="border-b border-black/[0.09] px-6 py-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                    Direct Contact
                  </p>
                  <div className="mt-6 space-y-4">
                    <a
                      href="tel:+18886242400"
                      className="block text-[15px] text-[#111111] transition-colors hover:text-[var(--color-gold)]"
                    >
                      1-888-624-2400
                    </a>
                    <a
                      href="mailto:info@luminary.aero"
                      className="block text-[15px] text-[#111111] transition-colors hover:text-[var(--color-gold)]"
                    >
                      info@luminary.aero
                    </a>
                    <p className="text-[14px] leading-[1.6] text-[#555555]">
                      18321 Parkway<br />Melfa, VA 23410
                    </p>
                    <a
                      href="https://www.linkedin.com/company/luminary-air-group"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[14px] text-[#555555] transition-colors hover:text-[var(--color-gold)]"
                    >
                      linkedin.com/company/luminary-air-group
                    </a>
                  </div>
                </div>

                {/* What to expect */}
                <div className="px-6 py-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--color-gold)]">
                    What to expect
                  </p>
                  <div className="mt-6 space-y-6">
                    {[
                      {
                        num: "1",
                        label: "Receive written brief",
                        desc: "1 business day",
                      },
                      {
                        num: "2",
                        label: "Engineering scoping call",
                        desc: "Review aircraft and programme requirements",
                      },
                      {
                        num: "3",
                        label: "Proposal & timeline",
                        desc: "Scope, certification path, and cost",
                      },
                    ].map((step, i, arr) => (
                      <div key={step.num} className="flex gap-5">
                        <div className="flex flex-col items-center">
                          <span className="shrink-0 font-mono text-[11px] text-[var(--color-gold)]">
                            {step.num}
                          </span>
                          {i < arr.length - 1 && (
                            <div className="mt-2 w-px flex-1 bg-black/[0.08]" style={{ minHeight: "1.5rem" }} />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#111111]">
                            {step.label}
                          </p>
                          <p className="mt-1 text-[13px] leading-[1.6] text-[#888888]">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </Section>
      </section>

      {/* ── SECTION 3: AOG DARK CTA ── */}
      <section className="bg-[#0f0f0f] py-10">
        <Section className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div variants={fadeUp} className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-gold)]">
              AOG Support
            </p>
            <p className="mt-5 font-serif text-[clamp(1.25rem,2vw,1.5rem)] text-white/75">
              AOG support line &middot; 1-888-624-2400 &middot; Priority response for aircraft on ground.
            </p>
          </motion.div>
        </Section>
      </section>
    </>
  );
}
