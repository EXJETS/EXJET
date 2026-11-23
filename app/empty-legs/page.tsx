import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import catalog from "@/components/AircraftCatalog.module.css";
import { ContentCollection } from "@/components/EditorialPage";
import { EmptyLegBoard } from "@/components/EmptyLegBoard";
import { SupportHeader } from "@/components/PublicSupport";
import support from "@/components/PublicSupport.module.css";
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
    <div className={support.frame}>
      <SupportHeader label="One-way private charter" title="Empty legs" copy="Search repositioning flights by airport and date. The operator reconfirms price, availability and timing." />
      <section className={`${support.wrap} ${support.workspace}`} aria-label="Empty-leg search and assistance">
        <section id="empty-leg-search" className={`${support.card} ${catalog.legSearch}`}>
          <h2>Search empty legs</h2>
          <EmptyLegBoard items={emptyLegPreview} />
        </section>
        <aside className={support.rail} aria-label="Trip alternatives"><section className={support.card}>
          <p className="eyebrow">Trip alternatives</p>
          <h2>Flexible on dates or airports?</h2>
          <p>Tell us your preferred cities, date range and passenger count. We can check if a suitable leg is available.</p>
          <ButtonLink className={support.primary} href="/contact/?service=empty-leg">Ask for an empty-leg match</ButtonLink>
          <div className={support.anchorList}><Link href="/charter/">Request a dedicated charter →</Link></div></section>
        <section className={support.card}><h2>How empty legs work</h2>{steps.map(([number,title,copy])=><article className={support.numberRow} key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}<p>EXJET arranges charter. A licensed air carrier operates the flight.</p></section></aside>
      </section>
      <ContentCollection paths={["/empty-legs/dallas", "/pricing"]} title="Explore the options." description="Compare flexible Dallas departures and the complete cost of a charter." showImages={false} />
    </div>
  );
}
