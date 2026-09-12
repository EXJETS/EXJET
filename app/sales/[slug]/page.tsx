import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { getSalesListing, salesListings } from "@/data/sales";
import { buildDynamicMetadata } from "@/data/seo";
import { absoluteUrl, siteConfig } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return salesListings.map((listing) => ({ slug: listing.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const listing = getSalesListing((await params).slug); if (!listing) return {}; return buildDynamicMetadata({ path: `/sales/${listing.slug}`, title: `${listing.name} Aircraft Sales | EXJET`, description: listing.summary, noindex: true }); }

export default async function SalesListingPage({ params }: Props) {
  const listing = getSalesListing((await params).slug); if (!listing) notFound();
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Aircraft Sales", item: absoluteUrl("/sales") }, { "@type": "ListItem", position: 2, name: listing.name, item: absoluteUrl(`/sales/${listing.slug}`) }] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <section className="sales-detail-hero"><div className="shell"><div className="sales-detail-hero__meta"><span>{listing.status}</span><span>{listing.category}</span>{listing.year ? <span>{listing.year}</span> : null}</div><p>{listing.maker}</p><h1>{listing.name}</h1><strong>{listing.summary}</strong></div></section>
    <section className="section sales-detail"><div className="shell sales-detail__grid"><div><p className="eyebrow"><span />The opportunity</p>{listing.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<ButtonLink href={`mailto:${siteConfig.email.general}?subject=${encodeURIComponent(`${listing.name} sales inquiry`)}`}>{listing.callToAction}</ButtonLink></div><dl>{listing.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><p className="sales-listing-note">Status, availability, specifications, time, pricing, and representation are subject to change and written verification. This page is not an offer to sell, lease, or purchase an aircraft.</p></section>
  </>;
}
