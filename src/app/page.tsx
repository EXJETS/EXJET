import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Mic2,
  Layers,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import caseStudies from "@/data/case-studies.json";
import blogPosts from "@/data/luminary-blog.json";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Luminary Air Group",
    url: "https://luminary.aero",
    description:
      "Aircraft interior design, manufacturing, and installation. Cabin insulation, special mission interiors, and VIP completions. Part 21 manufacturer.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="relative min-h-screen overflow-hidden bg-black">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pt-24 pb-20 sm:px-8">
          {/* Chapter rule */}
          <div className="mb-12 flex justify-center">
            <span className="chapter-rule">
              <span className="text-[var(--color-gold)]">Luminary Air Group</span>
              <span>Part 21 Manufacturer</span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-white">
              Experienced.
              <br />
              <em className="display-serif-italic" style={{ color: "var(--color-gold)" }}>
                Reliable. Flexible.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-white/50">
              Aircraft interior design, manufacturing, and installation.
              From cabin noise reduction systems to special mission platforms
              and VIP completions — every interior built with precision,
              certified to standard.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-soft)]"
            >
              Cabin Comfort Systems
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
            <Link
              href="/special-mission-interiors"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              Mission Interiors
            </Link>
            <Link
              href="/vip-interiors"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-transparent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            >
              VIP Interiors
            </Link>
          </div>

          {/* KPI band */}
          <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] sm:grid-cols-4">
            <HeroStat label="Experience" value="20+ Years" />
            <HeroStat label="Certification" value="Part 21" />
            <HeroStat label="Noise Reduction" value="50–70%" />
            <HeroStat label="World Record" value="46.7 dB SIL" />
          </div>
        </div>
      </section>

      {/* ── ABOUT INTRO ── */}
      <section className="relative border-t border-white/[0.06] bg-[#0d0d0d]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-12 lg:py-32">
          <div className="md:col-span-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
              I &middot; The Craft
            </span>
            <h2 className="display-serif-md mt-5 text-white">
              Aircraft interiors,
              <br />
              <em className="display-serif-italic text-white/40">engineered to last.</em>
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-[15px] leading-[1.85] text-white/50">
              With decades of experience in aircraft interiors, Luminary Air
              Group handles all aspects of interior design, engineering,
              production, installation, and certification. From seats, divans
              &amp; cabinetry to cabin insulation systems and special mission
              interiors &mdash; our skilled workmanship ensures high-quality
              results delivered on time.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-5 border-t border-white/[0.06] pt-10 sm:grid-cols-2">
              <Hallmark title="Part 21 Manufacturer" desc="FAA-certified manufacturing for certified quality on every build." />
              <Hallmark title="Full Lifecycle" desc="Design, engineering, fabrication, installation, and certification." />
              <Hallmark title="ADMI Platform" desc="All Day Mission Interior — modular, lightweight, rapid-reconfigure." />
              <Hallmark title="World Record" desc="Quietest Boeing Business Jet cabin ever measured: 46.7 dB SIL." />
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="relative border-t border-white/[0.06] bg-black py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="II"
            eyebrow="Our Services"
            title="Every interior,"
            italic="purpose-built"
            description="From acoustic engineering to full mission platform design — three core service lines addressing every aircraft interior need."
          />
          <div className="mt-16 grid gap-5 sm:grid-cols-3">
            <ServiceCard
              icon={Mic2}
              number="01"
              title="Cabin Comfort Systems"
              description="Innovative, lightweight cabin noise reduction kits tailored to the unique acoustic signature of every aircraft. From single-engine piston to wide-body jet — including the World Record quietest Boeing Business Jet cabin."
              stat="46.7 dB SIL world record"
              href="/cabin-comfort-systems"
            />
            <ServiceCard
              icon={Layers}
              number="02"
              title="Special Mission Interiors"
              description="Durable, lightweight, modular mission-specific aircraft interiors under our ADMI brand. Designed for ISR, med-evac, command platforms, and special operations with rapid access behind all interior walls."
              stat="ADMI&trade; platform"
              href="/special-mission-interiors"
            />
            <ServiceCard
              icon={Wrench}
              number="03"
              title="VIP Interiors"
              description="Complete interior design, manufacturing, and installation for VIP and corporate aircraft. Custom cabinetry, seating, upholstery, and green completion builds — each crafted with the same precision as every Luminary project."
              stat="Full green completions"
              href="/vip-interiors"
            />
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="relative border-t border-white/[0.06] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="III"
            eyebrow="How It Works"
            title="A proven process,"
            italic="start to certification"
            description="Every Luminary project follows a rigorous process — acoustic analysis, custom design, certified manufacturing, and expert installation."
            align="center"
          />
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] sm:grid-cols-4">
            <ProcessStep
              number="01"
              title="Acoustic Analysis"
              description="We measure your aircraft's unique noise signature using precision instrumentation — mapping every source and frequency."
            />
            <ProcessStep
              number="02"
              title="Custom Design"
              description="A bespoke insulation or interior system engineered specifically for your airframe, using optimal materials and placement."
            />
            <ProcessStep
              number="03"
              title="Manufacturing"
              description="Fabricated in-house as a Part 21 manufacturer — every component certified and quality-controlled before it ships."
            />
            <ProcessStep
              number="04"
              title="Installation"
              description="Expert installation by experienced technicians, with minimal downtime and full documentation for your maintenance records."
            />
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE ── */}
      <section className="relative overflow-hidden bg-black py-24 lg:py-32">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.08), transparent 65%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                IV &middot; Performance
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                Measured.
                <br />
                <em className="display-serif-italic text-[var(--color-gold)]">Documented. Proven.</em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.8] text-white/50">
                Every installation is measured and documented. Our clients
                consistently achieve noise reductions of 50&ndash;70% &mdash;
                and in record-setting cases, significantly more.
              </p>
              <Link
                href="/performance-history"
                className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-gold)] transition-opacity hover:opacity-75"
              >
                View performance history
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>

            <div className="md:col-span-7">
              <div className="mb-8 rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/[0.04] p-8 text-center">
                <div className="font-serif text-[72px] leading-none text-[var(--color-gold)] sm:text-[96px]">
                  46.7
                </div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
                  dB SIL &mdash; World Record
                </div>
                <div className="mt-1 text-[12px] text-white/30">
                  Quietest Boeing Business Jet cabin ever measured
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <PerfStat value="50–70%" label="Noise reduction" />
                <PerfStat value="20+" label="Years experience" />
                <PerfStat value="Part 21" label="Manufacturer" />
              </div>
            </div>
          </div>

          {/* Case study cards */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {caseStudies.map((cs) => (
              <CaseStudyCard key={cs.id} study={cs} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="relative border-t border-white/[0.06] bg-[#0d0d0d] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="V"
            eyebrow="The Journal"
            title="Technical insight,"
            italic="from the engineers"
            description="Deep dives into acoustic science, insulation engineering, and mission interior design."
            ctaHref="/blog"
            ctaLabel="Read all articles"
          />
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-black py-28 lg:py-36">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,168,76,0.07), transparent 65%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="gold-line mx-auto mb-8" />
          <h2 className="display-serif-md text-white">
            Transform your
            <br />
            <em className="display-serif-italic text-[var(--color-gold)]">aircraft&rsquo;s interior.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-white/45">
            Start with an acoustic consultation or interior brief. Tell us about
            your aircraft and objectives &mdash; we&rsquo;ll design a solution
            that meets your budget, timeline, and performance targets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-gold)] px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:bg-[var(--color-gold-soft)]"
            >
              Get a Quote
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-transparent px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50 transition-all hover:border-white/30 hover:text-white"
            >
              Cabin Systems
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ── */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-7 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {label}
      </span>
      <span className="font-serif text-[22px] leading-none text-white">
        {value}
      </span>
    </div>
  );
}

