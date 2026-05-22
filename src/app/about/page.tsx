import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Luminary Air Group",
  description:
    "20 years of aircraft interiors. Owner Dave Lumgair holds 11,000+ flight hours. Part 21 manufacturer. Experienced. Reliable. Flexible.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Luminary Air Group",
    description:
      "Built on expertise. 20+ years of aircraft interior design, manufacturing and installation — led by a pilot with 11,000+ hours.",
    url: "https://luminary.aero/about",
  },
};

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(181,180,0,0.07),transparent_70%)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 sm:px-8 lg:pt-40 lg:pb-32">
          {/* Eyebrow */}
          <div className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-gold)]">About Luminary</span>
              <span className="text-white/50">
                Experienced · Reliable · Flexible
              </span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-white">
              Built on{" "}
              <em className="display-serif-italic text-[var(--color-gold)]">
                expertise.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-white/50">
              Luminary Air Group is a Part 21 aircraft interior manufacturer
              with more than two decades of experience designing, building,
              and installing aircraft interiors. Our team combines engineering
              precision, hands-on craftsmanship, and deep operational insight
              — led by an owner who has also logged over 11,000 flight hours.
            </p>
          </div>

          {/* Tagline badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {["Experienced", "Reliable", "Flexible"].map((word) => (
              <span
                key={word}
                className="inline-block rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold-bg)] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANY STORY ─────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-black py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            {/* Left — large serif display */}
            <div className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                I · The Company
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                20 years of
                <br />
                <em className="display-serif-italic text-white/50">
                  aircraft interiors.
                </em>
              </h2>
              <div className="mt-8 flex items-center gap-4 border-t border-white/[0.07] pt-8">
                <div className="text-center">
                  <div className="font-serif text-[40px] leading-none text-[var(--color-gold)]">
                    20+
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
                    Years
                  </div>
                </div>
                <div className="h-10 w-px bg-[var(--color-hairline)]" />
                <div className="text-center">
                  <div className="font-serif text-[40px] leading-none text-[var(--color-gold)]">
                    P21
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
                    Manufacturer
                  </div>
                </div>
                <div className="h-10 w-px bg-[var(--color-hairline)]" />
                <div className="text-center">
                  <div className="font-serif text-[40px] leading-none text-[var(--color-gold)]">
                    WR
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
                    World record
                  </div>
                </div>
              </div>
            </div>

            {/* Right — copy */}
            <div className="md:col-span-7">
              <div className="space-y-5 text-[15px] leading-[1.85] text-white/50">
                <p>
                  Luminary Air Group was founded on a simple conviction: that
                  aircraft interiors deserve the same level of engineering
                  rigour applied to the airframes they inhabit. Over more than
                  twenty years, we have built a reputation for delivering
                  interior work that is precise, durable, certified, and
                  genuinely exceeds the performance targets we commit to at the
                  outset of every project.
                </p>
                <p>
                  We operate as a Part 21 manufacturer, which means every
                  component we produce carries full regulatory traceability —
                  from raw material procurement through fabrication to final
                  installation on the aircraft. This is not simply a
                  certification we hold; it shapes the culture of quality that
                  runs through every build we complete.
                </p>
                <p>
                  Our capabilities span cabin insulation and acoustic
                  engineering, special mission interior platforms, and full VIP
                  completions from green airframe. Whatever the scope, the
                  approach is always the same: understand the aircraft and the
                  mission, engineer the right solution, build it right, and
                  document everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DAVE LUMGAIR BIO ──────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            {/* Aside / accent panel */}
            <div className="md:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-white/[0.07] bg-black p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                  Founder &amp; Owner
                </span>
                <h3 className="mt-4 font-serif text-[32px] leading-tight text-white">
                  Dave
                  <br />
                  Lumgair
                </h3>
                <div className="mt-6 space-y-3 border-t border-white/[0.07] pt-6">
                  <BioFact label="Flight hours" value="11,000+" />
                  <BioFact label="Role" value="Pilot & Engineer" />
                  <BioFact label="Certification" value="Part 21 Mfr" />
                  <BioFact label="Experience" value="20+ Years" />
                </div>
              </div>
            </div>

            {/* Main bio copy */}
            <div className="md:col-span-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                II · Leadership
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                The pilot&rsquo;s perspective meets
                <br />
                <em className="display-serif-italic text-white/50">
                  engineering precision.
                </em>
              </h2>

              <div className="mt-8 space-y-5 text-[15px] leading-[1.85] text-white/50">
                <p>
                  Dave Lumgair founded Luminary Air Group having logged more
                  than 11,000 flight hours across a wide range of aircraft
                  types. That experience is not incidental — it is foundational
                  to the way Luminary approaches every interior project. When
                  you understand how a cabin feels, sounds, and performs from
                  the left seat, you think differently about what an interior
                  needs to achieve.
                </p>
                <p>
                  Having operated aircraft himself for over two decades, Dave
                  brings an operator&rsquo;s perspective to every client
                  conversation: what matters in a cabin is not only how it
                  looks on delivery day, but how it performs on hour twelve of
                  a mission, how easy it is to maintain, and how well it holds
                  up to the realities of operational service.
                </p>
                <p>
                  That operator&rsquo;s lens, combined with the engineering
                  disciplines of a Part 21 manufacturer, is what distinguishes
                  Luminary&rsquo;s work. Solutions are not selected from a
                  catalogue — they are engineered from first principles for the
                  specific airframe, mission, and operator. And because Dave
                  has sat in the cabin himself, the details that matter to
                  passengers and crew are never overlooked.
                </p>
              </div>

              <blockquote className="mt-8 border-l-2 border-[var(--color-gold)] pl-6">
                <p className="font-serif text-[20px] italic leading-relaxed text-white">
                  &ldquo;When you&rsquo;ve flown the aircraft yourself, you
                  know exactly what the crew and passengers need from the
                  interior — and nothing less is acceptable.&rdquo;
                </p>
                <cite className="mt-3 block font-mono text-[11px] not-italic uppercase tracking-[0.22em] text-white/50">
                  Dave Lumgair, Founder
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-black py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              III · Values
            </span>
            <h2 className="display-serif-md mt-5 text-white">
              What we stand for,
              <br />
              <em className="display-serif-italic text-white/50">
                on every build.
              </em>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ValuePillar
              number="01"
              title="Precision"
              description="Every measurement, every joint, every component — built to drawing and inspected before it reaches your aircraft. Precision is non-negotiable."
            />
            <ValuePillar
              number="02"
              title="Reliability"
              description="We commit to a scope, a schedule, and a standard — and we deliver it. Our clients return because they trust us to do exactly what we say we will."
            />
            <ValuePillar
              number="03"
              title="Flexibility"
              description="No two aircraft projects are identical. We design and build for your specific aircraft, mission, and constraints — not a generic template."
            />
            <ValuePillar
              number="04"
              title="Certified Quality"
              description="As a Part 21 manufacturer, every component carries full regulatory traceability. Quality is not aspirational — it is documented."
            />
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES / PART 21 CALLOUT ───────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                IV · Capabilities
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                Full lifecycle.
                <br />
                <em className="display-serif-italic text-[var(--color-gold)]">
                  One team.
                </em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.8] text-white/70">
                Luminary Air Group handles every stage of the interior
                lifecycle in-house — from initial design and acoustic
                engineering through manufacturing, installation, and
                final certification documentation. No hand-offs, no gaps
                in accountability.
              </p>
            </div>

            <div className="md:col-span-6">
              <div className="grid gap-3">
                {[
                  "Design & engineering",
                  "Material sourcing & qualification",
                  "In-house manufacturing",
                  "Installation & fit-out",
                  "Airworthiness certification",
                  "Acoustic measurement & documentation",
                ].map((cap) => (
                  <div
                    key={cap}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/5 px-5 py-3.5"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-[var(--color-gold)]"
                      strokeWidth={1.75}
                    />
                    <span className="text-[14px] text-white/80">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Part 21 badge */}
          <div className="mt-16 flex flex-col items-center gap-5 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 px-8 py-10 text-center">
            <ShieldCheck
              className="h-10 w-10 text-[var(--color-gold)]"
              strokeWidth={1.25}
            />
            <div>
              <div className="font-serif text-[clamp(1.5rem,4vw,3rem)] leading-none text-[var(--color-gold)]">
                Part 21 Manufacturer
              </div>
              <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[1.75] text-white/60">
                Our Part 21 manufacturing authority means every component
                carries full FAA certification traceability — from raw
                material procurement through fabrication to aircraft
                installation. This is the foundation of everything we build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07] bg-black py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
            <span className="h-px w-8 bg-[var(--color-gold)]/60" />
            Work with us
            <span className="h-px w-8 bg-[var(--color-gold)]/60" />
          </span>
          <h2 className="display-serif-md mt-8 text-white">
            Let&rsquo;s discuss
            <br />
            <em className="display-serif-italic text-white/50">
              your next project.
            </em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-white/50">
            Whether you&rsquo;re planning a full green completion, an acoustic
            upgrade, or a special mission interior — tell us about your
            aircraft and your objectives.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-gold-soft)]"
            >
              Get in touch
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/performance-history"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-transparent px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              View performance history
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function BioFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
        {label}
      </span>
      <span className="font-mono text-[11px] font-medium text-white">
        {value}
      </span>
    </div>
  );
}

function ValuePillar({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {number}
      </span>
      <h3 className="mt-4 font-serif text-[26px] leading-tight text-white">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-white/50">
        {description}
      </p>
    </div>
  );
}
