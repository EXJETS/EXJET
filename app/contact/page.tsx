import { ButtonLink } from "@/components/ButtonLink";
import { Suspense } from "react";
import { ContactPreference } from "@/components/ContactPreference";
import { aircraft } from "@/data/aircraft";
import { aircraftCategories } from "@/data/aircraftCategories";
import { PageHero } from "@/components/PageHero";
import { FlightSearchLink } from "@/components/FlightSearchLink";
import { SocialLinks } from "@/components/SocialLinks";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd, siteConfig } from "@/data/site";

export const metadata = buildMetadata("/contact");

export default function ContactPage() {
  return (
    <>
      <StructuredData data={localBusinessJsonLd()} />
      <PageHero heading="Speak with EXJET" eyebrow="Contact EXJET" title={<>Let’s plan<br /><em>what’s next.</em></>} copy="Share your itinerary, aircraft or project objectives. Connect with EXJET for charter, sales and acquisitions, management, MRO, interior completions or Starlink installation consulting.">
        <div className="ex-intro-actions contact-primary-actions">
          <ButtonLink href={siteConfig.phone.primary.href}>Call EXJET</ButtonLink>
          <ButtonLink href={`mailto:${siteConfig.email.general}`} variant="outline">Email an advisor</ButtonLink>
        </div>
      </PageHero>
      <section className="section contact-section">
        <div className="shell contact-layout">
          <div>
            <Suspense fallback={null}><ContactPreference aircraft={Object.fromEntries(aircraft.map(item => [item.slug, item.name]))} categories={Object.fromEntries(aircraftCategories.map(item => [item.slug, item.name]))} /></Suspense>
            <FlightSearchLink />
          </div>
          <aside>
            <p>Passenger charter</p><a href={`mailto:${siteConfig.email.charter}`}>{siteConfig.email.charter}</a>
            <p>Cargo charter</p><a href={`mailto:${siteConfig.email.cargo}`}>{siteConfig.email.cargo}</a>
            <p>Aircraft ownership and consulting</p><a href={`mailto:${siteConfig.email.general}`}>{siteConfig.email.general}</a>
            <p>Direct</p><a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a>
            <p>Dallas</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.display)}`} target="_blank" rel="noreferrer">{siteConfig.address.streetAddress}<br />{siteConfig.address.addressLocality}, {siteConfig.address.addressRegion} {siteConfig.address.postalCode}</a>
            <p>Social</p><SocialLinks compact />
          </aside>
        </div>
      </section>
    </>
  );
}
