import { ButtonLink } from "@/components/ButtonLink";
import { CredentialsStrip } from "@/components/CredentialsStrip";
import { OperatorReview } from "@/components/OperatorReview";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { buildMetadata } from "@/data/seo";
import { safetyResources } from "@/data/trust";

export const metadata = buildMetadata("/why-exjet");

const pillars = [
  ["01", "Broad market access", "EXJET sources mission-fit aircraft through licensed third-party air carriers rather than limiting clients to a single owned fleet."],
  ["02", "One clear process", "Aircraft selection, confirmed quote, digital charter agreement, secure payment, and trip coordination move through one connected process."],
  ["03", "Trip-specific review", "Operator, aircraft, crew, insurance, and operating details are reviewed for the proposed mission before confirmation."],
  ["04", "Timely trip communication", "Status updates keep clients informed from operator assignment and contract completion through the departure briefing."],
];

export default function WhyExjetPage() {
  return <>
    <PageHero dark eyebrow="Why EXJET" title={<>More access.<br /><em>Less complexity.</em></>} copy="EXJET simplifies business aviation by bringing aircraft selection, commercial terms, and trip coordination into one clear relationship.">
      <ButtonLink href="/contact" variant="light">Start a flight request</ButtonLink>
    </PageHero>
    <section className="why-speed"><div className="shell"><p>Time sensitive mission?</p><h2>Be airborne within 96 hours.</h2><span>Subject to aircraft, crew, airport, regulatory, and route availability.</span></div></section>
    <section className="section principles-section"><div className="shell"><SectionIntro eyebrow="The EXJET difference" title="One relationship. Fewer gaps. Better decisions." copy="The market is broad. The client experience should still feel precise." /><div className="principles-list why-pillar-list">{pillars.map(([number, title, copy]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}</div></div></section>
    <section className="section section--dark safety-standard"><div className="shell"><SectionIntro inverse eyebrow="Operator review" title="Recognized resources. Trip-specific decisions." copy="EXJET arranges charter with licensed third-party air carriers. Available ARGUS and WYVERN operator safety data may be considered during sourcing; EXJET does not represent those operator ratings as certifications held by EXJET." /><OperatorReview /><CredentialsStrip credentials={safetyResources} /></div></section>
    <section className="section broker-section"><div className="shell split-copy"><p className="eyebrow"><span />Clear roles</p><h2>EXJET coordinates. The identified carrier operates.</h2><div><p>EXJET arranges charter flights as a broker. Each flight is performed by the licensed third-party air carrier named for that trip.</p><p>Clients gain the benefit of broad market access without losing accountability. One advisor stays with the mission while operating control remains where it belongs.</p><ButtonLink href="/faq">Read the charter FAQ</ButtonLink></div></div></section>
  </>;
}
