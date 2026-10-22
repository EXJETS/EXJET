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
      {guide ? <div className="ex-editorial"><div className="ex-container ex-content-layout ex-content-layout--outline"><PageOutline sections={guide.sections} /><div className="ex-reading">
        <ContentSections sections={guide.sections} />
        <ContentFaq faqs={guide.faqs} />
        {guide.sources.length ? <section className="ex-sources"><h2>Manufacturer references</h2><ul>{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></section> : null}
      </div></div></div> : null}
    </>
  );
}
