import Image from "next/image";
import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
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
  const updatedLabel = page.updated ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${page.updated}T00:00:00Z`)) : null;
  const breadcrumb = [{name:"Home",path:"/"}, ...(page.parent ? [page.parent] : []),{name:page.title,path:page.path}];
  const schema = {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:breadcrumb.map((entry,index)=>({"@type":"ListItem",position:index+1,name:entry.name,item:absoluteUrl(entry.path)}))};
  return <div className="ex-editorial" data-page-kind={page.kind}>
    <StructuredData data={schema} />
    {page.journalDirectory ? <StructuredData data={{"@context":"https://schema.org","@type":"CollectionPage",name:page.title,description:page.description,url:absoluteUrl(page.path),mainEntity:{"@type":"ItemList",itemListElement:collection.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.title,url:absoluteUrl(item.path)}))}}} /> : null}
    {page.kind === "service" ? <StructuredData data={{"@context":"https://schema.org","@type":"Service",name:page.title,description:page.description,url:absoluteUrl(page.path),provider:{"@id":absoluteUrl("/")+"#organization"}}} /> : null}
    {page.kind === "article" ? <StructuredData data={{"@context":"https://schema.org","@type":page.journal ? "BlogPosting" : "Article",headline:page.title,description:page.description,mainEntityOfPage:absoluteUrl(page.path),publisher:{"@id":absoluteUrl("/")+"#organization"},author:{"@type":"Organization",name:"EXJET editorial",url:absoluteUrl("/editorial-standards")},datePublished:page.published,dateModified:page.updated, ...(page.journal ? {articleSection:page.journal.category,isPartOf:{"@type":"Blog",name:"EXJET Travel Journal",url:absoluteUrl("/travel-journal")}} : {}), ...(page.image ? {image:absoluteUrl(page.image.src)} : {})}} /> : null}
    <div className={`ex-editorial-masthead${feature && page.kind!=="hub" ? " ex-editorial-masthead--photo" : ""}`}><div className="ex-container"><nav className="ex-breadcrumb" aria-label="Breadcrumb">{breadcrumb.map((entry,index)=><span key={entry.path}>{index > 0 ? <span aria-hidden="true"> / </span> : null}{index===breadcrumb.length-1 ? <span aria-current="page">{entry.name}</span>:<Link href={entry.path}>{entry.name}</Link>}</span>)}</nav>
      <header className={isReading ? "ex-story-intro" : "ex-page-intro"}><p className="ex-kicker">{page.kicker}</p><h1>{page.title}</h1><p>{page.description}</p>
        {page.kind==="article" ? <div className="ex-story-meta"><Link href="/editorial-standards">EXJET editorial</Link><span>{page.readTime}</span>{updatedLabel ? <span>Updated {updatedLabel}</span> : null}</div> : null}
        {page.kind==="service" ? <div className="ex-intro-actions">{consultationHref ? <a className="button button--dark" href={consultationHref}>{page.consultation?.label}</a> : <Link className="button button--dark" href="/contact">Discuss your plans</Link>}<Link className="ex-inline-link" href={consultationHref ? "/services" : "/charter"}>{consultationHref ? "Explore all services" : "Find a flight"}<CaretRightIcon size={16} weight="light" aria-hidden="true" /></Link></div> : null}
      </header>
    </div>
    {feature && page.kind!=="hub" ? <figure className="ex-feature-photo" ><Image src={feature.src} alt={feature.alt} width={feature.width} height={feature.height} priority sizes="100vw" /></figure> : null}
    </div>
    {page.serviceCatalog ? <section className="ex-section ex-section--silver"><div className="ex-container"><div className="ex-section-heading"><h2>Explore our services</h2></div><ServicesGrid /></div></section> : null}

    {page.journalDirectory ? <TravelJournalDirectory items={collection.filter(item=>item.journal).map(item=>({path:item.path,title:item.title,description:item.description,category:item.journal!.category,region:item.journal!.region,readTime:item.readTime,focus:item.facts?.map(fact=>fact.value).join(" ") || ""}))} /> : page.items ? <ContentDirectory title={page.collectionTitle || "Explore"} items={collection.map(item => ({path:item.path,title:item.title,description:item.description,kicker:item.kicker,codes:item.codes,searchText:[item.title,item.description,item.kicker,...(item.codes || []),...(item.facts?.map(fact=>fact.value) || [])].join(" ")}))} /> : null}
    <div className={`ex-container ex-content-layout${page.sections.length >= 3 ? " ex-content-layout--outline" : ""}`}><PageOutline sections={page.sections} /><div className="ex-reading">
      {page.draft ? <p className="ex-draft-note">Policy draft for review. Final terms depend on EXJET’s confirmed practices and the applicable charter agreement.</p> : null}
      {page.facts?.length ? <dl className="ex-facts">{page.facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> : null}

      <ContentSections sections={page.sections} />
      {page.faqs ? <ContentFaq faqs={page.faqs} /> : null}
    </div></div>
    {page.related?.length ? <ContentCollection paths={page.related.filter(path => path !== page.path)} title="Continue exploring." silver showImages={false} /> : null}
    {page.kind!=="legal" ? <section className="ex-action-panel"><h2>{consultationHref ? "Plan your next aviation decision." : "Make it your itinerary."}</h2><p>{consultationHref ? "Share the aircraft, objectives and timing. EXJET will help define the next steps." : "Tell EXJET where you’re going, who’s travelling, and what matters along the way."}</p>{consultationHref ? <a href={consultationHref} className="button button--dark">{page.consultation?.label}</a> : <><Link href="/charter" className="button button--dark">Find a flight</Link><BrokerNotice /></>}</section> : null}
  </div>;
}
