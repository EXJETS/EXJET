import { CharterJourney } from "@/components/CharterJourney";
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
      <CharterJourney
        active="empty"
        eyebrow="Flexible one-way charter"
        title="Find an empty leg."
        description="Browse one-way repositioning opportunities by route and date. The operator must reconfirm availability and timing."
        panelId="empty-leg-search"
        panelTitle="Search empty legs"
        advisorTitle="Dates or airports flexible?"
        advisorCopy="Tell the desk your preferred cities, date range and passenger count. We can check whether a suitable leg is available."
        links={[
          { href: "/contact/?service=empty-leg", label: "Ask for an empty-leg match" },
          { href: "/charter/", label: "Request a dedicated charter" },
        ]}
      >
        <EmptyLegBoard items={emptyLegPreview} />
      </CharterJourney>
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
