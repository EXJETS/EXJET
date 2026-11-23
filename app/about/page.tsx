import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import Link from "next/link";
import { SupportHeader } from "@/components/PublicSupport";
import styles from "@/components/PublicSupport.module.css";
import { SocialLinks } from "@/components/SocialLinks";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";
import { publishedPilotCredentials } from "@/data/trust";

export const metadata = buildMetadata("/about");

const values = [
  ["01", "Safety", "Every mission begins with operator and aircraft review. Commercial pressure never outranks the requirements of a safe, compliant flight."],
  ["02", "Integrity", "Clear roles, honest communication, and written terms that clients can understand before they commit."],
  ["03", "Excellence", "Details are managed with the discipline expected from a dedicated flight department, from aircraft selection through arrival."],
  ["04", "Passion", "Aviation knowledge matters, but genuine care for the people and purpose behind each trip is what makes the service personal."],
];

export default function AboutPage() {
  return <div className={styles.frame}>
    <SupportHeader label="Company" title="About EXJET" copy="Based in Dallas, EXJET arranges private jet charter and empty leg flights through licensed air carriers." />
    <div className={`${styles.wrap} ${styles.workspace}`}>
      <div className={styles.main}>
        <div className={styles.photo}><Image src="/images/manufacturers/falcon-8x-flightdeck.jpg" alt="Dassault Falcon 8X flight deck" width={2000} height={1100} sizes="(max-width: 760px) 94vw, 62vw" /></div>
        <section className={styles.card}><p className={styles.eyebrow}>Our story</p><h2>Founded by two pilots</h2><p>We look at every trip from the traveler’s seat, the flight deck and the operator’s dispatch desk. That means asking early about schedule, runway, range, baggage and ground coordination.</p><p>Weather, crew duty and alternates shape a flight. We explain those tradeoffs and keep clients informed as the mission comes together.</p></section>
        <section className={styles.card}><h2>How we work</h2><p>EXJET coordinates private jet charter and empty leg flights. The licensed air carrier identified for your trip operates the aircraft and retains operational control.</p><ButtonLink href="/charter/" className={styles.primary}>Plan a flight</ButtonLink></section>
        <section className={styles.card}><h2>The standard we work to</h2>{values.map(([number,title,copy])=><article className={styles.numberRow} key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</section>
      </div>
      <aside className={styles.rail}>
        <section className={styles.card}><p className={styles.eyebrow}>Company details</p><h2>At a glance</h2><dl className={styles.factList}><div><dt>Founders</dt><dd>Two pilots</dd></div><div><dt>Published certificate</dt><dd>{publishedPilotCredentials.certificate}</dd></div><div><dt>Published type ratings</dt><dd>{publishedPilotCredentials.typeRatings.join(" · ")}</dd></div><div><dt>Focus</dt><dd>Private jet charter and empty legs</dd></div></dl></section>
        <section className={styles.card}><h2>Dallas headquarters</h2><p>{siteConfig.address.display}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.display)}`} target="_blank" rel="noreferrer">Open in Maps ↗</a><SocialLinks compact /></section>
        <section className={styles.card}><h2>Explore EXJET</h2><nav className={styles.anchorList} aria-label="About EXJET links"><Link href="/private-jet-charter/">Explore charter</Link><Link href="/why-exjet/">Why EXJET</Link><Link href="/operator-partners/">Operator relationships</Link></nav></section>
      </aside>
    </div>
  </div>;
}
