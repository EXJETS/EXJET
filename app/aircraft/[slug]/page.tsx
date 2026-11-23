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
import catalog from "@/components/AircraftCatalog.module.css";
import { aircraft, getAircraft } from "@/data/aircraft";
import { buildDynamicMetadata } from "@/data/seo";
import { absoluteUrl } from "@/data/site";
import { getAircraftReference } from "@/data/aircraft-reference";
import { directoryAircraft, getDirectoryAircraft, getModelSpecification, isRequestOnly, unknownSpec } from "@/data/aircraft-directory";
import { AircraftRangeMap } from "@/components/AircraftRangeMap";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...new Set([...aircraft, ...directoryAircraft].map(item => item.slug))].map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getDirectoryAircraft(slug) ?? getAircraft(slug);
  if (!item) return {};
  const model = getModelSpecification(slug);
  return buildDynamicMetadata({
    path: `/aircraft/${item.slug}`,
    title: `${item.name} Aircraft Profile: Specs & Range | EXJET`,
    description: aircraftGuides[slug as keyof typeof aircraftGuides]?.description ?? item.summary,
    image: item.image,
    noindex: Boolean(model && !model.rangeNm && !getAircraft(slug)),
  });
}

export default async function AircraftDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getDirectoryAircraft(slug) ?? getAircraft(slug);
  if (!item) notFound();

  const guide = aircraftGuides[slug as keyof typeof aircraftGuides];
  const model = getModelSpecification(slug);
  const legacy = getAircraft(slug);
  const reference = !model || legacy?.name === model.name ? getAircraftReference(slug) : undefined;
  const requestOnly = model ? isRequestOnly(model) : false;
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
      <section className={`${styles.wrap} ${catalog.profilePage}`}>
        <nav className={styles.back} aria-label="Breadcrumb"><Link href="/aircraft/">← Back to aircraft</Link></nav>
        <div className={`${styles.split} ${catalog.profileSplit}`}>
          <div>
            {item.scenes.some(scene => scene.image || scene.gallery?.length) ? <div className={styles.gallery}><AircraftDetail item={item} mediaOnly /></div> : <div className={catalog.noMedia}><span>{item.name}</span><p>No approved model photography is shown for this profile.</p></div>}
            <div className={styles.profileCopy}>
              <p className={styles.label}>{item.maker} · {item.category}{requestOnly ? " · Request only" : ""}</p>
              <h1>{item.name}</h1>
              <p>{item.summary}</p>
              {(model || reference) && <nav className={styles.strip} aria-label={`${item.name} page sections`}>
                <a href={model ? "#aircraft-specifications" : "#aircraft-legacy-specifications"}>Specifications <span aria-hidden="true">↓</span></a>
                {!!reference?.floorplans?.length && <a href="#cabin-layout">Cabin layouts <span aria-hidden="true">↓</span></a>}
              </nav>}
              <BrokerNotice prominent />
            </div>
          </div>
          <aside className={`${styles.summary} ${catalog.profileRail}`} aria-labelledby="aircraft-inquiry">
            <p className={styles.label}>Charter planning</p>
            <h2 id="aircraft-inquiry">{requestOnly ? "Discuss this aircraft" : "Plan your trip"}</h2>
            <dl className={styles.facts}>
              <div><dt>Passengers</dt><dd>{item.typical.passengers}</dd></div>
              <div><dt>Range</dt><dd>{item.typical.range}</dd></div>
              <div><dt>Baggage</dt><dd>{item.typical.baggage}</dd></div>
              <div><dt>Cabin</dt><dd>{item.typical.cabin}</dd></div>
            </dl>
            <ButtonLink className={catalog.primary} href={`/contact?aircraft=${item.slug}`}>{requestOnly ? "Discuss with an advisor" : "Ask about this model"}</ButtonLink>
            {model && <a href="#aircraft-specifications" className={catalog.profileAnchor}>See specifications and range ↓</a>}
            {requestOnly && <p className={styles.note}>Reference only. This model is not listed as available inventory and is not eligible for an automatic quote.</p>}
            <p className={styles.note}>Specifications are typical for the type. Actual configuration varies by aircraft. Range and availability depend on route, payload, weather, and operating conditions.</p>
          </aside>
        </div>
      </section>
      {model && <section id="aircraft-specifications" className={`${styles.wrap} ${catalog.specSheet}`} aria-labelledby="model-planning">
        <p className={styles.label}>Aircraft specifications</p>
        <h2 className={styles.sectionTitle} id="model-planning">Model planning reference</h2>
        <dl className={styles.facts}>
          <div><dt>Published passengers</dt><dd>{item.typical.passengers}</dd></div>
          {model.configurationSeats !== undefined && <div><dt>Source configuration</dt><dd>{model.configurationSeats} seats</dd></div>}
          <div><dt>Published range</dt><dd>{item.typical.range}</dd></div>
          <div><dt>Published speed</dt><dd>{model.maxSpeed ?? unknownSpec}</dd></div>
          <div><dt>Published ceiling</dt><dd>{model.ceiling ?? unknownSpec}</dd></div>
          <div><dt>Cabin height</dt><dd>{model.cabin?.height ?? unknownSpec}</dd></div>
          <div><dt>Cabin width</dt><dd>{model.cabin?.width ?? unknownSpec}</dd></div>
          <div><dt>Cabin length</dt><dd>{model.cabin?.length ?? unknownSpec}</dd></div>
          <div><dt>Baggage volume</dt><dd>{model.baggage ?? unknownSpec}</dd></div>
        </dl>
        {model.rangeBasis && <p>{model.rangeBasis}</p>}
        {model.notes && <p>{model.notes}</p>}
        {model.source && <p>Source: <a href={model.source.url}>{model.source.label}</a></p>}
        <AircraftRangeMap profiles={[model]} />
      </section>}
      {reference && <AircraftReference slug={slug} />}
      {guide && (!model || legacy?.name === model.name) ? <div className="ex-editorial"><div className="ex-container ex-content-layout ex-content-layout--outline"><PageOutline sections={guide.sections} /><div className="ex-reading">
        <ContentSections sections={guide.sections} />
        <ContentFaq faqs={guide.faqs} />
      </div></div></div> : null}
    </>
  );
}
