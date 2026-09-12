import Image from "next/image";
import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { absoluteUrl } from "@/data/site";
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
  const pages = paths.map(path => contentPages.find(page => page.path === path)).filter((page): page is ContentPage => Boolean(page));
  if (!pages.length) return null;
  return <section className={`ex-section${silver ? " ex-section--silver" : ""}`}><div className="ex-container"><div className="ex-section-heading"><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div></div><div className="ex-card-grid">{pages.map(page => <ContentCard page={page} key={page.path} showImage={showImages} />)}</div></div></section>;
}

export function EditorialPage({ page }: { page: ContentPage }) {
  const isReading = page.kind === "article" || page.kind === "legal";
  const updatedLabel = page.updated ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${page.updated}T00:00:00Z`)) : null;
  const breadcrumb = [{name:"Home",path:"/"}, ...(page.parent ? [page.parent] : []),{name:page.title,path:page.path}];
  const schema = {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:breadcrumb.map((entry,index)=>({"@type":"ListItem",position:index+1,name:entry.name,item:absoluteUrl(entry.path)}))};
  return <div className="ex-editorial">
    <StructuredData data={schema} />
    {page.kind === "article" ? <StructuredData data={{"@context":"https://schema.org","@type":"Article",headline:page.title,description:page.description,mainEntityOfPage:absoluteUrl(page.path),publisher:{"@type":"Organization",name:"EXJET LLC",url:absoluteUrl("/")},author:{"@type":"Organization",name:"EXJET editorial",url:absoluteUrl("/editorial-standards")},dateModified:page.updated, ...(page.image ? {image:absoluteUrl(page.image.src)} : {})}} /> : null}
    <div className="ex-container"><nav className="ex-breadcrumb" aria-label="Breadcrumb">{breadcrumb.map((entry,index)=><span key={entry.path}>{index > 0 ? <span aria-hidden="true"> / </span> : null}{index===breadcrumb.length-1 ? <span aria-current="page">{entry.name}</span>:<Link href={entry.path}>{entry.name}</Link>}</span>)}</nav>
      <header className={isReading ? "ex-story-intro" : "ex-page-intro"}><p className="ex-kicker">{page.kicker}</p><h1>{page.title}</h1><p>{page.description}</p>
        {page.kind==="article" ? <div className="ex-story-meta"><Link href="/editorial-standards">EXJET editorial</Link><span>{page.readTime}</span>{updatedLabel ? <span>Updated {updatedLabel}</span> : null}</div> : null}
        {page.kind==="service" ? <div className="ex-intro-actions"><Link className="button button--dark" href="/contact">Discuss your plans</Link><Link className="ex-inline-link" href="/charter">Find a flight<CaretRightIcon size={16} weight="light" aria-hidden="true" /></Link></div> : null}
      </header>
    </div>
    {page.image && page.kind!=="hub" ? <figure className="ex-feature-photo" style={{maxWidth:Math.min(page.image.width,1400)}}><Image src={page.image.src} alt={page.image.alt} width={page.image.width} height={page.image.height} priority sizes="(max-width:1400px) 100vw, 1400px" /><figcaption>{page.image.caption || page.image.alt}</figcaption></figure> : null}
    {page.items ? <ContentCollection paths={page.items} title={page.collectionTitle || "Explore"} silver showImages={page.path === "/articles"} /> : null}
    <div className="ex-container"><div className="ex-reading">
      {page.draft ? <p className="ex-draft-note">Policy draft for review. Final terms depend on EXJET’s confirmed practices and the applicable charter agreement.</p> : null}
      {page.facts?.length ? <dl className="ex-facts">{page.facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> : null}
      {isReading && page.sections.length>3 ? <details className="ex-toc"><summary>In this {page.kind==="legal" ? "policy" : "guide"}</summary><ol>{page.sections.map((section,index)=><li key={section.heading}><a href={`#section-${index+1}`}>{section.heading}</a></li>)}</ol></details> : null}
      {page.sections.map((section,index)=><section key={section.heading} aria-labelledby={`section-${index+1}`}><h2 id={`section-${index+1}`}>{section.heading}</h2>{section.paragraphs.map((text,i)=><p key={i}>{text}</p>)}{section.bullets?.length ? <ul>{section.bullets.map(text=><li key={text}>{text}</li>)}</ul>:null}{section.links?.map(link=><p key={link.path}><Link href={link.path}>{link.label}</Link></p>)}</section>)}
      {page.sources?.length ? <section className="ex-sources" aria-label="Sources"><h2>Sources & further reading</h2><ul>{page.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></section> : null}
    </div></div>
    {page.related?.length ? <ContentCollection paths={page.related} title="Continue exploring." silver showImages={false} /> : null}
    {page.kind!=="legal" ? <section className="ex-action-panel"><h2>Make it your itinerary.</h2><p>Tell EXJET where you’re going, who’s travelling, and what matters along the way.</p><Link href="/charter" className="button button--dark">Find a flight</Link><BrokerNotice /></section> : null}
  </div>;
}
