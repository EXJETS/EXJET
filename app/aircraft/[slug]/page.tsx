import { AircraftReference } from "@/components/AircraftReference";
import { StructuredData } from "@/components/StructuredData";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentSections, ContentFaq } from "@/components/ContentSections";
import aircraftGuides from "@/data/aircraft-guides.json";
import { PageOutline } from "@/components/PageOutline";
import { AircraftDetail } from "@/components/AircraftDetail";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionIntro } from "@/components/SectionIntro";
import { aircraft, getAircraft } from "@/data/aircraft";
import { buildDynamicMetadata } from "@/data/seo";
import { absoluteUrl } from "@/data/site";
import { getAircraftReference } from "@/data/aircraft-reference";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return aircraft.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getAircraft(slug);
  if (!item) return {};
  return buildDynamicMetadata({
    path: `/aircraft/${item.slug}`,
    title: `${item.name} Charter: Cost & Cabin Guide | EXJET`,
    description: aircraftGuides[slug as keyof typeof aircraftGuides]?.description ?? item.summary,
    image: item.image,
  });
}

export default async function AircraftDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getAircraft(slug);
  if (!item) notFound();

  const guide = aircraftGuides[slug as keyof typeof aircraftGuides];
  const reference = getAircraftReference(slug);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Aircraft", item: absoluteUrl("/aircraft") },
      { "@type": "ListItem", position: 2, name: item.name, item: absoluteUrl(`/aircraft/${item.slug}`) },
    ],
  };

  return (
    <>
      <StructuredData data={breadcrumb} />
      <AircraftDetail item={item} />
      {reference ? <nav className="aircraft-detail-jump" aria-label={`${item.name} page sections`}>
        <a href="#aircraft-specifications">Specifications <span aria-hidden="true">↓</span></a>
        {reference.floorplans?.length ? <a href="#cabin-layout">Cabin layouts <span aria-hidden="true">↓</span></a> : null}
      </nav> : null}
      <section className="section aircraft-detail-copy">
        <div className="shell">
          <SectionIntro eyebrow={`${item.maker} · ${item.category}`} title="At a glance." copy={item.summary} />
          <div className="spec-grid">
            <div><span>Passengers</span><strong>{item.typical.passengers}</strong></div>
            <div><span>Range</span><strong>{item.typical.range}</strong></div>
            <div><span>Baggage</span><strong>{item.typical.baggage}</strong></div>
            <div><span>Cabin</span><strong>{item.typical.cabin}</strong></div>
          </div>
          <p className="specification-note">Specifications are typical for the type. Actual configuration varies by aircraft. Range and availability depend on route, payload, weather, and operating conditions.</p>
          <ButtonLink href={`/contact?aircraft=${item.slug}`}>Request this aircraft</ButtonLink>
        </div>
      </section>
      <AircraftReference slug={slug} />
      {guide ? <div className="ex-editorial"><div className="ex-container ex-content-layout ex-content-layout--outline"><PageOutline sections={guide.sections} /><div className="ex-reading">
        <ContentSections sections={guide.sections} />
        <ContentFaq faqs={guide.faqs} />
      </div></div></div> : null}
    </>
  );
}
