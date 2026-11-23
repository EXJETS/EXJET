import Image from "next/image";
import Link from "next/link";
import { HomeBrowseRow } from "@/components/HomeBrowseRow";
import { QuoteForm } from "@/components/QuoteForm";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { BrowseFlightGlyph as Icon } from "@/components/BrowseFlightGlyph";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import { charterCabinCategories, charterCapacityNote } from "@/data/charter-planning-rates";
import styles from "./home-browse.module.css";

export const metadata = buildMetadata("/");

const models = [
  { name:"Gulfstream G700", detail:"Ultra long range", leaf:"gulfstream-g700", image:"/images/hero/gulfstream-g700-water.webp", position:"65% 38%" },
  { name:"Bombardier Global 8000", detail:"Ultra long range", leaf:"global-8000", image:"/images/hero/bombardier-global-8000-coast.webp", position:"47% 50%" },
  { name:"Bombardier Challenger 3500", detail:"Super midsize", leaf:"challenger-3500", image:"/images/hero/bombardier-challenger-3500-water.webp", position:"49% 46%" },
  { name:"Dassault Falcon 900LX", detail:"Large cabin", leaf:"falcon-900", image:"/images/manufacturers/falcon-900lx-coast.jpg", position:"center" },
  { name:"Cessna Citation Longitude", detail:"Super midsize", leaf:"citation-longitude", image:"/images/manufacturers/longitude-mission.jpg", position:"center" },
] as const;

const airports=[
  ["DAL","Dallas Love Field","kdal"],["TEB","Teterboro","kteb"],["VNY","Van Nuys","kvny"],["OPF","Miami Opa-locka","kopf"],
  ["ADS","Addison","kads"],["ASE","Aspen","kase"],["HOU","Houston Hobby","khou"],["LAS","Las Vegas","klas"],
] as const;

const routes=[
  ["Dallas to Aspen","DAL","ASE","dallas-to-aspen"],["Dallas to New York","DAL","TEB","dallas-to-new-york"],
  ["Dallas to Miami","DAL","OPF","dallas-to-miami"],["Dallas to Cabo","DAL","SJD","dallas-to-cabo"],
] as const;

const journal=[
  ["St. Barts","Islands & coast","st-barts","coast-0"],["Aspen","Alpine escapes","aspen","alpine-1"],
  ["Paris","Culture & dining","paris","culture"],["Cape Town","Safari & nature","cape-town","nature"],
] as const;

function CabinSketch({index}:{index:number}) {
  const wing = [100,115,130,146][index] ?? 100;
  const right=174+index*13, left=57-index*5;
  return <svg className={styles.cabinArt} viewBox="0 0 275 112" fill="none" aria-hidden="true" focusable="false">
    <path d="M0 25h275M0 56h275M0 87h275M47 0v112m46-112v112m46-112v112m46-112v112m46-112v112" stroke="currentColor" opacity=".17"/>
    <path d={`M${left} 54 h${right-left} q23 0 35 5-12 7-35 7H${left}l-19-5 19-7Zm24 0-8-12h-13l7 12m14 12-8 12h-13l7-12M${wing} 55l-31-28h-22l20 28m33 11-31 26h-22l20-26`} stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round"/>
    {[0,1,2,3,4,5].slice(0,3+index).map(k=><circle key={k} cx={111+k*12} cy="60" r="1.4" fill="currentColor"/>)}
    <path d="M12 19v-8h9m231 0h10v8m-250 73v8h9m231 0h10v-8" stroke="currentColor" opacity=".55"/>
  </svg>;
}

