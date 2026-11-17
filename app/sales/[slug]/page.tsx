import { StructuredData } from "@/components/StructuredData";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/InquiryForm";
import { ButtonLink } from "@/components/ButtonLink";
import { getSalesListing, salesListings } from "@/data/sales";
import { buildDynamicMetadata } from "@/data/seo";
import { absoluteUrl } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return salesListings.map((listing) => ({ slug: listing.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = getSalesListing((await params).slug);
  if (!listing) return {};
  const title = `${listing.name} Aircraft Sales | EXJET`;
  const description = listing.summary.length > 160 ? `${listing.summary.slice(0, 157).replace(/\s+\S*$/, "")}.` : listing.summary;
  return buildDynamicMetadata({ path: `/sales/${listing.slug}`, title: title.length > 60 ? `${listing.name} Sales | EXJET` : title, description });
}

export default async function SalesListingPage({ params }: Props) {
  const listing = getSalesListing((await params).slug); if (!listing) notFound();
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Aircraft Sales", item: absoluteUrl("/sales") }, { "@type": "ListItem", position: 2, name: listing.name, item: absoluteUrl(`/sales/${listing.slug}`) }] };
  return <>
    <StructuredData data={breadcrumb} />
    <section className="sales-detail-hero"><div className="shell"><div className="sales-detail-hero__meta"><span>{listing.status}</span><span>{listing.category}</span>{listing.year ? <span>{listing.year}</span> : null}</div><p>{listing.maker}</p><h1>{listing.name}</h1><strong>{listing.summary}</strong></div></section>
    <section className="section sales-detail"><div className="shell sales-detail__grid"><div><p className="eyebrow"><span />{listing.source ? "Aircraft reference" : "The opportunity"}</p>{listing.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<ButtonLink href="#sales-inquiry">{listing.callToAction}</ButtonLink></div><dl>{listing.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div><p className="sales-listing-note">Status, availability, specifications, time, pricing, and representation are subject to change and written verification. This page is not an offer to sell, lease, or purchase an aircraft.</p><div className="shell"><InquiryForm id="sales-inquiry" intent="sales" source={`/sales/${listing.slug}/`} aircraft={listing.name} heading={`Ask about the ${listing.name}.`} intro="Tell the sales desk what you want to know about this reference. Availability, specification, and whether EXJET represents the aircraft all have to be confirmed in writing. This note is a question, not an offer." submitLabel={listing.callToAction} /></div></section>
  </>;
}
