import type { Metadata } from "next";
import jetsData from "@/data/jets.json";
import type { Jet } from "@/types";
import { JetGrid } from "@/components/jets/jet-grid";

const jets = jetsData as Jet[];

export const metadata: Metadata = {
  title: "Browse the Fleet",
  description:
    "ARGUS Platinum-audited private jets on demand — light, midsize, super midsize, heavy and ultra-long-range across 5,000+ airports worldwide.",
};

export default function JetsPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-hairline)]">
        <div className="mesh-hero absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 sm:px-8">
          <div className="mb-10 flex justify-center">
            <span className="chapter-rule">
              <span className="text-champagne">EXJET</span>
              <span className="text-[var(--color-muted)]">The Fleet</span>
            </span>
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="display-serif text-[var(--color-ink)]">
              The collection.
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.7] text-[var(--color-muted)]">
              Every aircraft is hand-selected from operators meeting ARGUS
              Platinum and Wyvern Wingman standards — light jets, midsize,
              heavy, and ultra-long-range, all available on demand.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <JetGrid jets={jets} />
      </section>
    </>
  );
}
