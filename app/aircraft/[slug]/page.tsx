import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    title: `${item.name} Charter Aircraft | EXJET`,
    description: `${item.name} charter access through EXJET. ${item.summary}`,
    image: item.image,
  });
}

export default async function AircraftDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getAircraft(slug);
  if (!item) notFound();

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
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
    </>
  );
}
