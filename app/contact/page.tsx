import { ButtonLink } from "@/components/ButtonLink";
import { Suspense } from "react";
import { ArrowUpRightIcon, AirplaneTakeoffIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { ContactPreference } from "@/components/ContactPreference";
import { aircraft } from "@/data/aircraft";
import { aircraftCategories } from "@/data/aircraftCategories";
import { PageHero } from "@/components/PageHero";
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
    <>
      <StructuredData data={localBusinessJsonLd()} />
      <PageHero heading="Contact EXJET" eyebrow="Start with the right desk" title="Contact EXJET" copy="Choose the right desk for your request.">
        <ButtonLink href="#contact-desks">See contact details</ButtonLink>
      </PageHero>
      <section className={styles.directory} id="contact-desks">
        <h2>Contact details</h2>
        <ul className={styles.desks}>{desks.map(({title, copy, email, Icon}) => <li key={title}><Icon size={22} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p><a href={`mailto:${email}`}>{email}<ArrowUpRightIcon size={15} aria-hidden="true" /></a></li>)}</ul>
        <div className={styles.guidance}>
          <div>
            <Suspense fallback={null}><ContactPreference aircraft={Object.fromEntries(aircraft.map(item => [item.slug, item.name]))} categories={Object.fromEntries(aircraftCategories.map(item => [item.slug, item.name]))} /></Suspense>
            <FlightSearchLink />
          </div>
          <aside>
            <h2>Dallas, Texas</h2>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.display)}`} target="_blank" rel="noreferrer">{siteConfig.address.streetAddress}<br />{siteConfig.address.addressLocality}, {siteConfig.address.addressRegion} {siteConfig.address.postalCode}</a>
            <SocialLinks compact />
          </aside>
        </div>
      </section>
    </>
  );
}
