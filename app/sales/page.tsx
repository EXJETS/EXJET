import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { salesListings } from "@/data/sales";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";

export const metadata = buildMetadata("/sales", { noindex: true });

const services = [
  ["01", "Pre-purchase inspection", "Coordination with manufacturer-authorized service centers and specialists appropriate to the aircraft."],
  ["02", "Title and escrow", "Transaction workstreams coordinated with independent title, escrow, tax, and legal professionals."],
  ["03", "Market analysis", "Comparable aircraft, recent transactions, time, maintenance status, and program enrollment assessed before positioning or offer."],
  ["04", "Registration and import", "Support across FAA, EASA, and multi-jurisdictional registration and import requirements."],
];

export default function SalesPage() {
  return <>
    <PageHero dark eyebrow="Aircraft sales, leasing and acquisitions" title={<>Find the aircraft.<br /><em>Shape the transaction.</em></>} copy="Confidential representation for sellers, targeted search for buyers, and one point of contact from market brief through closing.">
      <ButtonLink href={`mailto:${siteConfig.email.general}`} variant="light">Contact the sales desk</ButtonLink>
    </PageHero>
    <section className="section sales-listings-section"><div className="shell"><SectionIntro eyebrow="Selected opportunities" title="Current listings, completed work, and targeted searches." copy="Open any aircraft for the available record, commercial context, and next step. Confidential files remain controlled through the EXJET sales desk." />
      <div className="sales-index-grid">{salesListings.map((listing, index) => <article className={`sales-index-card sales-index-card--${listing.availability}`} key={listing.slug}><Link href={`/sales/${listing.slug}`} className="sales-index-card__link" aria-label={`View ${listing.name} details`}><div className="sales-index-card__top"><span>{String(index + 1).padStart(2, "0")}</span><span>{listing.status}</span></div><p>{listing.maker} · {listing.category}</p><h2>{listing.name}</h2><strong>{listing.year ?? "Targeted search"}</strong><small>{listing.summary}</small><div>View aircraft details <span aria-hidden="true">→</span></div></Link></article>)}</div>
      <p className="sales-listing-note">Availability, status, specifications, pricing, and representation are subject to change and written verification. Sales opportunities and transaction records are separate from EXJET charter inventory.</p>
    </div></section>
    <section className="section section--dark sales-services-section"><div className="shell"><SectionIntro inverse eyebrow="Transaction support" title="A disciplined process, handled discreetly." /><div className="sales-service-grid">{services.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <section className="section sales-contact-section"><div className="shell split-copy"><p className="eyebrow"><span />Sell or source</p><h2>List an aircraft or start an acquisition brief.</h2><div><p>Send the aircraft model and year, or the first outline of your requirements. EXJET will arrange a private follow-up.</p><a className="large-contact-link large-contact-link--dark" href={`mailto:${siteConfig.email.general}`}>{siteConfig.email.general} <span>→</span></a><a className="large-contact-link large-contact-link--dark" href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display} <span>→</span></a></div></div></section>
  </>;
}
