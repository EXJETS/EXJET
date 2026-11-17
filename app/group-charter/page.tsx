import { ContentCollection } from "@/components/EditorialPage";
import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";

export const metadata = buildMetadata("/group-charter");

const missions = [
  ["01", "Corporate & incentive", "Executive teams, company meetings, incentive programs, and recurring business movements."],
  ["02", "Sports & performance", "Teams, support staff, equipment, talent, and production schedules coordinated as one mission."],
  ["03", "Events & delegations", "Conferences, tours, destination events, and multi-city programs with aligned arrival plans."],
  ["04", "Complex itineraries", "Multi-leg, multi-aircraft, and time-sensitive programs sourced around the complete group brief."],
];

export default function GroupCharterPage() {
  return (
    <>
      <PageHero heading="Group charter. Every detail aligned."
        dark
        image="/images/manufacturers/longitude-glacier.jpg"
        imageAlt="Citation Longitude cabin with facing leather seats, representative of small-group travel"
        imageWidth={1920}
        imageHeight={1080}
        imagePosition="center"
        eyebrow="Group air charter"
        title={<>Move together.<br /><em>Arrive ready.</em></>}
        copy="Private flights for executive teams, sports and entertainment travel. One advisor coordinates your aircraft, schedule and ground arrangements."
      >
        <ButtonLink href="#group-request" variant="light">Start a group request</ButtonLink>
      </PageHero>

      <section className="section group-request-section" id="group-request">
        <div className="shell">
          <SectionIntro
            eyebrow="Build the movement"
            title="One brief. A coordinated journey."
            copy="Share your route, dates and passenger count. We’ll help plan aircraft capacity, baggage, equipment and transfers around your schedule."
          />
          <div className="ex-intro-actions"><ButtonLink href={`mailto:${siteConfig.email.charter}?subject=Group%20charter%20enquiry`}>Discuss your group</ButtonLink><ButtonLink href="/charter" variant="outline">Find a flight</ButtonLink></div>
          <p className="specification-note">For multiple aircraft or a larger group than the search supports, <a href={`mailto:${siteConfig.email.charter}`}>contact EXJET with your group brief</a>.</p>
        </div>
      </section>

      <section className="section section--dark group-missions-section">
        <div className="shell">
          <SectionIntro inverse eyebrow="Designed around the mission" title="Travel together. Stay on schedule." />
          <div className="group-mission-grid">
            {missions.map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section group-coordination-section">
        <div className="shell split-copy">
          <p className="eyebrow"><span />Coordinated end to end</p>
          <h2>The trip is bigger than the aircraft.</h2>
          <div>
            <p>EXJET can coordinate the charter brief around passenger manifests, baggage and equipment needs, schedule changes, onboard service requests, and ground transfer requirements.</p>
            <p>Aircraft, operator, permits, onboard amenities, and ground services remain subject to availability and final confirmation.</p>
            <a className="large-contact-link large-contact-link--dark" href={`mailto:${siteConfig.email.charter}`}>{siteConfig.email.charter} <span>→</span></a>
          </div>
        </div>
      </section>
      <ContentCollection paths={["/group-charter/sports-teams", "/group-charter/corporate-teams"]} title="Plan for your group." description="Build a brief around the people, equipment and schedule." showImages={false} />
    </>
  );
}
