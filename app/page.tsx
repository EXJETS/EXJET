import Image from "next/image";
import Link from "next/link";
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

const charterOptions = [
  {icon:"aircraft", name:"Passenger charter", href:"/charter/", info:"A private aircraft for you and your guests."},
  {icon:"group", name:"Group charter", href:"/group-charter/", info:"Coordinate larger groups on one itinerary."},
  {icon:"cargo", name:"Cargo charter", href:"/cargo/", info:"Dedicated lift for freight that cannot wait."},
  {icon:"empty", name:"Empty legs", href:"/empty-legs/", info:"Repositioning flights for flexible travel."},
] satisfies {icon:CharterIconName;name:string;href:string;info:string}[];

const routes = [
  {name:"Dallas to Aspen", detail:"DAL → ASE", href:"/routes/dallas-to-aspen/"},
  {name:"Dallas to New York", detail:"DAL → TEB", href:"/routes/dallas-to-new-york/"},
  {name:"Dallas to Miami", detail:"DAL → OPF", href:"/routes/dallas-to-miami/"},
];

const steps = [
  {icon:"route", name:"Build your itinerary", info:"Choose your airports, dates, passenger count, and cabin. Add a return or more stops when you need them."},
  {icon:"quote", name:"See the trip estimate", info:"Review the estimated flight total and an illustrated route map before sharing your contact details."},
  {icon:"check", name:"Confirm the details", info:"Review the written quote, available aircraft, and operating carrier before you book."},
] satisfies {icon:CharterIconName;name:string;info:string}[];

export default function Home() {
 return <div className={styles.landing}>
  <StructuredData data={localBusinessJsonLd()} />
  <section className={styles.hero} aria-labelledby="home-title">
   <figure className={styles.heroVisual}>
    <Image className={styles.heroPhoto} src="/images/manufacturers/global-8000-clouds.webp" alt="Bombardier Global 8000 banking above the clouds" fill sizes="100vw" preload />
    <figcaption>Pictured: Bombardier Global 8000</figcaption>
   </figure>
   <div className={styles.heroCopy}>
    <h1 id="home-title">Private jet charter</h1>
    <p>Choose your route. See your trip estimate.</p>
    <div className={styles.heroButtons}>
     <a className={styles.blueButton} href="#plan-your-charter">Plan a flight <CharterIcon name="arrow" /></a>
     <Link className={styles.whiteButton} href="/aircraft/">Explore aircraft</Link>
    </div>
   </div>
  </section>

  <section id="plan-your-charter" className={styles.planner} aria-labelledby="home-quote-title">
   <div className={styles.plannerInner}>
    <header className={styles.plannerIntro}>
     <p className={styles.kicker}>On demand charter</p>
     <h2 id="home-quote-title">Plan your flight.</h2>
     <p>One way, round trip or multiple stops. Get a route map and an estimated flight total before you enter your contact details.</p>
     <Link href="/pricing/" className={styles.inlineLink}>How charter pricing works <CharterIcon name="arrow" /></Link>
    </header>
    <div className={styles.quotePanel}><QuoteForm compact /><BrokerNotice className={styles.quoteNotice} /></div>
   </div>
  </section>

  <section className={styles.optionSection} aria-labelledby="charter-options">
   <header className={styles.sectionIntro}><h2 id="charter-options">Choose how you fly.</h2></header>
   <div className={styles.optionCards}>{charterOptions.map(option => <Link key={option.href} href={option.href}>
    <CharterIcon className={styles.featureIcon} name={option.icon} /><h3>{option.name}</h3><p>{option.info}</p><CharterIcon className={styles.optionArrow} name="arrow" />
   </Link>)}</div>
  </section>

  <section className={styles.collectionSection} aria-labelledby="home-aircraft">
   <header className={styles.sectionIntro}><div><p className={styles.kicker}>Aircraft</p><h2 id="home-aircraft">Find the right cabin.</h2></div><Link className={styles.inlineLink} href="/aircraft/">View all aircraft <CharterIcon name="arrow" /></Link></header>
   <div className={styles.cabinRow} aria-label="Charter cabin categories">{charterCabinCategories.map(([category, seats]) => <div key={category}><span>{category}</span><strong>{seats} seats</strong></div>)}</div>
   <p className={styles.caption}>{charterCapacityNote}</p>
   <HomeAircraftEditorial />
  </section>

  <section className={styles.coverage} aria-labelledby="home-routes-title">
   <div className={styles.coverageInner}>
    <div><p className={styles.kicker}>Where to fly</p><h2 id="home-routes-title">Private charter across the U.S.</h2><p>Start with a popular route or build your own itinerary.</p>
     <ul>{routes.map(route => <li key={route.href}><Link href={route.href}><span>{route.name}<small>{route.detail}</small></span><CharterIcon name="arrow" /></Link></li>)}</ul>
     <Link className={styles.inlineLink} href="/routes/">Explore all routes <CharterIcon name="arrow" /></Link>
    </div>
    <figure><CharterCoverageGraphic className={styles.mapGraphic} /><figcaption>Illustrative routes · Map data: Natural Earth</figcaption></figure>
   </div>
  </section>

  <section className={styles.process} aria-labelledby="home-process">
   <header className={styles.sectionIntro}><div><p className={styles.kicker}>How it works</p><h2 id="home-process">From route to quote.</h2></div><Link className={styles.inlineLink} href="/how-it-works/">What to expect <CharterIcon name="arrow" /></Link></header>
   <ol>{steps.map(step => <li key={step.name}><CharterIcon className={styles.featureIcon} name={step.icon} /><h3>{step.name}</h3><p>{step.info}</p></li>)}</ol>
  </section>

  <section className={styles.closeout} aria-labelledby="home-next">
   <div><p className={styles.kicker}>EXJET charter desk</p><h2 id="home-next">Where are you headed?</h2></div>
   <div className={styles.heroButtons}><a className={styles.blueButton} href="#plan-your-charter">Plan a flight <CharterIcon name="arrow" /></a><Link className={styles.whiteButton} href="/contact/">Contact EXJET</Link></div>
  </section>
 </div>;
}
