import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Wrench,
  Layers,
  Mic2,
  CheckCircle2,
} from "lucide-react";
import caseStudies from "@/data/case-studies.json";
import blogPosts from "@/data/luminary-blog.json";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Luminary Air Group",
    url: "https://luminary.aero",
    description:
      "Aircraft interior design, manufacturing, and installation. Cabin insulation, special mission interiors, and VIP completions.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* ── HERO ── editorial, light background */}
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
              <span className="text-[var(--color-lime)]">Luminary Air Group</span>
              <span className="text-[var(--color-muted)]">Part 21 Manufacturer</span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              Experienced.
              <br />
              <em className="display-serif-italic" style={{ color: "var(--color-lime)" }}>
                Reliable. Flexible.
              </em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-[var(--color-muted)]">
              Aircraft interior design, manufacturing, and installation. From
              cabin insulation systems to special mission platforms and VIP
              completions — every interior is engineered with precision and
              delivered with expertise.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-lime)]"
            >
              Cabin Comfort Systems
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/special-mission-interiors"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              Mission Interiors
            </Link>
            <Link
              href="/vip-interiors"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              VIP Interiors
            </Link>
          </div>

          {/* KPI band */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-4">
            <HeroStat label="Experience" value="20+ Years" />
            <HeroStat label="Certification" value="Part 21 Mfr" />
            <HeroStat label="Noise Reduction" value="50–70%" />
            <HeroStat label="World Record" value="46.7 dB SIL" />
          </div>
        </div>
      </section>

      {/* ── ABOUT INTRO ── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-12 lg:py-32">
          <div className="md:col-span-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
              I · The Craft
            </span>
            <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
              Aircraft interiors,
              <br />
              <em className="display-serif-italic">engineered to last.</em>
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-[15px] leading-[1.85] text-[var(--color-muted)]">
              With decades of experience in aircraft interiors, Luminary Air
              Group handles all aspects of interior design, engineering,
              production, installation, and certification. From seats, divans
              &amp; cabinetry to cabin insulation systems and special mission
              interiors — our skilled workmanship ensures high-quality results
              delivered on time.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-5 border-t border-[var(--color-hairline)] pt-8 sm:grid-cols-2">
              <Hallmark
                title="Part 21 Manufacturer"
                desc="FAA-certified manufacturing for certified quality on every build."
              />
              <Hallmark
                title="Full Lifecycle"
                desc="Design, engineering, fabrication, installation, and certification."
              />
              <Hallmark
                title="ADMI Platform"
                desc="All Day Mission Interior — modular, lightweight, rapid-reconfigure."
              />
              <Hallmark
                title="World Record"
                desc="Quietest Boeing Business Jet cabin ever measured: 46.7 dB SIL."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="II"
            eyebrow="Our Services"
            title="Every interior,"
            italic="purpose-built"
            description="From acoustic engineering to full mission platform design, our three core service lines address every aircraft interior need."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <ServiceCard
              icon={Mic2}
              number="01"
              title="Cabin Comfort Systems"
              description="Innovative, lightweight cabin noise reduction kits tailored to the unique acoustic signature of every aircraft — from the smallest single-engine to the largest wide-body jet. We hold the World Record for the quietest Boeing Business Jet cabin."
              stat="46.7 dB SIL world record"
              href="/cabin-comfort-systems"
            />
            <ServiceCard
              icon={Layers}
              number="02"
              title="Special Mission Interiors"
              description="Durable, lightweight, and modular mission-specific aircraft interiors under our ADMI (All Day Mission Interior) brand. Designed for ISR, med-evac, command platforms, and special operations — reducing weight while providing rapid access behind all interior walls."
              stat="ADMI™ platform"
              href="/special-mission-interiors"
            />
            <ServiceCard
              icon={Wrench}
              number="03"
              title="VIP Interiors"
              description="Complete interior design, manufacturing, and installation for VIP and corporate aircraft. Cabinetry, seating, upholstery, and green completion builds — each crafted with the same precision and certified quality that defines every Luminary project."
              stat="Full green completions"
              href="/vip-interiors"
            />
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="III"
            eyebrow="How It Works"
            title="A proven process,"
            italic="from first measure to final cert"
            description="Every Luminary project follows a rigorous process — acoustic analysis, custom design, certified manufacturing, and expert installation."
            align="center"
          />
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-4">
            <ProcessStep
              number="01"
              title="Acoustic Analysis"
              description="We measure your aircraft's unique noise signature using precision instrumentation — mapping every source and frequency."
            />
            <ProcessStep
              number="02"
              title="Custom Design"
              description="A bespoke insulation or interior system engineered specifically for your airframe, using the optimal materials and placement."
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

      {/* ── PERFORMANCE ── dark ink section */}
      <section className="relative overflow-hidden">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                IV · Performance
              </span>
              <h2 className="display-serif-md mt-5 text-white">
                Results that
                <br />
                <em className="display-serif-italic text-[var(--color-lime)]">
                  speak for themselves.
                </em>
              </h2>
              <p className="mt-6 text-[15px] leading-[1.8] text-white/70">
                Every installation is measured and documented. Our clients
                consistently achieve noise reductions of 50–70% — and in
                record-setting cases, significantly more.
              </p>
              <Link
                href="/performance-history"
                className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-lime)] transition-opacity hover:opacity-80"
              >
                View performance history
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>

            <div className="md:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <PerfStat
                  value="46.7 dB"
                  label="World Record BBJ SIL"
                  sub="Boeing Business Jet"
                />
                <PerfStat
                  value="50–70%"
                  label="Noise reduction"
                  sub="Across all aircraft types"
                />
                <PerfStat
                  value="20+"
                  label="Years of expertise"
                  sub="Aircraft interiors"
                />
                <PerfStat
                  value="Part 21"
                  label="Manufacturer"
                  sub="FAA certified"
                />
              </div>
            </div>
          </div>

          {/* Case study highlights */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {caseStudies.map((cs) => (
              <CaseStudyCard key={cs.id} study={cs} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeader
            chapter="V"
            eyebrow="The Journal"
            title="Technical insight,"
            italic="straight from the engineers"
            description="Deep dives into acoustic science, insulation engineering, and mission interior design."
            ctaHref="/blog"
            ctaLabel="Read all articles"
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
            <span className="h-px w-8 bg-[var(--color-lime)]/60" />
            Ready to get started
            <span className="h-px w-8 bg-[var(--color-lime)]/60" />
          </span>
          <h2 className="display-serif-md mt-8 text-[var(--color-ink)]">
            Transform your
            <br />
            <em className="display-serif-italic text-[var(--color-muted)]">
              aircraft&rsquo;s interior.
            </em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-[var(--color-muted)]">
            Start with an acoustic consultation or interior brief. Tell us
            about your aircraft and objectives — we&rsquo;ll design a solution
            that meets your budget, timeline, and performance targets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-lime)]"
            >
              Get a Quote
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              Explore Cabin Systems
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
    <div className="flex flex-col items-center gap-2 bg-[var(--color-ivory)] px-5 py-7 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
        {label}
      </span>
      <span className="font-serif text-[22px] leading-none text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}

function Hallmark({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime)]/10 text-[var(--color-lime)]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
      </span>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
          {title}
        </div>
        <div className="mt-1 text-[13px] leading-relaxed text-[var(--color-muted)]">
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
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
          {chapter} · {eyebrow}
        </span>
        <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
          {title}
          {italic && (
            <>
              {" "}
              <em className="display-serif-italic text-[var(--color-muted)]">
                {italic}
              </em>
            </>
          )}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-[14px] leading-relaxed text-[var(--color-muted)]",
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
          className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-lime)] md:self-end"
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
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white p-8 transition-all hover:border-[var(--color-lime)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.2)]"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-lime-bg)] text-[var(--color-lime)]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
          {number}
        </span>
      </div>

      <h3 className="mt-6 font-serif text-[24px] leading-tight text-[var(--color-ink)]">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-[13px] leading-[1.8] text-[var(--color-muted)]">
        {description}
      </p>

      <div className="mt-6 flex items-end justify-between border-t border-[var(--color-hairline)] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-lime)]">
          {stat}
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5">
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
    <div className="flex flex-col bg-[var(--color-ivory)] px-7 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
        {number}
      </span>
      <h3 className="mt-4 font-serif text-[22px] leading-tight text-[var(--color-ink)]">
        {title}
      </h3>
      <p className="mt-3 text-[13px] leading-[1.75] text-[var(--color-muted)]">
        {description}
      </p>
    </div>
  );
}

function PerfStat({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="font-serif text-[36px] leading-none text-[var(--color-lime)]">
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white">
        {label}
      </div>
      <div className="mt-1 text-[12px] text-white/50">{sub}</div>
    </div>
  );
}

function CaseStudyCard({
  study,
}: {
  study: (typeof caseStudies)[number];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
        {study.category}
      </span>
      <h3 className="mt-3 font-serif text-[18px] leading-tight text-white">
        {study.title}
      </h3>
      <p className="mt-2 text-[12px] text-white/60">{study.aircraft}</p>
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-lime)]">
          {study.result}
        </div>
        <div className="mt-0.5 text-[11px] text-white/50">{study.year}</div>
      </div>
    </div>
  );
}

function BlogCard({
  post,
}: {
  post: (typeof blogPosts)[number];
}) {
  const when = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <Link
      href={`/blog/${post.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white p-7 transition-all hover:border-[var(--color-lime)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.15)]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
          {post.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
          {when}
        </span>
      </div>
      <h3 className="mt-5 font-serif text-[20px] leading-tight text-[var(--color-ink)]">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-[1.75] text-[var(--color-muted)]">
        {post.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-hairline)] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
          {post.readingTime} read
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5">
          Read
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
