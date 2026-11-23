import Link from "next/link";
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
    <div className={styles.booking}>
      <header className={styles.heading}>
        <p className={styles.kicker}>EXJET PRIVATE JET CHARTER</p>
        <h1>Request a private jet quote.</h1>
        <p>Tell us where you need to be and when. We’ll help you compare options for the entire trip.</p>
      </header>
      <div className={styles.workspace}>
        <section id="charter-request" className={styles.search} aria-label="Aircraft search and quote request">
          <QuoteForm />
        </section>
        <aside className={styles.advisor} aria-labelledby="charter-advisor">
          <h2 id="charter-advisor">Prefer to work with an advisor?</h2>
          <p>Send your itinerary directly for group trips, multiple stops or special requirements.</p>
          <a href={`mailto:${siteConfig.email.charter}`} className={styles.advisorLink}>Email charter</a>
          <Link href="/pricing/" className={styles.pricingLink}>See what goes into a quote</Link>
        </aside>
      </div>
      <section className={styles.process} aria-labelledby="charter-process">
        <h2 id="charter-process">What happens next</h2>
        <ol>{steps.map(([title, copy], index) => <li key={title}><span aria-hidden="true">{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
      </section>
    </div>
  );
}
