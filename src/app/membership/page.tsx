import Link from "next/link";
import { Check, ArrowRight, Shield, Clock, Globe, Headphones, Plane, Lock } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

const TIERS = [
  {
    name: "Emerald",
    deposit: 100_000,
    fee: "16%",
    feeLabel: "of operator cost",
    feeNote: "min. $1,600 / flight",
    highlight: false,
    dark: false,
    badge: null as string | null,
    features: [
      "Fully refundable deposit",
      "No expiration on funds",
      "No blackout dates",
      "No hidden fees or surcharges",
      "4,500+ ARGUS-certified aircraft",
      "24/7 concierge team",
      "Transparent wholesale pricing",
      "Pre-flight safety report",
      "DocuSign confirmed bookings",
      "9 aircraft categories",
    ],
  },
  {
    name: "Gold",
    deposit: 250_000,
    fee: "14%",
    feeLabel: "of operator cost",
    feeNote: "",
    highlight: true,
    dark: false,
    badge: "Most Popular",
    features: [
      "Everything in Emerald",
      "Priority aircraft selection",
      "Preferred routing on peak dates",
      "Dedicated account manager",
      "VIP FBO access at 500+ locations",
    ],
  },
  {
    name: "Platinum",
    deposit: 500_000,
    fee: "12%",
    feeLabel: "of operator cost",
    feeNote: "",
    highlight: false,
    dark: false,
    badge: "Premium",
    features: [
      "Everything in Gold",
      "Senior dedicated aviation advisor",
      "Guaranteed 8-hour booking notice",
      "VIP FBO suite access",
      "Companion upgrade privileges",
      "EXJET Lifestyle concierge",
    ],
  },
  {
    name: "Black",
    deposit: 1_000_000,
    fee: "10%",
    feeLabel: "of operator cost",
    feeNote: "min. $1,000 / flight",
    highlight: false,
    dark: true,
    badge: "Elite",
    features: [
      "Everything in Platinum",
      "3-hour booking notice",
      "Hot standby aircraft option",
      "Dual aircraft same-day capability",
      "Dedicated 24/7 private aviation line",
      "International routing specialist",
      "EXJET Private World membership",
      "Annual aviation performance review",
    ],
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Select your tier",
    desc: "Choose the deposit level that matches your flight frequency. All funds are fully refundable, no expiration.",
  },
  {
    step: "02",
    title: "Fly at wholesale",
    desc: "Every quote shows the actual operator cost plus EXJET's fixed management fee — nothing hidden.",
  },
  {
    step: "03",
    title: "Confirmed in under 2 hrs",
    desc: "Submit a request or call your advisor. Confirmed by DocuSign with a pre-flight ARGUS safety report.",
  },
  {
    step: "04",
    title: "Replenish and fly again",
    desc: "Funds draw down as you fly. Replenish anytime. Unused balances remain fully refundable.",
  },
];

const SAMPLE_QUOTE_ROWS = [
  { label: "Operator wholesale cost", value: "$38,400", note: "Actual operator invoice — fully disclosed" },
  { label: "Fuel surcharge (est. 12%)", value: "$4,608", note: "Included in operator cost above" },
  { label: "Landing & handling fees", value: "$1,800", note: "Included in operator cost above" },
  { label: "EXJET management fee (14%)", value: "$5,376", note: "Gold Card rate — fixed, no exceptions" },
  { label: "Federal Excise Tax (7.5%)", value: "$3,300", note: "US domestic only" },
];

