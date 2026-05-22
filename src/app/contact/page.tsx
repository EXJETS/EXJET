"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-[14px] text-[#111111] outline-none ring-0 transition-all focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/10 placeholder:text-[#aaaaaa]";

const labelClass =
  "block font-mono text-[10px] uppercase tracking-[0.22em] text-[#555555] mb-1.5";

export default function ContactPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  const formRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: "-80px" });

  const bottomRef = useRef(null);
  const bottomInView = useInView(bottomRef, { once: true, margin: "-80px" });

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
          className="relative mx-auto max-w-7xl px-5 pt-28 pb-16 sm:px-8 lg:pt-40 lg:pb-20"
        >
          <motion.div variants={fadeUp} className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[#c9a84c]">Get in Touch</span>
              <span className="text-[#888888]">Part 21 Manufacturer · Luminary Air Group</span>
            </span>
          </motion.div>

          <div className="mx-auto max-w-4xl text-center">
            <motion.h1 variants={fadeUp} className="display-serif text-[#111111]">
              Start your{" "}
              <em className="display-serif-italic text-[#c9a84c]">project.</em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.75] text-[#555555]"
            >
              Tell us about your aircraft and your objectives. We&rsquo;ll respond with an
              initial consultation and, where appropriate, a custom proposal tailored to
              your airframe and requirements.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <section className="relative bg-[#f8f8f6] py-20 border-t border-black/[0.06]">
        <motion.div
          ref={formRef}
          variants={stagger}
          initial="hidden"
          animate={formInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-16 lg:grid-cols-12">

            {/* ── LEFT: form ── */}
            <motion.div variants={fadeUp} className="lg:col-span-7">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                I · Inquiry Form
              </span>
              <h2 className="display-serif-md mt-5 text-[#111111]">
                Tell us about
                <br />
                <em className="display-serif-italic text-[#555555]">your aircraft.</em>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#555555]">
                Use the form below to submit an inquiry. We review every message and
                respond personally within one business day.
              </p>

              <a
                href="mailto:info@luminary.aero"
                className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-[#c9a84c] transition-opacity hover:opacity-75"
              >
                <Mail className="h-4 w-4" strokeWidth={1.75} />
                info@luminary.aero
              </a>

              {/* Form */}
              <form
                action="/api/contact"
                method="POST"
                className="mt-10 space-y-5"
                noValidate
              >
                {/* Name + Company */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Name <span className="text-[#c9a84c]">*</span>
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
                    <label htmlFor="company" className={labelClass}>
                      Company
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Operator or company"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email <span className="text-[#c9a84c]">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
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

                {/* Aircraft type + Service type */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="aircraft_type" className={labelClass}>
                      Aircraft Type
                    </label>
                    <input
                      id="aircraft_type"
                      name="aircraft_type"
                      type="text"
                      placeholder="e.g. Challenger 604, BBJ"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="service_type" className={labelClass}>
                      Service Type
                    </label>
                    <select
                      id="service_type"
                      name="service_type"
                      className={cn(inputClass, "cursor-pointer")}
                    >
                      <option value="">Select a service...</option>
                      <option value="cabin-comfort-systems">Cabin Comfort Systems</option>
                      <option value="special-mission-interiors">Special Mission Interiors</option>
                      <option value="vip-interiors">VIP Interiors</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={labelClass}>
                    Message <span className="text-[#c9a84c]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Describe your project — aircraft type, scope of work, timeline, and any specific objectives or constraints."
                    required
                    className={cn(inputClass, "resize-none leading-relaxed")}
                  />
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-8 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[#b8963e]"
                  >
                    Submit inquiry
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                </div>

                <p className="pt-1 font-mono text-[10px] leading-relaxed text-[#888888]">
                  Your information is used solely to respond to your inquiry and will not
                  be shared with third parties.
                </p>
              </form>
            </motion.div>

            {/* ── RIGHT: what to expect ── */}
            <motion.div variants={fadeUp} className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                {/* What to expect card */}
                <div className="rounded-2xl border border-black/[0.08] bg-white p-8">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                    II · What to expect
                  </span>
                  <h3 className="mt-5 font-serif text-[26px] leading-tight text-[#111111]">
                    How the process{" "}
                    <em className="display-serif-italic">works.</em>
                  </h3>
                  <p className="mt-3 text-[13px] leading-[1.75] text-[#555555]">
                    From your first message to a completed proposal — every step is handled
                    personally by our team.
                  </p>

                  <div className="mt-8 space-y-6">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                          <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#888888]">01</span>
                          <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                            Submit your inquiry
                          </h4>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-[1.7] text-[#555555]">
                          Use the form or email us directly. Tell us about your aircraft,
                          the scope you have in mind, and any timeline constraints.
                        </p>
                      </div>
                    </div>

                    <div className="ml-5 h-px w-8 bg-[#c9a84c]/30" />

                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                          <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#888888]">02</span>
                          <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                            Consultation
                          </h4>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-[1.7] text-[#555555]">
                          We review your inquiry and follow up with a personal consultation
                          — either on-site or remotely — to fully understand your aircraft
                          and objectives.
                        </p>
                      </div>
                    </div>

                    <div className="ml-5 h-px w-8 bg-[#c9a84c]/30" />

                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                          <FileText className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#888888]">03</span>
                          <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111]">
                            Custom proposal
                          </h4>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-[1.7] text-[#555555]">
                          We prepare a tailored proposal covering scope, approach, timeline,
                          and pricing — engineered specifically for your aircraft and
                          requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact details */}
                <div className="rounded-2xl border border-black/[0.08] bg-white p-7 space-y-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
                    Direct contact
                  </span>
                  <a
                    href="mailto:info@luminary.aero"
                    className="flex items-center gap-3 text-[14px] text-[#111111] transition-colors hover:text-[#c9a84c]"
                  >
                    <Mail className="h-4 w-4 text-[#c9a84c]" strokeWidth={1.75} />
                    info@luminary.aero
                  </a>
                  <a
                    href="tel:+1-000-000-0000"
                    className="flex items-center gap-3 text-[14px] text-[#111111] transition-colors hover:text-[#c9a84c]"
                  >
                    <Phone className="h-4 w-4 text-[#c9a84c]" strokeWidth={1.75} />
                    Contact us by phone on request
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── BOTTOM STRIP — Part 21 + STCs ── */}
      <section className="relative bg-white border-t border-black/[0.06] py-12">
        <motion.div
          ref={bottomRef}
          variants={stagger}
          initial="hidden"
          animate={bottomInView ? "visible" : "hidden"}
          className="mx-auto max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div variants={fadeUp} className="flex items-start gap-4 rounded-2xl border border-black/[0.08] bg-[#f8f8f6] px-7 py-6">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#111111]">
                  Part 21 Manufacturer
                </h4>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#555555]">
                  Every component Luminary produces carries full FAA certification
                  traceability. Our Part 21 authority is the foundation of our quality
                  standard.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-start gap-4 rounded-2xl border border-black/[0.08] bg-[#f8f8f6] px-7 py-6">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,76,0.07)] text-[#c9a84c]">
                <FileText className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#111111]">
                  STCs &amp; Documentation
                </h4>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#555555]">
                  Supplemental Type Certificates and technical documentation are
                  available on request. Mention your aircraft type and we&rsquo;ll include
                  relevant paperwork in our response.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-between rounded-2xl border border-[#c9a84c]/30 bg-[rgba(201,168,76,0.05)] px-7 py-6 sm:col-span-2 lg:col-span-1"
            >
              <div>
                <div className="font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] leading-none text-[#c9a84c]">
                  Part 21
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                  Certified manufacturer
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-[clamp(1.25rem,2.5vw,1.75rem)] leading-none text-[#c9a84c]">
                  STC
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                  Supplemental type certs
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
