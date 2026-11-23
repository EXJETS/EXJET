import { SupportHeader } from "@/components/PublicSupport";
import support from "@/components/PublicSupport.module.css";
import { Suspense } from "react";
import { ArrowUpRightIcon, AirplaneTakeoffIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { ContactPreference } from "@/components/ContactPreference";
import { directoryAircraft as aircraft } from "@/data/aircraft-directory";
import { aircraftCategories } from "@/data/aircraftCategories";
import { FlightSearchLink } from "@/components/FlightSearchLink";
import { SocialLinks } from "@/components/SocialLinks";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd, siteConfig } from "@/data/site";
import styles from "./contact.module.css";

export const metadata = buildMetadata("/contact");
const desks = [
  { title:"Passenger charter", copy:"Private jet charter and empty leg flights.", email:siteConfig.email.charter, Icon:AirplaneTakeoffIcon },
  { title:"General inquiries", copy:"Questions about EXJET or help finding the right contact.", email:siteConfig.email.general, Icon:EnvelopeSimpleIcon },
];

export default function ContactPage() {
  return (
    <div className={support.frame}>
      <StructuredData data={localBusinessJsonLd()} />
      <SupportHeader label="EXJET support" title="Contact EXJET" copy="Get help with a private charter, an empty leg or an existing trip." />
      <div className={`${support.wrap} ${support.workspace}`}>
        <section id="contact-desks" className={support.card}><h2>Contact details</h2>
          <ul className={styles.desks}>{desks.map(({title, copy, email, Icon}) => <li key={title}><Icon size={22} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p><a href={`mailto:${email}`}>{email}<ArrowUpRightIcon size={15} aria-hidden="true" /></a></li>)}</ul>
          <Suspense fallback={null}><ContactPreference aircraft={Object.fromEntries(aircraft.map(item => [item.slug, item.name]))} categories={Object.fromEntries(aircraftCategories.map(item => [item.slug, item.name]))} /></Suspense>
        </section>
        <aside className={support.rail}><section className={support.card}><p className={support.eyebrow}>New trip</p><h2>Plan a flight</h2><p>Enter your route and travel details to start a charter request.</p><FlightSearchLink /></section>
          <section className={support.card}><h2>Dallas, Texas</h2><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.display)}`} target="_blank" rel="noreferrer">{siteConfig.address.streetAddress}<br />{siteConfig.address.addressLocality}, {siteConfig.address.addressRegion} {siteConfig.address.postalCode}</a><SocialLinks compact /></section></aside>
      </div>
    </div>
  );
}
