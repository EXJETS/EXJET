import Link from "next/link";
import { ClipboardTextIcon, ShieldCheckIcon, ChartLineUpIcon, GlobeHemisphereWestIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SectionIntro } from "@/components/SectionIntro";
import { salesListings } from "@/data/sales";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";
import { ContentCollection } from "@/components/EditorialPage";

export const metadata = buildMetadata("/sales");

const services = [
  [ClipboardTextIcon, "Pre-purchase inspection", "Coordination with manufacturer-authorized service centers and specialists appropriate to the aircraft."],
  [ShieldCheckIcon, "Title and escrow", "Transaction workstreams coordinated with independent title, escrow, tax, and legal professionals."],
  [ChartLineUpIcon, "Market analysis", "Comparable aircraft, recent transactions, time, maintenance status, and program enrollment assessed before positioning or offer."],
  [GlobeHemisphereWestIcon, "Registration and import", "Support across FAA, EASA, and multi-jurisdictional registration and import requirements."],
] as const;

export default function SalesPage() {
  return <>
    <PageHero heading="Aircraft sales and acquisitions" dark eyebrow="Aircraft sales, leasing and acquisitions" title={<>Find the aircraft.<br /><em>Shape the transaction.</em></>} copy="Aircraft sales and acquisition consulting for owners, corporate flight departments and family offices. One point of contact from the mission brief through transaction coordination.">
      <ButtonLink href={`mailto:${siteConfig.email.general}`} variant="light">Contact the sales desk</ButtonLink>
    </PageHero>
    <section className="section sales-listings-section"><div className="shell"><SectionIntro eyebrow="Aircraft sales and acquisitions" title="Aircraft references and targeted searches." copy="Review each aircraft’s stated status and source, then discuss your requirements with the EXJET sales desk. Availability and representation require confirmation." />
      <div className="sales-index-grid">{salesListings.map((listing, index) => <article className={`sales-index-card sales-index-card--${listing.availability}`} key={listing.slug}><Link href={`/sales/${listing.slug}`} className="sales-index-card__link" aria-label={`View ${listing.name} details`}><div className="sales-index-card__top"><span>{String(index + 1).padStart(2, "0")}</span><span>{listing.status}</span></div><p>{listing.maker} · {listing.category}</p><h2>{listing.name}</h2><strong>{listing.year ?? "Targeted search"}</strong><small>{listing.summary}</small><div>View aircraft details <ArrowRightIcon size={18} aria-hidden="true" /></div></Link></article>)}</div>
      <p className="sales-listing-note">Availability, status, specifications, pricing, and representation are subject to change and written verification. Sales opportunities and transaction records are separate from EXJET charter inventory.</p>
    </div></section>
    <section className="section section--dark sales-services-section"><div className="shell"><SectionIntro inverse eyebrow="Transaction support" title="A disciplined process, handled discreetly." /><div className="sales-service-grid">{services.map(([Icon, title, copy]) => <article key={title}><Icon size={28} weight="regular" aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <section className="ex-section ex-section--silver"><div className="ex-container"><div className="ex-reading"><h2>Plan the aircraft’s next chapter.</h2><p>An acquisition brief should connect the purchase decision with the operating plan. Compare the mission, cabin, maintenance exposure, management arrangements and expected ownership budget before narrowing the search.</p><p>Dallas-based EXJET supports aircraft buyers and sellers with a defined consulting scope. Confirm representation, fees, records access and third-party responsibilities in writing.</p><div className="ex-inline-actions"><Link href="/aircraft-management">Aircraft management consulting</Link><Link href="/mro">Pre-purchase maintenance planning</Link><Link href="/interior-completions">Interior completion planning</Link></div></div></div></section>
    <ContentCollection paths={["/guides/buying-a-business-jet", "/guides/aircraft-management-proposals"]} title="Prepare your acquisition." showImages={false} />
    <section className="section sales-contact-section"><div className="shell split-copy"><p className="eyebrow"><span />Sell or source</p><h2>List an aircraft or start an acquisition brief.</h2><div><p>Send the aircraft model and year, or the first outline of your requirements. EXJET will arrange a private follow-up.</p><a className="large-contact-link large-contact-link--dark" href={`mailto:${siteConfig.email.general}`}>{siteConfig.email.general} <ArrowRightIcon size={20} aria-hidden="true" /></a><a className="large-contact-link large-contact-link--dark" href={siteConfig.phone.primary.href}>{siteConfig.phone.primary.display} <ArrowRightIcon size={20} aria-hidden="true" /></a></div></div></section>
  </>;
}
