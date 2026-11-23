import Link from "next/link";
import { HomeHeroSlides, type HeroSlide } from "@/components/HomeHeroSlides";
import { HomeAircraftEditorial } from "@/components/HomeAircraftEditorial";
import { QuoteForm } from "@/components/QuoteForm";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { CharterCoverageGraphic, CharterIcon, type CharterIconName } from "@/components/CharterVisuals";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import { charterCabinCategories, charterCapacityNote } from "@/data/charter-planning-rates";
import styles from "./landing.module.css";

export const metadata = buildMetadata("/");

const heroSlides: readonly HeroSlide[] = [
  { src: "/images/hero/gulfstream-g700-water.webp", label: "Gulfstream G700", description: "Gulfstream G700 in flight over turquoise water", href: "/aircraft/", position: "65% 38%" },
  { src: "/images/hero/bombardier-global-8000-coast.webp", label: "Bombardier Global 8000", description: "Bombardier Global 8000 flying along a coastline", href: "/aircraft/global-8000/", position: "47% 50%" },
  { src: "/images/hero/bombardier-challenger-3500-water.webp", label: "Bombardier Challenger 3500", description: "Bombardier Challenger 3500 in flight over deep blue water", href: "/aircraft/", position: "49% 46%" },
];

const charterOptions = [
  {icon:"aircraft", name:"Passenger charter", href:"/charter/"},
  {icon:"group", name:"Group charter", href:"/group-charter/"},
  {icon:"cargo", name:"Cargo charter", href:"/cargo/"},
  {icon:"empty", name:"Empty legs", href:"/empty-legs/"},
] satisfies {icon:CharterIconName;name:string;href:string}[];

const routes = [
  {name:"Dallas to Aspen", detail:"DAL → ASE", href:"/routes/dallas-to-aspen/"},
  {name:"Dallas to New York", detail:"DAL → TEB", href:"/routes/dallas-to-new-york/"},
  {name:"Dallas to Miami", detail:"DAL → OPF", href:"/routes/dallas-to-miami/"},
];

export default function Home() {
 return <div className={styles.landing}>
  <StructuredData data={localBusinessJsonLd()} />
  <section className={styles.hero} aria-labelledby="home-title">
   <HomeHeroSlides slides={heroSlides} />
  </section>

  <section id="plan-your-charter" className={styles.planner} aria-labelledby="home-quote-title">
   <div className={styles.plannerInner}>
    <header className={styles.plannerIntro}>
     <h2 id="home-quote-title">Plan your flight.</h2>
     <p>See your estimated trip total and route map.</p>
    </header>
    <div className={styles.quotePanel}><QuoteForm compact /><BrokerNotice className={styles.quoteNotice} /></div>
   </div>
  </section>

  <nav className={styles.optionSection} aria-label="Charter options">
   <div className={styles.optionCards}>{charterOptions.map(option => <Link key={option.href} href={option.href}>
    <CharterIcon className={styles.featureIcon} name={option.icon} /><span>{option.name}</span>
   </Link>)}</div>
  </nav>

  <section className={styles.collectionSection} aria-labelledby="home-aircraft">
   <header className={styles.sectionIntro}><h2 id="home-aircraft">Aircraft</h2><Link className={styles.inlineLink} href="/aircraft/">View all aircraft <CharterIcon name="arrow" /></Link></header>
   <div className={styles.cabinRow} aria-label="Charter cabin categories">{charterCabinCategories.map(([category, seats]) => <div key={category}><span>{category}</span><strong>{seats} seats</strong></div>)}</div>
   <p className={styles.caption}>{charterCapacityNote}</p>
   <HomeAircraftEditorial />
  </section>

  <section className={styles.coverage} aria-labelledby="home-routes-title">
   <div className={styles.coverageInner}>
    <div><h2 id="home-routes-title">Explore routes</h2>
     <ul>{routes.map(route => <li key={route.href}><Link href={route.href}><span>{route.name}<small>{route.detail}</small></span><CharterIcon name="arrow" /></Link></li>)}</ul>
     <Link className={styles.inlineLink} href="/routes/">Explore all routes <CharterIcon name="arrow" /></Link>
    </div>
    <figure><CharterCoverageGraphic className={styles.mapGraphic} /><figcaption>Illustrative routes · Map data: Natural Earth</figcaption></figure>
   </div>
  </section>

 </div>;
}
