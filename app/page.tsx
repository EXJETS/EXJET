import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, GlobeHemisphereWestIcon, PathIcon, ReceiptIcon } from "@phosphor-icons/react/dist/ssr";
import { ServiceExplorer } from "@/components/ServiceExplorer";
import { HomeAircraftEditorial } from "@/components/HomeAircraftEditorial";
import { QuoteForm } from "@/components/QuoteForm";
import { BrokerNotice } from "@/components/BrokerNotice";
import { StructuredData } from "@/components/StructuredData";
import { buildMetadata } from "@/data/seo";
import { localBusinessJsonLd } from "@/data/site";
import { charterPlanningRates, charterPlanningRateNote, formatCharterPlanningRate } from "@/data/charter-planning-rates";
import styles from "./landing.module.css";
export const metadata = buildMetadata("/");
const audiences = [
 ["Executive & corporate travel", "/corporate-travel/fortune-500", "Keep meetings and multi-city trips on your schedule."],
 ["Family offices & private clients", "/family-office-private-aviation", "Plan around your family, guests and preferred airports."],
 ["Sports, entertainment & groups", "/group-charter", "Coordinate passenger counts, equipment and tight travel windows."],
 ["Aircraft owners & operators", "/aircraft-owners", "Get support with buying, managing or maintaining an aircraft."],
];
const featuredRoutes = [
  ["Dallas", "New York", "/routes/dallas-to-new-york/", "M11 46 C35 15 90 24 131 14", 14],
  ["Dallas", "Miami", "/routes/dallas-to-miami/", "M11 46 C48 3 94 18 131 41", 41],
  ["Dallas", "Aspen", "/routes/dallas-to-aspen/", "M11 46 C50 45 83 1 131 19", 19],
] as const;

