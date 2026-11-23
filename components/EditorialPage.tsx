import Image from "next/image";
import Link from "next/link";
import { ArrowDownIcon, ArrowRightIcon, BookOpenIcon, CaretRightIcon, CompassIcon, FileTextIcon, PathIcon } from "@phosphor-icons/react/dist/ssr";
import { BrokerNotice } from "@/components/BrokerNotice";
import { ContentSections, ContentFaq } from "@/components/ContentSections";
import { StructuredData } from "@/components/StructuredData";
import { ServicesGrid } from "@/components/ServicesGrid";
import { ContentDirectory } from "@/components/ContentDirectory";
import { PageOutline } from "@/components/PageOutline";
import { TravelJournalDirectory } from "@/components/TravelJournalDirectory";
import { servicePhotos } from "@/data/service-photos";
import { absoluteUrl, siteConfig } from "@/data/site";
import { contentPages, type ContentPage } from "@/data/editorial";
import { isRetiredPublicPath } from "@/data/public-route-retirements";
import styles from "./EditorialPage.module.css";

export function ContentCard({ page, showImage = true }: { page: ContentPage; showImage?: boolean }) {
  return <article className={`ex-card${showImage && page.image ? " ex-card--photo" : " ex-card--text"}`}>
    {showImage && page.image ? <div className="ex-card-image" data-scene={page.image.scene}><Image src={page.image.src} alt={page.image.alt} width={page.image.width} height={page.image.height} sizes="(max-width:760px) 100vw, 33vw" /></div> : null}
    {page.codes ? <div className="ex-route-pair" aria-label={page.codes.join(" to ")}>{page.codes[0]}<span aria-hidden="true" />{page.codes[1]}</div> : null}
    <p className="ex-card-meta">{page.kicker}</p><h3><Link href={page.path}>{page.title}</Link></h3><p>{page.description}</p>
    <Link href={page.path} className="ex-inline-link">{page.kind === "article" ? "Read the guide" : "Explore"}<CaretRightIcon size={16} weight="light" aria-hidden="true" /></Link>
  </article>;
}

export function ContentCollection({ paths, title, description, silver = false, showImages = true }: { paths: string[]; title: string; description?: string; silver?: boolean; showImages?: boolean }) {
  const pages = [...new Set(paths)].map(path => contentPages.find(page => page.path === path)).filter((page): page is ContentPage => Boolean(page));
  if (!pages.length) return null;
  return <section className={`ex-section${silver ? " ex-section--silver" : ""}`}><div className="ex-container"><div className="ex-section-heading"><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div></div><div className="ex-card-grid">{pages.map(page => <ContentCard page={page} key={page.path} showImage={showImages} />)}</div></div></section>;
}

