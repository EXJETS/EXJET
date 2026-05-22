import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start your Luminary Air Group project. Submit an inquiry, receive an acoustic or interior consultation, and get a custom proposal for your aircraft.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · Luminary Air Group",
    description:
      "Start your project. Contact Luminary Air Group for VIP interiors, cabin comfort systems, and special mission interiors.",
    url: "https://luminary.aero/contact",
  },
};

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function ContactPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(181,180,0,0.07),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-16 sm:px-8 lg:pt-40 lg:pb-20">
          {/* Eyebrow */}
          <div className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-lime)]">Get in Touch</span>
              <span className="text-[var(--color-muted)]">
                Part 21 Manufacturer · Luminary Air Group
              </span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              Start your{" "}
              <em className="display-serif-italic text-[var(--color-lime)]">
                project.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.75] text-[var(--color-muted)]">
              Tell us about your aircraft and your objectives. We&rsquo;ll
              respond with an initial consultation and, where appropriate,
              a custom proposal tailored to your airframe and requirements.
            </p>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-12">
            {/* ── LEFT: form ─────────────────────────────────────── */}
            <div className="lg:col-span-7">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                I · Inquiry Form
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                Tell us about
                <br />
                <em className="display-serif-italic text-[var(--color-muted)]">
                  your aircraft.
                </em>
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-muted)]">
                Use the form below to submit an inquiry. We review every
                message and respond personally within one business day.
              </p>

              {/* Contact email */}
              <a
                href="mailto:info@luminary.aero"
                className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-lime)] transition-opacity hover:opacity-75"
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
                  <FormField
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                  <FormField
                    label="Company"
                    name="company"
                    type="text"
                    placeholder="Operator or company"
                  />
                </div>

                {/* Email + Aircraft Type */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                  <FormField
                    label="Aircraft Type"
                    name="aircraft_type"
                    type="text"
                    placeholder="e.g. Challenger 604, BBJ"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink)]"
                  >
                    Message{" "}
                    <span className="text-[var(--color-lime)]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Describe your project — aircraft type, scope of work, timeline, and any specific objectives or constraints."
                    required
                    className="w-full resize-none rounded-xl border border-[var(--color-hairline-strong)] bg-[var(--color-ivory)] px-4 py-3.5 text-[14px] leading-relaxed text-[var(--color-ink)] placeholder-[var(--color-subtle)] outline-none transition-colors focus:border-[var(--color-lime)] focus:ring-0"
                  />
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-8 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-lime)] hover:text-[var(--color-ink)]"
                  >
                    Submit inquiry
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="pt-1 font-mono text-[10px] leading-relaxed text-[var(--color-subtle)]">
                  Your information is used solely to respond to your inquiry
                  and will not be shared with third parties.
                </p>
              </form>
            </div>

            {/* ── RIGHT: what to expect ────────────────────────── */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                {/* What to expect */}
                <div className="rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-ivory)] p-8">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                    II · What to expect
                  </span>
                  <h3 className="mt-5 font-serif text-[26px] leading-tight text-[var(--color-ink)]">
                    How the process{" "}
                    <em className="display-serif-italic">works.</em>
                  </h3>
                  <p className="mt-3 text-[13px] leading-[1.75] text-[var(--color-muted)]">
                    From your first message to a completed proposal — every
                    step is handled personally by our team.
                  </p>

                  <div className="mt-8 space-y-6">
                    <ProcessItem
                      number="01"
                      icon={MessageSquare}
                      title="Submit your inquiry"
                      description="Use the form or email us directly. Tell us about your aircraft, the scope you have in mind, and any timeline constraints."
                    />
                    <div className="ml-5 h-px w-8 bg-[var(--color-lime)]/40" />
                    <ProcessItem
                      number="02"
                      icon={CheckCircle2}
                      title="Acoustic or interior consultation"
                      description="We review your inquiry and follow up with a personal consultation — either on-site or remotely — to fully understand your aircraft and objectives."
                    />
                    <div className="ml-5 h-px w-8 bg-[var(--color-lime)]/40" />
                    <ProcessItem
                      number="03"
                      icon={FileText}
                      title="Custom proposal"
                      description="We prepare a tailored proposal covering scope, approach, timeline, and pricing — engineered specifically for your aircraft and requirements."
                    />
                  </div>
                </div>

                {/* Part 21 + STCs callout */}
                <div className="rounded-2xl border border-[var(--color-hairline)] bg-white p-7">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime-bg)] text-[var(--color-lime)]">
                      <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink)]">
                        Part 21 Manufacturer
                      </h4>
                      <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-muted)]">
                        Every component Luminary produces carries full FAA
                        certification traceability. Our Part 21 manufacturing
                        authority is the foundation of the quality standard we
                        deliver on every project.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-[var(--color-hairline)] pt-5">
                    <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink)]">
                      Downloads &amp; STCs
                    </h4>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-muted)]">
                      Supporting documentation, Supplemental Type Certificates,
                      and technical data are available on request. Mention your
                      aircraft type in your inquiry and we will include relevant
                      documentation in our response.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function FormField({
  label,
  name,
  type,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink)]"
      >
        {label}
        {required && (
          <span className="ml-1 text-[var(--color-lime)]">*</span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-xl border border-[var(--color-hairline-strong)] bg-[var(--color-ivory)] px-4 py-3.5 text-[14px] text-[var(--color-ink)] placeholder-[var(--color-subtle)] outline-none transition-colors focus:border-[var(--color-lime)] focus:ring-0"
      />
    </div>
  );
}

function ProcessItem({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-lime)]/30 bg-[var(--color-lime-bg)] text-[var(--color-lime)]">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
            {number}
          </span>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
            {title}
          </h4>
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.7] text-[var(--color-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