export default function Home() {
 return <div className={styles.landing}>
 <StructuredData data={localBusinessJsonLd()} />
 <section className={styles.hero} aria-labelledby="home-title">
  <div className={styles.heroCopy}>
   <p className={styles.eyebrow}><GlobeHemisphereWestIcon size={16} aria-hidden="true" /> EXJET / Global Access. On-Demand.</p>
   <h1 id="home-title">Private jet charter.</h1>
   <p>Plan your flight across the United States or internationally. Start with your itinerary.</p>
  </div>
  <section id="plan-your-charter" className={styles.quotePanel} aria-labelledby="home-quote-title">
   <h2 id="home-quote-title"><PathIcon size={21} aria-hidden="true" /> Request a charter quote</h2>
   <QuoteForm compact />
   <BrokerNotice className={styles.heroNotice} />
  </section>
  <figure className={styles.heroVisual}>
   <Image className={styles.heroPhoto} src="/images/manufacturers/global-8000-clouds.webp" alt="Bombardier Global 8000 banking above the clouds" fill sizes="(min-width: 1440px) 1440px, 100vw" preload />
   <figcaption>Bombardier Global 8000</figcaption>
  </figure>
 </section>
 <section className={styles.charterBoard} aria-labelledby="home-routes-title">
  <div className={styles.routePanel}>
   <header>
    <p className={styles.eyebrow}>01 / Explore routes</p>
    <h2 id="home-routes-title">Where to from Dallas?</h2>
   </header>
   <ul className={styles.routeList}>
    {featuredRoutes.map(([from, to, href, curve, endpoint]) => <li key={href}>
     <Link href={href}>
      <svg className={styles.routeGraphic} viewBox="0 0 142 62" fill="none" aria-hidden="true" focusable="false">
       <path d="M0 15H142M0 31H142M0 47H142M16 0V62M44 0V62M72 0V62M100 0V62M128 0V62" stroke="currentColor" opacity=".15" />
       <path d={curve} stroke="currentColor" strokeWidth="1.5" />
       <circle cx="11" cy="46" r="3.5" fill="currentColor" /><circle cx="131" cy={endpoint} r="3.5" fill="currentColor" />
      </svg>
      <span className={styles.routeName}>{from} <ArrowRightIcon size={15} aria-hidden="true" /><span className={styles.visuallyHidden}>to</span> {to}</span>
      <ArrowUpRightIcon size={17} aria-hidden="true" />
     </Link>
    </li>)}
   </ul>
   <nav className={styles.routeNav} aria-label="More charter options">
    <Link className={styles.textLink} href="/routes/">All routes <ArrowUpRightIcon size={15} aria-hidden="true" /></Link>
    <Link className={styles.textLink} href="/empty-legs/">Empty legs <ArrowUpRightIcon size={15} aria-hidden="true" /></Link>
    <Link className={styles.textLink} href="/private-jet-charter/">U.S. charter <ArrowUpRightIcon size={15} aria-hidden="true" /></Link>
   </nav>
  </div>
  <div className={styles.pricePanel}>
   <ReceiptIcon size={28} aria-hidden="true" />
   <div>
    <p className={styles.eyebrow}>02 / What you pay</p>
    <h2>See the full trip price.</h2>
    <p>Where applicable, your written proposal separates the net operator quote from our service fee and shows applicable taxes and the full trip total.</p>
   </div>
   <div className={styles.hourlyRates}>
    <h3>Hourly charter planning rates</h3>
    <dl>{charterPlanningRates.map(([category, rate]) => (
      <div key={category}><dt>{category}</dt><dd>{formatCharterPlanningRate(rate)} <span>/ hour</span></dd></div>
    ))}</dl>
    <p>{charterPlanningRateNote}</p>
   </div>
   <Link className={styles.textLink} href="/pricing/">How pricing works <ArrowUpRightIcon size={17} aria-hidden="true" /></Link>
  </div>
 </section>
 <section id="aviation-solutions" className={styles.services}><header className={styles.sectionHeading}><p className={styles.eyebrow}>03 / Aviation solutions</p><h2>More possibilities.<br />At every stage.</h2><Link className={styles.textLink} href="/services">All eleven services <ArrowUpRightIcon size={18} /></Link></header><ServiceExplorer /></section>
 <section className={styles.collection}><header className={styles.sectionHeading}><p className={styles.eyebrow}>04 / Aircraft</p><h2>Find your perspective.</h2><Link className={styles.textLink} href="/aircraft">Explore the collection <ArrowUpRightIcon size={18} /></Link></header><HomeAircraftEditorial /></section>
 <section className={styles.cabin} aria-labelledby="cabin-title"><Image src="/images/manufacturers/falcon-8x-lounge.jpg" alt="Dassault Falcon 8X lounge with white leather seating and a walnut conference table" width={2000} height={1100} sizes="100vw" /><div className={styles.cabinCopy}><p className={styles.eyebrow}>05 / Interior completion</p><h2 id="cabin-title">Considered.<br />Down to the last detail.</h2><p>Cabin planning, materials and completion support. Shape an aircraft around the way you live and work.</p><Link className={styles.pill} href="/interior-completions">Explore interiors <ArrowUpRightIcon size={18} /></Link></div></section>
 <section className={styles.audiences}><div><p className={styles.eyebrow}>06 / Your world</p><h2>Personal by nature.<br />Global by design.</h2><p>Different priorities. One dedicated point of contact.</p></div><div className={styles.audienceList}>{audiences.map(([title,href,copy],i)=><Link key={href} href={href}><span className={styles.number}>0{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRightIcon size={23} aria-hidden="true" /></Link>)}</div></section>
 <section className={styles.support}><div className={styles.supportPhoto}><Image src="/images/manufacturers/falcon-support.jpg" alt="Dassault manufacturer support team beside a Falcon aircraft" width={2000} height={1333} sizes="(max-width:760px) 100vw, 55vw" /></div><div><p className={styles.eyebrow}>07 / Beyond the flight</p><h2>The expertise<br />behind every mission.</h2><p>From crew sourcing and maintenance planning to engineering and STC coordination, keep your next requirement moving.</p><Link className={styles.pill} href="/mro">Service & repair <ArrowUpRightIcon size={18} /></Link><Link className={styles.textLink} href="/engineering-stc">Engineering & STC <ArrowUpRightIcon size={18} /></Link></div></section>
 <section className={styles.journal}><header className={styles.sectionHeading}><p className={styles.eyebrow}>The EXJET journal</p><h2>Before you go.</h2><Link className={styles.textLink} href="/travel-journal">Explore the journal <ArrowUpRightIcon size={18} /></Link></header><div className={styles.journalGrid}>{[["Aircraft knowledge","Know your aircraft.","Cabins, capabilities and the details that matter.","/aircraft-guides"],["Journey planning","A different way there.","Routes, airports and the possibilities between them.","/routes"],["Charter insight","The complete picture.","Understand the full quote before you fly.","/pricing"]].map(([k,t,c,h],i)=><Link href={h} key={h}><span>0{i+1} / {k}</span><h3>{t}</h3><p>{c}</p><ArrowUpRightIcon size={24} /></Link>)}</div></section>
 <section className={styles.contact}><p className={styles.eyebrow}>Your next chapter</p><h2>Where will it take you?</h2><div><Link className={styles.pill} href="/charter/">Request a quote <ArrowUpRightIcon size={18} /></Link><Link className={styles.pill} href="/contact">Speak with EXJET <ArrowUpRightIcon size={18} /></Link></div><BrokerNotice /></section>
 </div>;
}