export function EditorialPage({ page }: { page: ContentPage }) {
  const servicePhoto = servicePhotos[page.path];
  const feature = page.image ?? servicePhoto;
  const collection = (page.items || []).map(path => contentPages.find(item => item.path === path)).filter((item): item is ContentPage => Boolean(item));
  const consultationHref = page.consultation ? `mailto:${siteConfig.email.general}?subject=${encodeURIComponent(page.consultation.subject)}` : null;
  const isReading = page.kind === "article" || page.kind === "legal";
  const isCharterPlanning = page.kind === "route" || page.kind === "airport" || page.kind === "city" || page.path === "/private-jet-charter" || page.path.startsWith("/private-jet-charter/");
  const isCompact = page.kind === "route" || page.kind === "airport" || page.kind === "city";
  const isDirectory = Boolean(page.items || page.journalDirectory || page.serviceCatalog);
  const hasOutline = page.sections.length >= 3;
  const hasReading = Boolean(page.sections.length || page.faqs?.length || page.draft);
  const showRequest = isCharterPlanning || page.kind === "service";
  const quotePath = page.quotePath || "/charter/";
  const RailIcon = showRequest ? PathIcon : page.kind === "article" ? BookOpenIcon : page.kind === "legal" ? FileTextIcon : CompassIcon;
  const railTitle = isCharterPlanning ? "Plan your itinerary" : page.kind === "service" ? "Your next step" : page.kind === "article" ? "About this guide" : page.kind === "legal" ? "Policy information" : "Explore this page";
  const updatedLabel = page.updated ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${page.updated}T00:00:00Z`)) : null;
  const breadcrumb = [{name:"Home",path:"/"}, ...(page.parent && !isRetiredPublicPath(page.parent.path) ? [page.parent] : []),{name:page.title,path:page.path}];
  const pageUrl = absoluteUrl(page.path);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": pageUrl + "#breadcrumb",
    itemListElement: breadcrumb.map((entry, index) => ({
      "@type": "ListItem", position: index + 1, name: entry.name, item: absoluteUrl(entry.path),
    })),
  };
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": collection.length ? "CollectionPage" : "WebPage",
    "@id": pageUrl + "#webpage",
    name: page.seoTitle || page.title,
    url: pageUrl,
    description: page.description,
    inLanguage: "en-US",
    isPartOf: { "@id": absoluteUrl("/") + "#website" },
    publisher: { "@id": absoluteUrl("/") + "#organization" },
    breadcrumb: { "@id": schema["@id"] },
    ...(page.updated ? { dateModified: page.updated } : {}),
    ...(collection.length ? { mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.map((item, index) => ({
        "@type": "ListItem", position: index + 1, name: item.title, url: absoluteUrl(item.path),
      })),
    } } : {}),
  };
  return <div className={`ex-editorial ${styles.editorial}`} data-page-kind={page.kind} data-compact={isCompact ? "true" : undefined}>
    <StructuredData data={schema} />
    {!page.noindex && !page.draft ? <StructuredData data={pageSchema} /> : null}
    {page.kind === "service" ? <StructuredData data={{"@context":"https://schema.org","@type":"Service",name:page.title,description:page.description,url:absoluteUrl(page.path),provider:{"@id":absoluteUrl("/")+"#organization"}}} /> : null}
    {page.kind === "article" ? <StructuredData data={{"@context":"https://schema.org","@type":page.journal ? "BlogPosting" : "Article",headline:page.title,description:page.description,mainEntityOfPage:{"@id":pageUrl+"#webpage"},publisher:{"@id":absoluteUrl("/")+"#organization"},author:{"@type":"Organization",name:"EXJET editorial",url:absoluteUrl("/editorial-standards")},datePublished:page.published,dateModified:page.updated, ...(page.journal ? {articleSection:page.journal.category,isPartOf:{"@type":"Blog",name:"EXJET Travel Journal",url:absoluteUrl("/travel-journal")}} : {}), ...(page.image ? {image:absoluteUrl(page.image.src)} : {})}} /> : null}
    <div className={styles.masthead}>
      <div className={styles.shell}>
        <nav className={`ex-breadcrumb ${styles.breadcrumb}`} aria-label="Breadcrumb">
          {breadcrumb.map((entry,index)=><span key={entry.path}>{index > 0 ? <span aria-hidden="true"> / </span> : null}{index===breadcrumb.length-1 ? <span aria-current="page">{entry.name}</span>:<Link href={entry.path}>{entry.name}</Link>}</span>)}
        </nav>
        <div className={styles.heroGrid}>
          <header className={styles.intro}>
            <p className="ex-kicker">{page.kicker}</p>
            <h1>{page.title}</h1>
            <p className={styles.lede}>{page.description}</p>
          </header>
          <aside className={styles.topCard} aria-labelledby="editorial-next">
            <h2 id="editorial-next"><RailIcon size={21} aria-hidden="true" />{railTitle}</h2>
            {page.codes?.length === 2 ? <p className={styles.routeCodes} aria-label={page.codes.join(" to ")}>
              <span>{page.codes[0]}</span><ArrowRightIcon size={20} aria-hidden="true" /><span>{page.codes[1]}</span>
            </p> : null}
            {page.kind === "article" ? <div className={styles.articleMeta}>
              <Link href="/editorial-standards">EXJET editorial</Link>
              {page.readTime ? <span>{page.readTime}</span> : null}
              {updatedLabel ? <span>Updated <time dateTime={page.updated}>{updatedLabel}</time></span> : null}
              {hasReading ? <a className={styles.jump} href="#editorial-reading">Read the guide <ArrowDownIcon size={16} aria-hidden="true" /></a> : null}
            </div> : null}
            {page.kind === "legal" ? <div className={styles.articleMeta}>
              {updatedLabel ? <span>Updated <time dateTime={page.updated}>{updatedLabel}</time></span> : null}
              {hasReading ? <a className={styles.jump} href="#editorial-reading">Read the policy <ArrowDownIcon size={16} aria-hidden="true" /></a> : null}
            </div> : null}
            {showRequest ? <div className={styles.actions}>
              {isCharterPlanning ? <>
                  <Link className="button button--dark" href={quotePath}>Plan a flight <ArrowRightIcon size={18} aria-hidden="true" /></Link>
                <Link className="ex-inline-link" href="/pricing/">How charter pricing works <CaretRightIcon size={16} aria-hidden="true" /></Link>
              </> : <>
                {consultationHref ? <a className="button button--dark" href={consultationHref}>{page.consultation?.label} <ArrowRightIcon size={18} aria-hidden="true" /></a> : <Link className="button button--dark" href="/contact">Discuss your plans <ArrowRightIcon size={18} aria-hidden="true" /></Link>}
                <Link className="ex-inline-link" href={consultationHref ? "/aircraft-charter" : quotePath}>{consultationHref ? "Explore charter options" : "Find a flight"} <CaretRightIcon size={16} aria-hidden="true" /></Link>
              </>}
              {isDirectory ? <a className={styles.jump} href="#editorial-directory">Browse this collection <ArrowDownIcon size={16} aria-hidden="true" /></a> : null}
            </div> : null}
            {!isReading && !showRequest ? <div className={styles.actions}>
              {isDirectory ? <a className={styles.jump} href="#editorial-directory">{page.journalDirectory ? "Browse the journal" : page.serviceCatalog ? "Browse services" : "Browse this collection"} <ArrowDownIcon size={16} aria-hidden="true" /></a> : null}
              {hasReading ? <a className={styles.jump} href="#editorial-reading">Read the details <ArrowDownIcon size={16} aria-hidden="true" /></a> : null}
              {page.parent && !isRetiredPublicPath(page.parent.path) ? <Link className={styles.jump} href={page.parent.path}>{page.parent.name} <CaretRightIcon size={16} aria-hidden="true" /></Link> : null}
            </div> : null}
          </aside>
          {!isReading ? <div className={styles.disclosure}><BrokerNotice prominent /></div> : null}
        </div>
        {feature && page.kind!=="hub" && !isCompact ? <figure className={styles.feature}><Image src={feature.src} alt={feature.alt} width={feature.width} height={feature.height} preload sizes="(min-width: 1320px) 1320px, 100vw" /></figure> : null}
      </div>
    </div>
    {isDirectory ? <div id="editorial-directory" className={styles.directory}>
      {page.serviceCatalog ? <section className="ex-section ex-section--silver"><div className="ex-container"><div className="ex-section-heading"><h2>Explore our services</h2></div><ServicesGrid /></div></section> : null}
      {page.journalDirectory ? <TravelJournalDirectory items={collection.filter(item=>item.journal).map(item=>({path:item.path,title:item.title,description:item.description,category:item.journal!.category,region:item.journal!.region,readTime:item.readTime,focus:item.facts?.map(fact=>fact.value).join(" ") || ""}))} /> : page.items ? <ContentDirectory title={page.collectionTitle || "Explore"} items={collection.map(item => ({path:item.path,title:item.title,description:item.description,kicker:item.kicker,codes:item.codes,searchText:[item.title,item.description,item.kicker,...(item.codes || []),...(item.facts?.map(fact=>fact.value) || [])].join(" ")}))} /> : null}
    </div> : null}
    {page.facts?.length ? <div className={`${styles.shell} ${styles.factsWrap}`}><dl className={styles.facts} aria-label="At a glance">{page.facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></div> : null}
    {hasReading ? <div id="editorial-reading" className={`${styles.shell} ${styles.body} ${hasOutline ? styles.withRail : ""}`}>
      {hasOutline ? <div className={styles.rail}><PageOutline sections={page.sections} /></div> : null}
      <div className={`ex-reading ${styles.reading}`}>
        {page.draft ? <p className="ex-draft-note">Policy draft for review. Final terms depend on EXJET’s confirmed practices and the applicable charter agreement.</p> : null}
        <ContentSections sections={page.sections} />
        {page.faqs ? <ContentFaq faqs={page.faqs} /> : null}
      </div>
    </div> : null}
    {page.related?.length ? <ContentCollection paths={page.related.filter(path => path !== page.path)} title="Related pages" silver showImages={false} /> : null}
    {page.kind!=="legal" ? <section className={`ex-action-panel ${styles.bottomAction}`}><h2>{consultationHref ? "Plan your next aviation decision." : "Plan a flight"}</h2><p>{consultationHref ? "Share the aircraft, objectives and timing. EXJET will help define the next steps." : "See an estimated trip total and route map."}</p>{consultationHref ? <a href={consultationHref} className="button button--dark">{page.consultation?.label}</a> : <><Link href={quotePath} className="button button--dark">Find a flight</Link><BrokerNotice /></>}</section> : null}
  </div>;
}