export default function Home() {
  return <div className={styles.home}>
    <StructuredData data={localBusinessJsonLd()} />
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Dallas based · Worldwide charter</p>
          <h1 id="home-title">Charter a<br/>private jet.</h1>
          <p>Choose your airports and dates. Compare aircraft, see a trip estimate, or explore empty legs for flexible travel.</p>
          <Link className={styles.heroLink} href="#plan-your-charter">Plan a flight <Icon name="forward" width={17} height={17}/></Link>
        </div>
        <figure className={styles.heroVisual}>
          <Image src={models[0].image} alt="Gulfstream G700 in flight over turquoise water" fill sizes="(max-width: 720px) 100vw, 60vw" preload className={styles.heroPhoto}/>
          <figcaption><span>EXJET AIRCRAFT GUIDE</span><Link href="/aircraft/gulfstream-g700/">Gulfstream G700 <Icon name="forward" width={15} height={15}/></Link></figcaption>
        </figure>
      </div>
    </section>

    <section id="plan-your-charter" className={styles.searchArea} aria-labelledby="home-plan-title">
      <div className={styles.discovery}>
        <div className={styles.searchNav}>
          <h2 id="home-plan-title"><Icon name="aircraft" /> Plan a charter</h2>
          <Link href="/empty-legs/"><Icon name="empty" /> Browse empty legs <Icon name="forward" width={16} height={16} /></Link>
        </div>
        <div className={styles.quote}><QuoteForm compact/><BrokerNotice className={styles.notice}/></div>
      </div>
    </section>

    <div className={styles.content}>
      <section className={`${styles.section} ${styles.cabinSection}`} aria-labelledby="home-cabins">
        <header className={styles.heading}><h2 id="home-cabins">Find your cabin</h2><Link href="/aircraft/">Compare aircraft <Icon name="forward" width={16} height={16}/></Link></header>
        <HomeBrowseRow label="cabin choices">
          {charterCabinCategories.map(([category, seats],index) => <Link className={styles.cabinCard} key={category} href="/aircraft/">
            <CabinSketch index={index}/><div><h3>{category === "ULR" ? "Ultra long range" : category}</h3><p>{seats} planning seats</p></div>
          </Link>)}
        </HomeBrowseRow>
        <p className={styles.caption}>{charterCapacityNote}</p>
      </section>

      <section className={styles.section} aria-labelledby="home-aircraft">
        <header className={styles.heading}><div><h2 id="home-aircraft">Explore aircraft</h2><p>Compare seating, specifications, performance and range maps.</p></div><Link href="/aircraft/">View all aircraft <Icon name="forward" width={16} height={16}/></Link></header>
        <HomeBrowseRow label="aircraft profiles" photos>
          {models.map(item => <Link key={item.leaf} className={styles.photoCard} href={`/aircraft/${item.leaf}/`}>
            <div className={styles.photo}><Image src={item.image} alt="" fill sizes="(max-width: 700px) 82vw, 34vw" style={{objectPosition:item.position}}/></div>
            <div className={styles.photoCopy}><p>{item.detail}</p><h3>{item.name}</h3><span>View aircraft <Icon name="forward" width={16} height={16}/></span></div>
          </Link>)}
        </HomeBrowseRow>
        <p className={styles.caption}>Model profiles are for comparison, not availability. The operating carrier confirms the aircraft for each trip.</p>
      </section>

      <section className={`${styles.section} ${styles.airportSection}`} aria-labelledby="home-airports">
        <header className={styles.heading}><h2 id="home-airports">Browse by airport</h2><Link href="/airports/">Airport guides <Icon name="forward" width={16} height={16}/></Link></header>
        <HomeBrowseRow label="airport guides">{airports.map(([code,label,slug])=><Link className={styles.airportCard} href={`/airports/${slug}/`} key={code}><div><h3>{code}</h3><p>{label}</p></div><Icon name="pin"/></Link>)}</HomeBrowseRow>
      </section>

      <section className={`${styles.section} ${styles.routeSection}`} aria-labelledby="home-routes">
        <header className={styles.heading}><h2 id="home-routes">Routes from Dallas</h2><Link href="/routes/">All charter routes <Icon name="forward" width={16} height={16}/></Link></header>
        <HomeBrowseRow label="Dallas routes">{routes.map(([name,from,to,leaf])=><Link className={styles.routeCard} href={`/routes/${leaf}/`} key={leaf}><span className={styles.airpair}>{from}<Icon name="forward" width={16} height={16}/>{to}</span><h3>{name}</h3></Link>)}</HomeBrowseRow>
      </section>

      <aside className={styles.emptyCallout}>
        <Icon name="empty" width={31} height={31} />
        <div><h2>Flexible on dates?</h2><p>Explore one-way empty legs. Routes and availability can change.</p></div>
        <Link className={styles.emptyAction} href="/empty-legs/">Browse empty legs <Icon name="forward" width={17} height={17}/></Link>
      </aside>

      <section className={`${styles.section} ${styles.journalSection}`} aria-labelledby="home-journal">
        <header className={styles.heading}><h2 id="home-journal">EXJET Travel Journal</h2><Link href="/travel-journal/">All travel guides <Icon name="forward" width={16} height={16}/></Link></header>
        <HomeBrowseRow label="travel guides">{journal.map(([place,category,leaf,art])=><Link className={styles.photoCard} href={`/travel-journal/${leaf}/`} key={leaf}><div className={`${styles.photo} ${styles.journalPhoto}`}><Image src={`/brand/journal/${art}.svg`} alt="" fill sizes="(max-width: 700px) 60vw, 28vw" /></div><div className={styles.photoCopy}><p>{category}</p><h3>{place}</h3></div></Link>)}</HomeBrowseRow>
      </section>
    </div>
  </div>;
}
