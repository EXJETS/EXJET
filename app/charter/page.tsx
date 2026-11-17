import Link from "next/link";
import { AvinodeWidget } from "@/components/AvinodeWidget";
import { InquiryForm } from "@/components/InquiryForm";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";
import styles from "./booking.module.css";

export const metadata = buildMetadata("/charter");

const steps = [
  ["Search", "Choose your airports, dates, and passengers."],
  ["Request", "Send your itinerary and aircraft preferences to EXJET."],
  ["Confirm", "Review your aircraft, pricing, and arrangements with your advisor."],
];

export default function CharterPage() {
  return (
    <div className={styles.booking}>
      <header className={styles.heading}>
        <div><p>Dallas private jet charter</p><h1>Request a quote.</h1></div>
        <Link className="ex-text-link" href="/contact">Need a hand? Contact EXJET <span aria-hidden="true">›</span></Link>
      </header>
      <section id="charter-request" className={styles.search} aria-label="Quote request">
        <InquiryForm
          intent="charter"
          source="/charter/"
          heading="Tell us the trip."
          intro="This form is part of the page, so you can send a request with or without JavaScript. Include the cities or airports, the dates you can fly, and who is travelling. An advisor replies with aircraft options for that itinerary. Nothing here is a live fare or a confirmed aircraft."
          showTrip
        />
      </section>
      <section className="section" aria-labelledby="charter-prepare">
        <div className="shell split-copy">
          <p className="eyebrow"><span />What a useful request includes</p>
          <h2 id="charter-prepare">The details that change the aircraft.</h2>
          <div>
            <p>Name the departure and arrival points as a city or an airport code, and say whether the time is fixed or flexible. A morning arrival for a meeting and a late departure after a weekend are different trips. If there is a return, a second city, or a day you can move, put that in the other-dates field so the advisor does not have to guess.</p>
            <p>Passenger count should include every person who needs a seat. Mention baggage that is larger than a usual cabin bag, sports equipment, pets, or a need to work during the flight. Those details decide whether a light jet is realistic or whether the brief should start with a midsize or large-cabin aircraft. EXJET does not publish a fleet of its own. The operating carrier confirms the actual aircraft, cabin, and range for the route.</p>
            <p>A written quote is for the itinerary you described. It should identify the proposed aircraft category or model, the operator, and the charges that make up the trip, including taxes or fees the advisor already knows. Hourly examples elsewhere on this site are illustrations, not EXJET prices. Wi-Fi, catering, and ground transport are confirmed per option, not assumed from a brochure.</p>
            <p>EXJET arranges the charter as a broker. The licensed third-party air carrier named for the trip keeps operational control. Available ARGUS and Wyvern information, when an operator has it, describes that operator. It is not a certification held by EXJET. Read how that review works on the <Link href="/safety">safety page</Link>, or call {siteConfig.phone.primary.display} if the departure is soon.</p>
          </div>
        </div>
      </section>
      <section className={styles.search} aria-label="Optional aircraft search">
        <div className="shell">
          <h2>Search aircraft, if you prefer.</h2>
          <p>The search below is an optional enhancement. It loads an embedded aircraft search after the page, and it needs JavaScript. Use the form above when you want the request itself to be on the page. The space for the search is reserved so the rest of the page does not jump when it loads.</p>
          <AvinodeWidget />
        </div>
      </section>
      <section className={styles.process} aria-labelledby="charter-process">
        <h2 id="charter-process">From search to takeoff.</h2>
        <ol>{steps.map(([title, copy], index) => <li key={title}><span aria-hidden="true">{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
        <p className={styles.note}>A search or quote request does not reserve an aircraft. Your advisor will guide you through confirmation.</p>
      </section>
      <div className={styles.help}><p>For a more complex itinerary, speak with EXJET.</p><a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a></div>
    </div>
  );
}
