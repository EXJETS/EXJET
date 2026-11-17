import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { ContentCollection } from "@/components/EditorialPage";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";

export const metadata = buildMetadata("/membership", { noindex: true });
const priorities = [
  ["Travel profile", "Build a brief around your regular routes, travelers, cabin preferences and notice periods."],
  ["Clear commercial terms", "Review the proposed service scope, fees and payment arrangements in writing before enrollment."],
  ["Trip coordination", "Work with an EXJET advisor on aircraft sourcing, itinerary changes and ground arrangements."],
];
export default function MembershipPage() {
  return <>
    <PageHero heading="EXJET Travel Management Membership" dark eyebrow="Travel management" title={<>One team.<br /><em>A familiar way to travel.</em></>} copy="Discuss a travel management arrangement around your recurring business and personal journeys.">
      <ButtonLink href={`mailto:${siteConfig.email.charter}?subject=EXJET%20Travel%20Management%20Membership`} variant="light">Discuss membership</ButtonLink>
    </PageHero>
    <section className="section"><div className="shell">
      <div className="ex-section-heading"><div><h2>Start with the way you travel.</h2><p>EXJET will provide the current program details and a written proposal. Aircraft availability and trip-specific costs are confirmed separately.</p></div></div>
      <div className="ex-card-grid">{priorities.map(([title, copy]) => <article className="ex-card ex-card--text" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
      <p className="specification-note">Membership does not itself confirm an aircraft or departure. Service commitments, pricing and eligibility are defined in the applicable signed agreement.</p>
    </div></section>
    <ContentCollection paths={["/executive-assistants", "/family-office-private-aviation", "/guides/private-aviation-program-comparison"]} title="Plan a program around your needs." showImages={false} />
  </>;
}
