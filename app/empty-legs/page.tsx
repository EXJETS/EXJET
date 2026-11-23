import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import catalog from "@/components/AircraftCatalog.module.css";
import { ContentCollection } from "@/components/EditorialPage";
import { EmptyLegBoard } from "@/components/EmptyLegBoard";
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
      <header className={catalog.mast}><div className="shell">
        <p className="eyebrow">One-way charter</p>
        <h1>Find an empty leg</h1>
        <p>Search one-way repositioning flights by airport and date. The operator must reconfirm price, availability and timing.</p>
      </div></header>
      <section className={`shell ${catalog.legLayout}`} aria-label="Empty-leg search and assistance">
        <div id="empty-leg-search" className={catalog.legBoard}>
          <h2>Search empty legs</h2>
          <EmptyLegBoard items={emptyLegPreview} />
        </div>
        <aside className={catalog.legAdvisor} aria-label="Trip alternatives">
          <p className="eyebrow">Trip alternatives</p>
          <h2>Flexible on dates or airports?</h2>
          <p>Tell us your preferred cities, date range and passenger count. We can check if a suitable leg is available.</p>
          <ButtonLink href="/contact/?service=empty-leg">Ask for an empty-leg match</ButtonLink>
          <Link href="/charter/">Request a dedicated charter →</Link>
        </aside>
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