function Hallmark({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2
        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold)]"
        strokeWidth={1.5}
      />
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white">
          {title}
        </div>
        <div className="mt-1 text-[13px] leading-relaxed text-white/40">
          {desc}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  chapter,
  eyebrow,
  title,
  italic,
  description,
  ctaHref,
  ctaLabel,
  align = "left",
}: {
  chapter: string;
  eyebrow: string;
  title: string;
  italic?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between md:gap-12"
      )}
    >
      <div className={cn(align === "center" ? "" : "max-w-2xl")}>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
          {chapter} &middot; {eyebrow}
        </span>
        <h2 className="display-serif-md mt-5 text-white">
          {title}
          {italic && (
            <>
              {" "}
              <em className="display-serif-italic text-white/40">{italic}</em>
            </>
          )}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-[14px] leading-relaxed text-white/45",
              align === "center" ? "mx-auto max-w-md" : "max-w-lg"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {ctaHref && ctaLabel && align !== "center" && (
        <Link
          href={ctaHref}
          className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-white/50 transition-colors hover:text-[var(--color-gold)] md:self-end"
        >
          {ctaLabel}
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
          />
        </Link>
      )}
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  number,
  title,
  description,
  stat,
  href,
}: {
  icon: typeof Mic2;
  number: string;
  title: string;
  description: string;
  stat: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-8 transition-all hover:border-[var(--color-gold)]/40 hover:shadow-[0_0_60px_-20px_rgba(201,168,76,0.2)]"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/[0.06] text-[var(--color-gold)]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/20">
          {number}
        </span>
      </div>
      <h3 className="mt-6 font-serif text-[24px] leading-tight text-white">
        {title}
      </h3>
      <p
        className="mt-4 flex-1 text-[13px] leading-[1.8] text-white/40"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <div className="mt-6 flex items-end justify-between border-t border-white/[0.06] pt-5">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-gold)]"
          dangerouslySetInnerHTML={{ __html: stat }}
        />
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-white/30 transition-all group-hover:text-[var(--color-gold)]">
          Explore
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col px-7 py-9">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {number}
      </span>
      <h3 className="mt-4 font-serif text-[22px] leading-tight text-white">
        {title}
      </h3>
      <p className="mt-3 text-[13px] leading-[1.75] text-white/40">
        {description}
      </p>
    </div>
  );
}

function PerfStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
      <div className="font-serif text-[28px] leading-none text-white">{value}</div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</div>
    </div>
  );
}

function CaseStudyCard({ study }: { study: (typeof caseStudies)[number] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-[var(--color-gold)]/25">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
        {study.category}
      </span>
      <h3 className="mt-3 font-serif text-[18px] leading-tight text-white">
        {study.title}
      </h3>
      <p className="mt-1 text-[12px] text-white/35">{study.aircraft}</p>
      <div className="mt-4 border-t border-white/[0.06] pt-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)]">
          {study.result}
        </div>
        <div className="mt-0.5 text-[11px] text-white/25">{study.year}</div>
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: (typeof blogPosts)[number] }) {
  const when = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111111] p-7 transition-all hover:border-[var(--color-gold)]/30"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
          {post.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">
          {when}
        </span>
      </div>
      <h3 className="mt-5 font-serif text-[20px] leading-tight text-white">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-white/40">
        {post.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/25">
          {post.readingTime} read
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-white/35 transition-all group-hover:text-[var(--color-gold)]">
          Read
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
