import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import caseStudies from "@/data/case-studies.json";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Performance History",
  description:
    "Documented acoustic results from Luminary Air Group installations. World record 46.7 dB SIL Boeing Business Jet, 50–70% average noise reduction across all aircraft types.",
  alternates: { canonical: "/performance-history" },
  openGraph: {
    title: "Performance History · Luminary Air Group",
    description:
      "Measured. Documented. Proven. World record 46.7 dB SIL — the quietest Boeing Business Jet ever recorded.",
    url: "https://luminary.aero/performance-history",
  },
};

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function PerformanceHistoryPage() {
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
              <span className="text-[var(--color-lime)]">
                Performance History
              </span>
              <span className="text-[var(--color-muted)]">
                Measured · Documented · Proven
              </span>
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              Measured.{" "}
              <em className="display-serif-italic text-[var(--color-lime)]">
                Documented.
              </em>
              <br />
              Proven.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.75] text-[var(--color-muted)]">
              Every Luminary installation is measured before and after using
              precision acoustic instrumentation. The results are documented,
              independently verifiable, and consistently exceptional — from
              midsize jets to world-record wide-body completions.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-lime)]"
            >
              Discuss your project
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              Cabin Comfort Systems
            </Link>
          </div>
        </div>
      </section>

      {/* ── WORLD RECORD HERO CALLOUT ─────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-[var(--color-hairline)]">
        <div className="mesh-ink absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
              World Record
            </span>
            <div className="mt-6 font-serif text-[clamp(5rem,14vw,11rem)] leading-none tracking-tight text-[var(--color-lime)]">
              46.7
              <span className="text-[0.35em] text-white/70"> dB SIL</span>
            </div>
            <h2 className="mt-4 font-serif text-[clamp(1.25rem,3vw,2rem)] font-normal leading-tight text-white">
              World&rsquo;s Quietest Boeing Business Jet
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-[1.8] text-white/70">
              Achieved on a privately operated Boeing Business Jet using a
              bespoke multi-layer acoustic insulation system designed and
              installed by Luminary Air Group. This result — 46.7 dB Sound
              Intensity Level — remains the lowest cabin noise floor ever
              documented for the Boeing Business Jet type. It defines the
              upper boundary of what is acoustically achievable in a
              wide-body business aircraft.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden border-x border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-4">
            <StatBand value="50–70%" label="Avg. noise reduction" />
            <StatBand value="20+" label="Years in aircraft interiors" />
            <StatBand value="Part 21" label="Manufacturer" />
            <StatBand value="Multi-type" label="Aircraft coverage" />
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES GRID ─────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
              I · Case Studies
            </span>
            <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
              Documented results,{" "}
              <em className="display-serif-italic text-[var(--color-muted)]">
                aircraft by aircraft.
              </em>
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-muted)]">
              Each project below represents a fully measured, documented
              installation with verified pre- and post-installation acoustic
              data.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {caseStudies.map((cs) => (
              <CaseStudyCard key={cs.id} study={cs} />
            ))}
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ───────────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-[var(--color-ivory)] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
                II · Methodology
              </span>
              <h2 className="display-serif-md mt-5 text-[var(--color-ink)]">
                How we{" "}
                <em className="display-serif-italic text-[var(--color-muted)]">
                  measure.
                </em>
              </h2>
              <p className="mt-5 text-[14px] leading-[1.85] text-[var(--color-muted)]">
                Luminary&rsquo;s performance data is produced through a
                rigorous, instrument-driven measurement protocol. Results are
                not estimated or extrapolated — they are measured directly
                in the aircraft cabin under controlled in-flight conditions.
              </p>
              <Link
                href="/blog"
                className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-lime)] transition-opacity hover:opacity-80"
              >
                Read our acoustic engineering articles
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>

            <div className="md:col-span-7">
              <div className="grid gap-4">
                <MethodologyStep
                  step="01"
                  title="dB SIL Scale"
                  description="All noise measurements use the Sound Intensity Level (dB SIL) scale — the industry standard for cabin acoustic characterisation. SIL measurements capture the true acoustic energy in the cabin, independent of the limitations of simple SPL measurements."
                />
                <MethodologyStep
                  step="02"
                  title="Calibrated Acoustic Instrumentation"
                  description="Measurements are taken using calibrated precision instrumentation at defined cabin positions. Equipment is calibrated to traceable national standards before every measurement campaign."
                />
                <MethodologyStep
                  step="03"
                  title="Pre- and Post-Installation Comparison"
                  description="Baseline measurements are taken prior to any insulation work under identical flight conditions. Post-installation measurements replicate those conditions exactly, enabling a direct and unambiguous comparison of the achieved noise reduction."
                />
                <MethodologyStep
                  step="04"
                  title="Full Documentation"
                  description="All measurement data — raw readings, instrumentation calibration records, and analysis — is archived and available to clients. Results are traceable, reproducible, and independently verifiable."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--color-hairline)] bg-white py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
            <span className="h-px w-8 bg-[var(--color-lime)]/60" />
            What can we achieve for your aircraft
            <span className="h-px w-8 bg-[var(--color-lime)]/60" />
          </span>
          <h2 className="display-serif-md mt-8 text-[var(--color-ink)]">
            Your aircraft.
            <br />
            <em className="display-serif-italic text-[var(--color-muted)]">
              Your result.
            </em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.8] text-[var(--color-muted)]">
            Every aircraft is different. We begin every project with a
            thorough acoustic survey to understand exactly what is achievable
            — and we commit to a target before any installation work begins.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--color-lime)]"
            >
              Request an acoustic consultation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/cabin-comfort-systems"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] bg-transparent px-7 py-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              Explore cabin systems
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function StatBand({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[var(--color-ivory)] px-5 py-8 text-center">
      <span className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] leading-none text-[var(--color-ink)]">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
        {label}
      </span>
    </div>
  );
}

function CaseStudyCard({
  study,
}: {
  study: (typeof caseStudies)[number];
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-white p-8 transition-all hover:border-[var(--color-lime)] hover:shadow-[0_24px_50px_-20px_rgba(181,180,0,0.15)]">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <span className="inline-block rounded-full border border-[var(--color-lime)]/30 bg-[var(--color-lime-bg)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
          {study.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
          {study.year}
        </span>
      </div>

      {/* Title & aircraft */}
      <h3 className="mt-5 font-serif text-[24px] leading-tight text-[var(--color-ink)]">
        {study.title}
      </h3>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {study.aircraft}
      </p>

      {/* Achievement banner */}
      <div className="mt-5 rounded-lg bg-[var(--color-ivory)] px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-lime)]">
          Achievement
        </div>
        <div className="mt-1 text-[13px] font-medium leading-snug text-[var(--color-ink)]">
          {study.achievement}
        </div>
      </div>

      {/* Description */}
      <p className="mt-5 flex-1 text-[13px] leading-[1.8] text-[var(--color-muted)]">
        {study.description}
      </p>

      {/* Result footer */}
      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-hairline)] pt-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
            Documented result
          </div>
          <div className="mt-0.5 font-serif text-[28px] leading-none text-[var(--color-lime)]">
            {study.result}
          </div>
        </div>
        <CheckCircle2
          className="h-5 w-5 text-[var(--color-lime)]/50 transition-colors group-hover:text-[var(--color-lime)]"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}

function MethodologyStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 rounded-xl border border-[var(--color-hairline)] bg-white p-6">
      <div className="shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-lime)]">
          {step}
        </span>
      </div>
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.75] text-[var(--color-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
