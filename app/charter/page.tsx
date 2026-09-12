import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";
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
        <div><p>Private charter</p><h1>Your next flight.</h1></div>
        <Link className="ex-text-link" href="/contact">Need a hand? Contact EXJET <span aria-hidden="true">›</span></Link>
      </header>
      <section id="charter-request" className={styles.search} aria-label="Aircraft search"><QuoteForm /></section>
      <section className={styles.process} aria-labelledby="charter-process">
        <h2 id="charter-process">From search to takeoff.</h2>
        <ol>{steps.map(([title, copy], index) => <li key={title}><span aria-hidden="true">{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
        <p className={styles.note}>A search or quote request does not reserve an aircraft. Your advisor will guide you through confirmation.</p>
      </section>
      <div className={styles.help}><p>For a more complex itinerary, speak with EXJET.</p><a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a></div>
    </div>
  );
}