export default function MembershipPage() {
  return (
    <div className="flex flex-col">
      {/* ══════════ HERO ══════════ */}
      <section className="bg-[#f2f2f7] px-4 pt-28 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              EXJET Card — Membership Program
            </span>
          </div>
          <h1 className="mt-4 text-[clamp(2.2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-[#0a1628]">
            Fly on terms that respect
            <br />
            your time.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-500">
            Fixed rates. Transparent pricing. Guaranteed access. The first private aviation card that shows
            you exactly what the operator charges — and exactly what we earn.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {["Fully refundable deposit", "No blackout dates", "No hidden fees", "No expiration"].map((f) => (
              <div key={f} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#0d1f3c]" strokeWidth={2.5} />
                <span className="text-[13px] text-neutral-600">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TIER CARDS ══════════ */}
      <section className="bg-[#f2f2f7] px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-[22px] font-semibold text-[#0a1628]">Choose your card</h2>
            <p className="mt-2 text-[14px] text-neutral-500">
              Every tier shows you the operator's wholesale cost on every quote. Our fee sits on top — nothing else.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl p-6 ${
                  tier.dark
                    ? "bg-[#0a1628] text-white shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
                    : tier.highlight
                    ? "border-2 border-[#0d1f3c] bg-white shadow-[0_8px_30px_rgba(13,31,60,0.12)]"
                    : "border border-neutral-200 bg-white"
                }`}
              >
                {tier.badge && (
                  <span
                    className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${
                      tier.dark
                        ? "bg-[rgba(255,255,255,0.12)] text-white"
                        : tier.highlight
                        ? "bg-[#0d1f3c] text-white"
                        : "bg-[#f2f2f7] text-[#0d1f3c]"
                    }`}
                  >
                    {tier.badge}
                  </span>
                )}

                <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${tier.dark ? "text-[rgba(255,255,255,0.45)]" : "text-neutral-400"}`}>
                  EXJET Card
                </p>
                <h3 className={`mt-1 text-[26px] font-semibold ${tier.dark ? "text-white" : "text-[#0a1628]"}`}>
                  {tier.name}
                </h3>

                {/* Deposit */}
                <div className={`mt-5 border-t pt-5 ${tier.dark ? "border-[rgba(255,255,255,0.1)]" : "border-neutral-200"}`}>
                  <p className={`font-mono text-[10px] uppercase tracking-widest ${tier.dark ? "text-[rgba(255,255,255,0.35)]" : "text-neutral-400"}`}>
                    Deposit
                  </p>
                  <p className={`mt-1 text-[30px] font-light tracking-tight ${tier.dark ? "text-white" : "text-[#0a1628]"}`}>
                    ${fmt(tier.deposit)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Lock className={`h-3 w-3 ${tier.dark ? "text-[rgba(255,255,255,0.35)]" : "text-neutral-400"}`} strokeWidth={1.75} />
                    <p className={`text-[11px] ${tier.dark ? "text-[rgba(255,255,255,0.35)]" : "text-neutral-400"}`}>
                      Fully refundable · No expiration
                    </p>
                  </div>
                </div>

                {/* Management fee */}
                <div className={`mt-4 border-t pt-4 ${tier.dark ? "border-[rgba(255,255,255,0.1)]" : "border-neutral-200"}`}>
                  <p className={`font-mono text-[10px] uppercase tracking-widest ${tier.dark ? "text-[rgba(255,255,255,0.35)]" : "text-neutral-400"}`}>
                    Management Fee
                  </p>
                  <p className={`mt-1 text-[24px] font-semibold ${tier.dark ? "text-white" : "text-[#0a1628]"}`}>
                    {tier.fee}
                  </p>
                  <p className={`text-[11px] leading-snug ${tier.dark ? "text-[rgba(255,255,255,0.35)]" : "text-neutral-400"}`}>
                    {tier.feeLabel}
                    {tier.feeNote && (
                      <>
                        <br />
                        {tier.feeNote}
                      </>
                    )}
                  </p>
                </div>

                {/* Features */}
                <ul className={`mt-5 flex-1 space-y-2.5 border-t pt-5 ${tier.dark ? "border-[rgba(255,255,255,0.1)]" : "border-neutral-200"}`}>
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${tier.dark ? "text-white" : "text-[#0d1f3c]"}`}
                        strokeWidth={2.5}
                      />
                      <span className={`text-[12px] leading-snug ${tier.dark ? "text-[rgba(255,255,255,0.72)]" : "text-neutral-700"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/auth/register"
                  className={`mt-6 flex items-center justify-center gap-2 rounded-full py-3 text-[13px] font-medium transition-colors ${
                    tier.dark
                      ? "bg-white text-[#0a1628] hover:bg-[rgba(255,255,255,0.9)]"
                      : tier.highlight
                      ? "bg-[#0d1f3c] text-white hover:bg-[#1a3461]"
                      : "border border-neutral-300 bg-neutral-50 text-[#0a1628] hover:bg-neutral-100"
                  }`}
                >
                  Apply for {tier.name}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[12px] text-neutral-400">
            All management fees are calculated on the operator&apos;s wholesale cost — no other charges.{" "}
            <Link href="/auth/register" className="text-[#0d1f3c] hover:underline">
              Questions? Speak with an advisor →
            </Link>
          </p>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-[22px] font-semibold text-[#0a1628]">
            How the EXJET Card works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step}>
                <p className="font-mono text-[32px] font-light text-[rgba(13,31,60,0.15)]">{step.step}</p>
                <h3 className="mt-2 text-[15px] font-semibold text-[#0a1628]">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRANSPARENT PRICING EXPLAINER ══════════ */}
      <section className="bg-[#f2f2f7] px-4 py-14">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0d1f3c]">The difference</p>
            <h2 className="mt-3 font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-normal leading-tight text-[#0a1628]">
              We show you exactly what we earn.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-neutral-500">
              Most brokers embed their margin inside a retail price. With the EXJET Card, every quote
              shows the operator&apos;s wholesale cost, then our fixed fee on top. Decide for yourself.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="bg-[#f2f2f7] px-5 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Sample Quote · Gulfstream G650 · TEB → LAX · Gold Card
              </p>
            </div>
            {SAMPLE_QUOTE_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < SAMPLE_QUOTE_ROWS.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <div>
                  <p className="text-[13px] font-medium text-[#0a1628]">{row.label}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">{row.note}</p>
                </div>
                <p className="text-[14px] font-semibold text-[#0a1628]">{row.value}</p>
              </div>
            ))}
            <div className="flex items-center justify-between bg-[#0d1f3c] px-5 py-4">
              <p className="text-[14px] font-semibold text-white">Total — all-in</p>
              <p className="text-[22px] font-bold text-white">$53,076</p>
            </div>
          </div>

          <p className="mt-4 text-center text-[12px] text-neutral-400">
            Sample only. Actual quotes vary by route, aircraft, and operator availability.
          </p>
        </div>
      </section>

      {/* ══════════ WHAT'S INCLUDED ══════════ */}
      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-[22px] font-semibold text-[#0a1628]">
            Every card includes
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: Shield, title: "ARGUS Gold only", sub: "Every operator independently certified" },
              { icon: Globe, title: "5,000+ Airports", sub: "Access across 6 continents" },
              { icon: Clock, title: "Quoted < 2 hrs", sub: "Confirmed by DocuSign" },
              { icon: Headphones, title: "24/7 Concierge", sub: "Senior aviation advisors" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="rounded-2xl border border-neutral-100 bg-[#f2f2f7] p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Icon className="h-5 w-5 text-[#0d1f3c]" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-semibold text-[#0a1628]">{title}</p>
                <p className="mt-1 text-[12px] text-neutral-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CLOSING CTA ══════════ */}
      <section className="bg-[#f2f2f7] px-4 py-10">
        <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-[#0d1f3c] px-8 py-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)]">
                <Plane className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight text-white">
              Ready to apply?
            </h2>
            <p className="mt-3 text-[14px] text-[rgba(255,255,255,0.5)]">
              Speak with a senior aviation advisor. We&apos;ll match you to the right card for your travel frequency.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-[14px] font-medium text-[#0d1f3c] transition-opacity hover:opacity-90"
              >
                Apply for a card
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.25)] px-7 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              >
                Browse fleet first
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
