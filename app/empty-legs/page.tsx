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
      <PageHero
        dark
        eyebrow="Empty leg opportunities"
        title={<>A repositioning flight.<br /><em>A smarter opening.</em></>}
        copy="Empty legs can create exceptional one-way charter opportunities when your route and timing align with an aircraft repositioning schedule. Availability can change without notice."
      />
      <section className="empty-leg-board-section section">
        <div className="shell">
          <SectionIntro
            eyebrow="Search availability"
            title="Flexible timing creates the best opportunities."
            copy="Published opportunities are verified by EXJET before an option is presented for confirmation. Empty-leg schedules can change quickly, so flexibility creates the strongest match."
          />
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
    </>
  );
}
