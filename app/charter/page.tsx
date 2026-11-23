import { CharterJourney } from "@/components/CharterJourney";
import { QuoteForm } from "@/components/QuoteForm";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";
import styles from "./booking.module.css";

export const metadata = buildMetadata("/charter");

const steps = [
  ["Share your itinerary", "Enter your preferred airports, dates and passenger count. Tell us about bags, pets or onward stops."],
  ["Review the proposal", "Compare the aircraft, operating carrier, trip total and terms. Where applicable, the operator quote and our service fee are shown separately."],
  ["Confirm your trip", "Your advisor will explain what’s needed to confirm. Sending a request does not reserve an aircraft."],
];

export default function CharterPage() {
  return (
    <>
      <CharterJourney
        active="private"
        eyebrow="On-demand private jet charter"
        title="Request a private jet quote."
        description="Start with your itinerary. Review aircraft options, the operating carrier and the full price before you commit."
        panelId="charter-request"
        panelTitle="Plan your flight"
        advisorTitle="Have a specific itinerary?"
        advisorCopy="Send your route and timing for multiple stops, special requirements or a departure you’re still planning."
        links={[
          { href: `mailto:${siteConfig.email.charter}`, label: "Email the charter desk" },
          { href: "/pricing/", label: "See how charter pricing works" },
        ]}
      >
        <QuoteForm />
      </CharterJourney>
      <div className={styles.booking}>
        <section className={styles.process} aria-labelledby="charter-process">
          <h2 id="charter-process">What happens next</h2>
          <ol>{steps.map(([title, copy], index) => <li key={title}><span aria-hidden="true">{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
        </section>
      </div>
    </>
  );
}
