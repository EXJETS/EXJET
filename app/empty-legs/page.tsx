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
          <p>Search when you already have a flexible city and date. If the board has nothing that fits, that is normal. Repositioning flights are created by someone else’s trip, and they move or disappear when that trip changes. Send the quote form with a date range and more than one acceptable city if you want EXJET to watch, or ask for a standard charter if the time cannot move. A match still has to name the operator, the aircraft, the price, and the rules for a change. Seats are not held by browsing this page.</p>
          <p>Dallas departures are a common place to start because the office is there, not because empty legs only exist in Dallas. The Dallas empty-leg note explains how to write that request. Other cities use the same idea: flexible ends of the route, a realistic passenger count, and no assumption about the aircraft type.</p>
        </div>
      </section>
      <ContentCollection paths={["/empty-legs/dallas", "/pricing"]} title="Explore the options." description="Compare flexible Dallas departures and the complete cost of a charter." showImages={false} />
    </>
  );
}
