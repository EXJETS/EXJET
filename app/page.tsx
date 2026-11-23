import Image from "next/image";
import Link from "next/link";
import { CharterHero } from "@/components/CharterHero";
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

const cabinImages = [
  "/images/manufacturers/latitude-truffle.jpg",
  "/images/manufacturers/longitude-ecru.jpg",
  "/images/manufacturers/falcon-900lx-cabin-new.jpg",
  "/images/manufacturers/global-8000-entertainment.jpg",
] as const;

export default function Home() {
  return <div className={styles.home}>
    <StructuredData data={localBusinessJsonLd()} />
    <CharterHero />
    <section id="plan-your-charter" className={styles.searchArea} aria-labelledby="home-plan-title">
      <h2 id="home-plan-title" className={styles.sr}>Plan a private charter</h2>
      <div className={styles.discovery}><QuoteForm compact /></div>
      <BrokerNotice className={styles.notice} />
    </section>

    <div className={styles.content}>
      <section className={`${styles.section} ${styles.cabinSection}`} aria-labelledby="home-cabins">
        <header className={styles.heading}><h2 id="home-cabins">Charter cabins</h2><Link href="/aircraft/">Compare aircraft <Icon name="forward" width={16} height={16}/></Link></header>
        <HomeBrowseRow label="cabin choices">
          {charterCabinCategories.map(([category, seats],index) => <Link className={styles.cabinCard} key={category} href="/aircraft/">
            <div className={styles.cabinPhoto}><Image src={cabinImages[index]} alt="" fill sizes="(max-width: 700px) 55vw, 24vw"/></div><div><h3>{category === "ULR" ? "Ultra long range" : category}</h3><p>{seats} seats for planning</p></div>
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
