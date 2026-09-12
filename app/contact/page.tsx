import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";
import { SocialLinks } from "@/components/SocialLinks";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd, siteConfig } from "@/data/site";

export const metadata = buildMetadata("/contact");

export default function ContactPage() {
  return (
    <>
      <StructuredData data={localBusinessJsonLd()} />
      <PageHero eyebrow="Contact EXJET" title={<>Let’s plan<br /><em>what’s next.</em></>} copy="Share the route and timing. An EXJET advisor is available 24/7 to coordinate passenger and cargo charter requests." />
      <section className="section contact-section">
        <div className="shell contact-layout">
          <QuoteForm />
          <aside>
            <p>Passenger charter</p><a href={`mailto:${siteConfig.email.charter}`}>{siteConfig.email.charter}</a>
            <p>Cargo charter</p><a href={`mailto:${siteConfig.email.cargo}`}>{siteConfig.email.cargo}</a>
            <p>Sales and general</p><a href={`mailto:${siteConfig.email.general}`}>{siteConfig.email.general}</a>
            <p>Direct</p><a href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display}</a>
            <p>Dallas</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address.display)}`} target="_blank" rel="noreferrer">{siteConfig.address.streetAddress}<br />{siteConfig.address.addressLocality}, {siteConfig.address.addressRegion} {siteConfig.address.postalCode}</a>
            <p>Social</p><SocialLinks compact />
          </aside>
        </div>
      </section>
    </>
  );
}
