import { ButtonLink } from "@/components/ButtonLink";
import { CredentialsStrip } from "@/components/CredentialsStrip";
import { OperatorReview } from "@/components/OperatorReview";
import Link from "next/link";
import { SupportHeader } from "@/components/PublicSupport";
import styles from "@/components/PublicSupport.module.css";
import { buildMetadata } from "@/data/seo";
import { safetyResources } from "@/data/trust";

export const metadata = buildMetadata("/why-exjet");

const pillars = [
  ["01", "Broad market access", "EXJET sources mission-fit aircraft through licensed third-party air carriers rather than limiting clients to a single owned fleet."],
  ["02", "One clear process", "One EXJET advisor coordinates aircraft selection, written quotes, charter agreements, payment instructions and trip details."],
  ["03", "Trip-specific review", "Operator, aircraft, crew, insurance, and operating details are reviewed for the proposed mission before confirmation."],
  ["04", "Timely trip communication", "Status updates keep clients informed from operator assignment and contract completion through the departure briefing."],
];

export default function WhyExjetPage() {
  return <div className={styles.frame}>
    <SupportHeader label="How EXJET works" title="Why EXJET" copy="One contact for private charter and empty legs, with the operating carrier and trip cost identified before you commit." />
    <div className={`${styles.wrap} ${styles.workspace}`}>
      <div className={styles.main}>
        <section className={styles.card}><h2>What to expect</h2>{pillars.map(([number,title,copy])=><article className={styles.numberRow} key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</section>
        <section className={styles.card}><h2>Operator review</h2><p>EXJET arranges charter with licensed third-party air carriers. Available ARGUS and WYVERN operator safety data may be considered during sourcing. EXJET does not represent those operator ratings as its own certifications.</p><OperatorReview /><CredentialsStrip credentials={safetyResources}/></section>
        <section className={styles.card}><h2>Who operates the flight?</h2><p>EXJET sources aircraft and coordinates the trip. The licensed third-party air carrier named for your flight performs it and holds operational control.</p><Link href="/faq/">Read the charter FAQ →</Link></section>
      </div>
      <aside className={styles.rail}><section className={styles.card}><p className={styles.eyebrow}>Timing</p><h2>Short notice?</h2><p>Tell us when you need to depart. Short-notice requests depend on aircraft, crew, airport, regulatory and route availability.</p><ButtonLink href="/contact/" className={styles.primary}>Discuss your trip</ButtonLink></section><section className={styles.card}><p className={styles.eyebrow}>Trip planning</p><h2>Compare your options</h2><nav className={styles.anchorList} aria-label="Planning links"><Link href="/aircraft/">Explore aircraft</Link><Link href="/pricing/">Review charter pricing</Link><Link href="/safety/">Read about operator review</Link></nav></section></aside>
    </div>
  </div>;
}
