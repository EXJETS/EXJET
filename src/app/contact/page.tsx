"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";

const contactChannels = [
  {
    icon: Phone,
    label: "24/7 Charter Line",
    value: "+1 (888) 399-5387",
    sub: "Available around the clock for booking and emergencies",
    href: "tel:+18883995387",
  },
  {
    icon: Mail,
    label: "General Enquiries",
    value: "hello@exjet.com",
    sub: "Responses within 2 business hours",
    href: "mailto:hello@exjet.com",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "New York, NY",
    sub: "Teterboro Airport (KTEB) — primary base",
    href: null,
  },
  {
    icon: Clock,
    label: "Concierge Hours",
    value: "24 / 7 / 365",
    sub: "No blackout dates — including holidays",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "charter", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] text-[#0a1628] placeholder:text-neutral-400 outline-none focus:border-[#0d1f3c]";
  const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500";

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-[#0a1628]">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
          <Link href="/" className="hover:text-[#0a1628] transition-colors">Home</Link>
          <span className="text-neutral-300">›</span>
          <span className="text-neutral-600">Contact</span>
        </nav>

        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Get in Touch</p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-[#0a1628]">
            We&apos;re available 24/7.
          </h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-neutral-500">
            Whether you&apos;re ready to book a flight or just have questions about the EXJET Card, our senior
            aviation advisors are standing by.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact channels */}
          <div className="space-y-4">
            {contactChannels.map(({ icon: Icon, label, value, sub, href }) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f2f7]">
                  <Icon className="h-5 w-5 text-[#0d1f3c]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">{label}</p>
                  {href ? (
                    <a href={href} className="mt-0.5 text-[15px] font-semibold text-[#0a1628] hover:text-[#0d1f3c] hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-[15px] font-semibold text-[#0a1628]">{value}</p>
                  )}
                  <p className="mt-0.5 text-[12px] text-neutral-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(13,31,60,0.08)]">
                  <CheckCircle2 className="h-7 w-7 text-[#0d1f3c]" strokeWidth={1.75} />
                </div>
                <h2 className="text-[20px] font-semibold text-[#0a1628]">Message sent</h2>
                <p className="mt-2 text-[13px] text-neutral-500">
                  Your concierge will respond within 2 hours.
                  <br />
                  For urgent matters, call our 24/7 charter line.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-full border border-neutral-300 px-5 py-2 text-[12px] font-medium text-[#0a1628] hover:bg-neutral-100"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Send a Message</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      type="text" required value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="John Doe" className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      type="tel" value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000" className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com" className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Subject</label>
                  <select value={form.subject} onChange={(e) => update("subject", e.target.value)} className={inputCls}>
                    <option value="charter">Charter Enquiry</option>
                    <option value="jetcard">EXJET Card</option>
                    <option value="aircraft-sales">Aircraft Sales / Acquisition</option>
                    <option value="empty-legs">Empty Leg Deals</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Message</label>
                  <textarea
                    required value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    rows={4} placeholder="Tell us about your travel needs..."
                    className={inputCls + " resize-none"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#0d1f3c] py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1a3461] active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
