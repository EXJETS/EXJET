import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";
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
      <PageHero
        dark
        image="/images/editorial/falcon-8x-dining-area.jpg"
        imageAlt="Dassault Falcon 8X dining cabin, representative of small-group private jet travel"
        imageWidth={2000}
        imageHeight={1333}
        imagePosition="center"
        eyebrow="Group air charter"
        title={<>Move together.<br /><em>Arrive ready.</em></>}
        copy="Aircraft sourcing and itinerary coordination for groups that need more than a block of seats. One advisor keeps the aircraft, timing, baggage, and ground plan connected."
      >
        <ButtonLink href="#group-request" variant="light">Start a group request</ButtonLink>
      </PageHero>

      <section className="section group-request-section" id="group-request">
        <div className="shell">
          <SectionIntro
            eyebrow="Build the movement"
            title="Start with the group. We’ll shape the lift."
            copy="Share the route, date, and approximate headcount now. The follow-up brief can cover baggage, equipment, ground transportation, schedule constraints, and passenger handling."
          />
          <QuoteForm mode="group" />
          <p className="specification-note">For multiple aircraft or a larger group than the search supports, <a href={`mailto:${siteConfig.email.charter}`}>contact EXJET with your group brief</a>.</p>
        </div>
      </section>

      <section className="section section--dark group-missions-section">
        <div className="shell">
          <SectionIntro inverse eyebrow="Designed around the mission" title="Many travelers. One operating picture." />
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
    </>
  );
}
