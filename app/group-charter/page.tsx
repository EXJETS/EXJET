import { CharterJourney } from "@/components/CharterJourney";
import { QuoteForm } from "@/components/QuoteForm";
import { ContentCollection } from "@/components/EditorialPage";
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
      <CharterJourney
        active="group"
        eyebrow="Group air charter"
        title="Group charter, on your schedule."
        description="Arrange private air travel for teams, events and delegations. Start with the passenger count, dates and arrival requirements."
        panelId="group-request"
        panelTitle="Build your group brief"
        panelDescription="Add baggage, equipment, synchronized arrivals or multiple aircraft in the request notes."
        advisorTitle="More than one aircraft?"
        advisorCopy="Email the complete schedule and any fixed commitments. Include equipment, bags and transfers that affect the trip."
        links={[
          { href: `mailto:${siteConfig.email.charter}?subject=Group%20charter%20enquiry`, label: "Email the group charter desk" },
          { href: "/group-charter/sports-teams/", label: "Plan travel for a sports team" },
        ]}
      >
        <QuoteForm mode="group" />
      </CharterJourney>

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
