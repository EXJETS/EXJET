import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Globe, Clock, Headphones, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About EXJET",
  description: "EXJET is a technology-powered private aviation broker offering charter, jet cards, and aircraft sales with radical pricing transparency.",
};

const stats = [
  { value: "4,500+", label: "Aircraft on Platform" },
  { value: "5,000+", label: "Airports Worldwide" },
  { value: "112+", label: "Aircraft Transactions" },
  { value: "$6,500", label: "Starting Rate / hr" },
];

const values = [
  {
    icon: Shield,
    title: "Safety First",
    body: "Every aircraft on our platform holds an active ARGUS Platinum or Gold rating. We verify operator certificates, crew qualifications, and maintenance records before every flight.",
  },
  {
    icon: Globe,
    title: "Global Access",
    body: "5,000+ airports across 6 continents. Whether you're departing Teterboro or Samedan, our network reaches the destinations that matter to our clients.",
  },
  {
    icon: Clock,
    title: "Transparent Pricing",
    body: "We were founded on one idea: show clients exactly what the operator charges and exactly what EXJET earns. No markups buried in retail prices. No surprises on invoice.",
  },
  {
    icon: Headphones,
    title: "True Concierge",
    body: "Every EXJET client speaks to a senior aviation advisor — not a chatbot. 24/7, 365 days a year, with no hold times and no call centers.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f7] text-[#0a1628]">
      {/* Hero */}
      <section className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            <Link href="/" className="hover:text-[#0a1628] transition-colors">Home</Link>
            <span className="text-neutral-300">›</span>
            <span className="text-neutral-600">About</span>
          </nav>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              Private Aviation, Reimagined
            </span>
          </div>

          <h1 className="text-[clamp(2.5rem,7vw,4rem)] font-semibold leading-[1.05] tracking-tight text-[#0a1628]">
            We built EXJET because
            <br />
            <span className="text-neutral-400">the old model was broken.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-neutral-500">
            Private aviation brokers have historically hidden their margins inside inflated retail prices,
            charged peak-day surcharges, imposed blackout dates on jet cards, and kept clients in the dark
            about what the operator actually charges. EXJET was founded to change that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value} className="rounded-2xl border border-neutral-200 bg-[#f2f2f7] p-5 text-center">
                <p className="text-[clamp(1.5rem,4vw,2rem)] font-semibold tracking-tight text-[#0a1628]">{s.value}</p>
                <p className="mt-1 font-mono text-[9px] uppercase leading-snug tracking-[0.15em] text-neutral-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-[#f2f2f7] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Our Mission</p>
          <h2 className="mt-4 font-serif text-[clamp(1.8rem,4vw,2.75rem)] font-normal leading-tight text-[#0a1628]">
            Transparent private aviation for
            <em className="italic text-neutral-400"> discerning travelers.</em>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-500">
            EXJET operates as a technology-enabled aviation brokerage. We source aircraft from a curated
            network of ARGUS-certified Part 135 operators, negotiate wholesale rates, and pass the economics
            directly to our clients — showing both the operator cost and our fixed management fee on every
            quote. There is no other fee structure in private aviation like it.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-[20px] font-semibold text-[#0a1628]">What we stand for</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-neutral-200 bg-[#f2f2f7] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Icon className="h-5 w-5 text-[#0d1f3c]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-semibold text-[#0a1628]">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f2f2f7] px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="overflow-hidden rounded-3xl bg-[#0d1f3c] px-8 py-12">
            <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-semibold text-white">Ready to fly differently?</h2>
            <p className="mt-3 text-[14px] text-[rgba(255,255,255,0.5)]">
              Speak with a senior advisor or browse the fleet — no commitment required.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[#0d1f3c] hover:opacity-90"
              >
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.25)] px-6 py-3 text-[14px] font-medium text-white hover:bg-[rgba(255,255,255,0.08)]"
              >
                Browse fleet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
