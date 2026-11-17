import { ContentCollection } from "@/components/EditorialPage";
import { EmptyLegBoard } from "@/components/EmptyLegBoard";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { emptyLegPreview } from "@/data/emptyLegs";
import { buildMetadata } from "@/data/seo";

export const metadata = buildMetadata("/empty-legs");

const steps = [
  ["01", "Search", "Browse the latest published opportunities by route and date."],
  ["02", "Request", "Tell EXJET which leg fits, or ask us to look for a close alternative."],
  ["03", "Confirm", "We verify the aircraft, operator, schedule, price, and passenger requirements."],
];

export default function EmptyLegsPage() {
  return (
    <>
      <PageHero heading="Empty leg charter flights"
        dark
        eyebrow="Empty leg opportunities"
        title={<>A repositioning flight.<br /><em>A smarter opening.</em></>}
        copy="Explore one-way aircraft repositioning opportunities. Availability and timing require confirmation."
      />
      <section className="empty-leg-board-section section" aria-labelledby="empty-leg-search-title">
        <div className="shell">
          <h2 id="empty-leg-search-title" className="sr-only">Search empty legs</h2>
          <EmptyLegBoard items={emptyLegPreview} />
        </div>
      </section>
      <section className="section section--dark empty-leg-process">
        <div className="shell">
          <SectionIntro inverse eyebrow="How it works" title="Fast-moving inventory. Clear coordination." />
          <div className="process-grid">
            {steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
          <p className="specification-note">Empty legs are subject to operator confirmation, aircraft repositioning requirements, schedule changes, and availability. EXJET acts as a charter broker and does not operate the flight.</p>
        </div>
      </section>
      <ContentCollection paths={["/empty-legs/dallas", "/pricing"]} title="Explore the options." description="Compare flexible Dallas departures and the complete cost of a charter." showImages={false} />
    </>
  );
}
