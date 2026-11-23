import { BrokerNotice } from "@/components/BrokerNotice";
import { AircraftReference } from "@/components/AircraftReference";
import { StructuredData } from "@/components/StructuredData";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentSections, ContentFaq } from "@/components/ContentSections";
import aircraftGuides from "@/data/aircraft-guides.json";
import { PageOutline } from "@/components/PageOutline";
import { AircraftDetail } from "@/components/AircraftDetail";
import { ButtonLink } from "@/components/ButtonLink";
import Link from "next/link";
import styles from "@/components/PublicAircraftMarket.module.css";
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
      <section className={styles.wrap}>
        <nav className={styles.back} aria-label="Breadcrumb"><Link href="/aircraft">← All aircraft</Link></nav>
        <div className={`${styles.split} ${styles.aircraftSplit}`}>
          <div>
            {item.scenes.some(scene => scene.image || scene.gallery?.length) && <div className={styles.gallery}><AircraftDetail item={item} mediaOnly /></div>}
            <div className={styles.profileCopy}>
              <p className={styles.label}>Aircraft profile</p>
              <h2 className={styles.sectionTitle}>About this aircraft</h2>
              <p>{item.summary}</p>
              {reference && <nav className={styles.strip} aria-label={`${item.name} page sections`}>
                <a href="#aircraft-specifications">Specifications <span aria-hidden="true">↓</span></a>
                {!!reference.floorplans?.length && <a href="#cabin-layout">Cabin layouts <span aria-hidden="true">↓</span></a>}
              </nav>}
              <BrokerNotice prominent />
            </div>
          </div>
          <div className={styles.summary}>
            <p className={styles.label}>{item.maker} · {item.category}</p>
            <h1>{item.name} charter</h1>
            <dl className={styles.facts}>
              <div><dt>Passengers</dt><dd>{item.typical.passengers}</dd></div>
              <div><dt>Range</dt><dd>{item.typical.range}</dd></div>
              <div><dt>Baggage</dt><dd>{item.typical.baggage}</dd></div>
              <div><dt>Cabin</dt><dd>{item.typical.cabin}</dd></div>
            </dl>
            <ButtonLink href={`/contact?aircraft=${item.slug}`}>Request this aircraft</ButtonLink>
            <p className={styles.note}>Specifications are typical for the type. Actual configuration varies by aircraft. Range and availability depend on route, payload, weather, and operating conditions.</p>
          </div>
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
