import { InquiryForm } from "@/components/InquiryForm";
import { ButtonLink } from "@/components/ButtonLink";
import { Suspense } from "react";
import { ContactPreference } from "@/components/ContactPreference";
import { aircraft } from "@/data/aircraft";
import { aircraftCategories } from "@/data/aircraftCategories";
import { PageHero } from "@/components/PageHero";
import { FlightSearchLink } from "@/components/FlightSearchLink";
import { SocialLinks } from "@/components/SocialLinks";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";

export const metadata = buildMetadata("/contact");

export default function ContactPage() {
  return (
    <>
      <PageHero heading="Speak with EXJET" eyebrow="Contact EXJET" title={<>Let’s plan<br /><em>what’s next.</em></>} copy="Discuss your business or commercial aviation requirements. From passenger and cargo capacity to aircraft ownership, crew and technical support, start with your objectives.">
        <div className="ex-intro-actions contact-primary-actions">
          <ButtonLink href={siteConfig.phone.primary.href}>Call EXJET</ButtonLink>
          <ButtonLink href={`mailto:${siteConfig.email.general}`} variant="outline">Email an advisor</ButtonLink>
        </div>
      </PageHero>
      <section className="section contact-section">
        <div className="shell contact-layout">
          <div>
            <Suspense fallback={null}><ContactPreference aircraft={Object.fromEntries(aircraft.map(item => [item.slug, item.name]))} categories={Object.fromEntries(aircraftCategories.map(item => [item.slug, item.name]))} /></Suspense>
            <InquiryForm
              intent="contact"
              source="/contact/"
              id="contact-form"
              heading="Send a message."
              intro="Use this form for a question that is not a full trip quote. Charter itineraries are better on the quote form, where you can include cities, dates, and passengers. Tell us who you are and what you need. An advisor replies from the Dallas office. The form works without JavaScript."
              submitLabel="Send message"
            />
            <p>If you already know the aircraft, the route, or the service, say so in the notes. Ownership, crew, maintenance, and interior questions go to the same desk and are routed from there. EXJET does not ask you to create an account to start a conversation.</p>
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
